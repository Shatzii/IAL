
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { Video, VideoTag, SystemRole, VideoStatus } from '../types';

interface VideoPlayerProps {
  video: Video;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const { videoTags, analyzeVideoAi, currentSystemRole, updateVideoTag, addToast } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaybookOverlay, setShowPlaybookOverlay] = useState(false);

  const tags = useMemo(() => videoTags.filter(t => t.videoId === video.id), [videoTags, video.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('play', () => setIsPlaying(true));
    v.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [video]);

  const seekTo = (ms: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = ms / 1000;
      videoRef.current.play();
    }
  };

  const handleApprove = (tagId: string) => {
    updateVideoTag(tagId, { approved: true });
    addToast("Tactical Intelligence Verified.", "success");
  };

  const activeTags = tags.filter(t => {
    const timeMs = currentTime * 1000;
    return timeMs >= t.tStartMs && timeMs <= t.tEndMs;
  });

  return (
    <div className="space-y-6">
      <div ref={containerRef} className="relative group bg-black rounded-[2.5rem] border border-league-border overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        <video 
          ref={videoRef}
          className="w-full aspect-video cursor-pointer"
          src={video.url}
          playsInline
          poster={video.thumbnailUrl}
        />

        {/* Spatial Tactical Pings */}
        {activeTags.map(tag => (
          tag.x_coord !== undefined && tag.y_coord !== undefined && (
            <div 
              key={tag.id}
              className="absolute z-40 pointer-events-none group/ping"
              style={{ left: `${tag.x_coord}%`, top: `${tag.y_coord}%`, transform: 'translate(-50%, -50%)' }}
            >
               <div className="relative">
                  <div className={`w-8 h-8 rounded-full border-2 animate-ping absolute inset-0 ${tag.label === 'missed_assignment' ? 'border-league-accent' : 'border-league-ok'}`} />
                  <div className={`w-4 h-4 rounded-full border-2 relative z-10 shadow-2xl ${tag.label === 'missed_assignment' ? 'bg-league-accent border-white' : 'bg-league-ok border-white'}`} />
                  
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg whitespace-nowrap shadow-2xl">
                     <div className="text-[7px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">{tag.label}</div>
                     <div className="text-[9px] font-black italic text-white uppercase">{tag.note}</div>
                  </div>
               </div>
            </div>
          )
        ))}

        {/* Playbook Overlay */}
        {showPlaybookOverlay && (
            <div className="absolute inset-0 pointer-events-none z-10 animate-in fade-in">
                <svg className="w-full h-full opacity-60" viewBox="0 0 100 100">
                    <path d="M50 85 L20 60 L80 60" stroke="#e41d24" strokeWidth="0.8" fill="none" strokeDasharray="3 3" />
                    <circle cx="50" cy="85" r="2.5" fill="#e41d24" />
                    <text x="22" y="58" fill="#e41d24" fontSize="4" fontWeight="900" fontStyle="italic" filter="drop-shadow(0 0 2px black)">SCHEMATIC_MESH_01</text>
                </svg>
                <div className="absolute top-8 right-8 bg-black/60 border border-league-accent/40 px-4 py-1.5 rounded-full text-[7px] font-black uppercase text-league-accent italic tracking-widest backdrop-blur-md">
                    LIVE_VARIANCE: 4.2%
                </div>
            </div>
        )}

        {/* HUD UI Elements */}
        <div className="absolute top-8 left-8 flex flex-col gap-3 pointer-events-none z-20">
           {activeTags.filter(t => t.x_coord === undefined).map(tag => (
             <div key={tag.id} className="bg-league-panel/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-left-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${tag.source === 'ai' ? 'bg-league-blue' : 'bg-league-accent'} shadow-[0_0_8px_currentColor]`} />
                      <div className="text-[8px] font-black uppercase text-white/50 tracking-widest">Intel: {tag.label}</div>
                   </div>
                   {tag.confidence && <div className="text-[7px] font-black text-league-ok uppercase">{Math.round(tag.confidence * 100)}% Match</div>}
                </div>
                <div className="text-sm font-black italic text-white leading-tight uppercase tracking-tighter">{tag.note}</div>
             </div>
           ))}
        </div>

        {/* Video Controls */}
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
          <div className="relative h-2 bg-white/10 rounded-full mb-6 cursor-pointer" 
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 if (videoRef.current) videoRef.current.currentTime = (x / rect.width) * videoRef.current.duration;
               }}>
             <div className="absolute h-full bg-league-accent rounded-full shadow-[0_0_15px_#e41d24]" style={{ width: `${(currentTime / (video.durationSeconds || 1)) * 100}%` }} />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()} className="text-white hover:text-league-accent">
                {isPlaying ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>}
              </button>
              <div className="text-[10px] font-black text-white italic tracking-widest font-mono">
                {Math.floor(currentTime/60)}:{(Math.floor(currentTime%60)).toString().padStart(2,'0')} / {Math.floor(video.durationSeconds/60)}:{(video.durationSeconds%60).toString().padStart(2,'0')}
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => setShowPlaybookOverlay(!showPlaybookOverlay)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${showPlaybookOverlay ? 'bg-league-accent text-white shadow-lg' : 'bg-league-bg text-league-muted hover:text-white'}`}>
                 {showPlaybookOverlay ? 'Hide Schematic' : 'Show Schematic'}
               </button>
               {currentSystemRole !== SystemRole.PLAYER && video.status !== VideoStatus.ANALYZING && (
                 <button onClick={() => analyzeVideoAi(video.id)} className="bg-league-blue text-white px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg flex items-center gap-2">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="3"></path></svg> AI Deep Scan
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tags.sort((a,b) => a.tStartMs - b.tStartMs).map(tag => (
          <div key={tag.id} onClick={() => seekTo(tag.tStartMs)} className={`bg-league-panel border p-5 rounded-[1.5rem] flex gap-6 items-center hover:border-league-accent transition-all cursor-pointer group shadow-xl relative overflow-hidden ${!tag.approved ? 'border-dashed border-white/20' : 'border-league-border'}`}>
            <div className="text-center w-12 border-r border-white/5 pr-4 flex-shrink-0">
              <div className="text-league-accent font-black text-xs italic">{Math.floor(tag.tStartMs/1000/60)}:{(Math.floor(tag.tStartMs/1000%60)).toString().padStart(2,'0')}</div>
              <div className={`text-[6px] font-black uppercase mt-1 ${tag.source === 'ai' ? 'text-league-blue' : 'text-league-accent'}`}>{tag.source}</div>
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{tag.label}</div>
              <div className="text-[11px] font-bold italic text-white uppercase truncate">{tag.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LegendPill = ({ label, color }: any) => (
  <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${color}`} /><span className="text-[8px] font-black uppercase text-league-muted">{label}</span></div>
);
