
import React, { useState } from 'react';
import { useApp } from '../App';
import { Franchise, RecruitingStatus, Role, TalentTier, FRANCHISE_TEAMS } from '../types';

export const DraftBoard: React.FC = () => {
  const { profiles, updateProfile, runAiRosterStrategy, runMockDraft, addToast } = useApp();
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [poolRole, setPoolRole] = useState<Role>(Role.PLAYER);
  const [poolTier, setPoolTier] = useState<TalentTier | 'ALL'>('ALL');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mockDraftResult, setMockDraftResult] = useState<string | null>(null);

  const draftPool = profiles.filter(p => 
    !p.assignedFranchise && p.role === poolRole && (poolTier === 'ALL' || p.tier === poolTier)
  ).sort((a, b) => (b.scoutGrade || 0) - (a.scoutGrade || 0));

  const roster = profiles.filter(p => p.assignedFranchise === selectedFranchise);

  const handleAiStrategy = async () => {
    setIsAiLoading(true);
    const insight = await runAiRosterStrategy(selectedFranchise);
    setAiInsight(insight);
    setIsAiLoading(false);
    addToast('Strategic Insight Received', 'success');
  };

  const handleRunMockDraft = async () => {
    setIsSimulating(true);
    addToast("Initializing Draft Mock Engine...", "info");
    const result = await runMockDraft();
    setMockDraftResult(result);
    setIsSimulating(false);
  };

  const handleConfirmAssignment = (id: string) => {
    updateProfile(id, { 
      assignedFranchise: selectedFranchise, 
      assignedTeam: selectedTeam || FRANCHISE_TEAMS[selectedFranchise][0],
      status: RecruitingStatus.PLACED
    });
    setAssigningId(null);
    addToast(`Personnel node linked to ${selectedFranchise}`, 'success');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Draft Operations</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">Registry Distribution Hub • Phase 2.5 Active</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={handleRunMockDraft}
            disabled={isSimulating}
            className="bg-league-panel border border-league-accent/30 text-league-accent px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-league-accent hover:text-white transition-all disabled:opacity-50"
          >
            {isSimulating ? 'Simulating Phase...' : 'Run AI Mock Simulator'}
          </button>
          <button 
            onClick={handleAiStrategy}
            disabled={isAiLoading}
            className="flex items-center gap-2 bg-league-accent/10 border border-league-accent/30 text-league-accent px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-league-accent hover:text-white transition-all disabled:opacity-50"
          >
            {isAiLoading ? 'Analyzing Gaps...' : 'AI Strategic Assistant'}
          </button>
          <div className="flex flex-wrap gap-2 bg-league-panel p-1 rounded-xl border border-league-border">
            {Object.values(Franchise).map(f => (
              <button 
                key={f} onClick={() => setSelectedFranchise(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-lg' : 'text-league-muted hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(aiInsight || mockDraftResult) && (
        <div className="bg-league-panel border-4 border-league-accent p-8 rounded-[3rem] animate-in fade-in zoom-in-95 relative group shadow-2xl">
          <button onClick={() => { setAiInsight(null); setMockDraftResult(null); }} className="absolute top-6 right-6 text-league-muted hover:text-white text-2xl font-black">×</button>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-6 bg-league-accent rounded-full animate-pulse" />
             <h4 className="text-[10px] font-black uppercase tracking-widest text-league-accent italic">
               {mockDraftResult ? 'Draft Intelligence Report' : 'AI Strategic Directive'}
             </h4>
          </div>
          <div className="text-sm text-white/90 leading-relaxed font-bold italic pl-4 border-l-2 border-league-accent/30 whitespace-pre-wrap">
            {mockDraftResult || aiInsight}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recruitment Pool */}
        <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 flex flex-col shadow-2xl h-[700px]">
           <div className="flex justify-between items-center mb-8 pb-6 border-b border-league-border">
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Draft Pool</h3>
              <div className="flex gap-2">
                 <select className="bg-league-bg border border-league-border p-2 rounded-lg text-[9px] font-black uppercase text-white outline-none" value={poolTier} onChange={e => setPoolTier(e.target.value as any)}>
                    <option value="ALL">All Tiers</option>{Object.values(TalentTier).map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {draftPool.map(p => (
                <div key={p.id} className="bg-league-bg border border-league-border p-6 rounded-2xl flex items-center justify-between group hover:border-league-accent transition-all shadow-inner">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white border border-white/5">{p.fullName.charAt(0)}</div>
                     <div>
                        <div className="text-sm font-black italic uppercase text-white leading-none mb-1">{p.fullName}</div>
                        <div className="flex gap-2 items-center"><span className="text-[8px] font-black text-league-accent uppercase">{p.positions[0]}</span><span className="text-[8px] text-league-muted font-bold uppercase">Grade: {p.scoutGrade}</span></div>
                     </div>
                  </div>
                  <button onClick={() => setAssigningId(p.id)} className="bg-league-accent text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all">Draft Node</button>
                </div>
              ))}
              {draftPool.length === 0 && <div className="h-full flex items-center justify-center opacity-20 italic font-black uppercase text-[11px] tracking-[0.3em]">Pool Depleted</div>}
           </div>
        </div>

        {/* Selected Franchise Roster */}
        <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 flex flex-col shadow-2xl h-[700px]">
           <div className="flex justify-between items-center mb-8 pb-6 border-b border-league-border">
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">{selectedFranchise} Node</h3>
              <div className="text-[10px] font-black text-league-accent uppercase tracking-widest italic">{roster.length} Personnel Linked</div>
           </div>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {roster.map(p => (
                <div key={p.id} className="bg-league-bg/50 border border-league-border p-6 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-league-muted text-xs">{p.fullName.charAt(0)}</div>
                     <div><div className="text-[13px] font-black italic uppercase text-white/60">{p.fullName}</div><div className="text-[8px] text-league-muted uppercase font-bold">{p.assignedTeam} • {p.positions[0]}</div></div>
                  </div>
                  <button onClick={() => updateProfile(p.id, { assignedFranchise: undefined })} className="text-[9px] font-black uppercase text-league-accent/40 hover:text-league-accent transition-colors">Unlink</button>
                </div>
              ))}
              {roster.length === 0 && <div className="h-full flex items-center justify-center opacity-20 italic font-black uppercase text-[11px] tracking-[0.3em]">Registry Node Empty</div>}
           </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {assigningId && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-league-panel border-4 border-league-accent max-w-md w-full rounded-[3rem] p-10 shadow-[0_0_100px_rgba(228,29,36,0.3)] animate-in zoom-in-95">
              <h4 className="text-3xl font-black italic uppercase text-white mb-2 tracking-tighter text-center">Confirm Draft Selection</h4>
              <p className="text-[10px] font-black text-league-muted uppercase tracking-[0.3em] mb-10 text-center italic">Link Personnel to {selectedFranchise} Node</p>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-league-accent tracking-widest italic">Target Team</label>
                    <select className="w-full bg-league-bg border-2 border-league-border p-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs outline-none focus:border-league-accent transition-all" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                       <option value="">Select Operational Team</option>
                       {FRANCHISE_TEAMS[selectedFranchise].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
                 
                 <div className="pt-6 grid grid-cols-2 gap-4">
                    <button onClick={() => setAssigningId(null)} className="bg-league-bg border border-league-border text-league-muted py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                    <button onClick={() => handleConfirmAssignment(assigningId)} className="bg-league-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:brightness-125 transition-all">Confirm Selection</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
