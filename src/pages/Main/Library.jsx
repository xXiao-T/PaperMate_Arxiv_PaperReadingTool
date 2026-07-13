import React, { useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Library.css';

export default function Library() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([
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
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState(['自然语言处理', 'Transformer', '预训练模型', '计算机视觉', '深度学习', '机器学习', '主题模型']);
  const [metaData, setMetaData] = useState({
    title: '',
    authors: '',
    publishedAt: '',
    abstract: '',
    arxivUrl: '',
  });
  const fileInputRef = useRef(null);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  const toggleFilter = (tag) => {
    setActiveFilters((prev) => {
      const hasTag = prev.includes(tag);
      return hasTag ? prev.filter((item) => item !== tag) : [...prev, tag];
    });
  };

  const addTag = (tagToAdd) => {
    const normalized = tagToAdd.trim();
    if (!normalized || tags.includes(normalized)) return false;
    setTags((prev) => [...prev, normalized]);
    return true;
  };

  const commitNewTag = () => {
    if (newTagText.trim()) {
      addTag(newTagText);
    }
    setNewTagText('');
    setAddingTag(false);
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitNewTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    setPapers((prev) =>
      prev.map((paper) => ({
        ...paper,
        tags: paper.tags.filter((t) => t !== tagToRemove),
      }))
    );
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setMetaData({
      title: file.name.replace(/\.[^.]+$/, ''),
      authors: '',
      publishedAt: '',
      abstract: '',
      arxivUrl: '',
    });
  };

  const saveImportedPaper = () => {
    if (!selectedFile) return;
    if (!metaData.title.trim() || !metaData.authors.trim() || !metaData.publishedAt || !metaData.abstract.trim()) {
      return;
    }
    setPapers((prev) => [
      {
        id: Date.now(),
        title: metaData.title || selectedFile.name,
        authors: metaData.authors || '未知作者',
        publishedAt: metaData.publishedAt || '未知日期',
        tags: ['导入文献'],
        abstract: metaData.abstract || '暂无摘要信息。',
        fileName: selectedFile.name,
        arxivUrl: metaData.arxivUrl,
      },
      ...prev,
    ]);
    setSelectedFile(null);
    setMetaData({ title: '', authors: '', publishedAt: '', abstract: '', arxivUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isMetaValid = metaData.title.trim() && metaData.authors.trim() && metaData.publishedAt && metaData.abstract.trim();

  const hashStringToColor = (text, isActive) => {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
      hash &= hash;
    }
    const hue = Math.abs(hash) % 360;
    const saturation = 50;
    if (isActive) {
      return {
        backgroundColor: `hsl(${hue}, ${saturation}%, 90%)`,
        color: `hsl(${hue}, ${saturation}%, 25%)`,
        borderColor: `hsla(${hue}, ${saturation}%, 55%, 0.8)`,
      };
    }
    return {
      backgroundColor: `hsl(${hue}, ${saturation}%, 93%)`,
      color: `hsla(${hue}, ${saturation}%, 50%, 0.65)`,
      borderColor: `hsla(${hue}, ${saturation}%, 70%, 0.45)`,
    };
  };

  const getTagStyle = (tag, isActive = false) => {
    if (tag === '+') return {};
    return hashStringToColor(tag, isActive);
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const filteredPapers = activeFilters.length === 0
    ? papers
    : papers.filter((paper) => activeFilters.every((filterTag) => paper.tags.includes(filterTag)));

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">我的文库</h1>
          <p className="page-subtitle">共收藏 {papers.length} 篇文献</p>
        </div>

        <div className="header-actions">
          <button className="btn-action btn-primary-blue import-button" onClick={openFilePicker}>
            导入文献
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </header>
      <div className="library-tag-bar">
        {tags.map((tag) => {
          const isActive = activeFilters.includes(tag);
          return (
            <div
              key={tag}
              className={`tag tag-chip tag-chip-tag tag-chip-action ${isActive ? 'tag-chip-active' : ''}`}
              style={getTagStyle(tag, isActive)}
              onClick={() => toggleFilter(tag)}
            >
              <span>{tag}</span>
              <button
                type="button"
                className="tag-remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                aria-label={`删除标签 ${tag}`}
              >
                ×
              </button>
            </div>
          );
        })}
        {addingTag ? (
          <input
            type="text"
            className="tag-input"
            value={newTagText}
            onChange={(e) => setNewTagText(e.target.value)}
            onBlur={commitNewTag}
            onKeyDown={handleTagKeyDown}
            autoFocus
            placeholder="新标签"
          />
        ) : (
          <button type="button" className="tag-chip tag-chip-add" onClick={() => setAddingTag(true)}>
            +
          </button>
        )}
      </div>
      <div className="library-filter-helper">
        {activeFilters.length > 0 ? (
          <span className="filter-clear-text" onClick={clearFilters}>
            正在筛选：{activeFilters.join('，')}，点击清除筛选
          </span>
        ) : (
          <span className="filter-clear-text filter-clear-text-disabled">当前未筛选标签</span>
        )}
      </div>

      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
          <div className="import-meta-card" onClick={(event) => event.stopPropagation()}>
            <div className="import-meta-header">
              <div>
                <div className="import-meta-title">导入文件信息</div>
                <div className="import-meta-subtitle">{selectedFile.name}</div>
              </div>
              <button className="btn-action btn-secondary" onClick={() => setSelectedFile(null)}>
                取消
              </button>
            </div>
            <div className="import-meta-form">
              <div className="form-group">
                <label className="form-label">标题 <span className="required-star">*</span></label>
                <input
                  className="form-input"
                  value={metaData.title}
                  onChange={(e) => setMetaData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">作者 <span className="required-star">*</span></label>
                <input
                  className="form-input"
                  value={metaData.authors}
                  onChange={(e) => setMetaData((prev) => ({ ...prev, authors: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">发布时间 <span className="required-star">*</span></label>
                <input
                  className="form-input"
                  type="date"
                  value={metaData.publishedAt}
                  onChange={(e) => setMetaData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">摘要 <span className="required-star">*</span></label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={metaData.abstract}
                  onChange={(e) => setMetaData((prev) => ({ ...prev, abstract: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">arXiv 原文链接（可选）</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://arxiv.org/abs/xxxx.xxxxx"
                  value={metaData.arxivUrl}
                  onChange={(e) => setMetaData((prev) => ({ ...prev, arxivUrl: e.target.value }))}
                />
              </div>
              <div className="import-meta-actions">
                <button className="btn-action btn-primary-blue" onClick={saveImportedPaper} disabled={!isMetaValid}>
                  保存并导入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="library-grid">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="glass-panel library-card"
            style={{ padding: '24px 32px', cursor: 'pointer' }}
            onClick={() => navigate(`/paper/${paper.id}`, { state: { paper } })}
          >
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div>
                <div className="card-title-group">
                  <h2 className="card-title" style={{ fontSize: '20px' }}>{paper.title}</h2>
                  <Star
                    size={20}
                    color="#fbbf24"
                    fill="#fbbf24"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={(e) => { e.stopPropagation(); console.log('星标被点击'); }}
                  />
                </div>
                <div className="card-meta" style={{ marginTop: '12px' }}>
                  <span>{paper.authors}</span>
                  <span className="meta-dot"></span>
                  <span>{paper.publishedAt}</span>
                </div>
              </div>
            </div>
            <div className="tag-group" style={{ marginBottom: 12 }}>
              {paper.tags.map((tag) => (
                <span key={tag} className="tag" style={getTagStyle(tag)}>{tag}</span>
              ))}
            </div>
            <div className="abstract-text">{paper.abstract}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
