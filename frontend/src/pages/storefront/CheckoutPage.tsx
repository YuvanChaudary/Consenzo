import React, { CSSProperties, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  MapPin,
  CreditCard,
  Package,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice, generateOrderId } from '@/lib/utils';
import { MockPaymentSheet } from '@/components/MockPaymentSheet';

export interface CheckoutPageProps {
  onNavigate?: (route: string, params?: Record<string, unknown>) => void;
}

type Step = 'address' | 'payment' | 'confirmed';

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

// ─── Address form data ────────────────────────────────────────────────────────
interface AddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  saveAddress: boolean;
}

const emptyAddress: AddressForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  saveAddress: false,
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
interface StepIndicatorProps {
  current: Step;
}

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'address', label: 'Address', icon: <MapPin size={15} /> },
  { key: 'payment', label: 'Payment', icon: <CreditCard size={15} /> },
  { key: 'confirmed', label: 'Confirmed', icon: <Package size={15} /> },
];

const stepOrder: Step[] = ['address', 'payment', 'confirmed'];

function StepIndicator({ current }: StepIndicatorProps) {
  const currentIdx = stepOrder.indexOf(current);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2.5rem',
      }}
    >
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <motion.div
                animate={{
                  background: done
                    ? ACCENT
                    : active
                    ? ACCENT
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: active ? `0 0 16px rgba(14,165,233,0.45)` : 'none',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${
                    done || active ? ACCENT : 'rgba(255,255,255,0.15)'
                  }`,
                  color: done || active ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {done ? <Check size={15} /> : step.icon}
              </motion.div>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  color:
                    done || active ? '#fff' : 'rgba(255,255,255,0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: '0 0.75rem',
                  background: idx < currentIdx ? ACCENT : 'rgba(255,255,255,0.08)',
                  borderRadius: 1,
                  transition: 'background 0.4s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Input field helper ───────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  error?: string;
}

function Field({ label, value, onChange, type = 'text', placeholder, maxLength, required, error }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
        {required && <span style={{ color: ACCENT, marginLeft: '0.2rem' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${
            error ? '#ef4444' : focused ? ACCENT : 'rgba(255,255,255,0.12)'
          }`,
          borderRadius: '0.625rem',
          padding: '0.7rem 0.875rem',
          color: '#fff',
          fontSize: '0.9rem',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          transition: 'border-color 0.15s',
          boxShadow: focused ? `0 0 0 3px rgba(14,165,233,0.12)` : 'none',
        }}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>
      )}
    </div>
  );
}

// ─── Order Confirmation Panel ─────────────────────────────────────────────────
interface ConfirmationPanelProps {
  orderId: string;
  address: AddressForm;
  items: ReturnType<typeof useCartStore.getState>['items'];
  onNavigate: (r: string, p?: Record<string, unknown>) => void;
}

function OrderConfirmationPanel({ orderId, address, items, onNavigate }: ConfirmationPanelProps) {
  const estimated = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  })();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{ ...glassL1, padding: '2.5rem', textAlign: 'center' }}
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.25, 1] }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.15)',
          border: '2px solid rgba(34,197,94,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 32px rgba(34,197,94,0.25)',
        }}
      >
        <Check size={38} color="#22c55e" />
      </motion.div>

      <h2
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 0.5rem',
        }}
      >
        Order Placed!
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>
        Your order is confirmed and being processed.
      </p>
      <p
        style={{
          fontSize: '0.85rem',
          color: ACCENT,
          fontWeight: 600,
          marginBottom: '1.75rem',
        }}
      >
        Order #{orderId}
      </p>

      {/* Items ordered */}
      <div
        style={{
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.25rem',
          textAlign: 'left',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}
        >
          Items Ordered
        </p>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.4rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: '#fff' }}>
              {item.name}{' '}
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>× {item.quantity}</span>
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
              {formatPrice(item.priceInr * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Delivery info */}
      <div
        style={{
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.5rem',
          }}
        >
          Delivery Address
        </p>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
          {address.fullName}
          <br />
          {address.addressLine1}
          {address.addressLine2 && <>, {address.addressLine2}</>}
          <br />
          {address.city}, {address.state} — {address.pincode}
        </p>
        <p
          style={{
            marginTop: '0.75rem',
            fontSize: '0.82rem',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Package size={13} />
          Estimated delivery: {estimated} (3–5 business days)
        </p>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate('catalog')}
          style={{
            padding: '0.8rem 1.75rem',
            background: ACCENT,
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '0.925rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: `0 4px 20px rgba(14,165,233,0.35)`,
          }}
        >
          Continue Shopping
        </button>
        <button
          onClick={() => onNavigate('orders')}
          style={{
            padding: '0.8rem 1.75rem',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '0.75rem',
            fontSize: '0.925rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          Track Order
          <ExternalLink size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
interface OrderSummaryProps {
  items: ReturnType<typeof useCartStore.getState>['items'];
  sub: number;
  tax: number;
  shipping: number;
  total: number;
}

function OrderSidebarSummary({ items, sub, tax, shipping, total }: OrderSummaryProps) {
  return (
    <div style={{ ...glassL1, padding: '1.25rem', position: 'sticky', top: '5rem' }}>
      <h3
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '0.95rem',
          fontWeight: 700,
          margin: '0 0 1rem',
          color: '#fff',
        }}
      >
        Order Summary
      </h3>

      {/* Item thumbnails */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '0.4rem',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
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
                  <ShoppingBag size={14} color="rgba(255,255,255,0.2)" />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                × {item.quantity}
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {formatPrice(item.priceInr * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 0.75rem' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <SideRow label="Subtotal" value={formatPrice(sub)} />
        <SideRow
          label="Shipping"
          value={shipping === 0 ? 'FREE' : formatPrice(shipping)}
          color={shipping === 0 ? ACCENT : undefined}
        />
        <SideRow label="GST (18%)" value={formatPrice(tax)} />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.15rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
            Total
          </span>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SideRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: color ?? 'rgba(255,255,255,0.75)' }}>
        {value}
      </span>
    </div>
  );
}

export function CheckoutPage({ onNavigate: externalNav }: CheckoutPageProps) {
  const navigate = useNavigate();
  const onNavigate = externalNav ?? ((route: string, params?: Record<string, unknown>) => {
    if (route === 'catalog') return navigate('/catalog', { state: params });
    if (route === 'orders' || route === 'account') return navigate('/account', { state: params });
    if (route === 'create') return navigate('/room/create', { state: params });
    if (route === 'join') return navigate('/room/join', { state: params });
    const target = route.startsWith('/') ? route : `/${route}`;
    navigate(target, { state: params });
  });

  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('');

  const sub = subtotal();
  const TAX_RATE = 0.18;
  const tax = Math.round(sub * TAX_RATE);
  const shipping = sub > 999 ? 0 : 99;
  const total = sub + tax + shipping;

  const validateAddress = (): boolean => {
    const errors: Partial<Record<keyof AddressForm, string>> = {};
    if (!address.fullName.trim()) errors.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(address.phone)) errors.phone = 'Enter a valid 10-digit phone number';
    if (!address.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.state.trim()) errors.state = 'State is required';
    if (!/^\d{6}$/.test(address.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressContinue = () => {
    if (validateAddress()) setStep('payment');
  };

  const handlePaymentResolve = (success: boolean, paidOrderId?: string) => {
    if (success) {
      const oid = paidOrderId ?? generateOrderId();
      setOrderId(oid);
      setStep('confirmed');
    } else {
      setPaymentError('Payment declined — please try again.');
    }
  };

  // Clear cart when confirmed
  useEffect(() => {
    if (step === 'confirmed') {
      clearCart();
    }
  }, [step]);

  const setField =
    (key: keyof AddressForm) =>
    (value: string | boolean) => {
      setAddress((prev) => ({ ...prev, [key]: value }));
      if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
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
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: '0 0 2rem',
          }}
        >
          Checkout
        </h1>

        <StepIndicator current={step} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: step === 'confirmed' ? '1fr' : 'minmax(0, 60fr) minmax(0, 40fr)',
            gap: '1.75rem',
            alignItems: 'start',
          }}
          className="checkout-grid"
        >
          {/* ── Left: step content ── */}
          <div>
            <AnimatePresence mode="wait">
              {step === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  style={{ ...glassL1, padding: '1.75rem' }}
                >
                  <h2
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      margin: '0 0 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <MapPin size={18} color={ACCENT} />
                    Delivery Address
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Field
                      label="Full Name"
                      value={address.fullName}
                      onChange={setField('fullName') as (v: string) => void}
                      required
                      placeholder="Ravi Kumar"
                      error={fieldErrors.fullName}
                    />
                    <Field
                      label="Phone"
                      value={address.phone}
                      onChange={setField('phone') as (v: string) => void}
                      type="tel"
                      required
                      placeholder="9876543210"
                      maxLength={10}
                      error={fieldErrors.phone}
                    />
                    <Field
                      label="Address Line 1"
                      value={address.addressLine1}
                      onChange={setField('addressLine1') as (v: string) => void}
                      required
                      placeholder="Flat / House No., Building, Street"
                      error={fieldErrors.addressLine1}
                    />
                    <Field
                      label="Address Line 2 (optional)"
                      value={address.addressLine2}
                      onChange={setField('addressLine2') as (v: string) => void}
                      placeholder="Locality, Landmark"
                    />

                    {/* City + State row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      <Field
                        label="City"
                        value={address.city}
                        onChange={setField('city') as (v: string) => void}
                        required
                        placeholder="Bengaluru"
                        error={fieldErrors.city}
                      />
                      <Field
                        label="State"
                        value={address.state}
                        onChange={setField('state') as (v: string) => void}
                        required
                        placeholder="Karnataka"
                        error={fieldErrors.state}
                      />
                    </div>

                    <Field
                      label="Pincode"
                      value={address.pincode}
                      onChange={setField('pincode') as (v: string) => void}
                      required
                      placeholder="560001"
                      maxLength={6}
                      error={fieldErrors.pincode}
                    />

                    {/* Save address checkbox */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.65)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={address.saveAddress}
                        onChange={(e) => setField('saveAddress')(e.target.checked)}
                        style={{ accentColor: ACCENT, width: 16, height: 16, cursor: 'pointer' }}
                      />
                      Save this address for future orders
                    </label>
                  </div>

                  <button
                    onClick={handleAddressContinue}
                    style={{
                      marginTop: '1.5rem',
                      width: '100%',
                      padding: '0.9rem',
                      background: ACCENT,
                      border: 'none',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: `0 4px 20px rgba(14,165,233,0.35)`,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    Continue to Payment
                    <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  {paymentError && (
                    <div
                      style={{
                        background: 'rgba(239,68,68,0.10)',
                        border: '1px solid rgba(239,68,68,0.35)',
                        borderRadius: '0.75rem',
                        padding: '0.9rem 1.1rem',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      ⚠ {paymentError}
                      <button
                        onClick={() => setPaymentError(null)}
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <MockPaymentSheet
                    amount={total}
                    currency="INR"
                    onResolve={handlePaymentResolve}
                  />
                </motion.div>
              )}

              {step === 'confirmed' && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <OrderConfirmationPanel
                    orderId={orderId}
                    address={address}
                    items={items}
                    onNavigate={onNavigate}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: order summary (hidden on confirmed) ── */}
          {step !== 'confirmed' && (
            <OrderSidebarSummary
              items={items}
              sub={sub}
              tax={tax}
              shipping={shipping}
              total={total}
            />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
