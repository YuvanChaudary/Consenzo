import { useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { SearchBar } from './SearchBar';

// ─── Store interface (lightweight — avoids circular dep) ──────────────────────
// Import from your actual store path:
// import { useCartStore } from '../../store/cartStore';
// For now we use a safe dynamic import pattern with a fallback hook shape.

interface CartStore {
  items: { quantity: number }[];
}

// Consumers must provide useCartStore via the actual store.
// This component accepts it as an optional prop for testability,
// and falls back to a zero-count if not provided.
interface NavbarProps {
  useCartStore?: () => CartStore;
}

// ─── Nav link config ──────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/catalog' },
  { label: 'Group Buy', href: '/room/create' },
] as const;

// ─── Styles ───────────────────────────────────────────────────────────────────

const navStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  height: 64,
  display: 'flex',
  alignItems: 'center',
  paddingInline: '1.5rem',
  background: 'var(--glass-l1-bg, rgba(255,255,255,0.045))',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  borderBottom: '1px solid var(--glass-l1-border, rgba(255,255,255,0.08))',
  boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.3)',
};

const logoStyle: CSSProperties = {
  fontFamily: 'Sora, sans-serif',
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#ffffff',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  userSelect: 'none',
};

const iconBtnStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.4rem',
  borderRadius: '0.5rem',
  transition: 'color 0.15s ease, background 0.15s ease',
  position: 'relative',
};

const mobileNavStyle: CSSProperties = {
  position: 'fixed',
  top: 64,
  left: 0,
  right: 0,
  zIndex: 99,
  background: 'rgba(10,14,23,0.96)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '1rem 1.5rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

function ShippyfyLogo() {
  return (
    <Link to="/" style={logoStyle}>
      <span style={{ color: 'var(--accent, #0EA5E9)' }}>Ship</span>
      <span>pyfy</span>
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--accent, #0EA5E9)',
          boxShadow: '0 0 8px var(--accent, #0EA5E9)',
          marginLeft: 3,
          marginBottom: 10,
          flexShrink: 0,
        }}
      />
    </Link>
  );
}

// ─── Desktop nav link ─────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link
      to={href}
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent, #0EA5E9)' : 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
        position: 'relative',
        paddingBottom: '2px',
        transition: 'color 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-underline"
          style={{
            position: 'absolute',
            bottom: -4,
            left: 0,
            right: 0,
            height: 2,
            borderRadius: 1,
            background: 'var(--accent, #0EA5E9)',
            boxShadow: '0 0 6px rgba(14,165,233,0.6)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </Link>
  );
}

// ─── Cart badge ───────────────────────────────────────────────────────────────

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        background: 'var(--accent, #0EA5E9)',
        color: '#ffffff',
        fontSize: '0.6rem',
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 3px',
        lineHeight: 1,
        boxShadow: '0 0 8px rgba(14,165,233,0.5)',
        border: '1.5px solid var(--canvas, #0A0E17)',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Navbar({ useCartStore }: NavbarProps) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cart count from store (0 if store not provided)
  const cartItems = useCartStore?.()?.items ?? [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <nav style={navStyle}>
        {/* Logo */}
        <ShippyfyLogo />

        {/* Desktop nav links */}
        <nav
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          className="shippyfy-desktop-nav"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href)
              }
            />
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Expandable search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              style={{ overflow: 'hidden', marginRight: '0.75rem' }}
            >
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                size="sm"
                placeholder="Search Shippyfy…"
                onSearch={() => setSearchOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          {/* Search */}
          <motion.button
            style={iconBtnStyle}
            onClick={() => setSearchOpen((o) => !o)}
            whileHover={{ color: '#ffffff', background: 'rgba(255,255,255,0.07)' }}
            whileTap={{ scale: 0.92 }}
            title="Search"
            className="shippyfy-desktop-icon"
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </motion.button>

          {/* Cart */}
          <Link to="/cart" style={{ ...iconBtnStyle, textDecoration: 'none' }}>
            <motion.span
              style={{ display: 'flex', position: 'relative' }}
              whileHover={{ color: '#ffffff' }}
            >
              <ShoppingBag size={18} />
              <CartBadge count={cartCount} />
            </motion.span>
          </Link>

          {/* User */}
          <Link to="/account" style={{ ...iconBtnStyle, textDecoration: 'none' }}>
            <motion.span
              style={{ display: 'flex' }}
              whileHover={{ color: '#ffffff' }}
            >
              <User size={18} />
            </motion.span>
          </Link>

          {/* Mobile hamburger */}
          <motion.button
            style={{ ...iconBtnStyle }}
            onClick={() => setMobileOpen((o) => !o)}
            whileTap={{ scale: 0.9 }}
            className="shippyfy-mobile-hamburger"
            title="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            style={mobileNavStyle}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  fontWeight: isActive(link.href) ? 700 : 500,
                  color: isActive(link.href) ? 'var(--accent, #0EA5E9)' : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  padding: '0.65rem 0.5rem',
                  borderRadius: '0.5rem',
                  background: isActive(link.href) ? 'rgba(14,165,233,0.08)' : 'transparent',
                  borderLeft: isActive(link.href)
                    ? '2px solid var(--accent, #0EA5E9)'
                    : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  display: 'block',
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile search */}
            <div style={{ marginTop: '0.5rem' }}>
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                size="md"
                placeholder="Search Shippyfy…"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive style tag */}
      <style>{`
        @media (max-width: 767px) {
          .shippyfy-desktop-nav { display: none !important; }
          .shippyfy-desktop-icon { display: none !important; }
        }
        @media (min-width: 768px) {
          .shippyfy-mobile-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}
