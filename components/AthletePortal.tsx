import React, { useState } from 'react';
import { useApp } from '../App';
import { RecruitingStatus, Document } from '../types';

export const AthletePortal: React.FC = () => {
  const { currentUserProfileId, profiles, setView, generateHypeAsset, updateProfile, addToast } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const player = profiles.find(p => p.id === currentUserProfileId);

  if (!player) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-black uppercase text-white mb-4">Node Link Severed</h2>
        <button onClick={() => setView('login')} className="mt-8 bg-league-accent text-white px-8 py-3 rounded-xl font-black uppercase italic">Login</button>
      </div>
    );
  }

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    addToast("Initializing Secure Handshake...", "info");
    setTimeout(() => {
      const newDoc: Document = {
        id: 'doc_' + Math.random().toString(36).substr(2, 5),
        name: 'Passport_Dossier_Verified.pdf',
        type: 'Passport',
        url: '#',
        scanStatus: 'CLEAN',
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      updateProfile(player.id, { documents: [...player.documents, newDoc] });
      setIsUploading(false);
      addToast("Payload Verified & Securely Stored.", "success");
    }, 2000);
  };

  const onboardingProgress = player.onboardingChecklist.length > 0 
    ? (player.onboardingChecklist.filter(t => t.isCompleted).length / player.onboardingChecklist.length) * 100 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Athlete Portal</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Personnel: {player.fullName} • Node Status: {player.status}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => generateHypeAsset(player.id)} className="bg-league-accent text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 shadow-[0_0_20px_rgba(228,29,36,0.3)]">Neural Hype Kit</button>
          <button className="bg-league-panel border border-league-border text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-league-accent transition-all">Update Dossier</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          {player.hypeAssetUrl ? (
            <div className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden shadow-2xl group animate-in zoom-in-95">
               <div className="aspect-[9/16] relative">
                  <img src={player.hypeAssetUrl} className="w-full h-full object-cover" alt="Hype Asset" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 right-8">
                     <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-4 leading-none">DRAFT_PROMO_SYNTHESIZED</h4>
                     <button onClick={() => window.open(player.hypeAssetUrl)} className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">Download Node Asset</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-league-panel border-2 border-dashed border-league-border rounded-[2.5rem] aspect-[9/16] flex flex-col items-center justify-center p-12 text-center group hover:border-league-accent transition-all shadow-2xl">
               <div className="w-16 h-16 bg-league-accent/10 rounded-full flex items-center justify-center mb-6 border border-league-accent/30"><svg className="w-8 h-8 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
               <p className="text-[10px] font-black uppercase text-league-muted tracking-[0.2em] mb-8">Neural Hype Engine Ready</p>
               <button onClick={() => generateHypeAsset(player.id)} className="bg-league-accent text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">Synthesize 2026 Asset</button>
            </div>
          )}

          <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-league-accent/5 -translate-x-10 -translate-y-10 rounded-full blur-3xl group-hover:bg-league-accent/10 transition-colors" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic mb-8 border-b border-league-border pb-4 relative z-10">Command Induction</h4>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase"><span className="text-league-muted">Registry Hub</span><span className="text-white italic">IAL_CORE_2.7</span></div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase"><span className="text-league-muted">Node Access</span><span className="text-league-ok">Verified</span></div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase"><span className="text-league-muted">Draft Cycle</span><span className="text-white italic">2026 Phase II</span></div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10"><h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Clearance Vault (Secure Uplink)</h4><span className="text-[10px] font-black italic text-league-blue">{player.documents.length} Records Verified</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
               {player.documents.map(doc => (
                 <div key={doc.id} className="bg-league-bg p-6 rounded-2xl border border-league-border flex items-center justify-between group shadow-inner">
                    <div className="flex items-center gap-4">
                       <svg className="w-6 h-6 text-league-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       <div><div className="text-[11px] font-black text-white uppercase truncate w-32">{doc.name}</div><div className="text-[7px] font-bold text-league-ok uppercase tracking-widest italic">{doc.scanStatus} HANDSHAKE</div></div>
                    </div>
                 </div>
               ))}
            </div>
            <button onClick={handleSimulatedUpload} disabled={isUploading} className="w-full py-12 border-2 border-dashed border-league-border rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-league-accent transition-all disabled:opacity-50 bg-black/20 relative overflow-hidden">
               {isUploading && <div className="absolute inset-0 bg-league-accent/5 animate-pulse" />}
               <div className={`w-12 h-12 rounded-full border border-league-border flex items-center justify-center group-hover:bg-league-accent transition-all ${isUploading && 'animate-spin border-t-league-accent shadow-[0_0_15px_rgba(228,29,36,0.3)]'}`}>
                  <svg className="w-6 h-6 text-league-muted group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2"></path></svg>
               </div>
               <span className="text-[11px] font-black uppercase tracking-widest text-league-muted group-hover:text-white">{isUploading ? 'Securing Node Transmission...' : 'Transmit Clearance Data (Passport / CV / Medical)'}</span>
            </button>
          </div>

          <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10"><h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Draft Induction Workflow</h4><span className="text-[10px] font-black italic text-league-ok">{Math.round(onboardingProgress)}% Operational</span></div>
            <div className="space-y-4">
               {player.onboardingChecklist.map(task => (
                 <div key={task.id} className="flex items-center gap-6 p-5 bg-league-bg border border-league-border rounded-[1.5rem] group hover:border-league-accent transition-all shadow-inner">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${task.isCompleted ? 'bg-league-ok border-league-ok text-black shadow-lg shadow-league-ok/20' : 'border-league-border bg-league-bg'}`}>{task.isCompleted && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 13l4 4L19 7"></path></svg>}</div>
                    <div className="flex-1"><div className={`text-[12px] font-black uppercase tracking-widest ${task.isCompleted ? 'text-league-muted line-through opacity-40' : 'text-white'}`}>{task.title}</div><div className="text-[8px] font-bold text-league-muted uppercase mt-1 opacity-50">{task.category}</div></div>
                 </div>
               ))}
               {player.onboardingChecklist.length === 0 && <div className="py-24 text-center border-2 border-dashed border-league-border rounded-[2.5rem] opacity-20 italic font-black uppercase text-[10px] tracking-widest">Awaiting Command Induction Triggers</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};