
import React, { useState } from 'react';
import { useApp } from '../App';
import { Playbook, LearningModule, SystemRole, Play, Franchise } from '../types';

export const Academy: React.FC = () => {
  const { playbooks, learningModules, currentSystemRole, currentUserProfileId, profiles, selectedFranchise } = useApp();
  const [activeTab, setActiveTab] = useState<'Playbooks' | 'Learning' | 'Resources'>('Playbooks');
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);

  const activeProfile = profiles.find(p => p.id === currentUserProfileId);
  const userFranchise = activeProfile?.assignedFranchise || selectedFranchise;

  const visiblePlaybooks = playbooks.filter(pb => {
    if (currentSystemRole === SystemRole.LEAGUE_ADMIN) return true;
    if (!pb.franchise) return true; 
    return pb.franchise === userFranchise;
  });

  const canEdit = currentSystemRole === SystemRole.LEAGUE_ADMIN || currentSystemRole === SystemRole.COACH_STAFF || currentSystemRole === SystemRole.FRANCHISE_GM;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Tactical Academy</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Official Personnel Strategic Hub</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-inner">
          {(['Playbooks', 'Learning', 'Resources'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedPlaybook(null); setSelectedPlay(null); }}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Playbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em]">Strategy Library</h3>
              {canEdit && (
                <button className="text-[8px] font-black uppercase text-league-accent hover:underline tracking-widest">
                  + Create New Playbook
                </button>
              )}
            </div>
            <div className="space-y-3">
              {visiblePlaybooks.map(pb => (
                <button
                  key={pb.id}
                  onClick={() => { setSelectedPlaybook(pb); setSelectedPlay(null); }}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all group ${
                    selectedPlaybook?.id === pb.id 
                      ? 'bg-league-accent/10 border-league-accent shadow-[0_0_30px_rgba(228,29,36,0.1)]' 
                      : 'bg-league-panel border-league-border hover:border-league-muted'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${pb.franchise ? 'bg-league-accent text-white' : 'bg-league-pill text-league-muted'}`}>
                      {pb.franchise || 'Universal'}
                    </span>
                    <span className="text-[8px] font-bold text-league-muted uppercase opacity-50">{pb.lastUpdated}</span>
                  </div>
                  <h4 className="text-lg font-black italic uppercase text-white group-hover:text-league-accent transition-colors leading-tight">{pb.name}</h4>
                  <div className="mt-4 flex items-center gap-2">
                     <div className="h-1 flex-1 bg-league-bg rounded-full overflow-hidden">
                        <div className="h-full bg-league-accent" style={{ width: '100%' }} />
                     </div>
                     <span className="text-[8px] font-black text-league-muted uppercase whitespace-nowrap">{pb.plays.length} Operational Items</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {!selectedPlaybook ? (
              <div className="h-full min-h-[500px] bg-league-panel border border-league-border rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1a1a1a 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
                <svg className="w-20 h-20 mb-6 text-league-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.487V4.513a2 2 0 011.553-1.943l10-2.5a2 2 0 011.447 0l10 2.5A2 2 0 0121 4.513v10.974a2 2 0 01-1.553 1.943L15 20z"></path></svg>
                <h4 className="text-sm font-black italic uppercase tracking-[0.3em]">Awaiting Tactical Selection</h4>
                <p className="text-[10px] font-black uppercase mt-4 tracking-widest text-league-muted">Choose a playbook from the strategy library</p>
              </div>
            ) : (
              <div className="bg-league-panel border border-league-border rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="p-10 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-black italic uppercase text-white leading-none tracking-tighter">{selectedPlaybook.name}</h3>
                    <p className="text-[10px] font-black text-league-accent uppercase mt-2 tracking-widest italic opacity-80">Authenticated Personnel Only • Active Material</p>
                  </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em] mb-4 border-b border-league-border pb-2">Schematic Index</h5>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                      {selectedPlaybook.plays.map(play => (
                        <button
                          key={play.id}
                          onClick={() => setSelectedPlay(play)}
                          className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                            selectedPlay?.id === play.id ? 'bg-league-bg border-league-accent shadow-lg' : 'bg-league-bg/30 border-league-border hover:border-league-muted'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedPlay?.id === play.id ? 'bg-league-accent text-white' : 'bg-league-panel text-league-muted'}`}>
                             {play.category.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase italic text-white group-hover:text-league-accent transition-colors">{play.name}</div>
                            <div className="text-[8px] font-black text-league-muted uppercase tracking-widest mt-0.5">{play.formation}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-league-bg border border-league-border rounded-[2.5rem] p-8 min-h-[400px] flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e41d24 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                    {selectedPlay ? (
                      <div className="animate-in fade-in slide-in-from-right-4 z-10">
                        <div className="flex justify-between items-start mb-8">
                           <div>
                              <h4 className="text-2xl font-black italic uppercase text-league-accent leading-none tracking-tighter">{selectedPlay.name}</h4>
                              <p className="text-[8px] font-black text-league-muted uppercase mt-1 tracking-widest">Formation: {selectedPlay.formation}</p>
                           </div>
                           <span className="text-[9px] font-black uppercase bg-league-pill border border-league-border px-3 py-1 rounded-full text-white">{selectedPlay.category}</span>
                        </div>
                        
                        <div className="aspect-[4/3] bg-black rounded-[2rem] mb-8 border border-league-border flex items-center justify-center relative overflow-hidden group shadow-2xl">
                           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                           <div className="text-center px-10">
                              <svg className="w-16 h-16 mx-auto mb-4 text-league-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-9.701-8.318M12 3a10.003 10.003 0 019.701 8.318M12 3v18m-6-10h12m-6 0a10.003 10.003 0 01-9.701-8.318m19.402 0A10.003 10.003 0 0112 11z"></path></svg>
                              <span className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em] block">Encrypted Schematic Diagram</span>
                              <span className="text-[8px] font-bold uppercase text-league-muted/40 mt-2 block italic">Awaiting secure visualization node link</span>
                           </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                             <div className="h-0.5 w-6 bg-league-accent" />
                             <h6 className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em]">Coaching Directive</h6>
                          </div>
                          <p className="text-sm text-white/90 leading-relaxed font-bold italic border-l-2 border-league-accent pl-4">{selectedPlay.description}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                         <svg className="w-16 h-16 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                         <span className="text-[11px] font-black uppercase tracking-[0.4em]">Select Schematic Index Item</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Learning' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {learningModules.map(module => (
            <div key={module.id} className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden group hover:border-league-accent transition-all flex flex-col shadow-2xl">
               <div className="relative h-56 flex items-center justify-center bg-league-bg">
                 {/* Abstract Schematic Placeholder instead of thumbnail */}
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                 <div className="w-20 h-20 border-2 border-league-accent/30 rounded-full flex items-center justify-center text-league-accent font-black text-2xl group-hover:scale-125 transition-transform duration-700">
                    {module.title.charAt(0)}
                 </div>
                 <div className="absolute bottom-6 left-6 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-league-accent text-white shadow-lg">
                    {module.category}
                 </span>
               </div>
               <div className="p-8 flex-1 flex flex-col">
                 <h4 className="text-xl font-black italic uppercase text-white mb-3 leading-none tracking-tighter">{module.title}</h4>
                 <p className="text-[10px] text-league-muted font-bold uppercase italic leading-relaxed mb-8 flex-1 opacity-70">{module.description}</p>
                 <button className="w-full bg-league-bg border border-league-border py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest text-white hover:bg-league-accent hover:border-league-accent transition-all shadow-lg hover:-translate-y-1">
                   Launch Training Module
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Resources' && (
        <div className="bg-league-panel border border-league-border rounded-[3rem] p-12 animate-in fade-in relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-league-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 mb-12">
              <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-4 leading-none">External Intelligence Hub</h3>
              <p className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em]">Publicly Available Tactical Archives & Community Nodes</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
              <ResourceCard 
                title="ArenaFan Tactical Node"
                desc="A comprehensive historical database of AFL tactics, rosters, and statistical trends from 1987 to present."
                link="https://www.arenafan.com"
                tags={['Archives', 'History']}
              />
              <ResourceCard 
                title="Professional Coaching Clinic"
                desc="Curated clinic notes and blackboard sessions from championship-winning indoor tactical experts."
                link="#"
                tags={['Expertise', 'Video']}
              />
              <ResourceCard 
                title="Personnel Mentorship Network"
                desc="Direct line for active Registry athletes to consult with 10+ year veteran Ironman specialists."
                link="#"
                tags={['Network', 'Direct']}
              />
              <ResourceCard 
                title="Playbook Heritage Project"
                desc="Community-led reconstruction of legendary indoor offensive schemes in modern digital formats."
                link="#"
                tags={['Tactics', 'GitHub']}
              />
           </div>
           
           <div className="mt-20 pt-10 border-t border-league-border text-center opacity-40">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-league-muted italic">End of Tactical Resource Directive</p>
           </div>
        </div>
      )}
    </div>
  );
};

const ResourceCard = ({ title, desc, link, tags }: { title: string, desc: string, link: string, tags: string[] }) => (
  <div className="bg-league-bg border border-league-border p-8 rounded-[2rem] hover:border-league-accent transition-all group flex flex-col h-full hover:shadow-[0_20px_40px_rgba(228,29,36,0.1)]">
    <div className="flex gap-2 mb-6">
       {tags.map(tag => (
         <span key={tag} className="text-[7px] font-black uppercase tracking-widest text-league-accent/50 border border-league-accent/20 px-2 py-0.5 rounded-full">{tag}</span>
       ))}
    </div>
    <h4 className="text-xl font-black italic uppercase text-white mb-4 group-hover:text-league-accent leading-tight tracking-tighter transition-colors">{title}</h4>
    <p className="text-[10px] text-league-muted font-bold italic mb-8 leading-relaxed flex-1 opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
    <a href={link} className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-league-accent group-hover:gap-6 transition-all group-hover:brightness-125">
       Access Transmission 
       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
    </a>
  </div>
);
