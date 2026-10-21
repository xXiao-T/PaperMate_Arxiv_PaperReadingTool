import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * MathText — 渲染含 LaTeX 公式的文本。
 * 将 `$...$` 和 `$$...$$` 渲染为数学公式，其余文本原样显示。
 */
export default function MathText({ text }) {
  if (!text) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
    >
      {text}
    </ReactMarkdown>
  );
}
