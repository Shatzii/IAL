
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { SystemRole, Video, VideoStatus, VideoSourceType, Team, Franchise, Play } from '../types';
import { VideoPlayer } from './VideoPlayer';

export const TeamFilmRoom: React.FC = () => {
  const { 
    currentSystemRole, 
    currentUserEmail, 
    currentUserProfileId,
    teams, 
    videos, 
    addVideo, 
    addToast, 
    selectedFranchise,
    videoTags,
    playbooks
  } = useApp();

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeMode, setActiveMode] = useState<'Technique' | 'Self-Scout' | 'Opponent'>('Technique');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLinkingPlay, setIsLinkingPlay] = useState(false);

  // Auth: Determine user's authorized team
  const myTeam = useMemo(() => {
    return teams.find(t => 
      t.coachIds.includes(currentUserEmail || '') || 
      t.rosterIds.includes(currentUserProfileId || '')
    ) || teams.find(t => t.franchise === selectedFranchise); 
  }, [teams, currentUserEmail, currentUserProfileId, selectedFranchise]);

  const teamVideos = useMemo(() => {
    if (!myTeam) return [];
    let base = videos.filter(v => v.teamId === myTeam.id);
    if (activeMode === 'Opponent') {
        // Show scouting videos from other teams
        base = videos.filter(v => v.sourceType === VideoSourceType.SCOUTING || (v.teamId !== myTeam.id && v.sourceType === VideoSourceType.GAME));
    }
    return base.filter(v => (filterType === 'all' || v.sourceType === filterType));
  }, [videos, myTeam, filterType, activeMode]);

  // Tendency Aggregation
  const tendencyMetrics = useMemo(() => {
    if (!selectedVideo) return null;
    const tags = videoTags.filter(t => t.videoId === selectedVideo.id);
    return {
        explosiveRatio: Math.round((tags.filter(t => t.label === 'explosive_play').length / (tags.length || 1)) * 100),
        avgRelease: (Math.random() * 0.5 + 2.2).toFixed(2), // Simulated for UX
        wallEfficiency: Math.round(Math.random() * 30 + 60)
    };
  }, [selectedVideo, videoTags]);

  const canUpload = currentSystemRole !== SystemRole.PLAYER;

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const title = target.title.value;
    const type = target.type.value;

    const newVid: Video = {
      id: 'vid-' + Math.random().toString(36).substr(2, 5),
      teamId: myTeam?.id || 'unknown',
      uploadedByUserId: currentUserProfileId || 'admin',
      title,
      description: 'Newly uploaded tactical asset.',
      sourceType: type,
      status: VideoStatus.READY,
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      durationSeconds: 300,
      createdAt: new Date().toISOString().split('T')[0],
      thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=300&h=200&fit=crop',
      tacticalContext: { down: 1, distance: 10, zone: 'OPEN_FIELD' }
    };

    addVideo(newVid);
    setIsUploadModalOpen(false);
    addToast("Tactical Payload Transmitted.", "success");
  };

  const handleLinkPlay = (play: Play) => {
    addToast(`Video linked to Playbook: ${play.name}`, "success");
    setIsLinkingPlay(false);
  };

  if (!myTeam && currentSystemRole !== SystemRole.LEAGUE_ADMIN) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-league-panel border border-league-border rounded-2xl">
        <div className="bg-league-accent/20 p-6 rounded-full mb-6">
          <svg className="w-12 h-12 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 className="text-3xl font-black italic uppercase text-white mb-4">Uplink Restricted</h2>
        <p className="text-league-muted max-w-md font-bold uppercase tracking-widest text-[10px]">Registry membership required for film room access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-league-border pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Strategic Film Room</h2>
          <div className="flex gap-4 mt-3">
             {['Technique', 'Self-Scout', 'Opponent'].map((mode: any) => (
                <button 
                  key={mode} 
                  onClick={() => setActiveMode(mode)}
                  className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all px-4 py-1.5 rounded-lg border ${activeMode === mode ? 'bg-league-accent text-white border-league-accent shadow-lg shadow-league-accent/20' : 'text-league-muted border-league-border hover:text-white'}`}
                >
                  {mode}
                </button>
             ))}
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-league-panel p-1 rounded-xl border border-league-border">
              {['all', VideoSourceType.GAME, VideoSourceType.PRACTICE, VideoSourceType.SCOUTING].map(type => (
                <button 
                  key={type} 
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-league-blue text-white' : 'text-league-muted hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
           </div>
           {canUpload && (
             <button onClick={() => setIsUploadModalOpen(true)} className="bg-league-accent text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl">+ Inject Film</button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Tactical Assets */}
        <div className="lg:col-span-3 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {teamVideos.map(vid => (
            <button 
              key={vid.id} 
              onClick={() => setSelectedVideo(vid)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-4 ${selectedVideo?.id === vid.id ? 'bg-league-accent/10 border-league-accent shadow-lg' : 'bg-league-panel border-league-border hover:border-league-muted'}`}
            >
              <div className="w-20 h-14 rounded-lg bg-league-bg border border-league-border overflow-hidden flex-shrink-0 relative">
                 {vid.thumbnailUrl && <img src={vid.thumbnailUrl} className="w-full h-full object-cover opacity-50" />}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                 </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[7px] font-black uppercase text-league-accent tracking-widest mb-1">{vid.sourceType} • {vid.createdAt}</div>
                <h4 className="text-[11px] font-black italic uppercase text-white truncate leading-tight mb-1">{vid.title}</h4>
                {vid.tacticalContext && <div className="text-[7px] font-bold text-league-muted uppercase tracking-widest opacity-40">{vid.tacticalContext.playType} • {vid.tacticalContext.zone}</div>}
              </div>
            </button>
          ))}
          {teamVideos.length === 0 && (
            <div className="p-12 border-2 border-dashed border-league-border rounded-[2rem] text-center opacity-20 italic font-black uppercase text-[10px] tracking-widest">No Intelligence Packets Found</div>
          )}
        </div>

        {/* Main Viewport */}
        <div className="lg:col-span-9">
           {selectedVideo ? (
             <div className="animate-in fade-in zoom-in-95 space-y-6">
                <VideoPlayer video={selectedVideo} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-league-panel border border-league-border p-6 rounded-[2rem] shadow-xl">
                      <div className="text-[8px] font-black uppercase text-league-muted mb-4 tracking-[0.2em] italic">Trend Index</div>
                      <div className="space-y-4">
                         <TrendItem label="Explosive Play Ratio" val={`${tendencyMetrics?.explosiveRatio}%`} color="text-league-accent" />
                         <TrendItem label="Avg QB Release" val={`${tendencyMetrics?.avgRelease}s`} color="text-league-blue" />
                         <TrendItem label="Wall-Side Efficiency" val={`${tendencyMetrics?.wallEfficiency}%`} color="text-league-ok" />
                      </div>
                   </div>
                   
                   <div className="md:col-span-2 bg-league-panel border border-league-border p-6 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                           <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{selectedVideo.title}</h3>
                           <p className="text-[9px] font-bold text-league-muted uppercase tracking-widest italic">{selectedVideo.description}</p>
                         </div>
                         <div className="flex gap-2">
                           <button className="bg-league-bg border border-league-border text-league-muted px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:text-white transition-all">Export Report</button>
                           <button 
                             onClick={() => setIsLinkingPlay(true)}
                             className="bg-league-blue text-white px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg"
                           >
                             Link to Playbook
                           </button>
                         </div>
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-white/5">
                         <TacticalPill label="Zone" val={selectedVideo.tacticalContext?.zone || 'OPEN'} />
                         <TacticalPill label="D&D" val={`${selectedVideo.tacticalContext?.down}&${selectedVideo.tacticalContext?.distance}`} />
                         <TacticalPill label="Personnel" val="MAC/JACK Ready" />
                      </div>

                      {isLinkingPlay && (
                         <div className="absolute inset-0 bg-league-panel/95 backdrop-blur-md z-40 p-6 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                               <h4 className="text-xs font-black uppercase text-white tracking-widest">Select Play Concept</h4>
                               <button onClick={() => setIsLinkingPlay(false)} className="text-league-muted hover:text-white">×</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar">
                               {playbooks[0].plays.map(play => (
                                 <button 
                                   key={play.id} 
                                   onClick={() => handleLinkPlay(play)}
                                   className="text-left bg-league-bg border border-league-border p-3 rounded-xl hover:border-league-accent transition-all group"
                                 >
                                    <div className="text-[9px] font-black uppercase text-white group-hover:text-league-accent">{play.name}</div>
                                    <div className="text-[7px] font-bold text-league-muted uppercase">{play.formation}</div>
                                 </button>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-[500px] flex flex-col items-center justify-center bg-league-panel border border-league-border rounded-[3rem] opacity-20">
                <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"></path></svg>
                <p className="text-sm font-black uppercase tracking-[0.4em]">Initialize Tactical Uplink</p>
             </div>
           )}
        </div>
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-league-panel border border-league-border max-w-lg w-full rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
             <form onSubmit={handleSimulatedUpload} className="p-10 space-y-8">
                <div className="flex justify-between items-center border-b border-league-border pb-6">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Film Uploader</h3>
                   <button type="button" onClick={() => setIsUploadModalOpen(false)} className="text-league-muted hover:text-white transition-all">×</button>
                </div>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase text-league-muted tracking-widest mb-3 block">Asset Title</label>
                      <input name="title" required className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white outline-none focus:border-league-accent transition-all font-bold" placeholder="e.g. Zurich Goal Line Offense vs Nottingham" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-league-muted tracking-widest mb-3 block">Source Type</label>
                        <select name="type" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white outline-none focus:border-league-accent appearance-none">
                           <option value={VideoSourceType.GAME}>Game Film</option>
                           <option value={VideoSourceType.PRACTICE}>Practice / Drill</option>
                           <option value={VideoSourceType.SCOUTING}>Opponent Scouting</option>
                           <option value={VideoSourceType.HIGHLIGHT}>Recruitment Hub</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-league-muted tracking-widest mb-3 block">Field Zone</label>
                        <div className="bg-league-bg border border-league-border p-4 rounded-xl text-league-ok font-black text-xs italic tracking-widest">RED_ZONE</div>
                      </div>
                   </div>
                   <div className="py-12 border-2 border-dashed border-league-border rounded-xl flex flex-col items-center justify-center gap-4 bg-black/20 hover:border-league-accent transition-all cursor-pointer">
                      <svg className="w-8 h-8 text-league-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2"></path></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-league-muted">Commit Raw mp4 Stream</span>
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 bg-league-bg border border-league-border text-league-muted py-4 rounded-xl font-black uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                   <button type="submit" className="flex-1 bg-league-accent text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">Begin Transcode</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

const TrendItem = ({ label, val, color }: any) => (
  <div className="flex justify-between items-center group">
    <span className="text-[9px] font-bold text-league-muted group-hover:text-white transition-colors">{label}</span>
    <span className={`text-[12px] font-black italic ${color}`}>{val}</span>
  </div>
);

const TacticalPill = ({ label, val }: any) => (
  <div className="flex flex-col">
    <span className="text-[6px] font-black text-league-muted uppercase tracking-widest mb-0.5">{label}</span>
    <span className="text-[10px] font-black italic text-white uppercase">{val}</span>
  </div>
);
