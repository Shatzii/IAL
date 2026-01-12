
import React, { useState } from 'react';
import { useApp } from '../App';
import { SystemRole, Franchise } from '../types';

export const Login: React.FC = () => {
  const { login, setView, profiles, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const SYSTEM_CREDENTIALS = [
    { email: 'admin@ial-football.com', pass: 'TakeOver2026$$$', role: SystemRole.LEAGUE_ADMIN },
    // Franchise GMs
    { email: 'nottingham@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.NOTTINGHAM },
    { email: 'glasgow@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.GLASGOW },
    { email: 'dusseldorf@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.DUSSELDORF },
    { email: 'stuttgart@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.STUTTGART },
    { email: 'zurich@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.ZURICH },
    // Coaches
    { email: 'phil.garcia@glasgow.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.GLASGOW },
    { email: 'jeff.hunt@nottingham.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.NOTTINGHAM },
    { email: 'chris.mckinny@dusseldorf.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.DUSSELDORF },
    { email: 'talib.wise@zurich.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.ZURICH },
    { email: 'keith.hill@stuttgart.ial.com', pass: 'coach2026$$$', role: SystemRole.COACH_STAFF, franchise: Franchise.STUTTGART },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Sanitize inputs to prevent trailing space errors or case mismatches
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    setTimeout(() => {
      // 1. Check System Credentials
      const cred = SYSTEM_CREDENTIALS.find(c => 
        c.email.toLowerCase() === cleanEmail && 
        c.pass === cleanPass
      );
      
      if (cred) {
        login(cred.email, cred.role, cred.franchise);
        addToast(`Handshake successful. Welcome, ${cred.role}.`, "success");
        setLoading(false);
        return;
      }

      // 2. Check Player Registry (Auto-provisioned accounts)
      const playerProfile = profiles.find(p => p.email.toLowerCase() === cleanEmail);
      if (playerProfile) {
        const playerKey = playerProfile.fullName.replace(/\s/g, '').toLowerCase() + '_IAL26';
        if (cleanPass === playerKey) {
           login(playerProfile.email, SystemRole.PLAYER, playerProfile.assignedFranchise, playerProfile.id);
           addToast("Athlete Profile Synchronized.", "success");
           setLoading(false);
           return;
        }
      }

      addToast("Uplink Refused: Invalid Personnel Credentials.", "error");
      setLoading(false);
    }, 800);
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
            <p className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em]">Personnel Authorization Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-league-muted tracking-[0.3em] px-2">Operational Endpoint (Email)</label>
              <input 
                required
                type="email" 
                autoComplete="email"
                className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent transition-all font-bold placeholder:opacity-20"
                placeholder="id@ial-node.net"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-league-muted tracking-[0.3em] px-2">Access Key</label>
              <div className="relative">
                <input 
                  required
                  type={showPass ? "text" : "password"} 
                  autoComplete="current-password"
                  className="w-full bg-league-bg border border-league-border p-4 pr-12 rounded-2xl text-white outline-none focus:border-league-accent transition-all font-bold placeholder:opacity-20"
                  placeholder="••••••••••••"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-league-muted hover:text-white transition-colors"
                >
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.243 4.243m1.414 1.414L13.875 13.875M21 21l-4.243-4.243m-2.828-2.828L3 3"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </button>
              </div>
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
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-league-muted">System Node 2.5.1-OS • Handshake Protection Active</p>
           <p className="text-[7px] font-black uppercase tracking-[0.2em] text-league-muted mt-2">Authenticated personnel only. Unauthorized access attempts are logged.</p>
        </div>
      </div>
    </div>
  );
};
