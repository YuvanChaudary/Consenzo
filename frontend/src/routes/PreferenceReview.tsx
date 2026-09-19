import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useParticipant } from '../context/ParticipantContext';
import { api } from '../services/api';
import { CanonicalConstraint } from '@shared/types/preferences';

interface PreferenceReviewProps {
  onNavigate: (route: string) => void;
}

export const PreferenceReview: React.FC<PreferenceReviewProps> = ({ onNavigate }) => {
  const { participantId, displayName, updateStatus } = useParticipant();

  const [summaryMarkdown, setSummaryMarkdown] = useState('');
  const [constraints, setConstraints] = useState<CanonicalConstraint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!participantId) return;

    const fetchPrefs = async () => {
      try {
        const data = await api.getPreferences(participantId);
        setSummaryMarkdown(data.summaryMarkdown);
        setConstraints(data.constraints);
      } catch (err: any) {
        setError(err.message || 'Failed to load preference profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrefs();
  }, [participantId]);

  const handleConfirm = async () => {
    if (!participantId) return;
    setIsConfirming(true);
    setError(null);

    try {
      await api.confirmPreferences(participantId);
      updateStatus('CONFIRMED');
      onNavigate('analysis');
    } catch (err: any) {
      setError(err.message || 'Failed to confirm preference profile.');
      setIsConfirming(false);
    }
  };

  const getConstraintBadge = (type: string) => {
    switch (type) {
      case 'DEALBREAKER':
        return <span className="badge badge-danger">Dealbreaker (Veto)</span>;
      case 'HARD_CONSTRAINT':
        return <span className="badge badge-warning">Hard Constraint (Gating)</span>;
      case 'PREFERENCE':
        return <span className="badge badge-primary">Soft Preference</span>;
      case 'NICE_TO_HAVE':
      default:
        return <span className="badge badge-info">Nice to Have</span>;
    }
  };

  const formatConstraintText = (c: CanonicalConstraint) => {
    const attrMap: Record<string, string> = {
      priceInr: 'Max Budget',
      refreshRateHz: 'Refresh Rate',
      screenSizeInches: 'Screen Size',
      hasHdmi21: 'HDMI 2.1 Gaming',
      brand: 'Brand',
      bezelColor: 'Bezel Color'
    };

    const label = attrMap[c.attribute] || c.attribute;
    let opStr = '=';
    if (c.operator === 'LTE') opStr = '≤';
    if (c.operator === 'GTE') opStr = '≥';
    if (c.operator === 'NEQ') opStr = '≠';

    let valStr = String(c.value);
    if (c.attribute === 'priceInr') {
      valStr = `₹${Number(c.value).toLocaleString('en-IN')}`;
    } else if (c.attribute === 'refreshRateHz') {
      valStr = `${c.value}Hz`;
    } else if (c.attribute === 'hasHdmi21') {
      valStr = c.value ? 'Required for 120Hz' : 'Not required';
    }

    return `${label} ${opStr} ${valStr}`;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <p>Synthesizing your verified preference profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <Card variant="glow">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span className="badge badge-success" style={{ marginBottom: '0.65rem' }}>
              Step 3 of 4: Ratification Gate
            </span>
            <h2>Review Your Priorities, {displayName}</h2>
            <p style={{ marginTop: '0.4rem', fontSize: '0.925rem' }}>
              Verify the structured parameters extracted from your private interview before they are locked into the mathematical consensus engine.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem'
              }}
            >
              {error}
            </div>
          )}

          {/* Natural Language Summary Card */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}
            >
              Executive Summary
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line'
              }}
            >
              {summaryMarkdown}
            </div>
          </div>

          {/* Structured Constraint Breakdown */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}
            >
              Extracted Mathematical Constraints ({constraints.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {constraints.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>
                    {formatConstraintText(c)}
                  </span>
                  <div>{getConstraintBadge(c.type)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Negotiable Lock Warning */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid var(--border-warning)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}
          >
            <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>🔒</div>
            <div>
              <strong style={{ color: 'var(--warning)' }}>Pre-Commitment Lock:</strong> Once confirmed, these parameters will be submitted to the fairness engine. The engine will mathematically eliminate any product violating your hard constraints.
            </div>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <Button
              variant="subtle"
              onClick={() => onNavigate('interview')}
              disabled={isConfirming}
            >
              ← Edit in Chat
            </Button>

            <Button
              variant="success"
              size="lg"
              onClick={handleConfirm}
              isLoading={isConfirming}
              style={{ minWidth: '220px' }}
            >
              ✓ Confirm & Lock Priorities
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
