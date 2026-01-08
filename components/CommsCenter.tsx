
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
  { id: 'm2', channelId: 'chan_global', senderId: 'scout_1', senderName: 'Chief Scout', senderRole: SystemRole.LEAGUE_ADMIN, text: 'Checking in from the Stuttgart Combine. Talent density is high this year.', timestamp: new Date(Date.now() - 50000).toISOString() }
];

export const CommsCenter: React.FC = () => {
  const { currentSystemRole, currentUserProfileId, profiles, sendMessage, messages: appMessages, activeChannelId, setActiveChannelId } = useApp();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUserProfileId || 'admin';

  // Extract all DM channels from existing messages to populate "Inbox"
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

    // Also include any active channel that isn't in history yet (started from Profiles view)
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

  // Filter visible public/private channels based on RBAC
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
    <div className="flex flex-col lg:flex-row gap-8 h-[78vh] animate-in fade-in duration-500">
      {/* Sidebar: Channels & Inboxes */}
      <div className="w-full lg:w-80 bg-league-panel border border-league-border rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden">
        <div className="p-8 border-b border-league-border bg-league-tableHeader">
          <h3 className="text-sm font-black italic uppercase tracking-[0.4em] text-white leading-none">IAL NETWORK</h3>
          <p className="text-[8px] font-black text-league-accent uppercase mt-2 tracking-[0.2em] italic">Secure Personnel Uplink Established</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Public/Ops Channels */}
          <div>
            <div className="text-[9px] font-black uppercase text-league-muted tracking-[0.4em] px-2 mb-4 border-b border-league-border pb-2 opacity-50 italic">Operational Nodes</div>
            <div className="space-y-2">
                {visibleStaticChannels.map(chan => (
                <button
                    key={chan.id}
                    onClick={() => setActiveChannelId(chan.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group border ${
                    activeChannelId === chan.id 
                        ? 'bg-league-accent/10 border-league-accent/50 text-white shadow-lg' 
                        : 'bg-league-bg/30 border-transparent text-league-muted hover:bg-league-bg hover:text-white hover:border-league-border'
                    }`}
                >
                    <span className={`text-xl font-black italic ${activeChannelId === chan.id ? 'text-league-accent' : 'text-league-muted opacity-30'}`}>#</span>
                    <span className="text-[11px] font-black uppercase tracking-widest truncate">{chan.name}</span>
                    {chan.isPrivate && (
                    <svg className="w-3.5 h-3.5 ml-auto opacity-30 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                    )}
                </button>
                ))}
            </div>
          </div>

          {/* Direct Messages / Inboxes */}
          <div>
            <div className="text-[9px] font-black uppercase text-league-muted tracking-[0.4em] px-2 mb-4 border-b border-league-border pb-2 opacity-50 italic">Induction Private Links</div>
            <div className="space-y-2">
                {dmChannelsFromMessages.map(dm => (
                    <button
                        key={dm.id}
                        onClick={() => setActiveChannelId(dm.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group border ${
                        activeChannelId === dm.id 
                            ? 'bg-league-accent/10 border-league-accent/50 text-white shadow-lg' 
                            : 'bg-league-bg/30 border-transparent text-league-muted hover:bg-league-bg hover:text-white hover:border-league-border'
                        }`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-league-pill flex-shrink-0 border border-white/5 flex items-center justify-center font-black italic text-xs text-white">
                           {dm.name.charAt(0)}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest truncate">{dm.name}</span>
                        <div className="ml-auto flex gap-1">
                           <div className="w-1 h-1 rounded-full bg-league-ok shadow-[0_0_5px_#23d18b] animate-pulse" />
                        </div>
                    </button>
                ))}
                {dmChannelsFromMessages.length === 0 && (
                    <p className="text-[9px] text-league-muted/20 px-4 italic uppercase font-black py-8 border-2 border-dashed border-league-border rounded-[2rem] text-center tracking-widest">No Active Private Sessions</p>
                )}
            </div>
          </div>
        </div>

        {/* User Context Footer */}
        <div className="p-8 bg-league-tableHeader border-t border-league-border relative">
           <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-league-accent/30 to-transparent" />
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-league-accent/20 border-2 border-league-accent flex items-center justify-center font-black italic text-white text-[14px] shadow-lg">
                {profiles.find(p => p.id === currentUserProfileId)?.fullName.charAt(0) || currentSystemRole.charAt(0)}
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-[11px] font-black uppercase text-white tracking-[0.2em] truncate">
                 {profiles.find(p => p.id === currentUserProfileId)?.fullName || currentSystemRole}
               </span>
               <span className="text-[8px] text-league-ok uppercase font-black tracking-[0.3em] flex items-center gap-2 mt-0.5">
                 <span className="w-1.5 h-1.5 bg-league-ok rounded-full animate-ping" /> Node Online
               </span>
             </div>
           </div>
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 bg-league-panel border border-league-border rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Chat Header */}
        <div className="p-8 border-b border-league-border bg-league-tableHeader flex justify-between items-center relative z-10 shadow-lg">
           <div>
             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                 {activeChannel?.isDirect ? `SIGNAL @${activeChannel.name}` : `CHANNEL #${activeChannel?.name}`}
             </h3>
             <p className="text-[10px] font-black text-league-accent uppercase mt-2 tracking-[0.3em] italic opacity-80">{activeChannel?.description}</p>
           </div>
           <div className="flex items-center gap-6">
              <button className="text-league-muted hover:text-white transition-all hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
              <div className="h-8 w-0.5 bg-league-border" />
              <button className="text-league-muted hover:text-league-accent transition-all hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
              </button>
           </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           {allMessages.map((msg) => {
             const isMe = msg.senderId === currentUserId;
             return (
               <div key={msg.id} className={`flex gap-6 group animate-in slide-in-from-bottom-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black italic text-white text-lg border-2 shadow-2xl transition-all group-hover:scale-110 ${
                   isMe ? 'bg-league-accent border-league-accent shadow-league-accent/20' : 
                   msg.senderRole === SystemRole.FRANCHISE_GM ? 'bg-league-blue border-league-blue shadow-league-blue/20' :
                   'bg-league-pill border-league-border'
                 }`}>
                    {msg.senderName.charAt(0)}
                 </div>
                 <div className={`max-w-[75%] space-y-2 ${isMe ? 'text-right' : ''}`}>
                   <div className={`flex items-center gap-3 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[12px] font-black uppercase text-white tracking-widest leading-none">{getSenderDisplay(msg)}</span>
                      <span className="text-[9px] font-black text-league-muted uppercase tracking-widest leading-none opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                   </div>
                   <div className={`p-6 rounded-3xl text-[12px] font-bold leading-relaxed border transition-all shadow-xl relative ${
                     isMe ? 'bg-league-accent text-white border-league-accent/50 shadow-league-accent/10' : 'bg-league-bg/80 backdrop-blur-sm text-white/80 border-league-border group-hover:border-league-muted'
                   }`}>
                     {msg.text}
                     {/* Data integrity indicator */}
                     <div className={`absolute bottom-2 ${isMe ? 'left-2' : 'right-2'} opacity-20 text-[6px] font-black uppercase italic tracking-widest`}>
                        {isMe ? 'TX_SECURE' : 'RX_ENCRYPTED'}
                     </div>
                   </div>
                 </div>
               </div>
             );
           })}
           {allMessages.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-32 grayscale animate-pulse">
                    <svg className="w-24 h-24 mb-6 text-league-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <p className="text-sm font-black uppercase tracking-[0.5em] italic">Encryption Handshake Established<br/>Transmissions Awaiting Uplink</p>
               </div>
           )}
           <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-10 bg-league-tableHeader border-t border-league-border relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-league-accent/20 to-transparent" />
          <form onSubmit={handleSend} className="relative group max-w-5xl mx-auto">
            <input 
              type="text" 
              placeholder={`Send encrypted packet to ${activeChannel?.isDirect ? activeChannel.name : '#' + activeChannel?.name}...`}
              className="w-full bg-league-bg border border-league-border p-6 pr-24 rounded-3xl text-[13px] font-bold text-white outline-none focus:border-league-accent transition-all group-hover:border-league-muted shadow-inner tracking-tight placeholder:italic placeholder:opacity-40"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-4">
               <button type="button" className="text-league-muted hover:text-white transition-all hover:scale-110">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
               </button>
               <button type="submit" className="bg-league-accent text-white p-3 rounded-2xl hover:scale-110 transition-all shadow-[0_10px_30px_rgba(228,29,36,0.5)] active:scale-95 group-hover:brightness-125">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
               </button>
            </div>
          </form>
          <div className="flex flex-col md:flex-row justify-between mt-6 px-4 gap-4">
            <div className="flex gap-8">
              <button className="text-[9px] font-black uppercase tracking-[0.3em] text-league-muted hover:text-white flex items-center gap-2 transition-colors">
                <span className="text-league-ok animate-pulse">●</span> COMMS_STABLE
              </button>
              <button className="text-[9px] font-black uppercase tracking-[0.3em] text-league-muted hover:text-white flex items-center gap-2 transition-colors">
                <span className="text-league-accent">●</span> E2EE_ACTIVE
              </button>
              <button className="text-[9px] font-black uppercase tracking-[0.3em] text-league-muted hover:text-white flex items-center gap-2 transition-colors">
                <span className="text-league-blue">●</span> OPS_LOGGED
              </button>
            </div>
            <p className="text-[9px] font-black uppercase text-league-muted/30 tracking-[0.4em] italic leading-none">Induction Node Protocol v2.5.0-OS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
