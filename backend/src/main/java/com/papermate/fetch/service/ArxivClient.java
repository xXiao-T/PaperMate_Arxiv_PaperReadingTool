package com.papermate.fetch.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * arXiv API 客户端 —— 调 arXiv 搜索接口，解析 Atom XML 返回论文元数据。
 *
 * <p>API 端点：{@code https://export.arxiv.org/api/query}</p>
 * <p>完全位于 fetch 模块内，不依赖其他业务模块。</p>
 */
@Service
public class ArxivClient {

    private static final Logger log = LoggerFactory.getLogger(ArxivClient.class);

    private static final String BASE_URL = "https://export.arxiv.org/api/query";
    private static final int DEFAULT_MAX_RESULTS = 10;
    private static final DateTimeFormatter PUB_DATE_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final RestClient restClient;

    public ArxivClient() {
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .build();
    }

    /**
     * 按关键词搜索 arXiv 论文。
     *
     * @param keywords  搜索关键词（对应 arXiv 的 {@code all:} 查询）
     * @param category  arXiv 分类过滤（如 cs.AI），可空
     * @param maxResults 最多返回条数（1-100）
     * @return 论文元数据列表，出错时返回空列表
     */
    public List<ArxivPaper> search(String keywords, String category, int maxResults) {
        String query = buildQuery(keywords, category);
        int count = Math.min(Math.max(maxResults, 1), 100);

        log.info("arXiv search: query=\"{}\", max_results={}", query, count);

        try {
            String uri = UriComponentsBuilder.fromPath("")
                    .queryParam("search_query", query)
                    .queryParam("start", 0)
                    .queryParam("max_results", count)
                    .queryParam("sortBy", "submittedDate")
                    .queryParam("sortOrder", "descending")
                    .build()
                    .toUriString();

            String xml = restClient.get()
                    .uri(uri)
                    .header("User-Agent", "PaperMate/1.0 (Academic Research Tool)")
                    .retrieve()
                    .body(String.class);

            return parseAtomXml(xml);
        } catch (Exception e) {
            log.error("arXiv API call failed for query=\"{}\": {}", query, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 按关键词搜索，使用默认返回条数 10。
     */
    public List<ArxivPaper> search(String keywords, String category) {
        return search(keywords, category, DEFAULT_MAX_RESULTS);
    }

    // ─── 查询构建 ────────────────────────────────────────────────

    private String buildQuery(String keywords, String category) {
        StringBuilder sb = new StringBuilder();
        sb.append("all:").append(keywords.trim());
        if (category != null && !category.isBlank()) {
            sb.append(" AND cat:").append(category.trim());
        }
        return sb.toString();
    }

    // ─── Atom XML 解析 ───────────────────────────────────────────

    private List<ArxivPaper> parseAtomXml(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new InputSource(new StringReader(xml)));

        NodeList entries = doc.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "entry");
        List<ArxivPaper> papers = new ArrayList<>();

        for (int i = 0; i < entries.getLength(); i++) {
            Element entry = (Element) entries.item(i);
            ArxivPaper paper = parseEntry(entry);
            if (paper != null) {
                papers.add(paper);
            }
        }

        log.info("arXiv parsed {} papers from {} entries", papers.size(), entries.getLength());
        return papers;
    }

    private ArxivPaper parseEntry(Element entry) {
        try {
            String rawId = textOf(entry, "id");
            String arxivId = extractArxivId(rawId);
            String title = textOf(entry, "title").replaceAll("\\s+", " ").trim();
            String summary = textOf(entry, "summary").replaceAll("\\s+", " ").trim();
            String published = textOf(entry, "published");
            LocalDate publishedAt = parseDate(published);

            // 作者：一个 entry 可以有多个 <author><name>
            List<String> authorNames = new ArrayList<>();
            NodeList authorNodes = entry.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "author");
            for (int j = 0; j < authorNodes.getLength(); j++) {
                Element authorElem = (Element) authorNodes.item(j);
                String name = textOf(authorElem, "name");
                if (name != null && !name.isBlank()) {
                    authorNames.add(name.trim());
                }
            }
            String authors = String.join(", ", authorNames);

            // arXiv URL：rel="alternate" 的 <link>
            String arxivUrl = null;
            NodeList links = entry.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "link");
            for (int j = 0; j < links.getLength(); j++) {
                Element link = (Element) links.item(j);
                if ("alternate".equals(link.getAttribute("rel"))) {
                    arxivUrl = link.getAttribute("href");
                    break;
                }
            }

            // 主分类：优先用 <arxiv:primary_category>，其次用第一个 <category>
            String category = null;
            NodeList primaryCat = entry.getElementsByTagNameNS(
                    "http://arxiv.org/schemas/atom", "primary_category");
            if (primaryCat.getLength() > 0) {
                category = ((Element) primaryCat.item(0)).getAttribute("term");
            }
            if (category == null) {
                NodeList cats = entry.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "category");
                if (cats.getLength() > 0) {
                    category = ((Element) cats.item(0)).getAttribute("term");
                }
            }

            return new ArxivPaper(arxivId, title, authors, summary, arxivUrl, category, publishedAt);
        } catch (Exception e) {
            log.warn("Failed to parse arXiv entry: {}", e.getMessage());
            return null;
        }
    }

    /** 从 entry 的 {@code <id>} 中提取纯 arXiv ID（去掉 URL 前缀和版本号）。 */
    private String extractArxivId(String rawId) {
        if (rawId == null) return null;
        // rawId 格式: "http://arxiv.org/abs/1706.03762v7" → "1706.03762"
        String id = rawId.strip();
        if (id.contains("/abs/")) {
            id = id.substring(id.lastIndexOf("/abs/") + 5);
        }
        // 去掉版本号后缀 v1, v2, ...
        if (id.matches(".+v\\d+$")) {
            id = id.replaceFirst("v\\d+$", "");
        }
        return id;
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr.trim(), PUB_DATE_FMT);
        } catch (Exception e) {
            log.debug("Failed to parse date: {}", dateStr);
            return null;
        }
    }

    private String textOf(Element parent, String tagName) {
        NodeList children = parent.getElementsByTagNameNS("http://www.w3.org/2005/Atom", tagName);
        if (children.getLength() == 0) return null;
        return children.item(0).getTextContent();
    }

    // ─── 结果类型 ────────────────────────────────────────────────

    /**
     * arXiv 论文元数据，ArxivClient 的返回类型。
     * fetch 模块内部使用，不对外暴露。
     */
    public static class ArxivPaper {
        private final String arxivId;
        private final String title;
        private final String authors;
        private final String summary;
        private final String arxivUrl;
        private final String category;
        private final LocalDate publishedAt;

        public ArxivPaper(String arxivId, String title, String authors, String summary,
                          String arxivUrl, String category, LocalDate publishedAt) {
            this.arxivId = arxivId;
            this.title = title;
            this.authors = authors;
            this.summary = summary;
            this.arxivUrl = arxivUrl;
            this.category = category;
            this.publishedAt = publishedAt;
        }

        public String getArxivId() { return arxivId; }
        public String getTitle() { return title; }
        public String getAuthors() { return authors; }
        public String getSummary() { return summary; }
        public String getArxivUrl() { return arxivUrl; }
        public String getCategory() { return category; }
        public LocalDate getPublishedAt() { return publishedAt; }
    }
}
