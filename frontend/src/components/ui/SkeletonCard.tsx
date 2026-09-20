import type { CSSProperties } from 'react';

interface SkeletonCardProps {
  count?: number;
}

const shimmerKeyframes = `
@keyframes shippyfy-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

let injected = false;
function injectShimmerStyles() {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
  injected = true;
}

const shimmerStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
  backgroundSize: '800px 100%',
  backgroundRepeat: 'no-repeat',
  animation: 'shippyfy-shimmer 1.6s ease-in-out infinite',
};

const cardStyle: CSSProperties = {
  width: 280,
  borderRadius: '1rem',
  background: 'rgba(13,18,32,0.92)',
  border: '1px solid rgba(255,255,255,0.06)',
  overflow: 'hidden',
  flexShrink: 0,
};

const imageAreaStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '1.5 / 1',
  background: 'rgba(255,255,255,0.04)',
  position: 'relative',
  overflow: 'hidden',
};

const bodyStyle: CSSProperties = {
  padding: '0.875rem 1rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const lineBase: CSSProperties = {
  borderRadius: '0.35rem',
  background: 'rgba(255,255,255,0.05)',
  position: 'relative',
  overflow: 'hidden',
};

function SingleSkeleton() {
  injectShimmerStyles();

  return (
    <div style={cardStyle}>
      {/* Image area */}
      <div style={imageAreaStyle}>
        <div style={{ ...shimmerStyle, position: 'absolute', inset: 0 }} />
      </div>

      {/* Body */}
      <div style={bodyStyle}>
        {/* Title line */}
        <div style={{ ...lineBase, height: 16, width: '78%', position: 'relative', overflow: 'hidden' }}>
          <div style={{ ...shimmerStyle, position: 'absolute', inset: 0 }} />
        </div>
        {/* Sub-line */}
        <div style={{ ...lineBase, height: 12, width: '45%', position: 'relative', overflow: 'hidden' }}>
          <div style={{ ...shimmerStyle, position: 'absolute', inset: 0 }} />
        </div>

        {/* Price + button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <div style={{ ...lineBase, height: 20, width: '30%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ ...shimmerStyle, position: 'absolute', inset: 0 }} />
          </div>
          <div style={{ ...lineBase, height: 32, width: '38%', borderRadius: '0.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ ...shimmerStyle, position: 'absolute', inset: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  if (count === 1) return <SingleSkeleton />;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </>
  );
}
