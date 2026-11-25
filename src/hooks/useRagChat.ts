import { useState, useRef } from 'react';
import type { Message } from '../types/chat';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useRagChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stopGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  };

  const clearChat = () => {
    stopGeneration();
    setMessages([]);
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' };

    const historyForApi = [...messages, userMsg].map(({ role, content: c }) => ({
      role,
      content: c,
    }));

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let rafId: number | null = null;

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to stream response');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let dirty = false;

      const flushToState = () => {
        if (dirty) {
          const snapshot = accumulated;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: snapshot } : m))
          );
          dirty = false;
        }
        rafId = requestAnimationFrame(flushToState);
      };

      rafId = requestAnimationFrame(flushToState);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        dirty = true;
      }

      // Final flush after stream completes
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: accumulated } : m))
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const errText = err instanceof Error ? err.message : 'Connection error';
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: `Error: ${errText}` } : m))
      );
    } finally {
      if (rafId !== null) cancelAnimationFrame(rafId);
      abortRef.current = null;
      setStreaming(false);
    }
  };

  return { messages, streaming, sendMessage, stopGeneration, clearChat };
}
