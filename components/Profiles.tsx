
import React, { useState, useMemo } from 'react';
import { Role, Profile, TalentTier, SystemRole, RecruitingStatus, Franchise, FRANCHISE_TEAMS } from '../types';
import { useApp } from '../App';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent shadow-[0_0_15px_rgba(228,29,36,0.4)]';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue shadow-[0_0_15px_rgba(64,169,255,0.4)]';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

const TierBadge: React.FC<{ tier: TalentTier, size?: 'sm' | 'lg' }> = ({ tier, size = 'sm' }) => {
  const isLarge = size === 'lg';
  return (
    <span className={`${isLarge ? 'text-[10px] px-4 py-1.5' : 'text-[7px] px-2 py-0.5'} font-black uppercase tracking-[0.2em] rounded-full border transition-all ${getTierColor(tier)}`}>
      {tier}
    </span>
  );
};

export const Profiles: React.FC = () => {
  const { profiles, updateProfile, translateIntel, summarizeVoucher, addToast, logActivity, currentSystemRole } = useApp();
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  
  // Assignment Modal State
  const [assigningProfile, setAssigningProfile] = useState<Profile | null>(null);
  const [assignmentData, setAssignmentData] = useState<{ franchise: Franchise, team: string }>({
    franchise: Franchise.NOTTINGHAM,
    team: FRANCHISE_TEAMS[Franchise.NOTTINGHAM][0]
  });

  const filteredProfiles = profiles.filter(p => p.role === activeTab);

  const isAdmin = currentSystemRole === SystemRole.LEAGUE_ADMIN || currentSystemRole === SystemRole.FRANCHISE_GM;

  const handleTranslate = async (text: string) => {
    setIsTranslating(true);
    addToast("Initializing Euro-Bridge Translation...", "info");
    const result = await translateIntel(text, 'German (DE)');
    if (selectedProfile) {
       setSelectedProfile({ ...selectedProfile, personalBio: result });
    }
    setIsTranslating(false);
    addToast("Intel Translated to Node-Local Dialect", "success");
  };

  const handleSummarize = async (docId: string) => {
    addToast("Scanning Vault Document Metadata...", "info");
    const summary = await summarizeVoucher(docId);
    setSummaries(prev => ({ ...prev, [docId]: summary }));
    addToast("Document Summarized", "success");
  };

  const handleEstablishContact = (id: string, name: string) => {
    updateProfile(id, { status: RecruitingStatus.PRE_SCREENED });
    addToast(`Contact Established with ${name}`, 'info');
    logActivity('CONTACT', `Secure handshake completed with ${name}. Node active.`, id);
    if (selectedProfile && selectedProfile.id === id) {
      setSelectedProfile({ ...selectedProfile, status: RecruitingStatus.PRE_SCREENED });
    }
  };

  const handleFinalAssignment = () => {
    if (!assigningProfile) return;
    updateProfile(assigningProfile.id, {
      assignedFranchise: assignmentData.franchise,
      assignedTeam: assignmentData.team,
      status: RecruitingStatus.PLACED
    });
    logActivity('ASSIGNMENT', `Personnel linked to ${assignmentData.franchise} (${assignmentData.team})`, assigningProfile.id);
    addToast(`${assigningProfile.fullName} successfully deployed to ${assignmentData.team}`, 'success');
    setAssigningProfile(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[9px] font-black mt-2 italic opacity-60">Global IAL Talent Registry • Operational Assets</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border">
          {[Role.PLAYER, Role.COACH].map(role => (
            <button key={role} onClick={() => setActiveTab(role)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === role ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{role}S</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProfiles.map((p) => (
          <div key={p.id} className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 group hover:border-league-accent transition-all flex flex-col shadow-2xl relative overflow-hidden h-[460px]">
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <TierBadge tier={p.tier} />
            </div>
            
            <div className="flex items-center gap-6 mb-6" onClick={() => setSelectedProfile(p)}>
              <div className="w-16 h-16 rounded-2xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-2xl text-white shadow-inner overflow-hidden cursor-pointer">
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.fullName.charAt(0)}
              </div>
              <div className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                   <h4 className="text-xl font-black italic uppercase text-white leading-none tracking-tighter group-hover:text-league-accent transition-colors">{p.fullName}</h4>
                </div>
                <div className="flex items-center gap-3">
                   <TierBadge tier={p.tier} />
                   <span className="text-[8px] font-black text-league-muted uppercase tracking-widest">{p.positions.join('/')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6" onClick={() => setSelectedProfile(p)}>
               <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-[8px] font-black text-league-muted uppercase tracking-widest">Active Node</div>
                  <div className={`text-[10px] font-black italic uppercase ${p.assignedFranchise ? 'text-white' : 'text-league-accent animate-pulse'}`}>
                    {p.assignedFranchise ? `${p.assignedFranchise} (${p.assignedTeam})` : 'UNASSIGNED'}
                  </div>
               </div>
               <p className="text-[11px] text-league-muted font-bold italic line-clamp-2 leading-relaxed opacity-60">{p.personalBio || `Validated ${p.positions[0]} asset currently operational in the global recruitment pool.`}</p>
            </div>

            <div className="mt-auto space-y-3">
              {isAdmin && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setAssigningProfile(p); }}
                  className="w-full bg-league-accent/10 border border-league-accent/50 text-league-accent py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-league-accent hover:text-white transition-all shadow-lg"
                >
                  {p.assignedFranchise ? 'Re-Assign Personnel' : 'Place to Team'}
                </button>
              )}
              <div className="flex justify-between items-center">
                 <button onClick={() => setSelectedProfile(p)} className="text-[9px] font-black uppercase text-league-muted hover:text-league-accent transition-colors">Open Dossier →</button>
                 <span className="text-[10px] font-black italic text-white/50">{p.scoutGrade || '--'} Grade</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {assigningProfile && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-league-panel border-4 border-league-accent max-w-md w-full rounded-[3rem] p-10 shadow-[0_0_100px_rgba(228,29,36,0.3)] animate-in zoom-in-95">
              <h4 className="text-3xl font-black italic uppercase text-white mb-2 tracking-tighter text-center">Tactical Deployment</h4>
              <p className="text-[10px] font-black text-league-muted uppercase tracking-[0.3em] mb-10 text-center italic">Link {assigningProfile.fullName} to Node Cluster</p>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-league-accent tracking-widest italic">Target Franchise</label>
                    <select 
                      className="w-full bg-league-bg border-2 border-league-border p-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs outline-none focus:border-league-accent transition-all appearance-none cursor-pointer"
                      value={assignmentData.franchise} 
                      onChange={e => {
                        const f = e.target.value as Franchise;
                        setAssignmentData({ franchise: f, team: FRANCHISE_TEAMS[f][0] });
                      }}
                    >
                       {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-league-accent tracking-widest italic">Operational Unit</label>
                    <select 
                      className="w-full bg-league-bg border-2 border-league-border p-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs outline-none focus:border-league-accent transition-all appearance-none cursor-pointer"
                      value={assignmentData.team} 
                      onChange={e => setAssignmentData({ ...assignmentData, team: e.target.value })}
                    >
                       {FRANCHISE_TEAMS[assignmentData.franchise].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
                 
                 <div className="pt-6 grid grid-cols-2 gap-4">
                    <button onClick={() => setAssigningProfile(null)} className="bg-league-bg border border-league-border text-league-muted py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                    <button onClick={handleFinalAssignment} className="bg-league-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:brightness-125 transition-all">Execute Deployment</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Profile Detail View */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="bg-league-panel border border-league-border max-w-5xl w-full rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 my-8">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-10 right-10 text-league-muted hover:text-white z-20 p-2 hover:scale-110 text-2xl font-black">×</button>
            <div className="p-8 md:p-16 space-y-12">
              <div className="flex flex-col md:flex-row gap-12 items-center md:items-end border-b border-league-border pb-12">
                <div className="w-48 h-48 rounded-[3rem] bg-league-bg border-4 border-league-accent flex items-center justify-center font-black italic text-7xl text-white shadow-2xl overflow-hidden">
                   {selectedProfile.avatar_url ? <img src={selectedProfile.avatar_url} className="w-full h-full object-cover" /> : selectedProfile.fullName.charAt(0)}
                </div>
                <div className="flex-1 w-full">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                     <div>
                        <h3 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{selectedProfile.fullName}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-league-muted italic opacity-50">Current Status: {selectedProfile.status}</span>
                           {selectedProfile.status === RecruitingStatus.NEW_LEAD && (
                             <button 
                               onClick={() => handleEstablishContact(selectedProfile.id, selectedProfile.fullName)}
                               className="bg-league-ok text-black text-[9px] font-black uppercase px-4 py-1 rounded-full shadow-lg hover:brightness-110"
                             >
                               Verify Identity
                             </button>
                           )}
                        </div>
                     </div>
                     <TierBadge tier={selectedProfile.tier} size="lg" />
                   </div>
                   <div className="flex flex-wrap gap-4">
                     <button onClick={() => handleTranslate(selectedProfile.personalBio || '')} disabled={isTranslating} className="bg-league-blue/10 border border-league-blue/30 text-league-blue px-6 py-2 rounded-xl font-black uppercase italic text-[10px] tracking-widest flex items-center gap-2 hover:bg-league-blue hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        {isTranslating ? 'Encoding Node...' : 'Euro-Bridge Translate'}
                     </button>
                     <div className="bg-league-panel px-6 py-2 rounded-xl border border-league-border text-[10px] font-black uppercase tracking-widest text-league-muted">
                        Origin: {selectedProfile.nationality}
                     </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7 space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4"><div className="h-0.5 w-10 bg-league-accent" /><h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Combat Analysis</h4></div>
                      <p className="text-base text-white/90 leading-relaxed italic font-bold border-l-4 border-league-accent pl-8 py-2 bg-white/5 rounded-r-2xl shadow-inner">{selectedProfile.personalBio || `Automated tactical summary for registry asset ${selectedProfile.id}. Candidate exhibits optimized physical proficiency.`}</p>
                   </div>
                   <div className="h-[300px] w-full bg-league-bg rounded-[2.5rem] border border-league-border p-8">
                      <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{s: 'SPD', v: selectedProfile.metrics.speed}, {s: 'STR', v: selectedProfile.metrics.strength}, {s: 'AGL', v: selectedProfile.metrics.agility}, {s: 'IQ', v: selectedProfile.metrics.iq}, {s: 'VRS', v: selectedProfile.metrics.versatility}]}>
                           <PolarGrid stroke="#333" /><PolarAngleAxis dataKey="s" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                           <Radar name={selectedProfile.fullName} dataKey="v" stroke="#e41d24" fill="#e41d24" fillOpacity={0.6} strokeWidth={3} />
                         </RadarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="lg:col-span-5 space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4"><div className="h-0.5 w-10 bg-league-accent" /><h4 className="text-xs font-black uppercase text-white tracking-[0.4em]">Secure Vault</h4></div>
                      <div className="space-y-3">
                        {selectedProfile.documents.map(doc => (
                          <div key={doc.id} className="bg-league-bg border border-league-border p-5 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4"><svg className="w-6 h-6 text-league-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <div><div className="text-[11px] font-black text-white uppercase tracking-widest">{doc.name}</div><div className="text-[8px] font-bold text-league-muted uppercase mt-0.5">{doc.type}</div></div>
                              </div>
                              <button onClick={() => handleSummarize(doc.id)} className="text-[8px] font-black uppercase text-league-accent border border-league-accent/30 px-3 py-1 rounded-full hover:bg-league-accent hover:text-white transition-all">Scan Metadata</button>
                            </div>
                            {summaries[doc.id] && (
                               <div className="p-4 bg-black/40 border border-league-border rounded-xl text-[10px] text-white/70 italic leading-relaxed font-mono animate-in slide-in-from-top-2">
                                  {summaries[doc.id]}
                               </div>
                            )}
                          </div>
                        ))}
                        {selectedProfile.documents.length === 0 && <div className="p-8 border-2 border-dashed border-league-border rounded-2xl text-center opacity-30 text-[9px] font-black uppercase italic tracking-widest">Vault Empty</div>}
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
