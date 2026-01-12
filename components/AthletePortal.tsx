
import React, { useState } from 'react';
import { useApp } from '../App';
import { RecruitingStatus, Document, ContractStatus } from '../types';

export const AthletePortal: React.FC = () => {
  const { currentUserProfileId, profiles, generateHypeAsset, updateProfile, signContract, addToast } = useApp();
  const [isSigning, setIsSigning] = useState(false);
  const player = profiles.find(p => p.id === currentUserProfileId);

  if (!player) return null;

  const handleSign = () => {
    setIsSigning(true);
    setTimeout(() => { signContract(player.id); setIsSigning(false); }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Athlete Node</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Dossier Access: {player.fullName}</p>
        </div>
        <button onClick={() => generateHypeAsset(player.id)} className="bg-league-accent text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110">Synthesize Hype Card</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
           {player.hypeAssetUrl ? (
             <div className="bg-league-panel border-4 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative group animate-in zoom-in-95">
                <div className="aspect-[3/4] relative">
                   <img src={player.hypeAssetUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Hype Asset" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                   <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                      <div className="bg-league-accent text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">IAL_2026_PROSPECT</div>
                      <div className="text-right"><div className="text-[8px] font-black text-white/50 uppercase tracking-widest">Node ID</div><div className="text-[12px] font-black italic text-white">{player.id.split('-').pop()}</div></div>
                   </div>
                   <div className="absolute bottom-10 left-8 right-8">
                      <h4 className="text-4xl font-black italic uppercase text-white leading-none tracking-tighter mb-4">{player.fullName}</h4>
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                         <CardStat label="Grade" val={player.scoutGrade || '--'} />
                         <CardStat label="IC Score" val={player.ironmanCoefficient ? (player.ironmanCoefficient * 10).toFixed(1) : '--'} />
                         <CardStat label="Pos" val={player.positions[0]} />
                      </div>
                   </div>
                </div>
                <button className="w-full bg-white text-black py-5 font-black uppercase tracking-widest text-[10px] hover:bg-league-accent hover:text-white transition-all">Broadcast to Social Nodes</button>
             </div>
           ) : (
             <div className="bg-league-panel border-2 border-dashed border-league-border rounded-[3rem] aspect-[3/4] flex flex-col items-center justify-center p-12 text-center">
                <p className="text-[10px] font-black uppercase text-league-muted tracking-[0.2em] mb-8">Neural Hype Asset Ready for Synthesis</p>
                <button onClick={() => generateHypeAsset(player.id)} className="bg-league-accent text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Synthesize Asset</button>
             </div>
           )}
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="bg-league-panel border border-league-border rounded-[3.5rem] p-10 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic mb-10">Command Directives</h4>
              {player.contractOffer && player.contractOffer.status === ContractStatus.APPROVED && (
                  <div className="bg-league-ok/10 border-2 border-league-ok p-10 rounded-[2.5rem] animate-pulse">
                     <h5 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tighter leading-none">Contract Payload Authorized</h5>
                     <p className="text-[10px] font-bold text-league-ok uppercase tracking-widest mb-8">Uplink from: {player.contractOffer.franchise}</p>
                     <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8 flex justify-between items-center">
                        <div><span className="text-[8px] font-black uppercase text-league-muted block mb-1">Game Check</span><span className="text-3xl font-black italic text-white">${player.contractOffer.amount.toLocaleString()}</span></div>
                        <button onClick={handleSign} disabled={isSigning} className="bg-league-ok text-black px-12 py-4 rounded-xl font-black uppercase italic tracking-widest hover:scale-105 transition-all">Execute Handshake</button>
                     </div>
                  </div>
              )}
              {player.status === RecruitingStatus.SIGNED && (
                  <div className="bg-black/40 border border-league-ok/30 p-10 rounded-[2.5rem] flex items-center justify-between">
                     <div><h5 className="text-xl font-black italic uppercase text-league-ok mb-1">Handshake Secure</h5><p className="text-[10px] font-bold text-league-muted uppercase tracking-widest">Locked to: {player.contractOffer?.franchise}</p></div>
                     <div className="text-4xl">🤝</div>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const CardStat = ({ label, val }: any) => (
  <div className="text-center"><div className="text-[7px] font-black uppercase text-white/50 tracking-widest mb-1">{label}</div><div className="text-lg font-black italic text-white leading-none">{val}</div></div>
);
