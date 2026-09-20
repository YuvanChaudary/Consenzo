import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tv2,
  Laptop,
  Speaker,
  ArrowRight,
  Copy,
  Check,
  Users,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import { copyToClipboard } from '@/lib/utils';

const CATEGORIES = [
  { id: 'smart_tvs', name: 'Smart TVs', icon: Tv2, desc: 'OLED, 4K UHD, Gaming Displays' },
  { id: 'laptops', name: 'Laptops', icon: Laptop, desc: 'Dev, Gaming, Creative Work' },
  { id: 'soundbars', name: 'Soundbars', icon: Speaker, desc: 'Dolby Atmos, Home Cinema' },
];

interface CreatedRoom {
  groupId: string;
  title: string;
  category: string;
  inviteCode: string;
  inviteUrl: string;
  participantId: string;
}

export function CreateRoomPage() {
  const navigate = useNavigate();
  const { displayName: authName, setDisplayName } = useAuthStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('smart_tvs');
  const [creatorName, setCreatorName] = useState(authName || '');
  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !creatorName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.createGroup({
        title: title.trim(),
        category,
        creatorDisplayName: creatorName.trim(),
      });

      // Persist the real session token (survives reloads, tab-isolated for multi-user)
      try {
        sessionStorage.setItem('consenzo_token', result.token);
        sessionStorage.setItem(`consenzo_token_${result.groupId}`, result.token);
        localStorage.setItem('consenzo_token', result.token);
        localStorage.setItem(`consenzo_token_${result.groupId}`, result.token);
      } catch {}
      setDisplayName(creatorName.trim());

      setCreatedRoom({
        groupId: result.groupId,
        title: result.title,
        category: result.category,
        inviteCode: result.inviteCode,
        inviteUrl: result.inviteUrl,
        participantId: result.creator.participantId,
      });
    } catch (err: any) {
      setError(err.message || 'Could not create the room. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdRoom) return;
    await copyToClipboard(createdRoom.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '90vh', padding: '3rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 580 }}
      >
        <GlassPanel layer="l1" style={{ padding: '2.5rem' }}>
          {!createdRoom ? (
            <>
              <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.9rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
                Start a Co-Shopping Squad
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 2rem', fontSize: '0.92rem' }}>
                Shop together with friends or family. Everyone sets their budget and must-haves, and Shippyfy finds the single product everyone loves.
              </p>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                    Squad / Group Buy Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Living Room TV Squad, Flatmates Audio Setup"
                    required
                    style={{
                      width: '100%', padding: '0.8rem 1rem', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                      color: '#fff', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                    Your name
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                    style={{
                      width: '100%', padding: '0.8rem 1rem', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                      color: '#fff', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                    Select Category to Co-Shop
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const active = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left',
                            padding: '0.85rem 1rem', borderRadius: 12, cursor: 'pointer',
                            background: active ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${active ? 'var(--accent)' : 'var(--border-subtle)'}`,
                            color: '#fff', transition: 'all 0.15s',
                          }}
                        >
                          <Icon size={20} color={active ? 'var(--accent)' : 'var(--text-tertiary)'} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{cat.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{cat.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div style={{ padding: '0.7rem 1rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !title.trim() || !creatorName.trim()}
                  style={{
                    padding: '0.9rem', borderRadius: 10, background: 'var(--accent)', color: '#0A0E17',
                    fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    opacity: loading || !title.trim() || !creatorName.trim() ? 0.55 : 1,
                  }}
                >
                  {loading ? 'Creating squad…' : 'Start Co-Shopping Squad'}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={22} color="var(--success)" />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: '#fff' }}>Squad Ready!</h1>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{createdRoom.title}</span>
                </div>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: 12, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.25)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '0.4rem' }}>
                  INVITE CODE
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                  {createdRoom.inviteCode}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', wordBreak: 'break-all', marginBottom: '0.9rem' }}>
                  Share the code or this link: {createdRoom.inviteUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    padding: '0.6rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)', color: '#fff', fontWeight: 600,
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem',
                  }}
                >
                  {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Invite Link'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/room/${createdRoom.groupId}`)}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: 10, background: 'var(--accent)', color: '#0A0E17',
                  fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <Users size={17} />
                Enter Squad Lounge
                <ArrowRight size={17} />
              </button>
            </>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
}
