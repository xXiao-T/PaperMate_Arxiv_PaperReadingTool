import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css'; // 引入上面的统一样式

export default function ForgotPassword() {
  return (
    <div className="login-screen">
      {/* 背景光效 */}
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>

      {/* dark-glass 在全局 index.css 里定义了毛玻璃效果 */}
      <div className="login-box dark-glass">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>找回密码</h2>
        </div>

        <div>
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="输入注册邮箱"
              className="input-field"
              style={{ width: '100%', paddingRight: '90px', boxSizing: 'border-box' }}
            />
            <button className="btn-inside">
              发送验证码
            </button>
          </div>
          <input type="email" placeholder="输入验证码" className="input-field" />
          
          <Link to="/reset-password">
            <button className="btn-primary" style={{ marginTop: '16px' }}>
              确定
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
          <Link to="/login" style={{ color: '#94a3b8' }}>
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}