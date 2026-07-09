import React from 'react';
import { Target, Trophy, Clock } from 'lucide-react';
import './LearningManage.css';

export default function LearningManage() {
  return (
    <div style={{ height: '100%' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">跟踪您的学术阅读进度</h1>
        </div>
      </header>

      {/* 数据看板 */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-title">本周阅读量</div>
            <Target size={20} color="#3b82f6" />
          </div>
          <div className="stat-value">12 <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>篇</span></div>
          <div className="progress-bg"><div className="progress-fill" style={{ width: '75%' }}></div></div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>完成周目标的 75%</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-title">深度精读</div>
            <Trophy size={20} color="#f59e0b" />
          </div>
          <div className="stat-value">5 <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>篇</span></div>
          <p style={{ fontSize: '12px', color: '#10b981', marginTop: '12px', fontWeight: 600 }}>↑ 较上周提升 2 篇</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-title">总计阅读时长</div>
            <Clock size={20} color="#8b5cf6" />
          </div>
          <div className="stat-value">34 <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>小时</span></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>知识图谱分布</h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#94a3b8' }}>
          [ Echarts / Chart.js 可视化图表容器 ]
        </div>
      </div>
    </div>
  );
}