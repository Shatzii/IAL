
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'ai';
  text: string;
  sources?: { uri: string; title: string }[];
}

const IAL_GPT_URL = "https://chatgpt.com/g/g-696465949a4c81919d833b0cc7b825c8-international-arena-league-gpt";

export const AICommandNode: React.FC = () => {
  const { profiles, addToast } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Uplink Secure. Neural Grounding Active. I can now search the web for external athlete intel. How can I assist?" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

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
        contents: `Context: Local Registry has ${profiles.length} athletes. User: ${userText}`,
        config: {
          systemInstruction: `You are the IAL Chief Intelligence Officer. 
          Use Google Search to find real-world stats, news, or history of athletes if they aren't in the local node. 
          Always cite your sources. Maintain a high-performance military/tech tone.`,
          tools: [{ googleSearch: {} }]
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
      })).filter((s: any) => s.uri && s.title) || [];

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text || "Communication link timeout. Retrying signal...",
        sources
      }]);
    } catch (err) {
      addToast("Neural link disrupted.", "error");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[75vh] flex flex-col bg-league-panel border border-league-border rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-league-border bg-black/40 backdrop-blur-md flex justify-between items-center relative z-10">
        <div className="flex items-center gap-6">
           <div className={`w-3 h-3 rounded-full ${isThinking ? 'bg-league-accent animate-ping' : 'bg-league-ok'} shadow-[0_0_15px_currentColor]`} />
           <div>
              <h2 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none">Intelligence Command</h2>
              <p className="text-[8px] font-black text-league-accent uppercase mt-2 tracking-[0.4em] italic">Real-Time Search Grounding: ENABLED</p>
           </div>
        </div>
        <a href={IAL_GPT_URL} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 text-white/50 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-league-accent hover:text-white transition-all flex items-center gap-2">
          Official GPT Portal
        </a>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative">
         <div className="absolute inset-0 pointer-events-none opacity-[0.01] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] [background-size:100%_4px,3px_100%]" />
         
         {messages.map((m, i) => (
           <div key={i} className={`flex gap-6 animate-in slide-in-from-bottom-2 duration-500 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black italic border shadow-2xl ${m.role === 'ai' ? 'bg-league-accent border-league-accent text-white' : 'bg-league-pill border-league-border text-white'}`}>
                 {m.role === 'ai' ? 'IAL' : 'USR'}
              </div>
              <div className="flex-1 max-w-[75%] space-y-4">
                 <div className={`p-6 rounded-[2rem] text-sm font-bold italic leading-relaxed shadow-xl border ${m.role === 'ai' ? 'bg-black/60 border-league-accent/30 text-white' : 'bg-league-bg border-league-border text-white/80'}`}>
                    {m.text}
                 </div>
                 {m.sources && m.sources.length > 0 && (
                   <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                      {m.sources.map((s, idx) => (
                        <a key={idx} href={s.uri} target="_blank" rel="noopener" className="bg-league-bg border border-white/10 px-3 py-1 rounded-lg text-[7px] font-black uppercase text-league-muted hover:text-league-accent hover:border-league-accent transition-all flex items-center gap-2">
                           <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="3" /></svg>
                           {s.title}
                        </a>
                      ))}
                   </div>
                 )}
              </div>
           </div>
         ))}
         
         {isThinking && (
           <div className="flex gap-6 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-league-accent flex items-center justify-center font-black italic text-white shadow-2xl">...</div>
              <div className="bg-black/40 border border-league-accent/20 p-6 rounded-[2rem] text-[10px] font-black uppercase text-league-accent tracking-widest italic flex items-center gap-3">
                 <div className="w-1.5 h-4 bg-league-accent animate-bounce" />
                 Neural Search Grounding Active
              </div>
           </div>
         )}
         <div ref={scrollRef} />
      </div>

      <div className="p-10 bg-black/60 border-t border-league-border">
         <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <input 
              type="text" 
              placeholder="Query Global Scouting Network..."
              className="w-full bg-league-bg border border-league-border p-5 pr-20 rounded-2xl text-white outline-none focus:border-league-accent transition-all font-bold shadow-inner"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isThinking}
            />
            <button type="submit" disabled={isThinking} className="absolute right-3 top-1/2 -translate-y-1/2 bg-league-accent text-white p-3 rounded-xl shadow-xl active:scale-95 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2"></path></svg>
            </button>
         </form>
         <div className="flex justify-between items-center mt-6 px-4">
            <div className="flex gap-4">
               <button onClick={() => setInput("Scouting report on real 2024 NFL undrafted free agents.")} className="text-[8px] font-black uppercase text-league-muted hover:text-white transition-colors"># Global_Scout</button>
               <button onClick={() => setInput("Search for recent stats for wide receivers in the ELF.")} className="text-[8px] font-black uppercase text-league-muted hover:text-white transition-colors"># Market_Analysis</button>
            </div>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-league-muted italic opacity-30">Gemini 3 Pro + Search Grounding v1.2</p>
         </div>
      </div>
    </div>
  );
};
