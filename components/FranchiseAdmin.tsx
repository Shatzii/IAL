
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, Profile, TalentTier, Role, RecruitingStatus, ContractStatus, FRANCHISE_COLORS, FRANCHISE_TEAMS } from '../types';

interface Slot {
  id: string;
  name: string;
  pos: string;
  group: 'Offense' | 'Defense';
  x: number;
  y: number;
}

const ARENA_SLOTS: Slot[] = [
  // Offense (8 Players)
  { id: 'off_qb', name: 'Quarterback', pos: 'QB', group: 'Offense', x: 50, y: 85 },
  { id: 'off_fb', name: 'Fullback', pos: 'FB', group: 'Offense', x: 50, y: 72 },
  { id: 'off_wr_x', name: 'WR (X)', pos: 'WR', group: 'Offense', x: 15, y: 60 },
  { id: 'off_wr_y', name: 'WR (Y)', pos: 'WR', group: 'Offense', x: 85, y: 60 },
  { id: 'off_wr_z', name: 'Motion (Z)', pos: 'WR', group: 'Offense', x: 35, y: 50 },
  { id: 'off_c', name: 'Center', pos: 'OL', group: 'Offense', x: 50, y: 60 },
  { id: 'off_lg', name: 'Guard (L)', pos: 'OL', group: 'Offense', x: 38, y: 60 },
  { id: 'off_rg', name: 'Guard (R)', pos: 'OL', group: 'Offense', x: 62, y: 60 },

  // Defense (8 Players)
  { id: 'def_de_l', name: 'End (L)', pos: 'DL', group: 'Defense', x: 38, y: 40 },
  { id: 'def_nt', name: 'Nose', pos: 'DL', group: 'Defense', x: 50, y: 40 },
  { id: 'def_de_r', name: 'End (R)', pos: 'DL', group: 'Defense', x: 62, y: 40 },
  { id: 'def_mac', name: 'Mac LB', pos: 'LB', group: 'Defense', x: 40, y: 30 },
  { id: 'def_jack', name: 'Jack LB', pos: 'LB', group: 'Defense', x: 60, y: 30 },
  { id: 'def_db_l', name: 'DB (L)', pos: 'DB', group: 'Defense', x: 20, y: 15 },
  { id: 'def_db_r', name: 'DB (R)', pos: 'DB', group: 'Defense', x: 80, y: 15 },
  { id: 'def_ds', name: 'Safety', pos: 'DB', group: 'Defense', x: 50, y: 5 },
];

export const FranchiseAdmin: React.FC = () => {
  const { 
    profiles, teams, depthCharts, setDepthChartAssignment, 
    selectedFranchise, setSelectedFranchise, addToast, 
    updateProfile, calculateRosterHealth 
  } = useApp();

  const [activeView, setActiveView] = useState<'Personnel' | 'Depth Chart' | 'Staff' | 'Health'>('Personnel');
  const [depthGroup, setDepthGroup] = useState<'Offense' | 'Defense'>('Offense');
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);

  const currentTeam = useMemo(() => {
    const teamName = FRANCHISE_TEAMS[selectedFranchise][0];
    return teams.find(t => t.name === teamName) || teams[0];
  }, [teams, selectedFranchise]);

  const teamChart = useMemo(() => depthCharts[currentTeam?.id || ''] || {}, [depthCharts, currentTeam]);
  const roster = useMemo(() => profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER), [profiles, selectedFranchise]);
  const coachingStaff = useMemo(() => profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.COACH), [profiles, selectedFranchise]);
  const coachPool = useMemo(() => profiles.filter(p => !p.assignedFranchise && p.role === Role.COACH), [profiles]);
  
  const health = useMemo(() => calculateRosterHealth(selectedFranchise), [roster, selectedFranchise]);

  const payrollStats = useMemo(() => {
    const totalCap = 25000;
    const currentPayroll = roster.reduce((sum, p) => sum + (p.contractOffer?.amount || 0), 0);
    const utilization = Math.round((currentPayroll / totalCap) * 100);
    return { currentPayroll, utilization, remaining: totalCap - currentPayroll, rosterCount: roster.length };
  }, [roster]);

  const handleDragStart = (e: React.DragEvent, profileId: string) => {
    e.dataTransfer.setData('profileId', profileId);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDraggedOverSlot(null);
    const profileId = e.dataTransfer.getData('profileId');
    const profile = profiles.find(p => p.id === profileId);
    if (profile && currentTeam) {
      setDepthChartAssignment(currentTeam.id, slotId, profile.id);
      addToast(`${profile.fullName} assigned to ${slotId.replace('off_','').replace('def_','').toUpperCase()}`, 'success');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Global Context Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black italic text-3xl text-white shadow-2xl" style={{ backgroundColor: FRANCHISE_COLORS[selectedFranchise] }}>
             {selectedFranchise.charAt(0)}
           </div>
           <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Franchise Desk</h2>
              <p className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em] mt-2 italic opacity-60">Admin Node: {selectedFranchise} Ecosystem</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-2 bg-league-panel p-1.5 rounded-2xl border border-league-border shadow-2xl">
          {Object.values(Franchise).map(f => (
            <button key={f} onClick={() => setSelectedFranchise(f)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-lg' : 'text-league-muted hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Financial & Health Pulse */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-league-panel border border-league-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 font-black text-2xl uppercase">FISCAL_AUDIT</div>
              <h3 className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em] mb-8 italic border-b border-white/5 pb-4">Budget Utilization</h3>
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-league-muted uppercase">Payroll Velocity</span>
                    <span className="text-2xl font-black italic text-white">${payrollStats.currentPayroll.toLocaleString()} <span className="text-xs text-white/30 italic">/ 25k</span></span>
                </div>
                <div className="h-2 w-full bg-league-bg rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div className="h-full bg-league-blue transition-all duration-1000" style={{ width: `${payrollStats.utilization}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <div className="text-[7px] font-black text-league-muted uppercase mb-1">Cap Space</div>
                      <div className="text-sm font-black italic text-league-ok">${payrollStats.remaining.toLocaleString()}</div>
                   </div>
                   <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <div className="text-[7px] font-black text-league-muted uppercase mb-1">Node Density</div>
                      <div className="text-sm font-black italic text-white">{payrollStats.rosterCount} / 25</div>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-league-panel border border-league-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em] mb-8 italic border-b border-white/5 pb-4">Staff Integrity</h3>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Coaching Staff</span>
                <span className={`text-2xl font-black italic text-white`}>
                    {coachingStaff.length} / 5
                </span>
              </div>
              <div className="space-y-4">
                 {coachingStaff.map((coach, i) => (
                    <div key={i} className="flex gap-3 items-center p-3 bg-league-blue/5 border border-league-blue/20 rounded-xl">
                       <div className="w-1.5 h-1.5 rounded-full bg-league-blue animate-pulse" />
                       <span className="text-[9px] font-bold text-white uppercase tracking-widest">{coach.fullName} • {coach.positions[0]}</span>
                    </div>
                 ))}
                 {coachingStaff.length === 0 && (
                    <div className="p-4 bg-league-accent/5 border border-league-accent/20 rounded-xl flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-league-accent" />
                       <span className="text-[9px] font-bold text-league-accent uppercase tracking-widest">Critical Staff Vacancies Detected</span>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Right: Interactive Main Desk */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
           <div className="bg-league-panel p-1 rounded-2xl border border-league-border flex shadow-xl">
              {(['Personnel', 'Depth Chart', 'Staff', 'Health'] as const).map(v => (
                <button key={v} onClick={() => setActiveView(v)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-league-accent text-white shadow-lg' : 'text-league-muted hover:text-white'}`}>{v}</button>
              ))}
           </div>

           <div className="bg-league-panel border border-league-border rounded-[3rem] shadow-2xl flex-grow overflow-hidden min-h-[700px] flex flex-col relative">
              {activeView === 'Personnel' && (
                <div className="animate-in fade-in h-full flex flex-col">
                  <div className="p-8 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Franchise Roster Nodes</h3>
                    <div className="text-[8px] font-black text-league-muted uppercase tracking-widest italic">Total Units: {roster.length}</div>
                  </div>
                  <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead className="bg-league-tableHeader/50 sticky top-0 z-10">
                        <tr className="text-[8px] font-black uppercase tracking-[0.4em] text-league-muted border-b border-league-border">
                            <th className="px-10 py-5">Personnel</th>
                            <th className="px-10 py-5">Position Hub</th>
                            <th className="px-10 py-5 text-right">Metrics</th>
                            <th className="px-10 py-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-league-border">
                        {roster.map(p => (
                          <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group cursor-grab active:cursor-grabbing" draggable onDragStart={(e) => handleDragStart(e, p.id)}>
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-white shadow-inner">
                                    {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover rounded-xl" /> : p.fullName.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="text-[13px] font-black italic uppercase text-white tracking-tighter group-hover:text-league-accent transition-colors">{p.fullName}</div>
                                    <div className="text-[7px] font-bold text-league-muted uppercase tracking-widest">{p.id}</div>
                                 </div>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                               <div className="flex gap-1">
                                  {p.positions.map(pos => <span key={pos} className="bg-league-bg border border-white/5 px-2 py-0.5 rounded text-[8px] font-black text-white">{pos}</span>)}
                                </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <span className={`text-[11px] font-black italic text-league-accent`}>
                                  {p.scoutGrade || '--'} <span className="text-[8px] text-white/20 not-italic">GRADE</span>
                               </span>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <button 
                                 onClick={() => updateProfile(p.id, { assignedFranchise: undefined })}
                                 className="text-[9px] font-black uppercase tracking-widest text-league-accent/30 hover:text-league-accent transition-all"
                               >
                                 Unlink
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {roster.length === 0 && (
                      <div className="h-[400px] flex flex-col items-center justify-center opacity-20">
                         <h4 className="text-xl font-black italic uppercase tracking-widest mb-2">No Active Nodes</h4>
                         <p className="text-[10px] font-bold uppercase">Begin Induction via the Player Draft Board</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'Staff' && (
                <div className="animate-in fade-in h-full flex flex-col">
                  <div className="p-8 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Strategic Staff Operations</h3>
                    <div className="text-[8px] font-black text-league-muted uppercase tracking-widest italic">Coaches Assigned: {coachingStaff.length}</div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-accent italic border-b border-white/5 pb-2">Franchise Staff</h4>
                       <div className="space-y-3">
                          {coachingStaff.map(coach => (
                            <div key={coach.id} className="bg-league-bg border border-league-accent/20 p-5 rounded-2xl flex items-center justify-between group shadow-lg">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white border border-league-accent/50 shadow-inner overflow-hidden">
                                     {coach.avatar_url ? <img src={coach.avatar_url} className="w-full h-full object-cover" /> : coach.fullName.charAt(0)}
                                  </div>
                                  <div>
                                     <div className="text-[13px] font-black italic uppercase text-white leading-none mb-1">{coach.fullName}</div>
                                     <div className="text-[8px] font-bold text-league-accent uppercase tracking-widest">{coach.positions[0]}</div>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => updateProfile(coach.id, { assignedFranchise: undefined, status: RecruitingStatus.NEW_LEAD })}
                                 className="text-[8px] font-black uppercase text-league-accent/30 hover:text-league-accent transition-colors"
                               >
                                 Terminate
                               </button>
                            </div>
                          ))}
                          {coachingStaff.length === 0 && <div className="py-12 text-center opacity-20 italic font-black uppercase text-[8px] tracking-widest border-2 border-dashed border-league-border rounded-[2rem]">No Coaches Linked</div>}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-blue italic border-b border-white/5 pb-2">Registry Coach Pool</h4>
                       <div className="space-y-3">
                          {coachPool.map(coach => (
                            <div key={coach.id} className="bg-league-panel border border-league-border p-5 rounded-2xl flex items-center justify-between group hover:border-league-blue transition-all shadow-inner">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-league-bg flex items-center justify-center font-black italic text-white/50 text-xs border border-white/5">
                                     {coach.fullName.charAt(0)}
                                  </div>
                                  <div>
                                     <div className="text-[12px] font-black italic uppercase text-white/80 leading-none mb-1">{coach.fullName}</div>
                                     <div className="text-[7px] font-bold text-league-muted uppercase tracking-widest">{coach.positions[0]} • {coach.nationality}</div>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => updateProfile(coach.id, { assignedFranchise: selectedFranchise, status: RecruitingStatus.SIGNED })}
                                 className="bg-league-blue text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 transition-all"
                               >
                                 Recruit
                               </button>
                            </div>
                          ))}
                          {coachPool.length === 0 && <div className="py-12 text-center opacity-10 italic font-black uppercase text-[8px] tracking-widest">Registry Empty</div>}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'Depth Chart' && (
                <div className="animate-in fade-in h-full flex flex-col p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2 bg-league-bg p-1 rounded-xl border border-league-border">
                       {(['Offense', 'Defense'] as const).map(mode => (
                         <button key={mode} onClick={() => setDepthGroup(mode)} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${depthGroup === mode ? 'bg-league-accent text-white shadow-lg' : 'text-league-muted hover:text-white'}`}>{mode}</button>
                       ))}
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black text-league-muted uppercase italic tracking-[0.2em] opacity-40">Ironman Compatibility Analysis: ACTIVE</span>
                       <div className="w-1.5 h-1.5 bg-league-ok rounded-full animate-pulse shadow-[0_0_5px_#23d18b]" />
                    </div>
                  </div>

                  <div className="flex-grow flex gap-8">
                    {/* Visual Field */}
                    <div className="flex-grow relative aspect-[4/3] bg-league-bg rounded-[2rem] border-2 border-league-border p-8 shadow-inner overflow-hidden">
                        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
                           {[...Array(5)].map((_, i) => (
                             <div key={i} className="flex-1 border-b border-white/10 last:border-0" />
                           ))}
                           <div className="absolute inset-x-0 top-1/2 h-[2px] bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                        </div>

                        <div className="absolute inset-0 z-20">
                           {ARENA_SLOTS.filter(s => s.group === depthGroup).map(slot => {
                             const pId = teamChart[slot.id];
                             const assignedP = profiles.find(px => px.id === pId);
                             const isOver = draggedOverSlot === slot.id;

                             return (
                               <div key={slot.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
                                  <div className="text-[7px] font-black text-league-muted uppercase tracking-widest mb-1 italic opacity-60">{slot.name}</div>
                                  <div 
                                    onDragOver={(e) => { e.preventDefault(); setDraggedOverSlot(slot.id); }}
                                    onDragLeave={() => setDraggedOverSlot(null)}
                                    onDrop={(e) => handleDrop(e, slot.id)}
                                    className={`w-24 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all p-2 relative group overflow-hidden ${
                                      assignedP 
                                        ? 'bg-league-accent/10 border-league-accent shadow-[0_0_20px_rgba(228,29,36,0.2)]' 
                                        : isOver 
                                          ? 'bg-league-blue/20 border-league-blue scale-110' 
                                          : 'border-league-border bg-black/40 hover:border-league-muted'
                                    }`}
                                  >
                                     {assignedP ? (
                                       <div className="text-center">
                                          <button 
                                            onClick={() => setDepthChartAssignment(currentTeam?.id || '', slot.id, null)}
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-league-accent"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"></path></svg>
                                          </button>
                                          <div className="text-[10px] font-black italic uppercase text-white truncate w-20 leading-none">{assignedP.fullName.split(' ').pop()}</div>
                                          <div className="text-[7px] font-bold text-league-accent uppercase mt-1">Grade: {assignedP.scoutGrade}</div>
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

                    {/* Sidebar Mini-Pool */}
                    <div className="w-64 bg-black/30 border border-white/5 rounded-[2rem] p-6 flex flex-col shadow-inner">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white mb-6 border-b border-white/5 pb-4">Roster Nodes</h4>
                       <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {roster.map(p => (
                            <div 
                              key={p.id} 
                              draggable 
                              onDragStart={(e) => handleDragStart(e, p.id)}
                              className="bg-league-bg border border-league-border p-3 rounded-xl flex items-center gap-3 group hover:border-league-accent transition-all cursor-grab active:cursor-grabbing shadow-lg"
                            >
                               <div className="w-8 h-8 rounded-lg bg-league-panel flex items-center justify-center font-black italic text-[10px] text-white group-hover:text-league-accent transition-colors">
                                  {p.fullName.charAt(0)}
                               </div>
                               <div className="min-w-0">
                                  <div className="text-[10px] font-black uppercase text-white truncate group-hover:text-league-accent transition-colors">{p.fullName.split(' ').pop()}</div>
                                  <div className="text-[7px] font-bold text-league-muted uppercase">{p.positions.join('/')}</div>
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-[7px] font-black uppercase text-league-muted text-center italic opacity-30">Drag Athlete to Slot</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'Health' && (
                <div className="animate-in slide-in-from-bottom-6 p-10 h-full">
                   <h3 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter leading-none border-b border-white/5 pb-6">Unit Continuity Analysis</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-accent italic">Strategic Deficiencies</h4>
                         <div className="space-y-3">
                            {health.gaps.map((gap, i) => (
                              <div key={i} className="p-4 bg-league-accent/5 border border-league-accent/20 rounded-2xl animate-in fade-in">
                                 <div className="text-[11px] font-bold italic text-white uppercase mb-1">{gap}</div>
                                 <p className="text-[8px] text-league-muted uppercase font-bold tracking-widest opacity-50">Impact: High Probability of Unit Breakdown</p>
                              </div>
                            ))}
                            {health.gaps.length === 0 && <p className="text-[10px] italic text-league-ok font-black uppercase tracking-widest">No Critical Gaps Detected</p>}
                         </div>
                      </div>
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-blue italic">Executive Protocols</h4>
                         <div className="space-y-3">
                            {health.recommendations.map((rec, i) => (
                               <div key={i} className="p-4 bg-league-blue/5 border border-league-blue/20 rounded-2xl">
                                  <div className="text-[11px] font-bold italic text-white uppercase">{rec}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const FactItem = ({ label, val, color = 'text-white' }: any) => (
  <div className="space-y-1">
    <div className="text-[8px] font-black uppercase text-league-muted tracking-widest">{label}</div>
    <div className={`text-[12px] font-black italic uppercase ${color}`}>{val}</div>
  </div>
);
