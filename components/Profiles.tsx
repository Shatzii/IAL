
import React, { useState } from 'react';
import { Role, Profile, TalentTier, SystemRole, RecruitingStatus } from '../types';
import { useApp } from '../App';

export const Profiles: React.FC = () => {
  const { profiles, currentSystemRole, toggleComparison, comparisonIds, enrichDossier, maskPII } = useApp();
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [search, setSearch] = useState('');

  const filteredProfiles = profiles.filter(p => 
    p.role === activeTab && 
    (p.fullName.toLowerCase().includes(search.toLowerCase()) || p.positions.some(pos => pos.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Global IAL Talent Registry • {profiles.length} Active Nodes</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search Name or Position..." 
            className="bg-league-panel border border-league-border px-6 py-2 rounded-xl text-[10px] font-bold text-white outline-none focus:border-league-accent w-64 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl">
            {[Role.PLAYER, Role.COACH].map(role => (
              <button key={role} onClick={() => setActiveTab(role)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === role ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{role}S</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProfiles.map((p) => (
          <div key={p.id} className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 group hover:border-league-accent transition-all flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-black uppercase text-league-ok">Vault Synchronized</span>
                  <div className="w-1 h-1 rounded-full bg-league-ok shadow-[0_0_5px_#23d18b]" />
               </div>
               {p.scoutGrade && p.scoutGrade > 9.0 && (
                 <div className="bg-league-accent text-white px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest italic animate-pulse">Elite Prospect</div>
               )}
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white shadow-inner overflow-hidden relative">
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.fullName.charAt(0)}
                {p.ironmanCoefficient && (
                    <div className="absolute inset-0 border-2 border-league-ok/50 animate-pulse rounded-2xl pointer-events-none" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black italic uppercase text-white tracking-tighter group-hover:text-league-accent transition-colors">{p.fullName}</h4>
                <div className="flex flex-col gap-1 mt-2">
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-league-accent uppercase tracking-widest">{p.positions.join('/')}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-[8px] font-bold text-league-muted uppercase">{p.nationality}</span>
                   </div>
                   <div className="text-[7px] font-black text-white/30 uppercase tracking-widest italic group-hover:text-white/60 transition-colors">
                      {maskPII(p.email)}
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
               <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-league-muted uppercase">Ironman Coefficient</span>
                    <span className={`text-[10px] font-black italic ${p.ironmanCoefficient && p.ironmanCoefficient > 0.8 ? 'text-league-ok' : 'text-white'}`}>
                        {p.ironmanCoefficient ? (p.ironmanCoefficient * 10).toFixed(1) : '--'} / 10
                    </span>
                  </div>
                  <div className="h-1 w-full bg-league-bg rounded-full overflow-hidden">
                     <div className="h-full bg-league-ok transition-all duration-1000" style={{ width: `${(p.ironmanCoefficient || 0) * 100}%` }} />
                  </div>
               </div>

               {p.aiIntel ? (
                 <div className="bg-league-accent/5 p-4 rounded-2xl border border-league-accent/20 animate-in fade-in">
                    <div className="text-[7px] font-black uppercase text-league-accent mb-2 tracking-widest">Neural Dossier Synthesis</div>
                    <p className="text-[10px] font-bold text-white/80 italic leading-relaxed">{p.aiIntel}</p>
                 </div>
               ) : (
                 <button onClick={() => enrichDossier(p.id)} className="w-full bg-league-bg border border-dashed border-white/20 text-[8px] font-black uppercase tracking-[0.2em] text-league-muted py-3 rounded-2xl hover:border-league-accent hover:text-white transition-all">
                    Initialize Neural Intelligence
                 </button>
               )}
            </div>

            <div className="mt-auto space-y-4">
               {currentSystemRole !== SystemRole.PLAYER && (
                 <button onClick={() => toggleComparison(p.id)} className={`w-full py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${comparisonIds.includes(p.id) ? 'bg-league-accent border-league-accent text-white shadow-xl' : 'bg-league-bg border-league-border text-league-muted hover:text-white'}`}>
                   {comparisonIds.includes(p.id) ? 'Locked in Lab' : 'Add to Comparison Lab'}
                 </button>
               )}
               <div className="flex justify-between items-center px-1">
                  <span className="text-[7px] font-black uppercase text-league-muted italic">Node ID: {p.id}</span>
                  <span className="text-[10px] font-black italic text-league-accent">{p.scoutGrade || '--'} Grade</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
