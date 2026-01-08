
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Profile, CombineResult, TalentTier } from '../types';

// Expert Benchmarks (Position-agnostic for MVP, usually position-specific)
const LEAGUE_BENCHMARKS = {
  forty: 4.75,
  bench: 18,
  vertical: 70
};

export const CombineEvaluation: React.FC = () => {
  const { activeEvaluationEvent, closeEvaluation, profiles, updateProfile, logActivity, gradingConfig } = useApp();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CombineResult>>({
    fortyYardDash: '',
    benchPressReps: 0,
    verticalJump_cm: 0,
    broadJump_cm: 0,
    recordedAt: new Date().toISOString(),
    recordedBy: 'LEAGUE_OFFICIAL_01'
  });

  if (!activeEvaluationEvent) return null;

  const filteredProfiles = profiles.filter(p => p.positions.length > 0);
  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const rasPercentiles = useMemo(() => {
    const p: Record<string, number> = {};
    
    if (formData.fortyYardDash) {
      const val = parseFloat(formData.fortyYardDash);
      // Average 4.75. Sub 4.4 is elite.
      p.forty = Math.max(0, Math.min(100, Math.round((5.5 - val) * 100)));
    }
    
    if (formData.benchPressReps !== undefined) {
      // Average 18. 35+ is elite.
      p.bench = Math.max(0, Math.min(100, Math.round((formData.benchPressReps / 35) * 100)));
    }

    if (formData.verticalJump_cm) {
      // Average 70. 110+ is elite.
      p.vertical = Math.max(0, Math.min(100, Math.round((formData.verticalJump_cm / 110) * 100)));
    }

    return Object.keys(p).length > 0 ? p : null;
  }, [formData]);

  const standings = useMemo(() => {
    return profiles
      .filter(p => p.combineResults && p.combineResults.length > 0)
      .map(p => ({
        id: p.id,
        name: p.fullName,
        forty: p.fortyYardDash,
        bench: p.benchPressReps,
        grade: p.scoutGrade
      }))
      .sort((a, b) => (b.grade || 0) - (a.grade || 0))
      .slice(0, 5);
  }, [profiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId || !selectedProfile) return;

    const newResult: CombineResult = {
      ...formData as CombineResult,
      recordedAt: new Date().toISOString()
    };

    const existingResults = selectedProfile.combineResults || [];
    
    const forty = parseFloat(formData.fortyYardDash || '5.0');
    const bench = formData.benchPressReps || 0;
    
    // Calculate new metrics based on raw performance
    const speedScore = Math.max(1, Math.min(10, Math.round((5.0 - forty) * 10 + 5)));
    const strengthScore = Math.max(1, Math.min(10, Math.round(bench / 4)));
    
    // Access existing or default metrics
    const baseMetrics = selectedProfile.metrics;
    const finalMetrics = {
      ...baseMetrics,
      speed: speedScore,
      strength: strengthScore
    };

    // Apply Global Grading Multipliers
    const weightedSum = (
      (finalMetrics.speed * gradingConfig.speedWeight) +
      (finalMetrics.strength * gradingConfig.strengthWeight) +
      (finalMetrics.agility * gradingConfig.agilityWeight) +
      (finalMetrics.iq * gradingConfig.iqWeight) +
      (finalMetrics.versatility * gradingConfig.versatilityWeight)
    );

    const totalPossibleWeights = (
      gradingConfig.speedWeight + 
      gradingConfig.strengthWeight + 
      gradingConfig.agilityWeight + 
      gradingConfig.iqWeight + 
      gradingConfig.versatilityWeight
    );

    const calculatedGrade = Number((weightedSum / totalPossibleWeights).toFixed(1));

    updateProfile(selectedProfileId, {
      combineResults: [newResult, ...existingResults],
      fortyYardDash: formData.fortyYardDash,
      benchPressReps: formData.benchPressReps,
      metrics: finalMetrics,
      scoutGrade: calculatedGrade
    });

    logActivity('COMBINE_RESULT', `Official result committed for ${selectedProfile.fullName} (Grade: ${calculatedGrade})`, selectedProfileId);
    setSelectedProfileId(null);
    setFormData({
      fortyYardDash: '',
      benchPressReps: 0,
      verticalJump_cm: 0,
      broadJump_cm: 0,
      recordedAt: new Date().toISOString(),
      recordedBy: 'LEAGUE_OFFICIAL_01'
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex justify-between items-center bg-league-panel p-6 border-l-4 border-league-accent rounded-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-league-accent p-3 rounded-lg animate-pulse">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Scouting Live</h2>
            <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold mt-1">
              {activeEvaluationEvent.title} • {standingStatus(standings.length)}
            </p>
          </div>
        </div>
        <button onClick={closeEvaluation} className="bg-league-bg border border-league-border text-league-muted hover:text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">End Session</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Check-in List */}
        <div className="lg:col-span-3 bg-league-panel border border-league-border rounded-xl flex flex-col h-[700px] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-league-border bg-league-tableHeader">
            <h4 className="text-[10px] font-black uppercase text-league-muted tracking-widest mb-3">Athletes on Field</h4>
            <input type="text" placeholder="Filter by Name..." className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-xs font-bold uppercase outline-none focus:border-league-accent" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {filteredProfiles.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${
                  selectedProfileId === p.id 
                    ? 'bg-league-accent border-league-accent text-white shadow-lg' 
                    : 'bg-league-bg border-league-border text-league-muted hover:border-league-muted'
                }`}
              >
                <div className="text-left">
                  <div className="text-[11px] font-black italic uppercase group-hover:text-white">{p.fullName}</div>
                  <div className="text-[8px] font-bold uppercase opacity-50">{p.positions[0]} • {p.nationality}</div>
                </div>
                {p.combineResults && p.combineResults.length > 0 && (
                  <div className="bg-league-ok/20 text-league-ok rounded-full p-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live Data Entry & Integrated Percentiles */}
        <div className="lg:col-span-6 bg-league-panel border border-league-border rounded-xl p-8 shadow-2xl overflow-y-auto h-[700px] custom-scrollbar">
          {!selectedProfileId ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale py-20">
              <svg className="w-20 h-20 mb-6 text-league-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              <p className="font-black italic uppercase tracking-[0.2em] text-sm text-center">Awaiting Selection<br/><span className="text-[10px] mt-2 block">Choose an athlete from the pool to begin evaluation</span></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-6 pb-8 border-b border-league-border">
                <div className="relative">
                  <img src={selectedProfile?.avatar_url} className="w-24 h-24 rounded-2xl border-2 border-league-accent shadow-xl object-cover" alt="" />
                  <div className="absolute -top-3 -left-3 bg-league-bg border border-league-accent px-2 py-1 rounded text-[8px] font-black uppercase text-league-accent">ID: {selectedProfile?.id}</div>
                </div>
                <div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{selectedProfile?.fullName}</h3>
                  <div className="flex gap-2">
                    {selectedProfile?.positions.map(pos => (
                      <span key={pos} className="bg-league-pill border border-league-border px-2 py-0.5 rounded text-[10px] font-black uppercase text-league-muted">{pos}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <MetricInputWithPercentile 
                  label="40-Yard Dash"
                  subLabel="Track Timing (Sec)"
                  value={formData.fortyYardDash || ''}
                  onChange={v => setFormData({...formData, fortyYardDash: v})}
                  percentile={rasPercentiles?.forty}
                  benchmark={LEAGUE_BENCHMARKS.forty}
                  benchmarkLabel="Avg: 4.75s"
                  placeholder="e.g. 4.45"
                  type="text"
                  isLowerBetter={true}
                />

                <MetricInputWithPercentile 
                  label="Bench Press"
                  subLabel="225lb Power Reps"
                  value={formData.benchPressReps || 0}
                  onChange={v => setFormData({...formData, benchPressReps: parseInt(v) || 0})}
                  percentile={rasPercentiles?.bench}
                  benchmark={LEAGUE_BENCHMARKS.bench}
                  benchmarkLabel="Avg: 18"
                  placeholder="0"
                  type="number"
                  isLowerBetter={false}
                />

                <MetricInputWithPercentile 
                  label="Vertical Jump"
                  subLabel="Explosive Power (cm)"
                  value={formData.verticalJump_cm || 0}
                  onChange={v => setFormData({...formData, verticalJump_cm: parseInt(v) || 0})}
                  percentile={rasPercentiles?.vertical}
                  benchmark={LEAGUE_BENCHMARKS.vertical}
                  benchmarkLabel="Avg: 70cm"
                  placeholder="0"
                  type="number"
                  isLowerBetter={false}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-league-muted tracking-[0.2em] mb-1">Shuttle / 3-Cone</h4>
                      <p className="text-[8px] font-bold text-league-muted/50 uppercase">Agility Metrics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Shuttle" className="bg-league-bg border border-league-border p-3 rounded-lg text-white font-bold text-sm focus:border-league-accent outline-none" />
                    <input type="text" placeholder="3-Cone" className="bg-league-bg border border-league-border p-3 rounded-lg text-white font-bold text-sm focus:border-league-accent outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-league-accent/5 border border-league-accent/20 p-6 rounded-2xl">
                 <div className="flex justify-between items-center mb-4">
                   <h5 className="text-[10px] font-black uppercase text-league-accent tracking-widest">Scout's Executive Feedback</h5>
                   <span className="text-[8px] font-black uppercase bg-league-accent text-white px-2 py-0.5 rounded">Live AI Preview</span>
                 </div>
                 <p className="text-xs text-league-muted italic leading-relaxed">
                   {rasPercentiles ? 
                     generateFeedback(rasPercentiles) : 
                     "Enter raw metrics to generate immediate athletic profile feedback."
                   }
                 </p>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-league-accent text-white py-5 rounded-xl font-black italic uppercase tracking-widest text-sm hover:brightness-110 shadow-[0_0_30px_rgba(228,29,36,0.3)] hover:-translate-y-1 transition-all"
                >
                  Confirm & Commit Official Data
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedProfileId(null)}
                  className="bg-league-bg border border-league-border text-league-muted px-10 py-5 rounded-xl font-black italic uppercase tracking-widest text-sm hover:text-white transition-all"
                >
                  Discard
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Live Standings / Leaderboard */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-league-panel border border-league-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-league-accent rounded-full" />
              <h4 className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Session High-Performers</h4>
            </div>
            
            <div className="space-y-4">
              {standings.map((entry, idx) => (
                <div key={entry.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-black italic text-league-muted w-4">#{idx+1}</span>
                    <div>
                      <div className="text-[11px] font-black uppercase text-white group-hover:text-league-accent transition-colors">{entry.name}</div>
                      <div className="text-[8px] font-bold text-league-muted uppercase">Grade: {entry.grade}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black italic text-league-accent">{entry.forty}s</div>
                  </div>
                </div>
              ))}
              {standings.length === 0 && (
                <div className="text-center py-10 opacity-30 text-[9px] font-black uppercase italic">No records committed.</div>
              )}
            </div>
          </div>

          <div className="bg-league-panel border border-league-border rounded-xl p-6 shadow-xl border-t-4 border-t-league-blue">
             <h4 className="text-[10px] font-black uppercase text-league-blue tracking-widest mb-4">Historical RAS Average</h4>
             <div className="space-y-4">
               <HistoricalRef label="40-Yard" val="4.75s" />
               <HistoricalRef label="Bench" val="18 Reps" />
               <HistoricalRef label="Vertical" val="70.0cm" />
             </div>
             <p className="text-[8px] text-league-muted mt-6 italic font-bold leading-relaxed">
               Current session is performing <span className="text-league-ok">3.4% above</span> historical league mean.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// UI Component for Input with immediate Percentile Feedback and Variance
const MetricInputWithPercentile = ({ label, subLabel, value, onChange, percentile, benchmark, benchmarkLabel, placeholder, type, isLowerBetter }: any) => {
  const numVal = parseFloat(value) || 0;
  const diff = isLowerBetter ? benchmark - numVal : numVal - benchmark;
  const isPositive = diff > 0;
  
  return (
    <div className="space-y-4 group">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-[10px] font-black uppercase text-league-muted tracking-[0.2em] mb-1 group-hover:text-league-accent transition-colors">{label}</h4>
          <p className="text-[8px] font-bold text-league-muted/50 uppercase">{subLabel}</p>
        </div>
        {value && (
          <div className="text-right">
             <div className={`text-[8px] font-black uppercase italic mb-1 ${isPositive ? 'text-league-ok' : 'text-league-accent'}`}>
               {isPositive ? '+' : ''}{diff.toFixed(2)} from Avg
             </div>
             <span className={`text-sm font-black italic ${percentile > 80 ? 'text-league-ok' : percentile > 50 ? 'text-league-blue' : 'text-league-warn'}`}>
               {percentile || 0}% Rank
             </span>
          </div>
        )}
      </div>
      
      <div className="relative">
        <input 
          required
          type={type}
          step="any"
          placeholder={placeholder}
          className="w-full bg-league-bg border border-league-border p-5 rounded-2xl text-3xl font-black italic text-white focus:border-league-accent focus:ring-1 focus:ring-league-accent outline-none transition-all shadow-inner"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        
        {/* RAS Percentile Bar with Median Marker */}
        <div className="absolute bottom-[-8px] left-4 right-4 h-2 bg-league-panel rounded-full overflow-hidden border border-league-border">
          {/* Median Marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-league-muted/30 z-10" />
          
          <div 
            className="h-full transition-all duration-700 ease-out" 
            style={{ 
              width: `${percentile || 0}%`, 
              backgroundColor: percentile > 80 ? '#23d18b' : percentile > 50 ? '#40a9ff' : '#e41d24' 
            }} 
          />
        </div>
        
        {/* Label for the Median Line */}
        <div className="absolute bottom-[-22px] left-1/2 transform -translate-x-1/2 text-[7px] font-black uppercase text-league-muted tracking-widest">
          {benchmarkLabel}
        </div>
      </div>
    </div>
  );
};

const HistoricalRef = ({ label, val }: { label: string, val: string }) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase">
    <span className="text-league-muted">{label}</span>
    <span className="text-white opacity-50">{val}</span>
  </div>
);

function standingStatus(count: number) {
  if (count === 0) return "SESSION OPEN";
  if (count < 5) return "DATA STREAMING";
  return "HIGH ACTIVITY";
}

function generateFeedback(p: Record<string, number>) {
  const scores = Object.values(p);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (avg > 90) return "ELITE ATHLETIC PHENOM. Profile indicates high-level franchise potential with top-tier explosiveness.";
  if (avg > 75) return "HIGHLY COMPETITIVE STARTER. Strong measurable performance across multiple power and speed categories.";
  if (p.forty > 85) return "PURE SPEED SPECIALIST. While overall metrics vary, horizontal speed is at a league-leading level.";
  if (p.bench > 85) return "POWERHOUSE SPECIMEN. Exceptional upper body density and strength leverage confirmed.";
  
  return "SYSTEMIC ATHLETE. Metrics align with league development standards. Recommended for situational role evaluation.";
}
