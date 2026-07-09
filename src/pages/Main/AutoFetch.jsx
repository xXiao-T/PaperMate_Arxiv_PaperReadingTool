import React from 'react';
import { Plus, Rss, PauseCircle } from 'lucide-react';
import './AutoFetch.css';

export default function AutoFetch() {
  return (
    <div style={{ height: '100%' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">让文献来找您</h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* 左侧配置表单 */}
        <div className="form-card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} color="#3b82f6" /> 新建抓取规则
          </h3>
          
          <div className="form-group">
            <label className="form-label">来源数据库</label>
            <select className="form-input">
              <option>arXiv.org</option>
              <option>PubMed</option>
              <option>IEEE Xplore</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">追踪关键词 (Keywords)</label>
            <input type="text" className="form-input" placeholder="例如: LLM, Prompt Engineering..." />
          </div>

          <div className="form-group">
            <label className="form-label">抓取频率</label>
            <select className="form-input">
              <option>每天一次 (08:00 AM)</option>
              <option>每周一 (08:00 AM)</option>
            </select>
          </div>

          <button className="btn-action btn-primary-blue" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            创建定时任务
          </button>
        </div>

        {/* 右侧任务列表 */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>运行中的任务</h3>
          
          <div className="task-item">
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>arXiv - LLM 追踪</div>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Rss size={12} /> 每天抓取
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="status-badge status-active">运行中</span>
              <button className="btn-icon"><PauseCircle size={18} /></button>
            </div>
          </div>

          <div className="task-item">
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>PubMed - Alzheimer</div>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Rss size={12} /> 每周抓取
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="status-badge status-paused">已暂停</span>
              <button className="btn-icon"><PauseCircle size={18} /></button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}