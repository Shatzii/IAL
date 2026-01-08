
import React, { useState } from 'react';
import { Role, Profile, TalentTier, SystemRole } from '../types';
import { useApp } from '../App';

const getTierColor = (tier: TalentTier) => {
  switch (tier) {
    case TalentTier.TIER1: return 'bg-league-accent text-white border-league-accent shadow-[0_0_10px_rgba(228,29,36,0.3)]';
    case TalentTier.TIER2: return 'bg-league-blue text-white border-league-blue shadow-[0_0_10px_rgba(64,169,255,0.3)]';
    case TalentTier.TIER3: return 'bg-league-pill text-league-muted border-league-border';
    default: return 'bg-league-bg text-white border-league-border';
  }
};

export const Profiles: React.FC = () => {
  const { profiles, updateProfile, toggleWatchlist, watchlistIds, isPrivacyMode, currentSystemRole } = useApp();
  const [activeTab, setActiveTab] = useState<Role>(Role.PLAYER);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TalentTier | 'ALL'>('ALL');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canEditTier = currentSystemRole === SystemRole.LEAGUE_ADMIN || currentSystemRole === SystemRole.FRANCHISE_GM;

  const filteredProfiles = profiles.filter(p => 
    p.role === activeTab && 
    (tierFilter === 'ALL' || p.tier === tierFilter) &&
    (posFilter === 'ALL' || p.positions.includes(posFilter)) &&
    p.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const allPositions = Array.from(new Set(profiles.flatMap(p => p.positions))).sort();

  const handleTierUpdate = (id: string, newTier: TalentTier) => {
    updateProfile(id, { tier: newTier });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Personnel Pool</h2>
          <p className="text-league-muted uppercase tracking-widest text-[10px] font-bold">Registry of Professional Talent</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            className="bg-league-panel border border-league-border p-2 rounded text-[10px] font-black uppercase text-white outline-none focus:border-league-accent"
            value={tierFilter} onChange={(e) => setTierFilter(e.target.value as any)}
          >
            <option value="ALL">All Tiers Filter</option>
            {Object.values(TalentTier).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            className="bg-league-panel border border-league-border p-2 rounded text-[10px] font-black uppercase text-white outline-none focus:border-league-accent"
            value={posFilter} onChange={(e) => setPosFilter(e.target.value)}
          >
            <option value="ALL">All Positions</option>
            {allPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
          <input 
            type="text" placeholder="Search..." 
            className="bg-league-panel border border-league-border p-2 rounded text-[10px] font-black uppercase text-white outline-none focus:border-league-accent"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProfiles.map(profile => (
          <div key={profile.id} className="bg-league-panel border border-league-border rounded-xl p-6 group transition-all hover:border-league-accent flex flex-col h-full relative overflow-hidden">
            {/* Visual Indicator of Tier */}
            <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none transition-all ${
              profile.tier === TalentTier.TIER1 ? 'bg-league-accent' : profile.tier === TalentTier.TIER2 ? 'bg-league-blue' : 'bg-transparent'
            }`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={profile.avatar_url} className="w-10 h-10 rounded-full border border-league-border object-cover" />
                <div>
                  <h4 className="font-black italic uppercase text-white leading-none">{profile.fullName}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {canEditTier ? (
                      <select
                        className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border outline-none transition-all ${getTierColor(profile.tier)}`}
                        value={profile.tier}
                        onChange={(e) => handleTierUpdate(profile.id, e.target.value as TalentTier)}
                      >
                        {Object.values(TalentTier).map(t => (
                          <option key={t} value={t} className="bg-black text-white">{t}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getTierColor(profile.tier)}`}>
                        {profile.tier}
                      </span>
                    )}
                    <span className="text-[8px] font-bold text-league-muted uppercase tracking-widest">
                      {isPrivacyMode ? '••••••••' : profile.nationality}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toggleWatchlist(profile.id)}
                className={`p-1.5 rounded-lg border transition-all ${watchlistIds.includes(profile.id) ? 'bg-league-warn border-league-warn text-black' : 'border-league-border text-league-muted hover:text-white'}`}
              >
                ★
              </button>
            </div>
            
            <div className="flex gap-1 flex-wrap mb-4">
              {profile.positions.map(pos => (
                <span key={pos} className="text-[7px] font-black bg-league-bg px-2 py-0.5 rounded border border-league-border text-league-muted uppercase">{pos}</span>
              ))}
            </div>

            {/* Bio Section */}
            <div className="flex-1">
               <div className={`transition-all duration-300 overflow-hidden ${expandedId === profile.id ? 'max-h-96' : 'max-h-16'}`}>
                 <p className="text-[10px] text-league-muted leading-relaxed italic">
                   {profile.personalBio || "No statement of interest provided."}
                 </p>
               </div>
               {profile.personalBio && profile.personalBio.length > 100 && (
                 <button 
                   onClick={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
                   className="text-[8px] font-black uppercase text-league-accent mt-2 hover:underline"
                 >
                   {expandedId === profile.id ? 'Read Less' : 'Read Full Statement'}
                 </button>
               )}
            </div>

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-league-border/50">
               <span className="text-[10px] font-black italic text-league-accent">GRADE: {profile.scoutGrade || 'N/A'}</span>
               <button className="text-[8px] font-black uppercase tracking-widest text-league-muted hover:text-white transition-colors">Analyze</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
