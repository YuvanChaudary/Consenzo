import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  const panelStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3rem 2rem',
    borderRadius: '1.25rem',
    background: 'var(--glass-l1-bg, rgba(255,255,255,0.045))',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: '1px solid var(--glass-l1-border, rgba(255,255,255,0.08))',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.45)',
    overflow: 'hidden',
    gap: '1rem',
  };

  const meshStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background:
      'conic-gradient(from 220deg at 50% 120%, rgba(14,165,233,0.06) 0deg, transparent 60deg, transparent 300deg, rgba(139,92,246,0.05) 360deg)',
    pointerEvents: 'none',
  };

  const iconWrapStyle: CSSProperties = {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(14,165,233,0.12)',
    border: '1px solid rgba(14,165,233,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent, #0EA5E9)',
    fontSize: 28,
    boxShadow: '0 0 24px rgba(14,165,233,0.18)',
    flexShrink: 0,
  };

  const titleStyle: CSSProperties = {
    fontFamily: 'Sora, sans-serif',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
    lineHeight: 1.3,
  };

  const descStyle: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: 320,
  };

  const buttonStyle: CSSProperties = {
    marginTop: '0.5rem',
    padding: '0.6rem 1.4rem',
    borderRadius: '0.6rem',
    background: 'var(--accent, #0EA5E9)',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 0 16px rgba(14,165,233,0.35)',
    transition: 'filter 0.18s ease, transform 0.18s ease',
  };

  return (
    <motion.div
      style={panelStyle}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Mesh gradient background */}
      <div style={meshStyle} />

      {/* Icon */}
      {icon && (
        <motion.div
          style={iconWrapStyle}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 22 }}
        >
          {icon}
        </motion.div>
      )}

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={descStyle}>{description}</p>
      </div>

      {/* CTA */}
      {action && (
        <motion.button
          style={buttonStyle}
          onClick={action.onClick}
          whileHover={{ filter: 'brightness(1.15)', scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
