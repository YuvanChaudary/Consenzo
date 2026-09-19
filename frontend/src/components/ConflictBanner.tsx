import React from 'react';

interface ConflictBannerProps {
  conflicts: Array<{
    type: string;
    description: string;
    participantsInvolved: string[];
    conflictingAttributes: string[];
    resolutionStrategy: string;
  }>;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
      {conflicts.map((conflict, idx) => (
        <div
          key={idx}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid var(--border-warning)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                Group Compromise Resolved
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Between {conflict.participantsInvolved.join(' & ')}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.45 }}>
              {conflict.description}
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--warning)' }}>Resolution: </strong>
              {conflict.resolutionStrategy}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
