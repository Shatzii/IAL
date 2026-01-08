
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
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Central Registry OS</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-black mt-1">Production Management & Analytics</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-inner">
          {(['Overview', 'Franchises', 'Management', 'Audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Global Actions Bar */}
      <div className="flex justify-between items-center bg-league-panel/50 p-6 rounded-[2rem] border border-league-border shadow-2xl">
        <div className="flex gap-6">
          <StatMini label="Total Registry" value={profiles.length} />
          <StatMini label="New Today" value={profiles.filter(p => p.createdAt.startsWith(new Date().toISOString().split('T')[0])).length} />
          <StatMini label="Unassigned" value={profiles.filter(p => !p.assignedFranchise).length} color="league-warn" />
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setPrivacyMode(!isPrivacyMode)}
            className={`px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${isPrivacyMode ? 'bg-league-warn text-black border-league-warn' : 'text-league-muted border-league-border'}`}
          >
            {isPrivacyMode ? 'Privacy: MASKED' : 'Privacy: VISIBLE'}
          </button>
          <button onClick={exportToCsv} className="bg-league-accent text-white px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl">
            Export Master CSV
          </button>
        </div>
      </div>

      {/* Overview Tab: Analytics */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pipeline Funnel */}
          <div className="lg:col-span-8 bg-league-panel border border-league-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <div className="w-32 h-32 border border-league-accent rounded-full" />
             </div>
             <div className="flex justify-between items-center mb-10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Recruitment Funnel Velocity</h4>
               <span className="text-[8px] font-black text-league-muted uppercase tracking-widest">Stage Distribution Metric</span>
             </div>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <XAxis dataKey="name" stroke="#333" fontSize={10} fontWeight="900" />
                    <Tooltip 
                      contentStyle={{ background: '#000', border: '1px solid #1a1a1a', fontSize: '10px', fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(228,29,36,0.05)' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.fullName] || '#444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Preference Heatmap */}
          <div className="lg:col-span-4 bg-league-panel border border-league-border rounded-[2rem] p-8 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic mb-10">Market Demand (Rank 1)</h4>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={prefDistribution} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                     {prefDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={['#e41d24', '#40a9ff', '#23d18b', '#ffb84d', '#722ed1'][index % 5]} stroke="none" />)}
                   </Pie>
                   <Tooltip contentStyle={{ background: '#000', border: '1px solid #1a1a1a', fontSize: '10px', fontWeight: 'bold' }} />
                   <Legend wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Franchises Tab: Health Rollups */}
      {activeTab === 'Franchises' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-in slide-in-from-bottom-4">
          {franchiseHealth.map(f => (
            <div key={f.name} className={`bg-league-panel border rounded-[2rem] p-8 transition-all hover:-translate-y-2 shadow-2xl relative overflow-hidden group ${f.isAlert ? 'border-league-accent/50' : 'border-league-border'}`}>
              <div 
                  className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity translate-x-10 -translate-y-10 rounded-full" 
                  style={{ backgroundColor: STATUS_COLORS[RecruitingStatus.PLACED] }}
              />
              <div className="flex justify-between items-start mb-6">
                <h5 className="text-lg font-black italic uppercase text-white tracking-tighter leading-none">{f.name}</h5>
                {f.isAlert && <span className="bg-league-accent text-[8px] font-black text-white px-3 py-1 rounded-full animate-pulse shadow-lg">UNDER CAPACITY</span>}
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div className="text-4xl font-black italic text-white leading-none tracking-tighter">{f.rosterCount}</div>
                   <div className="text-[10px] font-black text-league-muted uppercase tracking-widest">Active Roster</div>
                </div>
                <div className="w-full bg-league-bg h-2 rounded-full overflow-hidden shadow-inner">
                   <div 
                    className={`h-full transition-all duration-1000 ${f.capacity >= 100 ? 'bg-league-ok shadow-[0_0_10px_#23d18b]' : 'bg-league-accent shadow-[0_0_10px_#e41d24]'}`} 
                    style={{ width: `${Math.min(100, f.capacity)}%` }} 
                   />
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase text-league-muted tracking-widest italic">
                  <span>Leads: {f.leadCount}</span>
                  <span>{f.capacity}% Node Health</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Management Tab: Advanced Table */}
      {activeTab === 'Management' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap gap-6 bg-league-panel p-6 border border-league-border rounded-[2rem] shadow-2xl">
             <select 
              className="bg-league-bg border border-league-border p-4 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent shadow-inner cursor-pointer"
              value={mgmtFilter.role} onChange={e => setMgmtFilter({...mgmtFilter, role: e.target.value})}
             >
               <option value="ALL">All Roles</option>
               {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             <select 
              className="bg-league-bg border border-league-border p-4 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent shadow-inner cursor-pointer"
              value={mgmtFilter.status} onChange={e => setMgmtFilter({...mgmtFilter, status: e.target.value})}
             >
               <option value="ALL">All Statuses</option>
               {Object.values(RecruitingStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <input 
              type="text" placeholder="Search Personnel Registry..." 
              className="flex-1 min-w-[250px] bg-league-bg border border-league-border p-4 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-league-accent shadow-inner"
              value={mgmtFilter.search} onChange={e => setMgmtFilter({...mgmtFilter, search: e.target.value})}
             />
          </div>

          <div className="bg-league-panel border border-league-border rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-league-tableHeader border-b border-league-border">
                  <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-league-muted">
                    <th className="px-10 py-6">Operational Identity</th>
                    <th className="px-10 py-6">Status Node</th>
                    <th className="px-10 py-6">Talent Classification</th>
                    <th className="px-10 py-6">Deployment</th>
                    <th className="px-10 py-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-league-border">
                  {filteredMgmtProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-league-bg/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           {/* Initial Circle replacement for Avatar */}
                           <div className="w-10 h-10 rounded-xl bg-league-bg border border-league-border flex items-center justify-center font-black italic text-[14px] text-white shadow-inner group-hover:border-league-accent transition-colors">
                              {p.fullName.charAt(0)}
                           </div>
                           <div>
                              <div className="font-black italic uppercase text-white text-[13px] leading-none tracking-tighter">{p.fullName}</div>
                              <div className="text-[8px] font-black text-league-muted uppercase mt-1 tracking-widest">{p.nationality} • {p.role}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full border border-league-border/50 text-league-muted bg-league-bg italic">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                         <select 
                          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border outline-none cursor-pointer shadow-lg transition-all ${getTierColor(p.tier)}`}
                          value={p.tier}
                          onChange={(e) => updateProfile(p.id, { tier: e.target.value as TalentTier })}
                         >
                           {Object.values(TalentTier).map(t => (
                             <option key={t} value={t} className="bg-black text-white">{t}</option>
                           ))}
                         </select>
                      </td>
                      <td className="px-10 py-6">
                        <select 
                          className="bg-league-bg border border-league-border rounded-xl px-3 py-2 text-[9px] font-black uppercase text-league-muted focus:text-white outline-none cursor-pointer shadow-inner"
                          value={p.assignedFranchise || ''}
                          onChange={e => updateProfile(p.id, { assignedFranchise: e.target.value as Franchise || undefined })}
                        >
                          <option value="">Draft Pool</option>
                          {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <button onClick={() => deleteProfile(p.id)} className="text-[9px] font-black uppercase tracking-[0.2em] text-league-accent hover:brightness-150 transition-all border-b border-transparent hover:border-league-accent pb-1">Purge Node</button>
                      </td>
                    </tr>
                  ))}
                  {filteredMgmtProfiles.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-20 text-center text-league-muted uppercase font-black italic tracking-[0.4em] opacity-10">No records matching active filter</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab: Forensic Log */}
      {activeTab === 'Audit' && (
        <div className="bg-league-panel border border-league-border rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in">
           <div className="p-10 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">System Audit Forensic Feed</h4>
             <span className="text-[8px] font-black text-league-muted uppercase italic tracking-widest animate-pulse">Establishing Secure Stream Connection...</span>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-league-bg">
                 <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-league-muted border-b border-league-border">
                   <th className="px-10 py-5">Node Timestamp</th>
                   <th className="px-10 py-5">Event Class</th>
                   <th className="px-10 py-5">Subject ID</th>
                   <th className="px-10 py-5">Payload Transmission</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-league-border font-mono">
                 {activityLogs.map(log => (
                   <tr key={log.id} className="hover:bg-league-bg transition-colors">
                     <td className="px-10 py-5 text-[10px] text-league-muted font-bold tracking-tighter">
                        {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                     </td>
                     <td className="px-10 py-5">
                       <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase italic border ${
                         log.type.includes('USER') ? 'bg-league-accent/10 text-league-accent border-league-accent/30 shadow-[0_0_10px_rgba(228,29,36,0.1)]' : 
                         log.type.includes('REGISTRATION') ? 'bg-league-ok/10 text-league-ok border-league-ok/30 shadow-[0_0_10px_rgba(35,209,139,0.1)]' : 
                         'bg-league-pill/50 text-league-muted border-league-border'
                       }`}>
                         {log.type}
                       </span>
                     </td>
                     <td className="px-10 py-5 text-[10px] text-league-blue font-black tracking-widest">{log.subjectId}</td>
                     <td className="px-10 py-5 text-[11px] text-white/70 font-bold italic">{log.message}</td>
                   </tr>
                 ))}
                 {activityLogs.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-10 py-24 text-center text-league-muted uppercase font-black italic tracking-[0.5em] opacity-10">Historical logs purged • Monitoring new activity</td>
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
    <div className="px-6 border-r border-league-border last:border-0 group">
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-league-muted leading-none mb-2 transition-colors group-hover:text-league-accent">{label}</p>
      <span className={`text-2xl font-black italic tracking-tighter transition-all group-hover:scale-110 block ${colorMap[color] || 'text-white'}`}>{value}</span>
    </div>
  );
};
