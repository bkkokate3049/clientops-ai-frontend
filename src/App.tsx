import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Send, Square, RotateCcw, Bot, Menu } from 'lucide-react';
import { useDocuments } from './hooks/useDocument';
import { useRagChat } from './hooks/useRagChat';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';

const SAMPLE_PROMPTS = [
  'What is the effective date of the Acme SLA handbook?',
  'What SLA credit do we get if uptime drops to 97.5%?',
  'Can an enterprise customer get a refund after 20 days?',
];

export default function App() {
  const { docs, uploading, error, uploadFile, deleteDoc } = useDocuments();
  const { messages, streaming, sendMessage, stopGeneration, clearChat } = useRagChat();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: streaming ? 'auto' : 'smooth' });
  }, [messages, streaming]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const text = input;
    setInput('');
    sendMessage(text);
  };

  return (
    <div className="flex h-dvh bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar
        docs={docs}
        uploading={uploading}
        error={error}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onUpload={uploadFile}
        onDelete={deleteDoc}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 md:hidden"
              aria-label="Open knowledge base sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-base truncate">
                Enterprise Knowledge & SLA Copilot
              </h2>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                Grounded RAG • Node.js + pgvector + Gemini Streaming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              ● RAG Active
            </span>
          </div>
        </header>

        <div
          aria-live="polite"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto px-2">
              <Bot className="w-11 h-11 sm:w-12 sm:h-12 text-indigo-400 mb-3" />
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Ask anything about your client policies
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Answers are strictly grounded in your uploaded documents with inline source badges.
              </p>
              <div className="w-full space-y-2">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-3 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={streaming && idx === messages.length - 1}
              />
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-800 p-3 sm:p-4 bg-slate-900/40">
          <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about SLAs, refund windows, or retention..."
              className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            {streaming ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="bg-rose-600 hover:bg-rose-500 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition shrink-0"
              >
                <Square className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
