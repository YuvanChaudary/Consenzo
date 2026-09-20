import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Sparkles, Check,
  ChevronLeft, ArrowRight, Package,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { ProductCard } from '@/components/ProductCard';
import { StarRating } from '@/components/ui/StarRating';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import type { MockProduct } from '@/lib/mockData';

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const GLASS_L1 = {
  background: 'rgba(255,255,255,0.045)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
} as const;

// ─── Mock color options (category-agnostic) ───────────────────────────────────
const COLOR_OPTIONS = [
  { name: 'Midnight Black', hex: '#1a1a2e' },
  { name: 'Starlight Silver', hex: '#c8cdd5' },
  { name: 'Deep Navy', hex: '#1a2744' },
  { name: 'Champagne Gold', hex: '#c9a96e' },
];

// ─── Mock short description by product id ────────────────────────────────────
function getShortDescription(product: MockProduct): string {
  const descs: Record<string, string> = {
    'tv-samsung-55-qled':
      'The Samsung Neo QLED QN90C delivers breathtaking picture quality with Quantum Matrix Technology and Object Tracking Sound. Perfect for gaming or cinematic experiences in any room lighting condition.',
    'tv-lg-oled-65':
      'LG OLED evo C3 raises the bar with pixel-level lighting control and infinite contrast ratio. Its Brightness Booster Max makes this the reference display for home theaters.',
    'tv-sony-4k-55':
      'Sony BRAVIA XR combines Cognitive Processor XR with Full Array LED for lifelike detail and natural color. Acoustic Multi-Audio fills your room with cinema-quality sound from the TV itself.',
    'tv-mi-43-4k':
      'Xiaomi Mi TV 5X delivers an outstanding 4K HDR visual experience at a fraction of the cost. Powered by Android TV with PatchWall UI and access to thousands of apps.',
    'tv-hisense-50-uled':
      'Hisense ULED U6K uses mini-LED backlighting with 144Hz refresh rate for smooth gaming and vivid sports. Quantum Dot technology ensures accurate, wide-gamut color reproduction.',
    'laptop-macbook-air-m3':
      'MacBook Air with M3 is the world\'s thinnest 13-inch laptop — 15 hours battery, no fan noise, and effortless performance for everything from email to 4K video editing.',
    'laptop-asus-rog-strix':
      'The ROG Strix G16 is built to dominate every title with its RTX 4070 GPU and QHD 240Hz display. ROG Intelligent Cooling keeps thermals in check even during the most intensive sessions.',
    'laptop-dell-xps-13':
      'Dell XPS 13 Plus blends Evo-certified performance with a stunning OLED touch display in a premium CNC machined chassis. The capacitive function row and haptic touchpad redefine laptop interaction.',
    'laptop-hp-pavilion':
      'HP Pavilion 15 offers reliable everyday computing with AMD Ryzen power and a comfortable full-size keyboard. Great for students, home workers, and multimedia consumption.',
    'hp-sony-wh1000xm5':
      'Sony WH-1000XM5 sets the industry benchmark for active noise cancellation with 8 microphones and Auto NC Optimizer. Multipoint connection lets you seamlessly switch between two Bluetooth devices.',
    'hp-bose-qc45':
      'Bose QuietComfort 45 delivers the legendary Bose sound and all-day comfort with TriPort acoustic architecture. Quiet and Aware Mode let you switch effortlessly between worlds.',
    'hp-airpods-max':
      'AirPods Max brings the magic of AirPods to a stunning over-ear design with custom acoustic drivers and H1 chip. Spatial Audio with dynamic head tracking creates an immersive theater experience.',
    'hp-jbl-tour-one':
      'JBL Tour One M2 delivers LDAC Hi-Res Audio and adaptive ANC powered by four microphones. True Adaptive ANC automatically adjusts to your environment every 200ms.',
    'sb-sony-ht-a7000':
      'Sony HT-A7000 creates a cinematic surround field with 360 Spatial Sound Mapping and Dolby Atmos. Vertical Sound Engine projects sound upward for overhead audio without ceiling speakers.',
    'sb-samsung-hw-q990c':
      'Samsung HW-Q990C delivers the most immersive audio experience with wireless rear speakers and AI Sound Pro. SpaceFit Sound Pro analyzes your room acoustics and automatically optimizes output.',
    'sb-jbl-bar-1000':
      'JBL Bar 1000 features detachable rear satellite speakers and a 10-inch wireless subwoofer for true surround sound. MultiBeam technology precisely steers audio for maximum immersion.',
  };
  return (
    descs[product.id] ??
    `${product.name} is a premium ${product.category.replace(/-/g, ' ')} delivering exceptional performance and build quality from ${product.brand}.`
  );
}

// ─── ImageGallery ─────────────────────────────────────────────────────────────
interface ImageGalleryProps {
  images: string[];
  name: string;
}

function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [errored, setErrored] = useState<boolean[]>(images.map(() => false));

  const markError = (i: number) =>
    setErrored((prev) => { const next = [...prev]; next[i] = true; return next; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Main image */}
      <div style={{
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(13,18,32,0.92)',
        border: '1px solid rgba(255,255,255,0.06)',
        aspectRatio: '4/3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%' }}
          >
            {errored[activeIdx] ? (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #0A0E17 0%, #0D2137 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '0.75rem',
                color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem', textAlign: 'center', padding: '1rem',
              }}>
                <Package size={40} strokeWidth={1} />
                <span>{name}</span>
              </div>
            ) : (
              <img
                src={images[activeIdx]}
                alt={`${name} view ${activeIdx + 1}`}
                onError={() => markError(activeIdx)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        {images.map((img, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveIdx(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: 72, height: 56, borderRadius: 10, overflow: 'hidden',
              border: `2px solid ${i === activeIdx ? '#0EA5E9' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer', background: 'rgba(13,18,32,0.92)',
              padding: 0, flexShrink: 0,
              transition: 'border-color 0.18s ease',
            }}
          >
            {errored[i] ? (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #0A0E17, #0D2137)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Package size={16} color="rgba(255,255,255,0.25)" />
              </div>
            ) : (
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                onError={() => markError(i)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── SpecsTable ───────────────────────────────────────────────────────────────
function SpecsTable({ product }: { product: MockProduct }) {
  return (
    <div style={{ ...GLASS_L1, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{
        padding: '1.25rem 1.5rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h3 style={{
          fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', fontWeight: 700,
          color: '#fff', margin: 0,
        }}>
          Specifications
        </h3>
      </div>

      {product.specs.map((spec, idx) => (
        <div
          key={spec.key}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '0.75rem 1.5rem',
            background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)',
            borderBottom: idx < product.specs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            gap: '1rem',
          }}
        >
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.45)', fontWeight: 500,
            flexShrink: 0, minWidth: 120,
          }}>
            {spec.label}
          </span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.85)', fontWeight: 500, textAlign: 'right',
          }}>
            {typeof spec.value === 'boolean'
              ? spec.value ? '✓ Yes' : '✗ No'
              : `${spec.value}${spec.unit ? ' ' + spec.unit : ''}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── ProductPage ──────────────────────────────────────────────────────────────
export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  // Redirect if not found
  useEffect(() => {
    if (!product) navigate('/catalog', { replace: true });
  }, [product, navigate]);

  const [cartState, setCartState] = useState<'idle' | 'added'>('idle');
  const [selectedColor, setSelectedColor] = useState(0);

  const relatedProducts = product
    ? MOCK_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  const handleAddToCart = useCallback(() => {
    if (!product || !product.inStock) return;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      priceInr: product.priceInr,
      image: product.images?.[0] ?? '',
      category: product.category,
    });
    setCartState('added');
    setTimeout(() => setCartState('idle'), 2000);
  }, [addItem, product]);

  if (!product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#fff' }}>Product Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>The product you are looking for does not exist or has been removed.</p>
        <Link to="/catalog" style={{ padding: '0.75rem 1.5rem', background: '#0EA5E9', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  const discount =
    product.originalPriceInr && product.originalPriceInr > product.priceInr
      ? Math.round(((product.originalPriceInr - product.priceInr) / product.originalPriceInr) * 100)
      : null;

  return (
    <div style={{ background: '#0A0E17', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1.5rem 4rem' }}>

        {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.75rem' }}>
          <Link
            to="/catalog"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            <ChevronLeft size={14} /> Back to Catalog
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>/</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#0EA5E9' }}>
            {product.name}
          </span>
        </div>

        {/* ── 2-col: gallery + info ────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem', alignItems: 'start',
          marginBottom: '4rem',
        }}>
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <ImageGallery images={product.images} name={product.name} />
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Brand + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700,
                color: '#0EA5E9', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {product.brand}
              </span>
              {product.badge && (
                <span style={{
                  padding: '0.18rem 0.55rem', borderRadius: 20,
                  background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.35)',
                  color: '#0EA5E9', fontSize: '0.68rem', fontFamily: 'Inter, sans-serif', fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Product name */}
            <h1 style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700, color: '#ffffff', margin: 0,
              lineHeight: 1.25, letterSpacing: '-0.025em',
            }}>
              {product.name}
            </h1>

            {/* Rating */}
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800, color: '#ffffff', lineHeight: 1,
              }}>
                {formatPrice(product.priceInr)}
              </span>
              {product.originalPriceInr && (
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                  color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through',
                }}>
                  {formatPrice(product.originalPriceInr)}
                </span>
              )}
              {discount && (
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 8,
                  background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                  color: '#f59e0b', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                }}>
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Short description */}
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.925rem',
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0,
            }}>
              {getShortDescription(product)}
            </p>

            {/* Color variant */}
            <div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.45)', marginBottom: '0.6rem',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Color — {COLOR_OPTIONS[selectedColor].name}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {COLOR_OPTIONS.map((c, i) => (
                  <motion.button
                    key={c.name}
                    onClick={() => setSelectedColor(i)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={c.name}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c.hex, cursor: 'pointer', border: 'none',
                      outline: i === selectedColor
                        ? '2px solid #0EA5E9' : '2px solid transparent',
                      outlineOffset: 2,
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Stock status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: product.inStock ? '#10b981' : '#ef4444',
                boxShadow: product.inStock
                  ? '0 0 8px rgba(16,185,129,0.6)'
                  : '0 0 8px rgba(239,68,68,0.6)',
              }} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.82rem',
                color: product.inStock ? '#10b981' : '#ef4444', fontWeight: 600,
              }}>
                {product.inStock ? 'In Stock — Ready to Ship' : 'Currently Out of Stock'}
              </span>
            </div>

            {/* ── Dual CTA section ─────────────────────────────────────────── */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
              padding: '1.5rem', borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {/* Add to Cart */}
              <motion.button
                onClick={handleAddToCart}
                disabled={!product.inStock || cartState === 'added'}
                whileHover={product.inStock ? { scale: 1.02, boxShadow: '0 0 28px rgba(14,165,233,0.5)' } : {}}
                whileTap={product.inStock ? { scale: 0.98 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  width: '100%', padding: '0.9rem 1.5rem',
                  borderRadius: 12, border: 'none',
                  background: cartState === 'added'
                    ? 'rgba(16,185,129,0.85)'
                    : product.inStock ? '#0EA5E9' : 'rgba(255,255,255,0.06)',
                  color: product.inStock ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700,
                  cursor: product.inStock ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: cartState === 'added'
                    ? '0 0 20px rgba(16,185,129,0.4)'
                    : product.inStock ? '0 0 20px rgba(14,165,233,0.35)' : 'none',
                  transition: 'background 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {cartState === 'added' ? (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Check size={18} strokeWidth={2.5} />
                      Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ShoppingCart size={18} strokeWidth={2} />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  — OR —
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Group Decision CTA */}
              <motion.button
                onClick={() => navigate('/room/create')}
                whileHover={{ scale: 1.02, background: 'rgba(14,165,233,0.12)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  width: '100%', padding: '0.875rem 1.5rem',
                  borderRadius: 12,
                  border: '1px solid rgba(14,165,233,0.4)',
                  background: 'rgba(14,165,233,0.06)',
                  color: '#0EA5E9',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background 0.2s ease',
                }}
              >
                <Sparkles size={16} />
                Start a Co-Shopping Squad
              </motion.button>

              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.35)', margin: 0, textAlign: 'center', lineHeight: 1.5,
              }}>
                Shop together with friends or family. AI finds the single product everyone loves.
              </p>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {product.tags.map((tag) => (
                  <span key={tag} style={{
                    padding: '0.22rem 0.6rem', borderRadius: 20,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500,
                    color: 'rgba(255,255,255,0.45)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Specs Table ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '4rem' }}
        >
          <SpecsTable product={product} />
        </motion.div>

        {/* ── You might also like ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-end', marginBottom: '1.5rem',
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'Sora, sans-serif', fontSize: '1.5rem',
                  fontWeight: 700, color: '#fff', margin: '0 0 0.25rem',
                  letterSpacing: '-0.02em',
                }}>
                  You might also like
                </h2>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.4)', margin: 0,
                }}>
                  More from {MOCK_PRODUCTS.find((p) => p.id === id)
                    ? product.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    : 'this category'}
                </p>
              </div>
              <Link
                to={`/catalog/${product.category}`}
                style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                  color: '#0EA5E9', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'flex', gap: '1rem', overflowX: 'auto',
              paddingBottom: '0.5rem', scrollbarWidth: 'none',
            }}>
              {relatedProducts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                >
                  <ProductCard product={p} compact />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
