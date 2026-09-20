import React, { CSSProperties, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShoppingBag,
  Users,
  Settings,
  Edit2,
  Check,
  Package,
  ChevronRight,
  Plus,
  Hash,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export interface AccountPageProps {
  onNavigate?: (route: string, params?: Record<string, unknown>) => void;
}

type AccountTab = 'overview' | 'orders' | 'groups' | 'preferences';

// ─── Design tokens ────────────────────────────────────────────────────────────
const CANVAS = '#0A0E17';
const ACCENT = '#0EA5E9';

const glassL1: CSSProperties = {
  background: 'rgba(255,255,255,0.045)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.45)',
  borderRadius: '1rem',
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function UserAvatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const hue = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `hsl(${hue}, 55%, 38%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.34,
        fontWeight: 700,
        color: '#fff',
        fontFamily: 'Sora, sans-serif',
        border: '2px solid rgba(255,255,255,0.12)',
        flexShrink: 0,
      }}
    >
      {initials || <User size={size * 0.45} />}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 0.25rem',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{label}</p>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '3rem 1rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(14,165,233,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#fff',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: 320 }}>
          {description}
        </p>
      )}
      {cta}
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab({
  displayName,
  onEditName,
}: {
  displayName: string;
  onEditName: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* User info card */}
      <div style={{ ...glassL1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <UserAvatar name={displayName} size={68} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#fff',
                margin: '0 0 0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Shippyfy Member
            </p>
          </div>
          <button
            onClick={onEditName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.875rem',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'rgba(255,255,255,0.10)';
              el.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'rgba(255,255,255,0.06)';
              el.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <Edit2 size={13} />
            Edit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
        <StatCard label="Orders" value={0} />
        <StatCard label="Groups" value={0} />
        <StatCard label="Decisions" value={0} />
      </div>

      {/* Quick links */}
      <div style={{ ...glassL1, padding: '0' }}>
        {[
          { label: 'My Orders', icon: <Package size={17} />, route: 'orders' },
          { label: 'My Groups', icon: <Users size={17} />, route: 'groups' },
          { label: 'Preferences', icon: <Settings size={17} />, route: 'preferences' },
        ].map((item, idx, arr) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '1rem 1.25rem',
              borderBottom:
                idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.background =
                'rgba(255,255,255,0.03)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.background = 'transparent')
            }
          >
            <span style={{ color: ACCENT }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: '#fff' }}>
              {item.label}
            </span>
            <ChevronRight size={15} color="rgba(255,255,255,0.3)" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────────
function OrdersTab({ onNavigate }: { onNavigate: (r: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ ...glassL1, padding: '0' }}
    >
      <EmptyState
        icon={<ShoppingBag size={28} color={ACCENT} />}
        title="No orders yet"
        description="Start shopping and your order history will appear here."
        cta={
          <button
            onClick={() => onNavigate('catalog')}
            style={{
              marginTop: '0.5rem',
              padding: '0.7rem 1.75rem',
              background: ACCENT,
              border: 'none',
              borderRadius: '0.625rem',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 16px rgba(14,165,233,0.3)`,
            }}
          >
            Start Shopping
          </button>
        }
      />
    </motion.div>
  );
}

// ─── Tab: Groups ──────────────────────────────────────────────────────────────
function GroupsTab({ onNavigate }: { onNavigate: (r: string, p?: Record<string, unknown>) => void }) {
  const [inviteCode, setInviteCode] = useState('');
  const [focused, setFocused] = useState(false);

  const handleJoin = () => {
    if (inviteCode.trim()) {
      onNavigate('join', { inviteCode: inviteCode.trim().toUpperCase() });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <div style={{ ...glassL1, padding: '0' }}>
        <EmptyState
          icon={<Users size={28} color={ACCENT} />}
          title="No groups yet"
          description="Join a group with an invite code, or create a new decision group with friends."
        />
      </div>

      {/* Join group */}
      <div style={{ ...glassL1, padding: '1.25rem' }}>
        <h3
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 0.875rem',
          }}
        >
          Join a Group
        </h3>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Hash
              size={14}
              color="rgba(255,255,255,0.3)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="INVITE CODE"
              maxLength={8}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${focused ? ACCENT : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '0.625rem',
                padding: '0.7rem 0.875rem 0.7rem 2.25rem',
                color: '#fff',
                fontSize: '0.875rem',
                fontFamily: "'Courier New', monospace",
                fontWeight: 700,
                letterSpacing: '0.12em',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
            />
          </div>
          <button
            onClick={handleJoin}
            style={{
              padding: '0.7rem 1.25rem',
              background: ACCENT,
              border: 'none',
              borderRadius: '0.625rem',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 14px rgba(14,165,233,0.3)`,
            }}
          >
            Join →
          </button>
        </div>
      </div>

      {/* Create group */}
      <div style={{ ...glassL1, padding: '1.25rem' }}>
        <h3
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 0.5rem',
          }}
        >
          Create a Group
        </h3>
        <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1rem', lineHeight: 1.5 }}>
          Start a new group decision session. Invite friends and shop together with consensus.
        </p>
        <button
          onClick={() => onNavigate('create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.25rem',
            background: 'rgba(14,165,233,0.12)',
            border: `1px solid rgba(14,165,233,0.35)`,
            borderRadius: '0.625rem',
            color: ACCENT,
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = `rgba(14,165,233,0.2)`;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = `rgba(14,165,233,0.12)`;
          }}
        >
          <Plus size={15} />
          Create New Group
        </button>
      </div>
    </motion.div>
  );
}

// ─── Tab: Preferences ─────────────────────────────────────────────────────────
const PREFERENCE_CATEGORIES = [
  { label: 'Electronics', emoji: '💻', status: 'Not built yet' },
  { label: 'Fashion', emoji: '👗', status: 'Not built yet' },
  { label: 'Home & Kitchen', emoji: '🏠', status: 'Not built yet' },
  { label: 'Sports', emoji: '⚽', status: 'Not built yet' },
  { label: 'Books', emoji: '📚', status: 'Not built yet' },
  { label: 'Beauty', emoji: '💄', status: 'Not built yet' },
];

function PreferencesTab({ onNavigate }: { onNavigate: (r: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Banner */}
      <div
        style={{
          ...glassL1,
          padding: '1.25rem',
          borderLeft: `4px solid ${ACCENT}`,
          borderRadius: '0.875rem',
        }}
      >
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0 0 0.4rem' }}>
          What Shippyfy Knows About You
        </h3>
        <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
          Your preference profile is built as you co-shop and specify criteria. Set your preferences to get tailored recommendations.
        </p>
        <button
          onClick={() => onNavigate('interview')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: ACCENT,
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.55rem 1.1rem',
            color: '#fff',
            fontSize: '0.825rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: `0 4px 14px rgba(14,165,233,0.3)`,
          }}
        >
          Set Shopping Preferences
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Category cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {PREFERENCE_CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{cat.emoji}</div>
            <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff', margin: '0 0 0.25rem' }}>
              {cat.label}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {cat.status}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Set Display Name Modal ───────────────────────────────────────────────────
function SetNameForm({ onDone }: { onDone: () => void }) {
  const { setDisplayName } = useAuthStore();
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) {
      setDisplayName(name.trim());
      onDone();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: CANVAS,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ ...glassL1, padding: '2.5rem', maxWidth: 400, width: '100%', textAlign: 'center' }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(14,165,233,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <User size={28} color={ACCENT} />
        </div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>
          Set Your Display Name
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          This is how you'll appear to your squad members in Shippyfy.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${focused ? ACCENT : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '0.625rem',
            padding: '0.8rem 1rem',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            marginBottom: '1rem',
            transition: 'border-color 0.15s',
            textAlign: 'center',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: name.trim() ? ACCENT : 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '0.75rem',
            color: name.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            boxShadow: name.trim() ? `0 4px 18px rgba(14,165,233,0.35)` : 'none',
            transition: 'all 0.15s',
          }}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main AccountPage ─────────────────────────────────────────────────────────
export function AccountPage({ onNavigate: externalNav }: AccountPageProps) {
  const navigate = useNavigate();
  const onNavigate = externalNav ?? ((route: string, params?: Record<string, unknown>) => {
    if (route === 'create') return navigate('/room/create', { state: params });
    if (route === 'join') return navigate('/room/join', { state: params });
    if (route === 'catalog') return navigate('/catalog', { state: params });
    if (route === 'interview') return navigate('/room/join', { state: params });
    if (route === 'orders') {
      setActiveTab('orders');
      return;
    }
    const target = route.startsWith('/') ? route : `/${route}`;
    navigate(target, { state: params });
  });

  const { displayName, setDisplayName } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameFocused, setNameFocused] = useState(false);

  const TABS: { key: AccountTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User size={15} /> },
    { key: 'orders', label: 'Orders', icon: <Package size={15} /> },
    { key: 'groups', label: 'My Groups', icon: <Users size={15} /> },
    { key: 'preferences', label: 'Preferences', icon: <Settings size={15} /> },
  ];

  // Not authenticated — show name form
  if (!displayName) {
    return <SetNameForm onDone={() => {}} />;
  }

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
    }
    setEditingName(false);
    setNameInput('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: CANVAS,
        padding: '2rem 1rem',
        fontFamily: 'Inter, sans-serif',
        color: '#fff',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: '0 0 1.75rem',
          }}
        >
          My Account
        </h1>

        {/* Tab navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            padding: '4px',
            marginBottom: '1.75rem',
            overflowX: 'auto',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: '1 1 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                background:
                  activeTab === tab.key
                    ? 'rgba(255,255,255,0.09)'
                    : 'transparent',
                border:
                  activeTab === tab.key
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px solid transparent',
                borderRadius: '0.55rem',
                color:
                  activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: '0.83rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                boxShadow:
                  activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              <span
                style={{
                  color: activeTab === tab.key ? ACCENT : 'inherit',
                  display: 'flex',
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Edit name inline modal */}
        <AnimatePresence>
          {editingName && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                ...glassL1,
                padding: '1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={displayName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${nameFocused ? ACCENT : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '0.5rem',
                  padding: '0.6rem 0.875rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <button
                onClick={handleSaveName}
                style={{
                  padding: '0.6rem 1rem',
                  background: ACCENT,
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Check size={14} />
                Save
              </button>
              <button
                onClick={() => setEditingName(false)}
                style={{
                  padding: '0.6rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '0.5rem',
                  color: 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab
              key="overview"
              displayName={displayName}
              onEditName={() => {
                setEditingName(true);
                setNameInput(displayName ?? '');
              }}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersTab key="orders" onNavigate={onNavigate} />
          )}
          {activeTab === 'groups' && (
            <GroupsTab key="groups" onNavigate={onNavigate} />
          )}
          {activeTab === 'preferences' && (
            <PreferencesTab key="preferences" onNavigate={onNavigate} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
