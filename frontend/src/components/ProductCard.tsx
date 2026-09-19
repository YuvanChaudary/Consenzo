import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { RadarScore } from './RadarScore';
import { OutboundAmazon } from './OutboundAmazon';
import { TopRecommendation } from '../services/api';
import { api } from '../services/api';

interface ProductCardProps {
  recommendation: TopRecommendation;
  groupId: string;
  analysisId: string;
  isPrimary?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  recommendation,
  groupId,
  analysisId,
  isPrimary = false
}) => {
  const { rank, tag, product, scores, groundedExplanation } = recommendation;
  const [hasVoted, setHasVoted] = useState(false);
  const [approvalsCount, setApprovalsCount] = useState<number | null>(null);
  const [isUnanimous, setIsUnanimous] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    try {
      const res = await api.castVote({
        groupId,
        analysisId,
        productId: product.asin,
        vote: 'APPROVE'
      });
      setHasVoted(true);
      setApprovalsCount(res.approvalsCount);
      setIsUnanimous(res.isUnanimous);
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const getTagBadge = () => {
    switch (tag) {
      case 'BEST_CONSENSUS':
        return <span className="badge badge-success">★ Rank #{rank} Best Group Consensus</span>;
      case 'LOWEST_CONFLICT':
        return <span className="badge badge-info">Rank #{rank} Lowest Disagreement</span>;
      case 'BEST_VALUE':
      default:
        return <span className="badge badge-warning">Rank #{rank} Best Budget Value</span>;
    }
  };

  return (
    <Card
      variant={isPrimary ? 'glow' : 'default'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ marginBottom: '0.4rem' }}>{getTagBadge()}</div>
          <h3
            onClick={() => window.open(`https://www.amazon.in/dp/${product.asin}?tag=consenzo-21`, '_blank', 'noopener,noreferrer')}
            style={{
              fontSize: isPrimary ? '1.5rem' : '1.25rem',
              marginBottom: '0.25rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--amazon-orange)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            title={`Open exact Amazon product page for ${product.modelName}`}
          >
            {product.modelName}
            <span style={{ fontSize: '0.9rem', color: 'var(--amazon-orange)', opacity: 0.9 }}>↗</span>
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            <span
              onClick={() => window.open(`https://www.amazon.in/dp/${product.asin}?tag=consenzo-21`, '_blank', 'noopener,noreferrer')}
              style={{ cursor: 'pointer' }}
              title={`View ASIN ${product.asin} on Amazon`}
            >
              ASIN: <code style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>{product.asin}</code>
            </span>
            {' '}• {product.brand} {product.os ? `• ${product.os}` : ''}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            ₹{product.priceInr.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {product.energyRating
              ? `Energy: ${product.energyRating}`
              : ((product as any).channels || (product as any).audioFormat || (product as any).processor || 'Verified Product')}
          </div>
        </div>
      </div>

      {/* Hardware Specs Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {/* Soundbars */}
        {(product as any).totalPowerWatts && (
          <span className="badge badge-primary">
            {(product as any).totalPowerWatts}W Output
          </span>
        )}
        {(product as any).channels && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {(product as any).channels}
          </span>
        )}
        {(product as any).audioFormat && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {(product as any).audioFormat}
          </span>
        )}
        {(product as any).subwoofer && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {(product as any).subwoofer}
          </span>
        )}

        {/* Laptops */}
        {(product as any).processor && (
          <span className="badge badge-primary">
            {(product as any).processor}
          </span>
        )}
        {(product as any).ramGb && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {(product as any).ramGb}GB RAM
          </span>
        )}
        {(product as any).storageGb && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {(product as any).storageGb}GB SSD
          </span>
        )}
        {(product as any).batteryHours && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {(product as any).batteryHours}h Battery
          </span>
        )}

        {/* Smart TVs */}
        {product.screenSizeInches && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {product.screenSizeInches}" {product.panelType || ''}
          </span>
        )}
        {product.refreshRateHz && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {product.refreshRateHz}Hz Native
          </span>
        )}
        {product.resolution && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {product.resolution}
          </span>
        )}
        {product.hasHdmi21 && (
          <span className="badge badge-primary">
            HDMI 2.1 Low-Latency
          </span>
        )}
        {product.bezelColor && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {product.bezelColor} Bezel
          </span>
        )}

        {/* Common Specs */}
        {product.warrantyYears && (
          <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {product.warrantyYears} Yrs Warranty
          </span>
        )}
      </div>

      {/* Main Content Split: Radar / Bars on Left, Trade-off Narrative on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isPrimary ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
          gap: '1.5rem',
          alignItems: 'center',
          background: 'rgba(12, 16, 25, 0.5)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <RadarScore
          scores={scores.individualBreakdown}
          netScore={scores.netConsensusScore}
          fairnessPenalty={scores.fairnessPenalty}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--primary-light)',
                marginBottom: '0.4rem'
              }}
            >
              Why Consenzo Ranked This #{rank}
            </div>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: 'var(--text-primary)', fontStyle: 'italic' }}>
              "{groundedExplanation?.replace(/<candidate_extraction>[\s\S]*?<\/candidate_extraction>/gi, '').replace(/<reply>([\s\S]*?)<\/reply>/gi, '$1').replace(/<[^>]+>/g, '').trim() || groundedExplanation}"
            </p>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>Mean Member Utility: <strong>{scores.meanUtility.toFixed(2)}/10</strong></span>
            <span>Net Consensus Score: <strong style={{ color: 'var(--primary-light)' }}>{scores.netConsensusScore.toFixed(2)}/10</strong></span>
          </div>
        </div>
      </div>

      {/* Ratification Celebration Banner */}
      {isUnanimous && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: '1px solid var(--border-success)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            textAlign: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem'
          }}
        >
          🎉 Unanimous Family Ratification Achieved! Ready to checkout.
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant={hasVoted ? 'success' : 'secondary'}
            size="md"
            onClick={handleVote}
            isLoading={isVoting}
          >
            {hasVoted ? '✓ Ratified by You' : 'Vote to Ratify This Pick'}
          </Button>

          {approvalsCount !== null && (
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              {approvalsCount} approvals confirmed
            </span>
          )}
        </div>

        <OutboundAmazon
          asin={product.asin}
          brand={product.brand}
          modelName={product.modelName}
          label={`Buy on Amazon (₹${product.priceInr.toLocaleString('en-IN')})`}
        />
      </div>
    </Card>
  );
};
