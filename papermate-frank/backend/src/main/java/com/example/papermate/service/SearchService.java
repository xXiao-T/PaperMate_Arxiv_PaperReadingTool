package com.example.papermate.service;

import com.example.papermate.dto.PaperDTO;
import com.example.papermate.dto.SearchRequestDTO;
import com.example.papermate.entity.Paper;
import com.example.papermate.repository.PaperRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {
    
    private final PaperRepository paperRepository;
    private final PaperService paperService;
    
    public SearchService(PaperRepository paperRepository, PaperService paperService) {
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }
    
    public List<PaperDTO> search(SearchRequestDTO request) {
        System.out.println("Searching papers with request: " + request);
        
        List<Paper> results;
        
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            if (request.getCategory() != null && !request.getCategory().isEmpty()) {
                results = paperRepository.searchByCategoryAndKeyword(request.getCategory(), request.getKeyword());
            } else {
                results = paperRepository.searchByKeyword(request.getKeyword());
            }
        } else if (request.getCategory() != null && !request.getCategory().isEmpty()) {
            results = paperRepository.findByCategory(request.getCategory());
        } else if (request.getAuthor() != null && !request.getAuthor().isEmpty()) {
            results = paperRepository.findByAuthorsContainingIgnoreCase(request.getAuthor());
        } else if (request.getStartDate() != null && request.getEndDate() != null) {
            results = paperRepository.findByPublishedDateBetween(request.getStartDate(), request.getEndDate());
        } else {
            results = paperRepository.findAll();
        }
        
        return results.stream()
                .map(paperService::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> searchByKeyword(String keyword) {
        return paperRepository.searchByKeyword(keyword).stream()
                .map(paperService::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> searchByAuthor(String author) {
        return paperRepository.findByAuthorsContainingIgnoreCase(author).stream()
                .map(paperService::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> searchByCategory(String category) {
        return paperRepository.findByCategory(category).stream()
                .map(paperService::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<String> getSuggestions(String keyword) {
        List<Paper> papers = paperRepository.searchByKeyword(keyword);
        
        return papers.stream()
                .limit(5)
                .map(Paper::getTitle)
                .collect(Collectors.toList());
    }
}