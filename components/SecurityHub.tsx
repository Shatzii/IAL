
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { AuditActionType, SystemRole } from '../types';

export const SecurityHub: React.FC = () => {
  const { activityLogs, currentSession, currentSystemRole, maskPII } = useApp();
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => filterAction === 'ALL' || log.type === filterAction);
  }, [activityLogs, filterAction]);

  const complianceScore = 98.4; // Simulated SOC2 readiness score

  if (currentSystemRole !== SystemRole.LEAGUE_ADMIN && currentSystemRole !== SystemRole.FRANCHISE_GM) {
    return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-league-panel border border-league-border rounded-[3rem]">
          <div className="bg-league-accent/20 p-8 rounded-full mb-8 animate-pulse"><svg className="w-16 h-16 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"></path></svg></div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">Access Restricted</h2>
          <p className="text-league-muted max-w-sm font-bold uppercase tracking-widest text-[10px] italic">Only authorized GMs and Admins can view systemic security telemetry.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Security Control Hub</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-black mt-1">SOC2 Type II Telemetry • Data Privacy Monitoring</p>
        </div>
        <div className="flex bg-league-panel p-2 rounded-2xl border border-league-border shadow-2xl items-center gap-6 px-6">
           <div className="text-right">
              <div className="text-[8px] font-black text-league-muted uppercase mb-1">Compliance Score</div>
              <div className="text-xl font-black italic text-league-ok">{complianceScore}%</div>
           </div>
           <div className="h-8 w-[1px] bg-white/10" />
           <div className="text-right">
              <div className="text-[8px] font-black text-league-muted uppercase mb-1">Active Handshakes</div>
              <div className="text-xl font-black italic text-white">24</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-league-panel border border-league-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <h3 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-8 italic border-b border-white/5 pb-4">Session Context</h3>
              <div className="space-y-6">
                 <SessionItem label="Node Token" val={currentSession?.token || 'UNAUTHORIZED'} isSecret />
                 <SessionItem label="IP Origin" val={currentSession?.ipAddress || '0.0.0.0'} />
                 <SessionItem label="MFA Integrity" val={currentSession?.mfaVerified ? 'VERIFIED' : 'PENDING'} color={currentSession?.mfaVerified ? 'text-league-ok' : 'text-league-accent'} />
                 <SessionItem label="Device Hash" val={currentSession?.deviceId || '--'} />
              </div>
           </div>

           <div className="bg-league-panel border border-league-border p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-[10px] font-black uppercase text-white tracking-[0.4em] mb-8 italic border-b border-white/5 pb-4">Privacy Directives</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-white uppercase">Data Masking</span>
                    <span className="text-[10px] font-black text-league-ok uppercase">ACTIVE</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 opacity-50">
                    <span className="text-[10px] font-bold text-white uppercase">DDoS Protection</span>
                    <span className="text-[10px] font-black text-white uppercase">GLOBAL EDGE</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-white uppercase">Log Retention</span>
                    <span className="text-[10px] font-black text-league-blue uppercase">90 DAYS</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-6">
           <div className="bg-league-panel border border-league-border rounded-[3rem] shadow-2xl flex-grow overflow-hidden min-h-[600px] flex flex-col relative">
              <div className="p-8 border-b border-league-border bg-league-tableHeader flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none">Immutable Audit Trail</h3>
                    <select 
                      className="bg-black border border-white/10 rounded-lg px-3 py-1 text-[8px] font-black text-league-muted uppercase outline-none focus:border-league-accent"
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                    >
                       <option value="ALL">All Actions</option>
                       <option value={AuditActionType.AUTHENTICATION}>Auth Only</option>
                       <option value={AuditActionType.DATA_ACCESS}>Read Access</option>
                       <option value={AuditActionType.DATA_MODIFY}>Writes/Modifies</option>
                    </select>
                 </div>
                 <div className="text-[8px] font-black text-league-muted uppercase tracking-widest italic animate-pulse">Syncing with Central Log-Node...</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-3">
                 {filteredLogs.map(log => (
                    <div key={log.id} className="p-5 bg-league-bg border border-league-border rounded-2xl flex gap-6 items-start group hover:border-league-accent transition-colors shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-2 opacity-[0.05] font-mono text-[10px] font-black group-hover:opacity-20 transition-opacity">#{log.hash}</div>
                       <div className="text-[8px] font-black text-league-muted uppercase w-20 pt-1 tabular-nums">{new Date(log.timestamp).toLocaleTimeString()}</div>
                       <div className="flex-1">
                          <div className={`text-[9px] font-black uppercase mb-1 ${log.type === AuditActionType.AUTHENTICATION ? 'text-league-blue' : log.type === AuditActionType.SECURITY_CHANGE ? 'text-league-accent' : 'text-league-ok'}`}>
                             {log.type}
                          </div>
                          <div className="text-[12px] font-bold italic text-white/90 leading-relaxed group-hover:text-white transition-colors">{log.message}</div>
                          <div className="text-[7px] font-black text-league-muted uppercase mt-2 tracking-widest opacity-40">Actor: {maskPII(log.actorId)} • Target: {log.subjectId}</div>
                       </div>
                    </div>
                 ))}
                 {filteredLogs.length === 0 && <div className="h-full flex items-center justify-center opacity-20 font-black italic uppercase text-lg">Vault logs clear.</div>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SessionItem = ({ label, val, isSecret = false, color = 'text-white' }: any) => (
  <div className="flex justify-between items-end">
    <span className="text-[8px] font-black text-league-muted uppercase italic">{label}</span>
    <span className={`text-[11px] font-black italic tracking-tighter ${color} ${isSecret ? 'blur-[3px] hover:blur-0 transition-all cursor-help' : ''}`}>{val}</span>
  </div>
);
