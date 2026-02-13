import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { chatApi } from '../api';

interface Message {
    role: 'user' | 'assistant';
    text: string;
    suggestions?: string[];
}

export default function ChatDrawer() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            text: "I can help with gift ideas, birthday messages, or check-in tips. Ask away.",
            suggestions: ['Gift ideas', 'Birthday wish ideas', 'Check-in tips'],
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const send = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || sending) return;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: msg }]);
        setSending(true);
        try {
            const resp = await chatApi.send(msg);
            setMessages((prev) => [...prev, { role: 'assistant', text: resp.reply, suggestions: resp.suggestions }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'Something went wrong.' }]);
        }
        setSending(false);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} style={{ animation: 'fade-in 150ms ease-out' }}>
                        <div className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot size={14} className="text-accent" />
                                </div>
                            )}
                            <div
                                className={`text-sm leading-relaxed max-w-[85%] px-3.5 py-2.5 ${msg.role === 'user'
                                        ? 'bg-accent text-white rounded-2xl rounded-br-md'
                                        : 'bg-bg-tertiary text-text-secondary rounded-2xl rounded-bl-md'
                                    }`}
                            >
                                {msg.text}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <User size={14} className="text-text-secondary" />
                                </div>
                            )}
                        </div>
                        {msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                                {msg.suggestions.map((s, j) => (
                                    <button
                                        key={j}
                                        onClick={() => send(s)}
                                        className="px-2.5 py-1 text-xs border border-border rounded-md text-text-tertiary hover:text-accent hover:border-accent transition-colors"
                                        style={{ transitionDuration: '100ms' }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {sending && (
                    <div className="flex gap-2.5" style={{ animation: 'fade-in 150ms ease-out' }}>
                        <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center">
                            <Bot size={14} className="text-accent" />
                        </div>
                        <span className="text-sm text-text-muted animate-pulse px-3.5 py-2.5 bg-bg-tertiary rounded-2xl rounded-bl-md">
                            Thinking...
                        </span>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                    <input
                        className="input flex-1"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && send()}
                        placeholder="Ask me anything..."
                        disabled={sending}
                    />
                    <button
                        onClick={() => send()}
                        disabled={!input.trim() || sending}
                        className="btn btn-accent !px-3"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
