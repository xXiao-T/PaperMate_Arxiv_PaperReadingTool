import React, { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchPapers, importPaper as importPaperApi } from "../../api/paperApi";
import "./Library.css";

export default function Library() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState(["NLP", "Transformer", "Computer Vision"]);
  const [metaData, setMetaData] = useState({ title: "", authors: "", publishedAt: "", abstract: "", arxivUrl: "" });
  const fileInputRef = useRef(null);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ---- fetch 篇文献 from backend ----
  const fetchPapers = async () => {
    try {
      const data = await searchPapers();
      setPapers(data.list);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to fetch papers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPapers(); }, []);

  // ---- filters ----
  const toggleFilter = (tag) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addTag = (tagToAdd) => {
    const n = tagToAdd.trim();
    if (!n || tags.includes(n)) return false;
    setTags((prev) => [...prev, n]);
    return true;
  };

  const commitNewTag = () => {
    if (newTagText.trim()) addTag(newTagText);
    setNewTagText(""); setAddingTag(false);
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    setPapers((prev) => prev.map((p) => ({ ...p, tags: p.tags.filter((t) => t !== tagToRemove) })));
  };

  // ---- import ----
  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setMetaData({ title: file.name.replace(/\.[^.]+$/, ""), authors: "", publishedAt: "", abstract: "", arxivUrl: "" });
  };

  const saveImportedPaper = async () => {
    if (!metaData.title.trim() || !metaData.authors.trim() || !metaData.publishedAt || !metaData.abstract.trim()) return;
    try {
      const saved = await importPaperApi({
        title: metaData.title,
        authors: metaData.authors,
        paperAbstract: metaData.abstract,
        publishedAt: metaData.publishedAt,
        arxivUrl: metaData.arxivUrl,
        tags: ["import"].join(","),
      });
      setPapers((prev) => [saved, ...prev]);
      setTotalCount((c) => c + 1);
    } catch (err) {
      alert("导入失败: " + (err.message || "unknown error"));
    }
    setSelectedFile(null);
    setMetaData({ title: "", authors: "", publishedAt: "", abstract: "", arxivUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isMetaValid = metaData.title.trim() && metaData.authors.trim() && metaData.publishedAt && metaData.abstract.trim();

  // ---- star toggle (local-only for now) ----
  const toggleStar = (paperId, e) => {
    e.stopPropagation();
    setPapers((prev) => prev.map((p) => (p.id === paperId ? { ...p, starred: !p.starred } : p)));
  };

  // ---- tag colors ----
  const hashStringToColor = (text, isActive) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) { hash = text.charCodeAt(i) + ((hash << 5) - hash); hash &= hash; }
    const hue = Math.abs(hash) % 360, s = 50;
    return isActive
      ? { backgroundColor: `hsl(${hue},${s}%,90%)`, color: `hsl(${hue},${s}%,25%)`, borderColor: `hsla(${hue},${s}%,55%,0.8)` }
      : { backgroundColor: `hsl(${hue},${s}%,93%)`, color: `hsla(${hue},${s}%,50%,0.65)`, borderColor: `hsla(${hue},${s}%,70%,0.45)` };
  };

  const getTagStyle = (tag, active = false) => (tag === "+" ? {} : hashStringToColor(tag, active));

  // ---- filtered papers ----
  const filteredPapers = (() => {
    let result = papers;
    const tagFilters = [];
    let starFilter = false;
    for (const f of activeFilters) { if (f === "⭐ 星标") starFilter = true; else tagFilters.push(f); }
    if (tagFilters.length) result = result.filter((p) => tagFilters.every((tf) => p.tags.includes(tf)));
    if (starFilter) result = result.filter((p) => p.starred);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q));
    }
    if (dateFrom) result = result.filter((p) => p.publishedAt >= dateFrom);
    if (dateTo) result = result.filter((p) => p.publishedAt <= dateTo);
    return result;
  })();

  // ---- render ----
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">我的文库</h1>
          <p className="page-subtitle">{loading ? "加载中…" : `共收藏 ${totalCount} papers`}</p>
        </div>
        <div className="header-actions">
          <button className="btn-action btn-primary-blue import-button" onClick={openFilePicker}>导入文献</button>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleFileChange} />
        </div>
      </header>

      {/* search bar */}
      <div className="library-search-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" className="search-text-input" placeholder="按标题或作者搜索文献…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && <button className="search-clear-button" onClick={() => setSearchQuery("")}>x</button>}
        </div>
        <div className="date-range-wrapper">
          <label className="date-label">发布时间段</label>
          <div className="date-inputs">
            <input type="date" className="date-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="date-separator">-</span>
            <input type="date" className="date-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {(dateFrom || dateTo) && <button className="search-clear-button date-clear-button" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</button>}
        </div>
      </div>

      {/* tag bar */}
      <div className="library-tag-bar">
        {[{ key: "⭐ 星标", label: "⭐ 星标", filterValue: "⭐ 星标" }].map(({ key, label, filterValue }) => {
          const active = activeFilters.includes(filterValue);
          return <div key={key} className={`tag tag-chip tag-chip-tag tag-chip-action ${active ? "tag-chip-active" : ""}`} style={getTagStyle(filterValue, active)} onClick={() => toggleFilter(filterValue)}><span>{label}</span></div>;
        })}
        {tags.map((tag) => {
          const active = activeFilters.includes(tag);
          return (
            <div key={tag} className={`tag tag-chip tag-chip-tag tag-chip-action ${active ? "tag-chip-active" : ""}`} style={getTagStyle(tag, active)} onClick={() => toggleFilter(tag)}>
              <span>{tag}</span>
              <button className="tag-remove-button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>x</button>
            </div>
          );
        })}
        {addingTag ? (
          <input type="text" className="tag-input" value={newTagText} onChange={(e) => setNewTagText(e.target.value)} onBlur={commitNewTag} onKeyDown={(e) => e.key === "Enter" && commitNewTag()} autoFocus placeholder="新标签" />
        ) : (
          <button className="tag-chip tag-chip-add" onClick={() => setAddingTag(true)}>+</button>
        )}
      </div>

      {/* import modal */}
      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
          <div className="import-meta-card" onClick={(e) => e.stopPropagation()}>
            <div className="import-meta-header">
              <div><div className="import-meta-title">导入文件信息</div><div className="import-meta-subtitle">{selectedFile.name}</div></div>
              <button className="btn-action btn-secondary" onClick={() => setSelectedFile(null)}>取消</button>
            </div>
            <div className="import-meta-form">
              <div className="form-group"><label className="form-label">标题 *</label><input className="form-input" value={metaData.title} onChange={(e) => setMetaData((p) => ({ ...p, title: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">作者 *</label><input className="form-input" value={metaData.authors} onChange={(e) => setMetaData((p) => ({ ...p, authors: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">发布时间 *</label><input className="form-input" type="date" value={metaData.publishedAt} onChange={(e) => setMetaData((p) => ({ ...p, publishedAt: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">摘要 *</label><textarea className="form-input" rows={4} value={metaData.abstract} onChange={(e) => setMetaData((p) => ({ ...p, abstract: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">arXiv 原文链接（可选）</label><input className="form-input" type="url" placeholder="https://arxiv.org/abs/xxxx.xxxxx" value={metaData.arxivUrl} onChange={(e) => setMetaData((p) => ({ ...p, arxivUrl: e.target.value }))} /></div>
              <div className="import-meta-actions"><button className="btn-action btn-primary-blue" onClick={saveImportedPaper} disabled={!isMetaValid}>保存并导入</button></div>
            </div>
          </div>
        </div>
      )}

      {/* paper grid */}
      <div className="library-grid">
        {filteredPapers.map((paper) => (
          <div key={paper.id} className="glass-panel library-card" style={{ padding: "24px 32px", cursor: "pointer" }} onClick={() => navigate(`/paper/${paper.id}`, { state: { ...paper, abstract: paper.paperAbstract } })}>
            <Star size={20} color="#fbbf24" fill={paper.starred ? "#fbbf24" : "none"} className="card-star-corner" onClick={(e) => toggleStar(paper.id, e)} />
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div>
                <div className="card-title-group"><h2 className="card-title" style={{ fontSize: "20px" }}>{paper.title}</h2></div>
                <div className="card-meta" style={{ marginTop: "12px" }}>
                  <span>{paper.authors}</span><span className="meta-dot" /><span>{paper.publishedAt}</span>
                </div>
              </div>
            </div>
            <div className="tag-group" style={{ marginBottom: 12 }}>{(paper.tags || []).map((tag) => <span key={tag} className="tag" style={getTagStyle(tag)}>{tag}</span>)}</div>
            <div className="abstract-text">{paper.paperAbstract || paper.abstract || ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
