
import React, { useState } from 'react';
import { Role, Franchise, Preferences, RecruitingStatus, Profile, TalentTier } from '../types';
import { useApp } from '../App';

export const RegistrationForm: React.FC = () => {
  const { addProfile, addToast, logActivity, setView } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dob: '', nationality: '', positions: '',
    height_cm: '', weight_kg: '', consent: false, needsHousing: false
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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const age = calculateAge(formData.dob);
    if (age < 18) {
      addToast("IAL recruiting is 18+. Submission blocked.", "error");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const p: Profile = {
        id: 'p' + Math.random().toString(36).substr(2, 5),
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dob,
        nationality: formData.nationality,
        role: Role.PLAYER, 
        tier: TalentTier.TIER3, 
        status: RecruitingStatus.NEW_LEAD,
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
        assignedFranchise: undefined,
        avatar_url: `https://i.pravatar.cc/150?u=${formData.email}`,
        needsHousing: formData.needsHousing
      };
      
      addProfile(p);
      logActivity('REGISTRATION', `Personnel Entry Created: ${p.fullName}`, p.id);
      setSuccess(true);
      setLoading(false);
      addToast("Registry Packet Committed Successfully.", "success");
    }, 1500);
  };

  if (success) return (
    <div className="text-center p-12 bg-league-panel border-4 border-league-ok rounded-[3rem] animate-in zoom-in-95 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-league-ok/20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-league-ok">
         <svg className="w-10 h-10 text-league-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-4xl font-black italic uppercase text-white mb-4">Registry Secure</h2>
      <p className="text-league-muted uppercase tracking-widest text-[10px] mb-10 font-bold opacity-70">
        Your application has been received. Our scout nodes will review your dossier for Franchise (Negotiated), Starter (1k/Game), or Practice Squad placement.
      </p>
      <button onClick={() => setView('landing')} className="bg-league-accent text-white px-12 py-5 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl hover:brightness-110">Return to public node</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} id="draft-form" className="space-y-12">
      <div className="space-y-6">
        <div className="flex justify-between items-end mb-4">
           <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] italic">Athlete Induction Node</h4>
           <span className="text-[8px] font-black uppercase text-league-muted bg-white/5 px-3 py-1 rounded-full border border-white/10 italic">Tiered Paid Contracts Active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="First Name" value={formData.firstName} onChange={(v: string) => setFormData({...formData, firstName: v})} />
          <Input label="Last Name" value={formData.lastName} onChange={(v: string) => setFormData({...formData, lastName: v})} />
          <Input label="Operational Email" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
          <Input label="Date of Birth" type="date" value={formData.dob} onChange={(v: string) => setFormData({...formData, dob: v})} />
          <Input label="Nationality / Passport Origin" value={formData.nationality} onChange={(v: string) => setFormData({...formData, nationality: v})} />
          <Input label="Tactical Positions" value={formData.positions} onChange={(v: string) => setFormData({...formData, positions: v})} placeholder="e.g. QB, WR, LB (Multi-select)" />
          <Input label="Height (cm)" type="number" value={formData.height_cm} onChange={(v: string) => setFormData({...formData, height_cm: v})} />
          <Input label="Weight (kg)" type="number" value={formData.weight_kg} onChange={(v: string) => setFormData({...formData, weight_kg: v})} />
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-4 italic">Node Preference Index</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {preferences.map((pref, i) => (
            <div key={i} className="space-y-2">
              <label className="text-[8px] font-black uppercase text-league-muted tracking-widest">Priority {i+1}</label>
              <select 
                className="w-full bg-league-bg border border-league-border p-3 rounded-xl text-white font-bold text-[10px] appearance-none focus:border-league-accent outline-none cursor-pointer shadow-inner"
                value={pref}
                onChange={e => handlePreferenceChange(i, e.target.value as Franchise)}
              >
                {Object.values(Franchise).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
         <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-4 italic">Logistical Requirements</h4>
         <div className="flex items-start gap-4 bg-black/40 p-8 rounded-3xl border border-league-border shadow-inner group hover:border-league-blue transition-all">
            <input type="checkbox" className="mt-1.5 w-6 h-6 accent-league-blue cursor-pointer" checked={formData.needsHousing} onChange={e => setFormData({...formData, needsHousing: e.target.checked})} />
            <div className="space-y-2">
               <label className="text-[10px] font-black text-white uppercase tracking-widest block cursor-pointer">Require Franchise Housing Support (Villa/Beds)</label>
               <p className="text-[8px] text-league-muted font-bold uppercase tracking-widest italic leading-relaxed">Checking this indicates you require local housing at your assigned franchise node. This impacts contract structure (Option B vs A).</p>
            </div>
         </div>
      </div>

      <div className="flex items-start gap-4 bg-black/40 p-8 rounded-3xl border border-league-border shadow-inner">
        <input type="checkbox" required className="mt-1.5 w-5 h-5 accent-league-accent cursor-pointer" checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})} />
        <div className="space-y-2">
           <label className="text-[10px] font-bold text-league-muted uppercase leading-relaxed tracking-widest block cursor-pointer">
             I confirm I am 18+ and consent to being contacted about IAL opportunities across all global franchises.
           </label>
           <p className="text-[8px] text-league-accent font-black uppercase tracking-widest italic opacity-60">Applicants must be 18+ or older to enter the registry.</p>
        </div>
      </div>

      <button type="submit" disabled={!formData.consent || loading} className="w-full bg-league-accent text-white py-8 rounded-[2.5rem] font-black italic uppercase tracking-[0.5em] text-2xl shadow-[0_0_50px_rgba(228,29,36,0.3)] hover:brightness-110 transition-all disabled:opacity-30 flex items-center justify-center gap-4">
        {loading ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" /> : "TRANSMIT APPLICATION"}
      </button>
    </form>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="space-y-2 group">
    <label className="text-[9px] font-black uppercase text-league-muted tracking-widest group-focus-within:text-league-accent transition-colors ml-1">{label}</label>
    <input required type={type} placeholder={placeholder} className="w-full bg-league-bg border border-league-border p-4 rounded-xl text-white font-bold text-xs focus:border-league-accent outline-none transition-all shadow-inner hover:border-white/20" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);
