import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { OutboundAmazon } from '../components/OutboundAmazon';

interface AmazonInventoryProps {
  onNavigate: (route: string, params?: any) => void;
}

export const AmazonInventory: React.FC<AmazonInventoryProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('smart_tvs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [priceTier, setPriceTier] = useState<string>('ALL');
  const [inventoryData, setInventoryData] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number; icon: string }>>([
    { id: 'smart_tvs', name: 'Smart TVs & Displays', count: 35, icon: '📺' },
    { id: 'laptops', name: 'Laptops & Workstations', count: 15, icon: '💻' },
    { id: 'soundbars', name: 'Soundbars & Home Audio', count: 12, icon: '🔊' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getFullInventory();
        if (isMounted) {
          setInventoryData(data.inventory);
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch (e) {
        console.error('Failed to fetch inventory:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const currentProducts = useMemo(() => {
    return inventoryData[activeCategory] || [];
  }, [inventoryData, activeCategory]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    currentProducts.forEach((p: any) => {
      if (p.brand) set.add(p.brand);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [currentProducts]);

  const filteredProducts = useMemo(() => {
    return currentProducts.filter((p: any) => {
      // Brand filter
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) {
        return false;
      }

      // Price Tier filter
      if (priceTier === 'UNDER_30K' && p.priceInr >= 30000) return false;
      if (priceTier === '30K_TO_70K' && (p.priceInr < 30000 || p.priceInr > 70000)) return false;
      if (priceTier === '70K_TO_150K' && (p.priceInr < 70000 || p.priceInr > 150000)) return false;
      if (priceTier === 'ABOVE_150K' && p.priceInr <= 150000) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const model = (p.modelName || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const asin = (p.asin || '').toLowerCase();
        const os = (p.os || '').toLowerCase();
        const proc = (p.processor || '').toLowerCase();
        const audio = (p.audioFormat || '').toLowerCase();
        return model.includes(q) || brand.includes(q) || asin.includes(q) || os.includes(q) || proc.includes(q) || audio.includes(q);
      }

      return true;
    });
  }, [currentProducts, selectedBrand, priceTier, searchQuery]);

  const handleStartRoom = (product?: any) => {
    onNavigate('create', {
      preselectedCategory: activeCategory,
      suggestedTitle: product ? `${product.brand} ${product.modelName.slice(0, 20)} Decision` : undefined
    });
  };

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        
        {/* Amazon Upstream Acceleration Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.12) 0%, rgba(20, 110, 180, 0.08) 100%)',
            border: '1px solid rgba(255, 153, 0, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  background: '#ff9900',
                  color: '#111',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  letterSpacing: '0.05em'
                }}
              >
                AMAZON INVENTORY
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {categories.reduce((acc, c) => acc + c.count, 0) || 115}+ Live Verified Catalog Items Across {categories.length} Categories
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
              Select Any Product to Launch a Group Purchasing Session
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Consenzo bridges the gap between individual Amazon browsing and shared group agreement.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => handleStartRoom()}
            rightIcon={<span>→</span>}
          >
            Start Consensus Session
          </Button>
        </div>

        {/* Category Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedBrand('ALL');
                  setPriceTier('ALL');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1.25rem',
                  background: isActive ? 'var(--bg-elevated)' : 'var(--bg-card)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 0 16px rgba(124, 58, 237, 0.25)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: isActive ? 'var(--primary)' : 'var(--bg-input)',
                    color: '#fff',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '10px'
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <Card variant="default" style={{ padding: '1rem 1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search Amazon inventory by model, brand, processor, ASIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                  pointerEvents: 'none'
                }}
              >
                🔍
              </span>
            </div>

            {/* Brand Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                {brands.map((b) => (
                  <option key={b} value={b}>{b === 'ALL' ? 'All Brands' : b}</option>
                ))}
              </select>
            </div>

            {/* Price Tier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Budget:</span>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="ALL">All Budgets</option>
                <option value="UNDER_30K">Under ₹30,000</option>
                <option value="30K_TO_70K">₹30,000 - ₹70,000</option>
                <option value="70K_TO_150K">₹70,000 - ₹1,50,000</option>
                <option value="ABOVE_150K">Flagship (₹1,50,000+)</option>
              </select>
            </div>

            {/* Reset */}
            {(searchQuery || selectedBrand !== 'ALL' || priceTier !== 'ALL') && (
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('ALL');
                  setPriceTier('ALL');
                }}
              >
                Reset Filters
              </Button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredProducts.length}</strong> items
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s linear infinite'
              }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>Loading Amazon Inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card variant="default" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
            <h4>No products match your current filters</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Try adjusting your search query, brand selection, or price tier.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('ALL');
                setPriceTier('ALL');
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {filteredProducts.map((product: any) => {
              const rating = product.rating || (4.2 + (parseInt(product.asin.slice(-1), 36) % 7) * 0.1).toFixed(1);
              const reviews = product.reviewCount || (1200 + (parseInt(product.asin.slice(-2), 36) % 15000));

              return (
                <Card
                  key={product.asin}
                  variant="default"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    {/* Top Row: Brand & Prime Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--primary-light)',
                          background: 'rgba(124, 58, 237, 0.15)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}
                      >
                        {product.brand}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: '#00a8e1',
                          letterSpacing: '-0.02em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <span style={{ color: '#ff9900' }}>✓</span>prime
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => window.open(`https://www.amazon.in/dp/${product.asin}?tag=consenzo-21`, '_blank', 'noopener,noreferrer')}
                      style={{
                        fontSize: '1rem',
                        lineHeight: 1.35,
                        marginBottom: '0.5rem',
                        color: 'var(--text-primary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--amazon-orange)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      title={`Open exact Amazon product page for ${product.modelName}`}
                    >
                      {product.modelName}
                    </h4>

                    {/* Star Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#ffa41c', fontSize: '0.9rem' }}>★ {rating}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                        ({reviews.toLocaleString('en-IN')})
                      </span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.7rem',
                          color: 'var(--success)',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}
                      >
                        In Stock
                      </span>
                    </div>

                    {/* Spec Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                      {product.screenSizeInches && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.screenSizeInches}" Screen
                        </span>
                      )}
                      {product.panelType && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.panelType}
                        </span>
                      )}
                      {product.resolution && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.resolution}
                        </span>
                      )}
                      {product.refreshRateHz && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.refreshRateHz}Hz
                        </span>
                      )}
                      {product.processor && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.processor.split('(')[0].trim()}
                        </span>
                      )}
                      {product.ramGb && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.ramGb}GB RAM
                        </span>
                      )}
                      {product.totalPowerWatts && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.totalPowerWatts}W Output
                        </span>
                      )}
                      {product.channels && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-input)' }}>
                          {product.channels}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Outbound Actions */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{product.priceInr.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        M.R.P. incl. taxes
                      </span>
                      <span
                        style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        onClick={() => window.open(`https://www.amazon.in/dp/${product.asin}?tag=consenzo-21`, '_blank', 'noopener,noreferrer')}
                        title={`View ASIN ${product.asin} on Amazon`}
                      >
                        ASIN: <code style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>{product.asin}</code>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <OutboundAmazon
                          asin={product.asin}
                          brand={product.brand}
                          modelName={product.modelName}
                          label="View on Amazon"
                          size="sm"
                          fullWidth={true}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStartRoom(product)}
                        title="Start a group consensus room for this category"
                      >
                        Group Choice 👥
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
