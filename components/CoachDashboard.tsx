
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { Franchise, SystemRole, FRANCHISE_COLORS, FRANCHISE_TEAMS, RecruitingStatus, TalentTier, Role, Profile } from '../types';

interface Slot {
  id: string;
  name: string;
  pos: string;
  group: 'Offense' | 'Defense' | 'Ironman';
  x: number;
  y: number;
}

const FIELD_SLOTS: Slot[] = [
  { id: 'qb', name: 'Quarterback', pos: 'QB', group: 'Offense', x: 50, y: 85 },
  { id: 'wr1', name: 'WR / Motion', pos: 'WR', group: 'Ironman', x: 20, y: 70 },
  { id: 'wr2', name: 'WR / End', pos: 'WR', group: 'Ironman', x: 80, y: 70 },
  { id: 'ol1', name: 'Center / Guard', pos: 'OL', group: 'Offense', x: 50, y: 75 },
  { id: 'ol2', name: 'Guard / DL', pos: 'OL', group: 'Ironman', x: 65, y: 75 },
  { id: 'dl1', name: 'Nose Tackle', pos: 'DL', group: 'Defense', x: 50, y: 65 },
  { id: 'lb1', name: 'Jack Linebacker', pos: 'LB', group: 'Defense', x: 30, y: 55 },
  { id: 'lb2', name: 'Mac Linebacker', pos: 'LB', group: 'Defense', x: 70, y: 55 },
  { id: 'db1', name: 'Safety / DB', pos: 'DB', group: 'Ironman', x: 50, y: 40 },
];

export const CoachDashboard: React.FC = () => {
  const { profiles, selectedFranchise, currentSystemRole, activityLogs, setView, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'Roster' | 'Depth Chart' | 'Security Node'>('Roster');
  const [selectedTeam, setSelectedTeam] = useState<string>(FRANCHISE_TEAMS[selectedFranchise][0]);
  const [assignments, setAssignments] = useState<Record<string, Profile | null>>({});
  
  // Password Change State
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const teamRoster = useMemo(() => {
    return profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER);
  }, [profiles, selectedFranchise]);

  const filteredTeamRoster = useMemo(() => {
    return teamRoster.filter(p => p.assignedTeam === selectedTeam);
  }, [teamRoster, selectedTeam]);

  const stats = useMemo(() => {
    const total = filteredTeamRoster.length;
    const avgGrade = total > 0 
      ? (filteredTeamRoster.reduce((sum, p) => sum + (p.scoutGrade || 0), 0) / total).toFixed(1)
      : '0.0';
    const signedCount = filteredTeamRoster.filter(p => p.status === RecruitingStatus.SIGNED || p.status === RecruitingStatus.PLACED).length;
    
    return { total, avgGrade, signedCount };
  }, [filteredTeamRoster]);

  const teamActivity = useMemo(() => {
    return activityLogs.filter(log => {
      const p = profiles.find(prof => prof.id === log.subjectId);
      return p && p.assignedFranchise === selectedFranchise && p.assignedTeam === selectedTeam;
    }).slice(0, 5);
  }, [activityLogs, profiles, selectedFranchise, selectedTeam]);

  const handleAssign = (slotId: string, player: Profile) => {
    setAssignments(prev => ({ ...prev, [slotId]: player }));
  };

  const handleClear = (slotId: string) => {
    setAssignments(prev => ({ ...prev, [slotId]: null }));
  };

  const handlePassUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      addToast("Encryption Mismatch: New keys do not align.", "error");
      return;
    }
    setIsUpdatingPass(true);
    setTimeout(() => {
      addToast("Security Credentials Rotated Successfully.", "success");
      setPassData({ current: '', new: '', confirm: '' });
      setIsUpdatingPass(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Team Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 pb-8" style={{ borderColor: FRANCHISE_COLORS[selectedFranchise] }}>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center font-black italic text-4xl text-white shadow-2xl" style={{ backgroundColor: FRANCHISE_COLORS[selectedFranchise] }}>
            {selectedFranchise.charAt(0)}
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
              {selectedFranchise} Node
            </h2>
            <div className="flex items-center gap-4 mt-3">
               <select 
                 className="bg-league-panel border border-league-border px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent appearance-none pr-10 cursor-pointer"
                 value={selectedTeam}
                 onChange={(e) => setSelectedTeam(e.target.value)}
               >
                 {FRANCHISE_TEAMS[selectedFranchise].map(t => <option key={t} value={t}>{t} Unit</option>)}
               </select>
               <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black italic opacity-60">Official Tactical Command Desk • Operational Node Active</p>
            </div>
          </div>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl">
          {(['Roster', 'Depth Chart', 'Security Node'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Roster' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CoachStatCard label="Unit Strength" val={stats.total} sub="Personnel Online" />
            <CoachStatCard label="Avg Scout Grade" val={stats.avgGrade} sub="Athletic Mean" color="text-league-blue" />
            <CoachStatCard label="Operational Readiness" val={`${Math.round((stats.signedCount / (stats.total || 1)) * 100)}%`} sub="Personnel Committed" color="text-league-ok" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-end mb-4">
                 <h3 className="text-[12px] font-black uppercase text-white tracking-[0.4em] italic border-l-4 border-league-accent pl-4">Tactical Roster: {selectedTeam}</h3>
                 <span className="text-[9px] font-bold text-league-muted uppercase tracking-widest">{stats.total} Nodes Online</span>
              </div>
              <div className="bg-league-panel border border-league-border rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-league-tableHeader border-b border-league-border sticky top-0 z-10">
                      <tr className="text-[8px] font-black uppercase text-league-muted tracking-[0.3em]">
                        <th className="px-8 py-5">Athlete</th>
                        <th className="px-8 py-5">Classification</th>
                        <th className="px-8 py-5">Biometrics</th>
                        <th className="px-8 py-5 text-right">Draft Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-league-border">
                      {filteredTeamRoster.map(p => (
                        <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-white overflow-hidden shadow-inner">
                                 {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-[12px] font-black italic uppercase text-white tracking-tighter group-hover:text-league-accent transition-colors">{p.fullName}</div>
                                <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{p.positions.join(' / ')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                               p.tier === TalentTier.TIER1 ? 'bg-league-accent text-white border-league-accent' : 
                               p.tier === TalentTier.TIER2 ? 'bg-league-blue text-white border-league-blue' : 
                               'bg-league-pill text-league-muted border-league-border'
                             }`}>
                               {p.tier.split(' ')[0]}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-black text-league-muted uppercase tracking-tighter italic">
                            {p.height_cm}cm / {p.weight_kg}kg
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-xs font-black italic text-league-accent">
                            {p.scoutGrade || '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-accent border-b border-league-border pb-4 italic">Recent Unit Activity</h4>
                  <div className="space-y-4">
                     {teamActivity.map(log => (
                       <div key={log.id} className="flex gap-4 border-l-2 border-league-border pl-4 py-2 hover:border-league-accent transition-all group">
                          <div className="flex-1">
                             <div className="text-[8px] font-black uppercase text-league-muted mb-1 opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</div>
                             <div className="text-[10px] font-bold italic text-white/80 leading-relaxed group-hover:text-white transition-colors">{log.message}</div>
                          </div>
                       </div>
                     ))}
                     {teamActivity.length === 0 && (
                       <p className="text-[9px] font-black uppercase text-league-muted opacity-20 text-center py-6 italic tracking-widest">No Node Activity Recorded</p>
                     )}
                  </div>
               </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Depth Chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-10 duration-700">
           <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative z-10 aspect-[4/3] bg-league-bg rounded-[2rem] border-2 border-league-border p-8 relative">
                 <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 border-b border-white/5 last:border-0 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/5 italic">{(5-i)*10}</span>
                      </div>
                    ))}
                 </div>
                 <div className="absolute inset-0 z-20">
                    {FIELD_SLOTS.map(slot => (
                      <div key={slot.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
                         <div className="text-[7px] font-black text-league-muted uppercase tracking-widest mb-1 italic opacity-40">{slot.name}</div>
                         <div className={`w-24 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all p-2 relative group overflow-hidden ${assignments[slot.id] ? 'bg-league-accent/10 border-league-accent shadow-[0_0_20px_rgba(228,29,36,0.2)]' : 'border-league-border bg-black/40 hover:border-league-muted'}`}>
                           {assignments[slot.id] ? (
                             <div className="text-center group-hover:scale-95 transition-transform">
                               <button onClick={() => handleClear(slot.id)} className="absolute top-1 right-1 text-league-accent opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg></button>
                               <div className="text-[10px] font-black italic uppercase text-white truncate w-20">{assignments[slot.id]?.fullName}</div>
                               <div className="text-[7px] font-bold text-league-accent uppercase mt-0.5">{assignments[slot.id]?.positions[0]}</div>
                             </div>
                           ) : (
                             <span className="text-[9px] font-black uppercase text-league-muted tracking-widest opacity-20 italic">{slot.pos}</span>
                           )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="lg:col-span-4 bg-league-panel border border-league-border rounded-[3rem] p-8 flex flex-col shadow-2xl h-[600px]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-6 border-b border-league-border pb-4 italic">Assigned Personnel</h4>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {filteredTeamRoster.map(p => (
                   <div key={p.id} className="bg-league-bg border border-league-border p-4 rounded-2xl flex items-center justify-between group hover:border-league-accent transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white text-xs">{p.fullName.charAt(0)}</div>
                         <div>
                            <div className="text-[11px] font-black italic uppercase text-white">{p.fullName}</div>
                            <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{p.positions.join('/')}</div>
                         </div>
                      </div>
                      <button onClick={() => { const firstOpenSlot = FIELD_SLOTS.find(s => !assignments[s.id] && p.positions.includes(s.pos)); if (firstOpenSlot) handleAssign(firstOpenSlot.id, p); }} className="text-[8px] font-black uppercase text-league-accent hover:underline px-2">Slot</button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Security Node' && (
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
           <div className="bg-league-panel border-4 border-league-accent p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                 <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"></path></svg>
              </div>
              <h3 className="text-3xl font-black italic uppercase text-white mb-2 tracking-tighter leading-none">Security Node</h3>
              <p className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-10 italic">Rotate Personnel Access Keys</p>
              
              <form onSubmit={handlePassUpdate} className="space-y-6 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-2">Current Entry Key</label>
                    <input 
                      type="password" 
                      required
                      className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent font-bold"
                      value={passData.current}
                      onChange={e => setPassData({...passData, current: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-2">New Neural Key</label>
                       <input 
                         type="password" 
                         required
                         className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent font-bold"
                         value={passData.new}
                         onChange={e => setPassData({...passData, new: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-2">Verify Synchronicity</label>
                       <input 
                         type="password" 
                         required
                         className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent font-bold"
                         value={passData.confirm}
                         onChange={e => setPassData({...passData, confirm: e.target.value})}
                       />
                    </div>
                 </div>
                 <button 
                   type="submit" 
                   disabled={isUpdatingPass}
                   className="w-full bg-league-accent text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3"
                 >
                   {isUpdatingPass ? (
                     <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Strengthing Encryption...</>
                   ) : "Rotate Access Key"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const CoachStatCard = ({ label, val, sub, color = 'text-white' }: any) => (
  <div className="bg-league-panel border border-league-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-league-accent transition-all">
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
       <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
    </div>
    <div className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em] mb-4 italic">{label}</div>
    <div className={`text-5xl font-black italic tracking-tighter leading-none mb-2 ${color}`}>{val}</div>
    <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest opacity-40">{sub}</div>
  </div>
);
