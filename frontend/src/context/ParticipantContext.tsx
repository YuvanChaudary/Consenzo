import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, ParticipantStatus } from '@shared/types/session';

interface ParticipantSession {
  token: string | null;
  participantId: string | null;
  displayName: string | null;
  role: Role | null;
  status: ParticipantStatus | null;
  groupId: string | null;
}

interface ParticipantContextType extends ParticipantSession {
  setSession: (params: {
    token: string;
    participantId: string;
    displayName: string;
    role: Role;
    groupId: string;
    status?: ParticipantStatus;
  }) => void;
  updateStatus: (status: ParticipantStatus) => void;
  clearSession: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'consenzo_participant_session';

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

export const ParticipantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<ParticipantSession>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore session storage errors
    }
    return {
      token: null,
      participantId: null,
      displayName: null,
      role: null,
      status: null,
      groupId: null
    };
  });

  useEffect(() => {
    try {
      if (session.token) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        sessionStorage.setItem('consenzo_token', session.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem('consenzo_token', session.token);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('consenzo_token');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('consenzo_token');
      }
    } catch {
      // Ignore storage errors
    }
  }, [session]);

  const setSession = (params: {
    token: string;
    participantId: string;
    displayName: string;
    role: Role;
    groupId: string;
    status?: ParticipantStatus;
  }) => {
    try {
      sessionStorage.setItem('consenzo_token', params.token);
      localStorage.setItem('consenzo_token', params.token);
    } catch {}
    setSessionState({
      token: params.token,
      participantId: params.participantId,
      displayName: params.displayName,
      role: params.role,
      status: params.status || 'JOINED',
      groupId: params.groupId
    });
  };

  const updateStatus = (status: ParticipantStatus) => {
    setSessionState(prev => ({ ...prev, status }));
  };

  const clearSession = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('consenzo_token');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('consenzo_token');
    } catch {}
    setSessionState({
      token: null,
      participantId: null,
      displayName: null,
      role: null,
      status: null,
      groupId: null
    });
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ParticipantContext.Provider
      value={{
        ...session,
        setSession,
        updateStatus,
        clearSession,
        isAuthenticated: Boolean(session.token && session.participantId)
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipant = (): ParticipantContextType => {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
};
