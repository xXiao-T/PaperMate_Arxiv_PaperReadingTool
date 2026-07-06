package com.example.papermate.service;

import com.example.papermate.dto.QuestionAnswerDTO;
import com.example.papermate.entity.Paper;
import com.example.papermate.entity.QuestionAnswer;
import com.example.papermate.repository.PaperRepository;
import com.example.papermate.repository.QuestionAnswerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class QAService {
    
    private final PaperRepository paperRepository;
    private final QuestionAnswerRepository qaRepository;
    
    public QAService(PaperRepository paperRepository, QuestionAnswerRepository qaRepository) {
        this.paperRepository = paperRepository;
        this.qaRepository = qaRepository;
    }
    
    private final String[][] ANSWER_TEMPLATES = {
        {"What is {}?", "{} is a {} that {}. In the context of this paper, it is used to {}.", "definition"},
        {"How does {} work?", "The {} works by {}. This involves {} and {}, which together enable {}.", "mechanism"},
        {"What are the key contributions?", "The key contributions of this paper are: 1) {}, 2) {}, and 3) {}. These contributions advance {} by {}.", "contribution"},
        {"What is the experimental setup?", "The experiments are conducted on {} dataset. The baseline methods include {} and {}. Evaluation metrics are {} and {}.", "experiment"},
        {"What are the limitations?", "The main limitations include {} and {}. Future work could address these by {} and {}.", "limitation"},
        {"How does {} compare to existing methods?", "Compared to {}, the proposed {} achieves {} improvement in {}. The key advantages are {} and {}.", "comparison"},
        {"What is the conclusion?", "The paper concludes that {} is effective for {}. The results show {} performance, suggesting {} for future research.", "conclusion"}
    };
    
    @Transactional
    public QuestionAnswerDTO askQuestion(Long paperId, String question) {
        System.out.println("Answering question for paper " + paperId + ": " + question);
        
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        String answer = generateAnswer(paper, question);
        
        QuestionAnswer qa = new QuestionAnswer();
        qa.setQuestion(question);
        qa.setAnswer(answer);
        qa.setPaper(paper);
        qa = qaRepository.save(qa);
        
        return convertToDTO(qa);
    }
    
    private String generateAnswer(Paper paper, String question) {
        Random random = new Random(question.hashCode());
        String[] template = ANSWER_TEMPLATES[random.nextInt(ANSWER_TEMPLATES.length)];
        
        String[] concepts = paper.getConcepts() != null ? 
                paper.getConcepts().split(", ") : new String[]{"this method"};
        
        String concept = concepts.length > 0 ? concepts[0] : "the proposed approach";
        String concept2 = concepts.length > 1 ? concepts[1] : "related techniques";
        
        if (question.toLowerCase().contains("what") && question.toLowerCase().contains("is")) {
            template = ANSWER_TEMPLATES[0];
        } else if (question.toLowerCase().contains("how")) {
            template = ANSWER_TEMPLATES[1];
        } else if (question.toLowerCase().contains("contribution") || question.toLowerCase().contains("contribute")) {
            template = ANSWER_TEMPLATES[2];
        } else if (question.toLowerCase().contains("experiment") || question.toLowerCase().contains("result")) {
            template = ANSWER_TEMPLATES[3];
        } else if (question.toLowerCase().contains("limit") || question.toLowerCase().contains("drawback")) {
            template = ANSWER_TEMPLATES[4];
        } else if (question.toLowerCase().contains("compare") || question.toLowerCase().contains("better")) {
            template = ANSWER_TEMPLATES[5];
        } else if (question.toLowerCase().contains("conclude") || question.toLowerCase().contains("summary")) {
            template = ANSWER_TEMPLATES[6];
        }
        
        return String.format(template[1], concept, concept, concept2, concept, concept2);
    }
    
    public List<QuestionAnswerDTO> getQAsByPaperId(Long paperId) {
        return qaRepository.findByPaperId(paperId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private QuestionAnswerDTO convertToDTO(QuestionAnswer qa) {
        QuestionAnswerDTO dto = new QuestionAnswerDTO();
        dto.setId(qa.getId());
        dto.setQuestion(qa.getQuestion());
        dto.setAnswer(qa.getAnswer());
        dto.setPaperId(qa.getPaper().getId());
        dto.setCreatedAt(qa.getCreatedAt());
        return dto;
    }
}