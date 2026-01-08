
import React, { useState } from 'react';
import { Role, Franchise, Preferences, RecruitingStatus, Profile, TalentTier } from '../types';
import { useApp } from '../App';

export const RegistrationForm: React.FC = () => {
  const { addProfile, addToast } = useApp();
  const [role, setRole] = useState<Role>(Role.PLAYER);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    nationality: '',
    positions: '',
    height_cm: '',
    weight_kg: '',
    personalBio: '',
    consent: false,
  });

  const [preferences, setPreferences] = useState<Preferences>({
    rank1: Franchise.NOTTINGHAM,
    rank2: Franchise.GLASGOW,
    rank3: Franchise.DUSSELDORF,
    rank4: Franchise.STUTTGART,
    rank5: Franchise.ZURICH,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handlePrefChange = (rank: keyof Preferences, value: Franchise) => {
    setPreferences(prev => ({ ...prev, [rank]: value }));
  };

  const validatePreferences = () => {
    const values = Object.values(preferences);
    return new Set(values).size === values.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (calculateAge(formData.dob) < 18) {
      setError("Applicants must be 18 years or older.");
      setLoading(false);
      return;
    }

    if (!validatePreferences()) {
      setError("Franchise preferences must be unique for each rank (1-5).");
      setLoading(false);
      return;
    }

    if (!formData.consent) {
      setError("You must agree to the data processing consent.");
      setLoading(false);
      return;
    }

    // Prepare API Payload
    const payload = {
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.dob,
      nationality: formData.nationality,
      preferences: preferences,
      applicant_source: "WEB_FORM",
      ...(role === Role.PLAYER ? {
        positions: formData.positions.split(',').map(p => p.trim()),
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseInt(formData.weight_kg) : null,
      } : {
        coaching_roles: formData.positions.split(',').map(p => p.trim()),
        experience_summary: formData.personalBio
      })
    };

    try {
      // Dynamic API URL for Railway/Production
      const API_BASE = window.location.hostname === 'localhost' 
        ? 'http://localhost:8000' 
        : `https://${window.location.hostname.replace('www.', 'api.')}`;

      const endpoint = role === Role.PLAYER ? '/applications/player' : '/applications/coach';
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail?.[0]?.msg || result.detail || "Transmission failed.");
      }

      setAppId(result.application_id);

      // Also create local Profile Object for UI immediate update
      const newProfile: Profile = {
        id: result.application_id || Math.random().toString(36).substr(2, 9),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dob,
        nationality: formData.nationality,
        role: role,
        tier: TalentTier.TIER3,
        status: RecruitingStatus.NEW_LEAD,
        preferences: preferences,
        createdAt: new Date().toISOString(),
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
        weight_kg: formData.weight_kg ? parseInt(formData.weight_kg) : undefined,
        positions: formData.positions.split(',').map(p => p.trim()),
        personalBio: formData.personalBio,
        metrics: { speed: 5, strength: 5, agility: 5, iq: 5, versatility: 5 },
        isIronmanPotential: false,
        avatar_url: '',
        documents: [],
        onboardingChecklist: [],
        combineResults: []
      };

      addProfile(newProfile);
      setSuccess(true);
      addToast("Application Successfully Committed", "success");
    } catch (err: any) {
      setError(err.message);
      addToast("Induction Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const playerPass = formData.fullName.replace(/\s/g, '').toLowerCase() + '2024';
    return (
      <div className="max-w-2xl mx-auto p-12 bg-league-panel border border-league-border rounded-[3rem] text-center space-y-8 animate-in zoom-in-95 shadow-2xl">
        <div className="w-24 h-24 bg-league-ok/10 text-league-ok rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-league-ok/30">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Registry Committed</h2>
        <div className="text-[10px] font-black text-league-accent uppercase tracking-widest bg-league-bg py-2 rounded-full border border-league-border">
          Packet ID: {appId}
        </div>
        <p className="text-league-muted leading-relaxed font-bold italic uppercase">
          Your profile has been committed to the International Arena League Command Hub. 
        </p>
        
        <div className="bg-league-bg border border-league-ok/30 p-6 rounded-2xl space-y-3">
            <h4 className="text-league-ok text-[10px] font-black uppercase tracking-[0.4em]">Uplink Credentials Provisioned</h4>
            <p className="text-[11px] text-white/70 font-medium">Use your registered email and the following temporary access key to access your personnel portal:</p>
            <div className="bg-league-panel py-3 rounded-xl border border-league-border font-mono text-white font-black text-lg select-all">
                {playerPass}
            </div>
            <p className="text-[9px] text-league-muted uppercase font-black tracking-widest italic opacity-50">Logins available via "Secure Access" portal</p>
        </div>

        <button onClick={() => setSuccess(false)} className="bg-league-accent text-white px-12 py-4 rounded-2xl font-black italic uppercase tracking-[0.2em] text-sm transition-all shadow-xl hover:-translate-y-1">Submit New Entry</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-12 text-center space-y-2">
        <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">IAL PLAYER DRAFT APPLICATION</h2>
        <p className="text-league-muted uppercase tracking-[0.5em] text-[10px] font-black">Official Personnel Induction Interface</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Role Selection */}
        <div className="bg-league-panel p-10 border border-league-border rounded-[2.5rem] shadow-2xl">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-league-accent mb-6 text-center">Operational Role Classification</label>
            <div className="flex gap-6">
              {[Role.PLAYER, Role.COACH].map((r) => (
                <button 
                  key={r} 
                  type="button" 
                  onClick={() => setRole(r)} 
                  className={`flex-1 py-6 px-10 rounded-2xl border-2 font-black uppercase italic tracking-[0.3em] text-lg transition-all ${role === r ? 'bg-league-accent border-league-accent text-white shadow-[0_15px_30px_rgba(228,29,36,0.3)]' : 'bg-league-bg border-league-border text-league-muted hover:border-league-muted'}`}
                >
                  {r}
                </button>
              ))}
            </div>
        </div>

        {/* Personal Data Section */}
        <div className="bg-league-panel p-10 border border-league-border rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-10 shadow-2xl">
          <div className="col-span-full mb-2 flex items-center gap-4">
             <div className="h-0.5 w-10 bg-league-accent" />
             <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Personal Parameters</h3>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Identification Name</label>
            <input required type="text" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Comms Endpoint (Email)</label>
            <input required type="email" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Tactical Positions (Comma Separated)</label>
            <input required type="text" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.positions} onChange={e => setFormData({...formData, positions: e.target.value})} placeholder="e.g. QB, JACK, WR" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Date of Induction (Birth)</label>
            <input required type="date" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          </div>
          <div className="col-span-full">
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Professional Dossier / Personal History</label>
            <textarea 
              required
              rows={5}
              placeholder="Detail your arena-relevant history, performance metrics, and strategic value..."
              className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold text-sm resize-none shadow-inner"
              value={formData.personalBio}
              onChange={e => setFormData({...formData, personalBio: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Origin Nationality</label>
            <input required type="text" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Height (cm)</label>
                <input type="number" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} />
             </div>
             <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-muted mb-2">Weight (kg)</label>
                <input type="number" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} />
             </div>
          </div>
        </div>

        {/* Franchise Preference Section */}
        <div className="bg-league-panel p-10 border border-league-border rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-0.5 w-10 bg-league-accent" />
             <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Strategic Franchise Routing</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {(['rank1', 'rank2', 'rank3', 'rank4', 'rank5'] as const).map((rank, idx) => (
              <div key={rank} className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-league-accent text-center">Priority {idx + 1}</label>
                <select 
                  className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white appearance-none focus:outline-none focus:border-league-accent font-black text-[11px] text-center shadow-inner cursor-pointer" 
                  value={preferences[rank]} 
                  onChange={e => handlePrefChange(rank, e.target.value as Franchise)}
                >
                  {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[9px] text-league-muted font-black uppercase tracking-[0.3em] text-center italic opacity-50">Draft eligibility requires a unique rank assignment for all five operational nodes.</p>
        </div>

        {/* Consent Section */}
        <div className="bg-league-panel p-10 border border-league-border rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
           <div className="relative inline-flex">
              <input 
                type="checkbox" 
                id="consent" 
                className="w-8 h-8 accent-league-accent cursor-pointer opacity-0 absolute inset-0 z-10"
                checked={formData.consent}
                onChange={e => setFormData({...formData, consent: e.target.checked})}
              />
              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${formData.consent ? 'bg-league-accent border-league-accent text-white' : 'border-league-border bg-league-bg'}`}>
                 {formData.consent && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
              </div>
           </div>
           <label htmlFor="consent" className="text-[11px] font-bold text-league-muted uppercase leading-relaxed cursor-pointer select-none">
             I authorize the International Arena League to store and process my biometric, technical, and personal data for recruitment and personnel management purposes within the centralized command network.
           </label>
        </div>

        {error && (
          <div className="bg-league-accent/10 border border-league-accent p-6 rounded-2xl text-league-accent font-black uppercase italic tracking-[0.2em] text-xs flex items-center gap-4 animate-in slide-in-from-top-2">
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-league-accent hover:brightness-125 text-white py-8 rounded-[2rem] font-black italic uppercase tracking-[0.5em] text-2xl transition-all shadow-[0_20px_50px_rgba(228,29,36,0.4)] hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
        >
          {loading ? (
             <>
               <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
               ENCRYPTING UPLINK...
             </>
          ) : "EXECUTE INDUCTION"}
        </button>
      </form>
    </div>
  );
};
