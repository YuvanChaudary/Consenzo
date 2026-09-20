import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  Lock,
  Check,
  Users,
  ArrowLeft,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

export interface CartPageProps {
  onNavigate?: (route: string, params?: Record<string, unknown>) => void;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const CANVAS = '#0A0E17';
const SURFACE = '#0D1220';
const ACCENT = '#0EA5E9';

const glassL1: CSSProperties = {
  background: 'rgba(255,255,255,0.045)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.45)',
  borderRadius: '1rem',
};

const nearSolid: CSSProperties = {
  background: 'rgba(13,18,32,0.92)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.875rem',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LockBadgeProps {
  state: 'pending' | 'agreed' | 'rejected';
  voteCount?: number;
  totalVoters?: number;
}

function LockBadge({ state, voteCount, totalVoters }: LockBadgeProps) {
  if (state === 'pending') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.35)',
          color: '#f59e0b',
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '0.2rem 0.55rem',
          borderRadius: '0.4rem',
          whiteSpace: 'nowrap',
        }}
      >
        <Lock size={10} />
        Awaiting Squad Consensus
        {voteCount !== undefined && totalVoters !== undefined && (
          <span style={{ opacity: 0.7 }}>
            ({voteCount}/{totalVoters})
          </span>
        )}
      </span>
    );
  }

  if (state === 'agreed') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: 'rgba(14,165,233,0.12)',
          border: '1px solid rgba(14,165,233,0.35)',
          color: ACCENT,
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '0.2rem 0.55rem',
          borderRadius: '0.4rem',
          whiteSpace: 'nowrap',
        }}
      >
        <Check size={10} />
        Squad Approved
      </span>
    );
  }

  return null;
}

// ─── Main CartPage ────────────────────────────────────────────────────────────

export function CartPage({ onNavigate: externalNav }: CartPageProps) {
  const navigate = useNavigate();
  const { items, cartType, roomId, removeItem, updateQuantity, subtotal } = useCartStore();
  const onNavigate = externalNav ?? ((route: string, params?: Record<string, unknown>) => {
    if (route === 'lobby') {
      const targetRoom = (params?.roomId as string) || roomId;
      return navigate(targetRoom ? `/room/${targetRoom}` : '/room/join', { state: params });
    }
    if (route === 'catalog') return navigate('/catalog', { state: params });
    if (route === 'checkout') return navigate('/checkout', { state: params });
    if (route === 'create') return navigate('/room/create', { state: params });
    if (route === 'join') return navigate('/room/join', { state: params });
    if (route === 'interview') {
      const targetRoom = (params?.roomId as string) || roomId;
      return navigate(targetRoom ? `/room/${targetRoom}/interview` : '/room/join', { state: params });
    }
    if (route === 'decision' || route === 'results' || route === 'analysis') {
      const targetRoom = (params?.roomId as string) || roomId;
      return navigate(targetRoom ? `/room/${targetRoom}/results` : '/room/join', { state: params });
    }
    if (route === 'orders' || route === 'account') return navigate('/account', { state: params });
    const target = route.startsWith('/') ? route : `/${route}`;
    navigate(target, { state: params });
  });

  const sub = subtotal();
  const TAX_RATE = 0.18;
  const tax = Math.round(sub * TAX_RATE);
  const shipping = sub > 999 ? 0 : 99;
  const total = sub + tax + shipping;

  const pendingItems = items.filter((i) => i.lockState === 'pending');
  const agreedItems = items.filter((i) => i.lockState === 'agreed');
  const allItemsAgreed =
    cartType === 'consensus' &&
    items.length > 0 &&
    items.every((i) => i.lockState === 'agreed');

  const hasPending = cartType === 'consensus' && pendingItems.length > 0;

  // Collect totalVoters from the first item that has it
  const sampleVoter = items.find((i) => i.totalVoters !== undefined);
  const totalVoters = sampleVoter?.totalVoters ?? 0;
  const agreedVoters =
    agreedItems.length > 0 ? agreedItems[0].voteCount ?? 0 : 0;

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: CANVAS,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'rgba(14,165,233,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShoppingBag size={44} color={ACCENT} />
        </motion.div>
        <h2
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#fff',
            margin: 0,
          }}
        >
          Your cart is empty
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'center' }}>
          Browse our catalog and add items to get started.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          style={{
            background: ACCENT,
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.8rem 2rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 4px 20px rgba(14,165,233,0.35)`,
          }}
        >
          Start Browsing
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // ── Main cart layout ──────────────────────────────────────────────────────────
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
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back link */}
        <button
          onClick={() => onNavigate('catalog')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          <ArrowLeft size={15} />
          Continue Shopping
        </button>

        <h1
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0 0 1.75rem',
          }}
        >
          Shopping Cart
          <span
            style={{
              marginLeft: '0.75rem',
              fontSize: '1rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </h1>

        {/* Consensus Info Banner */}
        <AnimatePresence>
          {cartType === 'consensus' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                ...glassL1,
                borderLeft: `4px solid ${ACCENT}`,
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} color={ACCENT} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                    Co-Shopping Squad Cart
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    Items unlock for checkout once all squad members approve the pick.
                  </p>
                </div>
              </div>
              {roomId && (
                <button
                  onClick={() => onNavigate('lobby', { roomId })}
                  style={{
                    background: 'rgba(14,165,233,0.12)',
                    border: `1px solid rgba(14,165,233,0.35)`,
                    color: ACCENT,
                    borderRadius: '0.5rem',
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  View Squad Lounge →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 65fr) minmax(0, 35fr)',
            gap: '1.75rem',
            alignItems: 'start',
          }}
          className="cart-grid"
        >
          {/* ── Items list ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                  style={{
                    ...nearSolid,
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '0.625rem',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: SURFACE,
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShoppingBag size={20} color="rgba(255,255,255,0.2)" />
                      </div>
                    )}
                  </div>

                  {/* Name + brand */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#fff',
                        margin: '0 0 0.15rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.4)',
                        margin: '0 0 0.4rem',
                      }}
                    >
                      {item.brand}
                    </p>
                    {item.lockState && item.lockState !== 'rejected' && (
                      <LockBadge
                        state={item.lockState}
                        voteCount={item.voteCount}
                        totalVoters={item.totalVoters}
                      />
                    )}
                  </div>

                  {/* Qty controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '0.6rem',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={{
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,255,255,0.08)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = 'none')
                      }
                    >
                      <Minus size={13} />
                    </button>
                    <span
                      style={{
                        width: 36,
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={{
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,255,255,0.08)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = 'none')
                      }
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Line subtotal */}
                  <div
                    style={{
                      minWidth: 90,
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#fff',
                    }}
                  >
                    {formatPrice(item.priceInr * item.quantity)}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                    style={{
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.45rem',
                      color: 'rgba(255,255,255,0.35)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = 'rgba(239,68,68,0.15)';
                      el.style.borderColor = 'rgba(239,68,68,0.45)';
                      el.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = 'none';
                      el.style.borderColor = 'rgba(255,255,255,0.08)';
                      el.style.color = 'rgba(255,255,255,0.35)';
                    }}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ── */}
          <div style={{ position: 'sticky', top: '5rem' }}>
            <div style={{ ...glassL1, padding: '1.5rem' }}>
              <h3
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  margin: '0 0 1.25rem',
                  color: '#fff',
                }}
              >
                Order Summary
              </h3>

              {/* Lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <SummaryRow label="Subtotal" value={formatPrice(sub)} />
                <SummaryRow
                  label="Shipping"
                  value={shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  valueColor={shipping === 0 ? ACCENT : undefined}
                  hint={
                    shipping > 0
                      ? `Add ${formatPrice(999 - sub)} more for free shipping`
                      : undefined
                  }
                />
                {shipping > 0 && (
                  <div
                    style={{
                      background: 'rgba(14,165,233,0.07)',
                      border: '1px solid rgba(14,165,233,0.18)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Truck size={13} color={ACCENT} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
                      Add {formatPrice(999 - sub)} more for free delivery
                    </span>
                  </div>
                )}
                <SummaryRow label="GST (18%)" value={formatPrice(tax)} />
                <div
                  style={{
                    height: 1,
                    background: 'rgba(255,255,255,0.08)',
                    margin: '0.25rem 0',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#fff',
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.4rem',
                      color: '#fff',
                    }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={!hasPending ? { scale: 1.02 } : {}}
                whileTap={!hasPending ? { scale: 0.98 } : {}}
                onClick={() => !hasPending && onNavigate('checkout')}
                disabled={hasPending && !allItemsAgreed}
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  padding: '0.9rem',
                  background: hasPending && !allItemsAgreed ? 'rgba(255,255,255,0.08)' : ACCENT,
                  border: 'none',
                  borderRadius: '0.75rem',
                  color:
                    hasPending && !allItemsAgreed ? 'rgba(255,255,255,0.4)' : '#fff',
                  fontSize: '0.975rem',
                  fontWeight: 700,
                  cursor: hasPending && !allItemsAgreed ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s',
                  boxShadow:
                    hasPending && !allItemsAgreed
                      ? 'none'
                      : `0 4px 20px rgba(14,165,233,0.35)`,
                }}
              >
                Proceed to Checkout
                <ChevronRight size={16} />
              </motion.button>

              {/* Pending vote info */}
              {hasPending && (
                <p
                  style={{
                    margin: '0.65rem 0 0',
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    color: '#f59e0b',
                  }}
                >
                  {agreedVoters}/{totalVoters} squad members approved
                </p>
              )}

              <button
                onClick={() => onNavigate('catalog')}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Summary Row helper ───────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  valueColor,
  hint,
}: {
  label: string;
  value: string;
  valueColor?: string;
  hint?: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>{label}</span>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: valueColor ?? 'rgba(255,255,255,0.85)',
          }}
        >
          {value}
        </span>
      </div>
      {hint && (
        <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
