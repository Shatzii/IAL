
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { SystemRole, Franchise, ChatChannel, ChatMessage } from '../types';

const INITIAL_CHANNELS: ChatChannel[] = [
  { id: 'chan_global', name: 'global-league', description: 'Universal league announcements and general chat.', isPrivate: false },
  { id: 'chan_intel', name: 'scouting-intel', description: 'Restricted: Prospect analysis and draft strategy.', isPrivate: true, allowedRoles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
  { id: 'chan_nott', name: 'nottingham-hq', description: 'Franchise-only operations for Nottingham.', isPrivate: true, franchiseScope: Franchise.NOTTINGHAM },
  { id: 'chan_glas', name: 'glasgow-hq', description: 'Franchise-only operations for Glasgow.', isPrivate: true, franchiseScope: Franchise.GLASGOW }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'm1', channelId: 'chan_global', senderId: 'bot_1', senderName: 'LEAGUE_OPS', senderRole: SystemRole.LEAGUE_ADMIN, text: 'Welcome to the official International Arena League Communications Hub. All transmissions are recorded for audit purposes.', timestamp: new Date(Date.now() - 100000).toISOString() },
  { id: 'm2', channelId: 'chan_global', senderId: 'scout_1', senderName: 'Chief Scout', senderRole: SystemRole.LEAGUE_ADMIN, text: 'Checking in from the Stuttgart Combine. Talent density is high this year.', timestamp: new Date(Date.now() - 50000).toISOString() }
];

export const CommsCenter: React.FC = () => {
  const { currentSystemRole, sendMessage, messages: appMessages } = useApp();
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filter visible channels based on RBAC
  const visibleChannels = INITIAL_CHANNELS.filter(chan => {
    if (!chan.isPrivate) return true;
    if (chan.allowedRoles && chan.allowedRoles.includes(currentSystemRole)) return true;
    // In a real app, we'd check if the user belongs to the franchise scope
    if (chan.franchiseScope && currentSystemRole === SystemRole.LEAGUE_ADMIN) return true;
    return false;
  });

  const activeChannel = visibleChannels.find(c => c.id === activeChannelId) || visibleChannels[0];

  // Combine initial and app messages
  const allMessages = [...INITIAL_MESSAGES, ...appMessages].filter(m => m.channelId === activeChannelId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText, activeChannelId);
    setInputText('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[75vh] animate-in fade-in duration-500">
      {/* Sidebar: Channels */}
      <div className="w-full lg:w-72 bg-league-panel border border-league-border rounded-2xl flex flex-col shadow-2xl">
        <div className="p-6 border-b border-league-border">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Comms Hub</h3>
          <p className="text-[8px] font-bold text-league-muted uppercase mt-1 tracking-widest">Secure Transmissions</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div className="text-[8px] font-black uppercase text-league-accent tracking-widest px-2 mb-2">Channels</div>
          {visibleChannels.map(chan => (
            <button
              key={chan.id}
              onClick={() => setActiveChannelId(chan.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                activeChannelId === chan.id 
                  ? 'bg-league-accent/10 border border-league-accent/30 text-white' 
                  : 'text-league-muted hover:bg-league-bg hover:text-white border border-transparent'
              }`}
            >
              <span className={`text-lg font-black ${activeChannelId === chan.id ? 'text-league-accent' : 'text-league-muted opacity-50'}`}>#</span>
              <span className="text-[10px] font-black uppercase tracking-widest truncate">{chan.name}</span>
              {chan.isPrivate && (
                <svg className="w-3 h-3 ml-auto opacity-30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
              )}
            </button>
          ))}

          <div className="pt-6">
            <div className="text-[8px] font-black uppercase text-league-muted tracking-widest px-2 mb-2">Direct Intelligence</div>
            <p className="text-[8px] text-league-muted/30 px-2 italic uppercase font-bold">No active encrypted sessions</p>
          </div>
        </div>

        <div className="p-4 bg-league-tableHeader border-t border-league-border">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-league-accent flex items-center justify-center font-black italic text-white text-[10px]">
               {currentSystemRole.charAt(0)}
             </div>
             <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase text-white tracking-widest">{currentSystemRole}</span>
               <span className="text-[7px] text-league-ok uppercase font-bold tracking-widest flex items-center gap-1">
                 <span className="w-1 h-1 bg-league-ok rounded-full animate-pulse" /> Encrypted
               </span>
             </div>
           </div>
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 bg-league-panel border border-league-border rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
           <div>
             <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">#{activeChannel?.name}</h3>
             <p className="text-[9px] font-bold text-league-muted uppercase tracking-widest">{activeChannel?.description}</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="text-league-muted hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
              <button className="text-league-muted hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
              </button>
           </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
           {allMessages.map((msg, i) => {
             const isMe = msg.senderId === 'current-user';
             return (
               <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black italic text-white text-xs border-2 shadow-lg ${
                   msg.senderRole === SystemRole.LEAGUE_ADMIN ? 'bg-league-accent border-league-accent/50' : 
                   msg.senderRole === SystemRole.FRANCHISE_GM ? 'bg-league-blue border-league-blue/50' :
                   'bg-league-pill border-league-border'
                 }`}>
                   {msg.senderName.charAt(0)}
                 </div>
                 <div className={`max-w-[70%] space-y-1 ${isMe ? 'text-right' : ''}`}>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">{msg.senderName}</span>
                      <span className="text-[8px] font-bold text-league-muted uppercase tracking-tighter">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className={`p-4 rounded-2xl text-[11px] font-bold leading-relaxed border transition-all ${
                     isMe ? 'bg-league-accent text-white border-league-accent/30' : 'bg-league-bg text-league-muted border-league-border group-hover:border-league-muted/30'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               </div>
             );
           })}
           <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-league-tableHeader border-t border-league-border">
          <form onSubmit={handleSend} className="relative group">
            <input 
              type="text" 
              placeholder={`Send message to #${activeChannel?.name}...`}
              className="w-full bg-league-bg border border-league-border p-5 pr-16 rounded-2xl text-xs font-bold text-white outline-none focus:border-league-accent transition-all group-hover:border-league-border/50"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
               <button type="button" className="text-league-muted hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
               </button>
               <button type="submit" className="bg-league-accent text-white p-2 rounded-xl hover:scale-110 transition-transform shadow-[0_0_15px_rgba(228,29,36,0.4)]">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
               </button>
            </div>
          </form>
          <div className="flex justify-between mt-3 px-2">
            <div className="flex gap-4">
              <button className="text-[8px] font-black uppercase tracking-widest text-league-muted hover:text-white flex items-center gap-1">
                <span className="text-league-ok">●</span> Draft Room Active
              </button>
              <button className="text-[8px] font-black uppercase tracking-widest text-league-muted hover:text-white flex items-center gap-1">
                <span className="text-league-warn">●</span> 2 Active Scouts
              </button>
            </div>
            <p className="text-[8px] font-black uppercase text-league-muted/30 tracking-[0.2em] italic">Open-Source Protocol: Matrix-Secured</p>
          </div>
        </div>
      </div>
    </div>
  );
};
