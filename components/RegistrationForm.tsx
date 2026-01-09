
import React, { useState, useEffect } from 'react';
import { Role, Franchise, Preferences, RecruitingStatus, Profile, TalentTier } from '../types';
import { useApp } from '../App';

export const RegistrationForm: React.FC = () => {
  const { addProfile, addToast } = useApp();
  const [role, setRole] = useState<Role>(Role.PLAYER);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dob: '', nationality: '', positions: '',
    currentClub: '', isUnderContract: false, height_cm: '', weight_kg: '', highlight1: '', consent: false,
  });
  const [preferences, setPreferences] = useState<Preferences>({
    rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.DUSSELDORF,
    rank4: Franchise.STUTTGART, rank5: Franchise.ZURICH,
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const p: Profile = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dob,
        nationality: formData.nationality,
        role,
        tier: TalentTier.TIER3,
        status: RecruitingStatus.NEW_LEAD,
        preferences,
        createdAt: new Date().toISOString(),
        positions: formData.positions.split(',').map(s => s.trim()),
        metrics: { speed: 5, strength: 5, agility: 5, iq: 5, versatility: 5 },
        isIronmanPotential: false,
        documents: [],
        onboardingChecklist: [],
        draftReadiness: 45
      };
      addProfile(p);
      setSuccess(true);
      setLoading(false);
      addToast("Profile Committed to Registry", "success");
    }, 1500);
  };

  if (success) return (
    <div className="text-center p-12 bg-league-panel border border-league-border rounded-[3rem] animate-in zoom-in-95">
      <h2 className="text-4xl font-black italic uppercase text-white mb-6">Induction Complete</h2>
      <p className="text-league-muted uppercase tracking-widest text-xs mb-8">Your data packet is now live in the Personnel Pool.</p>
      <button onClick={() => setSuccess(false)} className="bg-league-accent text-white px-12 py-4 rounded-2xl font-black italic uppercase">Return to Portal</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-league-bg/50 p-8 rounded-[2rem] border border-league-border">
        <input required placeholder="First Name" className="bg-league-panel p-4 rounded-xl border border-league-border text-white" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
        <input required placeholder="Last Name" className="bg-league-panel p-4 rounded-xl border border-league-border text-white" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        <input required type="email" placeholder="Email Uplink" className="bg-league-panel p-4 rounded-xl border border-league-border text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input required type="date" className="bg-league-panel p-4 rounded-xl border border-league-border text-white" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
        <input required placeholder="Positions (e.g. QB, DB)" className="md:col-span-2 bg-league-panel p-4 rounded-xl border border-league-border text-white" value={formData.positions} onChange={e => setFormData({...formData, positions: e.target.value})} />
      </div>
      <div className="flex items-center gap-4 bg-league-panel p-6 rounded-2xl border border-league-border">
        <input type="checkbox" checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})} />
        <label className="text-[10px] font-bold text-league-muted uppercase">I authorize IAL to process my biometric and personnel data for recruitment ops.</label>
      </div>
      <button type="submit" disabled={!formData.consent || loading} className="w-full bg-league-accent text-white py-8 rounded-[2rem] font-black italic uppercase tracking-[0.5em] text-2xl shadow-2xl hover:brightness-110 disabled:opacity-30">
        {loading ? "COMMITTING..." : "SUBMIT PROFILE"}
      </button>
    </form>
  );
};
