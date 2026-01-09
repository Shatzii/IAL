
import React from 'react';
import { useApp } from '../App';
import { RecruitingStatus } from '../types';

export const AthletePortal: React.FC = () => {
  const { currentUserProfileId, profiles, setView, activityLogs } = useApp();
  const player = profiles.find(p => p.id === currentUserProfileId);

  if (!player) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-black uppercase text-white mb-4">Node Disconnected</h2>
        <p className="text-league-muted max-w-xs mx-auto">Please ensure your registry credentials are valid or contact support.</p>
        <button onClick={() => setView('login')} className="mt-8 bg-league-accent text-white px-8 py-3 rounded-xl font-black uppercase italic">Login</button>
      </div>
    );
  }

  const readinessScore = player.draftReadiness || 0;
  const onboardingProgress = player.onboardingChecklist.length > 0 
    ? (player.onboardingChecklist.filter(t => t.isCompleted).length / player.onboardingChecklist.length) * 100 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Athlete Command Center</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Personnel: {player.fullName} • Status: {player.status}</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-league-panel border border-league-border text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-league-accent transition-all">Update Dossier</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Stats & Readiness */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg className="w-24 h-24" fill="white" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-league-accent mb-10 italic">Draft Readiness Score</h4>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="#1a1a1a" strokeWidth="12" />
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="#e41d24" strokeWidth="12" 
                    strokeDasharray={552.92} strokeDashoffset={552.92 - (552.92 * readinessScore) / 100} 
                    className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                   <span className="text-5xl font-black italic text-white tracking-tighter">{readinessScore}</span>
                   <span className="text-[10px] font-bold text-league-muted uppercase tracking-widest">PROJECTION</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-league-border text-center">
               <p className="text-[10px] text-league-muted font-bold italic leading-relaxed uppercase opacity-60">Your profile is currently being tracked by {Math.floor(Math.random() * 5) + 1} Franchise Nodes.</p>
            </div>
          </div>

          <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-10 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-league-border pb-4 italic">Registry Metadata</h4>
            <div className="space-y-4">
              <MetadataRow label="Induction Date" val={player.createdAt} />
              <MetadataRow label="Primary Node" val={player.preferences.rank1} />
              <MetadataRow label="Contract Status" val={player.status === RecruitingStatus.SIGNED ? 'COMMITTED' : 'UNSECURED'} color={player.status === RecruitingStatus.SIGNED ? 'text-league-ok' : 'text-league-warn'} />
            </div>
          </div>
        </div>

        {/* Right: Tasks & Academy */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Onboarding Directives</h4>
               <span className="text-[10px] font-black italic text-league-ok">{Math.round(onboardingProgress)}% Complete</span>
            </div>
            <div className="space-y-4">
               {player.onboardingChecklist.map(task => (
                 <div key={task.id} className="flex items-center gap-6 p-4 bg-league-bg/50 border border-league-border rounded-2xl group hover:border-league-accent transition-all">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${task.isCompleted ? 'bg-league-ok border-league-ok text-black' : 'border-league-border bg-league-bg'}`}>
                       {task.isCompleted && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <div className="flex-1">
                      <div className={`text-[12px] font-black uppercase tracking-widest ${task.isCompleted ? 'text-league-muted line-through opacity-40' : 'text-white'}`}>{task.title}</div>
                      <div className="text-[8px] font-bold text-league-muted uppercase mt-1 opacity-50">{task.category}</div>
                    </div>
                    {!task.isCompleted && <button className="bg-league-accent text-white px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">Action</button>}
                 </div>
               ))}
               {player.onboardingChecklist.length === 0 && (
                 <div className="py-20 text-center border-2 border-dashed border-league-border rounded-2xl opacity-20 italic font-black uppercase text-[10px] tracking-widest">No Active Directives</div>
               )}
            </div>
          </div>

          <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-10 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 italic">Academy Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-league-bg p-6 rounded-2xl border border-league-border group hover:border-league-accent transition-all">
                  <div className="text-[8px] font-black uppercase text-league-accent mb-2">Tactical Module</div>
                  <div className="text-sm font-black italic text-white mb-4">Mastering the 50-Yard Field</div>
                  <div className="h-1.5 bg-league-panel rounded-full overflow-hidden">
                     <div className="h-full bg-league-ok" style={{ width: '45%' }} />
                  </div>
               </div>
               <div className="bg-league-bg p-6 rounded-2xl border border-league-border group hover:border-league-accent transition-all">
                  <div className="text-[8px] font-black uppercase text-league-accent mb-2">Physical Module</div>
                  <div className="text-sm font-black italic text-white mb-4">Ironman Conditioning Pro</div>
                  <div className="h-1.5 bg-league-panel rounded-full overflow-hidden">
                     <div className="h-full bg-league-warn" style={{ width: '12%' }} />
                  </div>
               </div>
            </div>
            <button onClick={() => setView('academy')} className="mt-8 w-full bg-league-accent/10 border border-league-accent/30 text-league-accent py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-league-accent hover:text-white transition-all">Enter Tactical Academy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetadataRow = ({ label, val, color = 'text-white' }: any) => (
  <div className="flex justify-between items-center text-[10px]">
    <span className="font-black uppercase text-league-muted tracking-widest">{label}</span>
    <span className={`font-black italic ${color}`}>{val}</span>
  </div>
);
