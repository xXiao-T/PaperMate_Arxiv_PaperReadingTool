import React, { useEffect, useRef, useState } from "react";
import { Star, CheckSquare, Layers, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchPapers, importPaper as importPaperApi, uploadPaperPdf } from "../../api/paperApi";
import { apiFetch } from "../../api/request";
import { getFavorites, toggleStar as toggleStarApi, removeFavorite } from "../../api/libraryApi";
import useTagColors from "../../hooks/useTagColors";
import "./Library.css";

export default function Library() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [metaData, setMetaData] = useState({ title: "", authors: "", publishedAt: "", abstract: "", arxivUrl: "" });
  const fileInputRef = useRef(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirmPending, setDeleteConfirmPending] = useState(false);
  const deleteTimerRef = useRef(null);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ---- fetch 当前用户的收藏文献 ----
  const fetchPapers = async () => {
    try {
      const data = await getFavorites();
      setPapers(data || []);
      setTotalCount((data || []).length);
      const allTags = new Set();
      (data || []).forEach(p => (p.tags || []).forEach(t => allTags.add(t)));
      setTags([...allTags].sort());
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
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
    setTags([...new Set([...tags, n])]);
    return true;
  };

  const commitNewTag = () => {
    if (newTagText.trim()) addTag(newTagText);
    setNewTagText(""); setAddingTag(false);
  };

  const removeTag = async (tagToRemove) => {
    // 从所有论文中删除该标签
    const updated = papers.filter(p => (p.tags || []).includes(tagToRemove));
    for (const p of updated) {
      const newTags = p.tags.filter(t => t !== tagToRemove).join(',');
      try { await apiFetch(`/api/papers/${p.id}/tags`, { method: 'PUT', body: JSON.stringify({ tags: newTags }) }); } catch {}
    }
    setPapers(prev => prev.map(p => ({ ...p, tags: (p.tags || []).filter(t => t !== tagToRemove) })));
    setTags(tags.filter(t => t !== tagToRemove));
    setActiveFilters(prev => prev.filter(f => f !== tagToRemove));
  };

  // ---- import ----
  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("阅读器仅支持 PDF 文件，请选择 .pdf 文献。");
      e.target.value = "";
      return;
    }
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
        tags: "导入文献",
      });
      const pdfPath = await uploadPaperPdf(saved.id, selectedFile);
      setPapers((prev) => [{ ...saved, pdfPath }, ...prev.filter((paper) => paper.id !== saved.id)]);
      setTotalCount((c) => c + 1);
    } catch (err) {
      alert("导入失败: " + (err.message || "unknown error"));
    }
    setSelectedFile(null);
    setMetaData({ title: "", authors: "", publishedAt: "", abstract: "", arxivUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isMetaValid = metaData.title.trim() && metaData.authors.trim() && metaData.publishedAt && metaData.abstract.trim();

  // ---- star toggle ----
  const toggleStar = async (paperId, e) => {
    e.stopPropagation();
    try {
      const updated = await toggleStarApi(paperId);
      setPapers((prev) => prev.map((p) => (p.id === paperId ? { ...p, starred: updated.starred } : p)));
    } catch {
      // 静默失败
    }
  };

  // ---- tag colors (from DB) ----
  const getTagColor = useTagColors();
  const getTagStyle = (tag) => {
    if (tag === '+') return {};
    const c = getTagColor(tag);
    return { backgroundColor: c, color: c.replace('90%', '25%'), borderColor: c.replace('90%', '78%') };
  };

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

  // ---- 多选 ----
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPapers.length) setSelectedIds([]);
    else setSelectedIds(filteredPapers.map(p => p.id));
  };
  const toggleSelectId = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleDeleteSelected = async () => {
    if (!deleteConfirmPending) {
      setDeleteConfirmPending(true);
      deleteTimerRef.current = setTimeout(() => setDeleteConfirmPending(false), 3000);
      return;
    }
    clearTimeout(deleteTimerRef.current);
    setDeleteConfirmPending(false);
    try {
      for (const id of selectedIds) {
        await removeFavorite(id);
      }
      await fetchPapers();
      setSelectedIds([]);
      setMultiSelectMode(false);
    } catch { /* 静默 */ }
  };

  // ---- render ----
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">我的文库</h1>
          <p className="page-subtitle">{loading ? "加载中…" : `共收藏 ${totalCount} papers`}</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn-action btn-multi-select${multiSelectMode ? ' btn-multi-select-active' : ''}`}
            onClick={() => { setMultiSelectMode(prev => !prev); setSelectedIds([]); setDeleteConfirmPending(false); }}
          >
            <CheckSquare size={14} /> {multiSelectMode ? '取消多选' : '多选'}
          </button>
          {multiSelectMode && (
            <>
              <span className={`select-all-icon${selectedIds.length === filteredPapers.length ? ' select-all-icon-active' : ''}`} onClick={toggleSelectAll} title="全选">
                <Layers size={14} />
              </span>
              {selectedIds.length > 0 && (
                <button className={`btn-action btn-delete-selected${deleteConfirmPending ? ' btn-delete-confirm' : ''}`} onClick={handleDeleteSelected}>
                  <Trash2 size={14} /> {deleteConfirmPending ? '确认删除' : '删除'}
                </button>
              )}
            </>
          )}
          <button className="btn-action btn-primary-blue import-button" onClick={openFilePicker}>导入文献</button>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" style={{ display: "none" }} onChange={handleFileChange} />
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
        {filteredPapers.map((paper) => {
          const isSelected = multiSelectMode && selectedIds.includes(paper.id);
          const isDimmed = multiSelectMode && !isSelected;
          return (
          <div key={paper.id}
            className={`glass-panel library-card${isDimmed ? ' task-item-dimmed' : ''}${isSelected ? ' task-item-selected' : ''}`}
            style={{ padding: "24px 32px", cursor: "pointer" }}
            onClick={() => {
              if (multiSelectMode) toggleSelectId(paper.id);
              else navigate(`/paper/${paper.id}`, { state: { paper: { ...paper, abstract: paper.paperAbstract } } });
            }}
          >
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
          );
        })}
      </div>
    </div>
  );
}
