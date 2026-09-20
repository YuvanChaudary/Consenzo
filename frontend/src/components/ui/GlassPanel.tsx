import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface GlassPanelProps {
  layer?: 'l1' | 'l2';
  padding?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  hover?: boolean;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
}

const glassStyles: Record<'l1' | 'l2', CSSProperties> = {
  l1: {
    background: 'var(--glass-l1-bg, rgba(255,255,255,0.045))',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: '1px solid var(--glass-l1-border, rgba(255,255,255,0.08))',
    boxShadow:
      'inset 0 1px 0 var(--glass-l1-inset, rgba(255,255,255,0.10)), 0 8px 32px rgba(0,0,0,0.45)',
  },
  l2: {
    background: 'var(--glass-l2-bg, rgba(255,255,255,0.07))',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid var(--glass-l2-border, rgba(255,255,255,0.12))',
    boxShadow:
      'inset 0 1px 0 var(--glass-l2-inset, rgba(255,255,255,0.15)), 0 16px 64px rgba(0,0,0,0.6)',
  },
};

export function GlassPanel({
  layer = 'l1',
  padding = '1.5rem',
  className,
  style,
  children,
  hover = false,
  onClick,
}: GlassPanelProps) {
  const base: CSSProperties = {
    ...glassStyles[layer],
    padding,
    borderRadius: '1rem',
    position: 'relative',
    transition: hover ? 'filter 0.2s ease, transform 0.2s ease' : undefined,
    ...style,
  };

  if (hover) {
    return (
      <motion.div
        className={className}
        style={base}
        onClick={onClick}
        whileHover={{ filter: 'brightness(1.08)', y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={className} style={base} onClick={onClick}>
      {children}
    </div>
  );
}
