import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './Auth.css'; // 引入统一样式

export default function ResetPassword() {
  return (
    <div className="login-screen">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>

      <div className="login-box dark-glass">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>重设密码</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>请为您的账号设置一个新的密码</p>
        </div>

        <div>
          <input type="password" placeholder="新密码" className="input-field" />
          <input type="password" placeholder="确认新密码" className="input-field" />
          
          <Link to="/login">
            <button className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <CheckCircle size={18} /> 确认重设并返回登录
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
          <Link to="/login" style={{ color: '#94a3b8' }}>
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}