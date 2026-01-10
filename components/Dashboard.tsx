
import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, Cell, PieChart, Pie, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { useApp } from '../App';
import { Franchise, SystemRole, TalentTier, RecruitingStatus, Role } from '../types';
import { DeploymentMap } from './DeploymentMap';

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
  
  const [activeTab, setActiveTab] = useState<'Overview' | 'Franchises' | 'Management' | 'Audit' | 'System'>('Overview');
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

  const pipelineData = useMemo(() => {
    return Object.values(RecruitingStatus).map(status => ({
      name: status.split(' ').map(w => w[0]).join(''), 
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

  const handleSnapshot = () => {
    const data = JSON.stringify({ profiles, activityLogs, timestamp: new Date().toISOString() });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IAL_Registry_Snapshot_${new Date().getTime()}.json`;
    link.click();
    addToast('Neural Registry Snapshot Finalized', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Central Command OS</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-black mt-1">Operational Analytics & Registry Deployment</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl overflow-x-auto no-scrollbar">
          {(['Overview', 'Franchises', 'Management', 'Audit', 'System'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7"><div className="mb-4 flex items-center gap-2"><div className="h-0.5 w-6 bg-league-accent" /><h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic leading-none">Global Node Distribution</h4></div><DeploymentMap /></div>
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="flex-1 bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl"><h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic mb-10">Demand Distribution</h4>
               <div className="h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={prefDistribution} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">{prefDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={['#e41d24', '#40a9ff', '#23d18b', '#ffb84d', '#722ed1'][index % 5]} stroke="none" />)}</Pie><Tooltip contentStyle={{ background: '#000', border: '1px solid #1a1a1a', fontSize: '10px', fontWeight: 'bold' }} /></PieChart></ResponsiveContainer></div>
            </div>
            <div className="flex-1 bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic mb-10">Funnel Velocity</h4>
               <div className="h-44"><ResponsiveContainer width="100%" height="100%"><BarChart data={pipelineData}><Bar dataKey="count" radius={[4, 4, 0, 0]}>{pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.fullName] || '#444'} />)}</Bar><Tooltip contentStyle={{ background: '#000', border: '1px solid #1a1a1a', fontSize: '10px' }} cursor={{fill: 'transparent'}} /></BarChart></ResponsiveContainer></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Franchises' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-in slide-in-from-bottom-4">
          {franchiseHealth.map(f => (
            <div key={f.name} className={`bg-league-panel border rounded-[2rem] p-8 transition-all hover:-translate-y-2 shadow-2xl relative overflow-hidden group ${f.isAlert ? 'border-league-accent/50' : 'border-league-border'}`}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity translate-x-10 -translate-y-10 rounded-full" style={{ backgroundColor: STATUS_COLORS[RecruitingStatus.PLACED] }} />
              <div className="flex justify-between items-start mb-6"><h5 className="text-lg font-black italic uppercase text-white tracking-tighter leading-none">{f.name}</h5>{f.isAlert && <span className="bg-league-accent text-[8px] font-black text-white px-3 py-1 rounded-full animate-pulse shadow-lg">ALERT</span>}</div>
              <div className="space-y-6"><div className="flex justify-between items-end"><div className="text-4xl font-black italic text-white leading-none tracking-tighter">{f.rosterCount}</div><div className="text-[10px] font-black text-league-muted uppercase tracking-widest">Linked</div></div><div className="w-full bg-league-bg h-2 rounded-full overflow-hidden shadow-inner"><div className={`h-full transition-all duration-1000 ${f.capacity >= 100 ? 'bg-league-ok' : 'bg-league-accent'}`} style={{ width: `${Math.min(100, f.capacity)}%` }} /></div><div className="flex justify-between text-[9px] font-black uppercase text-league-muted tracking-widest italic opacity-40"><span>Pool: {f.leadCount}</span><span>{f.capacity}% Health</span></div></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Management' && (
        <div className="bg-league-panel border border-league-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="p-8 border-b border-league-border bg-league-tableHeader flex gap-4 overflow-x-auto no-scrollbar">
            <select className="bg-league-bg border border-league-border p-3 rounded-xl text-[10px] font-black uppercase text-white outline-none min-w-[140px]" value={mgmtFilter.role} onChange={e => setMgmtFilter({...mgmtFilter, role: e.target.value})}>
               <option value="ALL">All Roles</option><option value={Role.PLAYER}>Players</option><option value={Role.COACH}>Coaches</option>
            </select>
            <select className="bg-league-bg border border-league-border p-3 rounded-xl text-[10px] font-black uppercase text-white outline-none min-w-[140px]" value={mgmtFilter.status} onChange={e => setMgmtFilter({...mgmtFilter, status: e.target.value})}>
               <option value="ALL">All Statuses</option>{Object.values(RecruitingStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Search registry..." className="flex-1 bg-league-bg border border-league-border p-3 rounded-xl text-[10px] font-bold text-white outline-none min-w-[200px]" value={mgmtFilter.search} onChange={e => setMgmtFilter({...mgmtFilter, search: e.target.value})} />
          </div>
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-league-tableHeader border-b border-league-border"><tr className="text-[8px] font-black uppercase text-league-muted"><th className="px-8 py-4">ID</th><th className="px-8 py-4">Personnel</th><th className="px-8 py-4">Role</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Grade</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-league-border">
              {filteredMgmtProfiles.map(p => (
                <tr key={p.id} className="hover:bg-league-bg/30 transition-colors">
                  <td className="px-8 py-4 text-[10px] font-mono text-league-muted">{p.id}</td>
                  <td className="px-8 py-4"><div className="text-[11px] font-black italic text-white uppercase">{p.fullName}</div><div className="text-[8px] text-league-muted">{p.email}</div></td>
                  <td className="px-8 py-4 text-[9px] font-black text-league-blue uppercase">{p.role}</td>
                  <td className="px-8 py-4"><span className="text-[9px] font-black text-white bg-league-bg px-2 py-1 rounded border border-league-border">{p.status}</span></td>
                  <td className="px-8 py-4 text-[10px] font-black italic text-league-accent">{p.scoutGrade || '--'}</td>
                  <td className="px-8 py-4 text-right"><button onClick={() => deleteProfile(p.id)} className="text-league-accent hover:underline text-[9px] font-black uppercase">Purge</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {activeTab === 'Audit' && (
        <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl h-[600px] flex flex-col overflow-hidden animate-in fade-in">
           <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-8 italic">Immutable Registry Log</h4>
           <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              {activityLogs.map(log => (
                <div key={log.id} className="p-4 bg-league-bg border border-league-border rounded-xl flex gap-6 items-start">
                   <div className="text-[8px] font-black text-league-muted uppercase w-20">{new Date(log.timestamp).toLocaleTimeString()}</div>
                   <div className="flex-1"><div className="text-[9px] font-black uppercase text-league-ok mb-1">{log.type}</div><div className="text-[11px] font-bold italic text-white/80">{log.message}</div></div>
                   <div className="text-[7px] font-black uppercase text-league-muted opacity-30">Node_{log.subjectId}</div>
                </div>
              ))}
              {activityLogs.length === 0 && <div className="h-full flex items-center justify-center opacity-20 italic font-black uppercase text-[10px]">No security events recorded</div>}
           </div>
        </div>
      )}

      {activeTab === 'System' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in zoom-in-95">
           <div className="bg-league-panel border-2 border-league-accent p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <h3 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter">Deployment Readiness</h3>
              <div className="space-y-6">
                 <CheckItem label="Registry Persistence Sync" status="READY" />
                 <CheckItem label="SSL Handshake Simulation" status="READY" />
                 <CheckItem label="Neural Key Rotation Logic" status="READY" />
                 <CheckItem label="Document Audit Node" status="PENDING" isWarn />
              </div>
              <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                 <button onClick={handleSnapshot} className="flex-1 bg-league-bg border border-league-border text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-league-accent transition-all">Download Registry Snapshot</button>
                 <button className="flex-1 bg-league-accent text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Initialize Prod Migration</button>
              </div>
           </div>

           <div className="bg-league-panel border border-league-border p-10 rounded-[3rem] shadow-2xl space-y-10">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter border-b border-white/5 pb-6">Global Node Latency</h3>
              <div className="space-y-8">
                 <LatencyBar city="London HQ" ping="12ms" pct={98} color="bg-league-ok" />
                 <LatencyBar city="Nottingham Node" ping="24ms" pct={92} color="bg-league-ok" />
                 <LatencyBar city="Dusseldorf Node" ping="45ms" pct={85} color="bg-league-blue" />
                 <LatencyBar city="Zurich Node" ping="112ms" pct={62} color="bg-league-warn" />
              </div>
              <p className="text-[8px] font-black text-league-muted uppercase tracking-[0.4em] italic opacity-30 text-center">Neural Stream Telemetry v2.7.0-PROD</p>
           </div>
        </div>
      )}
    </div>
  );
};

const LatencyBar = ({ city, ping, pct, color }: any) => (
  <div className="space-y-2">
     <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase text-white tracking-widest">{city}</span>
        <span className="text-[8px] font-mono text-league-muted uppercase">{ping}</span>
     </div>
     <div className="h-1.5 w-full bg-league-bg rounded-full overflow-hidden border border-white/5">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
     </div>
  </div>
);

const CheckItem = ({ label, status, isWarn }: any) => (
  <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5">
     <span className="text-[11px] font-black uppercase text-league-muted tracking-widest">{label}</span>
     <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${isWarn ? 'bg-league-warn/10 border-league-warn text-league-warn' : 'bg-league-ok/10 border-league-ok text-league-ok'}`}>{status}</span>
  </div>
);

const StatMini = ({ label, value, color = 'white' }: any) => {
  const colorMap: any = { 'league-accent': 'text-league-accent', 'league-ok': 'text-league-ok', 'league-warn': 'text-league-warn', 'white': 'text-white' };
  return (
    <div className="px-6 border-r border-league-border last:border-0 group">
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-league-muted leading-none mb-2 transition-colors group-hover:text-league-accent">{label}</p>
      <span className={`text-2xl font-black italic tracking-tighter transition-all group-hover:scale-110 block ${colorMap[color] || 'text-white'}`}>{value}</span>
    </div>
  );
};
