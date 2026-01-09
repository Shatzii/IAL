
import React, { useEffect, useState } from 'react';
import { useApp } from '../App';
import { RecruitingStatus } from '../types';

export const WarRoom: React.FC = () => {
  const { activityLogs, profiles } = useApp();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const totalRegistry = profiles.length;
  const activeOffers = profiles.filter(p => p.status === RecruitingStatus.OFFER_EXTENDED).length;
  const recentInductions = activityLogs.filter(l => l.type === 'REGISTRATION').length;

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
        {/* Activity Stream */}
        <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] p-10 flex flex-col shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <svg className="w-32 h-32" fill="white" viewBox="0 0 24 24"><path d="M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66 2L13 11.66 19.34 18 23 14.34 16.66 5z"/></svg>
           </div>
           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-league-border pb-4 italic">Operational Activity Stream</h4>
           <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              {activityLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-6 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-league-accent mb-2" />
                    <div className="w-[1px] flex-1 bg-league-border" />
                  </div>
                  <div className="flex-1 pb-6 border-b border-league-border/30">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black uppercase text-league-accent tracking-widest italic">{log.type}</span>
                      <span className="text-[7px] font-bold text-league-muted uppercase opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-bold italic text-white/90 leading-relaxed">{log.message}</p>
                    <div className="mt-3 text-[7px] font-black text-league-muted uppercase tracking-[0.2em] opacity-30">Subject_Node: {log.subjectId}</div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Global Gaps & Alerts */}
        <div className="lg:col-span-4 space-y-8 h-full">
           <div className="bg-league-panel border border-league-border rounded-[3rem] p-8 shadow-2xl flex flex-col h-full">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-league-border pb-4 italic">Breakthrough Alerts</h4>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                 <AlertCard type="PERFORMANCE" msg="Dante Rossi (n5) vertical jump validated at 105cm. Top 1%." />
                 <AlertCard type="RECRUITMENT" msg="Nottingham node reaching 95% capacity for WR induction pool." />
                 <AlertCard type="GEOGRAPHY" msg="High density of elite DL leads identified in Stuttgart node." />
                 <AlertCard type="CONTRACT" msg="Hans Muller (n10) officially placed at Stuttgart. Roster lock." />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const GlobalStat = ({ label, val }: any) => (
  <div className="text-right">
    <div className="text-[8px] font-black uppercase text-league-muted tracking-[0.3em] mb-1">{label}</div>
    <div className="text-3xl font-black italic text-white leading-none tracking-tighter">{val}</div>
  </div>
);

const AlertCard = ({ type, msg }: any) => (
  <div className="bg-league-bg border border-league-border p-5 rounded-2xl group hover:border-league-accent transition-all relative overflow-hidden">
    <div className="absolute top-0 right-0 p-3 opacity-10">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
    </div>
    <div className="text-[7px] font-black text-league-accent uppercase tracking-widest mb-2 italic">ALERT::{type}</div>
    <p className="text-[10px] font-bold italic text-white leading-relaxed">{msg}</p>
  </div>
);
