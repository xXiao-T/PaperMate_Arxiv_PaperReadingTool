/**
 * QuickActions.jsx — 快捷指令按钮组
 * ────────────────────────────────────────
 * 展示可配置的系统指令按钮（分析、总结、对比等），
 * 点击后触发对应的快捷操作。
 *
 * 指令来自 aiService 中的 COMMAND_PROMPTS 映射表。
 */

import React from 'react';
import { FileSearch, Scale } from 'lucide-react';

/**
 * 指令配置：图标 + 标签 + 是否仅在双列模式显示
 */
const ACTION_DEFS = [
  { command: '/analyze',   label: '分析论文',     icon: FileSearch, dualOnly: false },
  { command: '/compare',   label: '横向对比',     icon: Scale,      dualOnly: true },
];

/**
 * QuickActions
 * @param {Object} props
 * @param {boolean} props.isDualMode    - 是否为双列对比模式
 * @param {boolean} props.isStreaming   - 是否正在流式生成中
 * @param {Function} props.onCommand    - 点击指令回调 (command: string)
 */
export default function QuickActions({ isDualMode = false, isStreaming = false, onCommand }) {
  if (!onCommand) return null;

  const visibleActions = ACTION_DEFS.filter(
    (def) => !def.dualOnly || isDualMode,
  );

  return (
    <div className="qa-row">
      {visibleActions.map((def) => {
        const Icon = def.icon;
        return (
          <button
            key={def.command}
            type="button"
            className="qa-chip"
            onClick={() => onCommand(def.command)}
            disabled={isStreaming}
            title={def.label}
          >
            <Icon size={13} className="qa-chip-icon" />
            <span>{def.label}</span>
          </button>
        );
      })}
    </div>
  );
}