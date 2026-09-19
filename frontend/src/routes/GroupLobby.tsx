import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useSession } from '../context/SessionContext';
import { useParticipant } from '../context/ParticipantContext';
import { useGroupPolling } from '../hooks/useGroupPolling';
import { ParticipantStatus } from '@shared/types/session';

interface GroupLobbyProps {
  onNavigate: (route: string) => void;
}

export const GroupLobby: React.FC<GroupLobbyProps> = ({ onNavigate }) => {
  const { group, roster, inviteCode, inviteUrl, setGroupData } = useSession();
  const { participantId, status: myStatus, setSession } = useParticipant();

  const [copied, setCopied] = useState(false);

  // Poll for roster updates every 3 seconds
  useGroupPolling(group?.groupId || null, 3000);

  const shareableUrl = typeof window !== 'undefined' && inviteCode
    ? `${window.location.origin}/join/${inviteCode}`
    : (inviteUrl || '');

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareableUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard write error:', e);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareableUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {}
    }
  };

  const handleAddCoBuyers = () => {
    const coBuyer1 = {
      participantId: 'usr_sim_priya',
      displayName: 'Priya (Design & Budget)',
      role: 'PARTICIPANT' as const,
      status: 'CONFIRMED' as const,
      joinedAt: new Date().toISOString()
    };
    const coBuyer2 = {
      participantId: 'usr_sim_alex',
      displayName: 'Alex (Performance & Specs)',
      role: 'PARTICIPANT' as const,
      status: 'CONFIRMED' as const,
      joinedAt: new Date().toISOString()
    };

    setGroupData({
      group: group || {
        groupId: 'grp_default',
        title: 'Decision Room',
        category: 'smart_tvs',
        status: 'INTERVIEWING',
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString()
      },
      inviteCode: inviteCode || undefined,
      inviteUrl: inviteUrl || undefined,
      targetParticipantCount: 4,
      roster: [
        ...roster.filter(p => p.participantId !== coBuyer1.participantId && p.participantId !== coBuyer2.participantId),
        coBuyer1,
        coBuyer2
      ]
    });
  };

  const getStatusBadge = (status: ParticipantStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success">✓ Priorities Confirmed</span>;
      case 'INTERVIEWING':
        return <span className="badge badge-warning">● Chatting with AI</span>;
      case 'VOTED':
        return <span className="badge badge-success">★ Voted</span>;
      case 'JOINED':
      default:
        return <span className="badge badge-info">Waiting to Chat</span>;
    }
  };

  const confirmedCount = roster.filter(p => p.status === 'CONFIRMED' || p.status === 'VOTED').length;

  const myRecord = roster.find(p => p.participantId === participantId);
  const isMyProfileConfirmed = myRecord?.status === 'CONFIRMED' || myStatus === 'CONFIRMED';

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Lobby Header Card */}
        <Card variant="glow" style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-primary">Room Open</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  {group?.category ? group.category.replace('_', ' ').toUpperCase() : 'GENERAL'} • {roster.length} Joined
                </span>
              </div>
              <h2>{group?.title || 'Decision Room'}</h2>
            </div>

            {inviteCode && (
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1.25rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Room Join PIN
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: 'var(--primary-light)'
                  }}
                >
                  {inviteCode}
                </div>
              </div>
            )}
          </div>

          {/* Share Link Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              gap: '1rem'
            }}
          >
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Invite Link: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {shareableUrl}
              </span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleCopyLink}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </Button>
          </div>
        </Card>

        {/* Participant Roster Grid */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div>
              <h3>Connected Participants ({roster.length})</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {confirmedCount} of {roster.length} confirmed priorities
              </span>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddCoBuyers}
              style={{
                background: 'rgba(124, 58, 237, 0.15)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                color: 'var(--primary-light)'
              }}
            >
              👥 + Add Co-Buyers (Simulate Group)
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {roster.map(p => {
              const isMe = p.participantId === participantId;
              return (
                <div
                  key={p.participantId}
                  style={{
                    background: isMe ? 'var(--bg-card-active)' : 'var(--bg-card)',
                    border: isMe ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: p.role === 'COORDINATOR' ? 'var(--primary)' : '#0ea5e9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#fff'
                        }}
                      >
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {p.displayName} {isMe && <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem' }}>(You)</span>}
                        </div>
                        {p.role === 'COORDINATOR' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Room Host</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(p.status)}</div>

                  <Button
                    size="sm"
                    variant={isMe ? 'primary' : 'subtle'}
                    onClick={() => {
                      if (!isMe) {
                        setSession({
                          token: sessionStorage.getItem('consenzo_token') || 'token',
                          participantId: p.participantId,
                          displayName: p.displayName,
                          role: p.role,
                          groupId: group?.groupId || '',
                          status: p.status
                        });
                      }
                      onNavigate('interview');
                    }}
                    style={{
                      width: '100%',
                      fontSize: '0.8rem',
                      padding: '0.35rem 0.6rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      marginTop: '0.25rem'
                    }}
                  >
                    <span>💬</span>
                    <span>{isMe ? 'Continue My Chat →' : `Chat as ${p.displayName}`}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel */}
        <Card variant="glass" style={{ textAlign: 'center', padding: '2rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Multi-User Decision Processing</h4>
          <p style={{ maxWidth: '540px', margin: '0 auto 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Consenzo processes every participant's natural language input, converts constraints into utility curves, and determines the mathematically optimal group consensus pick.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {!isMyProfileConfirmed ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('interview')}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)'
                }}
              >
                💬 Start My Private Interview
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate('review')}
              >
                Review My Priorities
              </Button>
            )}

            {/* Calculate Consensus & View Finalized Recommendation Board */}
            <Button
              variant="success"
              size="lg"
              onClick={() => onNavigate('analysis')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
              }}
            >
              ⚖️ Process Multi-User Consensus & View Recommendations →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
