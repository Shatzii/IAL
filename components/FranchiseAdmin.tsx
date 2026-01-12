
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, Profile, TalentTier, Role, RecruitingStatus, ContractStatus } from '../types';

export const FranchiseAdmin: React.FC = () => {
  const { profiles, selectedFranchise, setSelectedFranchise, proposeContract, addToast, updateProfile, calculateRosterHealth } = useApp();
  const roster = profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER);
  const health = useMemo(() => calculateRosterHealth(selectedFranchise), [roster, selectedFranchise]);

  const payrollStats = useMemo(() => {
    const totalCap = 25000;
    const currentPayroll = roster.reduce((sum, p) => sum + (p.contractOffer?.amount || 0), 0);
    const utilization = Math.round((currentPayroll / totalCap) * 100);
    return { currentPayroll, utilization, remaining: totalCap - currentPayroll, rosterCount: roster.length };
  }, [roster]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Franchise Desk</h2>
          <p className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em] mt-2 italic opacity-60">Focal Node: {selectedFranchise}</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-league-panel p-1.5 rounded-2xl border border-league-border shadow-2xl">
          {Object.values(Franchise).map(f => (
            <button key={f} onClick={() => setSelectedFranchise(f)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-xl' : 'text-league-muted hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
           {/* Structural Integrity Widget */}
           <div className="bg-league-panel border-4 border-league-accent p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 font-black text-2xl uppercase">STRUCTURAL_SCAN</div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Unit Integrity</h3>
                <span className={`text-2xl font-black italic ${health.integrityScore < 70 ? 'text-league-accent' : 'text-league-ok'}`}>
                    {health.integrityScore}%
                </span>
              </div>
              <div className="h-2 w-full bg-league-bg rounded-full overflow-hidden border border-white/5 mb-8">
                 <div className={`h-full transition-all duration-1000 ${health.integrityScore < 70 ? 'bg-league-accent' : 'bg-league-ok'}`} style={{ width: `${health.integrityScore}%` }} />
              </div>
              
              <div className="space-y-4">
                 {health.gaps.map((gap, i) => (
                    <div key={i} className="flex gap-3 items-start animate-in slide-in-from-left-4">
                       <div className="w-1.5 h-1.5 rounded-full bg-league-accent mt-1 animate-pulse shadow-[0_0_8px_#e41d24]" />
                       <span className="text-[10px] font-bold text-league-accent uppercase tracking-widest">{gap}</span>
                    </div>
                 ))}
                 {health.gaps.length === 0 && (
                    <p className="text-[10px] font-bold text-league-ok uppercase tracking-widest">Roster Nodes Synchronized.</p>
                 )}
              </div>
           </div>

           <div className="bg-league-panel border border-league-border p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em] mb-6 italic">Fiscal Efficiency</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black text-league-muted uppercase">Payroll Cap</span>
                    <span className="text-xl font-black italic text-white">${payrollStats.currentPayroll.toLocaleString()} / 25k</span>
                </div>
                <div className="h-1.5 w-full bg-league-bg rounded-full overflow-hidden">
                    <div className="h-full bg-league-blue transition-all" style={{ width: `${payrollStats.utilization}%` }} />
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none">Roster Status</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-league-tableHeader/50 border-b border-league-border">
              <tr className="text-[8px] font-black uppercase tracking-[0.4em] text-league-muted">
                  <th className="px-10 py-5">Personnel</th>
                  <th className="px-10 py-5">Efficiency (IC)</th>
                  <th className="px-10 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-league-border">
              {roster.map(p => (
                <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-white">
                          {p.fullName.charAt(0)}
                       </div>
                       <div>
                          <div className="text-[13px] font-black italic uppercase text-white tracking-tighter">{p.fullName}</div>
                          <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{p.positions.join('/')}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <span className={`text-[11px] font-black italic ${p.ironmanCoefficient && p.ironmanCoefficient > 0.7 ? 'text-league-ok' : 'text-white'}`}>
                        {p.ironmanCoefficient ? (p.ironmanCoefficient * 100).toFixed(0) : '--'}%
                     </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                     <button 
                       onClick={() => updateProfile(p.id, { assignedFranchise: undefined })}
                       className="text-[9px] font-black uppercase tracking-widest text-league-accent opacity-40 hover:opacity-100 transition-opacity"
                     >
                       Unlink Node
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
