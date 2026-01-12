
import React, { useState } from 'react';
import { useApp } from '../App';
import { Playbook, LearningModule, Play, PlayAssignment } from '../types';

export const Academy: React.FC = () => {
  const { playbooks, learningModules, runTacticalSim } = useApp();
  const [activeTab, setActiveTab] = useState<'Playbooks' | 'Learning'>('Playbooks');
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [walkthroughPos, setWalkthroughPos] = useState<string | null>(null);

  const handleSimulate = async (playId: string) => {
    setIsSimulating(true);
    await runTacticalSim(playId);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Tactical Academy</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Strategic Command Training Hub</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl">
          {(['Playbooks', 'Learning'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Playbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {playbooks.map(pb => (
              <button key={pb.id} onClick={() => setSelectedPlaybook(pb)} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${selectedPlaybook?.id === pb.id ? 'bg-league-accent/10 border-league-accent' : 'bg-league-panel border-league-border'}`}>
                <h4 className="text-lg font-black italic uppercase text-white leading-tight">{pb.name}</h4>
                <p className="text-[8px] font-black text-league-muted uppercase mt-3 tracking-widest">{pb.plays.length} Operational Items</p>
              </button>
            ))}
          </div>
          <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] p-10 shadow-2xl min-h-[600px]">
            {selectedPlaybook ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
                    <div className="space-y-4">
                        <h3 className="text-xl font-black italic uppercase text-white mb-6 border-b border-league-border pb-4">{selectedPlaybook.name} Index</h3>
                        {selectedPlaybook.plays.map(play => (
                            <button key={play.id} onClick={() => { setSelectedPlay(play); setWalkthroughPos(null); }} className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${selectedPlay?.id === play.id ? 'bg-league-bg border-league-accent' : 'bg-league-bg/30 border-league-border'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedPlay?.id === play.id ? 'bg-league-accent text-white' : 'bg-league-panel text-league-muted'}`}>{play.category.charAt(0)}</div>
                                <div className="text-xs font-black uppercase italic text-white">{play.name}</div>
                            </button>
                        ))}
                    </div>
                    <div className="bg-league-bg border border-league-border rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
                        {selectedPlay ? (
                            <div className="space-y-6 flex-1 flex flex-col">
                                <h4 className="text-2xl font-black italic uppercase text-league-accent">{selectedPlay.name}</h4>
                                <div className="aspect-video bg-black rounded-2xl border border-league-border flex items-center justify-center relative group">
                                    {isSimulating ? <div className="animate-pulse font-black text-[10px] text-white uppercase">Calculating Vectors...</div> : <div className="text-[8px] text-league-muted uppercase font-black tracking-widest">Tactical Mesh Offline</div>}
                                    {walkthroughPos && (
                                        <div className="absolute inset-0 bg-league-accent/10 flex items-center justify-center animate-in zoom-in-50">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-league-accent text-white rounded-full flex items-center justify-center font-black italic mx-auto mb-4 border-2 border-white shadow-xl">{walkthroughPos}</div>
                                                <div className="text-[10px] font-black uppercase text-white tracking-widest">ASSIGNED_VECTOR_SYNC</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {selectedPlay.assignments?.map(a => (
                                        <button key={a.position} onClick={() => setWalkthroughPos(a.position)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${walkthroughPos === a.position ? 'bg-white text-black' : 'bg-league-panel border-league-border text-league-muted'}`}>{a.position}</button>
                                    ))}
                                </div>
                                <p className="text-xs text-white/80 italic leading-relaxed">{walkthroughPos ? selectedPlay.assignments?.find(a => a.position === walkthroughPos)?.objective : selectedPlay.description}</p>
                                <button onClick={() => handleSimulate(selectedPlay.id)} className="mt-auto w-full bg-league-accent text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Initialize Sim Node</button>
                            </div>
                        ) : <div className="flex-1 flex items-center justify-center opacity-10 font-black text-sm uppercase tracking-widest">Select Strategy Node</div>}
                    </div>
                </div>
            ) : <div className="flex-1 flex items-center justify-center opacity-20 font-black text-sm uppercase tracking-widest">Choose Tactical Source</div>}
          </div>
        </div>
      )}
    </div>
  );
};
