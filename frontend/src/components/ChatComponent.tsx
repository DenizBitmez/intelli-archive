import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Sparkles } from 'lucide-react';

interface ChatComponentProps {
    filename: string;
}

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

const ChatComponent = ({ filename }: ChatComponentProps) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: `Greetings! I've successfully analyzed **${filename}**. I'm ready to answer your questions based on its content.` }
    ]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg: Message = { role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/chat/', {
                query: userMsg.text,
                filename: filename
            });

            const botMsg: Message = { role: 'assistant', text: response.data.answer };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', text: "I apologize, but I encountered an error while processing that request. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        {/* Avatar */}
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white'
                                : 'bg-white border border-slate-200 text-indigo-600'}
                        `}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                        </div>

                        {/* Message Bubble */}
                        <div className={`
                            flex flex-col max-w-[80%] p-5 shadow-sm text-sm leading-relaxed
                            ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm'}
                        `}>
                            {/* Optional formatting for markdown-like bolding */}
                            <p className="whitespace-pre-wrap">
                                {msg.text.split('**').map((part, i) =>
                                    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                                )}
                            </p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-start gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-400">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-3 relative"
                >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        className="flex-1 py-4 pl-12 pr-4 text-slate-700 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-100 rounded-xl outline-none transition-all placeholder:text-slate-400"
                        placeholder="Ask anything about the document..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="p-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <p className="text-center text-xs text-slate-400 mt-2">
                    AI can make mistakes. Please verify important information.
                </p>
            </div>
        </div>
    );
};

export default ChatComponent;
