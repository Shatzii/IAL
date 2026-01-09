
import React, { useState, useMemo } from 'react';
import { Role, Profile, TalentTier, SystemRole, RecruitingStatus } from '../types';
import { useApp } from '../App';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

export const Profiles: React.FC = () => {
  const { profiles, isPrivacyMode, currentUserProfileId, currentSystemRole, aiScoutSearch, addToast, setView, setActiveChannelId, updateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [tierFilter, setTierFilter] = useState<TalentTier | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RecruitingStatus | 'ALL'>('ALL');
  const [aiQuery, setAiQuery] = useState('');
  const [aiFiltering, setAiFiltering] = useState(false);
  const [aiResults, setAiResults] = useState<string[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Video Tagging State
  const [newTag, setNewTag] = useState({ timestamp: '', note: '' });

  const filteredProfiles = profiles.filter(p => {
    if (p.role !== activeTab) return false;
    if (tierFilter !== 'ALL' && p.tier !== tierFilter) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (aiResults && !aiResults.includes(p.id)) return false;
    return true;
  });

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) {
      setAiResults(null);
      return;
    }
    setAiFiltering(true);
    const results = await aiScoutSearch(aiQuery);
    setAiResults(results);
    setAiFiltering(false);
    addToast(results ? `AI Found ${results.length} matches` : "No matches found", "info");
  };

  const handleOpenComms = (targetProfile: Profile) => {
    if (targetProfile.id === currentUserProfileId) {
      addToast("Direct uplink to self-node restricted.", "info");
      return;
    }
    const channelId = `dm_${[currentUserProfileId || 'admin', targetProfile.id].sort().join('_')}`;
    setActiveChannelId(channelId);
    setView('comms');
    setSelectedProfile(null);
  };

  const handleAddVideoTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !newTag.timestamp || !newTag.note) return;

    const tag = {
      timestamp: newTag.timestamp,
      note: newTag.note,
      scoutId: currentUserProfileId || 'admin',
      scoutName: currentSystemRole
    };

    const currentTags = selectedProfile.videoAnalysisTags || [];
    updateProfile(selectedProfile.id, { videoAnalysisTags: [...currentTags, tag] });
    
    // Optimistic update for local UI
    setSelectedProfile(prev => prev ? { ...prev, videoAnalysisTags: [...currentTags, tag] } : null);
    setNewTag({ timestamp: '', note: '' });
    addToast("Video intelligence committed", "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Global IAL Talent Registry • Secure View</p>
        </div>
        
        <form onSubmit={handleAiSearch} className="relative w-full md:w-[400px]">
          <input 
            type="text" 
            placeholder="Search AI Scout (e.g. 'Fast Tier 1 WRs')..." 
            className="w-full bg-league-panel border border-league-border p-4 pr-12 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-league-accent transition-all shadow-2xl placeholder:opacity-30"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-league-accent p-1">
            {aiFiltering ? <div className="animate-spin text-sm">↻</div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}
          </button>
        </form>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-4 md:gap-8">
        <div className="flex bg-league-panel p-1 rounded-xl border border-league-border">
          {[Role.PLAYER, Role.COACH].map(r => (
            <button 
              key={r} onClick={() => setActiveTab(r)}
              className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === r ? 'bg-white text-black shadow-xl' : 'text-league-muted hover:text-white'}`}
            >
              {r}s
            </button>
          ))}
        </div>

        <div className="h-6 w-[1px] bg-league-border hidden md:block" />

        <div className="flex flex-wrap gap-2">
           <span className="text-[8px] font-black text-league-accent uppercase tracking-widest self-center mr-2 italic">Classification:</span>
           {(['ALL', ...Object.values(TalentTier)] as const).map(t => (
             <button 
                key={t} onClick={() => setTierFilter(t)}
                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${tierFilter === t ? 'bg-league-accent border-league-accent text-white shadow-lg' : 'bg-league-panel border-league-border text-league-muted hover:border-league-muted'}`}
             >
                {t === 'ALL' ? 'Total Pool' : t.split(' ')[0]}
             </button>
           ))}
        </div>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredProfiles.map((p, idx) => (
          <div 
            key={p.id} 
            onClick={() => setSelectedProfile(p)} 
            className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 group cursor-pointer hover:border-league-accent transition-all flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 min-h-[380px]"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all group-hover:scale-110 pointer-events-none">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            </div>
            
            <div className="flex items-center gap-6 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white shadow-inner group-hover:border-league-accent transition-colors">
                {p.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black italic uppercase text-white leading-none mb-2 tracking-tighter group-hover:text-league-accent transition-colors">{p.fullName}</h4>
                <div className="flex items-center gap-3">
                   <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${getTierColor(p.tier)}`}>{p.tier}</span>
                   <span className="text-[8px] font-black text-league-muted uppercase tracking-widest">{p.positions.join('/')}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-6">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-league-bg/50 border border-league-border p-3 rounded-xl shadow-inner">
                    <div className="text-[7px] font-black text-league-accent uppercase tracking-widest mb-1">Biometrics_Height</div>
                    <div className="text-sm font-black italic text-white">{p.height_cm ? `${p.height_cm}cm` : 'N/A'}</div>
                  </div>
                  <div className="bg-league-bg/50 border border-league-border p-3 rounded-xl shadow-inner">
                    <div className="text-[7px] font-black text-league-accent uppercase tracking-widest mb-1">Biometrics_Weight</div>
                    <div className="text-sm font-black italic text-white">{p.weight_kg ? `${p.weight_kg}kg` : 'N/A'}</div>
                  </div>
               </div>
               <div className="bg-league-bg/30 p-4 rounded-xl border border-league-border/50">
                  <p className="text-[11px] text-league-muted font-bold italic line-clamp-3 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                    {p.personalBio || "Personnel dossier pending synchronization with central registry. Physical and tactical performance metrics under validation."}
                  </p>
               </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-league-border/30">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black italic text-league-accent tracking-widest uppercase">Grade: {p.scoutGrade || 'PENDING'}</span>
                  <span className="text-[7px] font-black uppercase text-league-muted tracking-[0.2em]">{p.status}</span>
               </div>
               <button className="text-[8px] font-black uppercase bg-league-bg px-3 py-1 rounded-full border border-league-border text-league-muted tracking-widest hover:border-league-accent hover:text-white transition-all">
                 View Dossier
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="bg-league-panel border border-league-border max-w-5xl w-full rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-10 right-10 text-league-muted hover:text-white z-20 transition-colors p-2 hover:scale-110">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="p-12 md:p-16 space-y-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-12 items-center md:items-end border-b border-league-border pb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-league-accent/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                
                <div className="w-48 h-48 rounded-[3rem] bg-league-bg border-4 border-league-accent flex items-center justify-center font-black italic text-7xl text-white shadow-2xl relative z-10 group/avatar">
                  {selectedProfile.fullName.charAt(0)}
                  <div className="absolute inset-0 bg-league-accent/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-[3rem] animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-left z-10">
                   <h3 className="text-5xl md:text-7xl font-black italic uppercase text-white mb-4 tracking-tighter leading-none">{selectedProfile.fullName}</h3>
                   <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                     <span className={`text-[10px] font-black uppercase px-6 py-2 rounded-full border shadow-xl ${getTierColor(selectedProfile.tier)}`}>{selectedProfile.tier}</span>
                     <span className="text-xs font-black uppercase text-league-accent tracking-[0.5em] italic">{selectedProfile.positions.join(' / ')}</span>
                     <span className="text-[10px] font-black text-league-muted uppercase tracking-widest">{isPrivacyMode ? '•••••' : selectedProfile.nationality}</span>
                   </div>
                </div>
                <button 
                  onClick={() => handleOpenComms(selectedProfile)}
                  className="w-full md:w-auto bg-league-accent text-white px-12 py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] text-sm shadow-[0_15px_40px_rgba(228,29,36,0.3)] hover:-translate-y-1 transition-all z-10 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                  Initiate Secure Uplink
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7 space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-0.5 w-10 bg-league-accent" />
                        <h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Operational Dossier</h4>
                      </div>
                      <p className="text-base text-white/90 leading-relaxed italic font-bold border-l-4 border-league-accent pl-8 py-2 bg-white/5 rounded-r-2xl shadow-inner">{selectedProfile.personalBio}</p>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                     <DataCard label="SCOUT GRADE" val={selectedProfile.scoutGrade || 'N/A'} color="text-league-accent" />
                     <DataCard label="40YD DASH" val={selectedProfile.fortyYardDash ? selectedProfile.fortyYardDash + 's' : '--'} />
                     <DataCard label="BENCH REPS" val={selectedProfile.benchPressReps || '--'} />
                     <DataCard label="VERT JUMP" val={selectedProfile.combineResults?.[0]?.verticalJump_cm ? selectedProfile.combineResults[0].verticalJump_cm + 'cm' : '--'} />
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-0.5 w-10 bg-league-accent" />
                        <h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Athlete Metrics Analysis</h4>
                      </div>
                      <div className="h-[300px] w-full bg-league-bg rounded-[2.5rem] border border-league-border p-8 shadow-inner relative flex items-center justify-center">
                         <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                              {s: 'SPEED', v: selectedProfile.metrics.speed}, {s: 'STRENGTH', v: selectedProfile.metrics.strength}, 
                              {s: 'AGILITY', v: selectedProfile.metrics.agility}, {s: 'IQ', v: selectedProfile.metrics.iq}, 
                              {s: 'VERSATILITY', v: selectedProfile.metrics.versatility}
                            ]}>
                              <PolarGrid stroke="#333" />
                              <PolarAngleAxis dataKey="s" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                              <Radar name={selectedProfile.fullName} dataKey="v" stroke="#e41d24" fill="#e41d24" fillOpacity={0.6} strokeWidth={3} />
                            </RadarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   
                   <div className="space-y-6 pt-12 border-t border-league-border">
                      <div className="flex items-center gap-4">
                        <div className="h-0.5 w-10 bg-league-accent" />
                        <h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Video Analysis Lab</h4>
                      </div>
                      <div className="bg-league-bg border border-league-border rounded-2xl p-6 space-y-4">
                         {currentSystemRole !== SystemRole.PLAYER && (
                           <form onSubmit={handleAddVideoTag} className="flex gap-2 mb-6">
                              <input 
                                type="text" placeholder="Timestamp (e.g. 0:45)"
                                className="w-24 bg-league-panel border border-league-border p-2 rounded-lg text-[10px] text-white focus:border-league-accent outline-none"
                                value={newTag.timestamp} onChange={e => setNewTag({...newTag, timestamp: e.target.value})}
                              />
                              <input 
                                type="text" placeholder="Scouting observation..."
                                className="flex-1 bg-league-panel border border-league-border p-2 rounded-lg text-[10px] text-white focus:border-league-accent outline-none"
                                value={newTag.note} onChange={e => setNewTag({...newTag, note: e.target.value})}
                              />
                              <button type="submit" className="bg-league-accent text-white px-4 rounded-lg text-[9px] font-black uppercase tracking-widest">Commit Tag</button>
                           </form>
                         )}
                         <div className="space-y-3">
                            {selectedProfile.videoAnalysisTags?.map((tag, i) => (
                              <div key={i} className="flex gap-4 p-3 bg-league-panel/50 border border-league-border rounded-xl group/tag">
                                 <span className="text-league-accent font-mono text-[10px] font-black">{tag.timestamp}</span>
                                 <p className="text-[10px] font-bold text-white flex-1 italic">{tag.note}</p>
                                 <span className="text-[7px] font-black uppercase text-league-muted opacity-30 self-end">Scout_{tag.scoutName}</span>
                              </div>
                            ))}
                            {(!selectedProfile.videoAnalysisTags || selectedProfile.videoAnalysisTags.length === 0) && (
                              <p className="text-[9px] text-league-muted font-black uppercase italic text-center py-6 opacity-20 tracking-widest">No intelligence tags recorded</p>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-5 space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-0.5 w-10 bg-league-accent" />
                        <h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Media & Evidence</h4>
                      </div>
                      <div className="space-y-3">
                         {selectedProfile.highlightUrls?.map((url, i) => (
                           <a 
                             key={i} href={url} target="_blank" rel="noreferrer" 
                             className="flex items-center gap-4 p-5 bg-league-bg border border-league-border rounded-2xl hover:border-league-accent transition-all group/link shadow-inner"
                           >
                             <div className="w-10 h-10 rounded-xl bg-league-panel flex items-center justify-center text-league-muted group-hover/link:text-league-accent transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             </div>
                             <div>
                                <span className="text-[10px] font-black uppercase text-white tracking-widest block">Highlight Reel #{i+1}</span>
                                <span className="text-[8px] font-bold text-league-muted uppercase tracking-tighter truncate max-w-[200px] block opacity-40">{url}</span>
                             </div>
                             <svg className="ml-auto w-4 h-4 text-league-muted group-hover/link:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                           </a>
                         ))}
                         {(!selectedProfile.highlightUrls || selectedProfile.highlightUrls.length === 0) && (
                            <p className="text-[9px] text-league-muted font-black uppercase italic text-center py-10 border-2 border-dashed border-league-border rounded-2xl opacity-20 tracking-widest">No visual transmissions linked</p>
                         )}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-0.5 w-10 bg-league-accent" />
                        <h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Vault Access</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedProfile.documents.map(doc => (
                          <div key={doc.id} className="bg-league-bg border border-league-border p-5 rounded-2xl flex items-center justify-between group hover:border-league-accent transition-all shadow-inner">
                            <div className="flex items-center gap-4">
                              <svg className="w-6 h-6 text-league-muted group-hover:text-league-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                              <div>
                                 <div className="text-[11px] font-black text-white uppercase tracking-widest">{doc.name}</div>
                                 <div className="text-[8px] font-bold text-league-muted uppercase mt-0.5 tracking-tighter">{doc.type} • {doc.uploadedAt}</div>
                              </div>
                            </div>
                            <span className={`text-[8px] font-black px-3 py-1 rounded-full ${doc.scanStatus === 'CLEAN' ? 'bg-league-ok/20 text-league-ok border border-league-ok/30' : 'bg-league-warn/20 text-league-warn border border-league-warn/30'}`}>{doc.scanStatus}</span>
                          </div>
                        ))}
                        {selectedProfile.documents.length === 0 && <p className="text-[9px] text-league-muted font-black uppercase italic text-center py-10 border-2 border-dashed border-league-border rounded-2xl opacity-20 tracking-widest">Registry Vault Locked</p>}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataCard = ({ label, val, color = 'text-white' }: any) => (
  <div className="bg-league-bg border border-league-border p-5 rounded-2xl shadow-inner group hover:border-league-accent transition-colors">
    <div className="text-[8px] font-black text-league-muted uppercase tracking-widest mb-1 group-hover:text-league-accent transition-colors">{label}</div>
    <div className={`text-xl font-black italic tracking-tighter leading-none ${color}`}>{val}</div>
  </div>
);
