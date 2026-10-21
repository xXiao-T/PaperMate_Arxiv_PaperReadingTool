package com.papermate.ai.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.Map;

/**
 * AI 代理控制器 —— 前端不直接持有 API Key，通过此后端端点中转。
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public AIController(
            @Value("${papermate.ai.api-key}") String apiKey,
            @Value("${papermate.ai.base-url}") String baseUrl,
            @Value("${papermate.ai.model}") String model) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    /** SSE 流式代理 */
    @PostMapping(value = "/proxy", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter proxyStream(@RequestBody Map<String, Object> body) {
        SseEmitter emitter = new SseEmitter(0L);
        new Thread(() -> {
            try {
                ObjectNode req = mapper.createObjectNode();
                req.put("model", model);
                req.put("temperature", 0.5);
                req.put("max_tokens", 4096);
                req.put("stream", true);
                ArrayNode msgs = req.putArray("messages");
                @SuppressWarnings("unchecked")
                var list = (java.util.List<Map<String, String>>) body.get("messages");
                if (list != null) for (var m : list) {
                    ObjectNode msg = msgs.addObject();
                    msg.put("role", m.get("role"));
                    msg.put("content", m.get("content"));
                }

                HttpURLConnection conn = (HttpURLConnection) URI.create(baseUrl + "/chat/completions").toURL().openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "Bearer " + apiKey);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(mapper.writeValueAsBytes(req));
                }

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6);
                            if ("[DONE]".equals(data)) {
                                emitter.complete();
                                return;
                            }
                            JsonNode chunk = mapper.readTree(data);
                            JsonNode delta = chunk.path("choices").get(0).path("delta");
                            String content = delta.has("content") ? delta.path("content").asText() : "";
                            if (content.isEmpty()) content = delta.path("reasoning_content").asText("");
                            if (!content.isEmpty()) emitter.send(SseEmitter.event().data(content));
                        }
                    }
                }
                emitter.complete();
            } catch (Exception e) {
                log.error("AI proxy error: {}", e.getMessage());
                emitter.completeWithError(e);
            }
        }).start();
        return emitter;
    }
}
