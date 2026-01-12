
import React, { useState, useEffect } from 'react';
import { Franchise, FRANCHISE_COLORS } from '../types';

const NODES = [
  { id: Franchise.GLASGOW, x: 37, y: 28, label: 'GLA' },
  { id: Franchise.NOTTINGHAM, x: 40, y: 36, label: 'NOT' },
  { id: Franchise.DUSSELDORF, x: 47, y: 41, label: 'DUS' },
  { id: Franchise.STUTTGART, x: 49, y: 46, label: 'STU' },
  { id: Franchise.ZURICH, x: 49, y: 52, label: 'ZUR' },
];

export const DeploymentMap: React.FC<{ activeFranchise?: Franchise }> = ({ activeFranchise }) => {
  const [pings, setPings] = useState<{ id: string; x: number; y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
        const node = NODES[Math.floor(Math.random() * NODES.length)];
        const id = Math.random().toString();
        setPings(prev => [...prev, { id, x: node.x, y: node.y }].slice(-5));
        setTimeout(() => setPings(p => p.filter(px => px.id !== id)), 2000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] bg-league-bg rounded-[2rem] border border-league-border overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: 'radial-gradient(#1a1a1a 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
      
      <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
        <svg className="w-full h-full opacity-30 transition-all duration-700 group-hover:opacity-50" viewBox="0 0 1000 800" fill="none">
          <path d="M280 180 L310 150 L350 160 L380 140 L420 160 L450 100 L480 80 L520 120 L550 100 L600 130 L650 100 L700 150 L750 180 L800 250 L850 350 L820 450 L750 550 L650 650 L550 700 L450 720 L350 700 L250 650 L150 550 L100 450 L120 350 L180 250 Z" fill="#0a0a0a" stroke="#222" strokeWidth="2" />
        </svg>
      </div>

      {pings.map(p => (
          <div key={p.id} className="absolute w-12 h-12 rounded-full border border-league-accent/40 animate-ping pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }} />
      ))}

      {NODES.map(node => (
        <div key={node.id} className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-30 ${activeFranchise === node.id ? 'scale-150' : 'opacity-80'}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
          <div className="relative">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white shadow-[0_0_15px_rgba(228,29,36,0.5)]" style={{ backgroundColor: FRANCHISE_COLORS[node.id] }} />
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-black text-white tracking-widest uppercase shadow-2xl transition-all ${activeFranchise === node.id ? 'opacity-100' : 'opacity-0'}`}>
              {node.id}
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-8 flex flex-col gap-1 z-40">
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-league-accent rounded-full animate-pulse shadow-[0_0_8px_#e41d24]" />
            <span className="text-[8px] font-bold text-white uppercase tracking-widest">Live Activity Telemetry Active</span>
         </div>
      </div>
    </div>
  );
};
