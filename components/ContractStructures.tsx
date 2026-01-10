import React, { useState, useMemo } from 'react';
import { useApp } from '../App';

type StructureOption = 'A' | 'B';

export const ContractStructures: React.FC = () => {
  const { addToast } = useApp();
  const [option, setOption] = useState<StructureOption>('A');
  const [villaEnabled, setVillaEnabled] = useState(true);
  const [bedsUsed, setBedsUsed] = useState(10);

  // League Constants
  const ROSTER_SIZE = 25;
  const SEASON_GAMES = 12;
  const MONTHS_IN_SEASON = 2.5;
  const VILLA_RENT_MONTHLY = 4000;
  const VILLA_TOTAL_RENT = 10000; // Fixed for 2.5 months
  const PAYROLL_CAP_PER_GAME = 25000;
  const WIN_BONUS_POOL = 1000;

  // Calculation Logic
  const totals = useMemo(() => {
    let perGameCash = PAYROLL_CAP_PER_GAME;
    let housingReserve = 0;
    let villaRent = villaEnabled ? VILLA_TOTAL_RENT : 0;

    if (option === 'B' && villaEnabled) {
      perGameCash = 24000;
      housingReserve = SEASON_GAMES * 1000; // $12,000
    }

    const seasonCash = perGameCash * SEASON_GAMES;
    const totalOutlay = seasonCash + (option === 'A' ? villaRent : housingReserve);
    const perPlayerHousingValue = villaEnabled && bedsUsed > 0 
      ? Math.round(VILLA_TOTAL_RENT / bedsUsed) 
      : 0;

    return {
      perGameCash,
      seasonCash,
      villaRent,
      housingReserve,
      totalOutlay,
      perPlayerHousingValue
    };
  }, [option, villaEnabled, bedsUsed]);

  const recommendedRoster = useMemo(() => {
    if (option === 'A' || !villaEnabled) {
      return [
        { tier: 'Tier 1', count: 4, pay: 2200 },
        { tier: 'Tier 2', count: 15, pay: 1000 },
        { tier: 'Tier 3', count: 6, pay: 200 },
      ];
    } else {
      // Option B + Villa Enabled
      return [
        { tier: 'Tier 1', count: 4, pay: 2200 },
        { tier: 'Tier 2', count: 13, pay: 1000 },
        { tier: 'Tier 3', count: 8, pay: 275 },
      ];
    }
  }, [option, villaEnabled]);

  const copyToClipboard = () => {
    const summary = {
      optionSelected: option,
      villaEnabled,
      bedsUsed,
      recommendedRoster,
      perGameCashTotal: totals.perGameCash,
      seasonCashTotal: totals.seasonCash,
      villaRentSeason: totals.villaRent,
      housingReserveSeason: totals.housingReserve,
      totalOutlaySeason: totals.totalOutlay,
      winBonusPerMatch: WIN_BONUS_POOL,
      notes: "Generated from IAL OS Contract Structure Node."
    };
    
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2))
      .then(() => addToast("Franchise Summary JSON Copied to Clipboard", "success"))
      .catch(() => addToast("Failed to copy JSON", "error"));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-6xl mx-auto">
      {/* 1) Header Panel */}
      <section className="bg-league-panel border border-league-border p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-3">Franchise Contract Structures</h2>
          <p className="text-league-muted uppercase tracking-[0.4em] text-[10px] font-black italic mb-10 opacity-70">League-approved roster pay models + optional villa housing</p>
          
          <div className="flex flex-wrap gap-8 items-center pt-8 border-t border-white/5">
            <FactItem label="Roster" val={`${ROSTER_SIZE} Players`} />
            <FactItem label="Schedule" val={`${SEASON_GAMES} Games`} />
            <FactItem label="Pay Basis" val="Game-Day Checks" />
            <FactItem label="Payroll Cap" val={`$${PAYROLL_CAP_PER_GAME.toLocaleString()}/Game`} color="text-league-accent" />
            <FactItem label="Villa Rent" val={`$${VILLA_RENT_MONTHLY.toLocaleString()}/Mo`} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 2) Large Option Cards */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OptionCard 
              id="A" 
              title="OPTION A" 
              subtitle="Villa as Separate Ops Line"
              desc="Standard league model. Villa costs are managed as a separate line item. Player checks remain at the full $25,000 per-game cap."
              isSelected={option === 'A'}
              onSelect={() => setOption('A')}
            />
            <OptionCard 
              id="B" 
              title="OPTION B" 
              subtitle="Villa Carved Into Budget"
              desc="Budget-neutral model. $1,000/game is reserved for the housing pool ($12,000/season). This leaves $24,000/game for cash player checks."
              isSelected={option === 'B'}
              onSelect={() => setOption('B')}
            />
          </div>

          {/* 3) Villa Config Panel */}
          <div className="bg-league-panel border border-league-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
              <div>
                <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">Villa Configuration</h3>
                <p className="text-[9px] font-bold text-league-muted uppercase tracking-widest italic opacity-50">Manage local node housing allocation</p>
              </div>
              <div className="flex items-center gap-4 bg-league-bg p-2 rounded-2xl border border-league-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-league-muted ml-2">Include Villa?</span>
                <button 
                  onClick={() => setVillaEnabled(!villaEnabled)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${villaEnabled ? 'bg-league-ok text-black shadow-lg' : 'bg-league-pill text-league-muted'}`}
                >
                  {villaEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            {villaEnabled ? (
              <div className="space-y-10 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ConfigStat label="Villa Season Rent" val={`$${VILLA_TOTAL_RENT.toLocaleString()}`} />
                  <ConfigStat label="Bed Capacity" val="10 Beds" />
                  <ConfigStat label="Season Value/Bed" val={`$${totals.perPlayerHousingValue.toLocaleString()}`} color="text-league-blue" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black uppercase text-league-muted tracking-widest">Beds Utilized (0 - 10)</label>
                    <span className="text-2xl font-black italic text-league-accent">{bedsUsed}</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    className="w-full h-2 bg-league-bg rounded-full accent-league-accent cursor-pointer border border-league-border shadow-inner"
                    value={bedsUsed}
                    onChange={(e) => setBedsUsed(parseInt(e.target.value))}
                  />
                  <p className="text-[9px] text-league-muted/40 font-bold italic leading-relaxed uppercase mt-4">
                    Assignment Strategy: Housing can be assigned to Tier 1 and/or Tier 3 players based on franchise strategy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-league-border rounded-[2rem] opacity-20 italic font-black uppercase text-[10px] tracking-widest">
                Housing Node Offline
              </div>
            )}
          </div>

          {/* 4) Recommended Roster Table */}
          <div className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none">Recommended Roster Structure</h3>
              <span className="text-[9px] font-black uppercase bg-league-accent/10 text-league-accent px-3 py-1 rounded-full border border-league-accent/20 italic">
                {option === 'B' && villaEnabled ? 'Option B Optimized' : 'Option A Standard'}
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-league-tableHeader/50 border-b border-league-border">
                <tr className="text-[8px] font-black uppercase tracking-[0.3em] text-league-muted">
                  <th className="px-8 py-5">Talent Tier</th>
                  <th className="px-8 py-5">Count</th>
                  <th className="px-8 py-5">Pay / Game</th>
                  <th className="px-8 py-5 text-right">Per Game Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-league-border">
                {recommendedRoster.map((r, i) => (
                  <tr key={i} className="hover:bg-league-bg/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                        r.tier === 'Tier 1' ? 'bg-league-accent text-white border-league-accent' : 
                        r.tier === 'Tier 2' ? 'bg-league-blue text-white border-league-blue' : 
                        'bg-league-pill text-league-muted border-league-border'
                      }`}>
                        {r.tier}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-white italic">{r.count} Players</td>
                    <td className="px-8 py-5 font-black text-league-muted italic">${r.pay.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-mono text-xs font-black italic text-white">
                      ${(r.count * r.pay).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-league-tableHeader/30">
                  <td colSpan={3} className="px-8 py-5 text-[10px] font-black uppercase text-league-muted italic tracking-widest">
                    Operational Cash Outlay (Per Game)
                  </td>
                  <td className="px-8 py-5 text-right font-mono text-lg font-black italic text-league-accent">
                    ${totals.perGameCash.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5) Live Calculator & Export */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-league-panel border-4 border-league-accent p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none mb-10 border-b border-white/5 pb-6">Node Fiscal Projection</h3>
            
            <div className="space-y-8">
              <TotalRow label="Per-Game Cash Checks" val={`$${totals.perGameCash.toLocaleString()}`} />
              <TotalRow label="Season Cash Checks" val={`$${totals.seasonCash.toLocaleString()}`} />
              
              {villaEnabled && (
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <TotalRow label="Villa Rent (Season)" val={`$${totals.villaRent.toLocaleString()}`} size="sm" />
                  {option === 'B' && (
                    <div className="p-4 bg-league-bg rounded-xl border border-league-blue/30 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase italic text-league-blue">
                        <span>Housing Reserve</span>
                        <span>$12,000</span>
                      </div>
                      <p className="text-[7px] text-league-muted font-bold uppercase leading-relaxed opacity-60">
                        Covers $10,000 rent + $2,000 buffer for utilities/incidentals.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-10 border-t-2 border-league-accent/50">
                <div className="text-[9px] font-black uppercase text-league-accent tracking-[0.4em] mb-2">Total Season Outlay</div>
                <div className="text-5xl font-black italic text-white tracking-tighter leading-none">
                  ${totals.totalOutlay.toLocaleString()}
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <div className="flex justify-between items-center text-[11px] font-black uppercase text-white italic">
                  <span>Win Bonus Pool</span>
                  <span className="text-league-ok">$1,000 / Win</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <BonusPill label="T1" pct="0%" />
                  <BonusPill label="T2" pct="70%" color="bg-league-blue" />
                  <BonusPill label="T3" pct="30%" color="bg-league-pill" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              className="w-full bg-league-accent text-white py-5 rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl hover:brightness-110 hover:-translate-y-1 transition-all"
            >
              Contact League Office
            </button>
            <button 
              className="w-full bg-league-panel border border-league-border text-white py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:border-league-accent transition-all"
            >
              Download Summary PDF
            </button>
            <button 
              onClick={copyToClipboard}
              className="w-full bg-league-bg border border-league-border text-league-muted py-4 rounded-2xl font-black italic uppercase tracking-widest text-[9px] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3"></path></svg>
              Copy Franchise Summary JSON
            </button>
          </div>
        </div>
      </div>

      {/* 3-Tier System Explanation */}
      <section className="bg-league-panel border border-league-border p-10 rounded-[2.5rem] shadow-2xl">
        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none mb-10 border-b border-white/5 pb-6">3-Tier Talent Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <TierInfo tier="TIER 1" label="Franchise Athletes" desc="Premium personnel with negotiated game checks. Central focal points for marketing and elite tactical execution." color="text-league-accent" />
          <TierInfo tier="TIER 2" label="Core Starters" desc="Elite reliable personnel receiving the league-standard $1,000 per-game check. The engine of the roster density." color="text-league-blue" />
          <TierInfo tier="TIER 3" label="Development Unit" desc="Strategic depth. Lower cash checks with optional villa housing and food support incentives." color="text-league-muted" />
        </div>
      </section>

      {/* 
        DEVELOPER NOTE:
        To integrate with a backend, POST the JSON generated by copyToClipboard() to:
        Endpoint: /api/v1/franchise/contract-config
        Auth: Use standard session handshake.
        Validation: Ensure tier counts sum to exactly 25 and per-game cash <= cap.
      */}
    </div>
  );
};

const FactItem = ({ label, val, color = 'text-white' }: any) => (
  <div className="space-y-1">
    <div className="text-[8px] font-black uppercase text-league-muted tracking-widest">{label}</div>
    <div className={`text-[12px] font-black italic uppercase ${color}`}>{val}</div>
  </div>
);

const OptionCard = ({ title, subtitle, desc, isSelected, onSelect }: any) => (
  <div 
    onClick={onSelect}
    className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all relative overflow-hidden group shadow-xl h-full flex flex-col ${
      isSelected 
        ? 'bg-league-accent/10 border-league-accent shadow-[0_0_30px_rgba(228,29,36,0.15)]' 
        : 'bg-league-panel border-league-border hover:border-league-muted grayscale opacity-60'
    }`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-league-accent border-league-accent' : 'border-league-muted'}`}>
        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <div className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-league-accent' : 'text-league-muted'}`}>{title}</div>
    </div>
    <h4 className="text-xl font-black italic uppercase text-white leading-tight mb-4 tracking-tighter">{subtitle}</h4>
    <p className="text-[11px] font-bold text-league-muted leading-relaxed uppercase italic opacity-70 group-hover:opacity-100 transition-opacity">
      {desc}
    </p>
  </div>
);

const ConfigStat = ({ label, val, color = 'text-white' }: any) => (
  <div className="bg-league-bg p-5 rounded-2xl border border-league-border shadow-inner group hover:border-league-accent transition-colors">
    <div className="text-[8px] font-black text-league-muted uppercase mb-1 tracking-widest group-hover:text-league-accent transition-colors">{label}</div>
    <div className={`text-2xl font-black italic ${color}`}>{val}</div>
  </div>
);

const TotalRow = ({ label, val, size = 'lg' }: any) => (
  <div className="flex justify-between items-end group">
    <div className={`font-black uppercase text-league-muted tracking-widest italic group-hover:text-white transition-colors ${size === 'lg' ? 'text-[11px]' : 'text-[9px]'}`}>{label}</div>
    <div className={`font-black italic text-white tracking-tighter ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>{val}</div>
  </div>
);

const BonusPill = ({ label, pct, color = 'bg-league-accent' }: any) => (
  <div className={`${color} px-3 py-1.5 rounded-lg flex justify-between items-center shadow-md`}>
    <span className="text-[8px] font-black text-white">{label}</span>
    <span className="text-[10px] font-black italic text-white">{pct}</span>
  </div>
);

const TierInfo = ({ tier, label, desc, color }: any) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <span className={`text-3xl font-black italic ${color}`}>{tier}</span>
      <div className="h-0.5 w-8 bg-white/10" />
    </div>
    <h4 className="text-[12px] font-black uppercase text-white tracking-widest">{label}</h4>
    <p className="text-[10px] text-league-muted font-bold italic leading-relaxed uppercase opacity-70">{desc}</p>
  </div>
);