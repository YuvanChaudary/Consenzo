import React from 'react';
import { useSession } from '../context/SessionContext';
import { useParticipant } from '../context/ParticipantContext';
import { Button } from './Button';

interface HeaderProps {
  onNavigate: (route: string) => void;
  activeRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeRoute }) => {
  const { group, inviteCode, clearGroup } = useSession();
  const { displayName, role, clearSession, isAuthenticated } = useParticipant();

  const handleExit = () => {
    if (window.confirm('Are you sure you want to leave this session?')) {
      clearSession();
      clearGroup();
      onNavigate('landing');
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.85rem 1.5rem'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand */}
        <div
          onClick={() => onNavigate('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 0 16px var(--primary-glow)'
            }}
          >
            C
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.35rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #ffffff, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Consenzo
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-tertiary)',
                marginTop: '-3px'
              }}
            >
              Consensus Engine
            </span>
          </div>
        </div>

        {/* Center / Session Info */}
        {group && (
          <div
            onClick={() => onNavigate('lobby')}
            title="Click to view Room Lobby"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {group.title}
              </span>
              {inviteCode && (
                <span
                  className="badge badge-primary"
                  style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', marginTop: '2px' }}
                >
                  PIN: {inviteCode}
                </span>
              )}
            </div>
          </div>
        )}

        {/* User Status / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isAuthenticated && (
            <>
              <Button
                size="sm"
                variant={activeRoute === 'interview' ? 'primary' : 'secondary'}
                onClick={() => onNavigate('interview')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: activeRoute === 'interview'
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                    : 'rgba(124, 58, 237, 0.15)',
                  borderColor: 'rgba(139, 92, 246, 0.4)',
                  color: activeRoute === 'interview' ? '#ffffff' : 'var(--primary-light)',
                  boxShadow: activeRoute === 'interview' ? '0 0 12px rgba(124, 58, 237, 0.4)' : 'none'
                }}
              >
                <span>💬</span>
                <span>My Chat</span>
              </Button>

              <Button
                size="sm"
                variant={activeRoute === 'lobby' ? 'primary' : 'secondary'}
                onClick={() => onNavigate('lobby')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>👥</span>
                <span>Lobby</span>
              </Button>

              <Button
                size="sm"
                variant={activeRoute === 'decision' ? 'primary' : 'secondary'}
                onClick={() => onNavigate('decision')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  color: activeRoute === 'decision' ? '#ffffff' : '#34d399'
                }}
              >
                <span>⚖️</span>
                <span>Results</span>
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant={activeRoute === 'inventory' ? 'primary' : 'secondary'}
            onClick={() => onNavigate('inventory')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: activeRoute === 'inventory' ? 'var(--primary)' : 'rgba(255, 153, 0, 0.4)',
              color: activeRoute === 'inventory' ? '#ffffff' : '#ff9900'
            }}
          >
            <span>📦</span>
            <span>Amazon Inventory</span>
          </Button>

          {isAuthenticated ? (
            <>
              <div
                onClick={() => onNavigate('interview')}
                title="Click to open your private chat"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-elevated)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: role === 'COORDINATOR' ? 'var(--primary)' : 'var(--info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#fff'
                  }}
                >
                  {displayName?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{displayName}</span>
                {role === 'COORDINATOR' && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(124, 58, 237, 0.3)',
                      color: 'var(--primary-light)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Host
                  </span>
                )}
              </div>
              <Button size="sm" variant="subtle" onClick={handleExit}>
                Exit
              </Button>
            </>
          ) : (
            activeRoute !== 'landing' && (
              <Button size="sm" variant="secondary" onClick={() => onNavigate('landing')}>
                Home
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
