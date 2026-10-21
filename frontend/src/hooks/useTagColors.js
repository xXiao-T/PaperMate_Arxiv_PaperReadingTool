import { useState, useEffect } from 'react';
import { apiFetch } from '../api/request';

/** 标签名 → 颜色 映射 */
let cachedMap = null;

export default function useTagColors() {
  const [colorMap, setColorMap] = useState(cachedMap || {});

  useEffect(() => {
    if (cachedMap) { setColorMap(cachedMap); return; }
    apiFetch('/api/tags')
      .then(tags => {
        const map = {};
        (tags || []).forEach(t => { map[t.name] = t.color; });
        cachedMap = map;
        setColorMap(map);
      })
      .catch(() => setColorMap({}));
  }, []);

  return function getColor(name) {
    if (!name) return 'hsl(0, 0%, 90%)';
    // 数据库有 → 直接用
    if (colorMap[name]) return colorMap[name];
    // 数据库没有 → 本地哈希补算（算法与后端 hashToColor 一致）
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 60%, 90%)`;
  };
}
