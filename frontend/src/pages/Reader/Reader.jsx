/**
 * Reader.jsx — 双列 PDF 阅读 + 批注 + 翻页
 * 批注标记：点击批注列表 → PDF 原位置显示 "#N" 标记
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Bot, FileText, ChevronLeft, ChevronRight, Plus, Star, X } from 'lucide-react';
import { getPaperDetail, searchPapers } from '../../api/paperApi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './Reader.css';
import '../Library/Library.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Reader() {
  const location = useLocation();
  const initialPaper = location.state?.paper || {
    id: 2,
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    publishedAt: '2017-06-12',
    tags: ['自然语言处理', 'Transformer'],
    abstract: '这是一篇关于深度学习的论文，研究注意力机制在序列建模中的应用。',
    pdfUrl: null,
    arxivId: '1706.03762',
    pdfPath: null,
  };

  const [paper, setPaper] = useState(initialPaper);
  const paperId = paper.id || 2;

  // ===== PDF 状态 =====
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pageRenderComplete, setPageRenderComplete] = useState(false);

  // ===== 双列模式 =====
  const [secondPaper, setSecondPaper] = useState(null);
  const [secondPageNumber, setSecondPageNumber] = useState(1);
  const [secondNumPages, setSecondNumPages] = useState(null);
  const [secondPdfFile, setSecondPdfFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [libraryPapers, setLibraryPapers] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [notesCollapsed, setNotesCollapsed] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const isDualMode = secondPaper !== null;

  // ===== 批注 =====
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);
  const [annotationContent, setAnnotationContent] = useState('');
  const [annotationPosition, setAnnotationPosition] = useState({ x: 50, y: 50 });
  const [annotationPage, setAnnotationPage] = useState(1);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [pendingJumpNote, setPendingJumpNote] = useState(null);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [pageMessage, setPageMessage] = useState(null);

  // ===== AI 对话 =====
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatListRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const pageRef = useRef(null);
  const markerRef = useRef(null);

  const getToken = () => localStorage.getItem('papermate_token');

  // ===== 获取 PDF URL =====
  const getPdfUrl = (paperData) => {
    console.log('📄 getPdfUrl 被调用, paperData:', paperData);

    if (paperData?.pdfPath) {
      return `http://localhost:8080/api/papers/${paperData.id}/pdf`;
    }

    if (paperData?.arxivId) {
      return `http://localhost:8080/api/papers/proxy?url=${encodeURIComponent('https://arxiv.org/pdf/' + paperData.arxivId + '.pdf')}`;
    }

    if (paperData?.arxivUrl) {
      const match = paperData.arxivUrl.match(/arxiv\.org\/(?:abs|pdf)\/([^?#]+?)(?:\.pdf)?(?:[?#]|$)/i);
      const arxivId = match?.[1];
      if (arxivId) {
        return `http://localhost:8080/api/papers/proxy?url=${encodeURIComponent('https://arxiv.org/pdf/' + arxivId + '.pdf')}`;
      }
    }

    if (paperData?.pdfUrl) {
      const pdfUrl = paperData.pdfUrl;
      if (pdfUrl.includes('arxiv.org') || pdfUrl.includes('arxiv')) {
        return `http://localhost:8080/api/papers/proxy?url=${encodeURIComponent(pdfUrl)}`;
      }
      return pdfUrl;
    }

    return null;
  };

  // ===== 初始化加载 PDF =====
  useEffect(() => {
    const url = getPdfUrl(paper);
    console.log('📄 初始 PDF URL:', url);
    if (url) {
      setPdfFile(url);
    }
  }, []);

  useEffect(() => {
    if (!paperId) return;
    getPaperDetail(paperId)
      .then(detail => {
        setPaper(current => ({
          ...current,
          ...detail,
          abstract: detail.paperAbstract || detail.abstract || current.abstract || '',
          tags: detail.tags || current.tags || [],
        }));
      })
      .catch(error => {
        console.error('加载论文详情失败:', error);
      });
  }, [paperId]);

  const loadLibraryPapers = useCallback(async () => {
    setLibraryLoading(true);
    setLibraryError('');
    try {
      const data = await searchPapers(undefined, undefined, 0, 100);
      const candidates = (data?.list || [])
        .filter(candidate => candidate.id !== paperId)
        .map(candidate => ({
          ...candidate,
          abstract: candidate.paperAbstract || candidate.abstract || '',
          tags: candidate.tags || [],
        }));
      setLibraryPapers(candidates);
    } catch (error) {
      console.error('加载文献候选列表失败:', error);
      setLibraryError(error.message || '加载文献列表失败');
    } finally {
      setLibraryLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    if (showAddModal) {
      loadLibraryPapers();
    }
  }, [showAddModal, loadLibraryPapers]);

  // ===== 文档加载成功 =====
  const onDocumentLoadSuccess = ({ numPages: pages }) => {
    setNumPages(pages);
    setIsPdfLoading(false);
    console.log('📄 PDF 加载成功，共 ' + pages + ' 页');
  };

  const onSecondDocumentLoadSuccess = ({ numPages: pages }) => {
    setSecondNumPages(pages);
  };

  // ===== 页面渲染成功 =====
  const onPageRenderSuccess = () => {
    setPageRenderComplete(true);
    if (pendingJumpNote) {
      showMarkerOnPdf(pendingJumpNote);
      setPendingJumpNote(null);
    }
  };

  // ===== 翻页 =====
  const goToPage = (page) => {
    if (page < 1 || page > numPages) return;
    setPageNumber(page);
    setPageRenderComplete(false);
    saveProgress(page);
    clearMarker();
    setPageMessage(null);
  };

  const goToSecondPage = (page) => {
    if (page < 1 || page > secondNumPages) return;
    setSecondPageNumber(page);
  };

  // ===== 获取批注 =====
  const fetchNotes = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/papers/${paperId}/annotations`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        const sorted = (data.data || []).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setNotes(sorted);
      }
    } catch (err) {
      console.error('获取批注失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== 获取阅读进度 =====
  const fetchProgress = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/papers/${paperId}/progress`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.code === 200 && data.data) {
        setPageNumber(data.data.currentPage || 1);
      }
    } catch (err) {
      console.error('获取进度失败:', err);
    }
  };

  // ===== 保存阅读进度 =====
  const saveProgress = async (page) => {
    const total = numPages || 42;
    try {
      await fetch(`http://localhost:8080/api/papers/${paperId}/progress?currentPage=${page}&totalPages=${total}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
    } catch (err) {
      console.error('保存进度失败:', err);
    }
  };

  // ===== 清除 PDF 上的标记 =====
  const clearMarker = () => {
    if (markerRef.current && markerRef.current.parentNode) {
      markerRef.current.parentNode.removeChild(markerRef.current);
    }
    markerRef.current = null;
    setActiveMarkerId(null);
  };

  // ===== 点击页面其他区域取消选中 =====
  const handlePageClick = useCallback((event) => {
    const isMarker = event.target.closest('.annotation-marker');
    const isNoteItem = event.target.closest('.note-item');
    const isAnnotationInput = event.target.closest('.annotation-input-popup');
    
    if (!isMarker && !isNoteItem && !isAnnotationInput) {
      clearMarker();
    }
  }, []);

  // ===== 在 PDF 上显示标记（使用百分比坐标） =====
  const showMarkerOnPdf = (note) => {
    clearMarker();

    if (!note) {
      console.warn('⚠️ showMarkerOnPdf: note 为空');
      return;
    }

    console.log('🔍 showMarkerOnPdf 接收到的 note:', note);

    const pageContainer = pageRef.current;
    if (!pageContainer) {
      console.warn('未找到 PDF 页面容器，重试中...');
      setTimeout(() => showMarkerOnPdf(note), 300);
      return;
    }

    const pageElement = pageContainer.querySelector('.react-pdf__Page');
    if (!pageElement) {
      console.warn('未找到 PDF 页面元素，重试中...');
      setTimeout(() => showMarkerOnPdf(note), 300);
      return;
    }

    let noteIndex = notes.findIndex(n => n.id === note.id) + 1;
    if (noteIndex === 0 && note._index) {
      noteIndex = note._index;
    }
    if (noteIndex === 0) {
      noteIndex = notes.length + 1;
      console.log('⚠️ 批注不在列表中，使用后备索引:', noteIndex);
    }
    const displayIndex = noteIndex > 0 ? noteIndex : '?';

    const xPercent = note.pdfX !== undefined && note.pdfX !== null ? note.pdfX : 50;
    const yPercent = note.pdfY !== undefined && note.pdfY !== null ? note.pdfY : 50;

    console.log(`📍 显示批注 #${displayIndex} 在 (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%)`);

    const pageRect = pageElement.getBoundingClientRect();
    const containerRect = pageContainer.getBoundingClientRect();

    const x = (xPercent / 100) * pageRect.width;
    const y = (yPercent / 100) * pageRect.height;

    const scrollTop = pageContainer.scrollTop || 0;
    const scrollLeft = pageContainer.scrollLeft || 0;
    const containerX = pageRect.left - containerRect.left + scrollLeft + x;
    const containerY = pageRect.top - containerRect.top + scrollTop + y;

    console.log(`📍 标记像素位置: (${containerX.toFixed(1)}, ${containerY.toFixed(1)})`);

    const marker = document.createElement('div');
    marker.className = 'annotation-marker';
    marker.style.position = 'absolute';
    marker.style.left = (containerX - 22) + 'px';
    marker.style.top = (containerY - 16) + 'px';
    marker.style.zIndex = '999';
    marker.style.pointerEvents = 'none';
    marker.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    marker.style.display = 'flex';
    marker.style.flexDirection = 'column';
    marker.style.alignItems = 'center';
    marker.style.justifyContent = 'center';
    marker.style.background = 'rgba(251, 191, 36, 0.15)';
    marker.style.borderRadius = '50%';
    marker.style.backdropFilter = 'blur(2px)';
    marker.style.border = '2px solid #fbbf24';
    marker.style.boxShadow = '0 0 25px rgba(251, 191, 36, 0.25)';
    marker.style.padding = '4px 2px';
    marker.style.transform = 'scale(0.3)';
    marker.style.opacity = '0';

    const label = document.createElement('span');
    label.textContent = `#${displayIndex}`;
    label.style.fontSize = '10px';
    label.style.fontWeight = '700';
    label.style.color = '#92400e';
    label.style.background = 'rgba(251, 191, 36, 0.92)';
    label.style.padding = '2px 8px';
    label.style.borderRadius = '999px';
    label.style.border = '1.5px solid #f59e0b';
    label.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
    label.style.fontFamily = 'sans-serif';
    label.style.letterSpacing = '0.3px';
    label.style.whiteSpace = 'nowrap';

    const arrow = document.createElement('div');
    arrow.style.marginTop = '-1px';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '6px solid transparent';
    arrow.style.borderRight = '6px solid transparent';
    arrow.style.borderTop = '7px solid #fbbf24';
    arrow.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))';

    marker.appendChild(label);
    marker.appendChild(arrow);
    pageContainer.appendChild(marker);
    markerRef.current = marker;
    setActiveMarkerId(note.id);

    requestAnimationFrame(() => {
      marker.style.transform = 'scale(1)';
      marker.style.opacity = '1';
      marker.style.animation = 'marker-pulse 2s ease-in-out infinite';
    });

    setTimeout(() => {
      if (marker.parentNode) {
        marker.style.animation = 'none';
        marker.style.boxShadow = '0 0 12px rgba(251, 191, 36, 0.12)';
      }
    }, 5000);

    const notePage = note.pageIndex + 1;
    if (notePage !== pageNumber) {
      setPageMessage(`📌 批注在 ${notePage} 页，已跳转`);
      setTimeout(() => setPageMessage(null), 3000);
    }
  };

  // ===== 跳转到批注 =====
  const jumpToNote = useCallback((note) => {
    if (!note) {
      console.warn('⚠️ jumpToNote: note 为空');
      return;
    }

    console.log('🔍 jumpToNote 接收到的 note:', note);
    console.log('📍 批注坐标: pdfX=', note.pdfX, 'pdfY=', note.pdfY);

    const targetPage = note.pageIndex + 1;
    
    if (targetPage !== pageNumber) {
      setPageNumber(targetPage);
      setPageRenderComplete(false);
      setPendingJumpNote(note);
    } else {
      showMarkerOnPdf(note);
    }
  }, [pageNumber]);

  // ===== 右键添加批注（使用百分比坐标） =====
  const handleContextMenu = (event) => {
    event.preventDefault();
    
    const pageContainer = pageRef.current;
    if (!pageContainer) {
      console.warn('未找到 PDF 页面容器');
      return;
    }

    const pageElement = pageContainer.querySelector('.react-pdf__Page');
    if (!pageElement) {
      console.warn('未找到 PDF 页面元素');
      return;
    }

    const pageNum = parseInt(pageElement.getAttribute('data-page-number'), 10);
    const currentPage = pageNum > 0 ? pageNum : pageNumber;

    const pageRect = pageElement.getBoundingClientRect();
    
    const xPercent = ((event.clientX - pageRect.left) / pageRect.width) * 100;
    const yPercent = ((event.clientY - pageRect.top) / pageRect.height) * 100;

    if (xPercent < 0 || yPercent < 0 || xPercent > 100 || yPercent > 100) {
      console.warn('点击位置在 PDF 页面之外');
      return;
    }

    console.log('📍 批注位置: 页码=', currentPage, '百分比=', { xPercent, yPercent });

    setAnnotationPosition({ x: xPercent, y: yPercent });
    setAnnotationPage(currentPage);
    setAnnotationContent('');
    setShowAnnotationInput(true);
  };

  // ===== 创建批注 =====
  const createAnnotation = async () => {
    if (!annotationContent.trim()) return;

    console.log('📝 创建批注: 页码=', annotationPage, '位置=', annotationPosition);

    try {
      const res = await fetch(`http://localhost:8080/api/papers/${paperId}/annotations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageIndex: annotationPage - 1,
          startOffset: 0,
          endOffset: 0,
          selectedText: `第 ${annotationPage} 页`,
          commentText: annotationContent,
          annotationType: 'note',
          color: '#FFD700',
          pdfX: annotationPosition.x,
          pdfY: annotationPosition.y
        })
      });
      const data = await res.json();
      if (data.code === 200) {
        const newNote = {
          ...data.data,
          pdfX: annotationPosition.x,
          pdfY: annotationPosition.y,
          pageIndex: annotationPage - 1,
          _index: notes.length + 1,
        };
        setNotes(prev => [...prev, newNote]);
        
        setAnnotationContent('');
        setShowAnnotationInput(false);
        
        setTimeout(() => {
          showMarkerOnPdf(newNote);
        }, 300);
      }
    } catch (err) {
      alert('创建批注失败: ' + err.message);
    }
  };

  const cancelAnnotation = () => {
    setShowAnnotationInput(false);
    setAnnotationContent('');
  };

  // ===== 删除批注 =====
  const deleteNote = async (noteId) => {
    if (!confirm('确定删除此批注吗？')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/papers/${paperId}/annotations/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        clearMarker();
        await fetchNotes();
      }
    } catch (err) {
      alert('删除失败: ' + err.message);
    }
  };

  // ===== 更新批注 =====
  const updateNote = async (noteId) => {
    if (!editContent.trim()) {
      alert('请输入内容');
      return;
    }

    const note = notes.find(n => n.id === noteId);
    if (!note) {
      alert('批注不存在');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/papers/${paperId}/annotations/${noteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageIndex: note.pageIndex || 0,
          startOffset: note.startOffset || 0,
          endOffset: note.endOffset || 0,
          selectedText: note.selectedText || '',
          commentText: editContent,
          annotationType: note.annotationType || 'note',
          color: note.color || '#FFD700',
          pdfX: note.pdfX ?? 50,
          pdfY: note.pdfY ?? 50
        })
      });

      const data = await res.json();
      if (data.code === 200) {
        await fetchNotes();
        setEditingNoteId(null);
        setEditContent('');
        const updatedNote = notes.find(n => n.id === noteId);
        if (updatedNote) showMarkerOnPdf(updatedNote);
      } else {
        alert('更新失败: ' + (data.message || '未知错误'));
      }
    } catch (err) {
      console.error('更新异常:', err);
      alert('更新失败: ' + err.message);
    }
  };

  // ===== AI 对话 =====
  const handleAiSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isAiLoading) return;
    const userMsg = { role: 'user', content: trimmed };
    setMessages([...messages, userMsg]);
    setInputValue('');
    setIsAiLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: `关于 "${trimmed}"，请参考论文第 ${pageNumber} 页。` }]);
      setIsAiLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchNotes();
    fetchProgress();
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handlePageClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handlePageClick);
    };
  }, [paperId]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    clearMarker();
  }, [pageNumber]);

  const progressPercent = numPages ? Math.round((pageNumber / numPages) * 100) : 0;

  // ===== 选择第二篇文献 =====
  const handleSelectSecondPaper = (selectedPaper) => {
    setSecondPaper(selectedPaper);
    setSecondPdfFile(getPdfUrl(selectedPaper));
    setSecondPageNumber(1);
    setSecondNumPages(null);
    setShowAddModal(false);
    setNotesCollapsed(true);   // 只收起批注面板，AI 面板保持显示
    // AI 面板保持打开
  };

  // ===== 渲染 PDF 视图 =====
  const renderPDFViewer = (file, pageNum, totalPages, onPageChange, label, isSecond = false) => {
    const paperData = isSecond ? secondPaper : paper;
    const pdfUrl = getPdfUrl(paperData);
    console.log('📄 renderPDFViewer PDF URL:', pdfUrl);

    return (
      <div className="reader-main reader-main-split">
        {/* 🔥 双列模式下显示文献标题（在 PDF 上方） */}
        {isDualMode && (
          <div style={{
            padding: '6px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            minHeight: '36px',
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {paperData?.title || '文献'}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#94a3b8',
              marginLeft: '12px',
              flexShrink: 0,
            }}>
              {paperData?.authors?.split(',')[0] || ''}
              {paperData?.authors?.split(',').length > 1 && ' 等'}
            </span>
          </div>
        )}
        <div className="reader-pdf-toolbar">
          <span className="reader-page-label">
            {label} 第 {pageNum} 页 / 共 {totalPages || '?'} 页
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onPageChange(pageNum - 1)}
              disabled={pageNum <= 1}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: pageNum <= 1 ? 'not-allowed' : 'pointer',
                opacity: pageNum <= 1 ? 0.5 : 1
              }}
            >
              ←
            </button>
            <span style={{ fontSize: '13px', color: '#64748b', padding: '4px 8px' }}>{pageNum}</span>
            <button
              onClick={() => onPageChange(pageNum + 1)}
              disabled={pageNum >= totalPages}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: pageNum >= totalPages ? 'not-allowed' : 'pointer',
                opacity: pageNum >= totalPages ? 0.5 : 1
              }}
            >
              →
            </button>
          </div>
          {isDualMode && isSecond && (
            <button
              className="reader-kick-btn"
              onClick={() => setSecondPaper(null)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #ef4444',
                background: 'white',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '12px',
                marginLeft: '8px'
              }}
            >
              ✕ 移除
            </button>
          )}
        </div>
        <div
          ref={isSecond ? null : pageRef}
          style={{ flex: 1, overflow: 'auto', padding: '10px', background: '#f1f5f9', position: 'relative' }}
          onContextMenu={isSecond ? undefined : handleContextMenu}
        >
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={isSecond ? onSecondDocumentLoadSuccess : onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('📄 PDF 加载失败:', error);
              }}
              loading={<div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>加载 PDF...</div>}
              error={<div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>PDF 加载失败，请检查文件是否已上传或 arXiv 链接是否有效</div>}
            >
              <Page
                pageNumber={pageNum}
                width={500}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onRenderSuccess={isSecond ? undefined : onPageRenderSuccess}
                data-page-number={pageNum}
              />
            </Document>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              暂无 PDF
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ===== 页面消息提示 ===== */}
      {pageMessage && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '10px',
          fontSize: '13px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          zIndex: 200,
          animation: 'fadeInUp 0.3s ease'
        }}>
          {pageMessage}
        </div>
      )}

      {/* ===== 页面标题（双列模式下隐藏，移到 PDF 上方） ===== */}
      {!isDualMode && (
        <header className="page-header" style={{ marginBottom: '20px' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '24px' }}>{paper.title}</h1>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {paper.authors} · {paper.publishedAt}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>进度: {progressPercent}%</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>🖱️ 右键添加批注</span>
          </div>
        </header>
      )}

      <div className="reader-layout">
        <div className="reader-notes">
          {/* ===== 左侧：批注面板（双列模式隐藏） ===== */}
          {!isDualMode && (
            <div className={`reader-notes-panel${notesCollapsed ? ' reader-notes-panel-collapsed' : ''}`}>
              {notesCollapsed ? (
                <div className="collapsed-strip" onClick={() => setNotesCollapsed(false)} title="展开批注面板">
                  <ChevronRight size={20} color="#8b5cf6" />
                  <FileText size={20} color="#8b5cf6" />
                </div>
              ) : (
                <div className="glass-panel reader-notes-panel-inner">
                  <h3 className="reader-notes-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="#8b5cf6" /> 我的批注 ({notes.length})
                    </span>
                    <button
                      type="button"
                      className="collapse-toggle-btn"
                      onClick={() => setNotesCollapsed(true)}
                      title="收起批注面板"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </h3>

                  <div className="reader-notes-body" ref={chatListRef}>
                    {loading ? (
                      <div style={{ color: '#94a3b8', fontSize: '14px' }}>加载中...</div>
                    ) : notes.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                        右键点击 PDF 添加批注
                      </div>
                    ) : (
                      notes.map((note, index) => {
                        const isEditing = editingNoteId === note.id;
                        const isActive = activeMarkerId === note.id;
                        return (
                          <div
                            key={note.id}
                            className="note-item"
                            style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              background: isActive ? '#fef3c7' : (isEditing ? '#f8fafc' : 'transparent'),
                              borderRadius: '6px',
                              transition: 'all 0.2s',
                              borderLeft: isActive ? '3px solid #fbbf24' : '3px solid transparent'
                            }}
                            onClick={() => jumpToNote(note)}
                            onMouseEnter={(e) => {
                              if (!isEditing && !isActive) {
                                e.currentTarget.style.background = '#f8fafc';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isEditing && !isActive) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <div style={{
                              fontSize: '12px',
                              color: '#8b5cf6',
                              fontWeight: 600,
                              marginBottom: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span>📍</span>
                              <span style={{ background: '#8b5cf6', color: 'white', padding: '0 8px', borderRadius: '999px', fontSize: '10px' }}>
                                #{index + 1}
                              </span>
                              第 {note.pageIndex + 1} 页
                            </div>

                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                <input
                                  type="text"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    outline: 'none'
                                  }}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      updateNote(note.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateNote(note.id);
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    background: editContent.trim() ? '#3b82f6' : '#94a3b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: editContent.trim() ? 'pointer' : 'not-allowed',
                                    fontSize: '12px',
                                    opacity: editContent.trim() ? 1 : 0.5
                                  }}
                                  disabled={!editContent.trim()}
                                >
                                  保存
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingNoteId(null);
                                    setEditContent('');
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    background: '#e2e8f0',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                                  {note.commentText || '（无批注内容）'}
                                </div>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginTop: '6px'
                                }}>
                                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                    {note.createdAt ? new Date(note.createdAt).toLocaleString('zh-CN') : ''}
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingNoteId(note.id);
                                        setEditContent(note.commentText || '');
                                      }}
                                      style={{
                                        padding: '2px 8px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        borderRadius: '4px'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      ✎
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNote(note.id);
                                      }}
                                      style={{
                                        padding: '2px 8px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        borderRadius: '4px'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== 中间：PDF 区域 ===== */}
          <div className="reader-main-area" ref={pdfContainerRef}>
            {renderPDFViewer(pdfFile, pageNumber, numPages, goToPage, '主文献')}
            {isDualMode && renderPDFViewer(
              secondPdfFile || pdfFile,
              secondPageNumber,
              secondNumPages || numPages,
              goToSecondPage,
              secondPaper?.title || '对比文献',
              true
            )}
          </div>

          {/* ===== 右侧：+ 按钮（单列模式） ===== */}
          {!isDualMode && (
            <div className="reader-add-btn-area">
              <button
                type="button"
                className="reader-add-btn reader-add-btn-side"
                onClick={() => setShowAddModal(true)}
                title="加入第二篇..."
              >
                <Plus size={18} />
              </button>
            </div>
          )}

          {/* ===== AI 面板（始终显示） ===== */}
          <div className={`reader-sidebar${aiCollapsed ? ' reader-sidebar-collapsed' : ''}`}>
            {aiCollapsed ? (
              <div className="collapsed-strip collapsed-strip-right" onClick={() => setAiCollapsed(false)} title="展开对话面板">
                <Bot size={20} color="#9eb5db" />
                <ChevronLeft size={20} color="#9eb5db" />
              </div>
            ) : (
              <div className="glass-panel reader-ai-panel">
                <div className="chat-panel-top">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={18} color="#9eb5db" /> AI 助手
                    </span>
                    <button
                      type="button"
                      className="collapse-toggle-btn"
                      onClick={() => setAiCollapsed(true)}
                      title="收起对话面板"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </h3>

                  <div className="chat-list" ref={chatListRef}>
                    {messages.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '80px 0' }}>
                        输入 /analyze 分析论文
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}>
                          <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                          </div>
                        </div>
                      ))
                    )}
                    {isAiLoading && (
                      <div className="chat-message chat-message-ai">
                        <div className="chat-bubble chat-bubble-ai" style={{ opacity: 0.7 }}>思考中...</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="chat-input-actions" style={{ marginBottom: '10px' }}>
                  <button
                    className="chat-action-button"
                    onClick={() => { setInputValue('/analyze'); setTimeout(handleAiSend, 100); }}
                    disabled={isAiLoading}
                  >
                    📊 分析
                  </button>
                  <button
                    className="chat-action-button"
                    onClick={() => { setInputValue('/summarize'); setTimeout(handleAiSend, 100); }}
                    disabled={isAiLoading}
                  >
                    📝 总结
                  </button>
                  {isDualMode && (
                    <button
                      className="chat-action-button"
                      onClick={() => { setInputValue('/compare'); setTimeout(handleAiSend, 100); }}
                      disabled={isAiLoading}
                      style={{ background: '#8b5cf6' }}
                    >
                      🔄 对比
                    </button>
                  )}
                </div>

                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="输入消息..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    disabled={isAiLoading}
                    style={{ marginBottom: '0' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 添加文献弹窗 ===== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="import-meta-card reader-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="import-meta-header">
              <div className="import-meta-title">加入第二篇文献</div>
              <button className="btn-action btn-secondary" onClick={() => setShowAddModal(false)}>取消</button>
            </div>
            <div className="reader-add-grid">
              {libraryLoading && (
                <div style={{ padding: '32px', color: '#64748b', textAlign: 'center' }}>正在加载文献列表...</div>
              )}
              {!libraryLoading && libraryError && (
                <div style={{ padding: '32px', color: '#ef4444', textAlign: 'center' }}>{libraryError}</div>
              )}
              {!libraryLoading && !libraryError && libraryPapers.length === 0 && (
                <div style={{ padding: '32px', color: '#64748b', textAlign: 'center' }}>暂无可加入的其他文献</div>
              )}
              {!libraryLoading && !libraryError && libraryPapers.map(libPaper => (
                <div
                  key={libPaper.id}
                  className="glass-panel library-card"
                  style={{ padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => handleSelectSecondPaper(libPaper)}
                >
                  <div className="card-header" style={{ marginBottom: '12px' }}>
                    <div>
                      <div className="card-title-group">
                        <h2 className="card-title" style={{ fontSize: '16px' }}>{libPaper.title}</h2>
                      </div>
                      <div className="card-meta">
                        <span>{libPaper.authors}</span>
                        <span className="meta-dot"></span>
                        <span>{libPaper.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="tag-group" style={{ marginBottom: 8 }}>
                    {(libPaper.tags || []).map(tag => (
                      <span key={tag} className="tag tag-purple">{tag}</span>
                    ))}
                  </div>
                  <div className="abstract-text" style={{ fontSize: '13px' }}>{libPaper.paperAbstract || libPaper.abstract || ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== 批注输入弹窗 ===== */}
      {showAnnotationInput && (
        <div
          className="annotation-input-popup"
          style={{
            position: 'fixed',
            top: Math.min(annotationPosition.y + 80, window.innerHeight - 200),
            left: Math.min(annotationPosition.x + 80, window.innerWidth - 380),
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 100,
            width: '340px',
            maxWidth: '90%'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              📍 第 {annotationPage} 页
            </span>
            <button onClick={cancelAnnotation} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          <textarea
            placeholder="输入批注内容..."
            value={annotationContent}
            onChange={(e) => setAnnotationContent(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: '10px'
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={createAnnotation}
              disabled={!annotationContent.trim()}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: annotationContent.trim() ? '#3b82f6' : '#94a3b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: annotationContent.trim() ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              保存
            </button>
            <button
              onClick={cancelAnnotation}
              style={{
                padding: '8px 16px',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* ===== CSS 动画 ===== */}
      <style>{`
        @keyframes marker-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.35);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .annotation-marker {
          animation: marker-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
