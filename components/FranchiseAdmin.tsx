
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../App';
import { Franchise, Profile, TalentTier, SystemRole, FRANCHISE_COLORS } from '../types';

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

export const FranchiseAdmin: React.FC = () => {
  const { profiles, updateProfile, selectedFranchise, setSelectedFranchise, currentSystemRole } = useApp();
  const [activeSubView, setActiveSubView] = useState<'Roster' | 'Finance' | 'Onboarding'>('Roster');
  
  // Suggestion #6: Cap Space Simulator
  const [simExtraSpending, setSimExtraSpending] = useState(0);

  const roster = profiles.filter(p => p.assignedFranchise === selectedFranchise);
  const capLimit = 12000000;
  const currentTotal = roster.reduce((sum, p) => sum + (p.capHit || 0), 0);
  const projectedTotal = currentTotal + simExtraSpending;

  const handleToggleOnboarding = (profileId: string, taskId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const newList = profile.onboardingChecklist.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    updateProfile(profileId, { onboardingChecklist: newList });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Franchise Desk</h2>
          <p className="text-[11px] font-black uppercase text-league-muted tracking-[0.3em] mt-1">{selectedFranchise} Node Central Administration</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-league-panel p-1.5 rounded-2xl border border-league-border shadow-inner">
          {Object.values(Franchise).map(f => (
            <button 
              key={f} onClick={() => setSelectedFranchise(f)} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-xl' : 'text-league-muted hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-8 border-b border-league-border pb-6">
        {['Roster', 'Finance', 'Onboarding'].map((view: any) => (
          <button 
            key={view} onClick={() => setActiveSubView(view)} 
            className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all relative ${activeSubView === view ? 'text-white' : 'text-league-muted hover:text-white'}`}
          >
            {view}
            {activeSubView === view && <div className="absolute -bottom-6 left-0 right-0 h-1 bg-league-accent shadow-[0_0_10px_#e41d24]" />}
          </button>
        ))}
      </div>

      {activeSubView === 'Roster' && (
        <div className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-league-tableHeader border-b border-league-border">
              <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-league-muted">
                <th className="px-10 py-6">Operational Athlete</th>
                <th className="px-10 py-6">Classification</th>
                <th className="px-10 py-6">Deployment Node</th>
                <th className="px-10 py-6 text-right">Registry Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-league-border">
              {roster.map(p => (
                <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group">
                  <td className="px-10 py-6 flex items-center gap-4">
                    {/* Initial circle replacement for Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-[14px] text-white shadow-inner group-hover:border-league-accent transition-colors">
                      {p.fullName.charAt(0)}
                    </div>
                    <span className="text-[13px] font-black italic uppercase text-white tracking-tighter">{p.fullName}</span>
                  </td>
                  <td className="px-10 py-6">
                     <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border shadow-md ${getTierColor(p.tier)}`}>{p.tier}</span>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-black text-league-muted uppercase tracking-widest italic">{p.status}</td>
                  <td className="px-10 py-6 text-right">
                    <button onClick={() => updateProfile(p.id, { assignedFranchise: undefined })} className="text-[9px] font-black uppercase tracking-widest text-league-accent hover:brightness-150 transition-all border-b border-transparent hover:border-league-accent pb-1">Unlink Node</button>
                  </td>
                </tr>
              ))}
              {roster.length === 0 && (
                 <tr>
                    <td colSpan={4} className="py-24 text-center text-league-muted uppercase font-black italic tracking-[0.5em] opacity-10">Strategic roster empty • Personnel pending assignment</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Suggestion #6: Cap Space Simulator */}
      {activeSubView === 'Finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4">
           <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11V11H13V16zm0-7H11V7H13V9z"/></svg>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-accent border-b border-league-border pb-6 italic">Fiscal Cap Simulation Engine</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-[11px] font-black uppercase text-league-muted tracking-widest">
                   <span>Projected Signings Impact</span>
                   <span className="text-white italic tracking-tighter font-black">${simExtraSpending.toLocaleString()}</span>
                 </div>
                 <input 
                  type="range" min="0" max="5000000" step="50000" 
                  className="w-full h-3 bg-league-bg rounded-full cursor-pointer accent-league-accent shadow-inner border border-league-border"
                  value={simExtraSpending}
                  onChange={(e) => setSimExtraSpending(parseInt(e.target.value))}
                 />
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6">
                 <div className="p-6 bg-league-bg border border-league-border rounded-3xl shadow-inner">
                    <div className="text-[9px] font-black text-league-muted uppercase tracking-[0.3em] mb-2">Live Cap Load</div>
                    <div className="text-3xl font-black italic text-white tracking-tighter leading-none">${currentTotal.toLocaleString()}</div>
                 </div>
                 <div className={`p-6 bg-league-bg border-2 rounded-3xl shadow-inner transition-all duration-500 ${projectedTotal > capLimit ? 'border-league-accent shadow-[0_0_20px_rgba(228,29,36,0.1)]' : 'border-league-ok shadow-[0_0_20px_rgba(35,209,139,0.1)]'}`}>
                    <div className="text-[9px] font-black text-league-muted uppercase tracking-[0.3em] mb-2">Available Operational Space</div>
                    <div className={`text-3xl font-black italic tracking-tighter leading-none ${projectedTotal > capLimit ? 'text-league-accent' : 'text-league-ok'}`}>
                      ${(capLimit - projectedTotal).toLocaleString()}
                    </div>
                 </div>
              </div>
           </div>
           <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-10 h-80 shadow-2xl">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[{n: 'Actual', v: currentTotal}, {n: 'Limit', v: capLimit}, {n: 'Projected', v: projectedTotal}]}>
                    <defs>
                       <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e41d24" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#e41d24" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#e41d24" strokeWidth={4} fill="url(#colorCap)" />
                    <Tooltip contentStyle={{ background: '#000', border: '1px solid #1a1a1a', fontWeight: 'bold' }} />
                 </AreaChart>
              </ResponsiveContainer>
              <div className="mt-6 text-center">
                 <span className="text-[9px] font-black uppercase tracking-[0.5em] text-league-muted italic opacity-30">Fiscal Visualization Node Active</span>
              </div>
           </div>
        </div>
      )}

      {/* Suggestion #8: Onboarding Pipeline */}
      {activeSubView === 'Onboarding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
           {roster.filter(p => p.onboardingChecklist.length > 0).map(p => (
             <div key={p.id} className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-league-accent transition-all">
                <div className="flex justify-between items-start mb-8">
                   <div>
                     <h5 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{p.fullName}</h5>
                     <p className="text-[9px] font-black text-league-accent uppercase tracking-[0.3em] italic">{p.positions[0]} • Onboarding Active</p>
                   </div>
                   {/* Initial Circle replacement for Avatar */}
                   <div className="w-12 h-12 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-lg text-white shadow-inner group-hover:border-league-accent transition-colors">
                      {p.fullName.charAt(0)}
                   </div>
                </div>
                <div className="space-y-4">
                   {p.onboardingChecklist.map(task => (
                     <div 
                      key={task.id} 
                      onClick={() => handleToggleOnboarding(p.id, task.id)}
                      className="flex items-center gap-4 cursor-pointer group/task"
                     >
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shadow-inner ${task.isCompleted ? 'bg-league-ok border-league-ok text-black shadow-lg shadow-league-ok/20' : 'border-league-border bg-league-bg group-hover/task:border-league-muted'}`}>
                           {task.isCompleted && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <div className={`text-[11px] font-black uppercase tracking-widest transition-colors ${task.isCompleted ? 'text-league-muted line-through opacity-50' : 'text-white'}`}>{task.title}</div>
                        <span className="text-[7px] font-black uppercase ml-auto text-league-muted tracking-[0.2em] opacity-40">{task.category}</span>
                     </div>
                   ))}
                </div>
                <div className="mt-10 pt-6 border-t border-league-border/30">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-league-muted">Session Progress</span>
                      <span className="text-[10px] font-black italic text-league-ok">{Math.round((p.onboardingChecklist.filter(t => t.isCompleted).length / p.onboardingChecklist.length) * 100)}%</span>
                   </div>
                   <div className="h-2 bg-league-bg rounded-full overflow-hidden shadow-inner border border-league-border">
                      <div 
                        className="h-full bg-league-ok shadow-[0_0_10px_#23d18b] transition-all duration-1000 ease-out" 
                        style={{ width: `${(p.onboardingChecklist.filter(t => t.isCompleted).length / p.onboardingChecklist.length) * 100}%` }} 
                      />
                   </div>
                </div>
             </div>
           ))}
           {roster.every(p => p.onboardingChecklist.length === 0) && (
              <div className="lg:col-span-3 py-32 text-center text-league-muted uppercase font-black italic tracking-[0.5em] opacity-10 border-2 border-dashed border-league-border rounded-[3rem]">No active personnel onboarding nodes</div>
           )}
        </div>
      )}
    </div>
  );
};
