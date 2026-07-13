import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReaderProvider } from './contexts/ReaderContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Search from './pages/Search/Search';
import Library from './pages/Library/Library';
import Reader from './pages/Reader/Reader';
import LearningManage from './pages/Learning/LearningManage';
import AutoFetch from './pages/AutoFetch/AutoFetch';
import PaperDetail from './pages/PaperDetail/PaperDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<ReaderProvider><MainLayout><Search /></MainLayout></ReaderProvider>} />
        <Route path="/library" element={<ReaderProvider><MainLayout><Library /></MainLayout></ReaderProvider>} />
        <Route path="/reader" element={<ReaderProvider><MainLayout><Reader /></MainLayout></ReaderProvider>} />
        <Route path="/learning" element={<ReaderProvider><MainLayout><LearningManage /></MainLayout></ReaderProvider>} />
        <Route path="/fetch" element={<ReaderProvider><MainLayout><AutoFetch /></MainLayout></ReaderProvider>} />
        <Route path="/paper/:id" element={<ReaderProvider><MainLayout><PaperDetail /></MainLayout></ReaderProvider>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}