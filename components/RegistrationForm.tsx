
import React, { useState } from 'react';
import { Role, Franchise, RecruitingStatus, Profile, TalentTier } from '../types';
import { useApp } from '../App';

export const RegistrationForm: React.FC = () => {
  const { addProfile, addToast, setView } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dob: '', nationality: '', positions: '',
    height_cm: '', weight_kg: '', consent: false, needsHousing: false
  });
  const [preferences, setPreferences] = useState<Franchise[]>([
    Franchise.NOTTINGHAM, Franchise.GLASGOW, Franchise.DUSSELDORF, Franchise.STUTTGART, Franchise.ZURICH
  ]);
  const [success, setSuccess] = useState(false);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculateAge(formData.dob) < 18) {
      addToast("18+ Only.", "error");
      return;
    }

    setLoading(true);
    const p: Profile = {
      id: 'P-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dob,
      nationality: formData.nationality,
      role: Role.PLAYER, 
      tier: TalentTier.TIER3, 
      status: RecruitingStatus.NEW_LEAD,
      preferences: { rank1: preferences[0], rank2: preferences[1], rank3: preferences[2], rank4: preferences[3], rank5: preferences[4] },
      createdAt: new Date().toISOString(),
      positions: formData.positions.split(',').map(s => s.trim().toUpperCase()),
      height_cm: parseInt(formData.height_cm) || 0,
      weight_kg: parseInt(formData.weight_kg) || 0,
      metrics: { speed: 5, strength: 5, agility: 5, iq: 5, versatility: 5 },
      isIronmanPotential: false,
      documents: [],
      onboardingChecklist: [],
      avatar_url: `https://i.pravatar.cc/150?u=${formData.email}`,
      needsHousing: formData.needsHousing
    };
    
    await addProfile(p);
    setSuccess(true);
    setLoading(false);
    addToast("Dossier Live in Registry.", "success");
  };

  if (success) return (
    <div className="text-center p-12 bg-league-panel border-4 border-league-ok rounded-[3rem] animate-in zoom-in-95 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-league-ok/20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-league-ok shadow-[0_0_20px_#23d18b44]">
         <svg className="w-10 h-10 text-league-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-4xl font-black italic uppercase text-white mb-2">Registry Committed</h2>
      <p className="text-league-muted uppercase tracking-widest text-[10px] mb-10 font-bold opacity-70 leading-relaxed">
        Your dossier is now live in the global Personnel Pool. Franchise GMs and Coaches can now access your metrics and scouting film.
      </p>
      <div className="flex gap-4 justify-center">
        <button onClick={() => setView('profiles')} className="bg-league-accent text-white px-8 py-4 rounded-xl font-black italic uppercase tracking-widest text-[10px] shadow-xl">View Personnel Pool</button>
        <button onClick={() => setView('landing')} className="bg-league-bg border border-league-border text-white px-8 py-4 rounded-xl font-black italic uppercase tracking-widest text-[10px]">Exit</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} id="draft-form" className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="First Name" value={formData.firstName} onChange={(v: string) => setFormData({...formData, firstName: v})} />
        <Input label="Last Name" value={formData.lastName} onChange={(v: string) => setFormData({...formData, lastName: v})} />
        <Input label="Email" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
        <Input label="Date of Birth" type="date" value={formData.dob} onChange={(v: string) => setFormData({...formData, dob: v})} />
        <Input label="Nationality" value={formData.nationality} onChange={(v: string) => setFormData({...formData, nationality: v})} />
        <Input label="Positions" value={formData.positions} onChange={(v: string) => setFormData({...formData, positions: v})} placeholder="QB, WR" />
      </div>
      <div className="bg-black/40 p-6 rounded-2xl border border-league-border flex items-center gap-4">
        <input type="checkbox" className="w-5 h-5 accent-league-blue" checked={formData.needsHousing} onChange={e => setFormData({...formData, needsHousing: e.target.checked})} />
        <label className="text-[10px] font-black text-white uppercase tracking-widest">Require Franchise Housing Support</label>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-league-accent text-white py-6 rounded-2xl font-black italic uppercase tracking-[0.4em] text-xl shadow-xl hover:scale-[1.01] transition-transform">
        {loading ? 'Committing...' : 'COMMIT TO REGISTRY'}
      </button>
    </form>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-1">{label}</label>
    <input required type={type} placeholder={placeholder} className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-xs focus:border-league-accent outline-none shadow-inner" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);
