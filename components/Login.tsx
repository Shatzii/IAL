
import React, { useState } from 'react';
import { useApp } from '../App';
import { SystemRole, Franchise } from '../types';

export const Login: React.FC = () => {
  const { login, setView, profiles, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  // Updated Credential Database with new secure admin password and standardized personnel keys
  const SYSTEM_CREDENTIALS = [
    { email: 'admin@ial-football.com', pass: 'TakeOver2026$$$', role: SystemRole.LEAGUE_ADMIN },
    // Franchise GMs - Standardized to coach2026$$$
    { email: 'nottingham@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.NOTTINGHAM },
    { email: 'glasgow@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.GLASGOW },
    { email: 'dusseldorf@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.DUSSELDORF },
    { email: 'stuttgart@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.STUTTGART },
    { email: 'zurich@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.ZURICH },
    // Coaches - Standardized to coach2026$$$
    { email: 'phil.garcia@glasgow.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.GLASGOW },
    { email: 'jeff.hunt@nottingham.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.NOTTINGHAM },
    { email: 'keith.hill@dusseldorf.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.DUSSELDORF },
    { email: 'talib.wise@zurich.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.ZURICH },
    { email: 'stuttgart@coach.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.STUTTGART },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation of secure handshake
    setTimeout(() => {
      // 1. Check System Credentials
      const cred = SYSTEM_CREDENTIALS.find(c => c.email.toLowerCase() === email.toLowerCase() && c.pass === pass);
      
      if (cred) {
        login(cred.email, cred.role, cred.franchise);
        setLoading(false);
        return;
      }

      // 2. Check Player Registry (Auto-provisioned accounts)
      const playerProfile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (playerProfile && pass === playerProfile.fullName.replace(/\s/g, '').toLowerCase() + '_IAL26') {
        login(playerProfile.email, SystemRole.PLAYER, playerProfile.assignedFranchise, playerProfile.id);
        setLoading(false);
        return;
      }

      addToast("Invalid personnel credentials. Access Denied.", "error");
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-md">
        <div className="bg-league-panel border-4 border-league-accent p-10 md:p-12 rounded-[3rem] shadow-[0_0_100px_rgba(228,29,36,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <svg className="w-20 h-20" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
          </div>

          <div className="text-center mb-10 space-y-2">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">SECURE UPLINK</h2>
            <p className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em]">Personnel Credentials Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-league-muted tracking-[0.3em] px-2">Operational Endpoint (Email)</label>
              <input 
                required
                type="email" 
                className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent transition-all font-bold placeholder:opacity-20"
                placeholder="id@ial-node.net"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-league-muted tracking-[0.3em] px-2">Access Key</label>
              <input 
                required
                type="password" 
                className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent transition-all font-bold placeholder:opacity-20"
                placeholder="••••••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-league-accent text-white py-5 rounded-[2rem] font-black italic uppercase tracking-[0.3em] text-sm shadow-xl hover:brightness-125 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "INITIALIZE SESSION"
              )}
            </button>

            <div className="pt-4 border-t border-league-border/50">
                <button 
                type="button"
                onClick={() => setView('landing')}
                className="w-full text-[9px] font-black uppercase text-league-muted hover:text-white tracking-widest transition-colors py-2"
                >
                Return to Public Portal
                </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center opacity-30">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-league-muted">System Node 2.5.0-OS • London Command Center</p>
           <p className="text-[7px] font-black uppercase tracking-[0.2em] text-league-muted mt-2">Authenticated personnel only. Unauthorized access is recorded.</p>
        </div>
      </div>
    </div>
  );
};
