
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, Profile, Role } from '../types';

export const ElfRegistry: React.FC = () => {
  const { profiles } = useApp();
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | 'ALL'>(Franchise.STUTTGART);
  const [search, setSearch] = useState('');

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesFranchise = selectedFranchise === 'ALL' || p.assignedFranchise === selectedFranchise;
      const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) || 
                           p.positions.some(pos => pos.toLowerCase().includes(search.toLowerCase()));
      return matchesFranchise && matchesSearch && p.role === Role.PLAYER;
    });
  }, [profiles, selectedFranchise, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">ELF Pro Registry</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Verified European League Personnel • 2024 Active Roster</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search by name or position..." 
            className="bg-league-panel border border-league-border p-3 rounded-xl text-[10px] font-bold text-white outline-none focus:border-league-accent transition-all md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-inner overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedFranchise('ALL')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedFranchise === 'ALL' ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}
            >
              All Teams
            </button>
            {Object.values(Franchise).map(f => (
              <button 
                key={f} 
                onClick={() => setSelectedFranchise(f)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedFranchise === f ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {filteredProfiles.map((p) => (
          <div key={p.id} className="bg-league-panel border border-league-border rounded-[2rem] p-6 hover:border-league-accent transition-all group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-4xl font-black italic uppercase text-white tracking-tighter">#{p.id.split('-').pop()}</span>
            </div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex-shrink-0 flex items-center justify-center font-black italic text-xl text-white shadow-inner overflow-hidden">
                 {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black italic uppercase text-white leading-none mb-1 group-hover:text-league-accent transition-colors">{p.fullName}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-league-accent uppercase italic">{p.positions.join('/')}</span>
                   <span className="text-white/20">•</span>
                   <span className="text-[9px] font-bold text-league-muted uppercase tracking-widest">{p.nationality}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 border-t border-b border-league-border/50 py-4 relative z-10">
               <StatItem label="Height" val={p.height_cm ? `${p.height_cm}cm` : '--'} />
               <StatItem label="Weight" val={p.weight_kg ? `${p.weight_kg}kg` : '--'} />
               <StatItem label="Team" val={p.assignedFranchise || 'FREE'} />
            </div>

            <div className="flex-1 relative z-10">
               <p className="text-[11px] text-league-muted font-bold italic line-clamp-2 leading-relaxed opacity-70">
                 {p.personalBio || `Verified ${p.positions[0]} for the ${p.assignedFranchise} project.`}
               </p>
            </div>
            
            <div className="mt-6 pt-4 flex justify-between items-center relative z-10">
               <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1 h-3 rounded-full ${i < (p.scoutGrade ? Math.floor(p.scoutGrade / 2) : 3) ? 'bg-league-accent' : 'bg-league-pill'}`} />
                  ))}
               </div>
               <span className="text-[8px] font-black uppercase text-league-muted tracking-widest italic opacity-40">Personnel_Record_{p.id}</span>
            </div>
          </div>
        ))}
        {filteredProfiles.length === 0 && (
          <div className="col-span-full py-20 text-center bg-league-panel/50 border-2 border-dashed border-league-border rounded-[3rem]">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-league-muted italic opacity-30">No matching personnel nodes found in the current registry query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, val }: { label: string, val: string }) => (
  <div className="text-center">
    <div className="text-[7px] font-black uppercase text-league-muted tracking-widest mb-1">{label}</div>
    <div className="text-[11px] font-black italic text-white uppercase">{val}</div>
  </div>
);
