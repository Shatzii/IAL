
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
  const { profiles, isPrivacyMode, currentUserProfileId, currentSystemRole, aiScoutSearch, enrichDossier, generateHypeAsset, addToast, setView, setActiveChannelId, updateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [tierFilter, setTierFilter] = useState<TalentTier | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RecruitingStatus | 'ALL'>('ALL');
  const [aiQuery, setAiQuery] = useState('');
  const [aiFiltering, setAiFiltering] = useState(false);
  const [aiResults, setAiResults] = useState<string[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isGeneratingHype, setIsGeneratingHype] = useState(false);

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
  };

  const handleEnrich = async (id: string) => {
    setIsEnriching(true);
    await enrichDossier(id);
    const updated = profiles.find(p => p.id === id);
    if (updated) setSelectedProfile(updated);
    setIsEnriching(false);
  };

  const handleHypeGen = async (id: string) => {
    setIsGeneratingHype(true);
    await generateHypeAsset(id);
    const updated = profiles.find(p => p.id === id);
    if (updated) setSelectedProfile(updated);
    setIsGeneratingHype(false);
  };

  const handleOpenComms = (targetProfile: Profile) => {
    if (targetProfile.id === currentUserProfileId) return;
    const channelId = `dm_${[currentUserProfileId || 'admin', targetProfile.id].sort().join('_')}`;
    setActiveChannelId(channelId);
    setView('comms');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Global IAL Talent Registry • AI Enabled</p>
        </div>
        <form onSubmit={handleAiSearch} className="relative w-full md:w-[400px]">
          <input type="text" placeholder="Search AI Scout (e.g. 'Fast Tier 1 WRs')..." className="w-full bg-league-panel border border-league-border p-4 pr-12 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-league-accent transition-all shadow-2xl" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-league-accent">{aiFiltering ? <div className="animate-spin text-sm">↻</div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}</button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-4 md:gap-8">
        <div className="flex bg-league-panel p-1 rounded-xl border border-league-border">
          {[Role.PLAYER, Role.COACH].map(r => (
            <button key={r} onClick={() => setActiveTab(r)} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === r ? 'bg-white text-black shadow-xl' : 'text-league-muted hover:text-white'}`}>{r}s</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
           {(['ALL', ...Object.values(TalentTier)] as const).map(t => (
             <button key={t} onClick={() => setTierFilter(t)} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${tierFilter === t ? 'bg-league-accent border-league-accent text-white shadow-lg' : 'bg-league-panel border-league-border text-league-muted hover:border-league-muted'}`}>{t === 'ALL' ? 'Pool' : t.split(' ')[0]}</button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredProfiles.map((p, idx) => (
          <div key={p.id} onClick={() => setSelectedProfile(p)} className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 group cursor-pointer hover:border-league-accent transition-all flex flex-col shadow-2xl relative overflow-hidden h-[420px]" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center gap-6 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white shadow-inner">{p.fullName.charAt(0)}</div>
              <div className="flex-1">
                <h4 className="text-xl font-black italic uppercase text-white leading-none mb-2 tracking-tighter group-hover:text-league-accent transition-colors">{p.fullName}</h4>
                <div className="flex items-center gap-3">
                   <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${getTierColor(p.tier)}`}>{p.tier}</span>
                   <span className="text-[8px] font-black text-league-muted uppercase tracking-widest">{p.positions.join('/')}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-league-bg/50 border border-league-border p-3 rounded-xl shadow-inner"><div className="text-[7px] font-black text-league-accent uppercase mb-1">Ht</div><div className="text-sm font-black italic text-white">{p.height_cm || 'N/A'}cm</div></div>
                  <div className="bg-league-bg/50 border border-league-border p-3 rounded-xl shadow-inner"><div className="text-[7px] font-black text-league-accent uppercase mb-1">Wt</div><div className="text-sm font-black italic text-white">{p.weight_kg || 'N/A'}kg</div></div>
               </div>
               <p className="text-[11px] text-league-muted font-bold italic line-clamp-3 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{p.personalBio || "Personnel dossier pending registry sync."}</p>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-league-border/30">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black italic text-league-accent uppercase">Grade: {p.scoutGrade || 'PENDING'}</span>
                  <span className="text-[7px] font-black uppercase text-league-muted">{p.status}</span>
               </div>
               {p.hypeAssetUrl && <div className="w-8 h-8 rounded-full border border-league-accent p-0.5 overflow-hidden"><img src={p.hypeAssetUrl} className="w-full h-full object-cover rounded-full" /></div>}
            </div>
          </div>
        ))}
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="bg-league-panel border border-league-border max-w-5xl w-full rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-10 right-10 text-league-muted hover:text-white z-20 transition-colors p-2 hover:scale-110"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            <div className="p-12 md:p-16 space-y-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-12 items-center md:items-end border-b border-league-border pb-12 relative overflow-hidden">
                <div className="w-48 h-48 rounded-[3rem] bg-league-bg border-4 border-league-accent flex items-center justify-center font-black italic text-7xl text-white shadow-2xl relative z-10">{selectedProfile.fullName.charAt(0)}</div>
                <div className="flex-1 text-center md:text-left z-10">
                   <h3 className="text-5xl md:text-7xl font-black italic uppercase text-white mb-4 tracking-tighter leading-none">{selectedProfile.fullName}</h3>
                   <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                     <span className={`text-[10px] font-black uppercase px-6 py-2 rounded-full border shadow-xl ${getTierColor(selectedProfile.tier)}`}>{selectedProfile.tier}</span>
                     <span className="text-xs font-black uppercase text-league-accent tracking-[0.5em] italic">{selectedProfile.positions.join(' / ')}</span>
                   </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleEnrich(selectedProfile.id)} disabled={isEnriching} className="bg-league-accent text-white px-8 py-3 rounded-xl font-black uppercase italic text-[10px] tracking-widest disabled:opacity-30">{isEnriching ? 'Scouring Web...' : 'Enrich Intel Dossier'}</button>
                  <button onClick={() => handleHypeGen(selectedProfile.id)} disabled={isGeneratingHype} className="bg-league-blue text-white px-8 py-3 rounded-xl font-black uppercase italic text-[10px] tracking-widest disabled:opacity-30">{isGeneratingHype ? 'Rendering...' : 'Generate Hype Media Kit'}</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7 space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4"><div className="h-0.5 w-10 bg-league-accent" /><h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Strategic Assessment</h4></div>
                      <p className="text-base text-white/90 leading-relaxed italic font-bold border-l-4 border-league-accent pl-8 py-2 bg-white/5 rounded-r-2xl shadow-inner">{selectedProfile.personalBio}</p>
                   </div>
                   {selectedProfile.aiIntel && (
                     <div className="bg-league-accent/5 p-8 rounded-[2rem] border border-league-accent/20 space-y-4 animate-in fade-in">
                        <div className="text-[10px] font-black uppercase text-league-accent tracking-widest flex items-center gap-2"><span className="animate-pulse">●</span> Real-time AI Intelligence Enrichment</div>
                        <div className="text-xs text-white/80 leading-relaxed font-bold italic">{selectedProfile.aiIntel}</div>
                        {selectedProfile.aiIntelSources && (
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-league-accent/10">
                             {selectedProfile.aiIntelSources.map((s, i) => (
                               <a key={i} href={s.uri} target="_blank" className="text-[7px] font-black uppercase text-league-muted hover:text-league-accent border border-league-border px-2 py-1 rounded-full transition-all">{s.title}</a>
                             ))}
                          </div>
                        )}
                     </div>
                   )}
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                     <DataCard label="SCOUT GRADE" val={selectedProfile.scoutGrade || 'N/A'} color="text-league-accent" />
                     <DataCard label="40YD DASH" val={selectedProfile.fortyYardDash ? selectedProfile.fortyYardDash + 's' : '--'} />
                     <DataCard label="BENCH REPS" val={selectedProfile.benchPressReps || '--'} />
                     <DataCard label="VERSATILITY" val={selectedProfile.metrics.versatility || '--'} />
                   </div>
                   <div className="h-[300px] w-full bg-league-bg rounded-[2.5rem] border border-league-border p-8 shadow-inner relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                           {s: 'SPD', v: selectedProfile.metrics.speed}, {s: 'STR', v: selectedProfile.metrics.strength}, 
                           {s: 'AGL', v: selectedProfile.metrics.agility}, {s: 'IQ', v: selectedProfile.metrics.iq}, 
                           {s: 'VRS', v: selectedProfile.metrics.versatility}
                         ]}>
                           <PolarGrid stroke="#333" /><PolarAngleAxis dataKey="s" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                           <Radar name={selectedProfile.fullName} dataKey="v" stroke="#e41d24" fill="#e41d24" fillOpacity={0.6} strokeWidth={3} />
                         </RadarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="lg:col-span-5 space-y-12">
                   {selectedProfile.hypeAssetUrl && (
                     <div className="bg-league-bg border border-league-border rounded-[2.5rem] p-4 shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="text-[8px] font-black uppercase text-league-blue tracking-[0.4em] mb-4 italic text-center">Auto-Generated Media Kit v4.0</div>
                        <img src={selectedProfile.hypeAssetUrl} className="w-full h-auto rounded-2xl shadow-2xl" />
                        <button className="w-full mt-4 bg-league-blue/10 border border-league-blue/30 text-league-blue py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Download Press Material</button>
                     </div>
                   )}
                   <div className="space-y-6"><div className="flex items-center gap-4"><div className="h-0.5 w-10 bg-league-accent" /><h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Vault Access</h4></div>
                      <div className="space-y-3">
                        {selectedProfile.documents.map(doc => (
                          <div key={doc.id} className="bg-league-bg border border-league-border p-5 rounded-2xl flex items-center justify-between group hover:border-league-accent transition-all shadow-inner">
                            <div className="flex items-center gap-4"><svg className="w-6 h-6 text-league-muted group-hover:text-league-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                              <div><div className="text-[11px] font-black text-white uppercase tracking-widest">{doc.name}</div><div className="text-[8px] font-bold text-league-muted uppercase mt-0.5 tracking-tighter">{doc.type}</div></div>
                            </div>
                            <span className={`text-[8px] font-black px-3 py-1 rounded-full ${doc.scanStatus === 'CLEAN' ? 'bg-league-ok/20 text-league-ok border border-league-ok' : 'bg-league-warn/20 text-league-warn border border-league-warn'}`}>{doc.scanStatus}</span>
                          </div>
                        ))}
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
