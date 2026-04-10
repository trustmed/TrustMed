import { useState } from 'react';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AiChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setError(null);
    setLoading(true);
    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to get AI reply');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full my-8">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm px-0 py-0 flex flex-col min-h-[340px] max-h-[520px] overflow-hidden w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">AI Assistant</h2>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 bg-neutral-50 dark:bg-neutral-950/60">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Bot className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-base font-medium text-neutral-500 dark:text-neutral-400">
                Start chatting with your AI assistant…
              </p>
              <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                Ask anything about your health records, appointments, or more.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-end gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                    <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'px-4 py-2 rounded-xl max-w-[70%] text-sm shadow',
                    msg.role === 'user'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-100 dark:border-blue-900'
                      : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800'
                  )}
                >
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* Error */}
        {error && (
          <div className="px-6 py-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900">
            {error}
          </div>
        )}
        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/80">
          <input
            className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 transition"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={!input.trim() || loading}
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
