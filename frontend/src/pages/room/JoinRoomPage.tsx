import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';

export function JoinRoomPage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { displayName: authName, setDisplayName } = useAuthStore();

  const [inviteCode, setInviteCode] = useState(code || '');
  const [displayName, setName] = useState(authName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      setInviteCode(code);
    }
  }, [code]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !displayName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.joinGroup({
        inviteCode: inviteCode.trim(),
        displayName: displayName.trim(),
      });

      // Persist the real session token (survives reloads, tab-isolated for multi-user)
      try {
        sessionStorage.setItem('consenzo_token', result.token);
        sessionStorage.setItem(`consenzo_token_${result.groupId}`, result.token);
        localStorage.setItem('consenzo_token', result.token);
        localStorage.setItem(`consenzo_token_${result.groupId}`, result.token);
      } catch {}
      setDisplayName(displayName.trim());

      navigate(`/room/${result.groupId}`);
    } catch (err: any) {
      setError(err.message || 'Could not join the room. Check the invite code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', padding: '3rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 460 }}
      >
        <GlassPanel layer="l1" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(14,165,233,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <KeyRound size={19} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
              Join a Co-Shopping Squad
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 2rem', fontSize: '0.9rem' }}>
            Enter the 6-character invite code shared by your friend or family member.
          </p>

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Invite code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. TV-881A"
                required
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                  color: '#fff', outline: 'none', fontSize: '1.05rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Your name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya"
                required
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                  color: '#fff', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{ padding: '0.7rem 1rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !inviteCode.trim() || !displayName.trim()}
              style={{
                padding: '0.9rem', borderRadius: 10, background: 'var(--accent)', color: '#0A0E17',
                fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: loading || !inviteCode.trim() || !displayName.trim() ? 0.55 : 1,
              }}
            >
              {loading ? 'Joining squad…' : 'Join Squad Cart'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
