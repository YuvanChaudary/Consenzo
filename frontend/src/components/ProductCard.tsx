import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { useCartStore } from '@/store/useCartStore';
import type { MockProduct } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductCardProps {
  product: MockProduct;
  onAddToCart?: (product: MockProduct) => void;
  showBadge?: boolean;
  compact?: boolean;
  layoutId?: string;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Best Seller': { bg: 'rgba(14,165,233,0.18)', color: '#0EA5E9' },
  'Top Rated':   { bg: 'rgba(14,165,233,0.18)', color: '#0EA5E9' },
  'Deal':        { bg: 'rgba(245,158,11,0.18)', color: '#f59e0b' },
  'New':         { bg: 'rgba(16,185,129,0.18)', color: '#10b981' },
};

function getBadgeStyle(badge: string) {
  return BADGE_COLORS[badge] ?? { bg: 'rgba(255,255,255,0.10)', color: '#fff' };
}

// ─── Image with fallback ──────────────────────────────────────────────────────
interface ProductImageProps {
  src?: string;
  productId?: string;
  alt: string;
  height: number;
}

function ProductImage({ src, productId, alt, height }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    src || (productId ? `https://images-na.ssl-images-amazon.com/images/P/${productId}.01._SX400_.jpg` : '')
  );
  const [triedFallback, setTriedFallback] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleError = () => {
    if (!triedFallback && productId && imgSrc !== `https://images-na.ssl-images-amazon.com/images/P/${productId}.01._SX400_.jpg`) {
      setTriedFallback(true);
      setImgSrc(`https://images-na.ssl-images-amazon.com/images/P/${productId}.01._SX400_.jpg`);
    } else {
      setErrored(true);
    }
  };

  if (errored || !imgSrc) {
    return (
      <div
        style={{
          width: '100%',
          height,
          background: 'linear-gradient(135deg, #0A0E17 0%, #0D2137 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '0.5rem',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.75rem',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '0 1rem',
        }}
      >
        <AlertCircle size={24} strokeWidth={1.5} />
        <span style={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alt}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onError={handleError}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
          transition: 'transform 0.4s ease',
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProductCard({
  product,
  onAddToCart,
  showBadge = true,
  compact = false,
  layoutId,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [cartState, setCartState] = useState<'idle' | 'added'>('idle');

  const imageHeight = compact ? 160 : 200;
  const cardWidth = compact ? 220 : undefined;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!product.inStock) return;

      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        priceInr: product.priceInr,
        image: product.images[0] ?? '',
        category: product.category,
      });

      onAddToCart?.(product);

      setCartState('added');
      setTimeout(() => setCartState('idle'), 1800);
    },
    [addItem, onAddToCart, product]
  );

  const discount =
    product.originalPriceInr && product.originalPriceInr > product.priceInr
      ? Math.round(
          ((product.originalPriceInr - product.priceInr) / product.originalPriceInr) * 100
        )
      : null;

  return (
    <motion.div
      layoutId={layoutId}
      style={{ width: cardWidth, flexShrink: compact ? 0 : undefined }}
      whileHover={{ y: -4, rotateX: 3, rotateY: 3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Link
        to={`/product/${product.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div
          style={{
            background: 'rgba(13,18,32,0.92)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'border-color 0.2s ease',
            willChange: 'transform',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(14,165,233,0.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          {/* ── Image area ──────────────────────────────────────────────────── */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <ProductImage
              src={product.images[0]}
              productId={product.id}
              alt={product.name}
              height={imageHeight}
            />

            {/* Stock overlay */}
            {!product.inStock && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(10,14,23,0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(10,14,23,0.85)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 6,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Out of Stock
                </span>
              </div>
            )}

            {/* Badge */}
            {showBadge && product.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 20,
                  fontSize: '0.68rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  background: getBadgeStyle(product.badge).bg,
                  color: getBadgeStyle(product.badge).color,
                  border: `1px solid ${getBadgeStyle(product.badge).color}40`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {product.badge}
              </span>
            )}

            {/* Discount pill */}
            {discount !== null && (
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  padding: '0.2rem 0.55rem',
                  borderRadius: 20,
                  fontSize: '0.68rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  background: 'rgba(245,158,11,0.18)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245,158,11,0.35)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* ── Body ────────────────────────────────────────────────────────── */}
          <div
            style={{
              padding: compact ? '0.75rem' : '0.875rem 1rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              flex: 1,
            }}
          >
            {/* Brand + Velocity Tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#0EA5E9',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {product.brand}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {product.reviewCount > 1000 ? '1K+ bought' : '300+ bought'}
              </span>
            </div>

            {/* Product name */}
            <h3
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: compact ? '0.82rem' : '0.95rem',
                fontWeight: 600,
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.name}
            </h3>

            {/* Star rating */}
            <StarRating
              rating={product.rating}
              reviewCount={compact ? undefined : product.reviewCount}
              size="sm"
            />

            {/* Price row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.5rem',
                marginTop: '0.1rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: compact ? '1rem' : '1.2rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {formatPrice(product.priceInr)}
              </span>
              {product.originalPriceInr && (
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.35)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatPrice(product.originalPriceInr)}
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <motion.button
              onClick={handleAddToCart}
              disabled={!product.inStock || cartState === 'added'}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: compact ? '0.5rem' : '0.6rem 1rem',
                borderRadius: 10,
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.83rem',
                fontWeight: 600,
                cursor: product.inStock ? 'pointer' : 'not-allowed',
                background:
                  cartState === 'added'
                    ? 'rgba(16,185,129,0.85)'
                    : product.inStock
                    ? '#0EA5E9'
                    : 'rgba(255,255,255,0.07)',
                color:
                  product.inStock ? '#ffffff' : 'rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow:
                  cartState === 'added'
                    ? '0 0 16px rgba(16,185,129,0.4)'
                    : product.inStock
                    ? '0 0 16px rgba(14,165,233,0.35)'
                    : 'none',
                transition: 'background 0.25s ease, box-shadow 0.25s ease',
              }}
              whileTap={product.inStock ? { scale: 0.96 } : {}}
            >
              <AnimatePresence mode="wait" initial={false}>
                {cartState === 'added' ? (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                    Added!
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ShoppingCart size={14} strokeWidth={2} />
                    {product.inStock ? 'Add to Cart' : 'Unavailable'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
