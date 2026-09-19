import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useParticipant } from '../context/ParticipantContext';
import { useSession } from '../context/SessionContext';
import { useChat } from '../hooks/useChat';

interface PrivateInterviewProps {
  onNavigate: (route: string) => void;
}

export const PrivateInterview: React.FC<PrivateInterviewProps> = ({ onNavigate }) => {
  const { participantId, displayName } = useParticipant();
  const { group } = useSession();
  const {
    messages,
    turnCount,
    category: chatCategory,
    isReadyForSummary,
    isLoading,
    activeThinkingStep,
    error,
    sendMessage
  } = useChat(participantId);

  const [inputVal, setInputVal] = useState('');
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCategory = (chatCategory || group?.category || 'smart_tvs').toLowerCase();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, activeThinkingStep]);

  const toggleThinking = (msgId: string) => {
    setExpandedThinking(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      sendMessage(inputVal);
      setInputVal('');
    }
  };

  const handleChipClick = (text: string) => {
    sendMessage(text);
  };

  // Category-specific quick suggestion chips
  const getQuickChips = () => {
    if (activeCategory === 'laptops' || activeCategory.includes('laptop') || activeCategory.includes('workstation')) {
      return [
        '₹70,000 max budget ceiling',
        '16GB RAM for heavy multitasking',
        'Dedicated RTX graphics for gaming/editing',
        'Battery life > 8 hours for travel',
        'Intel Core i7 or AMD Ryzen 7'
      ];
    }
    if (activeCategory === 'soundbars' || activeCategory.includes('soundbar') || activeCategory.includes('audio')) {
      return [
        '₹25,000 max budget ceiling',
        'Dolby Atmos 5.1 spatial surround',
        'Dedicated wireless subwoofer for bass',
        'HDMI eARC & Bluetooth 5.3 connectivity',
        'Crystal clear dialogue mode for movies'
      ];
    }
    if (activeCategory === 'smart_tvs' || activeCategory.includes('tv') || activeCategory.includes('display')) {
      return [
        '₹50,000 max budget ceiling',
        '120Hz native gaming for PS5',
        'OLED or QLED 4K display',
        'Samsung or Sony brand preferred',
        '55 inch screen size is ideal'
      ];
    }
    return [
      'Strict budget ceiling limit',
      'High build quality & durability',
      'Top energy efficiency rating',
      'Reputable brand with warranty'
    ];
  };

  const getPlaceholder = () => {
    if (activeCategory === 'laptops' || activeCategory.includes('laptop')) {
      return 'Tell Consenzo what you need (e.g., RAM, battery, gaming, coding, budget)...';
    }
    if (activeCategory === 'soundbars' || activeCategory.includes('soundbar')) {
      return 'Tell Consenzo your sound priorities (e.g., Dolby Atmos, bass, room acoustics, budget)...';
    }
    if (activeCategory === 'smart_tvs' || activeCategory.includes('tv')) {
      return 'Tell Consenzo what matters in this TV (e.g., 4K, 120Hz, screen size, budget)...';
    }
    return 'Tell Consenzo your key priorities, dealbreakers, and budget limits...';
  };

  const getCategoryBadgeLabel = () => {
    if (activeCategory === 'laptops' || activeCategory.includes('laptop')) return '💻 Laptops & Workstations';
    if (activeCategory === 'soundbars' || activeCategory.includes('soundbar')) return '🔊 Soundbars & Audio';
    if (activeCategory === 'smart_tvs' || activeCategory.includes('tv')) return '📺 Smart TVs & Displays';
    return `✨ ${activeCategory.toUpperCase()}`;
  };

  return (
    <div style={{ padding: '1.5rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Privacy Notice Banner with Glassmorphism */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.06) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div style={{ fontSize: '1.35rem' }}>🔒</div>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--success)' }}>100% Private 1-on-1 Interview:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              Your conversation stays strictly confidential. Other participants will never see this transcript—only your verified constraints and preference weights.
            </span>
          </div>
        </div>

        {/* Chat Window Container with Glassmorphism */}
        <Card
          variant="glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 210px)',
            minHeight: '560px',
            maxHeight: '740px',
            padding: 0,
            overflow: 'hidden',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(124, 58, 237, 0.15)'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(90deg, rgba(22, 30, 48, 0.85) 0%, rgba(15, 22, 36, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#fff',
                  boxShadow: '0 0 14px rgba(168, 85, 247, 0.5)'
                }}
              >
                C
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Consenzo Adaptive Agent</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(124, 58, 237, 0.25)',
                      color: 'var(--primary-light)',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    {getCategoryBadgeLabel()}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  Dynamic human language understanding & live reasoning
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                Turn {turnCount} of 5
              </span>
              <Button size="sm" variant="subtle" onClick={() => onNavigate('lobby')}>
                Back to Lobby
              </Button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem'
            }}
          >
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              const isExpanded = !!expandedThinking[msg.id];
              const hasThinking = !!msg.thinkingSteps?.length || !!msg.thinking;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      marginBottom: '0.3rem',
                      paddingInline: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>{isUser ? displayName : 'Consenzo AI'}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>•</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* AI Agent Thinking Accordion (Collapsible) */}
                  {!isUser && hasThinking && (
                    <div style={{ width: '100%', marginBottom: '0.45rem' }}>
                      <button
                        type="button"
                        onClick={() => toggleThinking(msg.id)}
                        style={{
                          background: 'rgba(124, 58, 237, 0.12)',
                          border: '1px solid rgba(139, 92, 246, 0.25)',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.2rem 0.65rem',
                          fontSize: '0.72rem',
                          color: 'var(--primary-light)',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <span>🧠</span>
                        <span>{isExpanded ? 'Hide Agent Reasoning' : 'View Agent Reasoning'}</span>
                        <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div
                          className="chat-thinking-box"
                          style={{
                            marginTop: '0.4rem',
                            border: '1px solid rgba(168, 85, 247, 0.35)',
                            background: 'rgba(15, 20, 35, 0.85)'
                          }}
                        >
                          <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.35rem' }}>
                            Cognitive Processing Breakdown:
                          </div>
                          {msg.thinkingSteps && msg.thinkingSteps.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {msg.thinkingSteps.map((step, idx) => (
                                <li key={idx} style={{ marginBottom: '0.2rem' }}>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                              {msg.thinking}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    style={{
                      padding: '0.9rem 1.25rem',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                        : 'linear-gradient(135deg, rgba(26, 36, 56, 0.75) 0%, rgba(16, 24, 40, 0.85) 100%)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      color: isUser ? '#ffffff' : 'var(--text-primary)',
                      border: isUser ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isUser
                        ? '0 4px 16px rgba(124, 58, 237, 0.35)'
                        : '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
                      fontSize: '0.925rem',
                      lineHeight: 1.55
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* Active Live "Chat Thinking" Animation Box */}
            {isLoading && (
              <div
                className="chat-thinking-box"
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div className="thinking-pulse" />
                  <div className="thinking-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="thinking-pulse" style={{ animationDelay: '0.4s' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc', marginLeft: '0.2rem' }}>
                    Agent Reasoning & Constraint Analysis
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic', paddingLeft: '0.2rem' }}>
                  "{activeThinkingStep || 'Understanding user intent and checking catalog trade-offs...'}"
                </div>

                <div
                  className="thinking-shimmer"
                  style={{
                    height: '3px',
                    borderRadius: '2px',
                    width: '100%',
                    marginTop: '0.2rem'
                  }}
                />
              </div>
            )}

            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem'
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Review Ready Callout Banner */}
          {isReadyForSummary && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(16, 185, 129, 0.22) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(139, 92, 246, 0.35)',
                padding: '0.9rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                  ✨ Priorities Extracted & Grounded!
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Review and ratify your extracted constraints before locking them into the group consensus model.
                </div>
              </div>
              <Button
                size="md"
                variant="success"
                onClick={() => onNavigate('review')}
                style={{ boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)' }}
              >
                Review My Priorities →
              </Button>
            </div>
          )}

          {/* Category-Adaptive Quick Suggestion Chips */}
          {!isReadyForSummary && (
            <div
              style={{
                padding: '0.55rem 1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                background: 'rgba(10, 14, 24, 0.55)',
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', alignSelf: 'center', fontWeight: 600 }}>
                Ideas:
              </span>
              {getQuickChips().map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={isLoading}
                  style={{
                    background: 'rgba(26, 36, 56, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.28rem 0.8rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary-light)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box with Frosted Glass */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '0.85rem 1.15rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(14, 20, 32, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              gap: '0.75rem'
            }}
          >
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'rgba(7, 10, 18, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-md)'
              }}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !inputVal.trim()}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)'
              }}
            >
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
