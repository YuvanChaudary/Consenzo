import { type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'range' | 'multiselect' | 'toggle';
  options?: string[];
  min?: number;
  max?: number;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterConfig[];
  activeFilters: Record<string, unknown>;
  onFilterChange: (key: string, value: unknown) => void;
  onClearAll: () => void;
}

// ─── Range slider ────────────────────────────────────────────────────────────

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
}

let rangeInjected = false;
function injectRangeStyles() {
  if (rangeInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    .shippyfy-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #0EA5E9;
      border: 2px solid #0A0E17;
      box-shadow: 0 0 0 2px rgba(14,165,233,0.4);
      cursor: pointer;
    }
    .shippyfy-range::-moz-range-thumb {
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #0EA5E9;
      border: 2px solid #0A0E17;
      cursor: pointer;
    }
    .shippyfy-range::-webkit-slider-runnable-track {
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.1);
    }
    .shippyfy-range { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
  `;
  document.head.appendChild(style);
  rangeInjected = true;
}

function RangeSlider({ min, max, value, onChange }: RangeSliderProps) {
  injectRangeStyles();
  const [lo, hi] = value;

  const pctLo = ((lo - min) / (max - min)) * 100;
  const pctHi = ((hi - min) / (max - min)) * 100;

  const trackStyle: CSSProperties = {
    position: 'relative',
    height: 4,
    borderRadius: 2,
    background: `linear-gradient(to right, rgba(255,255,255,0.1) ${pctLo}%, #0EA5E9 ${pctLo}%, #0EA5E9 ${pctHi}%, rgba(255,255,255,0.1) ${pctHi}%)`,
    marginBottom: '0.5rem',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={labelTextStyle}>${lo.toLocaleString()}</span>
        <span style={labelTextStyle}>${hi.toLocaleString()}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={trackStyle} />
        <input
          type="range"
          className="shippyfy-range"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= hi) onChange([v, hi]);
          }}
          style={{ position: 'absolute', top: '-10px', left: 0, pointerEvents: 'all', zIndex: 2, background: 'transparent' }}
        />
        <input
          type="range"
          className="shippyfy-range"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= lo) onChange([lo, v]);
          }}
          style={{ position: 'absolute', top: '-10px', left: 0, pointerEvents: 'all', zIndex: 2, background: 'transparent' }}
        />
      </div>
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
    >
      <span style={labelTextStyle}>{label}</span>
      <span
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? 'var(--accent, #0EA5E9)' : 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'background 0.2s ease',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            transition: 'left 0.2s ease',
          }}
        />
      </span>
    </label>
  );
}

// ─── Shared styles ───────────────────────────────────────────────────────────

const labelTextStyle: CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.65)',
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.6rem',
};

// ─── Main component ──────────────────────────────────────────────────────────

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FilterDrawerProps) {
  const hasActive = Object.values(activeFilters).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'boolean') return v;
    return false;
  });

  const drawerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 300,
    height: '100dvh',
    zIndex: 200,
    background: 'var(--glass-l1-bg, rgba(255,255,255,0.045))',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    borderRight: '1px solid var(--glass-l1-border, rgba(255,255,255,0.08))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.45)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  };

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    zIndex: 199,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0,
  };

  const titleStyle: CSSProperties = {
    fontFamily: 'Sora, sans-serif',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
  };

  const clearStyle: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.75rem',
    color: hasActive ? 'var(--accent, #0EA5E9)' : 'rgba(255,255,255,0.25)',
    background: 'none',
    border: 'none',
    cursor: hasActive ? 'pointer' : 'default',
    padding: 0,
    transition: 'color 0.15s ease',
  };

  const sectionStyle: CSSProperties = {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  };

  const checkboxRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.4rem',
    cursor: 'pointer',
  };

  const renderFilter = (f: FilterConfig) => {
    if (f.type === 'range') {
      const min = f.min ?? 0;
      const max = f.max ?? 1000;
      const current: [number, number] = (activeFilters[f.key] as [number, number]) ?? [min, max];
      return (
        <div key={f.key} style={sectionStyle}>
          <p style={sectionLabelStyle}>{f.label}</p>
          <RangeSlider
            min={min}
            max={max}
            value={current}
            onChange={(v) => onFilterChange(f.key, v)}
          />
        </div>
      );
    }

    if (f.type === 'multiselect') {
      const selected: string[] = (activeFilters[f.key] as string[]) ?? [];
      return (
        <div key={f.key} style={sectionStyle}>
          <p style={sectionLabelStyle}>{f.label}</p>
          {(f.options ?? []).map((opt) => {
            const checked = selected.includes(opt);
            const toggle = () =>
              onFilterChange(
                f.key,
                checked ? selected.filter((s) => s !== opt) : [...selected, opt],
              );
            return (
              <label key={opt} style={checkboxRowStyle} onClick={toggle}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: checked
                      ? '2px solid var(--accent, #0EA5E9)'
                      : '2px solid rgba(255,255,255,0.2)',
                    background: checked ? 'var(--accent, #0EA5E9)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={labelTextStyle}>{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (f.type === 'toggle') {
      const checked = Boolean(activeFilters[f.key]);
      return (
        <div key={f.key} style={sectionStyle}>
          <ToggleSwitch
            label={f.label}
            checked={checked}
            onChange={(v) => onFilterChange(f.key, v)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            style={backdropStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            style={drawerStyle}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            {/* Header */}
            <div style={headerStyle}>
              <h2 style={titleStyle}>Filters</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button style={clearStyle} onClick={hasActive ? onClearAll : undefined}>
                  Clear all
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.4rem',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter sections */}
            <div style={{ flex: 1 }}>{filters.map(renderFilter)}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
