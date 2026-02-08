import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const ChatComponent = ({ filename }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `I've analyzed ${filename}. Ask me anything about it!` }
    ]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg = { role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/chat/', {
                query: userMsg.text,
                filename: filename
            });

            const botMsg = { role: 'assistant', text: response.data.answer };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error answering that." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-500'}`}>
                            {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                        </div>
                        <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-s-xl rounded-ee-xl' : 'bg-slate-100 text-slate-800 rounded-e-xl rounded-es-xl'}`}>
                            <p className="text-sm font-normal">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-slate-100 p-4 rounded-e-xl rounded-es-xl">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        className="flex-1 p-2.5 text-sm text-slate-900 bg-slate-50 rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ask a question..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="p-2.5 text-blue-600 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatComponent;
