
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const IAL_GPT_URL = "https://chatgpt.com/g/g-696465949a4c81919d833b0cc7b825c8-international-arena-league-gpt";

export const AIChatWidget: React.FC<{ isOpen: boolean; setIsOpen: (o: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const { profiles, addToast, setView } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Induction Node Active. I am the IAL Tactical Assistant. How can I assist your registration or scouting query?" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Context: Direct user widget interaction. History: ${JSON.stringify(messages.slice(-2))}. User: ${userText}`,
        config: {
          systemInstruction: `You are the Official IAL Tactical Widget. 
          Provide maximum capacity support for the International Arena League.
          Rules: Authoritative, tech-forward, briefly explain 3-tier contracts ($2200+, $1000, Practice) and zero import rules.
          Encourage registration. Current Registry Count: ${profiles.length}.`,
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Link timed out. Synchronizing..." }]);
    } catch (err) {
      addToast("Neural link disrupted.", "error");
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-8 right-8 z-[500] bg-league-accent text-white p-4 rounded-full shadow-[0_0_30px_rgba(228,29,36,0.6)] hover:scale-110 active:scale-95 transition-all group border-2 border-white/20"
    >
      <div className="relative">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-league-ok rounded-full border-2 border-black animate-pulse" />
      </div>
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] font-black uppercase text-white tracking-widest">IAL Command Assistant</span>
      </div>
    </button>
  );

  return (
    <div className="fixed bottom-8 right-8 z-[500] w-[90vw] md:w-[400px] h-[600px] bg-league-panel border-2 border-league-accent rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="p-6 bg-black/60 border-b border-league-border flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-league-accent animate-ping' : 'bg-league-ok'}`} />
          <div>
            <h4 className="text-sm font-black italic uppercase text-white leading-none">Command Widget</h4>
            <p className="text-[7px] font-black text-league-accent uppercase tracking-widest mt-1">Direct Link • IAL_GPT_CORE</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setView('ai-assistant'); setIsOpen(false); }} className="text-league-muted hover:text-white p-1" title="Full Screen"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeWidth="2"/></svg></button>
          <button onClick={() => setIsOpen(false)} className="text-league-muted hover:text-white p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-bold leading-relaxed border ${
              m.role === 'ai' 
                ? 'bg-black/40 border-league-accent/20 text-white italic' 
                : 'bg-league-bg border-league-border text-white/70'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-black/20 border border-league-accent/10 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-1 h-3 bg-league-accent animate-bounce" />
              <span className="text-[8px] font-black uppercase text-league-accent tracking-widest animate-pulse">Neural Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Footer / Input */}
      <div className="p-6 bg-black/60 border-t border-league-border space-y-4">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            placeholder="Tactical query..."
            className="w-full bg-league-bg border border-league-border p-4 pr-12 rounded-xl text-white text-xs outline-none focus:border-league-accent shadow-inner"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isThinking}
          />
          <button type="submit" disabled={isThinking} className="absolute right-2 top-1/2 -translate-y-1/2 text-league-accent p-2 hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2"></path></svg>
          </button>
        </form>
        <div className="flex justify-between items-center px-1">
          <a href={IAL_GPT_URL} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black uppercase text-league-muted hover:text-league-accent transition-colors flex items-center gap-1">
            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></svg>
            Full GPT Model
          </a>
          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest italic">Engine: G3_PRO_REASONING</span>
        </div>
      </div>
    </div>
  );
};
