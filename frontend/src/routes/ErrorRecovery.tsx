import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface ErrorRecoveryProps {
  onNavigate: (route: string) => void;
  message?: string;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  onNavigate,
  message = 'Your session has disconnected or expired.'
}) => {
  return (
    <div style={{ padding: '5rem 0' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <Card variant="default" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <h2>Session Notice</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 2rem' }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => onNavigate('landing')}>
              Return to Home
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('join')}>
              Re-enter PIN
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
