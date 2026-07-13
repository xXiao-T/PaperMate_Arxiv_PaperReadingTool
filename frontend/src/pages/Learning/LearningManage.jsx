import React, { useState, useRef, useLayoutEffect } from 'react';
import { Target, Trophy, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LearningManage.css';

const PLACEHOLDER_PAPERS = [
  {
    id: 1,
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    publishedAt: '2017-06-12',
    tags: ['自然语言处理', 'Transformer'],
    abstract: '提出了一种全新的基于自注意力机制的序列转换模型Transformer，摒弃了传统的循环和卷积结构，在机器翻译等任务上取得了突破性成果。',
  },
  {
    id: 2,
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: 'Devlin et al.',
    publishedAt: '2018-10-11',
    tags: ['自然语言处理', '预训练模型'],
    abstract: '提出了BERT预训练语言模型，通过掩码语言模型和下一句预测任务，在11项自然语言处理任务上刷新了最佳成绩。',
  },
  {
    id: 3,
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: 'Krizhevsky, Sutskever & Hinton',
    publishedAt: '2012-12-03',
    tags: ['计算机视觉', '深度学习'],
    abstract: '提出了AlexNet深度卷积神经网络，在ImageNet大规模图像识别竞赛中以显著优势夺冠，开启了深度学习在计算机视觉领域的新纪元。',
  },
  {
    id: 4,
    title: 'Latent Dirichlet Allocation',
    authors: 'Blei, Ng & Jordan',
    publishedAt: '2003-01-01',
    tags: ['机器学习', '主题模型'],
    abstract: '提出了LDA主题模型，一种基于贝叶斯框架的生成式概率模型，广泛应用于文本挖掘、信息检索和推荐系统等领域。',
  },
];

export default function LearningManage() {
  const navigate = useNavigate();
  const [weeklyGoal, setWeeklyGoal] = useState(16);
  const [monthlyGoal, setMonthlyGoal] = useState(48);

  const weeklyRead = 12;
  const monthlyRead = 12;

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

  const handleGoalChange = (setter, currentVal) => (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 13) return;
    const cleaned = raw.replace(/^0+(\d)/, '$1');
    setter(cleaned);
  };

  const displayGoal = (val) => (val === '0' || val === '') ? '' : val;

  const [kgPeriod, setKgPeriod] = useState('weekly');
  const [recordPeriod, setRecordPeriod] = useState('all');

  const hashStringToColor = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
      hash &= hash;
    }
    const hue = Math.abs(hash) % 360;
    return {
      backgroundColor: `hsl(${hue}, 50%, 93%)`,
      color: `hsla(${hue}, 50%, 35%, 0.85)`,
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const handleGenerateKG = () => {
    const label = kgPeriod === 'weekly' ? '本周' : '本月';
    alert('生成了' + label + '知识图谱');
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
            <span>{weeklyRead}</span>
            <span className="stat-goal">
              /
              <input
                ref={weeklyInputRef}
                className="stat-goal-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={displayGoal(weeklyGoal)}
                onChange={handleGoalChange(setWeeklyGoal, weeklyGoal)}
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
            <span>{monthlyRead}</span>
            <span className="stat-goal">
              /
              <input
                ref={monthlyInputRef}
                className="stat-goal-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={displayGoal(monthlyGoal)}
                onChange={handleGoalChange(setMonthlyGoal, monthlyGoal)}
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
          <div className="stat-value">34 <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>小时</span></div>
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
          {PLACEHOLDER_PAPERS.map((paper) => (
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
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            className="kg-generate-btn"
            onClick={handleGenerateKG}
          >
            生成知识图谱
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
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#94a3b8' }}>
          [ Echarts / Chart.js 可视化图表容器 ]
        </div>
      </div>
    </div>
  );
}