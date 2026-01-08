
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../App';
import { Franchise, ContractStatus, Profile, TalentTier, SystemRole } from '../types';

const POSITION_GROUPS = {
  OFFENSE: ['QB', 'WR', 'RB', 'FB', 'OL', 'OS'],
  DEFENSE: ['DL', 'LB', 'DB', 'DS'],
  SPECIALISTS: ['K', 'P', 'LS', 'KR', 'PR']
};

const COLORS = ['#e41d24', '#40a9ff', '#23d18b', '#ffb84d', '#bdbdbd', '#722ed1'];

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

export const FranchiseAdmin: React.FC = () => {
  const { profiles, updateProfile, watchlistIds, logActivity, alertConfigs, currentSystemRole } = useApp();
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [activeSubView, setActiveSubView] = useState<'Roster' | 'DepthChart' | 'Watchlist' | 'Contracts' | 'Finance'>('Roster');
  const [editingPlayer, setEditingPlayer] = useState<Profile | null>(null);

  const roster = profiles.filter(p => p.assignedFranchise === selectedFranchise);
  const config = alertConfigs[selectedFranchise];
  
  const canEditTier = currentSystemRole === SystemRole.LEAGUE_ADMIN || currentSystemRole === SystemRole.FRANCHISE_GM;

  const rosterCompliance = useMemo(() => {
    const alerts: string[] = [];
    if (roster.length < config.minRosterSize) {
      alerts.push(`Critical Roster Size: ${roster.length}/${config.minRosterSize} minimum required.`);
    }
    
    Object.entries(config.requiredPositions).forEach(([pos, min]) => {
      const count = roster.filter(p => p.positions.includes(pos)).length;
      if (count < min) {
        alerts.push(`Shortage at ${pos}: ${count}/${min} minimum required.`);
      }
    });

    return {
      isCompliant: alerts.length === 0,
      alerts,
      totalCount: roster.length
    };
  }, [roster, config]);

  const financeData = useMemo(() => {
    const totalCap = roster.reduce((sum, p) => sum + (p.capHit || 0), 0);
    const capLimit = 12000000;
    
    const spendingByPos: Record<string, number> = {};
    roster.forEach(p => {
      const pos = p.positions[0] || 'Unknown';
      spendingByPos[pos] = (spendingByPos[pos] || 0) + (p.capHit || 0);
    });

    const pieData = Object.entries(spendingByPos).map(([name, value]) => ({ name, value }));

    const expiringSoon = roster
      .filter(p => p.contractEnd)
      .map(p => ({
        id: p.id,
        name: p.fullName,
        end: p.contractEnd!,
        impact: p.capHit || 0
      }))
      .sort((a, b) => new Date(a.end).getTime() - new Date(b.end).getTime())
      .slice(0, 5);

    const capStressData = [
      { year: '2024', cap: totalCap, limit: capLimit },
      { year: '2025', cap: totalCap * 1.05, limit: 13000000 },
      { year: '2026', cap: totalCap * 1.15, limit: 14500000 },
      { year: '2027', cap: totalCap * 1.25, limit: 16000000 },
    ];

    return {
      totalCap,
      capLimit,
      capSpace: capLimit - totalCap,
      pieData,
      expiringSoon,
      capStressData
    };
  }, [roster]);

  const handleUpdateDepth = (playerId: string, pos: string, rank: number | null) => {
    const profile = profiles.find(p => p.id === playerId);
    if (!profile) return;
    
    const currentRanks = profile.depthRanks || {};
    let newRanks;
    if (rank === null) {
      const { [pos]: _, ...remainingRanks } = currentRanks;
      newRanks = remainingRanks;
    } else {
      newRanks = { ...currentRanks, [pos]: rank };
    }

    updateProfile(playerId, { depthRanks: newRanks });
    logActivity('STATUS_CHANGE', `${profile.fullName} depth updated for ${pos}`, playerId);
  };

  const handleSavePersonnelChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    updateProfile(editingPlayer.id, { ...editingPlayer });

    logActivity('CONTRACT_UPDATE', `GM finalized contract for ${editingPlayer.fullName}`, editingPlayer.id);
    setEditingPlayer(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Franchise Desk</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">{selectedFranchise} GM Operations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(Franchise).map(f => (
            <button 
              key={f} 
              onClick={() => setSelectedFranchise(f)} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedFranchise === f ? 'bg-league-accent border-league-accent text-white shadow-lg' : 'bg-league-panel border-league-border text-league-muted hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!rosterCompliance.isCompliant && (
        <div className="bg-league-accent/10 border-l-4 border-league-accent p-4 rounded-r-xl space-y-2">
          <div className="flex items-center gap-2 text-league-accent font-black uppercase text-[10px] tracking-widest">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            Personnel Alert: Operations Non-Compliant
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {rosterCompliance.alerts.map((a, i) => (
              <span key={i} className="text-[9px] font-bold text-league-muted uppercase">• {a}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 border-b border-league-border">
        {['Roster', 'DepthChart', 'Contracts', 'Finance', 'Watchlist'].map((view: any) => (
          <button 
            key={view} 
            onClick={() => setActiveSubView(view)} 
            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubView === view ? 'text-league-accent border-b-2 border-league-accent' : 'text-league-muted hover:text-white'}`}
          >
            {view}
          </button>
        ))}
      </div>

      {activeSubView === 'Roster' && <RosterTable roster={roster} onEdit={setEditingPlayer} canEditTier={canEditTier} updateProfile={updateProfile} />}
      {activeSubView === 'Contracts' && <ContractsTable roster={roster} onEdit={setEditingPlayer} />}
      
      {activeSubView === 'Finance' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Cap Spending" value={`$${financeData.totalCap.toLocaleString()}`} color="league-accent" />
            <StatCard label="Cap Space Remaining" value={`$${financeData.capSpace.toLocaleString()}`} color="league-ok" />
            <StatCard label="Cap Limit" value={`$${financeData.capLimit.toLocaleString()}`} />
            <StatCard label="Avg Positional Spend" value={`$${Math.round(financeData.totalCap / (financeData.pieData.length || 1)).toLocaleString()}`} color="league-blue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-league-panel border border-league-border rounded-xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-l-4 border-league-accent pl-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-league-muted">3-Year Cap Stress Forensics</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financeData.capStressData}>
                    <XAxis dataKey="year" stroke="#333" fontSize={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #1a1a1a', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="cap" stroke="#e41d24" fill="#e41d24" fillOpacity={0.2} strokeWidth={3} />
                    <Area type="monotone" dataKey="limit" stroke="#23d18b" fill="#23d18b" fillOpacity={0.05} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-league-panel border border-league-border rounded-xl p-8 shadow-2xl flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 border-l-4 border-league-blue pl-4 text-league-muted">Positional Spending Breakout</h3>
              <div className="flex-1 flex items-center justify-center gap-8">
                <div className="w-full h-64 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={financeData.pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {financeData.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #1a1a1a', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'DepthChart' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {Object.entries(POSITION_GROUPS).map(([group, positions]) => (
            <div key={group} className="bg-league-panel border border-league-border rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-league-tableHeader border-b border-league-border">
                <h3 className="text-xs font-black uppercase tracking-widest italic">{group}</h3>
              </div>
              <div className="p-4 space-y-6">
                {positions.map(pos => {
                  const eligiblePlayers = roster.filter(p => p.positions.includes(pos));
                  const rankedPlayers = [...eligiblePlayers].sort((a, b) => (a.depthRanks?.[pos] || 99) - (b.depthRanks?.[pos] || 99));

                  return (
                    <div key={pos} className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-league-muted tracking-widest border-b border-league-border/30 pb-1">
                        <span className="text-league-accent">{pos}</span>
                      </div>
                      <div className="space-y-2">
                        {rankedPlayers.map(p => (
                          <div key={p.id} className="bg-league-bg/50 border border-league-border p-2 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black italic text-league-accent w-6 text-center">{p.depthRanks?.[pos] ? `#${p.depthRanks[pos]}` : '--'}</span>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-white">{p.fullName}</span>
                                <span className={`text-[7px] font-black uppercase w-fit px-1 rounded ${getTierColor(p.tier)}`}>{p.tier}</span>
                              </div>
                            </div>
                            <select 
                              className="bg-league-panel border border-league-border rounded px-1 text-[8px] font-bold text-white outline-none"
                              value={p.depthRanks?.[pos] || ''}
                              onChange={(e) => handleUpdateDepth(p.id, pos, e.target.value === '' ? null : parseInt(e.target.value))}
                            >
                              <option value="">Assign</option>
                              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Slot {n}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="bg-league-panel border border-league-border max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setEditingPlayer(null)} className="absolute top-4 right-4 text-league-muted hover:text-white z-10 p-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <form onSubmit={handleSavePersonnelChanges} className="p-8 space-y-8">
              <div className="flex gap-6 items-center">
                <img src={editingPlayer.avatar_url} className="w-20 h-20 rounded-xl border border-league-border shadow-xl" alt="" />
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{editingPlayer.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded border outline-none ${getTierColor(editingPlayer.tier)}`}
                      value={editingPlayer.tier}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, tier: e.target.value as TalentTier })}
                      disabled={!canEditTier}
                    >
                      {Object.values(TalentTier).map(t => <option key={t} value={t} className="bg-black text-white">{t}</option>)}
                    </select>
                    <span className="text-xs font-black text-league-accent uppercase tracking-widest">• {editingPlayer.positions.join('/')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-league-muted tracking-[0.3em] border-b border-league-border pb-2">Contract Execution</h4>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted mb-2">Base Salary ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white font-bold outline-none focus:border-league-accent"
                      value={editingPlayer.salary || 0}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, salary: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t border-league-border pt-8">
                <button type="submit" className="flex-1 bg-league-accent text-white py-4 rounded-xl font-black italic uppercase tracking-widest text-xs shadow-lg">Finalize Changes</button>
                <button type="button" onClick={() => setEditingPlayer(null)} className="bg-league-bg border border-league-border text-league-muted px-8 py-4 rounded-xl font-black italic uppercase tracking-widest text-xs">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RosterTable = ({ roster, onEdit, canEditTier, updateProfile }: any) => (
  <div className="bg-league-panel border border-league-border rounded-xl overflow-hidden shadow-2xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-league-tableHeader">
          <tr className="border-b border-league-border text-[8px] font-black uppercase tracking-[0.3em] text-league-muted">
            <th className="px-6 py-4">Personnel</th>
            <th className="px-6 py-4">Talent Tier</th>
            <th className="px-6 py-4">Grade</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-league-border">
          {roster.map((p: Profile) => (
            <tr key={p.id} className="hover:bg-league-bg/50 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <img src={p.avatar_url} className="w-8 h-8 rounded-full border border-league-border" alt="" />
                <div className="font-bold italic uppercase text-white text-[12px]">{p.fullName}</div>
              </td>
              <td className="px-6 py-4">
                <select
                  disabled={!canEditTier}
                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border outline-none ${getTierColor(p.tier)}`}
                  value={p.tier}
                  onChange={(e) => updateProfile(p.id, { tier: e.target.value as TalentTier })}
                >
                  {Object.values(TalentTier).map(t => (
                    <option key={t} value={t} className="bg-black text-white">{t}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 text-league-accent italic font-black text-[12px]">{p.scoutGrade || '--'}</td>
              <td className="px-6 py-4">
                <button onClick={() => onEdit(p)} className="text-league-muted hover:text-white transition-colors uppercase font-black tracking-widest text-[9px]">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ContractsTable = ({ roster, onEdit }: any) => (
  <div className="bg-league-panel border border-league-border rounded-xl overflow-hidden shadow-2xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-league-tableHeader">
          <tr className="border-b border-league-border text-[8px] font-black uppercase tracking-[0.3em] text-league-muted">
            <th className="px-6 py-4">Athlete</th>
            <th className="px-6 py-4">Cap Hit</th>
            <th className="px-6 py-4">Operations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-league-border">
          {roster.map((p: Profile) => (
            <tr key={p.id} className="hover:bg-league-bg/50 transition-colors">
              <td className="px-6 py-4 font-bold italic uppercase text-white text-[12px]">{p.fullName}</td>
              <td className="px-6 py-4 text-league-accent italic font-black text-[12px]">${(p.capHit || 0).toLocaleString()}</td>
              <td className="px-6 py-4">
                <button onClick={() => onEdit(p)} className="text-league-muted hover:text-white transition-colors uppercase font-black tracking-widest text-[9px]">Negotiate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StatCard = ({ label, value, color = 'white' }: any) => {
  const colorMap: any = { 'league-accent': 'text-league-accent', 'league-ok': 'text-league-ok', 'white': 'text-white' };
  return (
    <div className="bg-league-panel p-6 border border-league-border rounded-xl shadow-lg">
      <p className="text-[10px] font-black uppercase tracking-widest text-league-muted mb-2">{label}</p>
      <span className={`text-xl font-black italic ${colorMap[color] || 'text-white'}`}>{value}</span>
    </div>
  );
};
