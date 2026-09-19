import React from 'react';

interface RadarScoreProps {
  scores: Record<string, number>;
  netScore: number;
  fairnessPenalty: number;
}

export const RadarScore: React.FC<RadarScoreProps> = ({ scores, netScore, fairnessPenalty }) => {
  const participants = Object.keys(scores);
  const totalAxes = participants.length;

  // Geometry constants
  const size = 260;
  const center = size / 2;
  const radius = 95;

  // Calculate polygon points
  const points = participants.map((name, index) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const value = Math.max(0, Math.min(10, scores[name])) / 10;
    const r = radius * value;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { name, value: scores[name], x, y, angle };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid concentric circles
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Concentric Circles */}
          {gridLevels.map((lvl, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * lvl}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray={lvl === 1 ? 'none' : '3,3'}
            />
          ))}

          {/* Axes Lines */}
          {participants.map((_, index) => {
            const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.12)"
              />
            );
          })}

          {/* Satisfaction Polygon */}
          <polygon
            points={polygonPath}
            fill="rgba(124, 58, 237, 0.28)"
            stroke="var(--primary-light)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Vertex Points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#ffffff"
              stroke="var(--primary)"
              strokeWidth="2"
            />
          ))}

          {/* Axis Labels */}
          {points.map((p, idx) => {
            const labelDist = radius + 22;
            const lx = center + labelDist * Math.cos(p.angle);
            const ly = center + labelDist * Math.sin(p.angle);
            return (
              <text
                key={idx}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-primary)"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-body)"
              >
                {p.name}
              </text>
            );
          })}
        </svg>

        {/* Center Net Score Badge */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {netScore.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            Score
          </div>
        </div>
      </div>

      {/* Numerical Satisfaction Breakdown Bars */}
      <div style={{ width: '100%', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {participants.map(name => {
          const val = scores[name];
          const pct = Math.min(100, Math.max(0, val * 10));
          const isHigh = val >= 8.5;
          const isMid = val >= 6.0 && val < 8.5;

          return (
            <div key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span style={{ fontWeight: 600 }}>{name}</span>
                <span style={{ fontWeight: 700, color: isHigh ? 'var(--success)' : isMid ? 'var(--warning)' : 'var(--danger)' }}>
                  {val.toFixed(1)} / 10
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: isHigh
                      ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                      : isMid
                      ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                      : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Anti-Tyranny Penalty Pill */}
        {fairnessPenalty !== 0 && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.4rem 0.65rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--border-warning)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--warning)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Anti-Tyranny Dispersion Penalty (λ=0.50):</span>
            <strong>{fairnessPenalty < 0 ? fairnessPenalty.toFixed(2) : `-${fairnessPenalty.toFixed(2)}`}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
