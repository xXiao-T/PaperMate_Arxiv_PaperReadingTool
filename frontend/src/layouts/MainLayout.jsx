import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import { useReaderContext } from '../contexts/ReaderContext';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isReader = location.pathname.startsWith('/reader');
  const wrapperClass = isReader ? 'content-wrapper reader-wide' : 'content-wrapper';
  const { title, secondTitle } = useReaderContext();

  return (
    <div className="app-layout">
      {/* 原生 CSS 实现的背景光晕 */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>
      
      <Sidebar />
      <div className={isReader ? 'main-content reader-page' : 'main-content'}>
        <div className={wrapperClass}>
          {isReader && title && (
            <header className="page-header" style={{ marginBottom: '20px' }}>
              <div>
                <h1 className="page-title" style={{ fontSize: '24px' }}>{title}</h1>
                {secondTitle && (
                  <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '12px' }}>
                    + {secondTitle}
                  </span>
                )}
              </div>
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
