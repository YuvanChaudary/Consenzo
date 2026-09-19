import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Group, Participant, GroupStatus } from '@shared/types/session';

interface SessionContextType {
  group: Group | null;
  roster: Participant[];
  inviteCode: string | null;
  inviteUrl: string | null;
  targetParticipantCount: number;
  setGroupData: (data: {
    group: Group;
    roster?: Participant[];
    inviteCode?: string;
    inviteUrl?: string;
    targetParticipantCount?: number;
  }) => void;
  updateStatus: (status: GroupStatus) => void;
  updateRoster: (roster: Participant[]) => void;
  clearGroup: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_KEY = 'consenzo_group_session';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionData, setSessionDataState] = useState<{
    group: Group | null;
    roster: Participant[];
    inviteCode: string | null;
    inviteUrl: string | null;
    targetParticipantCount: number;
  }>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      group: null,
      roster: [],
      inviteCode: null,
      inviteUrl: null,
      targetParticipantCount: 4
    };
  });

  const { group, roster, inviteCode, inviteUrl, targetParticipantCount } = sessionData;

  useEffect(() => {
    try {
      if (sessionData.group) {
        const payload = JSON.stringify(sessionData);
        localStorage.setItem(SESSION_KEY, payload);
        sessionStorage.setItem(SESSION_KEY, payload);
      } else {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {}
  }, [sessionData]);

  const setGroupData = useCallback((data: {
    group: Group;
    roster?: Participant[];
    inviteCode?: string;
    inviteUrl?: string;
    targetParticipantCount?: number;
  }) => {
    setSessionDataState(prev => ({
      group: data.group,
      roster: data.roster !== undefined ? data.roster : prev.roster,
      inviteCode: data.inviteCode !== undefined ? data.inviteCode : prev.inviteCode,
      inviteUrl: data.inviteUrl !== undefined ? data.inviteUrl : prev.inviteUrl,
      targetParticipantCount: data.targetParticipantCount !== undefined ? data.targetParticipantCount : prev.targetParticipantCount
    }));
  }, []);

  const updateStatus = useCallback((status: GroupStatus) => {
    setSessionDataState(prev => ({
      ...prev,
      group: prev.group ? { ...prev.group, status } : null
    }));
  }, []);

  const updateRoster = useCallback((newRoster: Participant[]) => {
    setSessionDataState(prev => ({
      ...prev,
      roster: newRoster
    }));
  }, []);

  const clearGroup = useCallback(() => {
    setSessionDataState({
      group: null,
      roster: [],
      inviteCode: null,
      inviteUrl: null,
      targetParticipantCount: 4
    });
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  return (
    <SessionContext.Provider
      value={{
        group,
        roster,
        inviteCode,
        inviteUrl,
        targetParticipantCount,
        setGroupData,
        updateStatus,
        updateRoster,
        clearGroup
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
