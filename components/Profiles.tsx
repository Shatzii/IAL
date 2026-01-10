
import React, { useState } from 'react';
import { Role, Profile, TalentTier, SystemRole, RecruitingStatus, Franchise, FRANCHISE_TEAMS, VideoSourceType, VideoStatus } from '../types';
import { useApp } from '../App';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { VideoPlayer } from './VideoPlayer';

const TierBadge: React.FC<{ tier: TalentTier, size?: 'sm' | 'lg' }> = ({ tier, size = 'sm' }) => {
  const isLarge = size === 'lg';
  const getTierColor = (t: TalentTier) => {
    switch (t) {
      case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent shadow-[0_0_15px_rgba(228,29,36,0.4)]';
      case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue';
      default: return 'bg-league-pill text-league-muted border-league-border';
    }
  };
  return <span className={`${isLarge ? 'text-[10px] px-4 py-1.5' : 'text-[7px] px-2 py-0.5'} font-black uppercase tracking-[0.2em] rounded-full border ${getTierColor(tier)}`}>{tier}</span>;
};

export const Profiles: React.FC = () => {
  const { 
    profiles, 
    videos,
    updateProfile, 
    translateIntel, 
    summarizeVoucher, 
    enrichDossier, 
    aiScoutSearch, 
    addToast, 
    currentSystemRole, 
    toggleComparison, 
    comparisonIds 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiMatchIds, setAiMatchIds] = useState<string[] | null>(null);
  const [dossierTab, setDossierTab] = useState<'Intelligence' | 'Tactical' | 'Film'>('Intelligence');
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) { setAiMatchIds(null); return; }
    setIsSearching(true);
    addToast("Initializing Neural Registry Scan...", "info");
    const results = await aiScoutSearch(aiSearchQuery);
    setAiMatchIds(results);
    setIsSearching(false);
    if (!results?.length) addToast("No personnel matches found.", "error");
    else addToast(`${results.length} Neural Matches Synchronized.`, "success");
  };

  const filteredProfiles = profiles.filter(p => {
    if (p.role !== activeTab) return false;
    if (aiMatchIds) return aiMatchIds.includes(p.id);
    return true;
  });

  const handleEnrich = async (id: string) => {
    setIsEnriching(true);
    addToast("Uplinking to Global Intelligence Grid...", "info");
    await enrichDossier(id);
    const updated = profiles.find(p => p.id === id);
    if (updated) setSelectedProfile(updated);
    setIsEnriching(false);
    addToast("Dossier Enriched with Deep Intelligence.", "success");
  };

  const handleTranslate = async (text: string) => {
    setIsTranslating(true);
    const result = await translateIntel(text, 'German (DE)');
    if (selectedProfile) setSelectedProfile({ ...selectedProfile, personalBio: result });
    setIsTranslating(false);
    addToast("Bio Decoded to Local Node Dialect.", "success");
  };

  const handleSummarize = async (docId: string) => {
    addToast("Scanning Archive Metadata...", "info");
    const summary = await summarizeVoucher(docId);
    setSummaries(prev => ({ ...prev, [docId]: summary }));
  };

  // Phase 1: Logic to find relevant team film for the athlete
  const profileVideos = useMemo(() => {
    if (!selectedProfile) return [];
    return videos.filter(v => v.athleteId === selectedProfile.id || (v.sourceType === VideoSourceType.GAME));
  }, [videos, selectedProfile]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Global IAL Talent Registry • Operational Assets</p>
        </div>
        <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
          <form onSubmit={handleAiSearch} className="flex gap-2 w-full">
            <input type="text" placeholder="Neural Scout Query (e.g. Fast WR from USA)..." className="bg-league-panel border border-league-border px-6 py-2 rounded-xl text-[10px] font-bold text-white outline-none focus:border-league-accent flex-1 md:min-w-[400px] shadow-inner" value={aiSearchQuery} onChange={(e) => setAiSearchQuery(e.target.value)} />
            <button disabled={isSearching} type="submit" className="bg-league-accent text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 shadow-xl">{isSearching ? 'Syncing...' : 'Neural Scan'}</button>
          </form>
          <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl">
            {[Role.PLAYER, Role.COACH].map(role => (
              <button key={role} onClick={() => { setActiveTab(role); setAiMatchIds(null); }} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === role ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{role}S</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProfiles.map((p) => (
          <div key={p.id} onClick={() => setSelectedProfile(p)} className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 group hover:border-league-accent transition-all flex flex-col shadow-2xl relative overflow-hidden h-[460px] cursor-pointer">
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"><TierBadge tier={p.tier} /></div>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white shadow-inner overflow-hidden">
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black italic uppercase text-white leading-none tracking-tighter group-hover:text-league-accent transition-colors">{p.fullName}</h4>
                <div className="flex items-center gap-3 mt-1"><TierBadge tier={p.tier} /><span className="text-[8px] font-black text-league-muted uppercase tracking-widest">{p.positions.join('/')}</span></div>
              </div>
            </div>
            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 shadow-inner">
                  <div className="text-[8px] font-black text-league-muted uppercase tracking-widest">Active Node</div>
                  <div className="text-[10px] font-black italic uppercase text-white">{p.assignedFranchise || 'UNLINKED'}</div>
               </div>
               <p className="text-[11px] text-league-muted font-bold italic line-clamp-3 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{p.personalBio || `Personnel asset currently operational within the recruitment ecosystem.`}</p>
            </div>
            <div className="mt-auto space-y-4">
               {currentSystemRole !== SystemRole.PLAYER && (
                 <button onClick={(e) => { e.stopPropagation(); toggleComparison(p.id); }} className={`w-full py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${comparisonIds.includes(p.id) ? 'bg-league-accent border-league-accent text-white' : 'bg-league-bg border-league-border text-league-muted hover:text-white'}`}>
                   {comparisonIds.includes(p.id) ? 'Locked in Scouting Lab' : 'Add to Comparison Lab'}
                 </button>
               )}
               <div className="flex justify-between items-center px-1">
                  <button className="text-[9px] font-black uppercase text-league-muted hover:text-league-accent transition-colors">Open Dossier →</button>
                  <span className="text-[10px] font-black italic text-white/50">{p.scoutGrade || '--'} Grade</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="bg-league-panel border border-league-border max-w-6xl w-full rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 my-8">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-10 right-10 text-league-muted hover:text-white z-20 text-3xl font-black">×</button>
            <div className="p-8 md:p-16 space-y-12">
              <div className="flex flex-col md:flex-row gap-12 items-center md:items-end border-b border-league-border pb-12">
                <div className="w-48 h-48 rounded-[3rem] bg-league-bg border-4 border-league-accent flex items-center justify-center font-black italic text-7xl text-white shadow-2xl overflow-hidden relative">
                   {selectedProfile.avatar_url ? <img src={selectedProfile.avatar_url} className="w-full h-full object-cover" /> : selectedProfile.fullName.charAt(0)}
                   {isEnriching && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="w-10 h-10 border-4 border-league-accent border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
                <div className="flex-1 w-full">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                     <div>
                        <h3 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{selectedProfile.fullName}</h3>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-league-muted italic opacity-50">Origin Node: {selectedProfile.nationality}</span>
                           <button onClick={() => handleEnrich(selectedProfile.id)} disabled={isEnriching} className="bg-league-accent text-white text-[9px] font-black uppercase px-4 py-1 rounded-full shadow-lg hover:brightness-110 disabled:opacity-50">
                             {isEnriching ? 'Syncing...' : 'Deep Intel Scan'}
                           </button>
                        </div>
                     </div>
                     <TierBadge tier={selectedProfile.tier} size="lg" />
                   </div>
                   <div className="flex flex-wrap gap-4">
                     <button onClick={() => handleTranslate(selectedProfile.personalBio || '')} disabled={isTranslating} className="bg-league-blue/10 border border-league-blue/30 text-league-blue px-6 py-2 rounded-xl font-black uppercase italic text-[10px] tracking-widest flex items-center gap-2 hover:bg-league-blue hover:text-white transition-all">
                        {isTranslating ? 'Encoding Node...' : 'Euro-Bridge Decrypt (DE)'}
                     </button>
                   </div>
                </div>
              </div>

              <div className="flex gap-8 border-b border-league-border pb-4">
                {['Intelligence', 'Tactical', 'Film'].map((tab: any) => (
                  <button key={tab} onClick={() => setDossierTab(tab)} className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all relative ${dossierTab === tab ? 'text-white' : 'text-league-muted hover:text-white'}`}>{tab}{dossierTab === tab && <div className="absolute -bottom-[18px] left-0 right-0 h-1 bg-league-accent shadow-[0_0_10px_#e41d24]" />}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 min-h-[400px]">
                {dossierTab === 'Intelligence' && (
                  <>
                    <div className="lg:col-span-7 space-y-6 animate-in slide-in-from-left-4">
                       <h4 className="text-xs font-black uppercase text-league-accent tracking-[0.4em]">Neural Intelligence Stream</h4>
                       <div className="bg-white/5 border-l-4 border-league-accent p-8 rounded-r-2xl shadow-2xl space-y-6">
                          <p className="text-base text-white/90 leading-relaxed italic font-bold">{selectedProfile.aiIntel || "Node encryption active. Execute 'Deep Intel Scan' to uplink to global recruitment nodes."}</p>
                          {selectedProfile.aiIntelSources && (
                             <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                                {selectedProfile.aiIntelSources.map((s, i) => (
                                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="bg-league-bg border border-league-border px-3 py-1 rounded text-[8px] text-league-blue hover:text-white transition-colors">{s.title}</a>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                    <div className="lg:col-span-5 space-y-6 animate-in slide-in-from-right-4">
                       <h4 className="text-xs font-black uppercase text-league-muted tracking-[0.4em]">Secure Node Archives</h4>
                       <div className="space-y-3">
                         {selectedProfile.documents.map(doc => (
                           <div key={doc.id} className="bg-league-bg border border-league-border p-5 rounded-2xl space-y-3 shadow-inner">
                             <div className="flex items-center justify-between">
                               <div><div className="text-[11px] font-black text-white uppercase tracking-widest">{doc.name}</div><div className="text-[7px] font-bold text-league-muted uppercase mt-0.5">{doc.type} • VERIFIED</div></div>
                               <button onClick={() => handleSummarize(doc.id)} className="text-[8px] font-black uppercase text-league-accent border border-league-accent/30 px-3 py-1 rounded-full hover:bg-league-accent hover:text-white transition-all">Scan Metadata</button>
                             </div>
                             {summaries[doc.id] && <div className="p-3 bg-black/40 border border-league-border rounded-xl text-[10px] text-white/70 italic leading-relaxed font-mono animate-in fade-in">{summaries[doc.id]}</div>}
                           </div>
                         ))}
                         {selectedProfile.documents.length === 0 && <div className="p-12 border-2 border-dashed border-league-border rounded-2xl text-center opacity-30 text-[9px] font-black uppercase italic tracking-widest">Vault Empty</div>}
                       </div>
                    </div>
                  </>
                )}

                {dossierTab === 'Tactical' && (
                  <div className="col-span-12 animate-in zoom-in-95 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="h-[400px] w-full bg-league-bg rounded-[2.5rem] border border-league-border p-8 shadow-2xl relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{s: 'SPD', v: selectedProfile.metrics.speed}, {s: 'STR', v: selectedProfile.metrics.strength}, {s: 'AGL', v: selectedProfile.metrics.agility}, {s: 'IQ', v: selectedProfile.metrics.iq}, {s: 'VRS', v: selectedProfile.metrics.versatility}]}>
                            <PolarGrid stroke="#333" /><PolarAngleAxis dataKey="s" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                            <Radar name={selectedProfile.fullName} dataKey="v" stroke="#e41d24" fill="#e41d24" fillOpacity={0.6} strokeWidth={3} />
                          </RadarChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-league-panel p-6 rounded-2xl border border-league-border shadow-inner group hover:border-league-accent transition-colors"><div className="text-[8px] font-black text-league-muted uppercase mb-1 group-hover:text-league-accent transition-colors">Bench Reps</div><div className="text-3xl font-black italic text-white">{selectedProfile.benchPressReps || "--"}</div></div>
                       <div className="bg-league-panel p-6 rounded-2xl border border-league-border shadow-inner group hover:border-league-accent transition-colors"><div className="text-[8px] font-black text-league-muted uppercase mb-1 group-hover:text-league-accent transition-colors">40-Yard Dash</div><div className="text-3xl font-black italic text-league-accent">{selectedProfile.fortyYardDash || "--"}s</div></div>
                       <div className="bg-league-panel p-6 rounded-2xl border border-league-border shadow-inner group hover:border-league-accent transition-colors"><div className="text-[8px] font-black text-league-muted uppercase mb-1 group-hover:text-league-accent transition-colors">Height</div><div className="text-3xl font-black italic text-white">{selectedProfile.height_cm}cm</div></div>
                       <div className="bg-league-panel p-6 rounded-2xl border border-league-border shadow-inner group hover:border-league-accent transition-colors"><div className="text-[8px] font-black text-league-muted uppercase mb-1 group-hover:text-league-accent transition-colors">Weight</div><div className="text-3xl font-black italic text-white">{selectedProfile.weight_kg}kg</div></div>
                    </div>
                  </div>
                )}

                {dossierTab === 'Film' && (
                  <div className="col-span-12 animate-in slide-in-from-bottom-4 space-y-12">
                    {profileVideos.length > 0 ? (
                      <div className="space-y-10">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-6 bg-league-accent rounded-full" />
                           <h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Official Tactical Asset</h4>
                        </div>
                        <VideoPlayer video={profileVideos[0]} />
                      </div>
                    ) : (
                      <div className="py-32 flex flex-col items-center justify-center bg-league-panel border border-league-border rounded-[3rem] opacity-20">
                         <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2"></path></svg>
                         <p className="text-sm font-black uppercase tracking-[0.4em]">No Film Linked to Node</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useMemo } from 'react';
