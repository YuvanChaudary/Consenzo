import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useSession } from '../context/SessionContext';
import { useParticipant } from '../context/ParticipantContext';

interface LandingProps {
  onNavigate: (route: string, params?: any) => void;
}

interface RecentRoom {
  inviteCode: string;
  groupId: string;
  title: string;
  category: string;
  displayName: string;
  role: string;
  timestamp: string;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const { group, roster, inviteCode } = useSession();
  const { participantId, displayName, role, isAuthenticated, setSession } = useParticipant();
  const [pinInput, setPinInput] = useState('');
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);

  // Track recent rooms in localStorage
  useEffect(() => {
    try {
      if (group && inviteCode && displayName) {
        const saved = localStorage.getItem('consenzo_recent_rooms');
        const list: RecentRoom[] = saved ? JSON.parse(saved) : [];
        const filtered = list.filter(r => r.inviteCode !== inviteCode);
        const updated: RecentRoom[] = [
          {
            inviteCode,
            groupId: group.groupId,
            title: group.title,
            category: group.category,
            displayName,
            role: role || 'PARTICIPANT',
            timestamp: new Date().toISOString()
          },
          ...filtered
        ].slice(0, 5);
        localStorage.setItem('consenzo_recent_rooms', JSON.stringify(updated));
        setRecentRooms(updated);
      } else {
        const saved = localStorage.getItem('consenzo_recent_rooms');
        if (saved) {
          setRecentRooms(JSON.parse(saved));
        }
      }
    } catch {}
  }, [group, inviteCode, displayName, role]);

  const handleJoinByPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim()) {
      onNavigate('join', { inviteCode: pinInput.trim().toUpperCase() });
    }
  };

  const hasActiveSession = Boolean(group || isAuthenticated);

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 3.5rem' }}>
          <div
            className="badge badge-primary"
            style={{ marginBottom: '1.25rem', padding: '0.4rem 1rem' }}
          >
            AWS Serverless & NVIDIA Generative Inference
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em'
            }}
          >
            Everyone can find a product.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              The hard part is getting everyone to agree.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: hasActiveSession ? '2rem' : '2.5rem',
              maxWidth: '700px',
              marginInline: 'auto'
            }}
          >
            Consenzo privately discovers what each family member truly cares about, detects hidden trade-offs, and deterministically ranks products using mathematical fairness.
          </p>

          {/* ACTIVE SESSION CONTINUITY DASHBOARD */}
          {hasActiveSession && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.55)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 2rem',
                marginBottom: '2.5rem',
                boxShadow: '0 12px 36px rgba(124, 58, 237, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                textAlign: 'left',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      Active Decision Room Detected
                    </span>
                    {inviteCode && (
                      <span
                        className="badge badge-primary"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.06em' }}
                      >
                        PIN: {inviteCode}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem' }}>
                    {group?.title || 'Decision Room'}
                  </h3>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Active User: <strong style={{ color: 'var(--primary-light)', fontSize: '0.95rem' }}>{displayName || 'You'}</strong>{' '}
                    {role === 'COORDINATOR' && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(124, 58, 237, 0.35)',
                          color: 'var(--primary-light)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          fontWeight: 700
                        }}
                      >
                        Host
                      </span>
                    )}
                    <span style={{ margin: '0 0.5rem', color: 'var(--border-medium)' }}>•</span>
                    <span>Ready to continue your private conversation or view group consensus.</span>
                  </div>
                </div>

                {/* Primary Quick-Action Buttons */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => onNavigate('interview')}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      boxShadow: '0 4px 20px rgba(124, 58, 237, 0.45)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700
                    }}
                  >
                    <span>💬</span>
                    <span>Continue My Private Chat →</span>
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => onNavigate('lobby')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <span>👥</span>
                    <span>Room Lobby</span>
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => onNavigate('decision')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                      color: '#34d399'
                    }}
                  >
                    <span>⚖️</span>
                    <span>Results</span>
                  </Button>
                </div>
              </div>

              {/* Roster / Existing Room People Switcher */}
              {roster && roster.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                    Existing Room Participants ({roster.length}) — Click to jump into their private chat:
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
                    {roster.map(p => {
                      const isCurrent = p.participantId === participantId;
                      return (
                        <button
                          key={p.participantId}
                          type="button"
                          onClick={() => {
                            setSession({
                              token: sessionStorage.getItem('consenzo_token') || 'token',
                              participantId: p.participantId,
                              displayName: p.displayName,
                              role: p.role,
                              groupId: group?.groupId || '',
                              status: p.status
                            });
                            onNavigate('interview');
                          }}
                          style={{
                            background: isCurrent
                              ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.35) 0%, rgba(91, 33, 182, 0.5) 100%)'
                              : 'rgba(255, 255, 255, 0.06)',
                            border: isCurrent
                              ? '1px solid var(--primary-light)'
                              : '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: 'var(--radius-full)',
                            padding: '0.4rem 0.95rem',
                            fontSize: '0.85rem',
                            color: isCurrent ? '#ffffff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: p.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{p.displayName}</span>
                          {p.role === 'COORDINATOR' && <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>(Host)</span>}
                          {isCurrent ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 700 }}>• Active Chat →</span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>→ Open Chat</span>
                          )}
                        </button>
                      );
                    })}

                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => onNavigate('join', { inviteCode: inviteCode || '' })}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.35rem 0.75rem',
                        border: '1px dashed rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      + Join as New Co-Buyer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '2.5rem'
            }}
          >
            <Button
              size="lg"
              variant={hasActiveSession ? 'secondary' : 'primary'}
              onClick={() => onNavigate('create')}
            >
              + Create New Decision Room
            </Button>

            <form
              onSubmit={handleJoinByPin}
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                placeholder="Enter 6-char PIN (e.g. TV-881A)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value.toUpperCase())}
                maxLength={8}
                style={{
                  width: '210px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textAlign: 'center'
                }}
              />
              <Button size="md" variant="secondary" type="submit">
                Join Room
              </Button>
            </form>

            <Button
              size="lg"
              variant="amazon"
              onClick={() => onNavigate('inventory')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>📦</span>
              <span>Browse Amazon Catalog (115+ Verified Products)</span>
            </Button>
          </div>

          {/* Recent Rooms Quick Resume (when no active room is in session) */}
          {!hasActiveSession && recentRooms.length > 0 && (
            <div
              style={{
                marginBottom: '2.5rem',
                padding: '1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'inline-block',
                maxWidth: '680px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.65rem', fontWeight: 600 }}>
                Recent Decision Sessions On This Device:
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {recentRooms.map(r => (
                  <button
                    key={r.inviteCode}
                    type="button"
                    onClick={() => onNavigate('join', { inviteCode: r.inviteCode })}
                    style={{
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.825rem',
                      color: 'var(--primary-light)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span>💬</span>
                    <span><strong>{r.title}</strong> ({r.inviteCode})</span>
                    <span style={{ opacity: 0.7 }}>• {r.displayName} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              fontSize: '0.85rem',
              color: 'var(--text-tertiary)'
            }}
          >
            <span>🔒 100% Private Interviews</span>
            <span>⚖️ Zero Majority Tyranny</span>
            <span>📦 115+ Amazon Products Analyzed</span>
            <span>⚡ Real-Time Affiliate Outbound</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          <Card variant="glow">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-bg)',
                color: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                marginBottom: '1rem'
              }}
            >
              💬
            </div>
            <h3 style={{ marginBottom: '0.65rem' }}>1-on-1 Private AI Interviews</h3>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.55 }}>
              Each participant chats privately with Consenzo AI. Raw transcripts are permanently isolated and never exposed to the group. Express true budgets, dealbreakers, and priorities without social peer pressure.
            </p>
          </Card>

          <Card variant="glow">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                marginBottom: '1rem'
              }}
            >
              ⚖️
            </div>
            <h3 style={{ marginBottom: '0.65rem' }}>Deterministic Fairness Engine</h3>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.55 }}>
              AI understands people, but deterministic software decides the product. Our 3-tier hybrid fairness engine applies a Maximin quality floor ($u \ge 4.0$) and a dispersion penalty to mathematically prevent dominant member bias.
            </p>
          </Card>

          <Card variant="glow">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warning-bg)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                marginBottom: '1rem'
              }}
            >
              📊
            </div>
            <h3 style={{ marginBottom: '0.65rem' }}>Transparent Pareto Board</h3>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.55 }}>
              The group board never dictates a single forced winner. It presents Top 3 options (Best Consensus, Lowest Conflict, Best Value) with multi-stakeholder satisfaction radar charts and plain-English trade-off explanations.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
