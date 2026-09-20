import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarStatus = 'online' | 'away' | 'done' | 'pending';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  pulse?: boolean;
  className?: string;
}

const sizePx: Record<AvatarSize, number> = { sm: 28, md: 40, lg: 56 };
const fontSizePx: Record<AvatarSize, string> = { sm: '0.6rem', md: '0.85rem', lg: '1.2rem' };
const dotSizePx: Record<AvatarSize, number> = { sm: 7, md: 10, lg: 13 };

const palette = [
  { bg: 'rgba(14,165,233,0.22)', ring: '#0EA5E9' },    // teal
  { bg: 'rgba(139,92,246,0.22)', ring: '#8b5cf6' },    // violet
  { bg: 'rgba(245,158,11,0.22)', ring: '#f59e0b' },    // amber
  { bg: 'rgba(16,185,129,0.22)', ring: '#10b981' },    // emerald
  { bg: 'rgba(244,63,94,0.22)', ring: '#f43f5e' },     // rose
  { bg: 'rgba(56,189,248,0.22)', ring: '#38bdf8' },    // sky
];

const statusColors: Record<AvatarStatus, string> = {
  online: '#22c55e',
  away: '#f59e0b',
  done: '#0EA5E9',
  pending: 'rgba(255,255,255,0.3)',
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % palette.length;
}

export function Avatar({
  name,
  size = 'md',
  status,
  pulse = false,
  className,
}: AvatarProps) {
  const initials = getInitials(name);
  const colorIndex = hashName(name);
  const color = palette[colorIndex];
  const px = sizePx[size];
  const dotPx = dotSizePx[size];

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
  };

  const avatarStyle: CSSProperties = {
    width: px,
    height: px,
    borderRadius: '50%',
    background: color.bg,
    border: `2px solid ${color.ring}40`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSizePx[size],
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    color: '#ffffff',
    letterSpacing: '0.04em',
    userSelect: 'none',
    boxShadow: `0 0 0 1px ${color.ring}20, inset 0 1px 0 rgba(255,255,255,0.15)`,
  };

  const dotStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: dotPx,
    height: dotPx,
    borderRadius: '50%',
    background: status ? statusColors[status] : undefined,
    border: '2px solid var(--canvas, #0A0E17)',
    boxShadow: status ? `0 0 6px ${statusColors[status]}80` : undefined,
  };

  const inner = (
    <div style={containerStyle} className={className}>
      <div style={avatarStyle}>{initials}</div>
      {status && <span style={dotStyle} />}
    </div>
  );

  if (pulse) {
    return (
      <motion.div
        style={{ display: 'inline-flex', position: 'relative' }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.1, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.45, times: [0, 0.65, 1], ease: 'easeOut' }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
}
