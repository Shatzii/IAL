
import React, { useState } from 'react';
import { Role, Profile, TalentTier, SystemRole } from '../types';
import { useApp } from '../App';

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

export const Profiles: React.FC = () => {
  const { profiles, updateProfile, isPrivacyMode, currentSystemRole, aiScoutSearch, addToast, setView, setActiveChannelId, currentUserProfileId } = useApp();
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [aiQuery, setAiQuery] = useState('');
  const [aiFiltering, setAiFiltering] = useState(false);
  const [aiResults, setAiResults] = useState<string[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const filteredProfiles = profiles.filter(p => {
    const matchesTab = p.role === activeTab;
    const matchesAi = aiResults ? aiResults.includes(p.id) : true;
    return matchesTab && matchesAi;
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
      addToast("You cannot message yourself.", "info");
      return;
    }
    // Simple DM channel logic: sorted IDs joined by underscore
    const channelId = `dm_${[currentUserProfileId || 'admin', targetProfile.id].sort().join('_')}`;
    setActiveChannelId(channelId);
    setView('comms');
    setSelectedProfile(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-black mt-1">Registry of Professional Talent</p>
        </div>
        
        <form onSubmit={handleAiSearch} className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Ask AI Scout: 'Find Tier 1 LBs under 25'..." 
            className="w-full bg-league-panel border border-league-border p-4 pr-12 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-league-accent transition-all shadow-inner"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-league-accent">
            {aiFiltering ? <div className="animate-spin text-sm">↻</div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}
          </button>
        </form>
      </div>

      <div className="flex gap-4">
        {[Role.PLAYER, Role.COACH].map(r => (
          <button 
            key={r} onClick={() => setActiveTab(r)}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === r ? 'bg-white text-black border-white shadow-xl' : 'text-league-muted border-league-border hover:text-white'}`}
          >
            {r}s
          </button>
        ))}
        {aiResults && (
          <button onClick={() => { setAiResults(null); setAiQuery(''); }} className="text-[10px] font-black uppercase text-league-accent underline tracking-widest ml-2">Clear AI Filter</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProfiles.map(p => (
          <div key={p.id} onClick={() => setSelectedProfile(p)} className="bg-league-panel border border-league-border rounded-[2rem] p-8 group cursor-pointer hover:border-league-accent transition-all flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            </div>
            <div className="flex items-center gap-6 mb-6">
              {/* Stylized Initial Circle instead of Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white shadow-inner group-hover:border-league-accent transition-colors">
                {p.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-black italic uppercase text-white leading-none mb-2 tracking-tighter">{p.fullName}</h4>
                <div className="flex items-center gap-3">
                   <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${getTierColor(p.tier)}`}>{p.tier}</span>
                   <span className="text-[8px] font-black text-league-muted uppercase tracking-[0.2em]">{isPrivacyMode ? '•••••' : p.nationality}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-league-muted font-bold italic line-clamp-2 flex-1 mb-6 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{p.personalBio}</p>
            <div className="flex justify-between items-center pt-6 border-t border-league-border/30">
               <span className="text-[10px] font-black italic text-league-accent tracking-widest">GRADE: {p.scoutGrade || 'N/A'}</span>
               <div className="flex gap-1.5">
                 {p.positions.map(pos => <span key={pos} className="text-[7px] font-black bg-league-bg px-2 py-0.5 rounded-full border border-league-border text-league-muted uppercase tracking-widest">{pos}</span>)}
               </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="bg-league-panel border border-league-border max-w-5xl w-full rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-10 right-10 text-league-muted hover:text-white z-10 transition-colors">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="p-12 md:p-16 space-y-12">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-end border-b border-league-border pb-12">
                <div className="w-40 h-40 rounded-[2.5rem] bg-league-bg border-4 border-league-accent flex items-center justify-center font-black italic text-6xl text-white shadow-2xl">
                  {selectedProfile.fullName.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h3 className="text-6xl font-black italic uppercase text-white mb-4 tracking-tighter leading-none">{selectedProfile.fullName}</h3>
                   <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                     <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${getTierColor(selectedProfile.tier)}`}>{selectedProfile.tier}</span>
                     <span className="text-xs font-black uppercase text-league-accent tracking-[0.4em] italic">{selectedProfile.positions.join(' / ')}</span>
                   </div>
                </div>
                <button 
                  onClick={() => handleOpenComms(selectedProfile)}
                  className="w-full md:w-auto bg-league-accent text-white px-12 py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(228,29,36,0.3)] hover:-translate-y-1 transition-all"
                >
                  Initiate Secure Uplink
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="h-0.5 w-6 bg-league-accent" />
                      <h4 className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em]">Technical Dossier</h4>
                   </div>
                   <p className="text-sm text-white/90 leading-relaxed italic font-bold border-l-2 border-league-accent pl-6">{selectedProfile.personalBio}</p>
                   <div className="grid grid-cols-2 gap-6 pt-4">
                     <DataPoint label="40YD SPEED" val={selectedProfile.fortyYardDash ? selectedProfile.fortyYardDash + 's' : '--'} />
                     <DataPoint label="BENCH POWER" val={selectedProfile.benchPressReps ? selectedProfile.benchPressReps + ' reps' : '--'} />
                     <DataPoint label="TACTICAL IQ" val={selectedProfile.metrics.iq} />
                     <DataPoint label="AGILITY RATING" val={selectedProfile.metrics.agility} />
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="h-0.5 w-6 bg-league-accent" />
                      <h4 className="text-[10px] font-black uppercase text-league-muted tracking-[0.4em]">Document Vault</h4>
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
                      {selectedProfile.documents.length === 0 && <p className="text-[10px] text-league-muted font-black uppercase italic text-center py-12 border-2 border-dashed border-league-border rounded-2xl opacity-30">No active encrypted documents</p>}
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

const DataPoint = ({ label, val }: any) => (
  <div className="flex justify-between items-center border-b border-league-border/30 pb-3">
    <span className="text-[10px] font-black text-league-muted uppercase tracking-widest">{label}</span>
    <span className="text-[12px] font-black text-white italic tracking-tighter">{val}</span>
  </div>
);
