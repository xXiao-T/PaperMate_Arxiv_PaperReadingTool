import React from 'react';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import './Search.css';

export default function Search() {
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
          />
          <button className="btn-action btn-primary-blue" style={{ position: 'absolute', right: '12px', top: '10px', padding: '10px 24px' }}>
            <Sparkles size={16} /> 模糊搜索
          </button>
        </div>
      </div>
    </div>
  );
}