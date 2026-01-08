
import React from 'react';
import { useApp } from '../App';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TalentTier } from '../types';

const TierBadge: React.FC<{ tier: TalentTier }> = ({ tier }) => {
  const getColors = () => {
    switch (tier) {
      case TalentTier.TIER1:
        return 'bg-league-accent text-white border-league-accent shadow-[0_0_10px_rgba(228,29,36,0.3)]';
      case TalentTier.TIER2:
        return 'bg-league-blue text-white border-league-blue shadow-[0_0_10px_rgba(64,169,255,0.3)]';
      case TalentTier.TIER3:
        return 'bg-league-pill text-league-muted border-league-border';
      default:
        return 'bg-league-bg text-white border-league-border';
    }
  };

  return (
    <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getColors()}`}>
      {tier}
    </span>
  );
};

export const ComparisonView: React.FC = () => {
  const { profiles, comparisonIds, toggleComparison } = useApp();
  
  const selectedProfiles = profiles.filter(p => comparisonIds.includes(p.id));

  const radarData = [
    { subject: 'Speed', A: selectedProfiles[0]?.metrics.speed || 0, B: selectedProfiles[1]?.metrics.speed || 0 },
    { subject: 'Strength', A: selectedProfiles[0]?.metrics.strength || 0, B: selectedProfiles[1]?.metrics.strength || 0 },
    { subject: 'Agility', A: selectedProfiles[0]?.metrics.agility || 0, B: selectedProfiles[1]?.metrics.agility || 0 },
    { subject: 'IQ', A: selectedProfiles[0]?.metrics.iq || 0, B: selectedProfiles[1]?.metrics.iq || 0 },
    { subject: 'Versatility', A: selectedProfiles[0]?.metrics.versatility || 0, B: selectedProfiles[1]?.metrics.versatility || 0 },
  ];

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Tale of the Tape</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">Side-by-Side Recruitment Analysis</p>
        </div>
        <div className="text-[10px] font-black uppercase text-league-muted bg-league-panel px-4 py-2 border border-league-border rounded-lg">
          {selectedProfiles.length}/2 Prospects Locked
        </div>
      </div>

      {selectedProfiles.length === 0 ? (
        <div className="bg-league-panel border-2 border-dashed border-league-border rounded-3xl p-20 text-center">
           <p className="text-league-muted font-black italic uppercase tracking-widest">No prospects selected. Add them from the Pool view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player 1 */}
          <div className="bg-league-panel border border-league-border rounded-2xl p-8 space-y-6 relative border-l-4 border-l-league-accent shadow-2xl">
            <button onClick={() => toggleComparison(selectedProfiles[0].id)} className="absolute top-4 right-4 text-league-accent font-black text-xl hover:scale-110 transition-transform">×</button>
            <div className="text-center">
              <div className="relative inline-block">
                <img src={selectedProfiles[0].avatar_url} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-league-accent shadow-xl" alt="" />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                   <TierBadge tier={selectedProfiles[0].tier} />
                </div>
              </div>
              <h3 className="text-2xl font-black italic uppercase mt-4 text-white leading-tight">{selectedProfiles[0].fullName}</h3>
              <p className="text-[10px] font-black uppercase text-league-muted tracking-widest">{selectedProfiles[0].nationality}</p>
            </div>
            <div className="space-y-4 border-t border-league-border pt-6">
              <MetricRow label="Grade" value={selectedProfiles[0].scoutGrade} />
              <MetricRow label="40-Yard" value={selectedProfiles[0].fortyYardDash} />
              <MetricRow label="Bench" value={`${selectedProfiles[0].benchPressReps || '--'} Reps`} />
              <MetricRow label="Weight" value={`${selectedProfiles[0].weight_kg || 'N/A'} kg`} />
            </div>
          </div>

          {/* Central Comparison Chart */}
          <div className="bg-league-panel border border-league-border rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-league-accent mb-8">Metrics Variance Overlap</h4>
             <div className="w-full h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                   <PolarGrid stroke="#333" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#555', fontSize: 10, fontWeight: 'bold' }} />
                   <Radar name={selectedProfiles[0]?.fullName} dataKey="A" stroke="#e41d24" fill="#e41d24" fillOpacity={0.6} strokeWidth={2} />
                   {selectedProfiles[1] && <Radar name={selectedProfiles[1]?.fullName} dataKey="B" stroke="#40a9ff" fill="#40a9ff" fillOpacity={0.4} strokeWidth={2} />}
                   <Legend wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '8px', fontWeight: 'bold', letterSpacing: '1px' }} />
                   <Tooltip contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '8px', fontSize: '10px' }} />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
             <p className="text-[8px] text-league-muted font-bold italic uppercase mt-4 text-center">Difference shading denotes metric superiority</p>
          </div>

          {/* Player 2 */}
          <div className={`bg-league-panel border border-league-border rounded-2xl p-8 space-y-6 relative transition-all shadow-2xl ${selectedProfiles[1] ? 'border-l-4 border-l-league-blue' : 'opacity-40 grayscale'}`}>
            {selectedProfiles[1] ? (
              <>
                <button onClick={() => toggleComparison(selectedProfiles[1].id)} className="absolute top-4 right-4 text-league-accent font-black text-xl hover:scale-110 transition-transform">×</button>
                <div className="text-center">
                  <div className="relative inline-block">
                    <img src={selectedProfiles[1].avatar_url} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-league-blue shadow-xl" alt="" />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                       <TierBadge tier={selectedProfiles[1].tier} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase mt-4 text-white leading-tight">{selectedProfiles[1].fullName}</h3>
                  <p className="text-[10px] font-black uppercase text-league-muted tracking-widest">{selectedProfiles[1].nationality}</p>
                </div>
                <div className="space-y-4 border-t border-league-border pt-6">
                  <MetricRow label="Grade" value={selectedProfiles[1].scoutGrade} />
                  <MetricRow label="40-Yard" value={selectedProfiles[1].fortyYardDash} />
                  <MetricRow label="Bench" value={`${selectedProfiles[1].benchPressReps || '--'} Reps`} />
                  <MetricRow label="Weight" value={`${selectedProfiles[1].weight_kg || 'N/A'} kg`} />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-league-bg border-2 border-dashed border-league-border mb-4 flex items-center justify-center">
                  <span className="text-league-muted font-black">+</span>
                </div>
                <p className="text-[9px] font-black italic uppercase tracking-widest text-league-muted">Waiting for Comparison Subject 2...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-[11px] group">
    <span className="font-black uppercase text-league-muted tracking-widest group-hover:text-white transition-colors">{label}</span>
    <span className="font-black italic text-white">{value || 'N/A'}</span>
  </div>
);
