import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Brain,
  Shield,
  SlidersHorizontal,
  ArrowLeft,
  Trash2,
  Edit2,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { api, getTokenPayload } from '@/services/api';

// ─── WhatsApp Dark palette (matches GroupRoomPage) ───────────────────────────
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
  divider: 'rgba(134,150,160,0.15)',
};

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  thinking?: string;
}

interface Constraint {
  attribute: string;
  operator: string;
  value: string | number | boolean;
  type: string;
  weight?: number;
}

const QUICK_PROMPTS: Record<string, string[]> = {
  smart_tvs: [
    'Under 45,000 strictly, mostly movies in a bright room',
    'Need 120Hz native for PS5 gaming, budget up to 60k',
    'Want OLED picture quality',
    'Prefer Samsung or LG with a big screen',
  ],
  laptops: [
    'I code all day, need 16GB RAM under 70k',
    'Gaming laptop with RTX graphics, budget 90k',
    'Lightweight with all-day battery for travel',
    'Mostly browsing and office work, cheap is fine',
  ],
  soundbars: [
    'Dolby Atmos with deep bass under 30k',
    'Wireless subwoofer is a must for movies',
    'Clear dialogue for news and sports',
    'HDMI eARC connection, budget around 20k',
  ],
};

function attrLabel(attr: string): string {
  const map: Record<string, string> = {
    priceInr: 'Budget', ramGb: 'RAM', refreshRateHz: 'Refresh Rate', panelType: 'Panel',
    screenSizeInches: 'Screen Size', brand: 'Brand', hasHdmi21: 'HDMI 2.1',
    gamingCapable: 'Gaming GPU', batteryLifeHours: 'Battery', dolbyAtmos: 'Dolby Atmos',
    wirelessSubwoofer: 'Subwoofer', hasHdmiEarc: 'HDMI eARC', storageGb: 'Storage',
  };
  return map[attr] || attr.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function formatConstraint(c: Constraint): string {
  const op = c.operator === 'GTE' ? '\u2265' : c.operator === 'LTE' ? '\u2264' : '=';
  if (typeof c.value === 'number' && (c.attribute === 'priceInr')) {
    return `${op} Rs.${c.value.toLocaleString('en-IN')}`;
  }
  if (typeof c.value === 'boolean') return c.value ? 'Yes' : 'No';
  return `${op} ${String(c.value)}`;
}

const CATEGORY_ATTRS: Record<string, Array<{ key: string; label: string; defaultOp: string; type: 'number' | 'text' | 'select'; options?: string[] }>> = {
  smart_tvs: [
    { key: 'priceInr', label: 'Budget Ceiling (INR)', defaultOp: 'LTE', type: 'number' },
    { key: 'brand', label: 'Brand', defaultOp: 'EQ', type: 'select', options: ['Samsung', 'LG', 'Sony', 'Xiaomi', 'TCL', 'OnePlus'] },
    { key: 'screenSizeInches', label: 'Screen Size (inches)', defaultOp: 'GTE', type: 'number' },
    { key: 'refreshRateHz', label: 'Refresh Rate (Hz)', defaultOp: 'GTE', type: 'select', options: ['60', '120', '144'] },
    { key: 'panelType', label: 'Panel Type', defaultOp: 'EQ', type: 'select', options: ['OLED', 'QLED', 'LED', 'Mini-LED'] },
    { key: 'hasHdmi21', label: 'HDMI 2.1 (PS5 Gaming)', defaultOp: 'EQ', type: 'select', options: ['true', 'false'] },
    { key: 'resolution', label: 'Resolution', defaultOp: 'EQ', type: 'select', options: ['4K', '8K', 'FHD'] },
  ],
  laptops: [
    { key: 'priceInr', label: 'Budget Ceiling (INR)', defaultOp: 'LTE', type: 'number' },
    { key: 'brand', label: 'Brand', defaultOp: 'EQ', type: 'select', options: ['Apple', 'Dell', 'ASUS', 'HP', 'Lenovo'] },
    { key: 'ramGb', label: 'RAM (GB)', defaultOp: 'GTE', type: 'select', options: ['8', '16', '32', '64'] },
    { key: 'storageGb', label: 'Storage (GB)', defaultOp: 'GTE', type: 'select', options: ['256', '512', '1024', '2048'] },
    { key: 'batteryHours', label: 'Battery Life (Hours)', defaultOp: 'GTE', type: 'number' },
  ],
  soundbars: [
    { key: 'priceInr', label: 'Budget Ceiling (INR)', defaultOp: 'LTE', type: 'number' },
    { key: 'brand', label: 'Brand', defaultOp: 'EQ', type: 'select', options: ['Sony', 'Samsung', 'JBL', 'Bose'] },
    { key: 'dolbyAtmos', label: 'Dolby Atmos', defaultOp: 'EQ', type: 'select', options: ['true', 'false'] },
    { key: 'wirelessSubwoofer', label: 'Wireless Subwoofer', defaultOp: 'EQ', type: 'select', options: ['true', 'false'] },
    { key: 'totalPowerWatts', label: 'Power Output (Watts)', defaultOp: 'GTE', type: 'number' },
  ],
};

export function PrivateInterviewPage() {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [thinkingExpanded, setThinkingExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [category, setCategory] = useState('smart_tvs');
  const [roomTitle, setRoomTitle] = useState('');
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable Preferences State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAttr, setEditAttr] = useState('priceInr');
  const [editOp, setEditOp] = useState('LTE');
  const [editVal, setEditVal] = useState<string | number>('');
  const [editType, setEditType] = useState('HARD_CONSTRAINT');

  const [isAdding, setIsAdding] = useState(false);
  const [newAttr, setNewAttr] = useState('priceInr');
  const [newOp, setNewOp] = useState('LTE');
  const [newVal, setNewVal] = useState('');
  const [newType, setNewType] = useState('HARD_CONSTRAINT');

  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const conversationIdRef = useRef<string | null>(null);
  const participantIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Init / resume conversation — scoped to THIS group via the session token
  const initChat = useCallback(async () => {
    setInitializing(true);
    try {
      const payload = getTokenPayload();
      participantIdRef.current = payload?.sub || null;

      const res = await api.startConversation({ participantId: participantIdRef.current || '' });
      conversationIdRef.current = res.conversationId;
      if (res.category) setCategory(res.category);
      if (res.roomTitle) setRoomTitle(res.roomTitle);

      // Backend returns the full transcript (empty array = fresh conversation)
      const history = (res as any).messages as Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> | undefined;
      if (history && history.length > 0) {
        setMessages(history.map((m, i) => ({
          id: `hist_${i}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })));
      } else {
        setMessages([{
          id: 'msg_init',
          role: 'assistant',
          content: res.initialMessage,
          timestamp: new Date().toISOString(),
          thinking: res.thinking,
        }]);
      }

      // Load any previously confirmed profile
      if (participantIdRef.current) {
        try {
          const prefs = await api.getPreferences(participantIdRef.current);
          if (prefs?.confirmed && Array.isArray(prefs.constraints)) {
            setConstraints(prefs.constraints);
            setConfirmed(true);
          }
        } catch { /* no profile yet */ }
      }
    } catch (err: any) {
      setError(err.message || 'Could not start the interview.');
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => { initChat(); }, [initChat]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading || !conversationIdRef.current) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.sendMessage(conversationIdRef.current, text);

      const aiMsg: Message = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        thinking: response.thinking,
      };
      setMessages(prev => [...prev, aiMsg]);

      // Live constraint extraction from the real response
      const extracted = (response as any).extractedPreferences?.constraints;
      if (Array.isArray(extracted) && extracted.length > 0) {
        setConstraints(extracted as Constraint[]);
      }
    } catch (err: any) {
      setError(err.message || 'Message failed to send.');
    } finally {
      setLoading(false);
    }
  };

  const saveConstraintsToBackend = async (newConstraints: Constraint[], markConfirmed?: boolean) => {
    if (!participantIdRef.current) return;
    setSavingPrefs(true);
    try {
      await api.updatePreferences(participantIdRef.current, {
        constraints: newConstraints as any,
        confirmed: markConfirmed !== undefined ? markConfirmed : confirmed,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (e: any) {
      setError(e.message || 'Failed to save updated preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleStartEdit = (idx: number) => {
    const c = constraints[idx];
    setEditingIndex(idx);
    setEditAttr(c.attribute);
    setEditOp(c.operator || 'EQ');
    setEditVal(String(c.value));
    setEditType(c.type || 'PREFERENCE');
  };

  const handleApplyEdit = async () => {
    if (editingIndex === null) return;
    const numericAttrs = ['priceInr', 'screenSizeInches', 'refreshRateHz', 'ramGb', 'storageGb', 'batteryHours', 'warrantyYears'];
    const isNum = numericAttrs.includes(editAttr) && !isNaN(Number(editVal));
    const parsedVal = isNum ? Number(editVal) : editVal;

    const updated = [...constraints];
    updated[editingIndex] = {
      attribute: editAttr,
      operator: editOp,
      value: parsedVal,
      type: editType,
    };
    setConstraints(updated);
    setEditingIndex(null);
    await saveConstraintsToBackend(updated);
  };

  const handleDeleteConstraint = async (idx: number) => {
    const updated = constraints.filter((_, i) => i !== idx);
    setConstraints(updated);
    if (editingIndex === idx) setEditingIndex(null);
    await saveConstraintsToBackend(updated);
  };

  const handleAddConstraint = async () => {
    if (!newVal.toString().trim()) return;
    const numericAttrs = ['priceInr', 'screenSizeInches', 'refreshRateHz', 'ramGb', 'storageGb', 'batteryHours', 'warrantyYears'];
    const isNum = numericAttrs.includes(newAttr) && !isNaN(Number(newVal));
    const parsedVal = isNum ? Number(newVal) : newVal.toString().trim();

    const updated = [
      ...constraints,
      {
        attribute: newAttr,
        operator: newOp,
        value: parsedVal,
        type: newType,
      },
    ];
    setConstraints(updated);
    setIsAdding(false);
    setNewVal('');
    await saveConstraintsToBackend(updated);
  };

  const handleConfirm = async () => {
    if (!participantIdRef.current) return;
    setLoading(true);
    try {
      await saveConstraintsToBackend(constraints, true);
      await api.confirmPreferences(participantIdRef.current);
      setConfirmed(true);
      const targetRoom = roomId || getTokenPayload()?.groupId;
      navigate(targetRoom ? `/room/${targetRoom}` : '/catalog');
    } catch (err: any) {
      setError(err.message || 'Confirmation failed.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    const targetRoom = roomId || getTokenPayload()?.groupId;
    if (targetRoom) {
      navigate(`/room/${targetRoom}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog');
    }
  };

  const prompts = QUICK_PROMPTS[category] || QUICK_PROMPTS.smart_tvs;

  return (
    <div style={{ minHeight: '90vh', padding: '1.25rem 1rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            type="button"
            onClick={handleBack}
            style={{ background: 'none', border: 'none', color: WA.textSecondary, cursor: 'pointer', display: 'flex', padding: 4 }}
            aria-label="Back to room"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
                padding: '0.15rem 0.55rem', borderRadius: 10,
                background: 'rgba(0,168,132,0.15)', color: WA.accent,
              }}>
                PERSONAL SHOPPING ASSISTANT
              </span>
              {roomTitle && <span style={{ fontSize: '0.8rem', color: WA.textSecondary }}>{roomTitle}</span>}
            </div>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: WA.text }}>
              {confirmed ? 'Preferences Saved & Locked' : 'Personal Shopping Assistant'}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading || initializing}
          style={{
            padding: '0.7rem 1.25rem',
            borderRadius: 24,
            background: confirmed ? 'rgba(0,168,132,0.2)' : WA.accent,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.86rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: loading || initializing ? 0.6 : 1,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{confirmed ? 'Saved — Back to Squad Lounge' : 'Save & Lock My Preferences'}</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.7rem 1rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Chat thread */}
        <div style={{
          background: WA.panel, borderRadius: 14, border: `1px solid ${WA.divider}`,
          display: 'flex', flexDirection: 'column', height: '68vh', overflow: 'hidden',
        }}>
          <div
            style={{
              flex: 1, overflowY: 'auto', padding: '1rem',
              display: 'flex', flexDirection: 'column', gap: '0.55rem',
              backgroundImage: 'radial-gradient(rgba(134,150,160,0.045) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          >
            {initializing && (
              <div style={{ color: WA.textSecondary, fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                Connecting to your Personal Shopping Assistant…
              </div>
            )}

            {messages.map((msg) => {
              const isAi = msg.role === 'assistant';
              const isThinkingOpen = thinkingExpanded[msg.id];

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAi ? 'flex-start' : 'flex-end',
                    gap: '0.3rem',
                  }}
                >
                  {isAi && msg.thinking && (
                    <div style={{ maxWidth: '85%', borderRadius: 8, background: WA.systemBubble, overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setThinkingExpanded(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        style={{
                          width: '100%', padding: '0.3rem 0.65rem', background: 'none', border: 'none',
                          color: WA.accent, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                        }}
                      >
                        <Brain size={12} />
                        Why this reply
                        {isThinkingOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                      {isThinkingOpen && (
                        <div style={{ padding: '0.35rem 0.65rem 0.55rem', fontSize: '0.74rem', color: WA.textSecondary, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '0.7rem 0.95rem',
                      borderRadius: isAi ? '8px 8px 8px 2px' : '8px 8px 2px 8px',
                      background: isAi ? WA.incoming : WA.outgoing,
                      color: WA.text,
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </div>

                  <span style={{ color: WA.textSecondary, fontSize: '0.62rem', padding: '0 0.3rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div style={{ alignSelf: 'flex-start', background: WA.incoming, borderRadius: '8px 8px 8px 2px', padding: '0.7rem 1rem' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: WA.textSecondary,
                      animation: `waBlink 1.2s ${i * 0.2}s infinite ease-in-out`,
                    }} />
                  ))}
                </div>
                <style>{`@keyframes waBlink { 0%,80%,100%{opacity:.25} 40%{opacity:1} }`}</style>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', padding: '0.6rem 0.8rem', borderTop: `1px solid ${WA.divider}`, scrollbarWidth: 'none' }}>
            {prompts.map((prompt, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading || initializing}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.35rem 0.8rem',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: WA.textSecondary,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '0.55rem', padding: '0.65rem 0.8rem', background: WA.header, alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder="Tell the assistant your budget, must-haves, or brand preferences…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading || initializing}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: 24,
                background: WA.incoming,
                border: 'none',
                color: WA.text,
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
            <button
              type="submit"
              disabled={loading || initializing || !inputText.trim()}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: WA.accent,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !inputText.trim() ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              <Send size={17} />
            </button>
          </form>
        </div>

        {/* Extracted preferences sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: WA.panel, borderRadius: 14, border: `1px solid ${WA.divider}`, padding: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: WA.text }}>
                <SlidersHorizontal size={17} color={WA.accent} />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
                  Your Preferences ({constraints.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(prev => !prev)}
                style={{
                  background: isAdding ? 'rgba(239,68,68,0.15)' : 'rgba(0,168,132,0.15)',
                  color: isAdding ? 'var(--danger)' : WA.accent,
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {isAdding ? <X size={13} /> : <Plus size={13} />}
                <span>{isAdding ? 'Cancel' : 'Add'}</span>
              </button>
            </div>

            {savingPrefs && (
              <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', color: WA.textSecondary }}>
                Syncing with consensus engine...
              </div>
            )}

            {savedToast && (
              <div style={{ marginBottom: '0.75rem', padding: '0.4rem 0.7rem', background: 'rgba(0,168,132,0.15)', border: '1px solid rgba(0,168,132,0.3)', borderRadius: 6, fontSize: '0.74rem', color: WA.accent, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} /> Preferences & consensus context updated
              </div>
            )}

            {/* Inline Add Requirement Form */}
            {isAdding && (
              <div style={{ marginBottom: '0.9rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: `1px solid ${WA.accent}` }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: WA.accent, marginBottom: '0.5rem' }}>
                  Add Requirement
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: WA.textSecondary, display: 'block', marginBottom: 2 }}>SPEC / ATTRIBUTE</label>
                    <select
                      value={newAttr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewAttr(val);
                        const catAttrs = CATEGORY_ATTRS[category] || CATEGORY_ATTRS.smart_tvs;
                        const match = catAttrs.find(a => a.key === val);
                        if (match) setNewOp(match.defaultOp);
                      }}
                      style={{ width: '100%', background: WA.incoming, color: WA.text, border: 'none', borderRadius: 6, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      {(CATEGORY_ATTRS[category] || CATEGORY_ATTRS.smart_tvs).map(a => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: WA.textSecondary, display: 'block', marginBottom: 2 }}>OPERATOR</label>
                      <select
                        value={newOp}
                        onChange={(e) => setNewOp(e.target.value)}
                        style={{ width: '100%', background: WA.incoming, color: WA.text, border: 'none', borderRadius: 6, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <option value="LTE">≤ Max Limit</option>
                        <option value="GTE">≥ Min Limit</option>
                        <option value="EQ">= Exact / Preferred</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: WA.textSecondary, display: 'block', marginBottom: 2 }}>PRIORITY</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        style={{ width: '100%', background: WA.incoming, color: WA.text, border: 'none', borderRadius: 6, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <option value="HARD_CONSTRAINT">MUST (Hard)</option>
                        <option value="DEALBREAKER">VETO (Dealbreaker)</option>
                        <option value="PREFERENCE">PREFER (Soft)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', color: WA.textSecondary, display: 'block', marginBottom: 2 }}>VALUE / TARGET</label>
                    <input
                      type="text"
                      placeholder="e.g. 50000, OLED, 120, Samsung"
                      value={newVal}
                      onChange={(e) => setNewVal(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', background: WA.incoming, color: WA.text, border: 'none', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                    <button
                      type="button"
                      onClick={handleAddConstraint}
                      disabled={!newVal.toString().trim()}
                      style={{ flex: 1, background: WA.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Save Requirement
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      style={{ background: 'rgba(255,255,255,0.08)', color: WA.textSecondary, border: 'none', borderRadius: 6, padding: '0.4rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {constraints.length === 0 && !isAdding ? (
              <p style={{ color: WA.textSecondary, fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                Nothing extracted yet. Tell the interviewer your budget and must-haves, or click <strong>+ Add</strong> above to manually specify requirements.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {constraints.map((c, i) => {
                  const isEditing = editingIndex === i;

                  if (isEditing) {
                    return (
                      <div
                        key={i}
                        style={{
                          padding: '0.65rem',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.06)',
                          border: `1px solid ${WA.accent}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                        }}
                      >
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: WA.accent }}>
                          Edit: {attrLabel(editAttr)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                          <select
                            value={editOp}
                            onChange={(e) => setEditOp(e.target.value)}
                            style={{ background: WA.incoming, color: WA.text, border: 'none', borderRadius: 6, padding: '0.35rem 0.5rem', fontSize: '0.76rem' }}
                          >
                            <option value="LTE">≤</option>
                            <option value="GTE">≥</option>
                            <option value="EQ">=</option>
                          </select>
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            style={{ background: WA.incoming, color: WA.text, border: 'none', borderRadius: 6, padding: '0.35rem 0.5rem', fontSize: '0.76rem' }}
                          >
                            <option value="HARD_CONSTRAINT">MUST</option>
                            <option value="DEALBREAKER">VETO</option>
                            <option value="PREFERENCE">PREFER</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          style={{ boxSizing: 'border-box', background: WA.incoming, color: WA.text, border: 'none', borderRadius: 6, padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: 2 }}>
                          <button
                            type="button"
                            onClick={handleApplyEdit}
                            style={{ background: WA.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            style={{ background: 'rgba(255,255,255,0.08)', color: WA.textSecondary, border: 'none', borderRadius: 6, padding: '0.25rem 0.5rem', fontSize: '0.74rem', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${c.type === 'DEALBREAKER' ? 'rgba(239,68,68,0.35)' : WA.divider}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: WA.textSecondary }}>{attrLabel(c.attribute)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.4rem',
                              borderRadius: 4,
                              background: c.type === 'DEALBREAKER' ? 'rgba(239,68,68,0.15)' : c.type === 'HARD_CONSTRAINT' ? 'rgba(245,158,11,0.15)' : 'rgba(0,168,132,0.15)',
                              color: c.type === 'DEALBREAKER' ? 'var(--danger)' : c.type === 'HARD_CONSTRAINT' ? 'var(--warning)' : WA.accent,
                            }}
                          >
                            {c.type === 'HARD_CONSTRAINT' ? 'MUST' : c.type === 'DEALBREAKER' ? 'VETO' : c.type === 'PREFERENCE' ? 'PREFER' : 'BONUS'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(i)}
                            style={{ background: 'none', border: 'none', color: WA.textSecondary, cursor: 'pointer', padding: 2, display: 'flex' }}
                            title="Edit requirement"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteConstraint(i)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2, display: 'flex', opacity: 0.8 }}
                            title="Delete requirement"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: WA.text }}>{formatConstraint(c)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem', borderRadius: 10, background: WA.systemBubble, border: `1px solid ${WA.divider}` }}>
            <Shield size={16} color={WA.accent} />
            <span style={{ fontSize: '0.74rem', color: WA.textSecondary, lineHeight: 1.45 }}>
              Your shopping chat stays private. Only your extracted criteria and budget are combined into the squad's recommendation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
