import { memo, useMemo } from 'react';
import { Bot, User } from 'lucide-react';
import type { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
}

function parseCitations(text: string) {
  const parts = text.split(/(\[[^\]]+\.(?:pdf|txt|md|csv)|\[[^\]]+-v\d+\])/gi);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <span
          key={index}
          className="inline-flex items-center mx-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const formattedContent = useMemo(() => {
    if (!message.content || isUser) return message.content;
    return parseCitations(message.content);
  }, [message.content, isUser]);

  return (
    <div className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-400" />}
      </div>
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-900 border border-slate-800 text-slate-200'
        }`}
      >
        {formattedContent ? (
          formattedContent
        ) : isStreaming ? (
          <span className="text-slate-400 animate-pulse">Searching knowledge base...</span>
        ) : null}
      </div>
    </div>
  );
});
