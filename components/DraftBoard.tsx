import React, { useState } from 'react';
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
        <div><h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Draft Operations</h2><p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">Registry Hub Phase 2.5 Active • Node Distribution</p></div>
        <div className="flex flex-wrap gap-4 items-center">
          <button onClick={handleRunMockDraft} disabled={isAiLoading} className="bg-league-panel border border-league-accent/30 text-league-accent px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-league-accent hover:text-white transition-all disabled:opacity-50">Mock Draft Sim</button>
          <button onClick={handleAiStrategy} disabled={isAiLoading} className="bg-league-accent/10 border border-league-accent/50 text-league-accent px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-league-accent hover:text-white transition-all disabled:opacity-50">Strategic Gap Index</button>
          <div className="flex flex-wrap gap-2 bg-league-panel p-1 rounded-xl border border-league-border shadow-2xl">
            {Object.values(Franchise).map(f => <button key={f} onClick={() => setSelectedFranchise(f)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-lg' : 'text-league-muted hover:text-white'}`}>{f}</button>)}
          </div>
        </div>
      </div>

      {(aiInsight || mockDraftResult) && (
        <div className="bg-league-panel border-4 border-league-accent p-10 rounded-[3.5rem] animate-in zoom-in-95 relative shadow-[0_0_100px_rgba(228,29,36,0.1)] overflow-hidden">
          <button onClick={() => { setAiInsight(null); setMockDraftResult(null); }} className="absolute top-10 right-10 text-league-muted hover:text-white text-4xl font-black hover:scale-110 transition-transform">×</button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="lg:col-span-2 space-y-8"><h4 className="text-[14px] font-black uppercase tracking-widest text-league-accent italic border-l-4 border-league-accent pl-6">{mockDraftResult ? 'DRAFT_MOCK_PROJECTION_v2.7' : `GAP_REPORT: ${selectedFranchise.toUpperCase()}_NODE`}</h4><p className="text-lg text-white/90 leading-relaxed font-bold italic whitespace-pre-wrap pl-2">{mockDraftResult || aiInsight}</p></div>
             {!mockDraftResult && (
               <div className="bg-league-bg border border-league-border rounded-3xl p-10 space-y-10 shadow-inner">
                  <h5 className="text-[12px] font-black uppercase text-white tracking-[0.4em] mb-4 text-center">Operational Readiness</h5>
                  <GapProgress label="Secondary Defense" val={42} color="bg-league-accent" />
                  <GapProgress label="Interior Wall" val={78} color="bg-league-blue" />
                  <GapProgress label="Motion Skill Group" val={25} color="bg-league-accent" />
                  <div className="pt-8 border-t border-white/5"><p className="text-[9px] font-bold text-league-muted uppercase italic opacity-40 leading-relaxed text-center">Neural Directive: Strategic acquisition of T1 DB personnel required to stabilize node health.</p></div>
               </div>
             )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 flex flex-col shadow-2xl h-[750px]">
           <div className="flex justify-between items-center mb-10 pb-6 border-b border-league-border"><h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Induction Pool</h3><div className="text-[10px] font-black text-league-accent uppercase tracking-widest italic">{draftPool.length} Eligible</div></div>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {draftPool.map(p => (
                <div key={p.id} className="bg-league-bg border border-league-border p-6 rounded-2xl flex items-center justify-between group hover:border-league-accent transition-all shadow-inner">
                  <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white border border-white/5 shadow-xl">{p.fullName.charAt(0)}</div><div><div className="text-lg font-black italic uppercase text-white leading-none mb-1">{p.fullName}</div><div className="text-[9px] text-league-muted font-bold uppercase mt-1 tracking-widest">{p.positions[0]} • Grade: {p.scoutGrade}</div></div></div>
                  <button onClick={() => updateProfile(p.id, { assignedFranchise: selectedFranchise, status: RecruitingStatus.PLACED })} className="bg-league-accent text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Draft Node</button>
                </div>
              ))}
              {draftPool.length === 0 && <div className="h-full flex items-center justify-center opacity-10 font-black uppercase tracking-[0.4em] italic">Pool Depleted</div>}
           </div>
        </div>
        <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 flex flex-col shadow-2xl h-[750px]">
           <div className="flex justify-between items-center mb-10 pb-6 border-b border-league-border"><h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">{selectedFranchise} Linked Unit</h3><div className="text-[10px] font-black text-league-muted uppercase tracking-widest italic">{roster.length} Personnel</div></div>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {roster.map(p => (
                <div key={p.id} className="bg-league-bg/50 border border-league-border p-6 rounded-2xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-6"><div className="w-10 h-10 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-league-muted text-xs shadow-inner">{p.fullName.charAt(0)}</div><div><div className="text-lg font-black italic uppercase text-white/60 leading-none mb-1">{p.fullName}</div><div className="text-[9px] text-league-muted uppercase font-bold mt-1 tracking-widest">{p.positions[0]}</div></div></div>
                  <button onClick={() => updateProfile(p.id, { assignedFranchise: undefined })} className="text-[9px] font-black uppercase text-league-accent/40 hover:text-league-accent transition-colors hover:scale-110">Unlink Node</button>
                </div>
              ))}
              {roster.length === 0 && <div className="h-full flex items-center justify-center opacity-10 font-black uppercase tracking-[0.4em] italic">Registry Node Empty</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

const GapProgress = ({ label, val, color }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/70 italic"><span>{label}</span><span>{val}% Readiness</span></div>
     <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5 shadow-inner"><div className={`h-full ${color} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`} style={{ width: `${val}%` }} /></div>
  </div>
);