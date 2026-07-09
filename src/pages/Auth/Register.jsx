import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Register() {
  return (
    <div className="login-screen">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>

      <div className="login-box dark-glass">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>创建账号</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>加入 PaperMate，开启高效科研</p>
        </div>

        <div>
          <input type="text" placeholder="用户名" className="input-field" />
          <input type="email" placeholder="邮箱" className="input-field" />
          <input type="password" placeholder="密码" className="input-field" />
          
          <Link to="/">
            <button className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
              注册并返回登录 <ArrowRight size={18} />
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: '#94a3b8' }}>已有账号？ </span>
          <Link to="/login" style={{ color: '#60a5fa', fontWeight: '500' }}>返回登录</Link>
        </div>
      </div>
    </div>
  );
}