import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Search from './pages/Main/Search';
import Library from './pages/Main/Library';
import Reader from './pages/Main/Reader';
import LearningManage from './pages/Main/LearningManage';
import AutoFetch from './pages/Main/AutoFetch';
import PaperDetail from './pages/Main/PaperDetail';

function MainLayout({ children }) {
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<MainLayout><Search /></MainLayout>} />
        <Route path="/library" element={<MainLayout><Library /></MainLayout>} />
        <Route path="/reader" element={<MainLayout><Reader /></MainLayout>} />
        <Route path="/learning" element={<MainLayout><LearningManage /></MainLayout>} />
        <Route path="/fetch" element={<MainLayout><AutoFetch /></MainLayout>} />
        <Route path="/paper/:id" element={<MainLayout><PaperDetail /></MainLayout>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}