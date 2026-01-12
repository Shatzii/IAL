
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Franchise, SystemRole, RecruitingStatus, ExecutiveDirective, DirectiveStatus, DirectivePriority, ContractStatus } from '../types';
import { DeploymentMap } from './DeploymentMap';

export const Dashboard: React.FC = () => {
  const { 
    profiles, currentSystemRole, updateDirective, directives, 
    addDirective, selectedFranchise, currentUserEmail,
    resolveContract, addToast, activityLogs 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'Overview' | 'Franchises' | 'Executive Hub' | 'Audit'>('Overview');
  const [execFilter, setExecFilter] = useState<'ALL' | 'CONTRACTS' | 'OPERATIONS'>('ALL');

  const canApprove = currentSystemRole === SystemRole.LEAGUE_ADMIN;

  const handleOperationalDecision = (id: string, status: DirectiveStatus, thoughts: string) => {
    updateDirective(id, { status, commishThoughts: thoughts, resolvedAt: new Date().toISOString() });
    addToast(`Directive ${status}: ${id}`, status === DirectiveStatus.AUTHORIZED ? 'success' : 'info');
  };

  const filteredDirectives = directives.filter(d => {
    if (execFilter === 'ALL') return true;
    if (execFilter === 'CONTRACTS') return d.type === 'CONTRACT';
    return d.type !== 'CONTRACT';
  });

  if (!canApprove) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-league-panel border border-league-border rounded-[3rem]">
        <div className="bg-league-accent/20 p-8 rounded-full mb-8 animate-pulse"><svg className="w-16 h-16 text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"></path></svg></div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">Security Override Required</h2>
        <p className="text-league-muted max-w-sm font-bold uppercase tracking-widest text-[10px] italic">Central Command access restricted to Commissioner and League Board members only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Central Command OS</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-black mt-1">Personnel Authorization • Financial Clearance • Node Health</p>
        </div>
        <div className="flex bg-league-panel p-1 rounded-2xl border border-league-border shadow-2xl">
          {(['Overview', 'Franchises', 'Executive Hub', 'Audit'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-league-accent text-white shadow-xl' : 'text-league-muted hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7"><DeploymentMap /></div>
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-league-accent italic mb-6">Action Required</h4>
               <div className="space-y-3">
                  {directives.filter(d => d.status === DirectiveStatus.PENDING).slice(0, 3).map(d => (
                    <div key={d.id} onClick={() => setActiveTab('Executive Hub')} className="p-4 bg-league-bg border border-league-border rounded-xl flex items-center justify-between cursor-pointer hover:border-league-accent transition-colors">
                       <div className="min-w-0 flex-1 pr-4">
                          <span className="text-[11px] font-black text-white italic truncate block">{d.title}</span>
                          <span className="text-[7px] font-bold text-league-muted uppercase">{d.type || 'OPERATIONAL'} • {d.franchise}</span>
                       </div>
                       <span className={`text-[8px] font-black px-2 py-1 rounded border ${d.priority === DirectivePriority.CRITICAL ? 'border-league-accent text-league-accent' : 'border-league-muted text-league-muted'}`}>{d.priority}</span>
                    </div>
                  ))}
                  {directives.filter(d => d.status === DirectiveStatus.PENDING).length === 0 && <p className="text-[10px] italic text-league-muted text-center py-12 opacity-30">All Protocols Synchronized</p>}
               </div>
            </div>
            <div className="bg-league-panel border border-league-border rounded-[2.5rem] p-8 shadow-2xl">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic mb-4">Registry Health</h4>
               <div className="flex items-baseline gap-4">
                  <div className="text-5xl font-black italic text-white leading-none tracking-tighter">{profiles.length}</div>
                  <div className="text-[9px] font-black text-league-muted uppercase tracking-widest italic opacity-50">Personnel Linked</div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Executive Hub' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex justify-between items-center bg-league-panel p-6 rounded-3xl border border-league-border">
              <div>
                <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Command Directives</h3>
                <p className="text-[9px] font-black uppercase text-league-accent tracking-[0.3em] mt-1 italic">Authorized Decision Hub</p>
              </div>
              <div className="flex bg-black p-1 rounded-xl border border-white/5">
                 {(['ALL', 'CONTRACTS', 'OPERATIONS'] as const).map(f => (
                   <button key={f} onClick={() => setExecFilter(f)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${execFilter === f ? 'bg-league-accent text-white' : 'text-league-muted hover:text-white'}`}>{f}</button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredDirectives.map(directive => (
                <div key={directive.id} className={`bg-league-panel border-2 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500 ${directive.status === DirectiveStatus.PENDING ? 'border-league-accent' : 'border-league-border opacity-50 grayscale'}`}>
                   {directive.type === 'CONTRACT' && (
                     <div className="absolute top-0 right-0 px-4 py-1 bg-league-blue text-white text-[7px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">Financial Approval</div>
                   )}
                   <div className="flex justify-between items-start mb-6">
                      <div className="min-w-0">
                        <div className="text-[9px] font-black text-league-accent uppercase tracking-widest mb-1 italic">{directive.franchise} • {directive.requester.split('@')[0]}</div>
                        <h4 className="text-xl font-black italic uppercase text-white leading-tight truncate">{directive.title}</h4>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black border flex-shrink-0 ${directive.priority === DirectivePriority.CRITICAL ? 'bg-league-accent/10 border-league-accent text-league-accent' : 'border-league-muted text-league-muted'}`}>{directive.priority}</div>
                   </div>
                   <p className="text-[11px] text-league-muted font-bold italic mb-10 leading-relaxed flex-grow">{directive.description}</p>
                   
                   {directive.status === DirectiveStatus.PENDING ? (
                     <div className="space-y-4 pt-6 border-t border-white/5">
                        <textarea 
                          id={`thoughts-${directive.id}`}
                          placeholder="Command Note..." 
                          className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-[10px] font-bold text-white outline-none focus:border-league-accent h-24"
                        />
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                             onClick={() => {
                               const thoughts = (document.getElementById(`thoughts-${directive.id}`) as any).value;
                               if (directive.type === 'CONTRACT' && directive.relatedProfileId) {
                                 resolveContract(directive.relatedProfileId, ContractStatus.APPROVED, thoughts);
                               } else {
                                 handleOperationalDecision(directive.id, DirectiveStatus.AUTHORIZED, thoughts);
                               }
                             }}
                             className="bg-league-ok text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg"
                           >
                             AUTHORIZE
                           </button>
                           <button 
                             onClick={() => {
                               const thoughts = (document.getElementById(`thoughts-${directive.id}`) as any).value;
                               if (directive.type === 'CONTRACT' && directive.relatedProfileId) {
                                 resolveContract(directive.relatedProfileId, ContractStatus.DECLINED, thoughts);
                               } else {
                                 handleOperationalDecision(directive.id, DirectiveStatus.DENIED, thoughts);
                               }
                             }}
                             className="bg-league-accent text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg"
                           >
                             DENY
                           </button>
                        </div>
                     </div>
                   ) : (
                     <div className="pt-6 border-t border-white/5 space-y-3 opacity-60">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-league-muted">Final Status:</span><span className={`text-[10px] font-black uppercase italic ${directive.status === DirectiveStatus.AUTHORIZED ? 'text-league-ok' : 'text-league-accent'}`}>{directive.status}</span></div>
                        {directive.commishThoughts && <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-white/70 italic italic leading-relaxed">Decision: {directive.commishThoughts}</div>}
                        <div className="text-[7px] text-right font-black uppercase text-league-muted opacity-30">Resolved {new Date(directive.resolvedAt!).toLocaleString()}</div>
                     </div>
                   )}
                </div>
              ))}
              {filteredDirectives.length === 0 && <div className="col-span-full py-32 text-center border-2 border-dashed border-league-border rounded-[3rem] opacity-20 italic font-black uppercase text-sm tracking-widest">Vault Empty</div>}
           </div>
        </div>
      )}

      {activeTab === 'Audit' && (
        <div className="bg-league-panel border border-league-border rounded-[3rem] p-10 shadow-2xl h-[650px] flex flex-col overflow-hidden animate-in fade-in">
           <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-10 italic">Immutable Registry Log</h4>
           <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              {activityLogs.map(log => (
                <div key={log.id} className="p-6 bg-league-bg border border-league-border rounded-2xl flex gap-8 items-start group hover:border-league-accent transition-colors shadow-inner">
                   <div className="text-[9px] font-black text-league-muted uppercase w-24 tabular-nums opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</div>
                   <div className="flex-1">
                      <div className="text-[10px] font-black uppercase text-league-ok mb-2 tracking-widest">{log.type}</div>
                      <div className="text-[13px] font-bold italic text-white/90 leading-relaxed group-hover:text-white transition-colors">{log.message}</div>
                   </div>
                   <div className="text-[8px] font-black uppercase text-league-muted opacity-20 group-hover:opacity-100 transition-opacity italic">NODE_{log.subjectId}</div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
