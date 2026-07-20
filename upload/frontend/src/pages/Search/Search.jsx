import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Search as SearchIcon, ExternalLink, Calendar, User, ArrowUpDown, ArrowDown, ArrowUp, Tag, BookmarkPlus, Check } from 'lucide-react';
import MathText from '../../components/MathText/MathText';
import { searchArxiv } from '../../api/arxivApi';
import { importPaper } from '../../api/paperApi';
import { apiFetch } from '../../api/request';
import './Search.css';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [timeSort, setTimeSort] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedAuthors, setExpandedAuthors] = useState({});
  const [inputFocused, setInputFocused] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [savedPapers, setSavedPapers] = useState({});
  const inputRef = useRef(null);
  const isInitialMount = useRef(true);

  const addHistory = (searchText) => {
    setHistory((prev) => [searchText, ...prev.filter((item) => item !== searchText)].slice(0, 10));
  };

  const doSearch = useCallback(async (searchText, category) => {
    setLoading(true);
    try {
      const cat = category !== undefined ? category : categoryFilter;
      const sortByVal = timeSort === 0 ? 'relevance' : 'submittedDate';
      const sortOrderVal = timeSort === 0 ? 'descending' : timeSort === 1 ? 'ascending' : 'descending';
      const data = await searchArxiv(searchText, searchType, 30, sortByVal, sortOrderVal, cat);
      setResults(data.list || []);
      setTotal(data.total || 0);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchType, timeSort, categoryFilter]);

  const filteredResults = useMemo(() => {
    if (!dateFrom && !dateTo) return results;
    return results.filter(p => {
      if (!p.publishedAt) return false;
      if (dateFrom && p.publishedAt < dateFrom) return false;
      if (dateTo && p.publishedAt > dateTo) return false;
      return true;
    });
  }, [results, dateFrom, dateTo]);

  const filteredTotal = (dateFrom || dateTo) ? filteredResults.length : total;

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    if (hasSearched && query.trim()) { doSearch(query.trim()); }
  }, [searchType, timeSort]);

  useEffect(() => {
    apiFetch('/api/search/history').then(data => { if (Array.isArray(data)) { setHistory(data.map(h => h.query)); } }).catch(() => {});
  }, []);

  const handleSearch = async (text) => {
    const searchText = text !== undefined ? text.trim() : query.trim();
    if (!searchText) return;
    setQuery(searchText); addHistory(searchText);
    apiFetch('/api/search/history', { method: 'POST', body: JSON.stringify({ query: searchText, searchType }), }).catch(() => {});
    setHasSearched(true); inputRef.current?.blur(); await doSearch(searchText);
  };

  const handleFilterCategory = (cat) => { setCategoryFilter(cat); doSearch(query.trim(), cat); };
  const clearCategory = () => { setCategoryFilter(''); doSearch(query.trim(), ''); };
  const handleSave = async (paper, e) => {
    e.stopPropagation();
    try {
      await importPaper({
        title: paper.title,
        authors: paper.authors,
        paperAbstract: paper.paperAbstract,
        category: paper.category || paper.tags?.[0] || '',
        publishedAt: paper.publishedAt,
        arxivUrl: paper.arxivUrl,
        tags: (paper.tags || []).join(','),
      });
      setSavedPapers(prev => ({ ...prev, [paper.id]: true }));
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const clearHistory = () => { setHistory([]); apiFetch('/api/search/history', { method: 'DELETE' }).catch(() => {}); };
  const filterBtns = [{ key: 'all', label: '综合' },{ key: 'ti', label: '标题' },{ key: 'au', label: '作者' },{ key: 'abs', label: '摘要' }];

  return (
    <div style={{ height: '100%' }}>
      <div className='search-hero'>
        <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>今天想读些什么？</h2>
        <div className='search-box-wrapper'>
          <input type='text' className='search-input' ref={inputRef} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholder='搜索标题、作者、关键词、研究方向…' style={{ paddingLeft: '40px', paddingRight: '120px', fontSize: '17px' }} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }} />
          <button className='btn-action btn-primary-blue' style={{ position: 'absolute', right: '12px', top: '10px', padding: '10px 24px' }} onClick={() => handleSearch()}><Sparkles size={16} /> 找找看</button>
          {inputFocused && (
            <div className='search-dropdown'>
              {history.length > 0 ? (<><div className='search-dropdown-list'>{history.map((item, index) => (<button key={item+'-'+index} type='button' className='search-dropdown-item' onMouseDown={(e) => { e.preventDefault(); handleSearch(item); }}>{item}</button>))}</div><div className='search-dropdown-footer'><button type='button' className='history-clear' onMouseDown={(e) => { e.preventDefault(); clearHistory(); }}>清除记录</button></div></>) : (<div className='search-dropdown-empty'>暂无搜索记录</div>)}
            </div>
          )}
        </div>
        <div className='search-filter-row'>
          {filterBtns.map((t) => (<button key={t.key} className={'search-type-btn'+(searchType===t.key?' active':'')} onClick={() => setSearchType(t.key)}>{t.label}</button>))}
          <span className='search-filter-divider'></span>
          <span className='search-sort-label'>发布时间</span>
          <button className={'search-sort-toggle'+(timeSort!==0?' active':'')} onClick={() => setTimeSort(prev => (prev+1)%3)} title={timeSort===0?'默认(相关度)':timeSort===1?'升序(最早优先)':'降序(最新优先)'}>
            {timeSort===0 && <ArrowUpDown size={15} />}{timeSort===1 && <ArrowUp size={15} />}{timeSort===2 && <ArrowDown size={15} />}
          </button>
          <span className='search-filter-divider'></span>
          <span className='search-date-label'>时间范围</span>
          <input type='date' className='search-date-input' value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className='search-date-separator'>—</span>
          <input type='date' className='search-date-input' value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          {(dateFrom || dateTo) && (<button className='search-date-clear' onClick={() => { setDateFrom(''); setDateTo(''); }} title='清除时间筛选'><span style={{fontSize:'15px',lineHeight:1}}>&#10005;</span></button>)}
          {categoryFilter && (<><span className='search-filter-divider'></span><span className='search-category-chip'><Tag size={12} /><span>{categoryFilter}</span><button className='search-category-clear' onClick={clearCategory} title='清除分类筛选'>&#10005;</button></span></>)}
        </div>
      </div>
      {hasSearched && !loading && (
        <div className='search-results-section'>
          <div className='search-results-header'><span>共 {filteredTotal} 条结果</span>{(dateFrom || dateTo) && filteredTotal !== total && (<span className='search-filter-note'>（已按时间范围筛选，原始 {total} 条）</span>)}</div>
          {filteredResults.length === 0 ? (<div className='search-results-empty'><SearchIcon size={40} color='#cbd5e1' /><p>暂无匹配的论文</p></div>) : (
            <div className='search-results-list'>
              {filteredResults.map((paper) => (
                <div key={paper.id} className='search-result-card' onClick={() => navigate('/paper/'+paper.id, { state: { paper } })}>
                  <div className='search-result-left'>
                    <h3 className='search-result-title'>{paper.title}</h3>
                    <div className='search-result-meta'>
                      <AuthorLine authors={paper.authors} paperId={paper.id} expanded={expandedAuthors[paper.id]} onToggle={() => setExpandedAuthors(prev => ({ ...prev, [paper.id]: !prev[paper.id] }))} />
                      {paper.publishedAt && (<><span className='meta-dot'></span><span className='search-result-date'><Calendar size={13} />{paper.publishedAt}</span></>)}
                    </div>
                    {paper.paperAbstract && (<p className='search-result-abstract'><MathText text={paper.paperAbstract} /></p>)}
                    {paper.tags && paper.tags.length > 0 && (<div className='search-result-tags'>{paper.tags.map((tag) => (<span key={tag} className={'tag search-tag search-tag-clickable'+(categoryFilter===tag?' search-tag-active':'')} onClick={(e) => { e.stopPropagation(); handleFilterCategory(tag); }} title={'搜索分类: '+tag}>{tag}</span>))}</div>)}
                  </div>
                  <div className='search-result-right'>
                    {paper.favorited !== undefined ? (paper.favorited || savedPapers[paper.id] ? (<span className='search-badge-fav'><Check size={13} /> 已收藏</span>) : (<button className='search-save-btn' onClick={(e) => handleSave(paper, e)} title='加入文库'><BookmarkPlus size={16} /></button>)) : (<button className='search-save-btn' onClick={(e) => handleSave(paper, e)} title='加入文库'><BookmarkPlus size={16} /></button>)}
                  {paper.arxivUrl && (<a href={paper.arxivUrl} target='_blank' rel='noopener noreferrer' onClick={(e) => e.stopPropagation()} className='search-result-link'><ExternalLink size={16} /></a>)}
                    {paper.favorited && <span className='search-badge-fav'>已收藏</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {loading && (<div className='search-loading'><Loader2 size={24} className='spin' color='#6366f1' /><span>正在搜索...</span></div>)}
    </div>
  );
}

function AuthorLine({ authors, paperId, expanded, onToggle }) {
  if (!authors) return null;
  const list = authors.split(',').map(s => s.trim()).filter(Boolean);
  if (list.length <= 3) return <span className='search-result-authors'><User size={13} />{authors}</span>;
  const display = expanded ? authors : list.slice(0, 3).join(', ');
  return (<span className='search-result-authors'><User size={13} />{display}<button className='author-toggle' onClick={(e) => { e.stopPropagation(); onToggle(); }}>{expanded ? '收起' : '等 '+list.length+' 人'}</button></span>);
}