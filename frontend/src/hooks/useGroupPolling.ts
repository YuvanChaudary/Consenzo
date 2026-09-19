import { useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';

export const useGroupPolling = (groupId: string | null, intervalMs = 3000) => {
  const { updateRoster, updateStatus } = useSession();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!groupId) return;

    let isSubscribed = true;

    const poll = async () => {
      try {
        const data = await api.getGroup(groupId);
        if (isSubscribed) {
          updateRoster(data.roster);
          updateStatus(data.status);
        }
      } catch (err) {
        console.warn('Group polling error:', err);
      }
    };

    // Initial immediate fetch
    poll();

    // Setup interval
    timerRef.current = window.setInterval(poll, intervalMs);

    return () => {
      isSubscribed = false;
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [groupId, intervalMs, updateRoster, updateStatus]);
};
