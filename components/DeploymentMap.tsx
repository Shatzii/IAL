import React from 'react';
import { Franchise, FRANCHISE_COLORS } from '../types';

const NODES = [
  { id: Franchise.NOTTINGHAM, x: 42, y: 35, label: 'NOT' },
  { id: Franchise.GLASGOW, x: 38, y: 22, label: 'GLA' },
  { id: Franchise.DUSSELDORF, x: 52, y: 42, label: 'DUS' },
  { id: Franchise.STUTTGART, x: 55, y: 48, label: 'STU' },
  { id: Franchise.ZURICH, x: 54, y: 55, label: 'ZUR' },
  { id: Franchise.BERLIN, x: 62, y: 38, label: 'BER' },
  { id: Franchise.FEHERVAR, x: 65, y: 52, label: 'FEH' },
  { id: Franchise.WROCLAW, x: 72, y: 35, label: 'WRO' },
  { id: Franchise.HAMBURG, x: 55, y: 32, label: 'HAM' },
  { id: Franchise.PRAGUE, x: 62, y: 45, label: 'PRG' },
  { id: Franchise.NORDIC_STORM, x: 54, y: 18, label: 'NOR' },
  { id: Franchise.VIENNA, x: 66, y: 48, label: 'VIE' },
  { id: Franchise.COLOGNE, x: 52, y: 45, label: 'CGN' },
  { id: Franchise.FRANKFURT, x: 54, y: 45, label: 'FRA' },
  { id: Franchise.MADRID, x: 30, y: 70, label: 'MAD' },
  { id: Franchise.MUNICH, x: 60, y: 52, label: 'MUN' },
  { id: Franchise.PARIS, x: 48, y: 48, label: 'PAR' },
  { id: Franchise.RAIDERS_TIROL, x: 58, y: 55, label: 'TIR' },
];

export const DeploymentMap: React.FC<{ activeFranchise?: Franchise }> = ({ activeFranchise }) => {
  return (
    <div className="relative w-full aspect-[16/9] bg-league-bg rounded-[2rem] border border-league-border overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1a1a1a 2px, transparent 2px)', backgroundSize: '20px 20px' }} />
      
      {/* Abstract Europe Shape (Simplified SVG Path) */}
      <svg className="w-full h-full opacity-20 transition-opacity group-hover:opacity-30" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M250 100 L350 50 L450 80 L600 50 L750 150 L700 400 L500 450 L300 400 L200 300 Z" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
      </svg>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {NODES.map((node, i) => (
          NODES.slice(i + 1).map((target, j) => (
            <line 
              key={`${i}-${j}`}
              x1={`${node.x}%`} y1={`${node.y}%`} 
              x2={`${target.x}%`} y2={`${target.y}%`} 
              stroke="white" strokeWidth="0.5" strokeOpacity="0.05"
              strokeDasharray="4 4"
            />
          ))
        ))}
      </svg>

      {/* Nodes */}
      {NODES.map(node => (
        <div 
          key={node.id}
          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-help ${activeFranchise === node.id ? 'z-20 scale-125' : 'z-10 opacity-60 hover:opacity-100 hover:scale-110'}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className="relative">
            <div 
              className={`w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse`}
              style={{ backgroundColor: FRANCHISE_COLORS[node.id] }}
            />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8px] font-black text-white tracking-widest uppercase shadow-2xl">
              {node.id}
            </div>
            {activeFranchise === node.id && (
               <div 
                 className="absolute -inset-4 rounded-full border border-white/20 animate-ping"
                 style={{ borderColor: FRANCHISE_COLORS[node.id] }}
               />
            )}
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-8 flex flex-col gap-1">
         <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic">Network Infrastructure</span>
         <span className="text-[7px] font-bold text-league-accent uppercase tracking-widest animate-pulse">● Global Deployment Ready</span>
      </div>
    </div>
  );
};