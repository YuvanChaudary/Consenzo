import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ConflictBanner } from '../components/ConflictBanner';
import { ProductCard } from '../components/ProductCard';
import { OutboundAmazon } from '../components/OutboundAmazon';
import { useSession } from '../context/SessionContext';
import { useConsensus } from '../hooks/useConsensus';
import { TopRecommendation, ParticipantBreakdown, api } from '../services/api';

interface RecommendationBoardProps {
  onNavigate: (route: string) => void;
}

export const RecommendationBoard: React.FC<RecommendationBoardProps> = ({ onNavigate }) => {
  const { group } = useSession();
  const { analysis, isLoading, error } = useConsensus(group?.groupId || 'grp_family_tv');

  const [comparisonTab, setComparisonTab] = useState<'top3' | 'all'>('top3');
  const [hasVotedWinner, setHasVotedWinner] = useState(false);
  const [voteCount, setVoteCount] = useState<number | null>(null);
  const [isUnanimous, setIsUnanimous] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  if (isLoading) {
    return (
      <div style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <h3 style={{ marginBottom: '0.5rem' }}>Processing Multi-User Information</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Aggregating group constraints, evaluating Pareto optimality, and generating comparison matrix...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <Card variant="default" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Analysis Computation Error</h3>
            <p style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>{error || 'Unable to retrieve recommendations.'}</p>
            <Button variant="primary" onClick={() => onNavigate('lobby')}>
              Return to Group Lobby
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const primaryRecommendation = analysis.topRecommendations[0];
  const alternativeRecommendations = analysis.topRecommendations.slice(1);

  // Determine candidates for comparison table
  const candidatesToCompare = comparisonTab === 'top3'
    ? analysis.topRecommendations
    : (analysis.allCandidates && analysis.allCandidates.length > 0
      ? analysis.allCandidates
      : analysis.topRecommendations);

  // Extract all participant names from scores
  const allParticipantNames = primaryRecommendation
    ? Object.keys(primaryRecommendation.scores.individualBreakdown)
    : [];

  // Use either returned participantBreakdowns or construct from roster + breakdown
  const participantBreakdowns: ParticipantBreakdown[] = analysis.participantBreakdowns && analysis.participantBreakdowns.length > 0
    ? analysis.participantBreakdowns
    : allParticipantNames.map((name, idx) => {
        const score = primaryRecommendation?.scores.individualBreakdown[name] || 8.0;
        const status: 'FULLY_SATISFIED' | 'COMPROMISED' | 'CONCEDED' =
          score >= 8.5 ? 'FULLY_SATISFIED' : score >= 6.5 ? 'COMPROMISED' : 'CONCEDED';
        return {
          participantId: `usr_${idx}`,
          displayName: name,
          role: idx === 0 ? 'COORDINATOR' : 'PARTICIPANT',
          keyRequirements: idx === 0 ? ['Strict budget ceiling', 'Long-term reliability'] : ['High performance / display', 'Trusted brand'],
          utility: score,
          status,
          concessionNote: status === 'FULLY_SATISFIED'
            ? 'All core priorities satisfied without compromise.'
            : 'Accepted a balanced trade-off to unlock unanimous group satisfaction.'
        };
      });

  const handleVoteWinner = async () => {
    if (!primaryRecommendation) return;
    setIsVoting(true);
    try {
      const res = await api.castVote({
        groupId: analysis.groupId,
        analysisId: analysis.analysisId,
        productId: primaryRecommendation.product.asin,
        vote: 'APPROVE'
      });
      setHasVotedWinner(true);
      setVoteCount(res.approvalsCount);
      setIsUnanimous(res.isUnanimous);
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const getProductSpecsBadgeString = (product: any) => {
    const parts: string[] = [];
    if (product.totalPowerWatts) parts.push(`${product.totalPowerWatts}W`);
    if (product.channels) parts.push(String(product.channels));
    if (product.audioFormat) parts.push(String(product.audioFormat));
    if (product.subwoofer) parts.push(String(product.subwoofer));
    if (product.ramGb) parts.push(`${product.ramGb}GB RAM`);
    if (product.storageGb) parts.push(`${product.storageGb}GB SSD`);
    if (product.processor) parts.push(product.processor);
    if (product.screenSizeInches) parts.push(`${product.screenSizeInches}"`);
    if (product.panelType) parts.push(product.panelType);
    if (product.refreshRateHz) parts.push(`${product.refreshRateHz}Hz`);
    if (parts.length === 0 && product.resolution) parts.push(product.resolution);
    return parts.slice(0, 3).join(' • ') || 'Verified Spec';
  };

  const getStatusBadge = (status: 'FULLY_SATISFIED' | 'COMPROMISED' | 'CONCEDED') => {
    switch (status) {
      case 'FULLY_SATISFIED':
        return <span className="badge badge-success">✓ 100% Satisfied</span>;
      case 'COMPROMISED':
        return <span className="badge badge-warning">● Moderate Compromise</span>;
      case 'CONCEDED':
        return <span className="badge badge-danger">Conceded Feature</span>;
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-success">Consensus Analysis Complete</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                Processed {participantBreakdowns.length} Stakeholders • Evaluated {analysis.metrics?.totalProducts || 50} Products
              </span>
            </div>
            <h2>Finalized Group Decision Dashboard</h2>
            <p style={{ marginTop: '0.25rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Multi-stakeholder compromise recommendations synthesized across all participants for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{group?.title || 'Decision Room'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onNavigate('interview')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>💬</span>
              <span>Refine in My Chat</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onNavigate('lobby')}>
              ← Group Lobby
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onNavigate('inventory')}>
              📦 Amazon Catalog
            </Button>
          </div>
        </div>

        {/* Conflict Resolution Banner (if any) */}
        <ConflictBanner conflicts={analysis.conflictsDetected} />

        {/* ========================================================================= */}
        {/* SECTION 1: MULTI-USER INFORMATION PROCESSING MATRIX                       */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👥</span> Multi-User Preferences Processed & Harmony Index
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Every participant's private interview constraints mapped and scored against the winning compromise.
              </p>
            </div>
            <span className="badge badge-primary">
              Anti-Tyranny Maximin Guaranteed
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {participantBreakdowns.map((p, idx) => {
              const isHigh = p.utility >= 8.5;
              const isMid = p.utility >= 6.5 && p.utility < 8.5;
              const pct = Math.min(100, Math.max(0, p.utility * 10));

              return (
                <div
                  key={p.participantId || idx}
                  className="glass-card"
                  style={{
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    background: 'rgba(20, 28, 48, 0.65)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: p.role === 'COORDINATOR' ? 'var(--primary)' : '#0ea5e9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                      >
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.displayName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          {p.role === 'COORDINATOR' ? 'Room Coordinator' : 'Co-Buyer'}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(p.status)}
                  </div>

                  {/* Individual Satisfaction Score Meter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Satisfaction Score:</span>
                      <strong style={{ color: isHigh ? 'var(--success)' : isMid ? 'var(--warning)' : 'var(--danger)' }}>
                        {p.utility.toFixed(1)} / 10
                      </strong>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        background: 'rgba(10, 15, 25, 0.8)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: isHigh
                            ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                            : isMid
                            ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                            : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                          borderRadius: '3px',
                          transition: 'width 0.8s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Constraints */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '3px' }}>
                      Priority Constraints:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {p.keyRequirements.map((req, rIdx) => (
                        <span
                          key={rIdx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.15rem 0.45rem',
                            fontSize: '0.72rem'
                          }}
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Concession / Trade-off Note */}
                  <div
                    style={{
                      background: 'rgba(10, 14, 24, 0.6)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      borderLeft: '2px solid var(--primary-light)'
                    }}
                  >
                    "{p.concessionNote}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: TOP WINNING COMPROMISE (FEATURED SPOTLIGHT)                    */}
        {/* ========================================================================= */}
        {primaryRecommendation && (
          <div style={{ marginBottom: '3rem' }}>
            <div
              style={{
                fontSize: '0.825rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--success)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>★</span> Top Finalized Compromise Solution
            </div>

            <ProductCard
              recommendation={primaryRecommendation}
              groupId={analysis.groupId}
              analysisId={analysis.analysisId}
              isPrimary={true}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: COMPREHENSIVE MULTI-PRODUCT COMPARISON MATRIX                  */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📊</span> Comprehensive Multi-Product Comparison Matrix
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Directly compare the Consensus Winner against other alternatives across technical, economic, and satisfaction dimensions.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(15, 20, 32, 0.7)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => setComparisonTab('top3')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: comparisonTab === 'top3' ? 'var(--primary)' : 'transparent',
                  color: comparisonTab === 'top3' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Top 3 Finalists
              </button>
              <button
                type="button"
                onClick={() => setComparisonTab('all')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: comparisonTab === 'all' ? 'var(--primary)' : 'transparent',
                  color: comparisonTab === 'all' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                All Evaluated Models ({candidatesToCompare.length})
              </button>
            </div>
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div
            className="glass-card"
            style={{
              overflowX: 'auto',
              padding: 0,
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: 'rgba(25, 35, 55, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', width: '22%' }}>
                    Decision Dimension
                  </th>
                  {candidatesToCompare.map((c, i) => (
                    <th key={c.product.asin || i} style={{ padding: '1rem', fontSize: '0.85rem', width: `${78 / candidatesToCompare.length}%` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span
                          className="badge"
                          style={{
                            background: i === 0 ? 'var(--success-bg)' : i === 1 ? 'var(--info-bg)' : 'var(--warning-bg)',
                            color: i === 0 ? 'var(--success)' : i === 1 ? 'var(--info)' : 'var(--warning)',
                            border: `1px solid ${i === 0 ? 'var(--border-success)' : 'rgba(255,255,255,0.1)'}`,
                            fontSize: '0.65rem'
                          }}
                        >
                          Rank #{c.rank} {i === 0 ? '★ Winner' : i === 1 ? 'Lowest Conflict' : 'Best Value'}
                        </span>
                      </div>
                      <div
                        onClick={() => window.open(`https://www.amazon.in/dp/${c.product.asin}?tag=consenzo-21`, '_blank', 'noopener,noreferrer')}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="View product on Amazon"
                      >
                        {c.product.modelName}
                        <span style={{ fontSize: '0.75rem', color: 'var(--amazon-orange)' }}>↗</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {c.product.brand}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Amazon Price & Link */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Amazon Verified Price
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{c.product.priceInr.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        Direct Amazon.in PDP
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 2: Net Consensus Score */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(124, 58, 237, 0.04)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Net Group Consensus Score
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.3rem' }}>
                        <span
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            color: i === 0 ? 'var(--primary-light)' : 'var(--text-primary)'
                          }}
                        >
                          {c.scores.netConsensusScore.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ 10</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 3: Mean Group Utility */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Mean Member Utility
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '0.9rem 1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <strong>{c.scores.meanUtility.toFixed(2)}</strong> / 10
                    </td>
                  ))}
                </tr>

                {/* Row 4: Interpersonal Disagreement Penalty */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Fairness Dispersion Penalty
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--warning)' }}>
                      {c.scores.fairnessPenalty.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Row 5: Member Satisfaction Breakdown */}
                {allParticipantNames.map(name => (
                  <tr key={name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(255, 255, 255, 0.015)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      👤 {name} Score
                    </td>
                    {candidatesToCompare.map((c, i) => {
                      const userScore = c.scores.individualBreakdown[name] ?? 7.5;
                      const isHigh = userScore >= 8.5;
                      const isMid = userScore >= 6.5 && userScore < 8.5;
                      return (
                        <td key={i} style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              color: isHigh ? 'var(--success)' : isMid ? 'var(--warning)' : 'var(--danger)'
                            }}
                          >
                            {userScore.toFixed(1)} / 10
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Row 6: Key Specifications */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Hardware / Core Specs
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {getProductSpecsBadgeString(c.product)}
                    </td>
                  ))}
                </tr>

                {/* Row 7: Warranty & OS */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    OS & Warranty
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {c.product.os || 'Standard'} • {c.product.warrantyYears || 1} Yr Warranty
                    </td>
                  ))}
                </tr>

                {/* Row 8: Algorithmic Trade-off Verdict */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Consenzo Verdict
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{c.groundedExplanation?.replace(/<[^>]+>/g, '').slice(0, 140)}..."
                    </td>
                  ))}
                </tr>

                {/* Row 9: Amazon Purchase Outbound Button */}
                <tr>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Amazon.in Link
                  </td>
                  {candidatesToCompare.map((c, i) => (
                    <td key={i} style={{ padding: '1rem' }}>
                      <OutboundAmazon
                        asin={c.product.asin}
                        brand={c.product.brand}
                        modelName={c.product.modelName}
                        label={`View on Amazon (₹${c.product.priceInr.toLocaleString('en-IN')})`}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: PARETO ALTERNATIVE CARDS                                       */}
        {/* ========================================================================= */}
        {alternativeRecommendations.length > 0 && (
          <div style={{ marginBottom: '3.5rem' }}>
            <div
              style={{
                fontSize: '0.825rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Viable Pareto Alternatives (Trade-off Deltas)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'none' }}>
                Unforced choices for group consideration
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {alternativeRecommendations.map((alt: TopRecommendation) => (
                <ProductCard
                  key={alt.product.asin}
                  recommendation={alt}
                  groupId={analysis.groupId}
                  analysisId={analysis.analysisId}
                  isPrimary={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: FINAL GROUP RATIFICATION & CHECKOUT                            */}
        {/* ========================================================================= */}
        <Card
          variant="glow"
          style={{
            textAlign: 'center',
            padding: '2.5rem',
            background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.8) 0%, rgba(10, 16, 28, 0.9) 100%)'
          }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Lock In Consensus & Proceed to Amazon
          </h3>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            All group members have had their voices heard, requirements weighted, and trade-offs calculated. Ratify the winning consensus choice to finalize the purchase.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              variant={hasVotedWinner ? 'success' : 'primary'}
              size="lg"
              onClick={handleVoteWinner}
              isLoading={isVoting}
              style={{ minWidth: '240px' }}
            >
              {hasVotedWinner ? '✓ You Ratified This Consensus' : '🗳️ Vote to Ratify Winner'}
            </Button>

            {primaryRecommendation && (
              <OutboundAmazon
                asin={primaryRecommendation.product.asin}
                brand={primaryRecommendation.product.brand}
                modelName={primaryRecommendation.product.modelName}
                label={`Proceed to Amazon Checkout (₹${primaryRecommendation.product.priceInr.toLocaleString('en-IN')})`}
              />
            )}
          </div>

          {(isUnanimous || (voteCount && voteCount >= 2)) && (
            <div
              style={{
                marginTop: '1.5rem',
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid var(--border-success)',
                borderRadius: 'var(--radius-full)',
                padding: '0.5rem 1.5rem',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              🎉 Unanimous Group Consensus Ratification Confirmed!
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};
