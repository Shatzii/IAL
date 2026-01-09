
import React, { useEffect, useState } from 'react';
import { useApp } from '../App';
import { RecruitingStatus, SystemRole } from '../types';

export const WarRoom: React.FC = () => {
  const { activityLogs, profiles, currentSystemRole, issueBroadcast } = useApp();
  const [pulse, setPulse] = useState(false);
  const [broadcastInput, setBroadcastInput] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const totalRegistry = profiles.length;
  const activeOffers = profiles.filter(p => p.status === RecruitingStatus.OFFER_EXTENDED).length;
  const recentInductions = activityLogs.filter(l => l.type === 'REGISTRATION').length;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    issueBroadcast(broadcastInput, 'STANDARD');
    setBroadcastInput('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b-2 border-league-accent pb-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Scouting War Room</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-2 italic flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${pulse ? 'bg-league-accent shadow-[0_0_8px_#e41d24]' : 'bg-red-900'} transition-all`} />
            LIVE OPS FEED • MULTI-NODE TELEMETRY ACTIVE
          </p>
        </div>
        <div className="flex gap-8">
          <GlobalStat label="Registry" val={totalRegistry} />
          <GlobalStat label="Live Offers" val={activeOffers} />
          <GlobalStat label="24h Induction" val={recentInductions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
        <div className="lg:col-span-8 flex flex-col gap-8">
           {currentSystemRole === SystemRole.LEAGUE_ADMIN && (
             <div className="bg-league-panel border-4 border-league-accent p-8 rounded-[3rem] shadow-[0_0_50px_rgba(228,29,36,0.1)]">
                <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-4 italic">Commission Directives Node</h4>
                <form onSubmit={handleBroadcast} className="flex gap-4">
                   <input type="text" placeholder="Broadcast league-wide operational alert..." className="flex-1 bg-league-bg border border-league-border p-4 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-league-accent shadow-inner" value={broadcastInput} onChange={(e) => setBroadcastInput(e.target.value)} />
                   <button type="submit" className="bg-league-accent text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110">Issue Directive</button>
                </form>
             </div>
           )}
           
           <div className="flex-1 bg-league-panel border border-league-border rounded-[3rem] p-10 flex flex-col shadow-2xl overflow-hidden relative">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-league-border pb-4 italic">Operational Activity Stream</h4>
              <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                 {activityLogs.map((log, idx) => (
                   <div key={log.id} className="flex gap-6 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                     <div className="flex flex-col items-center"><div className="w-1.5 h-1.5 rounded-full bg-league-accent mb-2" /><div className="w-[1px] flex-1 bg-league-border" /></div>
                     <div className="flex-1 pb-6 border-b border-league-border/30">
                       <div className="flex justify-between items-start mb-2"><span className="text-[8px] font-black uppercase text-league-accent tracking-widest italic">{log.type}</span><span className="text-[7px] font-bold text-league-muted uppercase opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                       <p className="text-xs font-bold italic text-white/90 leading-relaxed">{log.message}</p>
                       <div className="mt-3 text-[7px] font-black text-league-muted uppercase tracking-[0.2em] opacity-30">Subject_Node: {log.subjectId}</div>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8 h-full">
           <div className="bg-league-panel border border-league-border rounded-[3rem] p-8 shadow-2xl flex flex-col h-full">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-league-border pb-4 italic">Breakthrough Alerts</h4>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                 <AlertCard type="PERFORMANCE" msg="Dante Rossi (n5) vertical jump validated at 105cm. Top 1%." />
                 <AlertCard type="RECRUITMENT" msg="Nottingham node reaching 95% capacity for WR induction pool." />
                 <AlertCard type="GEOGRAPHY" msg="High density of elite DL leads identified in Stuttgart node." />
                 <AlertCard type="CONTRACT" msg="Hans Muller (n10) officially placed at Stuttgart. Roster lock." />
                 <AlertCard type="AI_INTEL" msg="Gemini identifies high social sentiment surge for Dante Rossi in Italian media." />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const GlobalStat = ({ label, val }: any) => (
  <div className="text-right"><div className="text-[8px] font-black uppercase text-league-muted tracking-[0.3em] mb-1">{label}</div><div className="text-3xl font-black italic text-white leading-none tracking-tighter">{val}</div></div>
);

const AlertCard = ({ type, msg }: any) => (
  <div className="bg-league-bg border border-league-border p-5 rounded-2xl group hover:border-league-accent transition-all relative overflow-hidden"><div className="text-[7px] font-black text-league-accent uppercase tracking-widest mb-2 italic">ALERT::{type}</div><p className="text-[10px] font-bold italic text-white leading-relaxed">{msg}</p></div>
);
