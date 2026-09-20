import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv2, Laptop, Headphones, Speaker, ArrowRight, Sparkles,
  Users, Brain, Clock, Flame, ShieldCheck, RefreshCw,
  Truck, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice } from '@/lib/utils';

// ─── Visual Category Nav Bar (Flipkart Style) ──────────────────────────────────
const CATEGORY_ITEMS = [
  { id: 'all', name: 'All Products', icon: Zap, path: '/catalog' },
  { id: 'smart-tvs', name: 'Smart TVs', icon: Tv2, path: '/catalog/smart-tvs' },
  { id: 'laptops', name: 'Laptops', icon: Laptop, path: '/catalog/laptops' },
  { id: 'soundbars', name: 'Soundbars', icon: Speaker, path: '/catalog/soundbars' },
  { id: 'headphones', name: 'Audio Gear', icon: Headphones, path: '/catalog/soundbars' },
  { id: 'co-shopping', name: 'Co-Shopping Squads', icon: Users, path: '/room/create', badge: 'Active' },
];

// ─── Hero Carousel Banners (Amazon Style) ──────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    tag: 'Shippyfy Grand Tech Festival',
    title: 'Flagship Smart TVs & OLED Displays',
    subtitle: 'Save up to 45% with instant bank rebates + collective group buy discounts.',
    ctaText: 'Explore Smart TVs',
    ctaLink: '/catalog/smart-tvs',
    accentColor: '#0EA5E9',
    bgGradient: 'radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.3) 0%, rgba(10,14,23,0.95) 70%)',
  },
  {
    id: 2,
    tag: 'Next-Gen Performance',
    title: 'Workstations & High-FPS Gaming Laptops',
    subtitle: 'Intel Core Ultra & Apple M3 silicon. AI-assisted co-shopping and consensus matching.',
    ctaText: 'Browse Laptops',
    ctaLink: '/catalog/laptops',
    accentColor: '#8B5CF6',
    bgGradient: 'radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.3) 0%, rgba(10,14,23,0.95) 70%)',
  },
  {
    id: 3,
    tag: 'Shippyfy Consensus Engine',
    title: 'Shop Together, Pay Fairly, No Friction',
    subtitle: 'Bring family or flatmates. Private AI shopping preferences calculate the perfect consensus match for the whole squad.',
    ctaText: 'Start a Co-Shopping Squad',
    ctaLink: '/room/create',
    accentColor: '#10B981',
    bgGradient: 'radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.28) 0%, rgba(10,14,23,0.95) 70%)',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Flash deals countdown timer (Simulated live Amazon/Flipkart flash sale)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Product slices for Amazon-style 4-in-1 quad cards and rails
  const tvs = useMemo(() => MOCK_PRODUCTS.filter((p) => p.category === 'smart-tvs'), []);
  const laptops = useMemo(() => MOCK_PRODUCTS.filter((p) => p.category === 'laptops'), []);
  const audio = useMemo(() => MOCK_PRODUCTS.filter((p) => p.category === 'soundbars'), []);
  const lightningDeals = useMemo(() => MOCK_PRODUCTS.slice(0, 8), []);

  return (
    <div style={{ background: '#0A0E17', minHeight: '100vh', color: '#ffffff', overflowX: 'hidden' }}>

      {/* ── 1. Top Category Bar (Flipkart Style Navigation Strip) ──────────────── */}
      <nav
        aria-label="Category Navigation"
        style={{
          background: 'rgba(13,18,32,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 64, // below navbar
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1380,
            margin: '0 auto',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0EA5E9';
                  e.currentTarget.style.borderColor = 'rgba(14,165,233,0.35)';
                  e.currentTarget.style.background = 'rgba(14,165,233,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <Icon size={16} color="#0EA5E9" />
                <span>{item.name}</span>
                {item.badge && (
                  <span
                    style={{
                      background: '#10B981',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 6,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── 2. Amazon-Style Hero Carousel with Gradient Fade ───────────────────── */}
      <section style={{ position: 'relative', width: '100%', minHeight: 480, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: HERO_SLIDES[currentSlide].bgGradient,
              display: 'flex',
              alignItems: 'center',
              padding: '2rem 1.5rem 8rem',
            }}
          >
            <div style={{ maxWidth: 1380, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: 680 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: 20,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: HERO_SLIDES[currentSlide].accentColor,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  <Sparkles size={13} />
                  {HERO_SLIDES[currentSlide].tag}
                </span>

                <h1
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: '-0.03em',
                    color: '#fff',
                    margin: '0 0 1rem',
                  }}
                >
                  {HERO_SLIDES[currentSlide].title}
                </h1>

                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.05rem',
                    color: 'rgba(255,255,255,0.68)',
                    lineHeight: 1.6,
                    margin: '0 0 1.75rem',
                  }}
                >
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(HERO_SLIDES[currentSlide].ctaLink)}
                    style={{
                      padding: '0.85rem 1.8rem',
                      borderRadius: 12,
                      border: 'none',
                      background: HERO_SLIDES[currentSlide].accentColor,
                      color: '#fff',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: `0 4px 24px ${HERO_SLIDES[currentSlide].accentColor}55`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {HERO_SLIDES[currentSlide].ctaText}
                    <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => navigate('/room/create')}
                    style={{
                      padding: '0.85rem 1.6rem',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Users size={16} />
                    Group Consensus Buy
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
          style={{
            position: 'absolute',
            left: 20,
            top: '40%',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(10,14,23,0.6)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          style={{
            position: 'absolute',
            right: 20,
            top: '40%',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(10,14,23,0.6)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <ChevronRight size={22} />
        </button>

        {/* Bottom gradient mask for smooth overlap into cards */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            background: 'linear-gradient(to bottom, transparent 0%, #0A0E17 100%)',
            pointerEvents: 'none',
          }}
        />
      </section>

      {/* ── 3. Amazon Overlapping Modular 4-in-1 Quad Cards Row ────────────────── */}
      <section
        style={{
          maxWidth: 1380,
          margin: '-120px auto 3rem',
          padding: '0 1.25rem',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Card 1: Top Deals in Smart TVs (2x2 Quad) */}
          <QuadCard
            title="Top Deals in Smart TVs"
            subtitle="QLED & 4K Ultra HD"
            items={tvs.slice(0, 4)}
            seeMoreLink="/catalog/smart-tvs"
            seeMoreLabel="Explore all Smart TVs"
          />

          {/* Card 2: Laptops for Work & Play (2x2 Quad) */}
          <QuadCard
            title="Performance Laptops"
            subtitle="Up to ₹25,000 Off"
            items={laptops.slice(0, 4)}
            seeMoreLink="/catalog/laptops"
            seeMoreLabel="View top laptop deals"
          />

          {/* Card 3: Cinematic Soundbars (2x2 Quad) */}
          <QuadCard
            title="Dolby Atmos Soundbars"
            subtitle="Immersive room audio"
            items={audio.slice(0, 4)}
            seeMoreLink="/catalog/soundbars"
            seeMoreLabel="Discover audio systems"
          />

          {/* Card 4: Shippyfy Group Consensus Hub (Special Interactive Card) */}
          <div
            style={{
              background: 'rgba(13,18,32,0.95)',
              border: '1px solid rgba(14,165,233,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(14,165,233,0.2)',
              borderRadius: 16,
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    background: 'rgba(14,165,233,0.15)',
                    color: '#0EA5E9',
                    borderRadius: 6,
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Exclusive Mode
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 0 0.35rem',
                }}
              >
                Buy Together With Zero Arguments
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
                Start a group purchase with friends or family. Everyone sets their budget & must-haves privately, and Shippyfy finds the single product everyone loves.
              </p>

              <div
                style={{
                  margin: '1.25rem 0',
                  padding: '0.85rem',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Squad Invite Code Example</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#38BDF8' }}>
                    SPF-7821
                  </div>
                </div>
                <Users size={24} color="#0EA5E9" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => navigate('/room/create')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 10,
                  border: 'none',
                  background: '#0EA5E9',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Sparkles size={15} />
                Start Co-Shopping Squad
              </button>
              <button
                onClick={() => navigate('/room/join')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Have a Code? Join Squad Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Flash Deals & Lightning Rail with Urgency Countdown ──────────────── */}
      <section style={{ maxWidth: 1380, margin: '0 auto 4rem', padding: '0 1.25rem' }}>
        <div
          style={{
            background: 'rgba(13,18,32,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18,
            padding: '1.5rem',
          }}
        >
          {/* Header with Countdown Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flame size={22} color="#EF4444" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: '#fff',
                      margin: 0,
                    }}
                  >
                    Today's Lightning Deals
                  </h2>
                  <span
                    style={{
                      background: '#EF4444',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 4,
                      letterSpacing: '0.04em',
                    }}
                  >
                    LIMITED TIME
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: '0.2rem 0 0' }}>
                  Hand-picked price cuts refreshed daily
                </p>
              </div>
            </div>

            {/* Countdown Clock Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.45rem 0.85rem',
                borderRadius: 10,
              }}
            >
              <Clock size={16} color="#EF4444" />
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginRight: '0.25rem' }}>
                Ends in:
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Horizontal Scroller Rail */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {lightningDeals.map((product) => (
              <div key={product.id} style={{ flexShrink: 0, width: 240 }}>
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Trust & Quality Signals (Amazon/Flipkart Indian Ecosystem Standards) ─ */}
      <section style={{ maxWidth: 1380, margin: '0 auto 4rem', padding: '0 1.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <TrustPillar
            icon={ShieldCheck}
            title="Open-Box Verification"
            description="Inspect television panel & accessories before sharing delivery OTP."
          />
          <TrustPillar
            icon={Truck}
            title="Express Fulfilled Shipping"
            description="Guaranteed next-day delivery on top tech across major metro pin codes."
          />
          <TrustPillar
            icon={RefreshCw}
            title="7-Day Hassle-Free Replacement"
            description="Instant brand technician replacement for any transit defect or issue."
          />
          <TrustPillar
            icon={Brain}
            title="Consensus Co-Shopping"
            description="Shippyfy guarantees zero-conflict picks where every squad member's budget and criteria are satisfied."
          />
        </div>
      </section>

      {/* ── 6. Full Trending Product Grid ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1380, margin: '0 auto 5rem', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
              Trending Electronics
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0 0' }}>
              Highest velocity devices rated 4.0★ and above
            </p>
          </div>
          <Link
            to="/catalog"
            style={{
              color: '#0EA5E9',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            Explore Catalog <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {MOCK_PRODUCTS.slice(4, 16).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}

// ─── Sub-Component: 4-in-1 Quad Card (Amazon Pattern) ──────────────────────────
function QuadCard({
  title,
  subtitle,
  items,
  seeMoreLink,
  seeMoreLabel,
}: {
  title: string;
  subtitle: string;
  items: any[];
  seeMoreLink: string;
  seeMoreLabel: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: 'rgba(13,18,32,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#0EA5E9', fontWeight: 600, margin: '0.2rem 0 1rem' }}>
          {subtitle}
        </p>

        {/* 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          {items.map((prod) => (
            <div
              key={prod.id}
              onClick={() => navigate(`/product/${prod.id}`)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(14,165,233,0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                style={{
                  height: 90,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#0A0E17',
                  marginBottom: '0.4rem',
                }}
              >
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {prod.brand} {prod.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.15rem' }}>
                {formatPrice(prod.priceInr)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        to={seeMoreLink}
        style={{
          marginTop: '1.25rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#0EA5E9',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {seeMoreLabel} →
      </Link>
    </div>
  );
}

// ─── Sub-Component: Trust Pillar ──────────────────────────────────────────────
function TrustPillar({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(13,18,32,0.85)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(14,165,233,0.12)',
          border: '1px solid rgba(14,165,233,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="#0EA5E9" />
      </div>
      <div>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  );
}
