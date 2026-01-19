
import React, { useState, useMemo, useCallback } from 'react';
import { Role, SystemRole, TalentTier } from '../types';
import { useApp } from '../App';

const ProfileCard = React.memo(({ p, currentSystemRole, comparisonIds, toggleComparison, maskPII }: any) => (
  <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 group hover:border-league-accent transition-all flex flex-col shadow-2xl relative overflow-hidden">
    <div className="flex items-center gap-6 mb-6">
      <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white overflow-hidden relative">
        {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" loading="lazy" /> : p.fullName.charAt(0)}
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none">{p.fullName}</h4>
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

    <div className="space-y-4 mb-6 flex-1">
       <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black text-league-muted uppercase">Ironman Coefficient</span>
            <span className="text-[10px] font-black italic text-white">{(p.ironmanCoefficient || 0).toFixed(2)}</span>
          </div>
          <div className="h-1 w-full bg-league-bg rounded-full overflow-hidden">
             <div className="h-full bg-league-ok" style={{ width: `${(p.ironmanCoefficient || 0) * 100}%` }} />
          </div>
       </div>
    </div>

    <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
       {currentSystemRole !== SystemRole.PLAYER && (
         <button onClick={() => toggleComparison(p.id)} className={`w-full py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${comparisonIds.includes(p.id) ? 'bg-league-accent border-league-accent text-white shadow-xl' : 'bg-league-bg border-league-border text-league-muted hover:text-white'}`}>
           {comparisonIds.includes(p.id) ? 'Locked in Lab' : 'Add to Comparison Lab'}
         </button>
       )}
    </div>
  </div>
));

export const Profiles: React.FC = () => {
  const { profiles, currentSystemRole, toggleComparison, comparisonIds, maskPII } = useApp();
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(12);

  const filteredProfiles = useMemo(() => profiles.filter(p => 
    p.role === activeTab && 
    (p.fullName.toLowerCase().includes(search.toLowerCase()) || p.positions.some(pos => pos.toLowerCase().includes(search.toLowerCase())))
  ), [profiles, activeTab, search]);

  const visibleProfiles = useMemo(() => filteredProfiles.slice(0, displayCount), [filteredProfiles, displayCount]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Talent Registry • {filteredProfiles.length} Matching</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-league-panel border border-league-border px-6 py-2 rounded-xl text-[10px] font-bold text-white outline-none focus:border-league-accent w-64"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setDisplayCount(12); }}
          />
          <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border">
            {[Role.PLAYER, Role.COACH].map(role => (
              <button key={role} onClick={() => { setActiveTab(role); setDisplayCount(12); }} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === role ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{role}S</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleProfiles.map((p) => (
          <ProfileCard 
            key={p.id} 
            p={p} 
            currentSystemRole={currentSystemRole} 
            comparisonIds={comparisonIds} 
            toggleComparison={toggleComparison} 
            maskPII={maskPII} 
          />
        ))}
      </div>

      {displayCount < filteredProfiles.length && (
        <div className="flex justify-center pt-12">
          <button 
            onClick={() => setDisplayCount(prev => prev + 12)}
            className="bg-white/5 border border-white/10 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-league-accent transition-all"
          >
            Load More Personnel
          </button>
        </div>
      )}
    </div>
  );
};
