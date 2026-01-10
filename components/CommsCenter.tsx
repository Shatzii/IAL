
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../App';
import { SystemRole, Franchise, ChatChannel, ChatMessage, Profile } from '../types';

const INITIAL_CHANNELS: ChatChannel[] = [
  { id: 'chan_global', name: 'global-league', description: 'Universal league announcements and general chat.', isPrivate: false },
  { id: 'chan_intel', name: 'scouting-intel', description: 'Restricted: Prospect analysis and draft strategy.', isPrivate: true, allowedRoles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
  { id: 'chan_nott', name: 'nottingham-hq', description: 'Franchise-only operations for Nottingham.', isPrivate: true, franchiseScope: Franchise.NOTTINGHAM },
  { id: 'chan_glas', name: 'glasgow-hq', description: 'Franchise-only operations for Glasgow.', isPrivate: true, franchiseScope: Franchise.GLASGOW }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'm1', channelId: 'chan_global', senderId: 'bot_1', senderName: 'LEAGUE_OPS', senderRole: SystemRole.LEAGUE_ADMIN, text: 'Welcome to the official International Arena League Communications Hub. All transmissions are recorded for audit purposes.', timestamp: new Date(Date.now() - 100000).toISOString() },
  { id: 'm2', channelId: 'chan_global', senderId: 'scout_1', senderName: 'Chief Scout', senderRole: SystemRole.LEAGUE_ADMIN, text: 'Checking in from the Stuttgart Combine. Talent density is high this year.', timestamp: new Date(Date.now() - 50000).toISOString() },
  { 
    id: 'm-creds', 
    channelId: 'chan_global', 
    senderId: 'bot_1', 
    senderName: 'SECURITY_NODE', 
    senderRole: SystemRole.LEAGUE_ADMIN, 
    text: 'DECRYPTION LOG: Franchise GM access keys have been synchronized. Use [city]@gm.ial.com with key coach2026$$$ for all nodes.', 
    timestamp: new Date().toISOString() 
  }
];

export const CommsCenter: React.FC = () => {
  const { currentSystemRole, currentUserProfileId, profiles, sendMessage, messages: appMessages, activeChannelId, setActiveChannelId } = useApp();
  const [inputText, setInputText] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUserProfileId || 'admin';

  const dmChannelsFromMessages = useMemo(() => {
    const dms = new Map<string, ChatChannel>();
    [...INITIAL_MESSAGES, ...appMessages].forEach(msg => {
      if (msg.channelId.startsWith('dm_')) {
        const parts = msg.channelId.replace('dm_', '').split('_');
        if (parts.includes(currentUserId)) {
          const otherId = parts.find(id => id !== currentUserId);
          const otherProfile = profiles.find(p => p.id === otherId);
          dms.set(msg.channelId, {
            id: msg.channelId,
            name: otherProfile?.fullName || 'Direct Message',
            description: `Secure session with ${otherProfile?.fullName || 'Personnel'}`,
            isPrivate: true,
            isDirect: true,
            participants: [currentUserId, otherId || 'unknown']
          });
        }
      }
    });

    if (activeChannelId.startsWith('dm_')) {
      const parts = activeChannelId.replace('dm_', '').split('_');
      if (parts.includes(currentUserId)) {
        const otherId = parts.find(id => id !== currentUserId);
        const otherProfile = profiles.find(p => p.id === otherId);
        if (!dms.has(activeChannelId)) {
          dms.set(activeChannelId, {
            id: activeChannelId,
            name: otherProfile?.fullName || 'Direct Message',
            description: `Secure session with ${otherProfile?.fullName || 'Personnel'}`,
            isPrivate: true,
            isDirect: true,
            participants: [currentUserId, otherId || 'unknown']
          });
        }
      }
    }

    return Array.from(dms.values());
  }, [appMessages, currentUserId, profiles, activeChannelId]);

  const visibleStaticChannels = INITIAL_CHANNELS.filter(chan => {
    if (!chan.isPrivate) return true;
    if (chan.allowedRoles && chan.allowedRoles.includes(currentSystemRole)) return true;
    if (chan.franchiseScope && currentSystemRole === SystemRole.LEAGUE_ADMIN) return true;
    return false;
  });

  const activeChannel = [...visibleStaticChannels, ...dmChannelsFromMessages].find(c => c.id === activeChannelId) || visibleStaticChannels[0];
  const allMessages = [...INITIAL_MESSAGES, ...appMessages].filter(m => m.channelId === activeChannelId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarVisible(false);
    }
  }, [activeChannelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    let recipientId: string | undefined = undefined;
    if (activeChannel?.isDirect) {
      recipientId = activeChannel.participants?.find(p => p !== currentUserId);
    }

    sendMessage(inputText, activeChannelId, recipientId);
    setInputText('');
  };

  const getSenderDisplay = (msg: ChatMessage) => {
    if (msg.senderId === currentUserId) return 'You';
    return msg.senderName;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-[75vh] md:h-[78vh] animate-in fade-in duration-500 overflow-hidden">
      {/* Sidebar: Channels & Inboxes */}
      <div className={`w-full lg:w-80 bg-league-panel border border-league-border rounded-3xl lg:rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden transition-all ${!isSidebarVisible && 'hidden lg:flex'}`}>
        <div className="p-6 md:p-8 border-b border-league-border bg-league-tableHeader">
          <h3 className="text-xs font-black italic uppercase tracking-[0.4em] text-white leading-none">IAL NETWORK</h3>
          <p className="text-[8px] font-black text-league-accent uppercase mt-2 tracking-[0.2em] italic">Personnel Uplink Established</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          <div>
            <div className="text-[8px] font-black uppercase text-league-muted tracking-[0.4em] px-2 mb-3 border-b border-league-border pb-2 opacity-50 italic">Nodes</div>
            <div className="space-y-1 md:space-y-2">
                {visibleStaticChannels.map(chan => (
                <button
                    key={chan.id}
                    onClick={() => setActiveChannelId(chan.id)}
                    className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all group border ${
                    activeChannelId === chan.id 
                        ? 'bg-league-accent/10 border-league-accent/50 text-white shadow-lg' 
                        : 'bg-league-bg/30 border-transparent text-league-muted hover:bg-league-bg hover:text-white hover:border-league-border'
                    }`}
                >
                    <span className={`text-lg md:text-xl font-black italic ${activeChannelId === chan.id ? 'text-league-accent' : 'text-league-muted opacity-30'}`}>#</span>
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest truncate">{chan.name}</span>
                </button>
                ))}
            </div>
          </div>

          <div>
            <div className="text-[8px] font-black uppercase text-league-muted tracking-[0.4em] px-2 mb-3 border-b border-league-border pb-2 opacity-50 italic">Inbox</div>
            <div className="space-y-1 md:space-y-2">
                {dmChannelsFromMessages.map(dm => (
                    <button
                        key={dm.id}
                        onClick={() => setActiveChannelId(dm.id)}
                        className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all group border ${
                        activeChannelId === dm.id 
                            ? 'bg-league-accent/10 border-league-accent/50 text-white shadow-lg' 
                            : 'bg-league-bg/30 border-transparent text-league-muted hover:bg-league-bg hover:text-white hover:border-league-border'
                        }`}
                    >
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-league-pill flex-shrink-0 border border-white/5 flex items-center justify-center font-black italic text-[10px] text-white">
                           {dm.name.charAt(0)}
                        </div>
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest truncate">{dm.name}</span>
                    </button>
                ))}
                {dmChannelsFromMessages.length === 0 && (
                    <p className="text-[8px] text-league-muted/20 px-4 italic uppercase font-black py-6 border-2 border-dashed border-league-border rounded-2xl text-center tracking-widest">No Active Sessions</p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Main: Chat View */}
      <div className={`flex-1 bg-league-panel border border-league-border rounded-3xl lg:rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden transition-all ${isSidebarVisible && 'hidden lg:flex'}`}>
        {/* Chat Header */}
        <div className="p-4 md:p-8 border-b border-league-border bg-league-tableHeader flex justify-between items-center relative z-10 shadow-lg">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarVisible(true)} className="lg:hidden text-league-accent hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7"></path></svg>
             </button>
             <div>
               <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                   {activeChannel?.isDirect ? `@${activeChannel.name}` : `#${activeChannel?.name}`}
               </h3>
               <p className="hidden md:block text-[10px] font-black text-league-accent uppercase mt-2 tracking-[0.3em] italic opacity-80">{activeChannel?.description}</p>
             </div>
           </div>
           <div className="flex items-center gap-4 md:gap-6">
              <button className="text-league-muted hover:text-white transition-all hover:scale-110">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
           </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 custom-scrollbar relative">
           {allMessages.map((msg) => {
             const isMe = msg.senderId === currentUserId;
             return (
               <div key={msg.id} className={`flex gap-3 md:gap-6 group animate-in slide-in-from-bottom-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center font-black italic text-white text-base md:text-lg border shadow-lg ${
                   isMe ? 'bg-league-accent border-league-accent shadow-league-accent/20' : 
                   'bg-league-pill border-league-border'
                 }`}>
                    {msg.senderName.charAt(0)}
                 </div>
                 <div className={`max-w-[85%] md:max-w-[75%] space-y-1 md:space-y-2 ${isMe ? 'text-right' : ''}`}>
                   <div className={`flex items-center gap-2 md:gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] md:text-[12px] font-black uppercase text-white tracking-widest">{getSenderDisplay(msg)}</span>
                      <span className="text-[7px] md:text-[8px] font-black text-league-muted uppercase tracking-widest opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl text-[11px] md:text-[12px] font-bold leading-relaxed border shadow-xl relative ${
                     isMe ? 'bg-league-accent text-white border-league-accent/50' : 'bg-league-bg/80 backdrop-blur-sm text-white/80 border-league-border'
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
        <div className="p-4 md:p-10 bg-league-tableHeader border-t border-league-border">
          <form onSubmit={handleSend} className="relative group max-w-5xl mx-auto flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Encrypt packet..."
              className="flex-1 bg-league-bg border border-league-border p-4 pr-12 rounded-2xl md:rounded-3xl text-xs md:text-[13px] font-bold text-white outline-none focus:border-league-accent transition-all shadow-inner"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="bg-league-accent text-white p-4 rounded-xl md:rounded-2xl shadow-[0_10px_20px_rgba(228,29,36,0.3)] flex-shrink-0 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
          <div className="hidden md:flex justify-between mt-6 px-2">
            <div className="flex gap-6">
              <button className="text-[8px] font-black uppercase tracking-[0.2em] text-league-muted flex items-center gap-2">
                <span className="text-league-ok animate-pulse">●</span> COMMS_STABLE
              </button>
            </div>
            <p className="text-[8px] font-black uppercase text-league-muted/30 tracking-[0.4em] italic leading-none">Induction Node Protocol v2.5.0-OS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
