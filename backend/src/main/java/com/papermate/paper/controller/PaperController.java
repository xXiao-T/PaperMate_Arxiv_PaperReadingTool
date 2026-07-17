package com.papermate.paper.controller;

import com.papermate.common.Result;
import com.papermate.common.utils.SecurityUtil;
import com.papermate.paper.dto.PaperDTO;
import com.papermate.paper.dto.PaperDetailVO;
import com.papermate.paper.dto.PaperImportRequest;
import com.papermate.paper.dto.PaperPageVO;
import com.papermate.paper.exception.PaperNotFoundException;
import com.papermate.paper.service.PaperService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.Proxy;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/papers")
public class PaperController {
    private static final Logger log = LoggerFactory.getLogger(PaperController.class);
    private static final long MAX_PDF_SIZE = 50L * 1024 * 1024;
    private static final Set<String> ALLOWED_PROXY_HOSTS = Set.of(
        "arxiv.org",
        "www.arxiv.org",
        "export.arxiv.org"
    );

    private final PaperService paperService;
    private final SecurityUtil securityUtil;

    @Value("${papermate.upload.path:uploads/pdfs}")
    private String uploadPath;

    public PaperController(PaperService paperService, SecurityUtil securityUtil) {
        this.paperService = paperService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    public Result<PaperPageVO> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return Result.success(paperService.search(keyword, tag, page, pageSize));
    }

    @GetMapping("/{id}")
    public Result<PaperDetailVO> getById(@PathVariable Long id) {
        return Result.success(paperService.getById(id));
    }

    @PostMapping
    public Result<PaperDTO> importPaper(@Valid @RequestBody PaperImportRequest request) {
        return Result.success(paperService.importPaper(request));
    }

    @PostMapping("/{paperId}/upload-pdf")
    public Result<String> uploadPdf(
            @PathVariable Long paperId,
            @RequestParam("file") MultipartFile file) {
        requireAuthenticatedUser();
        validatePdf(file);

        try {
            Path uploadDirectory = Paths.get(uploadPath).toAbsolutePath().normalize();
            Files.createDirectories(uploadDirectory);
            String filename = UUID.randomUUID() + ".pdf";
            Path destination = uploadDirectory.resolve(filename).normalize();
            if (!destination.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException("Invalid upload destination");
            }
            file.transferTo(destination);
            String relativePath = "pdfs/" + filename;
            paperService.updatePdfPath(paperId, relativePath);
            return Result.success(relativePath);
        } catch (IOException exception) {
            log.error("Failed to upload PDF for paper {}", paperId, exception);
            return Result.internalError("PDF upload failed");
        }
    }

    @GetMapping("/{paperId}/pdf")
    public ResponseEntity<?> getPdf(@PathVariable Long paperId) {
        PaperDetailVO paper = paperService.getById(paperId);
        if (paper.getPdfPath() == null || paper.getPdfPath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path uploadDirectory = Paths.get(uploadPath).toAbsolutePath().normalize();
            Path filePath = uploadDirectory
                .resolve(Paths.get(paper.getPdfPath()).getFileName())
                .normalize();
            if (!filePath.startsWith(uploadDirectory) || !Files.isRegularFile(filePath)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    ContentDisposition.inline()
                        .filename("paper-" + paperId + ".pdf")
                        .build()
                        .toString()
                )
                .body(Files.readAllBytes(filePath));
        } catch (IOException exception) {
            log.error("Failed to read PDF for paper {}", paperId, exception);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/proxy")
    public ResponseEntity<?> proxyPdf(@RequestParam("url") String url) {
        HttpURLConnection connection = null;
        try {
            URI uri = URI.create(url);
            validateProxyUri(uri);
            connection = (HttpURLConnection) uri.toURL().openConnection(Proxy.NO_PROXY);
            connection.setRequestProperty(
                "User-Agent",
                "PaperMate/1.0 (+https://arxiv.org)"
            );
            connection.setRequestProperty("Accept", "application/pdf");
            connection.setConnectTimeout(15_000);
            connection.setReadTimeout(30_000);
            connection.setInstanceFollowRedirects(true);

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                return ResponseEntity.status(responseCode).build();
            }
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    ContentDisposition.inline().filename("paper.pdf").build().toString()
                )
                .body(connection.getInputStream().readAllBytes());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        } catch (IOException exception) {
            log.error("Failed to proxy arXiv PDF", exception);
            return ResponseEntity.internalServerError().build();
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    @ExceptionHandler(PaperNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handlePaperNotFound(PaperNotFoundException exception) {
        return Result.notFound(exception.getMessage());
    }

    private void requireAuthenticatedUser() {
        if (securityUtil.getCurrentUser().isEmpty()) {
            throw new AuthenticationCredentialsNotFoundException(
                "User is not authenticated"
            );
        }
    }

    private static void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A PDF file is required");
        }
        String originalName = file.getOriginalFilename();
        String contentType = file.getContentType();
        boolean pdfName = originalName != null
            && originalName.toLowerCase(Locale.ROOT).endsWith(".pdf");
        boolean pdfContentType = MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(contentType);
        if (!pdfName && !pdfContentType) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }
        if (file.getSize() > MAX_PDF_SIZE) {
            throw new IllegalArgumentException("PDF size must not exceed 50 MB");
        }
    }

    private static void validateProxyUri(URI uri) {
        String scheme = uri.getScheme();
        String host = uri.getHost();
        if (scheme == null
                || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))
                || host == null
                || !ALLOWED_PROXY_HOSTS.contains(host.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Only arXiv PDF URLs are allowed");
        }
    }
}
