import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  thinking?: string;
  thinkingSteps?: string[];
}

export const useChat = (participantId: string | null) => {
  const storageKey = participantId ? `consenzo_chat_${participantId}` : null;

  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (!storageKey) return null;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) return JSON.parse(cached).conversationId || null;
    } catch {}
    return null;
  });

  const [category, setCategory] = useState<string>(() => {
    if (!storageKey) return 'smart_tvs';
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) return JSON.parse(cached).category || 'smart_tvs';
    } catch {}
    return 'smart_tvs';
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!storageKey) return [];
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) return JSON.parse(cached).messages || [];
    } catch {}
    return [];
  });

  const [turnCount, setTurnCount] = useState<number>(() => {
    if (!storageKey) return 1;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) return JSON.parse(cached).turnCount || 1;
    } catch {}
    return 1;
  });

  const [isReadyForSummary, setIsReadyForSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeThinkingStep, setActiveThinkingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync to storage
  useEffect(() => {
    if (!storageKey || !conversationId) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        conversationId,
        category,
        turnCount,
        messages
      }));
    } catch {}
  }, [storageKey, conversationId, category, turnCount, messages]);

  // Initialize conversation if no cached messages
  useEffect(() => {
    if (!participantId) return;

    // If we already have cached conversation, don't restart
    if (messages.length > 0 && conversationId) {
      return;
    }

    let isMounted = true;
    const initChat = async () => {
      setIsLoading(true);
      setActiveThinkingStep('Connecting to Consenzo dynamic discovery engine...');
      try {
        const res = await api.startConversation({ participantId });
        if (isMounted) {
          setConversationId(res.conversationId);
          setTurnCount(res.turnCount);
          if (res.category) {
            setCategory(res.category);
          }
          const initialMsgs: ChatMessage[] = [
            {
              id: 'msg_init',
              role: 'assistant',
              content: res.initialMessage,
              timestamp: new Date().toISOString(),
              thinking: res.thinking,
              thinkingSteps: res.thinkingSteps
            }
          ];
          setMessages(initialMsgs);
          if (storageKey) {
            try {
              localStorage.setItem(storageKey, JSON.stringify({
                conversationId: res.conversationId,
                category: res.category || 'smart_tvs',
                turnCount: res.turnCount,
                messages: initialMsgs
              }));
            } catch {}
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to initialize chat.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setActiveThinkingStep('');
        }
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, [participantId, conversationId, messages.length, storageKey]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !conversationId || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setActiveThinkingStep('Parsing natural language phrasing and trade-offs...');
    setError(null);

    // Staged thinking step simulation for rich feedback
    const timer1 = setTimeout(() => {
      setActiveThinkingStep('Cross-referencing constraints against catalog inventory...');
    }, 450);
    const timer2 = setTimeout(() => {
      setActiveThinkingStep('Synthesizing empathetic consensus response...');
    }, 900);

    try {
      const response = await api.sendMessage(conversationId, content.trim());

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        thinking: response.thinking,
        thinkingSteps: response.thinkingSteps
      };

      setMessages(prev => [...prev, assistantMsg]);
      setTurnCount(response.turnCount);
      if (response.isReadyForSummary) {
        setIsReadyForSummary(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
      setActiveThinkingStep('');
    }
  }, [conversationId, isLoading]);

  return {
    messages,
    turnCount,
    category,
    isReadyForSummary,
    isLoading,
    activeThinkingStep,
    error,
    sendMessage
  };
};
