package com.papermate.paper.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class PaperPageVO {
    private final List<PaperDTO> list;
    private final long total;
    private final int page;
    private final int pageSize;
}
