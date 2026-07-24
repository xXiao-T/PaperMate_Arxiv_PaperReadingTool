import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Target, Trophy, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTagColors from '../../hooks/useTagColors';
import { apiFetch } from '../../api/request';
import './LearningManage.css';

export default function LearningManage() {
  const navigate = useNavigate();
  const [weeklyGoal, setWeeklyGoal] = useState(() => Number(localStorage.getItem('papermate_weekly_goal')) || 7);
  const [monthlyGoal, setMonthlyGoal] = useState(() => Number(localStorage.getItem('papermate_monthly_goal')) || 30);
  const [weeklyRead, setWeeklyRead] = useState(0);
  const [monthlyRead, setMonthlyRead] = useState(0);
  const [totalRead, setTotalRead] = useState(0);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [kgData, setKgData] = useState(null);
  const [kgLoading, setKgLoading] = useState(false);

  const weeklyInputRef = useRef(null);
  const monthlyInputRef = useRef(null);

  const calcInputWidth = (ref, value) => {
    if (!ref.current) return;
    const displayVal = (value === '0' || value === '') ? '' : String(value);
    const el = ref.current;
    const sizer = document.createElement('span');
    const cs = getComputedStyle(el);
    sizer.style.fontSize = cs.fontSize;
    sizer.style.fontWeight = cs.fontWeight;
    sizer.style.fontFamily = cs.fontFamily;
    sizer.style.letterSpacing = cs.letterSpacing;
    sizer.style.visibility = 'hidden';
    sizer.style.position = 'absolute';
    sizer.style.whiteSpace = 'pre';
    sizer.textContent = displayVal || '0';
    document.body.appendChild(sizer);
    const w = sizer.getBoundingClientRect().width;
    document.body.removeChild(sizer);
    el.style.width = Math.max(22, w + 8) + 'px';
  };

  useLayoutEffect(() => {
    calcInputWidth(weeklyInputRef, weeklyGoal);
    calcInputWidth(monthlyInputRef, monthlyGoal);
  }, [weeklyGoal, monthlyGoal]);

  const handleGoalChange = (setter, key) => (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 13) return;
    const cleaned = raw.replace(/^0+(\d)/, '$1') || '0';
    setter(Number(cleaned));
    localStorage.setItem(key, cleaned);
  };

  const displayGoal = (val) => (!val || val === 0) ? '' : val;

  const [kgPeriod, setKgPeriod] = useState('weekly');
  const [recordPeriod, setRecordPeriod] = useState('all');

  const getTagColor = useTagColors();

  useEffect(() => {
    apiFetch('/api/learning/stats')
      .then(s => { setWeeklyRead(s.weeklyReadingMinutes || 0); setMonthlyRead(s.monthlyReadingMinutes || 0); setTotalRead(s.totalReadingMinutes || 0); })
      .catch(() => {});
    apiFetch('/api/learning/records?period=all')
      .then(r => setRecords(r || []))
      .catch(() => {})
      .finally(() => setRecordsLoading(false));
  }, []);
  const hashStringToColor = (text) => {
    const c = getTagColor(text);
    return { backgroundColor: c, color: c.replace('90%', '25%') };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const handleGenerateKG = () => {
    setKgLoading(true);
    const token = localStorage.getItem('papermate_token');
    fetch(`http://localhost:8080/api/learning/knowledge-graph?period=${kgPeriod}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(d => {
      const nodes = d?.data?.nodes || [];
      const edges = d?.data?.edges || [];
      console.log('KG result:', nodes.length, 'nodes,', edges.length, 'edges,', { nodes, edges });
      setKgData({ nodes, edges });
      setKgLoading(false);
    }).catch(() => {
      setKgData(null);
      setKgLoading(false);
    });
  };

  const calcPercent = (read, goal) =>
    goal > 0 ? Math.round((read / goal) * 100) : 0;

  const calcWidth = (read, goal) =>
    goal > 0 ? Math.min(100, Math.round((read / goal) * 100)) + '%' : '0%';

  return (
    <div style={{ height: '100%' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">管理我的阅读</h1>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-title">本周阅读时间</div>
            <Target size={20} color="#3bcaf6" />
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span>{Math.round(weeklyRead / 6) / 10}</span>
            <span className="stat-goal">
              /
              <input
                ref={weeklyInputRef}
                className="stat-goal-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={displayGoal(weeklyGoal)}
                onChange={handleGoalChange(setWeeklyGoal, 'papermate_weekly_goal')}
                onKeyDown={handleKeyDown}
              />
              小时
            </span>
          </div>
          <div className="progress-bg"><div className="progress-fill progress-fill-weekly" style={{ width: calcWidth(weeklyRead, weeklyGoal) }}></div></div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>完成周目标的 {calcPercent(weeklyRead, weeklyGoal)}%</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-title">本月阅读时间</div>
            <Target size={20} color="#3b5af6" />
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span>{Math.round(monthlyRead / 6) / 10}</span>
            <span className="stat-goal">
              /
              <input
                ref={monthlyInputRef}
                className="stat-goal-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={displayGoal(monthlyGoal)}
                onChange={handleGoalChange(setMonthlyGoal, 'papermate_monthly_goal')}
                onKeyDown={handleKeyDown}
              />
              小时
            </span>
          </div>
          <div className="progress-bg"><div className="progress-fill" style={{ width: calcWidth(monthlyRead, monthlyGoal) }}></div></div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>完成月目标的 {calcPercent(monthlyRead, monthlyGoal)}%</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-title">总计阅读时长</div>
            <Clock size={20} color="#8b5cf6" />
          </div>
          <div className="stat-value">{Math.round(totalRead / 6) / 10} <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>小时</span></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>我的阅读记录</h3>
          <select
            className="kg-period-select"
            value={recordPeriod}
            onChange={(e) => setRecordPeriod(e.target.value)}
          >
            <option value="weekly">本周</option>
            <option value="monthly">本月</option>
            <option value="all">全部</option>
          </select>
        </div>
        <div className="reading-records-scroll">
          {recordsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>加载中...</div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>暂无阅读记录</div>
          ) : records.map((paper) => (
            <div
              key={paper.id}
              className="reading-record-item"
              onClick={() => navigate('/reader', { state: { paper } })}
              style={{ cursor: 'pointer' }}
            >
              <div className="record-item-left">
                <div className="record-item-title-group">
                  <h4 className="record-item-title">{paper.title}</h4>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" style={{ flexShrink: 0 }} />
                </div>
                <div className="record-item-meta">
                  <span>{paper.authors}</span>
                  <span className="meta-dot"></span>
                  <span>{paper.publishedAt}</span>
                </div>
                <div className="record-item-tags">
                  {paper.tags.map((tag) => (
                    <span key={tag} className="record-tag" style={hashStringToColor(tag)}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )) }
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            className="kg-generate-btn"
            onClick={handleGenerateKG}
            disabled={kgLoading}
          >
            {kgLoading ? '生成中...' : '生成知识图谱'}
          </button>
          <select
            className="kg-period-select"
            value={kgPeriod}
            onChange={(e) => setKgPeriod(e.target.value)}
          >
            <option value="weekly">本周</option>
            <option value="monthly">本月</option>
          </select>
        </div>
        {kgData ? (
          <div style={{ padding: '16px', border: '2px solid #3b82f6', borderRadius: '16px', fontSize: '13px' }}>
            {kgData.nodes && kgData.nodes.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {kgData.nodes.map(n => {
                  const bg = getTagColor(n.label || n.id || '');
                  return <span key={n.id} className="tag" style={{backgroundColor: bg, color: bg.replace('90%','25%'), padding: '8px 14px'}} title={n.desc || n.label}>
                    {n.label || n.id}{n.value > 0 ? ` (${n.value})` : ''}
                  </span>;
                })}
              </div>
            ) : <p>暂无节点</p>}
            {kgData.edges && kgData.edges.length > 0 && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <p style={{fontWeight:600,marginBottom:'4px'}}>关联 ({kgData.edges.length})：</p>
                {kgData.edges.slice(0, 15).map((e, i) => (
                  <div key={i} style={{ padding: '2px 0' }}>
                    {e.source} {e.label ? `(${e.label}) ` : ''}→ {e.target}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#94a3b8' }}>
            点击生成知识图谱
          </div>
        )}
      </div>
    </div>
  );
}