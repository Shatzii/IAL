
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { Franchise, FRANCHISE_COLORS, FRANCHISE_TEAMS, RecruitingStatus, TalentTier, Role, Profile } from '../types';

interface Slot {
  id: string;
  name: string;
  pos: string;
  group: 'Offense' | 'Defense';
  x: number;
  y: number;
}

const FIELD_SLOTS: Slot[] = [
  // Offense (8 Players)
  { id: 'off_qb', name: 'Quarterback', pos: 'QB', group: 'Offense', x: 50, y: 85 },
  { id: 'off_fb', name: 'Fullback', pos: 'FB', group: 'Offense', x: 50, y: 72 },
  { id: 'off_wr_x', name: 'Receiver (X)', pos: 'WR', group: 'Offense', x: 15, y: 60 },
  { id: 'off_wr_y', name: 'Receiver (Y)', pos: 'WR', group: 'Offense', x: 85, y: 60 },
  { id: 'off_wr_z', name: 'Motion (Z)', pos: 'WR', group: 'Offense', x: 35, y: 50 },
  { id: 'off_c', name: 'Center', pos: 'OL', group: 'Offense', x: 50, y: 60 },
  { id: 'off_lg', name: 'Left Guard', pos: 'OL', group: 'Offense', x: 38, y: 60 },
  { id: 'off_rg', name: 'Right Guard', pos: 'OL', group: 'Offense', x: 62, y: 60 },

  // Defense (8 Players)
  { id: 'def_de_l', name: 'Left End', pos: 'DL', group: 'Defense', x: 38, y: 40 },
  { id: 'def_nt', name: 'Nose Tackle', pos: 'DL', group: 'Defense', x: 50, y: 40 },
  { id: 'def_de_r', name: 'Right End', pos: 'DL', group: 'Defense', x: 62, y: 40 },
  { id: 'def_mac', name: 'Mac LB', pos: 'LB', group: 'Defense', x: 40, y: 30 },
  { id: 'def_jack', name: 'Jack LB', pos: 'LB', group: 'Defense', x: 60, y: 30 },
  { id: 'def_db_l', name: 'Left DB', pos: 'DB', group: 'Defense', x: 20, y: 15 },
  { id: 'def_db_r', name: 'Right DB', pos: 'DB', group: 'Defense', x: 80, y: 15 },
  { id: 'def_ds', name: 'Safety (Drone)', pos: 'DB', group: 'Defense', x: 50, y: 5 },
];

export const CoachDashboard: React.FC = () => {
  const { profiles, teams, depthCharts, setDepthChartAssignment, selectedFranchise, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'Depth Chart' | 'Roster' | 'Ironman'>('Depth Chart');
  const [depthMode, setDepthMode] = useState<'Offense' | 'Defense'>('Offense');
  const [selectedTeam, setSelectedTeam] = useState<string>(FRANCHISE_TEAMS[selectedFranchise][0]);
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);

  const currentTeam = useMemo(() => teams.find(t => t.name === selectedTeam) || teams.find(t => t.franchise === selectedFranchise) || teams[0], [teams, selectedTeam, selectedFranchise]);
  const teamChart = useMemo(() => depthCharts[currentTeam.id] || {}, [depthCharts, currentTeam]);

  // Sidebar Unit Pool: Show players already in the team + free agents to drag in
  const unitPool = useMemo(() => {
    return profiles.filter(p => 
        p.role === Role.PLAYER && 
        (p.assignedFranchise === selectedFranchise || !p.assignedFranchise)
    ).sort((a, b) => (b.scoutGrade || 0) - (a.scoutGrade || 0));
  }, [profiles, selectedFranchise]);

  const teamRoster = useMemo(() => {
    return profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER);
  }, [profiles, selectedFranchise]);

  const ironmanPairs = useMemo(() => {
    const pairs: Record<string, { off: string[], def: string[] }> = {};
    Object.entries(teamChart).forEach(([slotId, profId]) => {
      const pId = profId as string;
      if (!pairs[pId]) pairs[pId] = { off: [], def: [] };
      const slot = FIELD_SLOTS.find(s => s.id === slotId);
      if (slot?.group === 'Offense') pairs[pId].off.push(slot.name);
      if (slot?.group === 'Defense') pairs[pId].def.push(slot.name);
    });
    return Object.entries(pairs).filter(([_, data]) => data.off.length > 0 && data.def.length > 0);
  }, [teamChart]);

  const handleDragStart = (e: React.DragEvent, profileId: string) => {
    e.dataTransfer.setData('profileId', profileId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDraggedOverSlot(null);
    const profileId = e.dataTransfer.getData('profileId');
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setDepthChartAssignment(currentTeam.id, slotId, profile.id);
      addToast(`${profile.fullName} Synchronized to ${slotId.replace('off_','').replace('def_','').toUpperCase()}`, 'success');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 pb-8" style={{ borderColor: FRANCHISE_COLORS[selectedFranchise] }}>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black italic text-3xl text-white shadow-2xl" style={{ backgroundColor: FRANCHISE_COLORS[selectedFranchise] }}>
            {selectedFranchise.charAt(0)}
          </div>
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{selectedFranchise} Command</h2>
            <div className="flex items-center gap-4 mt-3">
               <select 
                 className="bg-league-panel border border-league-border px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent appearance-none pr-10 cursor-pointer shadow-xl"
                 value={selectedTeam}
                 onChange={(e) => setSelectedTeam(e.target.value)}
               >
                 {FRANCHISE_TEAMS[selectedFranchise].map(t => <option key={t} value={t}>{t} Unit</option>)}
               </select>
               <div className="h-4 w-[1px] bg-white/10" />
               <p className="text-league-muted uppercase tracking-[0.2em] text-[9px] font-black italic opacity-60">Tactical Synchronization: Active</p>
            </div>
          </div>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl">
          {(['Depth Chart', 'Roster', 'Ironman'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Depth Chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-6 duration-700">
           {/* Field Map */}
           <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex gap-2 bg-league-bg p-1 rounded-xl border border-league-border shadow-inner">
                    {(['Offense', 'Defense'] as const).map(mode => (
                      <button key={mode} onClick={() => setDepthMode(mode)} className={`px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${depthMode === mode ? 'bg-league-accent text-white shadow-lg' : 'text-league-muted hover:text-white'}`}>{mode}</button>
                    ))}
                 </div>
                 <div className="text-[10px] font-black uppercase text-league-muted italic tracking-[0.3em] opacity-40">Drag Nodes to Tactical Slots</div>
              </div>

              <div className="relative aspect-[4/3] bg-league-bg rounded-[2rem] border-2 border-league-border p-8 shadow-inner overflow-hidden">
                 <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 border-b border-white/5 last:border-0 flex items-center px-4">
                        <span className="text-[10px] font-black text-white/5 italic">{(5-i)*10}Y</span>
                      </div>
                    ))}
                 </div>
                 <div className="absolute inset-0 z-20">
                    {FIELD_SLOTS.filter(s => s.group === depthMode).map(slot => {
                      const assignedProfId = teamChart[slot.id];
                      const assignedProf = profiles.find(p => p.id === assignedProfId);
                      const isDraggedOver = draggedOverSlot === slot.id;

                      return (
                        <div key={slot.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
                           <div className="text-[7px] font-black text-league-muted uppercase tracking-widest mb-1 italic opacity-40">{slot.name}</div>
                           <div 
                             onDragOver={(e) => { e.preventDefault(); setDraggedOverSlot(slot.id); }}
                             onDragLeave={() => setDraggedOverSlot(null)}
                             onDrop={(e) => handleDrop(e, slot.id)}
                             className={`w-24 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all p-2 relative group cursor-crosshair ${
                               assignedProf 
                                 ? 'bg-league-accent/10 border-league-accent shadow-[0_0_20px_rgba(228,29,36,0.15)]' 
                                 : isDraggedOver
                                   ? 'bg-league-blue/20 border-league-blue scale-110'
                                   : 'border-league-border bg-black/40 hover:border-league-muted'
                             }`}
                           >
                             {assignedProf ? (
                               <div className="text-center">
                                 <button 
                                   onClick={() => setDepthChartAssignment(currentTeam.id, slot.id, null)} 
                                   className="absolute -top-1 -right-1 bg-league-accent text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-lg"
                                 >
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"></path></svg>
                                 </button>
                                 <div className="text-[10px] font-black italic uppercase text-white truncate w-20 leading-none">{assignedProf.fullName.split(' ').pop()}</div>
                                 <div className="text-[7px] font-bold text-league-accent uppercase mt-1"># {assignedProf.id.split('-').pop()}</div>
                               </div>
                             ) : (
                               <span className="text-[9px] font-black uppercase text-league-muted tracking-widest opacity-20 italic">{slot.pos}</span>
                             )}
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>
           
           {/* Sidebar: Unit Pool */}
           <div className="lg:col-span-4 bg-league-panel border border-league-border rounded-[3rem] p-6 flex flex-col shadow-2xl h-[650px]">
              <div className="flex justify-between items-center mb-6 border-b border-league-border pb-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Strategic Unit Pool</h4>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-league-ok rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-league-ok rounded-full opacity-30" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 {unitPool.map(p => (
                   <div 
                     key={p.id} 
                     draggable 
                     onDragStart={(e) => handleDragStart(e, p.id)}
                     className={`p-4 rounded-2xl flex items-center justify-between group transition-all cursor-grab active:cursor-grabbing border shadow-inner ${p.assignedFranchise === selectedFranchise ? 'bg-league-bg border-league-accent/30' : 'bg-black/40 border-white/5 hover:border-league-blue/50'}`}
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-league-panel flex-shrink-0 flex items-center justify-center font-black italic text-white text-[11px] border border-white/5">
                            {p.fullName.charAt(0)}
                         </div>
                         <div className="min-w-0">
                            <div className="text-[11px] font-black italic uppercase text-white truncate w-32">{p.fullName}</div>
                            <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{p.positions[0]} • GRADE: {p.scoutGrade || '--'}</div>
                         </div>
                      </div>
                      <div className="text-league-muted opacity-20 group-hover:text-white group-hover:opacity-100 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8h16M4 16h16" strokeWidth="2.5" strokeLinecap="round"></path></svg>
                      </div>
                   </div>
                 ))}
                 {unitPool.length === 0 && <div className="py-20 text-center opacity-10 font-black uppercase italic tracking-widest">Registry Node Empty</div>}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                 <p className="text-[7px] font-black uppercase text-league-muted text-center tracking-[0.4em]">Hold to Drag • Drag to Slot</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Roster' && (
        <div className="bg-league-panel border border-league-border rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-league-tableHeader border-b border-league-border">
              <tr className="text-[9px] font-black uppercase text-league-muted tracking-[0.4em]"><th className="px-10 py-6">Athlete Node</th><th className="px-10 py-6">Status</th><th className="px-10 py-6 text-right">Metrics</th></tr>
            </thead>
            <tbody className="divide-y divide-league-border">
              {teamRoster.map(p => (
                <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-white shadow-inner overflow-hidden">{p.fullName.charAt(0)}</div>
                       <div>
                          <div className="text-[13px] font-black italic uppercase text-white tracking-tighter">{p.fullName}</div>
                          <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{p.positions.join('/')}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-black text-white/50 uppercase tracking-widest italic">{p.status}</td>
                  <td className="px-10 py-6 text-right font-mono text-xs font-black italic text-league-accent">{p.scoutGrade || '--'} Grade</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Ironman' && (
        <div className="bg-league-panel border border-league-border p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95">
           <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 font-black text-4xl italic">IRONMAN_PROTOCOL</div>
           <h3 className="text-3xl font-black italic uppercase text-white mb-4 tracking-tighter leading-none">Dual-Vector Analysis</h3>
           <p className="text-[10px] font-bold text-league-muted uppercase tracking-[0.3em] mb-12 max-w-lg italic opacity-70">Detecting multi-phase personnel operational on both tactical vectors (Offense & Defense).</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ironmanPairs.map(([pid, data]) => {
                const p = profiles.find(x => x.id === pid);
                return (
                  <div key={pid} className="bg-league-bg border border-league-accent/30 p-6 rounded-[2rem] flex flex-col shadow-2xl group hover:border-league-accent transition-all relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg></div>
                     <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-league-panel flex items-center justify-center border border-league-accent/50 text-white font-black italic text-xl shadow-lg">{p?.fullName.charAt(0)}</div>
                        <div>
                           <h4 className="text-lg font-black italic uppercase text-white leading-none tracking-tighter">{p?.fullName}</h4>
                           <span className="text-[7px] font-black uppercase text-league-accent tracking-widest mt-1 block">DUAL_VECTOR_LOCKED</span>
                        </div>
                     </div>
                     <div className="space-y-4 relative z-10 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center"><span className="text-[8px] font-black text-league-muted uppercase">Offense</span><span className="text-[10px] font-black italic text-white uppercase">{data.off.join(', ')}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[8px] font-black text-league-muted uppercase">Defense</span><span className="text-[10px] font-black italic text-league-blue uppercase">{data.def.join(', ')}</span></div>
                     </div>
                  </div>
                );
              })}
              {ironmanPairs.length === 0 && (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-league-border rounded-[2rem] opacity-20 italic font-black uppercase text-sm tracking-[0.4em]">No Multi-Vector Personnel Detected</div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
