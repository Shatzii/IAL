
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, Profile, TalentTier, Role, RecruitingStatus, ContractStatus } from '../types';

export const FranchiseAdmin: React.FC = () => {
  const { profiles, selectedFranchise, setSelectedFranchise, proposeContract, addToast } = useApp();
  const [activeSubView, setActiveSubView] = useState<'Roster' | 'Draft Pipeline' | 'Contract Lab'>('Roster');
  
  // Proposal Modal State
  const [isProposing, setIsProposing] = useState<Profile | null>(null);
  const [proposalAmount, setProposalAmount] = useState(1000);
  const [proposalNotes, setProposalNotes] = useState('');

  const roster = profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER);
  const pipeline = profiles.filter(p => !p.assignedFranchise && p.role === Role.PLAYER);

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProposing) return;
    proposeContract(isProposing.id, proposalAmount, proposalNotes);
    setIsProposing(null);
    setProposalAmount(1000);
    setProposalNotes('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Franchise Desk</h2>
          <p className="text-[11px] font-black uppercase text-league-muted tracking-[0.3em] mt-1">{selectedFranchise} Command Console</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-league-panel p-1.5 rounded-2xl border border-league-border shadow-inner">
          {Object.values(Franchise).map(f => (
            <button key={f} onClick={() => setSelectedFranchise(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-xl' : 'text-league-muted hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-8 border-b border-league-border pb-6 overflow-x-auto no-scrollbar">
        {['Roster', 'Draft Pipeline', 'Contract Lab'].map((view: any) => (
          <button key={view} onClick={() => setActiveSubView(view)} className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap ${activeSubView === view ? 'text-white' : 'text-league-muted hover:text-white'}`}>
            {view}
            {activeSubView === view && <div className="absolute -bottom-6 left-0 right-0 h-1 bg-league-accent shadow-[0_0_10px_#e41d24]" />}
          </button>
        ))}
      </div>

      {activeSubView === 'Roster' && (
        <div className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-league-tableHeader border-b border-league-border">
              <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-league-muted"><th className="px-10 py-6">Athlete Node</th><th className="px-10 py-6">Tier</th><th className="px-10 py-6">Status</th><th className="px-10 py-6 text-right">Contract</th></tr>
            </thead>
            <tbody className="divide-y divide-league-border">
              {roster.map(p => (
                <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-white shadow-inner overflow-hidden">
                          {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.fullName.charAt(0)}
                       </div>
                       <div>
                          <div className="text-[13px] font-black italic uppercase text-white tracking-tighter">{p.fullName}</div>
                          <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{p.positions.join('/')}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6"><span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${p.tier === TalentTier.TIER1 ? 'bg-league-accent text-white border-league-accent' : 'bg-league-pill text-league-muted border-league-border'}`}>{p.tier.split(' ')[0]}</span></td>
                  <td className="px-10 py-6 text-[10px] font-black text-white/50 uppercase tracking-widest italic">{p.status}</td>
                  <td className="px-10 py-6 text-right">
                     {p.contractOffer ? (
                        <div className="flex flex-col items-end">
                           <span className="text-[11px] font-black italic text-white leading-none">${p.contractOffer.amount.toLocaleString()}</span>
                           <span className="text-[7px] font-black uppercase text-league-accent mt-1 tracking-widest">{p.contractOffer.status}</span>
                        </div>
                     ) : (
                        <button onClick={() => setIsProposing(p)} className="text-[9px] font-black uppercase tracking-widest text-league-blue hover:underline">Propose Terms</button>
                     )}
                  </td>
                </tr>
              ))}
              {roster.length === 0 && <tr><td colSpan={4} className="px-10 py-20 text-center text-league-muted uppercase font-black italic tracking-widest opacity-20 italic">No Active Personnel in Node</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeSubView === 'Draft Pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {pipeline.map(p => (
             <div key={p.id} className="bg-league-panel border border-league-border p-6 rounded-[2rem] shadow-xl group hover:border-league-blue transition-all">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white shadow-inner overflow-hidden">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.fullName.charAt(0)}
                   </div>
                   <div className="flex-1">
                      <h4 className="text-xl font-black italic uppercase text-white leading-none tracking-tighter group-hover:text-league-blue transition-colors">{p.fullName}</h4>
                      <p className="text-[9px] font-black text-league-muted uppercase mt-1 tracking-widest">{p.positions[0]} • Grade: {p.scoutGrade || '--'}</p>
                   </div>
                </div>
                <button onClick={() => setIsProposing(p)} className="w-full bg-league-bg border border-league-border text-league-muted py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-league-blue hover:text-white hover:border-league-blue transition-all shadow-lg">Initiate Offer Protocol</button>
             </div>
           ))}
        </div>
      )}

      {/* Propose Contract Modal */}
      {isProposing && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-league-panel border-4 border-league-blue max-w-lg w-full rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
              <form onSubmit={handleProposalSubmit} className="p-10 md:p-12 space-y-8">
                 <div className="flex justify-between items-center border-b border-league-border pb-6">
                    <div>
                       <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Proposal Hub</h3>
                       <p className="text-[9px] font-black uppercase text-league-blue tracking-[0.4em] mt-2 italic">Requires Executive Handshake</p>
                    </div>
                    <button type="button" onClick={() => setIsProposing(null)} className="text-league-muted hover:text-white text-3xl font-black transition-all">×</button>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="p-6 bg-league-bg rounded-2xl border border-league-border flex items-center gap-4 shadow-inner">
                       <div className="w-12 h-12 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white border border-white/5">{isProposing.fullName.charAt(0)}</div>
                       <div><div className="text-lg font-black italic uppercase text-white leading-none">{isProposing.fullName}</div><div className="text-[8px] font-black text-league-muted uppercase tracking-widest mt-1">Registry Node: {isProposing.id}</div></div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-league-muted tracking-widest px-2">Proposed Game Check (USD)</label>
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black italic text-league-blue">$</span>
                          <input 
                            required
                            type="number"
                            className="w-full bg-league-bg border border-league-border p-6 pl-14 rounded-2xl text-4xl font-black italic text-white outline-none focus:border-league-blue transition-all shadow-inner"
                            value={proposalAmount}
                            onChange={e => setProposalAmount(parseInt(e.target.value))}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-league-muted tracking-widest px-2">Proposal Context / Rationale</label>
                       <textarea 
                         className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white outline-none focus:border-league-blue font-bold h-24"
                         placeholder="Explain why this node requires this specific fiscal allocation..."
                         value={proposalNotes}
                         onChange={e => setProposalNotes(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setIsProposing(null)} className="flex-1 bg-league-bg border border-league-border text-league-muted py-4 rounded-xl font-black uppercase tracking-widest hover:text-white transition-all">Abort Proposal</button>
                    <button type="submit" className="flex-1 bg-league-blue text-white py-4 rounded-xl font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(64,169,255,0.3)] hover:scale-[1.02] transition-transform">Transmit to Vault</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
