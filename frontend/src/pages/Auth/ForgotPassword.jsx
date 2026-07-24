import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendResetCode, verifyResetCode } from '../../api/authApi';
import './Auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'error' | 'success'
  
  // 验证码倒计时状态
  const [countdown, setCountdown] = useState(0);

  // 处理倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: '请输入邮箱地址' });
      return;
    }
    // 简单邮箱格式正则校验
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMessage({ type: 'error', text: '请输入有效的邮箱格式' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await sendResetCode(email.trim());
      setMessage({ type: 'success', text: '验证码已发送至您的邮箱，请注意查收' });
      setCountdown(60); // 触发60秒倒计时
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '发送失败，请检查邮箱是否正确' });
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    
    // 1. 基础的非空校验
    if (!email.trim() || code.trim().length !== 6) {
      setMessage({ type: 'error', text: '请填写正确的邮箱和6位验证码' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 2. 向后端发起真实校验
      await verifyResetCode(email.trim(), code.trim());
      
      // 3. 只有后端返回 200 OK（不抛出异常），才会走到这里
      // 跳转并将 email 和 code 传给下一个重设密码的页面
      navigate('/reset-password', { state: { email, code } });
    } catch (error) {
      // 捕获到后端返回的 "验证码错误或已过期"
      setMessage({ type: 'error', text: error.message || '验证码错误或已失效' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>
      
      <div className="login-box dark-glass">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>找回密码</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>向您的注册邮箱发送验证码</p>
        </div>
        
        <div>
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="请输入注册邮箱"
              className="input-field"
              style={{ width: '100%', paddingRight: '110px', boxSizing: 'border-box' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* 发送验证码按钮 */}
            <button 
              type="button" 
              className="btn-inside" 
              onClick={handleSendCode}
              disabled={loading || countdown > 0}
              style={{ opacity: (loading || countdown > 0) ? 0.6 : 1 }}
            >
              {loading ? '发送中...' : countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
            </button>
          </div>
          
          {/* 下一步所需的输入框预留（例如填入验证码） */}
          <input 
            type="text" 
            placeholder="请输入6位验证码" 
            className="input-field" 
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          
          {/* 状态信息提示 */}
          {message.text && (
            <p style={{ 
              color: message.type === 'error' ? '#f87171' : '#4ade80', 
              fontSize: '13px', 
              marginBottom: '12px' 
            }}>
              {message.text}
            </p>
          )}

          <button 
            className="btn-primary" 
            style={{ marginTop: '16px' }}
            onClick={handleNextStep}
          >
            下一步
          </button>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
          <Link to="/login" style={{ color: '#94a3b8' }}>
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}