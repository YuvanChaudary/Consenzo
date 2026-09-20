import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, ChevronDown, Search, Laptop,
  Tv2, Headphones, Speaker, Package,
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { ProductCard } from '@/components/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = 'price-asc' | 'price-desc' | 'rating-desc' | 'popularity';

interface ActiveFilters {
  categories: string[];
  brands: string[];
  minRating: number;
  priceMin: number;
  priceMax: number;
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: ActiveFilters = {
  categories: [],
  brands: [],
  minRating: 0,
  priceMin: 0,
  priceMax: 300000,
  inStockOnly: false,
};

// ─── Derive all available brands from mock data ───────────────────────────────
const ALL_BRANDS = [...new Set(MOCK_PRODUCTS.map((p) => p.brand))].sort();

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const GLASS_L1 = {
  background: 'rgba(255,255,255,0.045)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
} as const;

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Tv2, Laptop, Headphones, Speaker,
};

// ─── FilterChip ───────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.3rem 0.75rem', borderRadius: 20,
        background: 'rgba(14,165,233,0.14)', border: '1px solid rgba(14,165,233,0.35)',
        color: '#0EA5E9', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600,
        cursor: 'default',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#0EA5E9',
          padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1,
        }}
        aria-label={`Remove ${label} filter`}
      >
        <X size={11} strokeWidth={2.5} />
      </button>
    </motion.span>
  );
}

// ─── FilterSidebar ────────────────────────────────────────────────────────────
interface FilterSidebarProps {
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
  onReset: () => void;
}

function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const toggle = <K extends 'categories' | 'brands'>(key: K, val: string) => {
    const arr = filters[key] as string[];
    onChange({
      ...filters,
      [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
    });
  };

  const ratingOptions = [3, 4, 4.5];

  return (
    <div style={{
      ...GLASS_L1, borderRadius: 16, padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '1.5rem',
      position: 'sticky', top: 90, maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto', scrollbarWidth: 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'Sora, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <SlidersHorizontal size={16} color="#0EA5E9" /> Filters
        </span>
        <button onClick={onReset} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
          padding: 0,
        }}>
          Reset all
        </button>
      </div>

      {/* Category */}
      <div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Category
        </div>
        {MOCK_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? Tv2;
          const active = filters.categories.includes(cat.id);
          return (
            <label key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
              padding: '0.45rem 0.5rem', borderRadius: 8, marginBottom: '0.1rem',
              background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle('categories', cat.id)}
                style={{ accentColor: '#0EA5E9', width: 14, height: 14 }}
              />
              <Icon size={14} color={active ? '#0EA5E9' : 'rgba(255,255,255,0.45)'} strokeWidth={1.75} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                color: active ? '#0EA5E9' : 'rgba(255,255,255,0.65)',
                flex: 1,
              }}>
                {cat.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{cat.count}</span>
            </label>
          );
        })}
      </div>

      {/* Brand */}
      <div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Brand
        </div>
        {ALL_BRANDS.map((brand) => {
          const active = filters.brands.includes(brand);
          return (
            <label key={brand} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
              padding: '0.4rem 0.5rem', borderRadius: 8, marginBottom: '0.1rem',
              background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle('brands', brand)}
                style={{ accentColor: '#0EA5E9', width: 14, height: 14 }}
              />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                color: active ? '#0EA5E9' : 'rgba(255,255,255,0.65)',
              }}>
                {brand}
              </span>
            </label>
          );
        })}
      </div>

      {/* Min Rating */}
      <div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Min Rating
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {ratingOptions.map((r) => {
            const active = filters.minRating === r;
            return (
              <button
                key={r}
                onClick={() => onChange({ ...filters, minRating: active ? 0 : r })}
                style={{
                  padding: '0.3rem 0.65rem', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                  background: active ? 'rgba(14,165,233,0.18)' : 'rgba(255,255,255,0.05)',
                  border: active ? '1px solid rgba(14,165,233,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? '#0EA5E9' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s',
                }}
              >
                {r}★+
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Price Range
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
            <span>₹{(filters.priceMin / 1000).toFixed(0)}K</span>
            <span>₹{(filters.priceMax / 1000).toFixed(0)}K</span>
          </div>
          <input
            type="range" min={0} max={300000} step={5000}
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
            style={{ accentColor: '#0EA5E9', width: '100%' }}
          />
        </div>
      </div>

      {/* In stock */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
          style={{ accentColor: '#0EA5E9', width: 14, height: 14 }}
        />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
          In Stock Only
        </span>
      </label>
    </div>
  );
}

// ─── SortDropdown ─────────────────────────────────────────────────────────────
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popularity', label: 'Popular' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating-desc', label: 'Top Rated' },
];

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        style={{
          appearance: 'none', WebkitAppearance: 'none',
          padding: '0.55rem 2.2rem 0.55rem 0.9rem', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
          cursor: 'pointer', outline: 'none',
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#0D1220' }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} color="rgba(255,255,255,0.45)" style={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />
    </div>
  );
}

// ─── CatalogPage ──────────────────────────────────────────────────────────────
export function CatalogPage() {
  const { category: categoryParam } = useParams<{ category?: string }>();

  const [filters, setFilters] = useState<ActiveFilters>(() => ({
    ...DEFAULT_FILTERS,
    categories: categoryParam ? [categoryParam] : [],
  }));
  const [sort, setSort] = useState<SortKey>('popularity');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Instant loading on client without artificial lag
  useEffect(() => {
    setLoading(false);
  }, [categoryParam]);

  // Update category filter when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setFilters((f) => ({ ...f, categories: [categoryParam] }));
    }
  }, [categoryParam]);

  // Derive active filter chips
  const activeChips: { label: string; remove: () => void }[] = useMemo(() => {
    const chips: { label: string; remove: () => void }[] = [];

    filters.categories.forEach((cat) => {
      const found = MOCK_CATEGORIES.find((c) => c.id === cat);
      chips.push({
        label: found?.name ?? cat,
        remove: () => setFilters((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) })),
      });
    });

    filters.brands.forEach((brand) => {
      chips.push({
        label: brand,
        remove: () => setFilters((f) => ({ ...f, brands: f.brands.filter((b) => b !== brand) })),
      });
    });

    if (filters.minRating > 0) {
      chips.push({
        label: `${filters.minRating}★+`,
        remove: () => setFilters((f) => ({ ...f, minRating: 0 })),
      });
    }

    if (filters.priceMax < 300000) {
      chips.push({
        label: `Up to ₹${(filters.priceMax / 1000).toFixed(0)}K`,
        remove: () => setFilters((f) => ({ ...f, priceMax: 300000 })),
      });
    }

    if (filters.inStockOnly) {
      chips.push({
        label: 'In Stock',
        remove: () => setFilters((f) => ({ ...f, inStockOnly: false })),
      });
    }

    return chips;
  }, [filters]);

  // Filtered + sorted products
  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (p.rating < filters.minRating) return false;
      if (p.priceInr > filters.priceMax) return false;
      if (p.priceInr < filters.priceMin) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    switch (sort) {
      case 'price-asc':  result = [...result].sort((a, b) => a.priceInr - b.priceInr); break;
      case 'price-desc': result = [...result].sort((a, b) => b.priceInr - a.priceInr); break;
      case 'rating-desc': result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'popularity': result = [...result].sort((a, b) => b.reviewCount - a.reviewCount); break;
    }

    return result;
  }, [filters, sort, search]);

  const pageTitle = categoryParam
    ? MOCK_CATEGORIES.find((c) => c.id === categoryParam)?.name ?? 'Catalog'
    : 'All Products';

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, categories: categoryParam ? [categoryParam] : [] });
    setSearch('');
  }, [categoryParam]);

  return (
    <div style={{ background: '#0A0E17', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '6rem 1.5rem 4rem' }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>Catalog</span>
            {categoryParam && <>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#0EA5E9' }}>{pageTitle}</span>
            </>}
          </div>

          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 700, color: '#fff', margin: '0 0 0.25rem', letterSpacing: '-0.03em',
          }}>
            {pageTitle}
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.4)', margin: 0,
          }}>
            {loading ? '...' : `${filteredProducts.length} products`}
          </p>
        </div>

        {/* ── Search + sort + mobile filter toggle ────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '1.25rem',
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 400 }}>
            <Search size={15} color="rgba(255,255,255,0.35)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or brands…"
              style={{
                width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: '#fff',
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeChips.length > 0 && (
              <span style={{
                background: '#0EA5E9', color: '#fff', borderRadius: '50%',
                width: 18, height: 18, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700,
              }}>
                {activeChips.length}
              </span>
            )}
          </button>

          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {/* ── Filter chips ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {activeChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}
            >
              {activeChips.map((chip) => (
                <FilterChip key={chip.label} label={chip.label} onRemove={chip.remove} />
              ))}
              <button
                onClick={resetFilters}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.35)', padding: '0.3rem 0.5rem',
                }}
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2-col layout: sidebar + grid ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Sidebar — hidden on mobile (show only when drawer open conceptually) */}
          <div style={{ minWidth: 0 }}>
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Product grid */}
          <div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title="No products match your filters"
                description="Try adjusting your filters, search query, or clear them to browse everything."
                icon={<Package size={28} strokeWidth={1.5} />}
                action={{ label: 'Clear All Filters', onClick: resetFilters }}
              />
            ) : (
              <motion.div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)', zIndex: 99,
              }}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 35 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 300,
                ...GLASS_L1,
                zIndex: 100, overflowY: 'auto', padding: '1.5rem 1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  Filters
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
