
import React from 'react';
import { useApp } from '../App';
import { RecruitingStatus, Profile, TalentTier } from '../types';

export const Pipeline: React.FC = () => {
  const { profiles, updateProfile } = useApp();

  const statusColumns = [
    RecruitingStatus.NEW_LEAD,
    RecruitingStatus.PRE_SCREENED,
    RecruitingStatus.TRYOUT_INVITED,
    RecruitingStatus.OFFER_EXTENDED,
    RecruitingStatus.SIGNED,
    RecruitingStatus.PLACED,
  ];

  const moveProfile = (id: string, currentStatus: RecruitingStatus, direction: 'forward' | 'backward') => {
    const currentIndex = statusColumns.indexOf(currentStatus);
    const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < statusColumns.length) {
      updateProfile(id, { status: statusColumns[nextIndex] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Recruitment Pipeline</h2>
        <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">Applicant Workflow Management</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar min-h-[700px]">
        {statusColumns.map((status) => {
          const columnProfiles = profiles.filter(p => p.status === status);
          return (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="bg-league-panel p-4 border border-league-border rounded-xl flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-league-accent">{status}</h3>
                <span className="text-[10px] font-bold text-league-muted bg-league-bg px-2 py-0.5 rounded-full">{columnProfiles.length}</span>
              </div>
              
              <div className="flex-1 space-y-4">
                {columnProfiles.map(p => (
                  <div key={p.id} className="bg-league-panel border border-league-border p-4 rounded-xl group hover:border-league-accent transition-all animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={p.avatar_url} className="w-10 h-10 rounded-full border border-league-border" alt="" />
                      <div>
                        <h4 className="text-[12px] font-black italic uppercase text-white leading-none mb-1">{p.fullName}</h4>
                        <div className="flex gap-1 items-center">
                          <span className={`text-[7px] font-black px-1.5 rounded uppercase ${p.tier === TalentTier.TIER1 ? 'text-league-accent' : 'text-league-muted'}`}>{p.tier.split(' ')[0]}</span>
                          <span className="text-[8px] text-league-muted uppercase font-bold tracking-tighter">Grade: {p.scoutGrade || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 border-t border-league-border/50 pt-4">
                      <button 
                        onClick={() => moveProfile(p.id, p.status, 'backward')}
                        disabled={status === statusColumns[0]}
                        className="flex-1 bg-league-bg hover:bg-league-pill p-2 rounded text-league-muted hover:text-white transition-all disabled:opacity-20"
                      >
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button 
                        onClick={() => moveProfile(p.id, p.status, 'forward')}
                        disabled={status === statusColumns[statusColumns.length - 1]}
                        className="flex-1 bg-league-bg hover:bg-league-accent p-2 rounded text-league-muted hover:text-white transition-all disabled:opacity-20"
                      >
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {columnProfiles.length === 0 && (
                  <div className="py-20 border-2 border-dashed border-league-border rounded-xl text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-league-muted/30 italic">No Candidates</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
