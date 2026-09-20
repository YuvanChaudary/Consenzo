import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  ShoppingBag,
  Check,
  CheckCircle2,
  Layers,
  Star,
  ArrowLeft,
  ThumbsUp,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { api, getTokenPayload, GroupAnalysisResult, TopRecommendation } from '@/services/api';
import { MOCK_PRODUCTS } from '@/lib/mockData';

function productImage(p: any): string {
  if (!p) return '';
  if (p.imageUrl) return p.imageUrl;
  if (Array.isArray(p.images) && p.images[0]) return p.images[0];
  const local = MOCK_PRODUCTS.find(m => m.id === (p.asin || p.id));
  if (local?.images[0]) return local.images[0];
  const asin = p.asin || p.id;
  if (asin && typeof asin === 'string' && asin.startsWith('B0')) {
    return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX400_.jpg`;
  }
  return '';
}

function productName(p: any): string {
  return p?.modelName || p?.name || p?.asin || 'Product';
}

/** Non-exact candidates carry a match-quality badge so near matches are honest. */
function matchLabel(rec: TopRecommendation): { text: string; color: string } | null {
  const q = (rec.matchQuality || '').toUpperCase();
  if (rec.exactMatch || !q || q === 'EXACT' || q === 'UNKNOWN') return null;
  return {
    text: `${q} MATCH${typeof rec.matchScore === 'number' ? ` \u00b7 ${Math.round(rec.matchScore)}%` : ''}`,
    color: q === 'NEAR' ? 'var(--warning)' : 'var(--text-secondary)',
  };
}

export function RecommendationBoardPage() {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { addItem, setConsensusMode } = useCartStore();

  const [analysis, setAnalysis] = useState<GroupAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'consensus' | 'tradeoffs' | 'matrix'>('consensus');
  const [addedToCart, setAddedToCart] = useState(false);
  const [voteState, setVoteState] = useState<{ approvalsCount: number; totalParticipants: number; isUnanimous: boolean } | null>(null);
  const [voted, setVoted] = useState(false);

  const [selectedStrategy, setSelectedStrategy] = useState<'HYBRID' | 'NASH' | 'LEAST_MISERY' | 'BORDA' | 'NEURAL_ATTENTION'>('NEURAL_ATTENTION');

  const targetRoom = roomId || getTokenPayload()?.groupId;
  const handleBack = () => {
    if (targetRoom) {
      navigate(`/room/${targetRoom}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog');
    }
  };

  const compute = async (strat = selectedStrategy, allowPartial = true) => {
    setComputing(true);
    setError(null);
    try {
      const result = await api.getAnalysis(roomId, strat, { allowPartial });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setComputing(false);
      setLoading(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) read the persisted board (same for every member)
      const stored = await api.getStoredAnalysis(roomId);
      if (stored) {
        setAnalysis(stored);
        setLoading(false);
        return;
      }
      // 2) none persisted — compute it now
      await compute();
    } catch (err: any) {
      setError(err.message || 'Could not load the decision board.');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => { load(); }, [load]);

  const winner: TopRecommendation | undefined = analysis?.topRecommendations?.[0];
  const alternatives: TopRecommendation[] = (analysis?.allCandidates || analysis?.topRecommendations || []).slice(1, 5);

  const handleBuyTogether = () => {
    if (!winner) return;
    const p: any = winner.product;
    setConsensusMode(roomId || 'grp_room');
    addItem({
      id: p.asin || p.id,
      productId: p.asin || p.id,
      name: productName(p),
      brand: p.brand || '',
      priceInr: p.priceInr ?? 0,
      image: productImage(p),
      category: p.category || 'smart-tvs',
      roomId: roomId || 'grp_room',
      lockState: 'agreed',
      voteCount: voteState?.approvalsCount ?? 1,
      totalVoters: voteState?.totalParticipants ?? 1,
    });
    setAddedToCart(true);
    setTimeout(() => navigate('/cart'), 800);
  };

  const handleApprove = async () => {
    if (!winner || !analysis) return;
    try {
      const wp: any = winner.product;
      const res = await api.castVote({
        groupId: roomId,
        analysisId: analysis.analysisId,
        productId: wp.asin || wp.id,
        vote: 'APPROVE',
      });
      setVoteState({
        approvalsCount: res.approvalsCount,
        totalParticipants: res.totalParticipants,
        isUnanimous: res.isUnanimous,
      });
      setVoted(true);
    } catch (err: any) {
      setError(err.message || 'Vote failed.');
    }
  };

  // ─── Loading / empty / error states ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={20} className="animate-spin" style={{ marginRight: '0.6rem' }} />
        Loading decision board…
      </div>
    );
  }

  if (!analysis || !winner) {
    return (
      <div style={{ minHeight: '70vh', padding: '2.5rem 1rem', maxWidth: 640, margin: '0 auto' }}>
        <GlassPanel layer="l1" style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertTriangle size={32} color="var(--warning)" style={{ marginBottom: '0.8rem' }} />
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-display)', margin: '0 0 0.6rem' }}>No decision board yet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            {error || 'Recommendations are not ready yet. Set your shopping preferences or compute a preview for the squad.'}
          </p>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleBack}
              style={{ padding: '0.7rem 1.2rem', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Back to Squad Lounge
            </button>
            <button type="button" onClick={() => navigate(targetRoom ? `/room/${targetRoom}/interview` : '/room/join')}
              style={{ padding: '0.7rem 1.2rem', borderRadius: 10, background: 'rgba(0,168,132,0.18)', border: '1px solid var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Set My Shopping Preferences
            </button>
            <button type="button" onClick={() => compute(selectedStrategy, true)} disabled={computing}
              style={{ padding: '0.7rem 1.2rem', borderRadius: 10, background: 'var(--accent)', color: '#0A0E17', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: computing ? 0.6 : 1 }}>
              <Sparkles size={15} /> {computing ? 'Finding Matches…' : 'Find Squad Matches Now'}
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  const w: any = winner.product;
  const proximityMode = (analysis as any).proximity?.mode;
  const proximitySummary = (analysis as any).proximity?.summaryMessage;
  const participants = analysis.participantBreakdowns || [];
  const conflicts = analysis.conflictsDetected || [];
  const boardProducts: TopRecommendation[] = (analysis.allCandidates || analysis.topRecommendations).slice(0, 5);

  const specRows = [
    { label: 'Price', get: (p: any) => formatPrice(p.priceInr ?? 0) },
    { label: 'Rating', get: (p: any) => p.rating ? `${p.rating} \u2605 (${(p.reviewCount || 0).toLocaleString('en-IN')})` : '—' },
    { label: 'Brand', get: (p: any) => p.brand || '—' },
    { label: 'Screen / Size', get: (p: any) => p.screenSizeInches ? `${p.screenSizeInches}"` : (p.screenSizeInches === undefined ? '—' : '—') },
    { label: 'Panel', get: (p: any) => p.panelType || '—' },
    { label: 'Refresh Rate', get: (p: any) => p.refreshRateHz ? `${p.refreshRateHz}Hz` : '—' },
    { label: 'Processor', get: (p: any) => p.processor || '—' },
    { label: 'RAM', get: (p: any) => p.ramGb ? `${p.ramGb}GB` : '—' },
    { label: 'Power / Channels', get: (p: any) => p.totalPowerWatts ? `${p.totalPowerWatts}W · ${p.channels || ''}` : '—' },
    { label: 'Warranty', get: (p: any) => p.warrantyYears ? `${p.warrantyYears} year(s)` : '—' },
  ].filter(row => boardProducts.some(r => row.get(r.product) !== '—'));

  return (
    <div style={{ minHeight: '90vh', padding: '2rem 1rem', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <button type="button" onClick={handleBack}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 4 }} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <Badge variant="success" size="sm">RECOMMENDATIONS READY</Badge>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                  Squad {roomId} · {analysis.metrics?.feasibleCount ?? '?'} matching products
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
                Squad Recommendations & Top Matches
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Mathematical Strategy Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>RECO MODEL:</span>
              <select
                value={selectedStrategy}
                onChange={(e) => {
                  const s = e.target.value as any;
                  setSelectedStrategy(s);
                  compute(s);
                }}
                disabled={computing}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="NEURAL_ATTENTION" style={{ background: '#0D1220', color: '#fff' }}>AGREE Neural Attention (Research DL/ML)</option>
                <option value="HYBRID" style={{ background: '#0D1220', color: '#fff' }}>Hybrid Consensus (Nash Dispersion)</option>
                <option value="NASH" style={{ background: '#0D1220', color: '#fff' }}>Nash Bargaining (Game Theory)</option>
                <option value="LEAST_MISERY" style={{ background: '#0D1220', color: '#fff' }}>Least Misery (Strict Anti-Veto)</option>
                <option value="BORDA" style={{ background: '#0D1220', color: '#fff' }}>Borda Count (Positional Rank)</option>
              </select>
            </div>

            <button type="button" onClick={handleApprove} disabled={voted}
              style={{
                padding: '0.8rem 1.2rem', borderRadius: 12,
                background: voted ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${voted ? 'var(--success)' : 'rgba(16,185,129,0.4)'}`,
                color: voted ? 'var(--success)' : '#fff',
                fontWeight: 700, fontSize: '0.9rem', cursor: voted ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.45rem',
              }}>
              <ThumbsUp size={16} />
              {voted ? `Approved (${voteState?.approvalsCount ?? 1}/${voteState?.totalParticipants ?? '?'})` : 'Vote to Approve Pick'}
            </button>
            <button type="button" onClick={handleBuyTogether}
              style={{
                padding: '0.8rem 1.3rem', borderRadius: 12, background: 'var(--accent)', color: '#0A0E17',
                fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 20px var(--accent-glow)',
              }}>
              {addedToCart ? <Check size={18} /> : <ShoppingBag size={18} />}
              <span>{addedToCart ? 'Opening Squad Cart…' : 'Add Squad Pick to Cart'}</span>
            </button>
          </div>
        </div>

        {voteState?.isUnanimous && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.1rem', marginBottom: '1.4rem',
            borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)',
            color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem',
          }}>
            <CheckCircle2 size={17} /> UNANIMOUS — the group has decided on this product.
          </div>
        )}

        {error && (
          <div style={{ padding: '0.7rem 1rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
            {error}
          </div>
        )}

        {/* Proximity banner (nearest / partial-feasible mode) */}
        {(proximityMode === 'NEAREST' || proximityMode === 'PARTIAL') && proximitySummary && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.9rem 1.1rem', marginBottom: '1.6rem',
            borderRadius: 10, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.3)',
          }}>
            <AlertTriangle size={17} color="var(--warning)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                {proximityMode === 'NEAREST'
                  ? 'No product matches every constraint exactly — showing the nearest feasible matches'
                  : 'A full exact-match slate is not available — nearest alternatives are included below'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>{proximitySummary}</div>
            </div>
          </div>
        )}

        {/* Winner hero */}
        <GlassPanel layer="l2" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: 20, background: 'rgba(14,165,233,0.15)', color: 'var(--accent)', fontSize: '0.76rem', fontWeight: 700 }}>
                  <Trophy size={13} />
                  <span>#1 {winner.tag.replace(/_/g, ' ')}</span>
                </div>
                {matchLabel(winner) && (
                  <span style={{ padding: '0.3rem 0.7rem', borderRadius: 20, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: matchLabel(winner)!.color, fontSize: '0.7rem', fontWeight: 700 }}>
                    {matchLabel(winner)!.text}
                  </span>
                )}
              </div>

              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.55rem', fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1.25 }}>
                {productName(w)}
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 1.2rem' }}>
                {winner.groundedExplanation}
              </p>

              <div style={{ display: 'flex', gap: '1.6rem', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>SQUAD MATCH SCORE</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    {winner.scores.netConsensusScore} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ 10</span>
                  </span>
                </div>
                {winner.scores.neuralScore !== undefined && (
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>NEURAL FIT (ML/DL)</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-vivid)', fontFamily: 'var(--font-display)' }}>
                      {winner.scores.neuralScore} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ 10</span>
                    </span>
                  </div>
                )}
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>MEAN UTILITY</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                    {winner.scores.meanUtility}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>FAIRNESS BALANCE</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
                    {winner.scores.fairnessPenalty}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>SQUAD PRICE</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                    {formatPrice(w.priceInr ?? 0)}
                  </span>
                </div>
              </div>

              {winner.attentionWeights && Object.keys(winner.attentionWeights).length > 0 && (
                <div style={{ marginBottom: '1.4rem', padding: '0.6rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.035)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    DYNAMIC MEMBER INFLUENCE (AGREE ATTENTION NETWORK):
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(winner.attentionWeights).map(([name, weight]) => (
                      <span key={name} style={{ fontSize: '0.76rem', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)', color: 'var(--accent)', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>
                        {name}: {Math.round(weight * 100)}% weight
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={handleBuyTogether}
                  style={{ padding: '0.72rem 1.2rem', borderRadius: 10, background: 'var(--accent)', color: '#0A0E17', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShoppingBag size={15} /> Add Squad Pick to Cart
                </button>
                <button type="button" onClick={() => navigate(`/product/${w.asin || w.id}`)}
                  style={{ padding: '0.72rem 1.2rem', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-medium)', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                  View Full Product Details
                </button>
              </div>
            </div>

            {/* Winner image — white Amazon-style canvas */}
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 280, background: '#fff', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              {productImage(w) ? (
                <img src={productImage(w)} alt={productName(w)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#666', fontSize: '0.85rem' }}>No image available</span>
              )}
            </div>
          </div>
        </GlassPanel>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.6rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'consensus', label: `Runner-Up Matches (${alternatives.length})`, icon: Layers },
            { id: 'tradeoffs', label: 'Shopper Satisfaction Breakdown', icon: CheckCircle2 },
            { id: 'matrix', label: 'Side-by-Side Specs', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: 8,
                  background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                }}>
                <Icon size={15} /> <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Alternatives */}
        {activeTab === 'consensus' && (
          alternatives.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No alternative candidates — the winner dominated every Pareto slot.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.1rem' }}>
              {alternatives.map((rec) => {
                const p: any = rec.product;
                return (
                  <GlassPanel key={p.asin || p.id} layer="l1" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Badge variant={rec.rank === 2 ? 'accent' : 'info'} size="sm">{rec.tag.replace(/_/g, ' ')}</Badge>
                        {matchLabel(rec) && (
                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: 6, border: '1px solid rgba(245,158,11,0.35)', color: matchLabel(rec)!.color, fontSize: '0.62rem', fontWeight: 700 }}>
                            {matchLabel(rec)!.text}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>{rec.scores.netConsensusScore}/10</span>
                    </div>
                    <div style={{ height: 130, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
                      {productImage(p)
                        ? <img src={productImage(p)} alt={productName(p)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        : <span style={{ color: '#666', fontSize: '0.75rem' }}>No image</span>}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.35, marginBottom: '0.25rem' }}>{productName(p)}</div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.76rem' }}>
                        {p.brand} · {formatPrice(p.priceInr ?? 0)}
                        {p.refreshRateHz ? ` · ${p.refreshRateHz}Hz` : ''}
                        {p.panelType ? ` · ${p.panelType}` : ''}
                        {p.ramGb ? ` · ${p.ramGb}GB RAM` : ''}
                      </div>
                    </div>
                    <button type="button" onClick={() => navigate(`/product/${p.asin || p.id}`)}
                      style={{ marginTop: 'auto', padding: '0.5rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                      View Details
                    </button>
                  </GlassPanel>
                );
              })}
            </div>
          )
        )}

        {/* Tab 2: Trade-offs */}
        {activeTab === 'tradeoffs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {participants.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No participant breakdowns were returned for this analysis.</p>
            )}
            {participants.map((m) => (
              <GlassPanel key={m.participantId} layer="l1" style={{ padding: '1.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#fff' }}>{m.displayName}</span>
                    <Badge variant={m.status === 'FULLY_SATISFIED' ? 'success' : m.status === 'COMPROMISED' ? 'warning' : 'info'} size="sm">
                      {m.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    {m.utility?.toFixed?.(1) ?? m.utility} / 10
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem', marginTop: '0.6rem' }}>
                  <div style={{ background: 'rgba(16,185,129,0.06)', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', display: 'block', marginBottom: '0.35rem' }}>KEY REQUIREMENTS</span>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {(m.keyRequirements || []).map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.35rem' }}>CONCESSION NOTES</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.concessionNote}</span>
                  </div>
                </div>
              </GlassPanel>
            ))}

            {conflicts.map((c, i) => (
              <GlassPanel key={i} layer="l1" style={{ padding: '1.1rem', borderLeft: '3px solid var(--warning)' }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{c.type.replace(/_/g, ' ')}</div>
                <p style={{ margin: '0 0 0.4rem', color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5 }}>{c.description}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Resolution: {c.resolutionStrategy}</span>
              </GlassPanel>
            ))}
          </div>
        )}

        {/* Tab 3: Spec matrix */}
        {activeTab === 'matrix' && (
          <GlassPanel layer="l1" style={{ padding: '1.3rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                  <th style={{ padding: '0.7rem', color: 'var(--text-tertiary)' }}>SPECIFICATION</th>
                  <th style={{ padding: '0.7rem', color: 'var(--accent)' }}>{'\u2605'} {productName(w).slice(0, 40)}</th>
                  {alternatives.map((r) => (
                    <th key={r.product.asin || r.product.id} style={{ padding: '0.7rem', color: '#fff', fontWeight: 600 }}>
                      {productName(r.product).slice(0, 32)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{row.label}</td>
                    <td style={{ padding: '0.7rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(14,165,233,0.06)' }}>
                      {row.get(w)}
                    </td>
                    {alternatives.map((r) => {
                      const rp: any = r.product;
                      return (
                      <td key={(rp.asin || rp.id || '') + i} style={{ padding: '0.7rem', color: '#fff' }}>
                        {row.get(rp)}
                      </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassPanel>
        )}
      </motion.div>
    </div>
  );
}
