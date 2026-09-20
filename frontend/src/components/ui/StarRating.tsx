import { Star } from 'lucide-react';
import type { CSSProperties } from 'react';

type StarRatingSize = 'sm' | 'md';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: StarRatingSize;
  className?: string;
}

const starSizeMap: Record<StarRatingSize, number> = { sm: 12, md: 14 };
const fontSizeMap: Record<StarRatingSize, string> = { sm: '0.7rem', md: '0.78rem' };

type StarType = 'full' | 'half' | 'empty';

function getStarTypes(rating: number): StarType[] {
  const clamped = Math.max(0, Math.min(5, rating));
  return Array.from({ length: 5 }, (_, i) => {
    const diff = clamped - i;
    if (diff >= 1) return 'full';
    if (diff >= 0.35) return 'half';
    return 'empty';
  });
}

interface StarIconProps {
  type: StarType;
  size: number;
}

function StarIcon({ type, size }: StarIconProps) {
  if (type === 'full') {
    return (
      <Star
        size={size}
        fill="#f59e0b"
        stroke="none"
        style={{ flexShrink: 0, color: '#f59e0b' }}
      />
    );
  }

  if (type === 'half') {
    return (
      <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
        {/* Empty backdrop */}
        <Star
          size={size}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1.5}
          style={{ position: 'absolute', inset: 0 }}
        />
        {/* Half-filled overlay clipped left 50% */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            width: '50%',
            display: 'flex',
          }}
        >
          <Star size={size} fill="#f59e0b" stroke="none" style={{ flexShrink: 0 }} />
        </span>
      </span>
    );
  }

  return (
    <Star
      size={size}
      fill="rgba(255,255,255,0.08)"
      stroke="rgba(255,255,255,0.18)"
      strokeWidth={1.5}
      style={{ flexShrink: 0 }}
    />
  );
}

export function StarRating({ rating, reviewCount, size = 'sm', className }: StarRatingProps) {
  const starSize = starSizeMap[size];
  const fontSize = fontSizeMap[size];
  const types = getStarTypes(rating);

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  };

  const starsStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
  };

  const textStyle: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1,
    letterSpacing: '0.01em',
  };

  const ratingTextStyle: CSSProperties = {
    ...textStyle,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 600,
  };

  return (
    <span style={containerStyle} className={className} aria-label={`${rating} out of 5 stars`}>
      <span style={starsStyle}>
        {types.map((type, i) => (
          <StarIcon key={i} type={type} size={starSize} />
        ))}
      </span>
      <span style={ratingTextStyle}>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span style={textStyle}>({reviewCount.toLocaleString()})</span>
      )}
    </span>
  );
}
