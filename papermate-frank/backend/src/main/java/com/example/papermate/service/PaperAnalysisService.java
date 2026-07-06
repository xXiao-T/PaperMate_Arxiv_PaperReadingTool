package com.example.papermate.service;

import com.example.papermate.dto.ConceptDTO;
import com.example.papermate.entity.Concept;
import com.example.papermate.entity.Paper;
import com.example.papermate.repository.ConceptRepository;
import com.example.papermate.repository.PaperRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class PaperAnalysisService {
    
    private final PaperRepository paperRepository;
    private final ConceptRepository conceptRepository;
    
    public PaperAnalysisService(PaperRepository paperRepository, ConceptRepository conceptRepository) {
        this.paperRepository = paperRepository;
        this.conceptRepository = conceptRepository;
    }
    
    private final String[][] CONCEPT_DATA = {
        {"Transformer", "A type of neural network architecture that uses self-attention mechanisms to process sequential data.", "Attention, Encoder, Decoder"},
        {"Attention Mechanism", "A mechanism that allows models to focus on different parts of the input sequence when generating each part of the output.", "Transformer, Self-Attention"},
        {"BERT", "Bidirectional Encoder Representations from Transformers, a pre-trained language model.", "Transformer, NLP, Pre-training"},
        {"GAN", "Generative Adversarial Network, a framework for training generative models.", "Generative Model, Discriminator"},
        {"Residual Network", "A deep learning architecture that uses residual connections to alleviate the vanishing gradient problem.", "CNN, Deep Learning"},
        {"GPT", "Generative Pre-trained Transformer, a large language model developed by OpenAI.", "Transformer, LLMs"},
        {"Convolutional Neural Network", "A type of neural network designed for processing grid-like data such as images.", "Deep Learning, Image Recognition"},
        {"Natural Language Processing", "A subfield of AI that focuses on interactions between computers and human language.", "AI, Machine Learning"},
        {"Transfer Learning", "A machine learning technique where a model trained on one task is reused for another related task.", "Machine Learning, Fine-tuning"},
        {"Pre-training", "The process of training a model on a large dataset before fine-tuning it on a specific task.", "NLP, Deep Learning"}
    };
    
    private final String[] SUMMARY_TEMPLATES = {
        "This paper introduces a novel approach to {} using {}. The proposed method achieves state-of-the-art results on {} benchmarks.",
        "In this work, the authors present {} that addresses the {} problem. Experimental results demonstrate significant improvements over existing methods.",
        "The paper proposes {} for {}. Through extensive experiments, the method shows superior performance in terms of {}.",
        "This research introduces {} to tackle {}. The approach leverages {} to achieve {} results."
    };
    
    private final String[] METHODS_TEMPLATES = {
        "The proposed method utilizes {} combined with {} to process input data. Key components include {} and {}.",
        "The approach consists of {} stages: {}, {}, and {}. Each stage is designed to address specific challenges in {}.",
        "The authors employ {} as the backbone architecture, enhanced with {} and {} for improved performance.",
        "The method integrates {} with {} to create a unified framework that effectively handles {}."
    };
    
    private final String[] CONCLUSIONS_TEMPLATES = {
        "The experimental results confirm that {} is effective for {}. Future work will focus on {} and {}.",
        "This study demonstrates the potential of {} in solving {}. The findings suggest {} for further research.",
        "The proposed {} achieves {} performance, making it suitable for {}. Directions for future improvement include {}.",
        "In conclusion, {} provides a promising solution to {}. The approach opens up new possibilities for {}."
    };
    
    @Transactional
    public void analyzePaper(Long paperId) {
        System.out.println("Analyzing paper with id: " + paperId);
        
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        if (paper.getIsProcessed()) {
            System.out.println("Paper already processed: " + paperId);
            return;
        }
        
        String[] concepts = extractConcepts(paper.getTitle(), paper.getAbstractText());
        
        paper.setSummary(generateSummary(paper.getTitle(), concepts));
        paper.setConcepts(String.join(", ", concepts));
        paper.setMethods(generateMethods(concepts));
        paper.setConclusions(generateConclusions(paper.getTitle(), concepts));
        paper.setIsProcessed(true);
        
        paperRepository.save(paper);
        
        saveConcepts(paper, concepts);
        
        System.out.println("Paper analysis completed: " + paperId);
    }
    
    private String[] extractConcepts(String title, String abstractText) {
        Random random = new Random(title.hashCode());
        int count = 3 + random.nextInt(3);
        String[] selected = new String[count];
        
        for (int i = 0; i < count; i++) {
            selected[i] = CONCEPT_DATA[random.nextInt(CONCEPT_DATA.length)][0];
        }
        
        return selected;
    }
    
    private String generateSummary(String title, String[] concepts) {
        Random random = new Random(title.hashCode());
        String template = SUMMARY_TEMPLATES[random.nextInt(SUMMARY_TEMPLATES.length)];
        
        if (concepts.length >= 2) {
            return String.format(template, concepts[0], concepts[1], concepts[0]);
        }
        return String.format(template, title, concepts[0], concepts[0]);
    }
    
    private String generateMethods(String[] concepts) {
        Random random = new Random(Arrays.hashCode(concepts));
        String template = METHODS_TEMPLATES[random.nextInt(METHODS_TEMPLATES.length)];
        
        if (concepts.length >= 3) {
            return String.format(template, concepts[0], concepts[1], concepts[2], concepts[0]);
        } else if (concepts.length >= 2) {
            return String.format(template, concepts[0], concepts[1], concepts[0], concepts[1]);
        }
        return String.format(template, concepts[0], concepts[0], concepts[0], concepts[0]);
    }
    
    private String generateConclusions(String title, String[] concepts) {
        Random random = new Random(title.hashCode());
        String template = CONCLUSIONS_TEMPLATES[random.nextInt(CONCLUSIONS_TEMPLATES.length)];
        
        if (concepts.length >= 2) {
            return String.format(template, concepts[0], concepts[1], concepts[0]);
        }
        return String.format(template, concepts[0], title, concepts[0]);
    }
    
    private void saveConcepts(Paper paper, String[] conceptNames) {
        for (String name : conceptNames) {
            String[] data = findConceptData(name);
            if (data != null) {
                Concept concept = new Concept();
                concept.setName(data[0]);
                concept.setDefinition(data[1]);
                concept.setRelatedConcepts(data[2]);
                concept.setPaper(paper);
                concept.setImportanceScore(Math.random());
                conceptRepository.save(concept);
            }
        }
    }
    
    private String[] findConceptData(String name) {
        for (String[] data : CONCEPT_DATA) {
            if (data[0].equalsIgnoreCase(name)) {
                return data;
            }
        }
        return new String[]{name, "A concept related to this paper.", ""};
    }
    
    public List<ConceptDTO> getConceptsByPaperId(Long paperId) {
        return conceptRepository.findByPaperIdOrderByImportanceScoreDesc(paperId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ConceptDTO> searchConcepts(String keyword) {
        return conceptRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private ConceptDTO convertToDTO(Concept concept) {
        ConceptDTO dto = new ConceptDTO();
        dto.setId(concept.getId());
        dto.setName(concept.getName());
        dto.setDefinition(concept.getDefinition());
        dto.setRelatedConcepts(concept.getRelatedConcepts());
        dto.setPaperId(concept.getPaper().getId());
        dto.setImportanceScore(concept.getImportanceScore());
        return dto;
    }
}