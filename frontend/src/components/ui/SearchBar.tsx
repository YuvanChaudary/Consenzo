import { useState, useRef, useCallback, type CSSProperties, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles } from 'lucide-react';

type SearchBarSize = 'sm' | 'md' | 'lg';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  aiAssist?: boolean;
  size?: SearchBarSize;
  className?: string;
}

const heightMap: Record<SearchBarSize, number> = { sm: 36, md: 44, lg: 52 };
const fontSizeMap: Record<SearchBarSize, string> = { sm: '0.8rem', md: '0.9rem', lg: '1rem' };
const iconSizeMap: Record<SearchBarSize, number> = { sm: 14, md: 16, lg: 18 };

const aiGradientKeyframes = `
@keyframes shippyfy-ai-border {
  0%, 100% { border-color: rgba(14,165,233,0.5); box-shadow: 0 0 0 3px rgba(14,165,233,0.18), inset 0 1px 0 rgba(255,255,255,0.10); }
  50% { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 0 3px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.10); }
}
`;

let aiStyleInjected = false;
function injectAIStyles() {
  if (aiStyleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = aiGradientKeyframes;
  document.head.appendChild(style);
  aiStyleInjected = true;
}

export function SearchBar({
  placeholder = 'Search products…',
  value,
  onChange,
  onSearch,
  aiAssist = false,
  size = 'md',
  className,
}: SearchBarProps) {
  injectAIStyles();

  const [focused, setFocused] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const height = heightMap[size];
  const fontSize = fontSizeMap[size];
  const iconSize = iconSizeMap[size];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSearch?.();
      if (e.key === 'Escape') {
        onChange('');
        inputRef.current?.blur();
      }
    },
    [onSearch, onChange],
  );

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height,
    borderRadius: height / 2,
    background: 'var(--glass-l1-bg, rgba(255,255,255,0.045))',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: focused
      ? '1px solid rgba(14,165,233,0.55)'
      : '1px solid var(--glass-l1-border, rgba(255,255,255,0.08))',
    boxShadow: focused
      ? aiMode && aiAssist
        ? undefined
        : '0 0 0 3px rgba(14,165,233,0.25), inset 0 1px 0 rgba(255,255,255,0.10)'
      : 'inset 0 1px 0 rgba(255,255,255,0.10)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    animation: focused && aiMode && aiAssist ? 'shippyfy-ai-border 2s ease-in-out infinite' : undefined,
    overflow: 'hidden',
  };

  const leftGap = iconSize + 8 + (size === 'sm' ? 16 : size === 'md' ? 20 : 24);
  const rightGap =
    (value ? iconSize + 8 : 0) +
    (aiAssist ? iconSize + 8 : 0) +
    (size === 'sm' ? 16 : size === 'md' ? 20 : 24);

  const inputStyle: CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize,
    fontFamily: 'Inter, sans-serif',
    paddingLeft: leftGap,
    paddingRight: rightGap,
    height: '100%',
    caretColor: 'var(--accent, #0EA5E9)',
  };

  const iconBase: CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: focused ? 'var(--accent, #0EA5E9)' : 'rgba(255,255,255,0.4)',
    transition: 'color 0.2s ease',
    flexShrink: 0,
  };

  const leftOffset = size === 'sm' ? 10 : size === 'md' ? 14 : 16;

  let rightOffset = size === 'sm' ? 8 : size === 'md' ? 10 : 12;
  const rightIcons: React.ReactNode[] = [];

  if (aiAssist) {
    rightIcons.push(
      <motion.button
        key="ai"
        type="button"
        onClick={() => setAiMode((m) => !m)}
        style={{
          ...iconBase,
          right: rightOffset,
          color: aiMode ? 'var(--accent, #0EA5E9)' : 'rgba(255,255,255,0.35)',
          background: aiMode ? 'rgba(14,165,233,0.12)' : 'transparent',
          borderRadius: '50%',
          width: iconSize + 8,
          height: iconSize + 8,
          border: aiMode ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent',
          cursor: 'pointer',
          padding: 0,
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        title={aiMode ? 'Disable AI assist' : 'Enable AI assist'}
      >
        <Sparkles size={iconSize - 2} />
      </motion.button>,
    );
    rightOffset += iconSize + 8 + 4;
  }

  if (value) {
    rightIcons.push(
      <motion.button
        key="clear"
        type="button"
        onClick={() => onChange('')}
        style={{
          ...iconBase,
          right: rightOffset,
          color: 'rgba(255,255,255,0.35)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: iconSize + 4,
          height: iconSize + 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.15 }}
        whileHover={{ color: '#ffffff' }}
      >
        <X size={iconSize - 2} />
      </motion.button>,
    );
  }

  return (
    <div style={wrapperStyle} className={className}>
      {/* Left search icon */}
      <button
        type="button"
        onClick={onSearch}
        style={{
          ...iconBase,
          left: leftOffset,
          background: 'transparent',
          border: 'none',
          cursor: onSearch ? 'pointer' : 'default',
          padding: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: iconSize + 4,
          height: iconSize + 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Search size={iconSize} />
      </button>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={
          aiMode && aiAssist ? "Describe what you're looking for…" : placeholder
        }
        style={inputStyle}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Right icons */}
      <AnimatePresence>{rightIcons}</AnimatePresence>
    </div>
  );
}
