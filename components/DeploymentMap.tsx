import React from 'react';
import { Franchise, FRANCHISE_COLORS } from '../types';

const NODES = [
  { id: Franchise.GLASGOW, x: 37, y: 28, label: 'GLA' },
  { id: Franchise.NOTTINGHAM, x: 40, y: 36, label: 'NOT' },
  { id: Franchise.DUSSELDORF, x: 47, y: 41, label: 'DUS' },
  { id: Franchise.STUTTGART, x: 49, y: 46, label: 'STU' },
  { id: Franchise.ZURICH, x: 49, y: 52, label: 'ZUR' },
];

export const DeploymentMap: React.FC<{ activeFranchise?: Franchise }> = ({ activeFranchise }) => {
  return (
    <div className="relative w-full aspect-[16/10] bg-league-bg rounded-[2rem] border border-league-border overflow-hidden group shadow-2xl">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: 'radial-gradient(#1a1a1a 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
      
      {/* Stylistic Europe Path */}
      <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
        <svg 
          className="w-full h-full opacity-30 transition-all duration-700 group-hover:opacity-50 group-hover:scale-[1.02]" 
          viewBox="0 0 1000 800" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M280 180 L310 150 L350 160 L380 140 L420 160 L450 100 L480 80 L520 120 L550 100 L600 130 L650 100 L700 150 L750 180 L800 250 L850 350 L820 450 L750 550 L650 650 L550 700 L450 720 L350 700 L250 650 L150 550 L100 450 L120 350 L180 250 Z" 
            fill="#0a0a0a" 
            stroke="#222" 
            strokeWidth="2" 
            className="filter blur-[1px]"
          />
          {/* Detailed Europe approximation path (Simplified representation) */}
          <path 
            d="M325,188c-4-4-9-5-14-3c-5,2-11,0-12-6c-1-6,4-11,2-15c-2-4-8-4-10-8c-2-4-1-11,3-13c4-2,10-1,13,3c3,4,8,4,13,2 c5-2,11-5,14-10c3-5,7-9,13-10c6-1,11,1,16,5c5,4,11,6,17,5c6-1,12-4,18-3c6,1,10,6,12,12c2,6,1,12,3,17c2,5,7,8,12,7c5-1,10-4,16-5 c6-1,11,1,15,4c4,3,9,4,14,3c5-1,11-5,16-4c5,1,10,6,11,12c1,6-1,12-1,18c0,6,4,11,9,14c5,3,9,8,11,13c2,5,3,11,6,16c3,5,8,9,13,11 c5,2,11,3,14,7c3,4,5,10,4,16c-1,6-5,11-10,14c-5,3-8,8-10,14c-2,6-2,12-5,18c-3,6-8,10-14,12c-6,2-11,5-16,10c-5,5-8,12-10,18 c-2,6-5,12-10,16c-5,4-12,5-18,4c-6-1-12-3-17-7c-5-4-10-9-16-11c-6-2-12-1-18,2c-6,3-12,7-18,7c-6,0-12-4-17-10c-5-6-11-11-17-12 c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7c-6,0-12-4-17-10c-5-6-11-11-17-12 c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7c-6,0-12-4-17-10c-5-6-11-11-17-12 c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7c-6,0-12-4-17-10c-5-6-11-11-17-12 c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7s-12-4-17-10 c-5-6-11-11-17-12c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7s-12-4-17-10 c-5-6-11-11-17-12c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7s-12-4-17-10 c-5-6-11-11-17-12c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7s-12-4-17-10 c-5-6-11-11-17-12c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7s-12-4-17-10 c-5-6-11-11-17-12c-6-1-12,1-18,4c-6,3-12,6-18,6c-6,0-12-4-18-9c-6-5-12-9-19-10c-7-1-14,1-20,4c-6,3-12,7-18,7s-12-4-17-10 c-5-6-11-11-17-12c-6-1-12,1-18,4c-6,3-12,6-18,6" 
            stroke="#1a1a1a" 
            strokeWidth="1" 
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {NODES.map((node, i) => (
          NODES.slice(i + 1).map((target, j) => (
            <line 
              key={`${i}-${j}`}
              x1={`${node.x}%`} y1={`${node.y}%`} 
              x2={`${target.x}%`} y2={`${target.y}%`} 
              stroke="#e41d24" strokeWidth="0.5" strokeOpacity="0.1"
              strokeDasharray="4 4"
            />
          ))
        ))}
      </svg>

      {/* Nodes / Franchise Icons */}
      {NODES.map(node => (
        <div 
          key={node.id}
          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-help z-30 ${activeFranchise === node.id ? 'scale-150' : 'opacity-80 hover:opacity-100 hover:scale-125'}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className="relative">
            {/* Glowing Icon */}
            <div 
              className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white shadow-[0_0_15px_rgba(228,29,36,0.5)] transition-all duration-300`}
              style={{ backgroundColor: FRANCHISE_COLORS[node.id], boxShadow: `0 0 20px ${FRANCHISE_COLORS[node.id]}88` }}
            />
            
            {/* Label */}
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-black text-white tracking-widest uppercase shadow-2xl transition-all duration-300 ${activeFranchise === node.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              {node.id}
            </div>

            {/* Pulsing Aura for Active */}
            {activeFranchise === node.id && (
               <div 
                 className="absolute -inset-4 rounded-full border border-white/20 animate-ping"
                 style={{ borderColor: FRANCHISE_COLORS[node.id] }}
               />
            )}
            
            {/* Hover tooltip for inactive nodes */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[7px] font-bold text-white tracking-widest uppercase opacity-0 group-hover:opacity-40 transition-opacity">
              {node.label}
            </div>
          </div>
        </div>
      ))}

      {/* Map Legend / Telemetry */}
      <div className="absolute bottom-6 left-8 flex flex-col gap-1 z-40">
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-league-ok rounded-full animate-pulse shadow-[0_0_5px_#23d18b]" />
            <span className="text-[8px] font-bold text-league-ok uppercase tracking-widest">Network Synchronized</span>
         </div>
      </div>
      
      {/* Visual coordinates for styling */}
      <div className="absolute top-6 right-8 text-right z-40 opacity-20 hidden md:block">
         <div className="text-[7px] font-mono text-white/50 uppercase">LAT: 47.3769° N</div>
         <div className="text-[7px] font-mono text-white/50 uppercase">LNG: 8.5417° E</div>
      </div>
    </div>
  );
};