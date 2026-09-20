import React, { CSSProperties, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, CreditCard, Smartphone, AlertTriangle } from 'lucide-react';
import {
  formatCardNumber,
  formatExpiry,
  detectCardNetwork,
  luhnCheck,
  generateOrderId,
} from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────
export interface MockPaymentSheetProps {
  amount: number;
  currency?: 'INR' | 'USD';
  onResolve: (success: boolean, orderId?: string) => void;
}

// ─── Internal types ───────────────────────────────────────────────────────────
type PaymentTab = 'card' | 'upi';
type ProcessingPhase = 'idle' | 'processing' | 'success' | 'failed';
type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'unknown';

const DECLINE_NUMBER = '4000000000000002';

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACCENT = '#0EA5E9';

const glassL2: CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 16px 64px rgba(0,0,0,0.6)',
  borderRadius: '1.25rem',
};

// ─── Card Network Logos ───────────────────────────────────────────────────────
function CardNetworkLogo({ network }: { network: CardNetwork }) {
  if (network === 'visa') {
    return (
      <span
        style={{
          fontFamily: 'serif',
          fontWeight: 900,
          fontSize: '1rem',
          color: '#1A1FE0',
          letterSpacing: '-0.03em',
          background: '#fff',
          padding: '1px 5px',
          borderRadius: '3px',
          lineHeight: 1.2,
        }}
      >
        VISA
      </span>
    );
  }
  if (network === 'mastercard') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#EB001B',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#F79E1B',
            display: 'inline-block',
            marginLeft: -8,
            opacity: 0.9,
          }}
        />
      </span>
    );
  }
  if (network === 'amex') {
    return (
      <span
        style={{
          fontFamily: 'Arial, sans-serif',
          fontWeight: 800,
          fontSize: '0.7rem',
          color: '#fff',
          letterSpacing: '0.05em',
          background: '#007bc1',
          padding: '2px 5px',
          borderRadius: '3px',
          lineHeight: 1.3,
        }}
      >
        AMEX
      </span>
    );
  }
  return null;
}

// ─── Mini Card Preview ────────────────────────────────────────────────────────
interface CardPreviewProps {
  number: string;
  name: string;
  expiry: string;
  network: CardNetwork;
}

function CardPreview({ number, name, expiry, network }: CardPreviewProps) {
  const masked = number
    ? number
        .padEnd(16, '·')
        .replace(/(.{4})/g, '$1 ')
        .trim()
    : '•••• •••• •••• ••••';

  const gradients: Record<CardNetwork, string> = {
    visa: 'linear-gradient(135deg, #1A1FE0 0%, #0D47A1 100%)',
    mastercard: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    amex: 'linear-gradient(135deg, #007bc1 0%, #004f82 100%)',
    unknown: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  };

  return (
    <div
      style={{
        background: gradients[network],
        borderRadius: '0.875rem',
        padding: '1.25rem 1.4rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.12)',
        minHeight: 120,
      }}
    >
      {/* Holographic shimmer */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -20,
          left: 60,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: chip + network */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.25rem',
        }}
      >
        {/* Chip */}
        <div
          style={{
            width: 32,
            height: 24,
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #f0c040 0%, #c89010 100%)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        />
        <CardNetworkLogo network={network} />
      </div>

      {/* Card number */}
      <p
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '1.05rem',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.12em',
          margin: '0 0 0.75rem',
          opacity: 0.9,
        }}
      >
        {masked}
      </p>

      {/* Name + expiry */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Card Holder
          </p>
          <p style={{ fontSize: '0.82rem', color: '#fff', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {name || 'YOUR NAME'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Expires
          </p>
          <p style={{ fontSize: '0.82rem', color: '#fff', margin: 0, fontWeight: 600, letterSpacing: '0.05em' }}>
            {expiry || 'MM/YY'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── UPI QR Placeholder ───────────────────────────────────────────────────────
function UpiQrPlaceholder() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1.25rem 0',
      }}
    >
      {/* QR pattern placeholder */}
      <div
        style={{
          width: 140,
          height: 140,
          border: '2px solid rgba(255,255,255,0.15)',
          borderRadius: '0.625rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(7, 1fr)',
          padding: '8px',
          gap: 3,
          background: '#fff',
        }}
      >
        {/* Simplified QR-like pattern using SVG */}
        <svg width="124" height="124" viewBox="0 0 124 124" fill="none">
          {/* Corner squares */}
          <rect x="0" y="0" width="36" height="36" rx="3" fill="#111" />
          <rect x="6" y="6" width="24" height="24" rx="2" fill="#fff" />
          <rect x="10" y="10" width="16" height="16" rx="1" fill="#111" />

          <rect x="88" y="0" width="36" height="36" rx="3" fill="#111" />
          <rect x="94" y="6" width="24" height="24" rx="2" fill="#fff" />
          <rect x="98" y="10" width="16" height="16" rx="1" fill="#111" />

          <rect x="0" y="88" width="36" height="36" rx="3" fill="#111" />
          <rect x="6" y="94" width="24" height="24" rx="2" fill="#fff" />
          <rect x="10" y="98" width="16" height="16" rx="1" fill="#111" />

          {/* Data modules */}
          {[44, 50, 56, 62, 68, 74, 80].map((x) =>
            [0, 6, 12, 18, 24, 30, 38, 44, 56, 62, 68, 80].map((y) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={4}
                height={4}
                rx={0.5}
                fill={Math.random() > 0.45 ? '#111' : 'transparent'}
              />
            ))
          )}
          {[0, 6, 12, 18, 24, 30].map((y) =>
            [44, 50, 56, 62, 68, 74, 80].map((x) => (
              <rect
                key={`d-${x}-${y}`}
                x={x}
                y={y}
                width={4}
                height={4}
                rx={0.5}
                fill={Math.random() > 0.45 ? '#111' : 'transparent'}
              />
            ))
          )}
        </svg>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0, textAlign: 'center' }}>
        Scan with any UPI app to pay
      </p>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center' }}>
        PhonePe · GPay · Paytm · BHIM
      </p>
    </div>
  );
}

// ─── Processing state messages ────────────────────────────────────────────────
const PROCESSING_MESSAGES = [
  'Connecting to payment gateway...',
  'Contacting your bank...',
  'Verifying transaction...',
  'Confirming order...',
];

// ─── PaymentInput helper ──────────────────────────────────────────────────────
interface PaymentInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string;
  rightSlot?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

function PaymentInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength,
  disabled,
  error,
  rightSlot,
  inputMode,
}: PaymentInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.73rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          inputMode={inputMode}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${
              error ? '#ef4444' : focused ? ACCENT : 'rgba(255,255,255,0.12)'
            }`,
            borderRadius: '0.625rem',
            padding: `0.7rem ${rightSlot ? '3rem' : '0.875rem'} 0.7rem 0.875rem`,
            color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: "'Courier New', monospace",
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: focused ? `0 0 0 3px rgba(14,165,233,0.15)` : 'none',
          }}
        />
        {rightSlot && (
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '0.72rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <AlertTriangle size={11} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Main MockPaymentSheet ────────────────────────────────────────────────────
export function MockPaymentSheet({ amount, currency = 'INR', onResolve }: MockPaymentSheetProps) {
  const [tab, setTab] = useState<PaymentTab>('card');
  const [phase, setPhase] = useState<ProcessingPhase>('idle');
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);

  // Card fields
  const [cardNumber, setCardNumberRaw] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiryRaw] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI field
  const [upiVpa, setUpiVpa] = useState('');

  // Errors
  const [cardError, setCardError] = useState<string | null>(null);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [cvvError, setCvvError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [upiError, setUpiError] = useState<string | null>(null);

  // Resolved order id
  const [resolvedOrderId, setResolvedOrderId] = useState('');

  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timerRefs.current.forEach((t) => clearTimeout(t));
    timerRefs.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const network: CardNetwork = detectCardNetwork(cardNumber.replace(/\s/g, ''));
  const rawDigits = cardNumber.replace(/\s/g, '');
  const cvvLabel = network === 'amex' ? '4-digit CID' : 'CVV';
  const cvvMax = network === 'amex' ? 4 : 3;

  // ── Formatted handlers ────────────────────────────────────────────────────
  const handleCardNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    setCardNumberRaw(formatCardNumber(digits));
    setCardError(null);
  };

  const handleExpiry = (raw: string) => {
    // If user is backspacing over the slash
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setExpiryRaw(formatExpiry(digits));
    setExpiryError(null);
  };

  const handleCvv = (raw: string) => {
    setCvv(raw.replace(/\D/g, '').slice(0, cvvMax));
    setCvvError(null);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateCard = (): boolean => {
    let ok = true;
    if (rawDigits.length < 15) {
      setCardError('Enter a valid card number');
      ok = false;
    } else if (rawDigits.length === 16 && !luhnCheck(rawDigits)) {
      setCardError('Invalid card number');
      ok = false;
    }
    if (!expiry || expiry.length < 5) {
      setExpiryError('Enter expiry date');
      ok = false;
    }
    if (cvv.length < (network === 'amex' ? 4 : 3)) {
      setCvvError(`Enter ${cvvLabel}`);
      ok = false;
    }
    if (!cardName.trim()) {
      setNameError('Name is required');
      ok = false;
    }
    return ok;
  };

  const validateUpi = (): boolean => {
    if (!/^[\w.\-]+@[\w]+$/.test(upiVpa.trim())) {
      setUpiError('Enter a valid UPI ID (e.g., name@upi)');
      return false;
    }
    return true;
  };

  // ── Processing state machine ──────────────────────────────────────────────
  const runProcessing = (isDecline: boolean) => {
    setPhase('processing');
    setProcessingMsgIdx(0);

    const delays = [0, 600, 1100, 1600];
    delays.forEach((d, i) => {
      const t = setTimeout(() => setProcessingMsgIdx(i), d);
      timerRefs.current.push(t);
    });

    const finalT = setTimeout(() => {
      clearTimers();
      if (isDecline) {
        setPhase('failed');
      } else {
        const oid = generateOrderId();
        setResolvedOrderId(oid);
        setPhase('success');
        const t2 = setTimeout(() => {
          onResolve(true, oid);
        }, 1200);
        timerRefs.current.push(t2);
      }
    }, 1800);

    timerRefs.current.push(finalT);
  };

  // ── UPI submit ────────────────────────────────────────────────────────────
  const handleUpiPay = () => {
    if (!validateUpi()) return;
    setPhase('processing');
    setProcessingMsgIdx(0);

    const t1 = setTimeout(() => setProcessingMsgIdx(1), 800);
    const t2 = setTimeout(() => {
      const oid = generateOrderId();
      setResolvedOrderId(oid);
      setPhase('success');
      const t3 = setTimeout(() => onResolve(true, oid), 1200);
      timerRefs.current.push(t3);
    }, 2500);

    timerRefs.current.push(t1, t2);
  };

  // ── Card submit ───────────────────────────────────────────────────────────
  const handleCardPay = () => {
    if (!validateCard()) return;
    const isDecline = rawDigits === DECLINE_NUMBER;
    runProcessing(isDecline);
  };

  const handleRetry = () => {
    clearTimers();
    setPhase('idle');
    setCardError(null);
    setExpiryError(null);
    setCvvError(null);
    setNameError(null);
    setUpiError(null);
  };

  const amountStr =
    currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount.toFixed(2)}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...glassL2, padding: '1.75rem', fontFamily: 'Inter, sans-serif', color: '#fff', maxWidth: 480 }}>
      {/* Demo badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(245,158,11,0.10)',
          border: '1px solid rgba(245,158,11,0.30)',
          borderRadius: '0.5rem',
          padding: '0.4rem 0.8rem',
          marginBottom: '1.25rem',
          width: 'fit-content',
        }}
      >
        <AlertTriangle size={13} color="#f59e0b" />
        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#f59e0b', letterSpacing: '0.03em' }}>
          TEST / DEMO PAYMENT — No real transaction
        </span>
      </div>

      {/* Amount header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Amount Due
        </p>
        <p
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {amountStr}
        </p>
      </div>

      {/* ── Processing / Success / Failed overlays ── */}
      <AnimatePresence mode="wait">
        {phase === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '2rem 0',
            }}
          >
            {/* Spinner */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                border: `3px solid rgba(14,165,233,0.2)`,
                borderTop: `3px solid ${ACCENT}`,
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <AnimatePresence mode="wait">
              <motion.p
                key={processingMsgIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {PROCESSING_MESSAGES[processingMsgIdx]}
              </motion.p>
            </AnimatePresence>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center' }}>
              Please do not close this window…
            </p>
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '2rem 0',
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid rgba(34,197,94,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 32px rgba(34,197,94,0.3)',
              }}
            >
              <Check size={36} color="#22c55e" />
            </motion.div>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#22c55e', margin: '0 0 0.25rem' }}>
                Payment Successful!
              </h3>
              {rawDigits && (
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.15rem' }}>
                  Card ending in ···· {rawDigits.slice(-4)}
                </p>
              )}
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                Order ID: {resolvedOrderId}
              </p>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Redirecting to confirmation…
            </p>
          </motion.div>
        )}

        {phase === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '2rem 0',
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.15)',
                border: '2px solid rgba(239,68,68,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 32px rgba(239,68,68,0.3)',
              }}
            >
              <X size={36} color="#ef4444" />
            </motion.div>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#ef4444', margin: '0 0 0.4rem' }}>
                Payment Declined
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                Please check your card details or try a different payment method.
              </p>
            </div>
            <button
              onClick={handleRetry}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem 2rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0.625rem',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')
              }
            >
              Try Again
            </button>
          </motion.div>
        )}

        {phase === 'idle' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Tab switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '0.625rem',
                padding: '3px',
                marginBottom: '1.25rem',
                gap: '3px',
              }}
            >
              {(['card', 'upi'] as PaymentTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    background: tab === t ? 'rgba(255,255,255,0.10)' : 'transparent',
                    border: tab === t ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
                    borderRadius: '0.45rem',
                    color: tab === t ? '#fff' : 'rgba(255,255,255,0.45)',
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s',
                    boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                  }}
                >
                  {t === 'card' ? <CreditCard size={14} /> : <Smartphone size={14} />}
                  {t === 'card' ? 'Card' : 'UPI'}
                </button>
              ))}
            </div>

            {/* ── Card form ── */}
            {tab === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <CardPreview
                  number={rawDigits}
                  name={cardName}
                  expiry={expiry}
                  network={network}
                />

                <PaymentInput
                  label="Card Number"
                  value={cardNumber}
                  onChange={handleCardNumber}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  inputMode="numeric"
                  error={cardError ?? undefined}
                  rightSlot={network !== 'unknown' ? <CardNetworkLogo network={network} /> : undefined}
                />

                <PaymentInput
                  label="Cardholder Name"
                  value={cardName}
                  onChange={(v) => { setCardName(v); setNameError(null); }}
                  placeholder="Ravi Kumar"
                  error={nameError ?? undefined}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <PaymentInput
                    label="Expiry (MM/YY)"
                    value={expiry}
                    onChange={handleExpiry}
                    placeholder="08/28"
                    maxLength={5}
                    inputMode="numeric"
                    error={expiryError ?? undefined}
                  />
                  <PaymentInput
                    label={cvvLabel}
                    value={cvv}
                    onChange={handleCvv}
                    type="password"
                    placeholder={network === 'amex' ? '••••' : '•••'}
                    maxLength={cvvMax}
                    inputMode="numeric"
                    error={cvvError ?? undefined}
                  />
                </div>

                {/* Test card hint */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '0.5rem',
                    padding: '0.6rem 0.8rem',
                  }}
                >
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>
                    <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Test cards:</strong>{' '}
                    4242 4242 4242 4242 → success &nbsp;·&nbsp;
                    4000 0000 0000 0002 → decline
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCardPay}
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    background: ACCENT,
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 4px 24px rgba(14,165,233,0.4)`,
                    letterSpacing: '0.01em',
                  }}
                >
                  <CreditCard size={17} />
                  Pay {amountStr}
                </motion.button>
              </div>
            )}

            {/* ── UPI form ── */}
            {tab === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <UpiQrPlaceholder />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>or enter UPI ID</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                <PaymentInput
                  label="UPI ID (VPA)"
                  value={upiVpa}
                  onChange={(v) => { setUpiVpa(v); setUpiError(null); }}
                  placeholder="yourname@upi"
                  error={upiError ?? undefined}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpiPay}
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    background: ACCENT,
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 4px 24px rgba(14,165,233,0.4)`,
                  }}
                >
                  <Smartphone size={17} />
                  Pay via UPI — {amountStr}
                </motion.button>

                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: 0 }}>
                  You'll receive a confirmation request on your UPI app
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
