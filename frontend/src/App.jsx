import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/" element={<ProtectedRoute><ReaderProvider><MainLayout><Search /></MainLayout></ReaderProvider></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><ReaderProvider><MainLayout><Library /></MainLayout></ReaderProvider></ProtectedRoute>} />
          <Route path="/reader" element={<ProtectedRoute><ReaderProvider><MainLayout><Reader /></MainLayout></ReaderProvider></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><ReaderProvider><MainLayout><LearningManage /></MainLayout></ReaderProvider></ProtectedRoute>} />
          <Route path="/fetch" element={<ProtectedRoute><ReaderProvider><MainLayout><AutoFetch /></MainLayout></ReaderProvider></ProtectedRoute>} />
          <Route path="/paper/:id" element={<ProtectedRoute><ReaderProvider><MainLayout><PaperDetail /></MainLayout></ReaderProvider></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
