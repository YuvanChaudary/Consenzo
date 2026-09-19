import { useState, useEffect } from 'react';
import { api, GroupAnalysisResult } from '../services/api';

export const useConsensus = (groupId: string | null) => {
  const [analysis, setAnalysis] = useState<GroupAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    let isMounted = true;

    const runAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getAnalysis(groupId);
        if (isMounted) {
          setAnalysis(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to compute group consensus.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  return { analysis, isLoading, error };
};
