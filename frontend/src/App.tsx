import React, { useState } from 'react';
import { SessionProvider } from './context/SessionContext';
import { ParticipantProvider } from './context/ParticipantContext';
import { Header } from './components/Header';
import { Landing } from './routes/Landing';
import { CreateGroup } from './routes/CreateGroup';
import { JoinGroup } from './routes/JoinGroup';
import { GroupLobby } from './routes/GroupLobby';
import { PrivateInterview } from './routes/PrivateInterview';
import { PreferenceReview } from './routes/PreferenceReview';
import { AnalysisProgress } from './routes/AnalysisProgress';
import { RecommendationBoard } from './routes/RecommendationBoard';
import { ErrorRecovery } from './routes/ErrorRecovery';
import { AmazonInventory } from './routes/AmazonInventory';

export const App: React.FC = () => {
  const getInitialRouteState = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/join/')) {
        const code = pathname.replace('/join/', '').trim().toUpperCase();
        return { route: 'join', params: { inviteCode: code } };
      }
      if (pathname === '/inventory') {
        return { route: 'inventory', params: {} };
      }
    }
    return { route: 'landing', params: {} };
  };

  const initial = getInitialRouteState();
  const [currentRoute, setCurrentRoute] = useState<string>(initial.route);
  const [routeParams, setRouteParams] = useState<any>(initial.params);

  React.useEffect(() => {
    const handlePopState = () => {
      const state = getInitialRouteState();
      setCurrentRoute(state.route);
      setRouteParams(state.params);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (route: string, params: any = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (route === 'join' && params.inviteCode && typeof window !== 'undefined') {
      window.history.pushState({}, '', `/join/${params.inviteCode}`);
    } else if (route === 'inventory' && typeof window !== 'undefined') {
      window.history.pushState({}, '', '/inventory');
    } else if (route === 'landing' && typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'create':
        return <CreateGroup onNavigate={handleNavigate} />;
      case 'join':
        return <JoinGroup onNavigate={handleNavigate} initialInviteCode={routeParams.inviteCode} />;
      case 'lobby':
        return <GroupLobby onNavigate={handleNavigate} />;
      case 'interview':
        return <PrivateInterview onNavigate={handleNavigate} />;
      case 'review':
        return <PreferenceReview onNavigate={handleNavigate} />;
      case 'analysis':
        return <AnalysisProgress onNavigate={handleNavigate} />;
      case 'decision':
        return <RecommendationBoard onNavigate={handleNavigate} />;
      case 'inventory':
        return <AmazonInventory onNavigate={handleNavigate} />;
      case 'error':
        return <ErrorRecovery onNavigate={handleNavigate} message={routeParams.message} />;
      case 'landing':
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return (
    <ParticipantProvider>
      <SessionProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header onNavigate={handleNavigate} activeRoute={currentRoute} />
          <main style={{ flex: 1 }}>{renderCurrentRoute()}</main>
          <footer
            style={{
              padding: '1.75rem 0',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(7, 9, 14, 0.95)',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)'
            }}
          >
            <div className="container">
              Consenzo • AWS Serverless & NVIDIA Hosted Generative Inference • Amazon Hackathon 2026
            </div>
          </footer>
        </div>
      </SessionProvider>
    </ParticipantProvider>
  );
};

export default App;
