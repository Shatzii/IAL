import React, { useState } from 'react';
import { useApp } from '../App';
import { Playbook, LearningModule, SystemRole, Play, Franchise } from '../types';

export const Academy: React.FC = () => {
  const { playbooks, learningModules, currentSystemRole, selectedFranchise, runTacticalSim } = useApp();
  const [activeTab, setActiveTab] = useState<'Playbooks' | 'Learning'>('Playbooks');
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Extend initial modules with specific training content
  const extendedModules: LearningModule[] = [
    ...learningModules,
    {
       id: 'lm-ironman',
       title: 'Ironman Substitution Logic',
       description: 'Mastering the 20-second personnel switch and high-speed arena transitions.',
       category: 'Tactical',
       lessons: [
         { id: 'l1', title: 'The Substitution Box Protocol', durationMins: 15 },
         { id: 'l2', title: 'Fatigue Management in 50-Yard Nodes', durationMins: 10 },
         { id: 'l3', title: 'Offense-to-Defense Skill Carryover', durationMins: 20 }
       ]
    },
    {
       id: 'lm-media',
       title: 'Professionalism & Media 1.0',
       description: 'IAL standard briefing for global personnel engagement and node press protocols.',
       category: 'Compliance',
       lessons: [
         { id: 'l4', title: 'Social Node Ethics', durationMins: 12 },
         { id: 'l5', title: 'Global Brand Representation', durationMins: 15 },
         { id: 'l6', title: 'Official Press Handshake', durationMins: 8 }
       ]
    }
  ];

  const handleSimulate = async (playId: string) => {
    setIsSimulating(true);
    await runTacticalSim(playId);
    setIsSimulating(false);
  };

  const currentLesson = selectedModule?.lessons.find(l => l.id === selectedLessonId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Tactical Academy</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Strategic Command Training Hub • Node Restricted</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl">
          {(['Playbooks', 'Learning'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelectedModule(null); setSelectedLessonId(null); }} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Playbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
          <div className="lg:col-span-4 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {playbooks.map(pb => (
              <button key={pb.id} onClick={() => { setSelectedPlaybook(pb); setSelectedPlay(null); }} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${selectedPlaybook?.id === pb.id ? 'bg-league-accent/10 border-league-accent shadow-2xl' : 'bg-league-panel border-league-border hover:border-league-muted'}`}>
                <div className="flex justify-between items-start mb-2"><span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-league-pill border border-league-border text-league-muted">{pb.franchise || 'Global'}</span></div>
                <h4 className="text-lg font-black italic uppercase text-white leading-tight group-hover:text-league-accent transition-colors">{pb.name}</h4>
                <p className="text-[8px] font-black text-league-muted uppercase mt-3 tracking-widest">{pb.plays.length} Operational Items • Sync: {pb.lastUpdated}</p>
              </button>
            ))}
            {playbooks.length === 0 && <div className="p-12 border-2 border-dashed border-league-border rounded-[2rem] text-center opacity-30 text-[9px] font-black uppercase tracking-widest italic">Awaiting Strategy Packet Drop</div>}
          </div>
          <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
            {!selectedPlaybook ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20"><svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-9.701-8.318M12 3a10.003 10.003 0 019.701 8.318M12 3v18m-6-10h12m-6 0a10.003 10.003 0 01-9.701-8.318m19.402 0A10.003 10.003 0 0112 11z" strokeWidth="2"></path></svg><p className="text-sm font-black uppercase tracking-[0.4em]">Select Tactical Source</p></div>
            ) : (
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 h-full animate-in fade-in">
                <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                   <h3 className="text-2xl font-black italic uppercase text-white mb-6 border-b border-league-border pb-4">{selectedPlaybook.name} Index</h3>
                   {selectedPlaybook.plays.map(play => (
                     <button key={play.id} onClick={() => setSelectedPlay(play)} className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${selectedPlay?.id === play.id ? 'bg-league-bg border-league-accent shadow-lg' : 'bg-league-bg/30 border-league-border hover:border-league-muted shadow-inner'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedPlay?.id === play.id ? 'bg-league-accent text-white' : 'bg-league-panel text-league-muted'}`}>{play.category.charAt(0)}</div>
                        <div><div className="text-xs font-black uppercase italic text-white leading-none">{play.name}</div><div className="text-[8px] font-black text-league-muted uppercase tracking-widest mt-1">{play.formation}</div></div>
                     </button>
                   ))}
                </div>
                <div className="bg-league-bg border border-league-border rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden shadow-inner">
                   {selectedPlay ? (
                     <div className="animate-in slide-in-from-right-4 h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-10"><div><h4 className="text-2xl font-black italic uppercase text-league-accent leading-none tracking-tighter">{selectedPlay.name}</h4><p className="text-[9px] font-black text-league-muted uppercase mt-2 tracking-widest">Formation Cluster: {selectedPlay.formation}</p></div></div>
                        <div className="aspect-video bg-black rounded-[2rem] border border-league-border flex flex-col items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
                           {isSimulating ? <div className="text-center animate-pulse"><div className="w-12 h-12 border-4 border-league-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-[10px] font-black uppercase text-white tracking-widest">Generating Tactical Mesh...</p></div> : <div className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em] opacity-30 italic">Strategy Visualization Offline</div>}
                           <div className="absolute inset-0 bg-league-accent/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed font-bold italic border-l-2 border-league-accent pl-4 mt-auto mb-8">{selectedPlay.description}</p>
                        <button onClick={() => handleSimulate(selectedPlay.id)} className="w-full bg-league-accent text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">Initialize Simulation Node</button>
                     </div>
                   ) : <div className="flex-1 flex items-center justify-center opacity-10 font-black uppercase tracking-[0.2em]">Select Strategy Item</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[650px]">
           <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {extendedModules.map(module => (
                <button key={module.id} onClick={() => { setSelectedModule(module); setSelectedLessonId(null); }} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${selectedModule?.id === module.id ? 'bg-league-accent/10 border-league-accent shadow-2xl' : 'bg-league-panel border-league-border hover:border-league-muted'}`}>
                   <div className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-league-blue text-white mb-3 inline-block shadow-sm">{module.category}</div>
                   <h4 className="text-lg font-black italic uppercase text-white leading-tight mb-2">{module.title}</h4>
                   <p className="text-[10px] font-bold text-league-muted uppercase tracking-widest italic line-clamp-2 opacity-60">{module.description}</p>
                </button>
              ))}
           </div>
           <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] p-10 flex flex-col shadow-2xl relative overflow-hidden">
              {selectedModule ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full animate-in fade-in">
                   <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                      <h3 className="text-3xl font-black italic uppercase text-white mb-8 border-b border-league-border pb-4 leading-none tracking-tighter">{selectedModule.title}</h3>
                      {selectedModule.lessons.map(lesson => (
                        <button key={lesson.id} onClick={() => setSelectedLessonId(lesson.id)} className={`w-full text-left p-5 rounded-xl border transition-all flex justify-between items-center ${selectedLessonId === lesson.id ? 'bg-league-bg border-league-accent shadow-lg' : 'bg-league-bg/30 border-league-border hover:border-league-muted'}`}>
                           <span className="text-xs font-black uppercase italic text-white">{lesson.title}</span>
                           <span className="text-[8px] font-black text-league-muted uppercase tracking-widest">{lesson.durationMins}m</span>
                        </button>
                      ))}
                   </div>
                   <div className="bg-league-bg border border-league-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
                      {currentLesson ? (
                        <div className="animate-in zoom-in-95 relative z-10">
                           <div className="w-24 h-24 bg-league-accent/20 rounded-full flex items-center justify-center mb-10 mx-auto border-2 border-league-accent/50 animate-pulse shadow-[0_0_40px_rgba(228,29,36,0.2)]"><svg className="w-12 h-12 text-league-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>
                           <h4 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tighter">{currentLesson.title}</h4>
                           <p className="text-[10px] font-black text-league-muted uppercase tracking-widest mb-12">Certification Path Node • {currentLesson.durationMins}m Required</p>
                           <button className="bg-league-accent text-white px-12 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">Initialize Playback Stream</button>
                        </div>
                      ) : <div className="opacity-10 font-black uppercase tracking-[0.4em] flex flex-col items-center"><svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2"></path></svg>Select Path Node</div>}
                   </div>
                </div>
              ) : <div className="flex-1 flex items-center justify-center opacity-20 font-black uppercase tracking-[0.4em] italic">Select Certification Module Node</div>}
           </div>
        </div>
      )}
    </div>
  );
};