import React, { useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Library.css';

export default function Library() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([
    {
      id: 1,
      title: '文献标题',
      authors: '作者名',
      publishedAt: '2026-07-09',
      tags: ['标签名'],
      abstract: '这里展示文献摘要的简要信息，方便快速浏览。',
    },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metaData, setMetaData] = useState({
    title: '',
    authors: '',
    publishedAt: '',
    abstract: '',
    arxivUrl: '',
  });
  const fileInputRef = useRef(null);

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

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="glass-panel library-card"
            style={{ padding: '24px 32px', cursor: 'pointer' }}
            onClick={() => navigate(`/paper/${paper.id}`)}
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
                <span key={tag} className="tag tag-purple">{tag}</span>
              ))}
            </div>
            <div className="abstract-text">{paper.abstract}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
