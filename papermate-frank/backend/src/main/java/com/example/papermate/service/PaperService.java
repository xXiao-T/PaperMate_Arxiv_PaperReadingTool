package com.example.papermate.service;

import com.example.papermate.dto.PaperDTO;
import com.example.papermate.entity.Paper;
import com.example.papermate.repository.PaperRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class PaperService {
    
    private final PaperRepository paperRepository;
    private final PaperAnalysisService paperAnalysisService;
    
    public PaperService(PaperRepository paperRepository, PaperAnalysisService paperAnalysisService) {
        this.paperRepository = paperRepository;
        this.paperAnalysisService = paperAnalysisService;
    }
    
    private final String[] TITLES = {
        "Attention Is All You Need",
        "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        "Generative Adversarial Networks",
        "Deep Residual Learning for Image Recognition",
        "GPT-3: Language Models are Few-Shot Learners",
        "AlphaGo: Mastering the Game of Go with Deep Neural Networks and Tree Search",
        "Neural Machine Translation by Jointly Learning to Align and Translate",
        "ImageNet Classification with Deep Convolutional Neural Networks",
        "Mask R-CNN",
        "T5: Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer"
    };
    
    private final String[] AUTHORS = {
        "Vaswani, Ashish; Shazeer, Noam; Parmar, Niki; Uszkoreit, Jakob",
        "Devlin, Jacob; Chang, Ming-Wei; Lee, Kenton; Toutanova, Kristina",
        "Goodfellow, Ian; Pouget-Abadie, Jean; Mirza, Mehdi; Xu, Bing",
        "He, Kaiming; Zhang, Xiangyu; Ren, Shaoqing; Sun, Jian",
        "Brown, Tom; Mann, Benjamin; Ryder, Nick; Subbiah, Melanie",
        "Silver, David; Huang, Aja; Maddison, Chris J.; Guez, Arthur",
        "Bahdanau, Dzmitry; Cho, Kyunghyun; Bengio, Yoshua",
        "Krizhevsky, Alex; Sutskever, Ilya; Hinton, Geoffrey E.",
        "He, Kaiming; Gkioxari, Georgia; Dollár, Piotr; Girshick, Ross",
        "Raffel, Colin; Shazeer, Noam; Roberts, Adam; Lee, Katherine"
    };
    
    private final String[] CATEGORIES = {"cs.CL", "cs.LG", "cs.CV", "stat.ML"};
    
    private final String[] ABSTRACTS = {
        "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
        "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations by jointly conditioning on both left and right context in all layers.",
        "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G.",
        "Deep residual networks are proposed to address the degradation problem when networks go deeper. By adding residual connections, we enable training of much deeper networks, leading to significant improvements on ImageNet classification.",
        "We demonstrate that language models begin to learn these tasks without any explicit supervision when trained on a new dataset of millions of webpages called WebText. When conditioned on a few examples, our models are able to perform a wide range of tasks, including translation, question answering, and summarization."
    };
    
    @Transactional
    public PaperDTO fetchAndSavePaper(String arxivId) {
        System.out.println("Fetching paper with arxivId: " + arxivId);
        
        if (paperRepository.existsByArxivId(arxivId)) {
            System.out.println("Paper already exists: " + arxivId);
            return findByArxivId(arxivId).orElse(null);
        }
        
        Paper paper = simulateArxivFetch(arxivId);
        paper = paperRepository.save(paper);
        
        paperAnalysisService.analyzePaper(paper.getId());
        
        System.out.println("Paper fetched and saved: " + arxivId);
        return convertToDTO(paper);
    }
    
    private Paper simulateArxivFetch(String arxivId) {
        Random random = new Random(arxivId.hashCode());
        Paper paper = new Paper();
        paper.setArxivId(arxivId);
        paper.setTitle(TITLES[random.nextInt(TITLES.length)]);
        paper.setAuthors(AUTHORS[random.nextInt(AUTHORS.length)]);
        paper.setCategory(CATEGORIES[random.nextInt(CATEGORIES.length)]);
        paper.setAbstractText(ABSTRACTS[random.nextInt(ABSTRACTS.length)]);
        paper.setPublishedDate(LocalDate.now().minusDays(random.nextInt(365)));
        paper.setUpdatedDate(LocalDate.now().minusDays(random.nextInt(30)));
        paper.setPdfUrl("https://arxiv.org/pdf/" + arxivId + ".pdf");
        paper.setHtmlUrl("https://arxiv.org/abs/" + arxivId);
        paper.setIsProcessed(false);
        
        return paper;
    }
    
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void scheduledFetchPapers() {
        System.out.println("Starting scheduled paper fetch...");
        for (int i = 1; i <= 5; i++) {
            String arxivId = "2301.00" + String.format("%03d", i);
            fetchAndSavePaper(arxivId);
        }
        System.out.println("Scheduled paper fetch completed");
    }
    
    public List<PaperDTO> findAll() {
        return paperRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<PaperDTO> findById(Long id) {
        return paperRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    public Optional<PaperDTO> findByArxivId(String arxivId) {
        return paperRepository.findByArxivId(arxivId)
                .map(this::convertToDTO);
    }
    
    public List<PaperDTO> findByCategory(String category) {
        return paperRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> getRecentPapers() {
        return paperRepository.findTop10ByOrderByPublishedDateDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<String> getAllCategories() {
        return paperRepository.findAllCategories();
    }
    
    @Transactional
    public PaperDTO update(Long id, PaperDTO dto) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        if (dto.getTitle() != null) paper.setTitle(dto.getTitle());
        if (dto.getAbstractText() != null) paper.setAbstractText(dto.getAbstractText());
        if (dto.getCategory() != null) paper.setCategory(dto.getCategory());
        
        paper = paperRepository.save(paper);
        return convertToDTO(paper);
    }
    
    @Transactional
    public void delete(Long id) {
        paperRepository.deleteById(id);
    }
    
    public PaperDTO convertToDTO(Paper paper) {
        PaperDTO dto = new PaperDTO();
        dto.setId(paper.getId());
        dto.setArxivId(paper.getArxivId());
        dto.setTitle(paper.getTitle());
        dto.setAbstractText(paper.getAbstractText());
        dto.setAuthors(paper.getAuthors());
        dto.setCategory(paper.getCategory());
        dto.setPublishedDate(paper.getPublishedDate());
        dto.setUpdatedDate(paper.getUpdatedDate());
        dto.setPdfUrl(paper.getPdfUrl());
        dto.setHtmlUrl(paper.getHtmlUrl());
        dto.setSummary(paper.getSummary());
        dto.setConcepts(paper.getConcepts());
        dto.setMethods(paper.getMethods());
        dto.setConclusions(paper.getConclusions());
        dto.setCitationCount(paper.getCitationCount());
        dto.setIsProcessed(paper.getIsProcessed());
        dto.setConceptList(new ArrayList<>());
        dto.setQaList(new ArrayList<>());
        dto.setNotes(new ArrayList<>());
        return dto;
    }
}