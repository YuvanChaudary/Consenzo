import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';
import { useParticipant } from '../context/ParticipantContext';

interface JoinGroupProps {
  onNavigate: (route: string) => void;
  initialInviteCode?: string;
}

export const JoinGroup: React.FC<JoinGroupProps> = ({ onNavigate, initialInviteCode = '' }) => {
  const { setGroupData } = useSession();
  const { setSession } = useParticipant();

  const [inviteCode, setInviteCode] = useState(initialInviteCode || 'TV-881A');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !displayName.trim()) {
      setError('Please provide both the room PIN and your name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.joinGroup({
        inviteCode: inviteCode.trim().toUpperCase(),
        displayName: displayName.trim()
      });

      // Save participant session
      setSession({
        token: result.token,
        participantId: result.participantId,
        displayName: result.displayName,
        role: result.role,
        groupId: result.groupId,
        status: 'JOINED'
      });

      // Fetch latest group details
      const groupDetails = await api.getGroup(result.groupId);
      setGroupData({
        group: {
          groupId: groupDetails.groupId,
          title: groupDetails.title,
          category: groupDetails.category,
          status: groupDetails.status,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        },
        roster: groupDetails.roster,
        inviteCode: inviteCode.trim().toUpperCase(),
        targetParticipantCount: groupDetails.targetParticipantCount
      });

      // Jump directly into the private chat interview
      onNavigate('interview');
    } catch (err: any) {
      setError(err.message || 'Unable to join group room. Please check the PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const { group, roster } = useSession();

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <Card variant="glow">
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>
              Group Invitation
            </span>
            <h2>Join Decision Room</h2>
            <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Enter the room PIN shared by your organizer to start or resume your private chat.
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

          {/* Quick resume existing participants if in this room */}
          {roster && roster.length > 0 && (
            <div
              style={{
                background: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  marginBottom: '0.65rem'
                }}
              >
                Already in this room? Resume your private chat:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {roster.map(p => (
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.6rem 0.85rem',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--primary-light)';
                      e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: p.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'
                        }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.displayName}</span>
                      {p.role === 'COORDINATOR' && (
                        <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>(Host)</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      Continue Chat →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              marginBottom: '1rem',
              position: 'relative'
            }}
          >
            <span>Or join as a new co-buyer:</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Room PIN (6 to 8 characters)
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. TV-881A"
                required
                maxLength={8}
                style={{
                  width: '100%',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Your Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Son, Mom, Maya"
                required
                style={{ width: '100%' }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Join Room & Roster
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
