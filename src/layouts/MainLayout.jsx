import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';

export default function MainLayout({ children }) {
  const location = useLocation();
  const wrapperClass = location.pathname.startsWith('/reader') ? 'content-wrapper reader-wide' : 'content-wrapper';

  return (
    <div className="app-layout">
      {/* 原生 CSS 实现的背景光晕 */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>
      
      <Sidebar />
      <div className={location.pathname.startsWith('/reader') ? 'main-content reader-page' : 'main-content'}>
        <div className={wrapperClass}>
          {children}
        </div>
      </div>
    </div>
  );
}