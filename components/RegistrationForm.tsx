
import React, { useState, useEffect } from 'react';
import { Role, Franchise, Preferences, RecruitingStatus, Profile, TalentTier } from '../types';
import { useApp } from '../App';

export const RegistrationForm: React.FC = () => {
  const { addProfile, addToast } = useApp();
  const [role, setRole] = useState<Role>(Role.PLAYER);
  const [loading, setLoading] = useState(false);
  const [useImperial, setUseImperial] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    nationality: '',
    positions: '',
    currentClub: '',
    isUnderContract: false,
    height_cm: '',
    weight_kg: '',
    height_ft: '',
    height_in: '',
    weight_lbs: '',
    highlight1: '',
    highlight2: '',
    highlight3: '',
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

  // Conversion Logic
  useEffect(() => {
    if (useImperial) {
      if (formData.height_cm) {
        const totalInches = parseFloat(formData.height_cm) / 2.54;
        const ft = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setFormData(prev => ({ ...prev, height_ft: ft.toString(), height_in: inches.toString() }));
      }
      if (formData.weight_kg) {
        const lbs = Math.round(parseFloat(formData.weight_kg) * 2.20462);
        setFormData(prev => ({ ...prev, weight_lbs: lbs.toString() }));
      }
    } else {
      if (formData.height_ft || formData.height_in) {
        const cm = Math.round((parseInt(formData.height_ft || '0') * 12 + parseInt(formData.height_in || '0')) * 2.54);
        setFormData(prev => ({ ...prev, height_cm: cm.toString() }));
      }
      if (formData.weight_lbs) {
        const kg = Math.round(parseFloat(formData.weight_lbs) / 2.20462);
        setFormData(prev => ({ ...prev, weight_kg: kg.toString() }));
      }
    }
  }, [useImperial]);

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
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

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      full_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.dob,
      nationality: formData.nationality,
      current_club: formData.currentClub,
      is_under_contract: formData.isUnderContract,
      preferences: preferences,
      applicant_source: "WEB_FORM",
      ...(role === Role.PLAYER ? {
        positions: formData.positions.split(',').map(p => p.trim()),
        height_cm: useImperial ? Math.round((parseInt(formData.height_ft || '0') * 12 + parseInt(formData.height_in || '0')) * 2.54) : parseInt(formData.height_cm || '0'),
        weight_kg: useImperial ? Math.round(parseFloat(formData.weight_lbs || '0') / 2.20462) : parseInt(formData.weight_kg || '0'),
        highlight_urls: [formData.highlight1, formData.highlight2, formData.highlight3].filter(u => u.length > 0)
      } : {
        coaching_roles: formData.positions.split(',').map(p => p.trim()),
        experience_summary: formData.personalBio
      })
    };

    try {
      const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
      const endpoint = role === Role.PLAYER ? '/applications/player' : '/applications/coach';
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Transmission failed.");
      }

      setAppId(result.application_id);

      // Fix: Access height_cm and weight_kg from payload using type assertion since payload is a union
      const newProfile: Profile = {
        id: result.application_id || Math.random().toString(36).substr(2, 9),
        fullName: payload.full_name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dob,
        nationality: formData.nationality,
        role: role,
        tier: TalentTier.TIER3,
        status: RecruitingStatus.NEW_LEAD,
        preferences: preferences,
        createdAt: new Date().toISOString(),
        height_cm: (payload as any).height_cm,
        weight_kg: (payload as any).weight_kg,
        positions: formData.positions.split(',').map(p => p.trim()),
        personalBio: formData.personalBio,
        metrics: { speed: 5, strength: 5, agility: 5, iq: 5, versatility: 5 },
        isIronmanPotential: false,
        avatar_url: '',
        documents: [],
        onboardingChecklist: [],
        combineResults: [],
        currentClub: formData.currentClub,
        isUnderContract: formData.isUnderContract,
        highlightUrls: [formData.highlight1, formData.highlight2, formData.highlight3].filter(u => u.length > 0)
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
    const playerPass = (formData.firstName + formData.lastName).toLowerCase() + '2024';
    return (
      <div className="max-w-2xl mx-auto p-8 md:p-12 bg-league-panel border border-league-border rounded-3xl md:rounded-[3rem] text-center space-y-6 md:space-y-8 animate-in zoom-in-95 shadow-2xl">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-league-ok/10 text-league-ok rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 border-2 border-league-ok/30">
          <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Registry Committed</h2>
        <div className="text-[10px] font-black text-league-accent uppercase tracking-widest bg-league-bg py-2 px-4 rounded-full border border-league-border inline-block mx-auto">
          Packet ID: {appId}
        </div>
        <p className="text-league-muted leading-relaxed font-bold italic uppercase text-xs md:text-sm">
          Your profile has been committed to the International Arena League Command Hub. 
        </p>
        
        <div className="bg-league-bg border border-league-ok/30 p-6 rounded-2xl space-y-3">
            <h4 className="text-league-ok text-[10px] font-black uppercase tracking-[0.3em]">Uplink Credentials</h4>
            <p className="text-[10px] md:text-[11px] text-white/70 font-medium">Use your registered email and this temporary key:</p>
            <div className="bg-league-panel py-3 rounded-xl border border-league-border font-mono text-white font-black text-base md:text-lg select-all">
                {playerPass}
            </div>
            <p className="text-[8px] text-league-muted uppercase font-black tracking-widest italic opacity-50">Logins available via "Secure Access"</p>
        </div>

        <button onClick={() => setSuccess(false)} className="w-full md:w-auto bg-league-accent text-white px-12 py-4 rounded-2xl font-black italic uppercase tracking-[0.2em] text-sm transition-all shadow-xl hover:-translate-y-1">Submit New Entry</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 md:pb-20">
      <div className="mb-8 md:mb-12 text-center space-y-2 px-2">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-[1.1] md:leading-none">IAL PLAYER DRAFT APPLICATION</h2>
        <p className="text-league-muted uppercase tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px] font-black">Official Personnel Induction Interface</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
        {/* Role Selection */}
        <div className="bg-league-panel p-6 md:p-10 border border-league-border rounded-2xl md:rounded-[2.5rem] shadow-2xl">
            <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-league-accent mb-4 md:mb-6 text-center">Operational Role Classification</label>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-6">
              {[Role.PLAYER, Role.COACH].map((r) => (
                <button 
                  key={r} 
                  type="button" 
                  onClick={() => setRole(r)} 
                  className={`flex-1 py-4 md:py-6 px-6 md:px-10 rounded-xl md:rounded-2xl border-2 font-black uppercase italic tracking-[0.2em] md:tracking-[0.3em] text-sm md:text-lg transition-all ${role === r ? 'bg-league-accent border-league-accent text-white shadow-[0_10px_20px_rgba(228,29,36,0.25)]' : 'bg-league-bg border-league-border text-league-muted hover:border-league-muted'}`}
                >
                  {r}
                </button>
              ))}
            </div>
        </div>

        {/* Personal Info Section */}
        <div className="bg-league-panel p-6 md:p-10 border border-league-border rounded-2xl md:rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
             <div className="h-0.5 w-8 md:w-10 bg-league-accent" />
             <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Personal Info</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">First Name</label>
              <input required type="text" className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white text-sm focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Last Name</label>
              <input required type="text" className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white text-sm focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Email Address</label>
              <input required type="email" className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white text-sm focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Phone Number</label>
              <input required type="tel" className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white text-sm focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Date of Birth</label>
              <input required type="date" className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white text-sm focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Nationality</label>
              <input required type="text" className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white text-sm focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
            </div>
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Current Club</label>
              <input type="text" className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white text-sm focus:outline-none focus:border-league-accent font-bold shadow-inner" value={formData.currentClub} onChange={e => setFormData({...formData, currentClub: e.target.value})} />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-league-muted">Currently under paid contract?</label>
              <div className="flex bg-league-bg p-1 rounded-lg border border-league-border">
                <button type="button" onClick={() => setFormData({...formData, isUnderContract: true})} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase ${formData.isUnderContract ? 'bg-league-accent text-white' : 'text-league-muted'}`}>Yes</button>
                <button type="button" onClick={() => setFormData({...formData, isUnderContract: false})} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase ${!formData.isUnderContract ? 'bg-league-accent text-white' : 'text-league-muted'}`}>No</button>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Data Section */}
        <div className="bg-league-panel p-6 md:p-10 border border-league-border rounded-2xl md:rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="h-0.5 w-8 md:w-10 bg-league-accent" />
               <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Physical Data</h3>
            </div>
            <button type="button" onClick={() => setUseImperial(!useImperial)} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-league-accent border border-league-accent px-4 py-1.5 rounded-full hover:bg-league-accent hover:text-white transition-all">
              Switch to {useImperial ? 'Metric' : 'Imperial'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
               <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-4">Height</label>
               {useImperial ? (
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <input type="number" placeholder="ft" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-center" value={formData.height_ft} onChange={e => setFormData({...formData, height_ft: e.target.value})} />
                    </div>
                    <div className="flex-1">
                       <input type="number" placeholder="in" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-center" value={formData.height_in} onChange={e => setFormData({...formData, height_in: e.target.value})} />
                    </div>
                 </div>
               ) : (
                 <input type="number" placeholder="cm" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-center" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} />
               )}
            </div>
            <div>
               <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-4">Weight</label>
               {useImperial ? (
                 <input type="number" placeholder="lbs" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-center" value={formData.weight_lbs} onChange={e => setFormData({...formData, weight_lbs: e.target.value})} />
               ) : (
                 <input type="number" placeholder="kg" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-center" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} />
               )}
            </div>
          </div>
        </div>

        {/* Tactical Info Section */}
        <div className="bg-league-panel p-6 md:p-10 border border-league-border rounded-2xl md:rounded-[2.5rem] shadow-2xl space-y-8">
           <div className="flex items-center gap-4">
              <div className="h-0.5 w-8 md:w-10 bg-league-accent" />
              <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Tactical Info</h3>
           </div>
           <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Positions Played (comma separated)</label>
              <input required type="text" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold shadow-inner" value={formData.positions} onChange={e => setFormData({...formData, positions: e.target.value})} placeholder="e.g. QB, WR, DB" />
           </div>
           <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-league-muted mb-2">Professional Summary</label>
              <textarea rows={4} className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-sm resize-none shadow-inner" value={formData.personalBio} onChange={e => setFormData({...formData, personalBio: e.target.value})} placeholder="Describe your experience, achievements, and goals..." />
           </div>
        </div>

        {/* Highlight Film Section */}
        <div className="bg-league-panel p-6 md:p-10 border border-league-border rounded-2xl md:rounded-[2.5rem] shadow-2xl space-y-8">
           <div className="flex items-center gap-4">
              <div className="h-0.5 w-8 md:w-10 bg-league-accent" />
              <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Highlight Film</h3>
           </div>
           <div className="space-y-4">
              <input type="url" placeholder="Primary Link (e.g. Hudl, YouTube)" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white text-xs font-bold shadow-inner" value={formData.highlight1} onChange={e => setFormData({...formData, highlight1: e.target.value})} />
              <input type="url" placeholder="Secondary Link" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white text-xs font-bold shadow-inner" value={formData.highlight2} onChange={e => setFormData({...formData, highlight2: e.target.value})} />
              <input type="url" placeholder="Additional Footage" className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white text-xs font-bold shadow-inner" value={formData.highlight3} onChange={e => setFormData({...formData, highlight3: e.target.value})} />
           </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-league-panel p-6 md:p-10 border border-league-border rounded-2xl md:rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
             <div className="h-0.5 w-8 md:w-10 bg-league-accent" />
             <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Strategic Routing</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
            {(['rank1', 'rank2', 'rank3', 'rank4', 'rank5'] as const).map((rank, idx) => (
              <div key={rank} className="space-y-2">
                <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-league-accent text-center">Rank {idx + 1}</label>
                <select 
                  className="w-full bg-league-bg border border-league-border p-3 md:p-4 rounded-xl text-white appearance-none focus:outline-none focus:border-league-accent font-black text-[9px] md:text-[11px] text-center shadow-inner cursor-pointer" 
                  value={preferences[rank]} 
                  onChange={e => setPreferences({...preferences, [rank]: e.target.value as Franchise})}
                >
                  {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-league-muted font-black uppercase tracking-[0.2em] text-center italic opacity-40">Unique rank assignments required for all five nodes.</p>
        </div>

        {/* Consent Section */}
        <div className="bg-league-panel p-6 md:p-10 border border-league-border rounded-2xl md:rounded-[2.5rem] flex items-start md:items-center gap-4 md:gap-6 shadow-2xl">
           <div className="relative inline-flex flex-shrink-0 pt-1 md:pt-0">
              <input 
                type="checkbox" 
                id="consent" 
                className="w-6 h-6 md:w-8 md:h-8 accent-league-accent cursor-pointer opacity-0 absolute inset-0 z-10"
                checked={formData.consent}
                onChange={e => setFormData({...formData, consent: e.target.checked})}
              />
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg border-2 flex items-center justify-center transition-all ${formData.consent ? 'bg-league-accent border-league-accent text-white shadow-lg' : 'border-league-border bg-league-bg'}`}>
                 {formData.consent && <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
              </div>
           </div>
           <label htmlFor="consent" className="text-[10px] md:text-[11px] font-bold text-league-muted uppercase leading-relaxed cursor-pointer select-none">
             I authorize the International Arena League to store and process my biometric, technical, and personal data for recruitment and personnel management purposes within the command network.
           </label>
        </div>

        {error && (
          <div className="bg-league-accent/10 border border-league-accent p-4 md:p-6 rounded-xl md:rounded-2xl text-league-accent font-black uppercase italic tracking-[0.15em] text-[10px] md:text-xs flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-2">
            <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-league-accent hover:brightness-125 text-white py-6 md:py-8 rounded-2xl md:rounded-[2rem] font-black italic uppercase tracking-[0.3em] md:tracking-[0.5em] text-xl md:text-2xl transition-all shadow-[0_15px_40px_rgba(228,29,36,0.35)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 md:gap-4"
        >
          {loading ? (
             <>
               <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
               PROCESSING...
             </>
          ) : "EXECUTE INDUCTION"}
        </button>
      </form>
    </div>
  );
};
