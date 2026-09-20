import type { CSSProperties, ReactNode } from 'react';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'ghost';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  accent: {
    background: 'rgba(14,165,233,0.15)',
    border: '1px solid rgba(14,165,233,0.4)',
    color: 'var(--accent, #0EA5E9)',
  },
  success: {
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.35)',
    color: '#22c55e',
  },
  warning: {
    background: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.35)',
    color: '#f59e0b',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: '#ef4444',
  },
  info: {
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.35)',
    color: '#818cf8',
  },
  ghost: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.6)',
  },
};

const dotColors: Record<BadgeVariant, string> = {
  accent: '#0EA5E9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#818cf8',
  ghost: 'rgba(255,255,255,0.4)',
};

const sizeStyles: Record<BadgeSize, CSSProperties> = {
  sm: { fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '0.35rem' },
  md: { fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '0.45rem' },
};

export function Badge({
  variant = 'ghost',
  size = 'md',
  dot = false,
  icon,
  children,
  className,
  style,
}: BadgeProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.02em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span className={className} style={baseStyle}>
      {dot && (
        <span
          style={{
            width: size === 'sm' ? 5 : 6,
            height: size === 'sm' ? 5 : 6,
            borderRadius: '50%',
            background: dotColors[variant],
            flexShrink: 0,
            boxShadow: `0 0 4px ${dotColors[variant]}80`,
          }}
        />
      )}
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      )}
      {children}
    </span>
  );
}
