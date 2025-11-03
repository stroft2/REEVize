import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Translations } from '../App';

interface AiChatbotProps {
    language: 'ar' | 'fr' | 'en';
    onClose: () => void;
    T: Translations;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const AiChatbot: React.FC<AiChatbotProps> = ({ language, onClose, T }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const langName = language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English';
    const botName = language === 'ar' ? 'نحوي' : language === 'fr' ? 'GrammaireGPT' : 'GrammarBot';
    const systemInstruction = `You are a helpful and friendly grammar tutor specializing in ${langName}. Your name is '${botName}'. Answer questions clearly, provide examples, and keep explanations concise and easy to understand for a language learner. Format your responses using markdown for readability (e.g., use **bold** for key terms, lists for rules, and code blocks for examples).`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const chatHistory = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [...chatHistory, { role: 'user', parts: [{text: input}] }],
                config: {
                    systemInstruction,
                },
            });

            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err) {
            console.error('Gemini API error:', err);
            setError(T.aiError);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Generate a dynamic greeting on first open per session
    useEffect(() => {
        const greetingKey = `chatbotGreeting_${language}`;
        const hasBeenGreeted = sessionStorage.getItem(greetingKey);

        const generateGreeting = async () => {
            setIsLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = `You are a helpful and friendly grammar tutor specializing in ${langName}. Your name is '${botName}'. Generate a short, friendly, and encouraging greeting for a student who has just opened the chat. Introduce yourself briefly. Keep it under 3 sentences.`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                setMessages([{ role: 'model', text: response.text }]);
                sessionStorage.setItem(greetingKey, 'true');
            } catch (err) {
                console.error("Failed to generate greeting:", err);
                setMessages([{ role: 'model', text: T.aiGreeting }]); // Fallback
            } finally {
                setIsLoading(false);
            }
        };

        if (!hasBeenGreeted) {
            generateGreeting();
        } else {
             // If already greeted in this session, just show the static greeting
            setMessages([{ role: 'model', text: T.aiGreeting }]);
        }
    }, [language, T.aiGreeting, langName, botName]);


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animation-fade-in" onClick={onClose}>
            <div 
                className={`relative w-full max-w-2xl h-[90vh] max-h-[700px] bg-slate-900/80 border border-brand/30 rounded-2xl shadow-2xl shadow-brand/20 flex flex-col animation-pop-in ${language === 'fr' ? 'lang-fr' : ''}`}
                onClick={e => e.stopPropagation()}
                style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 text-brand-light">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v7.5a2.25 2.25 0 002.25 2.25z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{botName}</h3>
                            <p className="text-sm text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`chat-message-animation max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand text-white rounded-br-lg' : 'bg-slate-700/80 text-slate-200 rounded-bl-lg'}`}>
                                <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="chat-message-animation max-w-[80%] p-3 rounded-2xl bg-slate-700/80 text-slate-200 rounded-bl-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-center text-red-400">{error}</p>}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={T.sendMessage + '...'}
                            disabled={isLoading}
                            className="w-full bg-slate-800/80 border border-brand/30 text-white rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus-ring-brand focus:border-transparent transition-all"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-3' : 'right-3'} p-2 rounded-lg text-white transition-colors ${isLoading || !input.trim() ? 'bg-slate-600/50 text-slate-400' : 'bg-brand hover:bg-accent'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${language === 'ar' ? 'transform scale-x-[-1]' : ''}`} viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AiChatbot;