
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { Video, VideoStatus, VideoSourceType, TacticalContext } from '../types';

interface VideoUploaderProps {
  onClose: () => void;
  teamId: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onClose, teamId }) => {
  const { addVideo, currentUserProfileId, addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceType: VideoSourceType.GAME,
    zone: 'OPEN_FIELD' as TacticalContext['zone']
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      addToast("Please select a tactical source file.", "error");
      return;
    }

    setIsUploading(true);
    setUploadStage('Initializing Cloud Handshake...');
    
    // Simulate multi-stage upload process
    const stages = [
      { progress: 10, text: 'Allocating Object Storage...' },
      { progress: 30, text: 'Streaming Byte Packets...' },
      { progress: 60, text: 'Verifying Integrity...' },
      { progress: 85, text: 'Generating Tactical Thumbnail...' },
      { progress: 100, text: 'Committing to Registry...' }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      setUploadProgress(stage.progress);
      setUploadStage(stage.text);
    }

    const newVideo: Video = {
      id: `vid-${Math.random().toString(36).substr(2, 7)}`,
      teamId,
      uploadedByUserId: currentUserProfileId || 'admin',
      title: formData.title || file.name,
      description: formData.description,
      sourceType: formData.sourceType,
      status: VideoStatus.READY,
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Mock URL
      durationSeconds: 180, // Mock duration
      createdAt: new Date().toISOString(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=300&h=200&fit=crop',
      tacticalContext: {
        playType: 'PASS',
        zone: formData.zone
      }
    };

    addVideo(newVideo);
    addToast("Media committed to Cloud Storage.", "success");
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-league-panel border-2 border-league-border max-w-2xl w-full rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(228,29,36,0.15)] animate-in zoom-in-95">
        <form onSubmit={startUpload} className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-league-border bg-black/40 flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Media Ingestion</h3>
              <p className="text-[10px] font-black text-league-accent uppercase mt-2 tracking-[0.3em] italic">Direct Object Storage Uplink</p>
            </div>
            {!isUploading && (
              <button type="button" onClick={onClose} className="text-league-muted hover:text-white transition-all text-2xl font-black">×</button>
            )}
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* File Selector */}
            {!isUploading ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all ${file ? 'border-league-ok bg-league-ok/5' : 'border-white/10 bg-black/20 hover:border-league-accent'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="video/*"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${file ? 'bg-league-ok text-black' : 'bg-league-accent/10 text-league-accent'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm font-black text-white italic">{file.name}</p>
                      <p className="text-[10px] font-bold text-league-ok uppercase mt-1">Ready for Transmission ({(file.size / (1024 * 1024)).toFixed(2)} MB)</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-widest">Select Tactical Source</p>
                      <p className="text-[10px] font-bold text-league-muted uppercase mt-1">MP4, MOV, or AVI up to 500MB</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 space-y-8 text-center animate-in zoom-in-95">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                    <span className="text-3xl font-black italic text-white">{uploadProgress}%</span>
                  </div>
                  <svg className="absolute inset-0 w-32 h-32 -rotate-90">
                    <circle 
                      cx="64" cy="64" r="60" 
                      fill="none" 
                      stroke="#e41d24" 
                      strokeWidth="4" 
                      strokeDasharray="377" 
                      strokeDashoffset={377 - (377 * uploadProgress / 100)}
                      className="transition-all duration-500 shadow-[0_0_10px_#e41d24]"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black italic uppercase text-white tracking-tighter">{uploadStage}</p>
                  <p className="text-[9px] font-bold text-league-muted uppercase tracking-[0.4em] animate-pulse">Encryption Active • Secure Tunnel 01</p>
                </div>
              </div>
            )}

            {/* Metadata Fields */}
            {!isUploading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-2">Asset Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Zurich Offense vs Nottingham Q3"
                    className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold outline-none focus:border-league-accent transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-2">Source Type</label>
                  <select 
                    className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-black uppercase text-[10px] outline-none focus:border-league-accent appearance-none cursor-pointer"
                    value={formData.sourceType}
                    onChange={e => setFormData({...formData, sourceType: e.target.value as VideoSourceType})}
                  >
                    <option value={VideoSourceType.GAME}>Game Footage</option>
                    <option value={VideoSourceType.PRACTICE}>Practice Drill</option>
                    <option value={VideoSourceType.HIGHLIGHT}>Recruit Highlight</option>
                    <option value={VideoSourceType.SCOUTING}>Opponent Scout</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-2">Primary Field Zone</label>
                  <select 
                    className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-black uppercase text-[10px] outline-none focus:border-league-accent appearance-none cursor-pointer"
                    value={formData.zone}
                    onChange={e => setFormData({...formData, zone: e.target.value as TacticalContext['zone']})}
                  >
                    <option value="OPEN_FIELD">Open Field</option>
                    <option value="RED_ZONE">Red Zone</option>
                    <option value="WALL_ZONE">Wall Zone</option>
                    <option value="NET_ZONE">Net Zone</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-2">Description / Coaching Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide context for AI scouting analysis..."
                    className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-xs outline-none focus:border-league-accent transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isUploading && (
            <div className="p-8 bg-black/40 border-t border-league-border flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 bg-league-bg border border-league-border text-league-muted py-4 rounded-2xl font-black uppercase italic tracking-widest text-[10px] hover:text-white transition-all"
              >
                Discard
              </button>
              <button 
                type="submit"
                disabled={!file}
                className="flex-1 bg-league-accent text-white py-4 rounded-2xl font-black uppercase italic tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Commit to Cloud
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
