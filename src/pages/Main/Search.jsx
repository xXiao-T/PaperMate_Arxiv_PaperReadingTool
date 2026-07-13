import React, { useState } from 'react';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import './Search.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);

  const addHistory = (searchText) => {
    setHistory((prev) => [searchText, ...prev.filter((item) => item !== searchText)].slice(0, 10));
  };

  const handleSearch = (text) => {
    const searchText = text !== undefined ? text.trim() : query.trim();
    if (!searchText) return;
    setQuery(searchText);
    addHistory(searchText);
    alert(`搜索了${searchText}`);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div style={{ height: '100%' }}>

      <div className="search-hero">
        <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          今天想读些什么？
        </h2>

        <div className="search-box-wrapper">
          <input 
            type="text" 
            className="search-input" 
            placeholder="标题、作者、关键词、研究方向或概念标签等" 
            style={{ paddingLeft: '40px', paddingRight: '120px', fontSize: '17px'}}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          />
          <button className="btn-action btn-primary-blue" style={{ position: 'absolute', right: '12px', top: '10px', padding: '10px 24px' }} onClick={() => handleSearch()}>
            <Sparkles size={16} /> 找找看
          </button>
        </div>
        <div className="search-history-panel">
          {history.length > 0 ? (
            <div className="search-history-list">
              {history.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  className="search-history-item"
                  onClick={() => handleSearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <div className="search-history-empty">暂无搜索记录</div>
          )}
          {history.length > 0 && (
            <div className="search-history-footer">
              <button type="button" className="history-clear" onClick={clearHistory}>清除记录</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}