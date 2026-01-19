
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, RecruitingStatus, Role, TalentTier } from '../types';

export const DraftBoard: React.FC = () => {
  const { profiles, updateProfile, runAiRosterStrategy, runMockDraft, addToast } = useApp();
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [poolRole, setPoolRole] = useState<Role>(Role.PLAYER);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [mockDraftResult, setMockDraftResult] = useState<string | null>(null);

  const draftPool = profiles.filter(p => !p.assignedFranchise && p.role === poolRole).sort((a, b) => (b.scoutGrade || 0) - (a.scoutGrade || 0));
  const roster = profiles.filter(p => p.assignedFranchise === selectedFranchise);

  const capStats = useMemo(() => {
    const totalCap = 25000;
    // Simulate tier-based payroll if no actual contract offer exists
    const currentPayroll = roster.reduce((sum, p) => {
        if (p.contractOffer) return sum + p.contractOffer.amount;
        if (p.tier === TalentTier.TIER1) return sum + 2200;
        if (p.tier === TalentTier.TIER2) return sum + 1000;
        return sum + 200;
    }, 0);
    return {
        used: currentPayroll,
        remaining: totalCap - currentPayroll,
        percent: Math.round((currentPayroll / totalCap) * 100)
    };
  }, [roster]);

  const handleAiStrategy = async () => {
    setIsAiLoading(true);
    addToast("Analyzing Operational Unit Density...", "info");
    const insight = await runAiRosterStrategy(selectedFranchise);
    setAiInsight(insight);
    setIsAiLoading(false);
    addToast("Strategic Intelligence Packet Received.", "success");
  };

  const handleRunMockDraft = async () => {
    setIsAiLoading(true);
    addToast("Initializing Neural Mock Engine...", "info");
    const result = await runMockDraft();
    setMockDraftResult(result);
    setIsAiLoading(false);
    addToast("Mock Simulation Commit Complete.", "success");
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Draft Operations</h2>
          <div className="mt-4 flex bg-league-panel p-1.5 rounded-2xl border border-league-border shadow-2xl">
            {Object.values(Franchise).map(f => (
              <button key={f} onClick={() => setSelectedFranchise(f)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-lg' : 'text-league-muted hover:text-white'}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Live Fiscal Telemetry */}
        <div className="bg-league-panel border-2 border-league-border p-5 rounded-[2rem] shadow-2xl flex items-center gap-8 min-w-[350px]">
           <div className="space-y-2 flex-1">
              <div className="flex justify-between text-[8px] font-black uppercase text-league-muted tracking-widest italic">
                 <span>Payroll Density</span>
                 <span className={capStats.percent > 90 ? 'text-league-accent' : 'text-league-ok'}>${capStats.used.toLocaleString()} / 25K</span>
              </div>
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                 <div className={`h-full transition-all duration-700 ${capStats.percent > 90 ? 'bg-league-accent' : 'bg-league-blue'}`} style={{ width: `${capStats.percent}%` }} />
              </div>
           </div>
           <div className="text-right">
              <div className="text-[7px] font-black text-league-muted uppercase mb-0.5">Roster Nodes</div>
              <div className="text-2xl font-black italic text-white leading-none">{roster.length}<span className="text-xs text-white/20">/25</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 flex flex-col shadow-2xl h-[700px]">
           <div className="flex justify-between items-center mb-10 pb-6 border-b border-league-border">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Registry Pool</h3>
              <button onClick={handleRunMockDraft} className="bg-league-bg border border-league-border text-league-muted px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:text-white transition-all">Mock Sim</button>
           </div>
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {draftPool.map(p => (
                <div key={p.id} className="bg-league-bg border border-league-border p-5 rounded-2xl flex items-center justify-between group hover:border-league-accent transition-all shadow-inner">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white border border-white/5 shadow-xl">{p.fullName.charAt(0)}</div>
                    <div>
                       <div className="text-lg font-black italic uppercase text-white leading-none mb-1 group-hover:text-league-accent transition-colors">{p.fullName}</div>
                       <div className="text-[8px] text-league-muted font-bold uppercase mt-1 tracking-widest">{p.positions[0]} • Scoped Grade: {p.scoutGrade}</div>
                    </div>
                  </div>
                  <button onClick={() => updateProfile(p.id, { assignedFranchise: selectedFranchise, status: RecruitingStatus.PLACED })} className="bg-league-accent text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Link Node</button>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 flex flex-col shadow-2xl h-[700px]">
           <div className="flex justify-between items-center mb-10 pb-6 border-b border-league-border">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">{selectedFranchise} Unit</h3>
              <div className="text-[8px] font-black text-league-accent uppercase tracking-widest italic animate-pulse">Encryption: Active</div>
           </div>
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {roster.map(p => (
                <div key={p.id} className="bg-league-bg/50 border border-league-border p-5 rounded-2xl flex items-center justify-between group shadow-inner">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white/40 text-xs border border-white/5">{p.fullName.charAt(0)}</div>
                    <div>
                       <div className="text-lg font-black italic uppercase text-white/60 leading-none mb-1">{p.fullName}</div>
                       <div className="text-[8px] text-league-muted uppercase font-bold mt-1 tracking-widest">Node ID: {p.id}</div>
                    </div>
                  </div>
                  <button onClick={() => updateProfile(p.id, { assignedFranchise: undefined })} className="text-[9px] font-black uppercase text-league-accent/30 hover:text-league-accent transition-colors">Terminate Link</button>
                </div>
              ))}
              {roster.length === 0 && <div className="h-full flex items-center justify-center opacity-10 font-black uppercase tracking-[0.4em] italic">Franchise Node Empty</div>}
           </div>
        </div>
      </div>
    </div>
  );
};
