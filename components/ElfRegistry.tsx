import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, Profile, Role, RecruitingStatus } from '../types';

export const ElfRegistry: React.FC = () => {
  const { profiles, updateProfile, addToast, logActivity } = useApp();
  
  // Multi-Vector Search State
  const [cityFilter, setCityFilter] = useState<Franchise | 'ALL'>('ALL');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Extract unique tactical metadata from registry
  const uniquePositions = useMemo(() => {
    const posSet = new Set<string>();
    profiles.forEach(p => p.positions.forEach(pos => posSet.add(pos)));
    return Array.from(posSet).sort();
  }, [profiles]);

  const uniqueCountries = useMemo(() => {
    const countrySet = new Set<string>();
    profiles.forEach(p => countrySet.add(p.nationality));
    return Array.from(countrySet).sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (p.role !== Role.PLAYER) return false;
      
      const matchesCity = cityFilter === 'ALL' || p.assignedFranchise === cityFilter;
      const matchesPos = posFilter === 'ALL' || p.positions.includes(posFilter);
      const matchesCountry = countryFilter === 'ALL' || p.nationality === countryFilter;
      const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) || 
                           p.id.toLowerCase().includes(search.toLowerCase());
      
      return matchesCity && matchesPos && matchesCountry && matchesSearch;
    });
  }, [profiles, cityFilter, posFilter, countryFilter, search]);

  const handleReset = () => {
    setCityFilter('ALL');
    setPosFilter('ALL');
    setCountryFilter('ALL');
    setSearch('');
  };

  const handleActivateRecruitment = (id: string, name: string) => {
    updateProfile(id, { 
      status: RecruitingStatus.NEW_LEAD,
      assignedFranchise: undefined, // Remove from old team to enter 2026 Pool
      assignedTeam: undefined 
    });
    addToast(`${name} initialized for 2026 Draft Pool`, 'success');
    logActivity('RECRUITMENT', `Personnel node ${name} injected into 2026 Draft Cycle.`, id);
  };

  const handleEstablishContact = (id: string, name: string) => {
    updateProfile(id, { status: RecruitingStatus.PRE_SCREENED });
    addToast(`Contact Established with ${name}`, 'info');
    logActivity('CONTACT', `Secure handshake completed with ${name}. Node active.`, id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">ELF Pro Registry</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Verified European League Personnel • 2024 Active Multi-Node Query</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <div className="text-[10px] font-black text-league-accent uppercase tracking-widest leading-none mb-1">{filteredProfiles.length} Matches</div>
              <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest opacity-40">Registry Status: Synchronized</div>
           </div>
           <button 
             onClick={handleReset}
             className="bg-league-panel border border-league-border text-league-muted hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
           >
             Clear Signal
           </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-league-panel/30 p-6 rounded-[2rem] border border-league-border shadow-2xl backdrop-blur-md">
        <div className="space-y-2">
           <label className="text-[8px] font-black uppercase text-league-muted tracking-[0.2em] ml-2">Personnel Search</label>
           <div className="relative group">
              <input 
                type="text" 
                placeholder="Name or Node ID..." 
                className="w-full bg-league-bg border border-league-border p-3 rounded-xl text-[10px] font-bold text-white outline-none focus:border-league-accent transition-all pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-league-muted group-focus-within:text-league-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[8px] font-black uppercase text-league-muted tracking-[0.2em] ml-2">Tactical Node (City)</label>
           <select 
             className="w-full bg-league-bg border border-league-border p-3 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent transition-all appearance-none"
             value={cityFilter}
             onChange={(e) => setCityFilter(e.target.value as any)}
           >
              <option value="ALL">All Operational Cities</option>
              {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
           </select>
        </div>

        <div className="space-y-2">
           <label className="text-[8px] font-black uppercase text-league-muted tracking-[0.2em] ml-2">Position Class</label>
           <select 
             className="w-full bg-league-bg border border-league-border p-3 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent transition-all appearance-none"
             value={posFilter}
             onChange={(e) => setPosFilter(e.target.value)}
           >
              <option value="ALL">All Tactical Slots</option>
              {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
           </select>
        </div>

        <div className="space-y-2">
           <label className="text-[8px] font-black uppercase text-league-muted tracking-[0.2em] ml-2">Nationality Hub</label>
           <select 
             className="w-full bg-league-bg border border-league-border p-3 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent transition-all appearance-none"
             value={countryFilter}
             onChange={(e) => setCountryFilter(e.target.value)}
           >
              <option value="ALL">All Origin Points</option>
              {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {filteredProfiles.map((p) => {
          const isDraftable = !p.assignedFranchise;
          const isInActiveFlow = p.status !== RecruitingStatus.INACTIVE && p.status !== RecruitingStatus.PLACED;

          return (
            <div key={p.id} className="bg-league-panel border border-league-border rounded-[2rem] p-6 hover:border-league-accent transition-all group relative overflow-hidden flex flex-col h-full shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                 <span className="text-5xl font-black italic uppercase text-white tracking-tighter">#{p.id.split('-').pop()}</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-league-bg border border-league-border flex-shrink-0 flex items-center justify-center font-black italic text-xl text-white shadow-inner overflow-hidden">
                   {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="" /> : p.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black italic uppercase text-white leading-none mb-2 group-hover:text-league-accent transition-colors tracking-tighter">{p.fullName}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="text-[10px] font-black text-league-accent bg-league-accent/10 px-2 py-0.5 rounded border border-league-accent/20 uppercase italic">{p.positions.join('/')}</span>
                     <span className="text-white/20">|</span>
                     <span className="text-[9px] font-bold text-league-muted uppercase tracking-widest">{p.nationality}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 border-t border-b border-league-border/50 py-5 relative z-10 bg-black/20 rounded-xl">
                 <StatItem label="Node" val={p.assignedFranchise || 'FREE'} color={p.assignedFranchise ? 'text-white' : 'text-league-ok'} />
                 <StatItem label="Status" val={p.status} color={p.status === RecruitingStatus.PLACED ? 'text-league-muted' : 'text-league-accent'} />
                 <StatItem label="Class" val={p.tier === 'Franchise Athlete' ? 'PRO' : 'DEV'} />
              </div>

              <div className="flex-1 relative z-10 mb-6 px-2">
                 <p className="text-[11px] text-league-muted font-bold italic line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                   {p.personalBio || `Official registry data for ${p.fullName}. Operational within the ${p.assignedFranchise || 'Global Pool'} ecosystem.`}
                 </p>
              </div>

              <div className="flex gap-2 relative z-10">
                {(p.status === RecruitingStatus.INACTIVE || p.status === RecruitingStatus.PLACED) ? (
                  <button 
                    onClick={() => handleActivateRecruitment(p.id, p.fullName)}
                    className="flex-1 bg-league-accent text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 transition-all"
                  >
                    Initialize 2026 Induction
                  </button>
                ) : (
                  <>
                    {p.status === RecruitingStatus.NEW_LEAD && (
                      <button 
                        onClick={() => handleEstablishContact(p.id, p.fullName)}
                        className="flex-1 bg-league-blue text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 transition-all"
                      >
                        Contact Established
                      </button>
                    )}
                    <div className="flex-1 bg-league-bg border border-league-border text-league-ok py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center italic">
                       Pipeline: {p.status}
                    </div>
                  </>
                )}
              </div>
              
              <div className="pt-4 flex justify-between items-center relative z-10 mt-4 opacity-30">
                 <div className="flex gap-1.5 items-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.status === RecruitingStatus.PLACED ? 'bg-league-muted' : 'bg-league-ok animate-pulse'}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest italic">{p.status === RecruitingStatus.PLACED ? 'Inactive Node' : 'Signal Stable'}</span>
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest italic font-mono">{p.id}</span>
              </div>
            </div>
          );
        })}
        {filteredProfiles.length === 0 && (
          <div className="col-span-full py-32 text-center bg-league-panel/50 border-2 border-dashed border-league-border rounded-[3rem] animate-in zoom-in-95">
            <div className="w-16 h-16 bg-league-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-white italic mb-2">No Matching Personnel Nodes</p>
            <p className="text-[10px] font-bold text-league-muted uppercase tracking-widest opacity-40">Adjust your multi-vector query and retry signal sync.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, val, color = 'text-white' }: { label: string, val: string, color?: string }) => (
  <div className="text-center group-hover:scale-105 transition-transform">
    <div className="text-[7px] font-black uppercase text-league-muted tracking-widest mb-1 opacity-50">{label}</div>
    <div className={`text-[9px] font-black italic uppercase truncate px-1 ${color}`}>{val}</div>
  </div>
);