
import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, Cell, PieChart, Pie, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { useApp } from '../App';
import { Franchise, SystemRole, TalentTier, RecruitingStatus, Role } from '../types';

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

const STATUS_COLORS: Record<string, string> = {
  [RecruitingStatus.NEW_LEAD]: '#bdbdbd',
  [RecruitingStatus.PRE_SCREENED]: '#40a9ff',
  [RecruitingStatus.TRYOUT_INVITED]: '#ffb84d',
  [RecruitingStatus.SIGNED]: '#23d18b',
  [RecruitingStatus.PLACED]: '#e41d24',
};

export const Dashboard: React.FC = () => {
  const { 
    profiles, currentSystemRole, updateProfile, deleteProfile, 
    alertConfigs, isPrivacyMode, setPrivacyMode, addToast, activityLogs 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'Overview' | 'Franchises' | 'Management' | 'Audit'>('Overview');
  const [mgmtFilter, setMgmtFilter] = useState({ role: 'ALL', status: 'ALL', search: '' });

  if (currentSystemRole !== SystemRole.LEAGUE_ADMIN) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-league-panel border border-league-border rounded-2xl animate-in zoom-in-95">
        <div className="bg-league-accent/20 p-6 rounded-full mb-6">
          <svg className="w-12 h-12 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">Access Restricted</h2>
        <p className="text-league-muted max-w-md mx-auto font-bold uppercase tracking-widest text-[10px] leading-relaxed">
          The Central Command Center requires League Admin clearance.
        </p>
      </div>
    );
  }

  // --- Data Processing ---
  const pipelineData = useMemo(() => {
    return Object.values(RecruitingStatus).map(status => ({
      name: status.split(' ').map(w => w[0]).join(''), // Abbreviate for chart
      fullName: status,
      count: profiles.filter(p => p.status === status).length
    }));
  }, [profiles]);

  const prefDistribution = useMemo(() => {
    return Object.values(Franchise).map(f => ({
      name: f,
      value: profiles.filter(p => p.preferences.rank1 === f).length
    }));
  }, [profiles]);

  const franchiseHealth = useMemo(() => {
    return Object.values(Franchise).map(f => {
      const roster = profiles.filter(p => p.assignedFranchise === f);
      const leads = profiles.filter(p => p.preferences.rank1 === f && !p.assignedFranchise);
      const config = alertConfigs[f];
      return {
        name: f,
        rosterCount: roster.length,
        leadCount: leads.length,
        isAlert: roster.length < config.minRosterSize,
        capacity: Math.round((roster.length / config.minRosterSize) * 100)
      };
    });
  }, [profiles, alertConfigs]);

  const filteredMgmtProfiles = profiles.filter(p => {
    const matchesRole = mgmtFilter.role === 'ALL' || p.role === mgmtFilter.role;
    const matchesStatus = mgmtFilter.status === 'ALL' || p.status === mgmtFilter.status;
    const matchesSearch = p.fullName.toLowerCase().includes(mgmtFilter.search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const exportToCsv = () => {
    const headers = ['ID', 'Name', 'Role', 'Tier', 'Status', 'Nationality', 'Franchise', 'Grade', 'Email'];
    const rows = profiles.map(p => [
      p.id, p.fullName, p.role, p.tier, p.status, p.nationality, p.assignedFranchise || 'None', p.scoutGrade || 'N/A', p.email
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IAL_Registry_Master_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('Master CSV Exported', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Central Registry OS</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">Production Management & Analytics</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-xl border border-league-border">
          {(['Overview', 'Franchises', 'Management', 'Audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-lg' : 'text-league-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Global Actions Bar */}
      <div className="flex justify-between items-center bg-league-panel/50 p-4 rounded-xl border border-league-border">
        <div className="flex gap-4">
          <StatMini label="Total Registry" value={profiles.length} />
          <StatMini label="New Today" value={profiles.filter(p => p.createdAt.startsWith(new Date().toISOString().split('T')[0])).length} />
          <StatMini label="Unassigned" value={profiles.filter(p => !p.assignedFranchise).length} color="league-warn" />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setPrivacyMode(!isPrivacyMode)}
            className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${isPrivacyMode ? 'bg-league-warn text-black border-league-warn' : 'text-league-muted border-league-border'}`}
          >
            {isPrivacyMode ? 'Privacy: MASKED' : 'Privacy: VISIBLE'}
          </button>
          <button onClick={exportToCsv} className="bg-league-accent text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Tab: Analytics */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pipeline Funnel */}
          <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-2xl p-6 shadow-xl">
             <div className="flex justify-between items-center mb-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Recruitment Funnel Velocity</h4>
               <span className="text-[8px] font-bold text-league-muted uppercase">Stage Distribution</span>
             </div>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <XAxis dataKey="name" stroke="#333" fontSize={10} fontWeight="bold" />
                    <Tooltip 
                      contentStyle={{ background: '#000', border: '1px solid #1a1a1a', fontSize: '10px' }}
                      cursor={{ fill: 'rgba(228,29,36,0.05)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.fullName] || '#444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Preference Heatmap */}
          <div className="lg:col-span-4 bg-league-panel border border-league-border rounded-2xl p-6 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic mb-6">Market Demand (Rank 1)</h4>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={prefDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {prefDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={['#e41d24', '#40a9ff', '#23d18b', '#ffb84d', '#bdbdbd'][index % 5]} />)}
                   </Pie>
                   <Tooltip contentStyle={{ background: '#000', border: '1px solid #1a1a1a', fontSize: '10px' }} />
                   <Legend wrapperStyle={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Franchises Tab: Health Rollups */}
      {activeTab === 'Franchises' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4">
          {franchiseHealth.map(f => (
            <div key={f.name} className={`bg-league-panel border rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-xl ${f.isAlert ? 'border-league-accent/50' : 'border-league-border'}`}>
              <div className="flex justify-between items-start mb-4">
                <h5 className="text-sm font-black italic uppercase text-white">{f.name}</h5>
                {f.isAlert && <span className="bg-league-accent text-[7px] font-black text-white px-2 py-0.5 rounded-full animate-pulse">UNDER CAPACITY</span>}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <div className="text-[24px] font-black italic text-white leading-none">{f.rosterCount}</div>
                   <div className="text-[10px] font-black text-league-muted uppercase">Roster Size</div>
                </div>
                <div className="w-full bg-league-bg h-1.5 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${f.capacity >= 100 ? 'bg-league-ok' : 'bg-league-accent'}`} 
                    style={{ width: `${Math.min(100, f.capacity)}%` }} 
                   />
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase text-league-muted tracking-widest">
                  <span>In-Bound Leads: {f.leadCount}</span>
                  <span>{f.capacity}% Target</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Management Tab: Advanced Table */}
      {activeTab === 'Management' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-wrap gap-4 bg-league-panel p-4 border border-league-border rounded-xl">
             <select 
              className="bg-league-bg border border-league-border p-2 rounded text-[10px] font-black uppercase text-white outline-none focus:border-league-accent"
              value={mgmtFilter.role} onChange={e => setMgmtFilter({...mgmtFilter, role: e.target.value})}
             >
               <option value="ALL">All Roles</option>
               {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             <select 
              className="bg-league-bg border border-league-border p-2 rounded text-[10px] font-black uppercase text-white outline-none focus:border-league-accent"
              value={mgmtFilter.status} onChange={e => setMgmtFilter({...mgmtFilter, status: e.target.value})}
             >
               <option value="ALL">All Statuses</option>
               {Object.values(RecruitingStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <input 
              type="text" placeholder="Search Personnel..." 
              className="flex-1 min-w-[200px] bg-league-bg border border-league-border p-2 rounded text-[10px] font-black uppercase text-white outline-none focus:border-league-accent"
              value={mgmtFilter.search} onChange={e => setMgmtFilter({...mgmtFilter, search: e.target.value})}
             />
          </div>

          <div className="bg-league-panel border border-league-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-league-tableHeader border-b border-league-border">
                  <tr className="text-[8px] font-black uppercase tracking-[0.3em] text-league-muted">
                    <th className="px-6 py-4">Identity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Talent Tier</th>
                    <th className="px-6 py-4">Assign</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-league-border">
                  {filteredMgmtProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-league-bg/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-league-pill border border-league-border flex items-center justify-center font-black italic text-[10px] text-white">
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black italic uppercase text-white text-[11px] leading-none">{p.fullName}</div>
                          <div className="text-[7px] font-bold text-league-muted uppercase mt-1 tracking-widest">{p.nationality} • {p.role}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-league-border/50 text-league-muted bg-league-bg">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <select 
                          className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border outline-none cursor-pointer ${getTierColor(p.tier)}`}
                          value={p.tier}
                          onChange={(e) => updateProfile(p.id, { tier: e.target.value as TalentTier })}
                         >
                           {Object.values(TalentTier).map(t => (
                             <option key={t} value={t} className="bg-black text-white">{t}</option>
                           ))}
                         </select>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="bg-league-bg border border-league-border rounded px-2 py-1 text-[8px] font-black uppercase text-league-muted focus:text-white"
                          value={p.assignedFranchise || ''}
                          onChange={e => updateProfile(p.id, { assignedFranchise: e.target.value as Franchise || undefined })}
                        >
                          <option value="">Pool</option>
                          {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => deleteProfile(p.id)} className="text-[8px] font-black uppercase tracking-widest text-league-accent hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab: Forensic Log */}
      {activeTab === 'Audit' && (
        <div className="bg-league-panel border border-league-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in">
           <div className="p-6 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Audit Forensic Feed</h4>
             <span className="text-[8px] font-bold text-league-muted uppercase italic">Real-time Transmission Logs</span>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-league-bg">
                 <tr className="text-[8px] font-black uppercase tracking-[0.3em] text-league-muted border-b border-league-border">
                   <th className="px-6 py-3">Timestamp</th>
                   <th className="px-6 py-3">Type</th>
                   <th className="px-6 py-3">Subject ID</th>
                   <th className="px-6 py-3">Payload / Message</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-league-border font-mono">
                 {activityLogs.map(log => (
                   <tr key={log.id} className="hover:bg-league-bg transition-colors">
                     <td className="px-6 py-3 text-[9px] text-league-muted">
                        {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                     </td>
                     <td className="px-6 py-3">
                       <span className={`text-[8px] font-black px-1.5 rounded ${
                         log.type.includes('USER') ? 'bg-league-accent/20 text-league-accent' : 
                         log.type.includes('REGISTRATION') ? 'bg-league-ok/20 text-league-ok' : 
                         'bg-league-pill text-league-muted'
                       }`}>
                         {log.type}
                       </span>
                     </td>
                     <td className="px-6 py-3 text-[9px] text-league-blue font-bold">{log.subjectId}</td>
                     <td className="px-6 py-3 text-[10px] text-white/80">{log.message}</td>
                   </tr>
                 ))}
                 {activityLogs.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-20 text-center text-league-muted uppercase font-black italic tracking-widest">No audit events found in current session memory</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

const StatMini = ({ label, value, color = 'white' }: any) => {
  const colorMap: any = { 'league-accent': 'text-league-accent', 'league-ok': 'text-league-ok', 'league-warn': 'text-league-warn', 'white': 'text-white' };
  return (
    <div className="px-4 border-r border-league-border last:border-0">
      <p className="text-[7px] font-black uppercase tracking-widest text-league-muted leading-none mb-1">{label}</p>
      <span className={`text-sm font-black italic ${colorMap[color] || 'text-white'}`}>{value}</span>
    </div>
  );
};
