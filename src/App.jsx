import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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