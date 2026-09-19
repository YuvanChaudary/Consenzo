import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';
import { useParticipant } from '../context/ParticipantContext';

interface CreateGroupProps {
  onNavigate: (route: string) => void;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  badge: string;
  defaultTitle: string;
  description: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'smart_tvs',
    name: 'Smart TVs & Displays',
    icon: '📺',
    badge: '50 4K Models',
    defaultTitle: 'Family Living Room TV',
    description: 'OLED, QLED, 4K HDR, 120Hz gaming displays'
  },
  {
    id: 'laptops',
    name: 'Laptops & Workstations',
    icon: '💻',
    badge: '50 Verified Laptops',
    defaultTitle: 'Developer & Gaming Laptop',
    description: 'Ultrabooks, Apple M-Series, RTX gaming & code rigs'
  },
  {
    id: 'soundbars',
    name: 'Soundbars & Home Audio',
    icon: '🔊',
    badge: '50 Audio Systems',
    defaultTitle: 'Home Theater Soundbar',
    description: 'Dolby Atmos, wireless subwoofers, 5.1 spatial audio'
  },
  {
    id: 'custom',
    name: 'Custom Product Goal',
    icon: '✨',
    badge: 'Adaptive AI Discovery',
    defaultTitle: 'Shared Group Purchase',
    description: 'Enter any product, brand, or appliance goal'
  }
];

export const CreateGroup: React.FC<CreateGroupProps> = ({ onNavigate }) => {
  const { setGroupData } = useSession();
  const { setSession } = useParticipant();

  const [selectedCategory, setSelectedCategory] = useState('smart_tvs');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [title, setTitle] = useState('Family Living Room TV');
  const [hasCustomTitle, setHasCustomTitle] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [participantCount, setParticipantCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectCategory = (cat: CategoryOption) => {
    setSelectedCategory(cat.id);
    if (!hasCustomTitle) {
      setTitle(cat.defaultTitle);
    }
  };

  const finalCategory = selectedCategory === 'custom'
    ? (customCategoryInput.trim() || 'custom_purchase')
    : selectedCategory;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name as the room host.');
      return;
    }
    if (selectedCategory === 'custom' && !customCategoryInput.trim()) {
      setError('Please specify your custom product category.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.createGroup({
        title: title.trim(),
        category: finalCategory,
        creatorDisplayName: displayName.trim(),
        targetParticipantCount: participantCount
      });

      // Save participant session
      setSession({
        token: result.token,
        participantId: result.creator.participantId,
        displayName: result.creator.displayName,
        role: result.creator.role,
        groupId: result.groupId,
        status: 'JOINED'
      });

      // Save room session
      setGroupData({
        group: {
          groupId: result.groupId,
          title: result.title,
          category: result.category,
          status: result.status,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        },
        roster: [
          {
            participantId: result.creator.participantId,
            displayName: result.creator.displayName,
            role: result.creator.role,
            status: 'JOINED',
            joinedAt: new Date().toISOString()
          }
        ],
        inviteCode: result.inviteCode,
        inviteUrl: result.inviteUrl,
        targetParticipantCount: participantCount
      });

      onNavigate('lobby');
    } catch (err: any) {
      setError(err.message || 'Failed to create decision room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <Card variant="glow">
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              Step 1 of 4 • Adaptive Engine
            </span>
            <h2 style={{ fontSize: '1.9rem', letterSpacing: '-0.02em' }}>Create a Decision Room</h2>
            <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Set up a shared room for your family, team, or roommates with dynamic multi-agent consensus.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* Dynamic Product Category Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Product Category (Dynamic)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  Select any category or custom
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {CATEGORY_OPTIONS.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.22) 0%, rgba(139, 92, 246, 0.12) 100%)'
                          : 'rgba(20, 28, 45, 0.5)',
                        border: isSelected ? '2px solid var(--primary-light)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-normal)',
                        boxShadow: isSelected ? '0 0 20px rgba(124, 58, 237, 0.35)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.35rem' }}>{cat.icon}</span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                            color: isSelected ? '#fff' : 'var(--text-tertiary)'
                          }}
                        >
                          {cat.badge}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                        {cat.description}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedCategory === 'custom' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={e => setCustomCategoryInput(e.target.value)}
                    placeholder="Enter custom category, e.g. Espresso Machines, Gaming Consoles, Drones"
                    required
                    style={{
                      width: '100%',
                      borderColor: 'var(--primary-light)',
                      background: 'rgba(124, 58, 237, 0.08)'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                    Consenzo's dialogue agent will dynamically understand human language preferences for this goal.
                  </span>
                </div>
              )}
            </div>

            {/* Decision Room Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Decision Room Name
              </label>
              <input
                type="text"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  setHasCustomTitle(true);
                }}
                placeholder="e.g. Living Room Soundbar or Dev Laptop"
                required
                style={{ width: '100%' }}
              />
            </div>

            {/* Host Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Your Name (Room Host)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Dad, Alex, Priya, Coordinator"
                required
                style={{ width: '100%' }}
              />
            </div>

            {/* Participant Count */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Expected Participants (2 to 4 people)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setParticipantCount(num)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0',
                      borderRadius: 'var(--radius-md)',
                      border: participantCount === num ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: participantCount === num ? 'var(--primary-bg)' : 'var(--bg-elevated)',
                      color: participantCount === num ? 'var(--primary-light)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {num} People
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)'
              }}
            >
              Generate Shareable Room PIN
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
