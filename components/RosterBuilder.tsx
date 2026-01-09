
import React, { useState } from 'react';
import { useApp } from '../App';
import { Franchise, Profile, Role } from '../types';

interface Slot {
  id: string;
  name: string;
  pos: string;
  group: 'Offense' | 'Defense' | 'Ironman';
  x: number;
  y: number;
}

const FIELD_SLOTS: Slot[] = [
  { id: 'qb', name: 'Quarterback', pos: 'QB', group: 'Offense', x: 50, y: 85 },
  { id: 'wr1', name: 'WR / Motion', pos: 'WR', group: 'Ironman', x: 20, y: 70 },
  { id: 'wr2', name: 'WR / End', pos: 'WR', group: 'Ironman', x: 80, y: 70 },
  { id: 'ol1', name: 'Center / Guard', pos: 'OL', group: 'Offense', x: 50, y: 75 },
  { id: 'ol2', name: 'Guard / DL', pos: 'OL', group: 'Ironman', x: 65, y: 75 },
  { id: 'dl1', name: 'Nose Tackle', pos: 'DL', group: 'Defense', x: 50, y: 65 },
  { id: 'lb1', name: 'Jack Linebacker', pos: 'LB', group: 'Defense', x: 30, y: 55 },
  { id: 'lb2', name: 'Mac Linebacker', pos: 'LB', group: 'Defense', x: 70, y: 55 },
  { id: 'db1', name: 'Safety / DB', pos: 'DB', group: 'Ironman', x: 50, y: 40 },
];

export const RosterBuilder: React.FC = () => {
  const { profiles, selectedFranchise, setSelectedFranchise } = useApp();
  const [assignments, setAssignments] = useState<Record<string, Profile | null>>({});
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const rosterPool = profiles.filter(p => p.assignedFranchise === selectedFranchise && p.role === Role.PLAYER);

  const handleAssign = (slotId: string, player: Profile) => {
    setAssignments(prev => ({ ...prev, [slotId]: player }));
  };

  const handleClear = (slotId: string) => {
    setAssignments(prev => ({ ...prev, [slotId]: null }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Ironman Depth Chart</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-1">Tactical Roster Visualization Node • Heatmaps Active</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowHeatmap(!showHeatmap)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showHeatmap ? 'bg-league-accent border-league-accent text-white shadow-xl' : 'bg-league-panel border-league-border text-league-muted hover:text-white'}`}>Tactical Heatmap: {showHeatmap ? 'ON' : 'OFF'}</button>
           <div className="flex flex-wrap gap-2 bg-league-panel p-1.5 rounded-2xl border border-league-border shadow-inner">
             {Object.values(Franchise).map(f => (
               <button key={f} onClick={() => setSelectedFranchise(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFranchise === f ? 'bg-white text-black shadow-xl' : 'text-league-muted hover:text-white'}`}>{f}</button>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 aspect-[4/3] bg-league-bg rounded-[2rem] border-2 border-league-border p-8 relative">
            <div className="absolute inset-0 flex flex-col pointer-events-none">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex-1 border-b border-white/5 last:border-0 relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/5 italic">{(5-i)*10}</span><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/5 italic">{(5-i)*10}</span></div>
               ))}
            </div>

            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none z-[15]">
                 <div className="absolute top-[30%] left-[20%] w-32 h-32 bg-league-accent/20 blur-[60px] rounded-full animate-pulse" />
                 <div className="absolute top-[60%] left-[50%] w-48 h-48 bg-league-blue/20 blur-[80px] rounded-full animate-pulse delay-700" />
                 <div className="absolute top-[20%] left-[70%] w-24 h-24 bg-league-accent/30 blur-[40px] rounded-full animate-pulse delay-1000" />
              </div>
            )}

            <div className="absolute inset-0 z-20">
              {FIELD_SLOTS.map(slot => (
                <div key={slot.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
                   <div className="text-[7px] font-black text-league-muted uppercase tracking-widest mb-1 italic opacity-40">{slot.name}</div>
                   <div className={`w-24 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all p-2 relative group overflow-hidden ${assignments[slot.id] ? 'bg-league-accent/10 border-league-accent shadow-[0_0_20px_rgba(228,29,36,0.2)]' : 'border-league-border bg-black/40 hover:border-league-muted'}`}>
                     {assignments[slot.id] ? (
                       <div className="text-center group-hover:scale-95 transition-transform"><button onClick={() => handleClear(slot.id)} className="absolute top-1 right-1 text-league-accent opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg></button>
                         <div className="text-[10px] font-black italic uppercase text-white truncate w-20">{assignments[slot.id]?.fullName}</div>
                         <div className="text-[7px] font-bold text-league-accent uppercase mt-0.5">Tier {assignments[slot.id]?.tier.charAt(assignments[slot.id]?.tier.length - 1)}</div>
                       </div>
                     ) : (
                       <span className="text-[9px] font-black uppercase text-league-muted tracking-widest opacity-20 italic">{slot.pos}</span>
                     )}
                   </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-12"><LegendItem label="Operational Node" color="bg-league-accent" /><LegendItem label="Strike Zone" color="bg-league-blue" /></div>
        </div>

        <div className="lg:col-span-4 bg-league-panel border border-league-border rounded-[3rem] p-8 flex flex-col shadow-2xl h-[600px]">
           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-6 border-b border-league-border pb-4 italic">Personnel Chips</h4>
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {rosterPool.map(p => (
                <div key={p.id} className="bg-league-bg border border-league-border p-4 rounded-2xl flex items-center justify-between group hover:border-league-accent transition-all">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-league-panel flex items-center justify-center font-black italic text-white text-xs">{p.fullName.charAt(0)}</div>
                    <div><div className="text-[11px] font-black italic uppercase text-white">{p.fullName}</div><div className="text-[8px] font-bold text-league-muted uppercase tracking-widest">{p.positions.join('/')}</div></div>
                  </div>
                  <button onClick={() => { const firstOpenSlot = FIELD_SLOTS.find(s => !assignments[s.id] && p.positions.includes(s.pos)); if (firstOpenSlot) handleAssign(firstOpenSlot.id, p); }} className="text-[8px] font-black uppercase text-league-accent hover:underline px-2">Slot</button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ label, color }: any) => (
  <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${color}`} /><span className="text-[9px] font-black uppercase text-league-muted tracking-widest italic">{label}</span></div>
);
