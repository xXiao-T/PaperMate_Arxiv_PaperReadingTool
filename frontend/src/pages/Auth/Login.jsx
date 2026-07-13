import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Login() {
  return (
    <div className="login-screen">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>

      <div className="login-box dark-glass">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>欢迎回来</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>登录 PaperMate 开始您的学术之旅</p>
        </div>

        <div>
          <input type="text" placeholder="邮箱" className="input-field" />
          <input type="password" placeholder="密码" className="input-field" />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '14px' }}>
            <Link to="/forgot-password" style={{ color: '#60a5fa' }}>忘记密码？</Link>
          </div>

          <Link to="/">
            <button className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              登录
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: '#94a3b8' }}>没有账号？ </span>
          <Link to="/register" style={{ color: '#60a5fa', fontWeight: '500' }}>立即注册</Link>
        </div>
      </div>
    </div>
  );
}