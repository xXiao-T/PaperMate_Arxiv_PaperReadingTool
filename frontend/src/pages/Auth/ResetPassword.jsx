import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../api/authApi';
import './Auth.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 提取上一个页面传来的验证通过的邮箱和验证码
  const email = location.state?.email;
  const code = location.state?.code;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [success, setSuccess] = useState(false);

  // 防御性处理：如果用户直接在地址栏输入 /reset-password，没有携带邮箱和验证码，则踢回找回密码页
  if (!email || !code) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: '密码长度不能少于8位' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await resetPassword(email, code, newPassword);
      setSuccess(true);
      setMessage({ type: 'success', text: '密码重置成功！即将跳转登录...' });
      
      // 成功后延时跳转到登录页
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '重置失败，验证码可能已过期' });
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
          <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>设置新密码</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>请为 {email} 设置您的新密码</p>
        </div>
        
        <form onSubmit={handleReset}>
          <div className="password-wrapper">
            <input 
              type={showNewPassword ? "text" : "password"}
              placeholder="请输入新密码 (至少8位)" 
              className="input-field" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={success}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
              tabIndex={-1}
              disabled={success}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="password-wrapper">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="请再次确认新密码" 
              className="input-field" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={success}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              disabled={success}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {message.text && (
            <p style={{ 
              color: message.type === 'error' ? '#f87171' : '#4ade80', 
              fontSize: '13px', 
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              {message.text}
            </p>
          )}
          
          <button 
            type="submit"
            className="btn-primary" 
            disabled={loading || success}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}
          >
            {loading ? '提交中...' : success ? '修改成功' : <><CheckCircle size={18} /> 确认修改</>}
          </button>
        </form>

        {!success && (
          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
            <Link to="/login" style={{ color: '#94a3b8' }}>返回登录</Link>
          </div>
        )}
      </div>
    </div>
  );
}