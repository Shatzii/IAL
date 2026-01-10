
import React, { useState } from 'react';
import { Role, Franchise, Preferences, RecruitingStatus, Profile, TalentTier } from '../types';
import { useApp } from '../App';

export const RegistrationForm: React.FC = () => {
  const { addProfile, addToast, logActivity, setView } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dob: '', nationality: '', positions: '',
    height_cm: '', weight_kg: '', consent: false,
  });
  const [preferences, setPreferences] = useState<Franchise[]>([
    Franchise.NOTTINGHAM, Franchise.GLASGOW, Franchise.DUSSELDORF, Franchise.STUTTGART, Franchise.ZURICH
  ]);
  const [success, setSuccess] = useState(false);

  const handlePreferenceChange = (index: number, value: Franchise) => {
    const newPrefs = [...preferences];
    const oldIndex = newPrefs.indexOf(value);
    const temp = newPrefs[index];
    newPrefs[index] = value;
    newPrefs[oldIndex] = temp;
    setPreferences(newPrefs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate Age
    const birthDate = new Date(formData.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      addToast("IAL recruitment is restricted to 18+. Induction Rejected.", "error");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const p: Profile = {
        id: 'p' + Math.random().toString(36).substr(2, 5),
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dob,
        nationality: formData.nationality,
        role: Role.PLAYER, // All web registrations default to player pool for 2026
        tier: TalentTier.TIER3,
        status: RecruitingStatus.NEW_LEAD, // Enters player pool immediately
        preferences: {
          rank1: preferences[0], rank2: preferences[1], rank3: preferences[2],
          rank4: preferences[3], rank5: preferences[4]
        },
        createdAt: new Date().toISOString().split('T')[0],
        positions: formData.positions.split(',').map(s => s.trim().toUpperCase()),
        height_cm: parseInt(formData.height_cm) || 0,
        weight_kg: parseInt(formData.weight_kg) || 0,
        metrics: { speed: 5, strength: 5, agility: 5, iq: 5, versatility: 5 },
        isIronmanPotential: false,
        documents: [],
        onboardingChecklist: [],
        draftReadiness: 45,
        assignedFranchise: undefined, // Must be unassigned to enter global pool
        assignedTeam: undefined,
        avatar_url: `https://i.pravatar.cc/150?u=${formData.email}`
      };
      
      addProfile(p);
      logActivity('REGISTRATION', `Personnel Dossier Created: ${p.fullName} (Unassigned Pool)`, p.id);
      setSuccess(true);
      setLoading(false);
      addToast("Packet Committed. You are now in the 2026 Pool.", "success");
    }, 1500);
  };

  if (success) return (
    <div className="text-center p-12 bg-league-panel border-4 border-league-ok rounded-[3rem] animate-in zoom-in-95 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-league-ok/20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-league-ok">
         <svg className="w-10 h-10 text-league-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-4xl font-black italic uppercase text-white mb-4">Registry Secure</h2>
      <p className="text-league-muted uppercase tracking-widest text-[10px] mb-10 font-bold opacity-70">Your profile is live in the player pool. Coaches can now review your data.</p>
      <button onClick={() => setView('landing')} className="bg-league-accent text-white px-12 py-5 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl hover:brightness-110">Return to HQ</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-4 italic">Athletic Identification Nodes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="First Name" value={formData.firstName} onChange={v => setFormData({...formData, firstName: v})} />
          <Input label="Last Name" value={formData.lastName} onChange={v => setFormData({...formData, lastName: v})} />
          <Input label="Email Address" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
          <Input label="Date of Birth" type="date" value={formData.dob} onChange={v => setFormData({...formData, dob: v})} />
          <Input label="Nationality" value={formData.nationality} onChange={v => setFormData({...formData, nationality: v})} />
          <Input label="Primary Positions" value={formData.positions} onChange={v => setFormData({...formData, positions: v})} placeholder="e.g. QB, WR, LB" />
          <Input label="Height (cm)" type="number" value={formData.height_cm} onChange={v => setFormData({...formData, height_cm: v})} />
          <Input label="Weight (kg)" type="number" value={formData.weight_kg} onChange={v => setFormData({...formData, weight_kg: v})} />
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-4 italic">Franchise Preference Index (Rank 1-5)</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {preferences.map((pref, i) => (
            <div key={i} className="space-y-2">
              <label className="text-[8px] font-black uppercase text-league-muted tracking-widest">Priority {i+1}</label>
              <select 
                className="w-full bg-league-bg border border-league-border p-3 rounded-xl text-white font-bold text-[10px] appearance-none focus:border-league-accent outline-none cursor-pointer"
                value={pref}
                onChange={e => handlePreferenceChange(i, e.target.value as Franchise)}
              >
                {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-4 bg-league-bg/50 p-6 rounded-2xl border border-league-border">
        <input type="checkbox" required className="mt-1 accent-league-accent" checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})} />
        <label className="text-[9px] font-bold text-league-muted uppercase leading-relaxed tracking-widest">
          I authorize the International Arena League to process my athletic, biometric, and contact data for 2026 Draft recruitment operations and sharing with Node-local Franchise GMs.
        </label>
      </div>

      <button type="submit" disabled={!formData.consent || loading} className="w-full bg-league-accent text-white py-8 rounded-[2.5rem] font-black italic uppercase tracking-[0.5em] text-2xl shadow-2xl hover:brightness-110 transition-all disabled:opacity-30 flex items-center justify-center gap-4">
        {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : "COMMIT TO POOL"}
      </button>
    </form>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="space-y-2 group">
    <label className="text-[9px] font-black uppercase text-league-muted tracking-widest group-focus-within:text-league-accent transition-colors">{label}</label>
    <input required type={type} placeholder={placeholder} className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-xs focus:border-league-accent outline-none transition-all shadow-inner" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);
