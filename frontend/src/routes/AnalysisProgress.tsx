import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useSession } from '../context/SessionContext';

interface AnalysisProgressProps {
  onNavigate: (route: string) => void;
}

interface ScanLog {
  asin: string;
  item: string;
  status: 'EVALUATING' | 'PASSED' | 'GATED';
  detail: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ onNavigate }) => {
  const { group } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [feasibleCount, setFeasibleCount] = useState(0);
  const [gatedCount, setGatedCount] = useState(0);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { title: '1. Catalog Extraction', detail: 'Scanning Amazon catalog inventory across live active models...' },
    { title: '2. Deterministic Dealbreaker Gating', detail: 'Eliminating models that violate participants\' hard budgets & dealbreakers...' },
    { title: '3. Anti-Tyranny Fairness Math', detail: 'Calculating Pareto frontier, Maximin satisfaction floor & dispersion penalty...' },
    { title: '4. Return-to-Amazon Linking', detail: 'Synthesizing grounded trade-off explanations with direct Amazon product links...' }
  ];

  const simulatedInventory = [
    { asin: 'B0C1X2Y3Z4', name: 'Samsung Crystal 4K (43")', pass: true, detail: '₹32,000 <= Budget | Hard budget satisfied' },
    { asin: 'B0C3D4E5F6', name: 'Sony Bravia XR OLED (65")', pass: false, detail: '₹1,25,000 exceeds budget ceiling (Gated)' },
    { asin: 'B0C2A3B4C5', name: 'LG NanoCell Gaming (50")', pass: true, detail: '120Hz native gaming + HDMI 2.1 satisfied' },
    { asin: 'B0C4G5H6I7', name: 'TCL C745 QLED (55")', pass: true, detail: '144Hz VRR | Optimal price-to-performance' },
    { asin: 'B0B8S9J4K2', name: 'Xiaomi X Series 4K (43")', pass: true, detail: '₹26,999 budget tier | High economic utility' },
    { asin: 'B09X5PBNH8', name: 'Sony Bravia Master Series (77")', pass: false, detail: 'Exceeds living room wall dimensions (Gated)' },
    { asin: 'B0CD98H1P9', name: 'LG C3 OLED 4K (55")', pass: true, detail: 'Infinite contrast OLED | u_priya preferred' },
    { asin: 'B0C8D9H2P4', name: 'Samsung Neo QLED 8K (65")', pass: false, detail: '₹2,19,990 exceeds hard budget (Gated)' },
    { asin: 'B0B3C9S98M', name: 'TCL 55" Mini-LED (55C755)', pass: true, detail: '500+ local dimming zones | Zero conflict pick' },
    { asin: 'B08T177XZ9', name: 'Acer Series 4K (50")', pass: true, detail: 'Value tier certified | All constraints met' }
  ];

  useEffect(() => {
    // Step timers
    const timer1 = setTimeout(() => setCurrentStep(1), 800);
    const timer2 = setTimeout(() => setCurrentStep(2), 1900);
    const timer3 = setTimeout(() => setCurrentStep(3), 3000);
    const timer4 = setTimeout(() => onNavigate('decision'), 4200);

    // Stream simulated inventory scan logs
    simulatedInventory.forEach((item, idx) => {
      setTimeout(() => {
        setLogs(prev => [
          ...prev,
          {
            asin: item.asin,
            item: item.name,
            status: item.pass ? 'PASSED' : 'GATED',
            detail: item.detail
          }
        ]);
        setScannedCount(idx + 1);
        if (item.pass) {
          setFeasibleCount(c => c + 1);
        } else {
          setGatedCount(c => c + 1);
        }
      }, (idx + 1) * 320);
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onNavigate]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <Card variant="glow" style={{ padding: '2.25rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 153, 0, 0.15)',
                border: '1px solid rgba(255, 153, 0, 0.3)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                color: '#ff9900',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.75rem'
              }}
            >
              <span>⚡</span> AMAZON INVENTORY AGENT ACTIVE
            </div>
            <h2 style={{ marginBottom: '0.4rem', fontSize: '1.75rem' }}>
              Analyzing Inventory & Synthesizing Consensus
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Evaluating products against confirmed group constraints in room:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{group?.title || 'Decision Room'}</strong>
            </p>
          </div>

          {/* Live Metric Counters Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.75rem',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {Math.max(scannedCount, 1)} / 35
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Inventory Scanned
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                {feasibleCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Feasible Candidates
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>
                {gatedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Gated Dealbreakers
              </div>
            </div>
          </div>

          {/* Live Inventory Scan Ticker Box */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Real-Time Product Evaluation Stream:
              </span>
              <span style={{ fontSize: '0.75rem', color: '#00a8e1' }}>
                ✓ Linking back to Amazon.in
              </span>
            </div>
            <div
              ref={logContainerRef}
              style={{
                height: '160px',
                overflowY: 'auto',
                background: 'rgba(5, 7, 10, 0.95)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                  Initializing Amazon product stream...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.6rem',
                      lineHeight: 1.4
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        background: log.status === 'PASSED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: log.status === 'PASSED' ? 'var(--success)' : 'var(--danger)'
                      }}
                    >
                      {log.status === 'PASSED' ? 'FEASIBLE' : 'GATED'}
                    </span>
                    <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{log.asin}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{log.item}</span>
                    <span style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                      {log.detail}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Step Sequence Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {steps.map((step, idx) => {
              const isCompleted = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div
                  key={idx}
                  style={{
                    background: isCurrent ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    border: isCurrent
                      ? '1px solid var(--border-accent)'
                      : isCompleted
                      ? '1px solid var(--border-success)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: isCompleted
                        ? 'var(--success)'
                        : isCurrent
                        ? 'var(--primary)'
                        : 'var(--bg-input)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('decision')}
            >
              Skip Animation → View Top Picks
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
};
