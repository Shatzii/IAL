
import React, { useState } from 'react';
import { useApp } from '../App';
import { Playbook, LearningModule, SystemRole, Play, Franchise } from '../types';

export const Academy: React.FC = () => {
  const { playbooks, learningModules, currentSystemRole, currentUserProfileId, profiles, selectedFranchise, runTacticalSim } = useApp();
  const [activeTab, setActiveTab] = useState<'Playbooks' | 'Learning' | 'Resources'>('Playbooks');
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const activeProfile = profiles.find(p => p.id === currentUserProfileId);
  const userFranchise = activeProfile?.assignedFranchise || selectedFranchise;

  const visiblePlaybooks = playbooks.filter(pb => {
    if (currentSystemRole === SystemRole.LEAGUE_ADMIN) return true;
    if (!pb.franchise) return true; 
    return pb.franchise === userFranchise;
  });

  const handleSimulate = async (playId: string) => {
    setIsSimulating(true);
    await runTacticalSim(playId);
    setIsSimulating(false);
  };

  const canEdit = currentSystemRole === SystemRole.LEAGUE_ADMIN || currentSystemRole === SystemRole.COACH_STAFF || currentSystemRole === SystemRole.FRANCHISE_GM;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Tactical Academy</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Personnel Strategic Hub • Veo Engine Enabled</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-inner">
          {(['Playbooks', 'Learning', 'Resources'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelectedPlaybook(null); setSelectedPlay(null); }} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Playbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em] px-2 mb-2">Strategy Library</h3>
            <div className="space-y-3">
              {visiblePlaybooks.map(pb => (
                <button key={pb.id} onClick={() => { setSelectedPlaybook(pb); setSelectedPlay(null); }} className={`w-full text-left p-6 rounded-[2rem] border transition-all group ${selectedPlaybook?.id === pb.id ? 'bg-league-accent/10 border-league-accent shadow-[0_0_30px_rgba(228,29,36,0.1)]' : 'bg-league-panel border-league-border hover:border-league-muted'}`}>
                  <div className="flex justify-between items-start mb-3"><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${pb.franchise ? 'bg-league-accent text-white' : 'bg-league-pill text-league-muted'}`}>{pb.franchise || 'Universal'}</span><span className="text-[8px] font-bold text-league-muted uppercase opacity-50">{pb.lastUpdated}</span></div>
                  <h4 className="text-lg font-black italic uppercase text-white group-hover:text-league-accent transition-colors leading-tight">{pb.name}</h4>
                  <div className="mt-4 flex items-center gap-2"><div className="h-1 flex-1 bg-league-bg rounded-full overflow-hidden"><div className="h-full bg-league-accent" style={{ width: '100%' }} /></div><span className="text-[8px] font-black text-league-muted uppercase whitespace-nowrap">{pb.plays.length} Operational Items</span></div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {!selectedPlaybook ? (
              <div className="h-full min-h-[500px] bg-league-panel border border-league-border rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-30 relative overflow-hidden"><svg className="w-20 h-20 mb-6 text-league-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.487V4.513a2 2 0 011.553-1.943l10-2.5a2 2 0 011.447 0l10 2.5A2 2 0 0121 4.513v10.974a2 2 0 01-1.553 1.943L15 20z"></path></svg><h4 className="text-sm font-black italic uppercase tracking-[0.3em]">Awaiting Tactical Selection</h4></div>
            ) : (
              <div className="bg-league-panel border border-league-border rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="p-10 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
                  <div><h3 className="text-3xl font-black italic uppercase text-white leading-none tracking-tighter">{selectedPlaybook.name}</h3><p className="text-[10px] font-black text-league-accent uppercase mt-2 tracking-widest italic opacity-80">Authenticated Personnel Only • Active Material</p></div>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em] mb-4 border-b border-league-border pb-2">Schematic Index</h5>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                      {selectedPlaybook.plays.map(play => (
                        <button key={play.id} onClick={() => setSelectedPlay(play)} className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${selectedPlay?.id === play.id ? 'bg-league-bg border-league-accent shadow-lg' : 'bg-league-bg/30 border-league-border hover:border-league-muted'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedPlay?.id === play.id ? 'bg-league-accent text-white' : 'bg-league-panel text-league-muted'}`}>{play.category.charAt(0)}</div>
                          <div><div className="text-xs font-black uppercase italic text-white group-hover:text-league-accent transition-colors">{play.name}</div><div className="text-[8px] font-black text-league-muted uppercase tracking-widest mt-0.5">{play.formation}</div></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-league-bg border border-league-border rounded-[2.5rem] p-8 min-h-[400px] flex flex-col relative overflow-hidden">
                    {selectedPlay ? (
                      <div className="animate-in fade-in slide-in-from-right-4 z-10">
                        <div className="flex justify-between items-start mb-8">
                           <div><h4 className="text-2xl font-black italic uppercase text-league-accent leading-none tracking-tighter">{selectedPlay.name}</h4><p className="text-[8px] font-black text-league-muted uppercase mt-1 tracking-widest">Formation: {selectedPlay.formation}</p></div>
                           <button onClick={() => handleSimulate(selectedPlay.id)} disabled={isSimulating} className="bg-league-accent text-white px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest disabled:opacity-30">{isSimulating ? 'Rendering...' : 'Launch Veo Simulation'}</button>
                        </div>
                        <div className="aspect-[4/3] bg-black rounded-[2rem] mb-8 border border-league-border flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
                           {isSimulating ? (
                             <div className="text-center animate-pulse"><div className="w-12 h-12 border-4 border-league-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-[10px] font-black uppercase text-white tracking-widest">Generating 3D Tactical Mesh...</p></div>
                           ) : (
                             <div className="text-center px-10"><svg className="w-16 h-16 mx-auto mb-4 text-league-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-9.701-8.318M12 3a10.003 10.003 0 019.701 8.318M12 3v18m-6-10h12m-6 0a10.003 10.003 0 01-9.701-8.318m19.402 0A10.003 10.003 0 0112 11z"></path></svg><span className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em] block">Encrypted Schematic Diagram</span></div>
                           )}
                        </div>
                        <div className="space-y-6"><div className="flex items-center gap-2"><div className="h-0.5 w-6 bg-league-accent" /><h6 className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em]">Coaching Directive</h6></div><p className="text-sm text-white/90 leading-relaxed font-bold italic border-l-2 border-league-accent pl-4">{selectedPlay.description}</p></div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-10"><svg className="w-16 h-16 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path></svg><span className="text-[11px] font-black uppercase tracking-[0.4em]">Select Schematic Index Item</span></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
