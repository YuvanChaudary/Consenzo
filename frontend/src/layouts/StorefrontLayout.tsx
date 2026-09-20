import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Github, Twitter, Zap } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/catalog' },
  { label: 'Group Buy', href: '/room/create' },
  { label: 'Join Co-Shopping Squad', href: '/room/join' },
];

const SUPPORT_LINKS = [
  { label: 'FAQ', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export function StorefrontLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
      }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: 'var(--glass-l1-bg)',
        backdropFilter: 'var(--glass-l1-blur)',
        WebkitBackdropFilter: 'var(--glass-l1-blur)',
        borderTop: 'var(--glass-l1-border)',
        boxShadow: 'var(--glass-l1-highlight)',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* ── Grid ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            padding: '3rem 0 2rem',
          }}
        >
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={15} color="#fff" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                <span style={{ color: 'var(--accent)' }}>Ship</span>pyfy
              </span>
            </Link>
            <p
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                maxWidth: 220,
              }}
            >
              Shop solo or make group decisions — powered by the Consenzo consensus engine.
            </p>
            {/* Social links */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <SocialIcon href="#" label="GitHub">
                <Github size={16} />
              </SocialIcon>
              <SocialIcon href="#" label="Twitter">
                <Twitter size={16} />
              </SocialIcon>
            </div>
          </div>

          {/* Quick Links column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Quick Links
            </h4>
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-vivid)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Support column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Support
            </h4>
            {SUPPORT_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-vivid)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.25rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            © 2026 Shippyfy. Powered by collaborative consensus commerce.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span className="badge badge-accent">Beta</span>
            <span className="badge">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface SocialIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

function SocialIcon({ href, label, children }: SocialIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-tertiary)',
        textDecoration: 'none',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent-border)';
        (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-bg)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-tertiary)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-subtle)';
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
      }}
    >
      {children}
    </a>
  );
}
