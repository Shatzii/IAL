
import React, { useState } from 'react';
import { useApp } from '../App';
import { SystemRole, Franchise, AuditActionType } from '../types';

export const Login: React.FC = () => {
  const { login, setView, profiles, addToast, logActivity } = useApp();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Enterprise MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [authContext, setAuthContext] = useState<any>(null);

  const SYSTEM_CREDENTIALS = [
    { email: 'admin@ial-football.com', pass: 'TakeOver2026$$$', role: SystemRole.LEAGUE_ADMIN },
    { email: 'nottingham@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.NOTTINGHAM },
    { email: 'zurich@gm.ial.com', pass: 'coach2026$$$', role: SystemRole.FRANCHISE_GM, franchise: Franchise.ZURICH }
  ];

  const handleInitialAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    setTimeout(() => {
      const cred = SYSTEM_CREDENTIALS.find(c => c.email.toLowerCase() === cleanEmail && c.pass === cleanPass);
      const playerProfile = !cred ? profiles.find(p => p.email.toLowerCase() === cleanEmail) : null;
      const validPlayer = playerProfile && cleanPass === (playerProfile.fullName.replace(/\s/g, '').toLowerCase() + '_IAL26');

      if (cred || validPlayer) {
        setAuthContext(cred || { email: playerProfile?.email, role: SystemRole.PLAYER, franchise: playerProfile?.assignedFranchise, profileId: playerProfile?.id });
        setMfaRequired(true);
        addToast("Handshake Level 1 Clear. Awaiting MFA Code.", "info");
      } else {
        logActivity(AuditActionType.AUTHENTICATION, `Failed login attempt for: ${cleanEmail}`, 'SECURITY_GUARD');
        addToast("Uplink Refused: Invalid Credentials.", "error");
      }
      setLoading(false);
    }, 1200);
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (mfaCode === '123456' || mfaCode === '654321') {
        login(authContext.email, authContext.role, authContext.franchise, authContext.profileId);
      } else {
        addToast("MFA Verification Failed.", "error");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-md">
        <div className="bg-league-panel border-4 border-league-accent p-10 md:p-12 rounded-[3rem] shadow-[0_0_100px_rgba(228,29,36,0.2)] relative overflow-hidden">
          {!mfaRequired ? (
            <>
              <div className="text-center mb-10 space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">SECURE UPLINK</h2>
                <p className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em]">Handshake Level 01</p>
              </div>

              <form onSubmit={handleInitialAuth} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-league-muted tracking-[0.3em] px-2">Operational Endpoint</label>
                  <input required type="email" className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent font-bold" placeholder="id@ial-node.net" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-league-muted tracking-[0.3em] px-2">Access Key</label>
                  <input required type={showPass ? "text" : "password"} className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-white outline-none focus:border-league-accent font-bold" placeholder="••••••••••••" value={pass} onChange={e => setPass(e.target.value)} />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-league-accent text-white py-5 rounded-[2rem] font-black italic uppercase tracking-[0.3em] text-sm shadow-xl flex items-center justify-center gap-3">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "PROCEED TO MFA"}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-10">
              <div className="text-center mb-10 space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">MFA CHALLENGE</h2>
                <p className="text-[10px] font-black uppercase text-league-blue tracking-[0.4em]">Handshake Level 02</p>
              </div>
              <p className="text-[10px] text-league-muted italic font-bold uppercase text-center mb-8">Enter the 6-digit code from your authenticator device.</p>
              <form onSubmit={handleMfaVerify} className="space-y-6">
                <input 
                  required 
                  autoFocus
                  maxLength={6}
                  type="text" 
                  className="w-full bg-league-bg border border-league-border p-6 rounded-2xl text-white text-4xl text-center font-black tracking-[0.5em] outline-none focus:border-league-blue"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                />
                <button type="submit" disabled={loading} className="w-full bg-league-blue text-white py-5 rounded-[2rem] font-black italic uppercase tracking-[0.3em] text-sm shadow-xl">
                  {loading ? "VERIFYING..." : "AUTHORIZE SESSION"}
                </button>
                <button type="button" onClick={() => setMfaRequired(false)} className="w-full text-[9px] font-black uppercase text-league-muted hover:text-white tracking-widest">Back to Credentials</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
