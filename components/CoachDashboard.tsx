import React, { useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, SystemRole, FRANCHISE_COLORS, FRANCHISE_TEAMS, RecruitingStatus, TalentTier, Role } from '../types';

export const CoachDashboard: React.FC = () => {
  const { profiles, selectedFranchise, currentSystemRole, activityLogs } = useApp();

  // If role is LEAGUE_ADMIN, allow browsing, otherwise scope to the coach's franchise
  const isCoach = currentSystemRole === SystemRole.COACH_STAFF;
  
  const teamRoster = useMemo(() => {
    return profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER);
  }, [profiles, selectedFranchise]);

  const teamName = useMemo(() => {
    const teams = FRANCHISE_TEAMS[selectedFranchise];
    return teams ? teams[0] : 'Unknown Team';
  }, [selectedFranchise]);

  const stats = useMemo(() => {
    const total = teamRoster.length;
    const avgGrade = total > 0 
      ? (teamRoster.reduce((sum, p) => sum + (p.scoutGrade || 0), 0) / total).toFixed(1)
      : '0.0';
    const signedCount = teamRoster.filter(p => p.status === RecruitingStatus.SIGNED || p.status === RecruitingStatus.PLACED).length;
    
    return { total, avgGrade, signedCount };
  }, [teamRoster]);

  const teamActivity = useMemo(() => {
    return activityLogs.filter(log => {
      const p = profiles.find(prof => prof.id === log.subjectId);
      return p && p.assignedFranchise === selectedFranchise;
    }).slice(0, 5);
  }, [activityLogs, profiles, selectedFranchise]);

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
              {selectedFranchise} {teamName}
            </h2>
            <p className="text-league-muted uppercase tracking-[0.4em] text-[10px] font-black mt-2 italic opacity-60">Official Tactical Command Desk • Operational Node Active</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <div className="text-[10px] font-black text-league-accent uppercase tracking-widest leading-none mb-1">Session: 2026 Cycle</div>
              <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest opacity-40">Command Clearance: {currentSystemRole}</div>
           </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CoachStatCard label="Roster Volume" val={stats.total} sub="Personnel Assigned" />
        <CoachStatCard label="Avg Scout Grade" val={stats.avgGrade} sub="Athletic Mean" color="text-league-blue" />
        <CoachStatCard label="Operational Readiness" val={`${Math.round((stats.signedCount / (stats.total || 1)) * 100)}%`} sub="Personnel Committed" color="text-league-ok" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Roster Overview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end mb-4">
             <h3 className="text-[12px] font-black uppercase text-white tracking-[0.4em] italic border-l-4 border-league-accent pl-4">Tactical Roster List</h3>
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
                  {teamRoster.map(p => (
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
                  {teamRoster.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-league-muted opacity-20 italic">No Personnel Assigned to Roster Hub</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tactical Feed & Resources */}
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

           <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white border-b border-league-border pb-4 italic mb-6">Tactical Shortcuts</h4>
              <div className="grid grid-cols-1 gap-3">
                 <button className="w-full bg-league-bg border border-league-border p-4 rounded-2xl flex items-center justify-between hover:border-league-accent transition-all group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-league-muted group-hover:text-white">Review Playbook</span>
                    <svg className="w-4 h-4 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                 </button>
                 <button className="w-full bg-league-bg border border-league-border p-4 rounded-2xl flex items-center justify-between hover:border-league-accent transition-all group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-league-muted group-hover:text-white">Broadcast to Unit</span>
                    <svg className="w-4 h-4 text-league-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                 </button>
                 <button className="w-full bg-league-bg border border-league-border p-4 rounded-2xl flex items-center justify-between hover:border-league-accent transition-all group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-league-muted group-hover:text-white">Performance Lab</span>
                    <svg className="w-4 h-4 text-league-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                 </button>
              </div>
           </div>
        </div>
      </div>
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
