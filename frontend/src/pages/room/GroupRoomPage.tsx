import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  CheckCheck,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { api, getTokenPayload } from '@/services/api';
import { copyToClipboard } from '@/lib/utils';

// ─── WhatsApp Dark palette ────────────────────────────────────────────────────
const WA = {
  bg: '#0B141A',
  panel: '#111B21',
  header: '#202C33',
  incoming: '#202C33',
  outgoing: '#005C4B',
  systemBubble: '#182229',
  text: '#E9EDEF',
  textSecondary: '#8696A0',
  accent: '#00A884',
  tick: '#53BDEB',
  divider: 'rgba(134,150,160,0.15)',
};

interface RosterMember {
  participantId: string;
  displayName: string;
  role: string;
  status: string;
  joinedAt?: string;
}

interface FeedEvent {
  id: string;
  type: string;
  actorId: string;
  text: string;
  meta?: Record<string, any>;
  timestamp: string;
}

interface GroupInfo {
  groupId: string;
  title: string;
  category: string;
  status: string;
  roster: RosterMember[];
}

function initials(name?: string): string {
  if (!name || typeof name !== 'string') return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

const AVATAR_COLORS = ['#6A7175', '#0A7EA4', '#7A5CAB', '#B85C4F', '#2E7D5B', '#A4762E'];
function avatarColor(id?: string): string {
  if (!id || typeof id !== 'string') return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function categoryLabel(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('laptop')) return 'Laptops';
  if (c.includes('soundbar') || c.includes('audio')) return 'Soundbars';
  return 'Smart TVs';
}

export function GroupRoomPage() {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [me, setMe] = useState<{ sub: string; name?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Identify current user from persisted token
  useEffect(() => {
    const payload = getTokenPayload();
    if (payload) {
      setMe({ sub: payload.sub, name: payload.sub });
    }
  }, []);

  // Load group + poll feed events
  const refresh = useCallback(async () => {
    if (!roomId) return;
    try {
      const g = await api.getGroup(roomId);
      setGroup({
        groupId: g.groupId,
        title: g.title,
        category: g.category,
        status: g.status,
        roster: g.roster || [],
      });
      try {
        const evts = await api.getGroupEvents(roomId);
        setEvents(evts);
      } catch { /* feed optional */ }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Room not found or unreachable.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  // Autoscroll on new events
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [events.length, group?.roster.length]);

  const handleCopy = async () => {
    const inviteLink = `${window.location.origin}/join/${roomId}`;
    await copyToClipboard(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmedCount = (group?.roster || []).filter(m => m.status === 'CONFIRMED').length;
  const allConfirmed = (group?.roster || []).length > 0 && confirmedCount === group?.roster.length;

  const runAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      await api.getAnalysis(roomId);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: WA.textSecondary }}>
        Loading room…
      </div>
    );
  }

  if (error && !group) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: WA.textSecondary }}>
        <p style={{ margin: 0 }}>{error}</p>
        <button
          type="button"
          onClick={() => navigate('/room/join')}
          style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: WA.accent, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Join a Room
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '85vh', padding: '1.25rem 1rem', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Chat container (WhatsApp shell) ─────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: WA.panel, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${WA.divider}`, minHeight: '72vh',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          padding: '0.7rem 1rem', background: WA.header, borderBottom: `1px solid ${WA.divider}`,
        }}>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/catalog'))}
            style={{ background: 'none', border: 'none', color: WA.textSecondary, cursor: 'pointer', display: 'flex', padding: 4 }}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: avatarColor(group!.groupId),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
            }}
          >
            {initials(group!.title)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: WA.text, fontWeight: 600, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {group!.title}
            </div>
            <div style={{ color: WA.textSecondary, fontSize: '0.78rem' }}>
              {group!.roster.length} member{group!.roster.length !== 1 ? 's' : ''} · {confirmedCount} ready · {categoryLabel(group!.category)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy invite link"
            style={{ background: 'none', border: 'none', color: WA.textSecondary, cursor: 'pointer', display: 'flex', padding: 6 }}
          >
            {copied ? <Check size={18} color={WA.accent} /> : <Copy size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setShowMembers(s => !s)}
            title="Members"
            style={{ background: 'none', border: 'none', color: WA.textSecondary, cursor: 'pointer', display: 'flex', padding: 6 }}
          >
            <Users size={19} />
          </button>
        </div>

        {/* Member drawer */}
        {showMembers && (
          <div style={{ background: WA.header, padding: '0.85rem 1.1rem', borderBottom: `1px solid ${WA.divider}` }}>
            {group!.roster.map(m => (
              <div key={m.participantId} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.4rem 0' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: avatarColor(m.participantId),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.65rem',
                }}>
                  {initials(m.displayName)}
                </div>
                <span style={{ color: WA.text, fontSize: '0.86rem', flex: 1 }}>
                  {m.displayName}
                  {m.role === 'COORDINATOR' && (
                    <span style={{ color: WA.textSecondary, fontSize: '0.72rem' }}> · admin</span>
                  )}
                  {me?.sub === m.participantId && (
                    <span style={{ color: WA.textSecondary, fontSize: '0.72rem' }}> · you</span>
                  )}
                </span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, padding: '0.12rem 0.5rem', borderRadius: 10,
                  background: m.status === 'CONFIRMED' ? 'rgba(0,168,132,0.18)' : 'rgba(134,150,160,0.15)',
                  color: m.status === 'CONFIRMED' ? WA.accent : WA.textSecondary,
                }}>
                  {m.status === 'CONFIRMED' ? 'READY' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Message feed */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: 'auto', padding: '1.1rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.55rem',
            backgroundImage:
              'radial-gradient(rgba(134,150,160,0.045) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          {/* Encryption-style notice */}
          <div style={{ alignSelf: 'center', maxWidth: '85%', textAlign: 'center' }}>
            <div style={{
              background: WA.systemBubble, color: WA.textSecondary,
              fontSize: '0.74rem', padding: '0.45rem 0.8rem', borderRadius: 8, lineHeight: 1.45,
            }}>
              🔒 Individual shopping chats are private. Only your extracted preferences are shared with the squad — never conversations.
            </div>
          </div>

          {/* Feed events as chat bubbles */}
          {events.map(evt => {
            const isSystem = evt.type === 'ALL_READY' || evt.type === 'ANALYSIS_COMPLETE';
            const actor = group!.roster.find(m => m.participantId === evt.actorId);
            const actorName = actor?.displayName || (evt.actorId === 'system' ? 'Consenzo' : 'Member');

            if (isSystem) {
              return (
                <div key={evt.id} style={{ alignSelf: 'center', maxWidth: '90%', width: '100%', textAlign: 'center' }}>
                  <div style={{
                    background: WA.systemBubble, color: evt.type === 'ANALYSIS_COMPLETE' ? WA.accent : WA.textSecondary,
                    fontSize: '0.78rem', padding: '0.5rem 0.9rem', borderRadius: 8, lineHeight: 1.5,
                    display: 'inline-block', textAlign: 'left',
                  }}>
                    <CheckCheck size={12} color={WA.accent} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                    {evt.text}
                    {evt.type === 'ANALYSIS_COMPLETE' && (
                      <div style={{ marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/room/${roomId}/results`)}
                          style={{
                            background: WA.accent, color: '#fff', border: 'none', borderRadius: 6,
                            padding: '0.35rem 0.8rem', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          View Squad Recommendations →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={evt.id} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: avatarColor(evt.actorId || actorName || 'member'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.55rem', flexShrink: 0,
                }}>
                  {initials(actorName)}
                </div>
                <div style={{
                  background: WA.incoming, borderRadius: '8px 8px 8px 2px',
                  padding: '0.45rem 0.75rem', maxWidth: '72%',
                }}>
                  <div style={{ color: evt.type === 'MEMBER_JOINED' ? '#7FBAAF' : WA.accent, fontSize: '0.72rem', fontWeight: 700, marginBottom: 2 }}>
                    {actorName}
                  </div>
                  <div style={{ color: WA.text, fontSize: '0.86rem', lineHeight: 1.4 }}>
                    {evt.text}
                  </div>
                  <div style={{ color: WA.textSecondary, fontSize: '0.62rem', textAlign: 'right', marginTop: 2 }}>
                    {timeLabel(evt.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div style={{ alignSelf: 'center', color: WA.textSecondary, fontSize: '0.8rem', padding: '1.5rem 0', textAlign: 'center' }}>
              No activity yet — share the invite code so squad members can join.
            </div>
          )}
        </div>

        {/* Action bar (NOT a message input — group consideration only) */}
        <div style={{
          display: 'flex', gap: '0.6rem', padding: '0.7rem 0.9rem',
          background: WA.header, borderTop: `1px solid ${WA.divider}`, flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={() => navigate(`/room/${roomId}/interview`)}
            style={{
              flex: 1, minWidth: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem', borderRadius: 24, background: WA.outgoing, color: '#fff',
              border: 'none', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer',
            }}
          >
            <Sparkles size={16} />
            Set My Shopping Preferences
          </button>
          <button
            type="button"
            onClick={runAnalysis}
            disabled={!allConfirmed || analysisLoading}
            title={allConfirmed ? 'View squad consensus recommendations' : 'Waiting for all members to set their preferences'}
            style={{
              flex: 1, minWidth: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem', borderRadius: 24,
              background: allConfirmed ? WA.accent : 'rgba(134,150,160,0.2)',
              color: allConfirmed ? '#fff' : WA.textSecondary,
              border: 'none', fontWeight: 700, fontSize: '0.86rem',
              cursor: allConfirmed ? 'pointer' : 'not-allowed', opacity: analysisLoading ? 0.6 : 1,
            }}
          >
            <CheckCheck size={16} />
            {analysisLoading ? 'Finding Matches…' : allConfirmed ? 'View Squad Recommendations' : `Squad Ready (${confirmedCount}/${group!.roster.length})`}
          </button>
        </div>
      </div>

      {/* Invite hint strip */}
      <div style={{
        marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.65rem 1rem', borderRadius: 10, background: WA.panel, border: `1px solid ${WA.divider}`,
      }}>
        <LogIn size={15} color={WA.textSecondary} />
        <span style={{ flex: 1, color: WA.textSecondary, fontSize: '0.78rem' }}>
          Invite members with code <strong style={{ color: WA.text, letterSpacing: '0.08em' }}>{roomId.slice(0, 10).toUpperCase()}</strong> or the share link.
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '0.4rem 0.9rem', borderRadius: 16, background: 'rgba(0,168,132,0.15)',
            border: `1px solid ${WA.accent}`, color: WA.accent, fontWeight: 700,
            fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
