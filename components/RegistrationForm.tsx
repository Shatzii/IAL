
import React, { useState, useRef } from 'react';
import { Role, Franchise, Preferences, RecruitingStatus, Profile, TalentTier } from '../types';
import { useApp } from '../App';

export const RegistrationForm: React.FC = () => {
  const { addProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<Role>(Role.PLAYER);
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

  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    rank1: Franchise.NOTTINGHAM,
    rank2: Franchise.GLASGOW,
    rank3: Franchise.DUSSELDORF,
    rank4: Franchise.STUTTGART,
    rank5: Franchise.ZURICH,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    if (calculateAge(formData.dob) < 18) {
      setError("Applicants must be 18 years or older.");
      return;
    }

    if (!validatePreferences()) {
      setError("Franchise preferences must be unique for each rank (1-5).");
      return;
    }

    if (!formData.consent) {
      setError("You must agree to the data processing consent.");
      return;
    }

    // Create Profile Object
    const newProfile: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dob,
      nationality: formData.nationality,
      role: role,
      tier: TalentTier.TIER3, // Default to Developmental for new public registrants
      status: RecruitingStatus.NEW_LEAD,
      preferences: preferences,
      createdAt: new Date().toISOString(),
      height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
      weight_kg: formData.weight_kg ? parseInt(formData.weight_kg) : undefined,
      positions: formData.positions.split(',').map(p => p.trim()),
      personalBio: formData.personalBio,
      metrics: {
        speed: 5,
        strength: 5,
        agility: 5,
        iq: 5,
        versatility: 5
      },
      isIronmanPotential: false,
      avatar_url: avatarBase64 || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName}`
    };

    addProfile(newProfile);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-league-panel border border-league-border rounded-xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-league-ok/20 text-league-ok rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Registration Success</h2>
        <p className="text-league-muted leading-relaxed">
          Your profile has been added to the International Arena League Scouting Pool. You are now visible to Franchise GMs.
        </p>
        <button onClick={() => setSuccess(false)} className="bg-league-accent text-white px-8 py-3 rounded-lg font-bold transition-all uppercase tracking-widest text-sm">Submit Another</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-10 text-center">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2 text-white">IAL Registry</h2>
        <p className="text-league-muted uppercase tracking-[0.3em] text-xs font-bold">Join the professional ranks of Arena Football</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Role Selection & Avatar Upload */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-league-panel p-8 border border-league-border rounded-xl flex flex-col justify-center">
            <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-4">I am applying as a:</label>
            <div className="flex gap-4">
              {[Role.PLAYER, Role.COACH].map((r) => (
                <button 
                  key={r} 
                  type="button" 
                  onClick={() => setRole(r)} 
                  className={`flex-1 py-4 px-6 rounded-lg border font-black uppercase italic tracking-widest text-sm transition-all ${role === r ? 'bg-league-accent border-league-accent text-white shadow-lg' : 'bg-league-bg border-league-border text-league-muted'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-league-panel p-6 border border-league-border rounded-xl flex flex-col items-center justify-center space-y-4">
             <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted text-center">Profile Picture</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="group relative w-24 h-24 rounded-2xl bg-league-bg border-2 border-dashed border-league-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-league-accent transition-all"
             >
               {avatarBase64 ? (
                 <img src={avatarBase64} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center">
                   <svg className="w-6 h-6 text-league-muted mx-auto mb-1 group-hover:text-league-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                   <span className="text-[8px] font-bold text-league-muted uppercase">Upload</span>
                 </div>
               )}
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-black uppercase text-white">Change</span>
               </div>
             </div>
             <input 
               ref={fileInputRef}
               type="file" 
               accept="image/*" 
               className="hidden" 
               onChange={handleAvatarChange}
             />
             <p className="text-[8px] text-league-muted uppercase font-bold text-center">JPG/PNG • Max 2MB</p>
          </div>
        </div>

        {/* Personal Data Section */}
        <div className="bg-league-panel p-8 border border-league-border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full mb-2">
            <h3 className="text-xl font-black italic tracking-tight border-l-4 border-league-accent pl-3 text-white uppercase">Personal Data</h3>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Full Name</label>
            <input required type="text" className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Email</label>
            <input required type="email" className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Positions (e.g. QB, WR, Jack LB)</label>
            <input required type="text" className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold" value={formData.positions} onChange={e => setFormData({...formData, positions: e.target.value})} placeholder="Arena specific positions" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Date of Birth</label>
            <input required type="date" className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          </div>
          <div className="col-span-full">
            <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Personal Bio & Football History</label>
            <textarea 
              required
              rows={4}
              placeholder="Tell us about your background, previous teams, and why you're a good fit for the European League..."
              className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold text-sm resize-none"
              value={formData.personalBio}
              onChange={e => setFormData({...formData, personalBio: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Nationality</label>
            <input required type="text" className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Height (cm)</label>
                <input type="number" className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} />
             </div>
             <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-league-muted mb-1">Weight (kg)</label>
                <input type="number" className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white focus:outline-none focus:border-league-accent font-bold" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} />
             </div>
          </div>
        </div>

        {/* Franchise Preference Section */}
        <div className="bg-league-panel p-8 border border-league-border rounded-xl">
          <h3 className="text-xl font-black italic tracking-tight border-l-4 border-league-accent pl-3 mb-6 text-white uppercase">Franchise Priority List</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(['rank1', 'rank2', 'rank3', 'rank4', 'rank5'] as const).map((rank, idx) => (
              <div key={rank} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-league-muted text-center">Choice {idx + 1}</label>
                <select 
                  className="w-full bg-league-bg border border-league-border p-3 rounded-lg text-white appearance-none focus:outline-none focus:border-league-accent font-bold text-[11px] text-center" 
                  value={preferences[rank]} 
                  onChange={e => handlePrefChange(rank, e.target.value as Franchise)}
                >
                  {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[9px] text-league-muted font-bold uppercase tracking-widest text-center italic">Applicants must rank all five franchises to ensure draft eligibility.</p>
        </div>

        {/* Consent Section */}
        <div className="bg-league-panel p-6 border border-league-border rounded-xl flex items-center gap-4">
           <input 
             type="checkbox" 
             id="consent" 
             className="w-5 h-5 accent-league-accent cursor-pointer"
             checked={formData.consent}
             onChange={e => setFormData({...formData, consent: e.target.checked})}
           />
           <label htmlFor="consent" className="text-[10px] font-bold text-league-muted uppercase leading-relaxed cursor-pointer select-none">
             I consent to the International Arena League processing my biometric and personal data for recruitment purposes and sharing this data with franchise executives.
           </label>
        </div>

        {error && (
          <div className="bg-league-accent/10 border border-league-accent p-4 rounded-lg text-league-accent font-black uppercase italic tracking-widest text-xs flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}

        <button type="submit" className="w-full bg-league-accent hover:bg-red-700 text-white py-6 rounded-xl font-black italic uppercase tracking-widest text-xl transition-all shadow-[0_10px_40px_rgba(228,29,36,0.3)] hover:-translate-y-1 active:translate-y-0">
          Execute Registration
        </button>
      </form>
    </div>
  );
};
