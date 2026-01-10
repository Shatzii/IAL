
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { useApp } from '../App';
import { Franchise, Profile, TalentTier, SystemRole, FRANCHISE_COLORS, Role } from '../types';

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

export const FranchiseAdmin: React.FC = () => {
  const { profiles, updateProfile, selectedFranchise, setSelectedFranchise, addToast } = useApp();
  const [activeSubView, setActiveSubView] = useState<'Roster' | 'Coaches' | 'Finance' | 'Onboarding' | 'Security'>('Roster');
  const [simExtraSpending, setSimExtraSpending] = useState(0);

  // Password Rotation State
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const roster = profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER);
  const coaches = profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.COACH);
  
  const capLimit = 12000000;
  const currentTotal = roster.reduce((sum, p) => sum + (p.capHit || 0), 0);
  const projectedTotal = currentTotal + simExtraSpending;

  const handleToggleOnboarding = (profileId: string, taskId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const newList = profile.onboardingChecklist.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted, status: !t.isCompleted ? 'COMPLETED' : 'PENDING' as any } : t);
    updateProfile(profileId, { onboardingChecklist: newList });
  };

  const handlePassUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      addToast("Encryption Mismatch: New keys do not align.", "error");
      return;
    }
    setIsUpdatingPass(true);
    setTimeout(() => {
      addToast("Franchise Admin Key Rotated Successfully.", "success");
      setPassData({ current: '', new: '', confirm: '' });
      setIsUpdatingPass(false);
    }, 1500);
  };

  const forecastData = useMemo(() => [
    { season: '2026', cap: capLimit, projected: projectedTotal },
    { season: '2027', cap: capLimit * 1.05, projected: projectedTotal * 1.08 },
    { season: '2028', cap: capLimit * 1.10, projected: projectedTotal * 1.15 }
  ], [projectedTotal, capLimit]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Franchise Desk</h2>
          <p className="text-[11px] font-black uppercase text-league-muted tracking-[0.3em] mt-1">{selectedFranchise} Node Central Administration</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-league-panel p-1.5 rounded-2xl border border-league-border shadow-inner">
          {Object.values(Franchise).map(f => (
            <button key={f} onClick={() => setSelectedFranchise(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-xl' : 'text-league-muted hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-8 border-b border-league-border pb-6 overflow-x-auto no-scrollbar">
        {['Roster', 'Coaches', 'Finance', 'Onboarding', 'Security'].map((view: any) => (
          <button key={view} onClick={() => setActiveSubView(view)} className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap ${activeSubView === view ? 'text-white' : 'text-league-muted hover:text-white'}`}>
            {view}
            {activeSubView === view && <div className="absolute -bottom-6 left-0 right-0 h-1 bg-league-accent shadow-[0_0_10px_#e41d24]" />}
          </button>
        ))}
      </div>

      {activeSubView === 'Roster' && (
        <div className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-league-tableHeader border-b border-league-border">
              <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-league-muted"><th className="px-10 py-6">Operational Athlete</th><th className="px-10 py-6">Classification</th><th className="px-10 py-6">Deployment Node</th><th className="px-10 py-6 text-right">Registry Operations</th></tr>
            </thead>
            <tbody className="divide-y divide-league-border">
              {roster.map(p => (
                <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group">
                  <td className="px-10 py-6 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-[14px] text-white">{p.fullName.charAt(0)}</div><span className="text-[13px] font-black italic uppercase text-white tracking-tighter">{p.fullName}</span></td>
                  <td className="px-10 py-6"><span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border shadow-md ${getTierColor(p.tier)}`}>{p.tier}</span></td>
                  <td className="px-10 py-6 text-[10px] font-black text-league-muted uppercase tracking-widest italic">{p.status}</td>
                  <td className="px-10 py-6 text-right"><button onClick={() => updateProfile(p.id, { assignedFranchise: undefined })} className="text-[9px] font-black uppercase tracking-widest text-league-accent hover:brightness-150 transition-all border-b border-transparent hover:border-league-accent pb-1">Unlink Node</button></td>
                </tr>
              ))}
              {roster.length === 0 && <tr><td colSpan={4} className="px-10 py-20 text-center text-league-muted uppercase font-black italic tracking-widest opacity-20">No Registered Athletes</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeSubView === 'Coaches' && (
        <div className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-league-tableHeader border-b border-league-border">
              <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-league-muted">
                <th className="px-10 py-6">Coach Staff</th>
                <th className="px-10 py-6">Assigned Roles</th>
                <th className="px-10 py-6">Contact Info</th>
                <th className="px-10 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-league-border">
              {coaches.map(c => (
                <tr key={c.id} className="hover:bg-league-bg/30 transition-colors group">
                  <td className="px-10 py-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-[14px] text-white">
                      {c.avatar_url ? <img src={c.avatar_url} className="w-full h-full object-cover rounded-xl" /> : c.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-black italic uppercase text-white tracking-tighter">{c.fullName}</div>
                      <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{c.assignedTeam} Staff</div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-wrap gap-2">
                      {c.positions.map(pos => (
                        <span key={pos} className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-league-pill border border-league-border text-white shadow-sm">{pos}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-white italic truncate">{c.email}</div>
                      <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{c.phone}</div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button onClick={() => updateProfile(c.id, { assignedFranchise: undefined })} className="text-[9px] font-black uppercase tracking-widest text-league-accent hover:brightness-150 transition-all border-b border-transparent hover:border-league-accent pb-1">Unlink Staff</button>
                  </td>
                </tr>
              ))}
              {coaches.length === 0 && <tr><td colSpan={4} className="px-10 py-20 text-center text-league-muted uppercase font-black italic tracking-widest opacity-20">No Staff Assigned</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeSubView === 'Finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-4">
           <div className="lg:col-span-4 bg-league-panel border border-league-border rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-accent border-b border-league-border pb-6 italic">Fiscal Simulation Hub (3-Season)</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-[11px] font-black uppercase text-league-muted tracking-widest"><span>Draft Class Injection</span><span className="text-white italic tracking-tighter font-black">${simExtraSpending.toLocaleString()}</span></div>
                 <input type="range" min="0" max="5000000" step="50000" className="w-full h-3 bg-league-bg rounded-full cursor-pointer accent-league-accent shadow-inner border border-league-border" value={simExtraSpending} onChange={(e) => setSimExtraSpending(parseInt(e.target.value))} />
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <div className="p-6 bg-league-bg border border-league-border rounded-3xl shadow-inner"><div className="text-[9px] font-black text-league-muted uppercase tracking-[0.3em] mb-2">Live Cap Load</div><div className="text-3xl font-black italic text-white tracking-tighter leading-none">${currentTotal.toLocaleString()}</div></div>
                 <div className={`p-6 bg-league-bg border-2 rounded-3xl shadow-inner transition-all duration-500 ${projectedTotal > capLimit ? 'border-league-accent' : 'border-league-ok'}`}><div className="text-[9px] font-black text-league-muted uppercase tracking-[0.3em] mb-2">Operational Space</div><div className={`text-3xl font-black italic tracking-tighter leading-none ${projectedTotal > capLimit ? 'text-league-accent' : 'text-league-ok'}`}>${(capLimit - projectedTotal).toLocaleString()}</div></div>
              </div>
           </div>
           <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[2.5rem] p-10 h-[450px] shadow-2xl">
              <h5 className="text-[10px] font-black uppercase text-league-muted tracking-widest mb-10 text-center italic opacity-50">Strategic Cap Forecasting Index</h5>
              <ResponsiveContainer width="100%" height="80%">
                 <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="season" tick={{fill: '#888', fontSize: 10, fontWeight: 'black'}} />
                    <YAxis tick={{fill: '#888', fontSize: 10, fontWeight: 'black'}} tickFormatter={(v) => `$${v/1000000}M`} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: '#000', border: '1px solid #1a1a1a' }} />
                    <Bar dataKey="cap" fill="#1a1a1a" radius={[10, 10, 0, 0]} name="Max Limit" />
                    <Bar dataKey="projected" fill="#e41d24" radius={[10, 10, 0, 0]} name="Simulated Load" />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      )}

      {activeSubView === 'Onboarding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
           {roster.filter(p => p.onboardingChecklist.length > 0).map(p => (
             <div key={p.id} className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-league-accent transition-all">
                <div className="flex justify-between items-start mb-8">
                   <div><h5 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{p.fullName}</h5><p className="text-[9px] font-black text-league-accent uppercase tracking-[0.3em] italic">{p.positions[0]} • Onboarding Path</p></div>
                   <div className="w-12 h-12 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-lg text-white shadow-inner">{p.fullName.charAt(0)}</div>
                </div>
                <div className="space-y-4">
                   {p.onboardingChecklist.map(task => (
                     <div key={task.id} onClick={() => handleToggleOnboarding(p.id, task.id)} className="flex items-center gap-4 cursor-pointer group/task">
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shadow-inner ${task.isCompleted ? 'bg-league-ok border-league-ok text-black shadow-lg shadow-league-ok/20' : 'border-league-border bg-league-bg'}`}>{task.isCompleted && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}</div>
                        <div className={`text-[11px] font-black uppercase tracking-widest transition-colors ${task.isCompleted ? 'text-league-muted line-through opacity-50' : 'text-white'}`}>{task.title}</div>
                        <span className="text-[7px] font-black uppercase ml-auto text-league-muted tracking-[0.2em] opacity-40">{task.category}</span>
                     </div>
                   ))}
                </div>
                <div className="mt-10 pt-6 border-t border-league-border/30">
                   <div className="flex justify-between items-center mb-3"><span className="text-[9px] font-black uppercase tracking-[0.3em] text-league-muted">Session Progress</span><span className="text-[10px] font-black italic text-league-ok">{Math.round((p.onboardingChecklist.filter(t => t.isCompleted).length / p.onboardingChecklist.length) * 100)}%</span></div>
                   <div className="h-2 bg-league-bg rounded-full overflow-hidden border border-league-border"><div className="h-full bg-league-ok shadow-[0_0_10px_#23d18b] transition-all duration-1000 ease-out" style={{ width: `${(p.onboardingChecklist.filter(t => t.isCompleted).length / p.onboardingChecklist.length) * 100}%` }} /></div>
                </div>
             </div>
           ))}
           {roster.filter(p => p.onboardingChecklist.length > 0).length === 0 && (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-league-border rounded-[2.5rem] opacity-20 italic font-black uppercase text-[10px] tracking-widest">No Active Onboarding Sessions</div>
           )}
        </div>
      )}

      {activeSubView === 'Security' && (
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
           <div className="bg-league-panel border-4 border-league-accent p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"></path>
                 </svg>
              </div>
              <h3 className="text-3xl font-black italic uppercase text-white mb-2 tracking-tighter leading-none">Franchise Security Node</h3>
              <p className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-10 italic">Rotate Admin Access Keys for {selectedFranchise}</p>
              
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
                   ) : "Rotate Admin Key"}
                 </button>
              </form>
              <div className="mt-8 pt-8 border-t border-white/5 opacity-40">
                 <p className="text-[8px] font-bold text-league-muted uppercase text-center leading-relaxed tracking-widest">
                   Note: Rotating your key will terminate all other active admin sessions for this franchise node immediately.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, val, color = 'text-white' }: { label: string, val: string, color?: string }) => (
  <div className="text-center group-hover:scale-105 transition-transform">
    <div className="text-[7px] font-black uppercase text-league-muted tracking-widest mb-1 opacity-50">{label}</div>
    <div className={`text-[9px] font-black italic uppercase truncate px-1 ${color}`}>{val}</div>
  </div>
);
