package com.papermate.search.service;

import com.papermate.common.utils.ArxivRateLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ArxivSearchService {

    private static final Logger log = LoggerFactory.getLogger(ArxivSearchService.class);
    private static final String BASE_URL = "https://export.arxiv.org/api/query";
    private static final DateTimeFormatter PUB_DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final RestClient restClient;

    public ArxivSearchService() {
        this.restClient = RestClient.builder().baseUrl(BASE_URL).build();
    }

    public record ArxivResult(
            String arxivId, String title, String authors, String summary,
            String arxivUrl, String category, LocalDate publishedAt) {}

    public String buildDebugUrl(String keyword, String searchType, int maxResults) {
        return buildDebugUrl(keyword, searchType, maxResults, "relevance", "descending");
    }

    public String buildDebugUrl(String keyword, String searchType, int maxResults, String sortBy, String sortOrder) {
        String kw = keyword.trim();
        String prefix = switch (searchType) { case "ti" -> "ti"; case "au" -> "au"; case "abs" -> "abs"; default -> "all"; };
        String query = prefix + ":" + buildTerm(kw);
        int count = Math.min(Math.max(maxResults, 1), 100);
        String uri = UriComponentsBuilder.fromPath("")
                .queryParam("search_query", query)
                .queryParam("start", 0)
                .queryParam("max_results", count)
                .queryParam("sortBy", "relevance")
                .queryParam("sortOrder", "descending")
                .build().toUriString();
        return BASE_URL + uri;
    }

    public List<ArxivResult> search(String keyword, String searchType, int maxResults) {
        return search(keyword, searchType, maxResults, "relevance", "descending", null);
    }

    public List<ArxivResult> search(String keyword, String searchType, int maxResults, String sortBy, String sortOrder) {
        return search(keyword, searchType, maxResults, sortBy, sortOrder, null);
    }

    public List<ArxivResult> search(String keyword, String searchType, int maxResults, String sortBy, String sortOrder, String category) {
        String kw = keyword.trim();
        String prefix = switch (searchType) {
            case "ti" -> "ti";
            case "au" -> "au";
            case "abs" -> "abs";
            default -> "all";
        };
        String query = prefix + ":" + buildTerm(kw);
        if (category != null && !category.isBlank()) {
            query += " AND cat:" + category.trim();
        }
        int count = Math.min(Math.max(maxResults, 1), 100);
        log.info("arXiv search: query=\"{}\"  max_results={}  sortBy={}", query, count, sortBy);
        if (!ArxivRateLimiter.tryAcquire()) {
            log.warn("arXiv rate limit skipped: query=\"{}\"", query);
            return Collections.emptyList();
        }
        try {
            String uri = UriComponentsBuilder.fromPath("")
                    .queryParam("search_query", query)
                    .queryParam("start", 0)
                    .queryParam("max_results", count)
                    .queryParam("sortBy", sortBy)
                    .queryParam("sortOrder", sortOrder)
                    .build().toUriString();
            log.info("arXiv request: {}{}", BASE_URL, uri);
            String xml = restClient.get()
                    .uri(uri)
                    .header("User-Agent", "PaperMate/1.0 (Academic Research Tool)")
                    .retrieve().body(String.class);
            return parseResults(xml);
        } catch (Exception e) {
            log.error("arXiv search failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private static String buildTerm(String kw) {
        if (kw.contains(" ") || kw.contains("\"")) {
            return "\"" + kw.replace("\"", "") + "\"";
        }
        return kw;
    }

    private List<ArxivResult> parseResults(String xml) throws Exception {
        DocumentBuilderFactory f = DocumentBuilderFactory.newInstance();
        f.setNamespaceAware(true);
        DocumentBuilder b = f.newDocumentBuilder();
        Document doc = b.parse(new org.xml.sax.InputSource(new StringReader(xml)));
        NodeList entries = doc.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "entry");
        List<ArxivResult> results = new ArrayList<>();
        for (int i = 0; i < entries.getLength(); i++) {
            try {
                Element e = (Element) entries.item(i);
                String rawId = textOf(e, "id");
                String arxivId = rawId != null ? rawId.replaceFirst(".*/abs/", "").replaceFirst("v\\d+$", "") : null;
                String title = textOf(e, "title").replaceAll("\\s+", " ").trim();
                String summary = textOf(e, "summary").replaceAll("\\s+", " ").trim();
                List<String> names = new ArrayList<>();
                NodeList authors = e.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "author");
                for (int j = 0; j < authors.getLength(); j++) {
                    String name = textOf((Element) authors.item(j), "name");
                    if (name != null && !name.isBlank()) names.add(name.trim());
                }
                String authorStr = String.join(", ", names);
                String arxivUrl = null;
                NodeList links = e.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "link");
                for (int j = 0; j < links.getLength(); j++) {
                    Element link = (Element) links.item(j);
                    if ("alternate".equals(link.getAttribute("rel"))) {
                        arxivUrl = link.getAttribute("href"); break;
                    }
                }
                String cat = null;
                NodeList pc = e.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "primary_category");
                if (pc.getLength() > 0) cat = ((Element) pc.item(0)).getAttribute("term");
                if (cat == null) {
                    NodeList cats = e.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "category");
                    if (cats.getLength() > 0) cat = ((Element) cats.item(0)).getAttribute("term");
                }
                LocalDate pub = null;
                String pubStr = textOf(e, "published");
                if (pubStr != null) {
                    try { pub = LocalDate.parse(pubStr.trim(), PUB_DATE_FMT); } catch (Exception ignored) {}
                }
                results.add(new ArxivResult(arxivId, title, authorStr, summary, arxivUrl, cat, pub));
            } catch (Exception ignored) {}
        }
        log.info("arXiv parsed {} results", results.size());
        return results;
    }

    private String textOf(Element parent, String tagName) {
        NodeList children = parent.getElementsByTagNameNS("http://www.w3.org/2005/Atom", tagName);
        return children.getLength() > 0 ? children.item(0).getTextContent() : null;
    }
}