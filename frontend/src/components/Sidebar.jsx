import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, BookOpen, Book, TrendingUp, DownloadCloud, LogOut } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isReader = location.pathname.startsWith('/reader');

  // 点击退出登录按钮时，导航到登录页面
  const handleLogout = () => {
    navigate('/login');
  };

  const navItems = [
    { path: '/', name: '快速检索', icon: <Search size={18} /> },
    { path: '/library', name: '我的文库', icon: <BookOpen size={18} /> },
    { path: '/reader', name: '开始阅读', icon: <Book size={18} /> },
    { path: '/learning', name: '阅读管理', icon: <TrendingUp size={18} /> },
    { path: '/fetch', name: '定时抓取', icon: <DownloadCloud size={18} /> },
  ];

  const sidebarClasses = isReader ? 'sidebar dark-glass reader-small' : 'sidebar dark-glass';

  return (
    <div className={sidebarClasses}>
      <div className="sidebar-header">
        <h1 className="text-gradient" style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {isReader ? 'PM' : 'PaperMate'}
        </h1>
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* 底部用户信息与退出登录 */}
      <div className={isReader ? 'sidebar-footer reader-small' : 'sidebar-footer'} style={{ 
        padding: '24px', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between', /* 将用户信息和退出按钮推向两端 */
        alignItems: 'center'
      }}>
        <div className={`sidebar-user ${isReader ? 'collapsed' : ''}`} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => { if (!isReader) e.currentTarget.style.opacity = 0.7; }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #c084fc, #60a5fa)' }}></div>
          <span style={{ fontSize: '14px' }}>用户名</span>
        </div>
        
        {/* 退出按钮 */}
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ef4444', /* 红字 */
            background: 'transparent', padding: '8px', borderRadius: '12px', 
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="退出登录"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}