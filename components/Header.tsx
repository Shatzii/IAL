
import React, { useState, useRef, useEffect, memo } from 'react';
import { useApp } from '../App';
import { SystemRole } from '../types';
import { DraftClock } from './DraftClock';

// Memoize the ticker to prevent re-renders when the rest of the header updates
const Ticker = memo(() => {
  const { activityLogs } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const tickerItems = activityLogs.length > 0 ? activityLogs : [{ message: "OFFICIAL: European League Registration Now Open" }];

  if (!isVisible) return null;

  return (
    <div className="bg-league-panel border-b border-league-border py-1 overflow-hidden whitespace-nowrap z-[60] relative group">
      <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((log, i) => (
          <span key={i} className="inline-flex items-center text-[8px] md:text-[9px] font-black uppercase tracking-widest text-league-muted mx-4 md:mx-8">
            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-league-accent rounded-full mr-2 shadow-[0_0_5px_#e41d24]" />
            {log.message}
          </span>
        ))}
      </div>
      <button onClick={() => setIsVisible(false)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-league-accent bg-black px-1.5 rounded border border-league-accent">HIDE</button>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
});

const IALLogoSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/>
    <path d="M35 15V45M55 15V45" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <rect x="18" y="52" width="50" height="6" rx="1" fill="#111" stroke="white" strokeWidth="1"/>
    <text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic" fontFamily="Inter, sans-serif">IAL</text>
    <rect x="85" y="32" width="70" height="5" fill="#e41d24" />
  </svg>
);

export const Header: React.FC<{ currentView: any, setView: (v: any) => void }> = ({ currentView, setView }) => {
  const { currentSystemRole, isLoggedIn, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuSections = [
    {
      title: "Core",
      items: [
        { view: 'landing', label: 'Home' },
        { view: 'profiles', label: 'Personnel' },
        { view: 'schedule', label: 'Timeline' },
        { view: 'athlete-portal', label: 'Portal', roles: [SystemRole.PLAYER, SystemRole.LEAGUE_ADMIN] },
        { view: 'coach-dashboard', label: 'Coach', roles: [SystemRole.COACH_STAFF, SystemRole.LEAGUE_ADMIN] },
      ]
    },
    {
      title: "Strategy",
      items: [
        { view: 'ai-assistant', label: 'Neural AI' },
        { view: 'compare', label: 'Lab', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'pipeline', label: 'Pipeline', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'draft', label: 'Draft', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'film-room', label: 'Film Room' },
      ]
    },
    {
      title: "Admin",
      items: [
        { view: 'franchise-admin', label: 'Franchise Desk', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'admin', label: 'Command', roles: [SystemRole.LEAGUE_ADMIN] },
        { view: 'security-hub', label: 'Security', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
      ]
    }
  ];

  return (
    <div className="sticky top-0 z-50">
      <Ticker />
      <header className="bg-league-bg/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 cursor-pointer group" onClick={() => setView('landing')}>
              <IALLogoSVG className="h-8 md:h-12 w-auto" />
            </div>

            {isLoggedIn && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isMenuOpen ? 'bg-league-accent text-white' : 'text-league-muted hover:text-white'
                  }`}
                >
                  SYSTEM MENU
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-league-panel border border-league-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-4">
                      {menuSections.map((section, idx) => {
                        const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(currentSystemRole));
                        if (visibleItems.length === 0) return null;
                        return (
                          <div key={idx}>
                            <h4 className="text-[7px] font-black uppercase text-league-accent tracking-[0.4em] mb-2 px-3 opacity-50">{section.title}</h4>
                            {visibleItems.map(item => (
                              <button
                                key={item.view}
                                onClick={() => { setView(item.view as any); setIsMenuOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                  currentView === item.view ? 'bg-white/10 text-white' : 'text-league-muted hover:text-white hover:bg-white/5'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <DraftClock />
            {!isLoggedIn ? (
              <button onClick={() => setView('login')} className="bg-league-accent text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110">LOGIN</button>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-league-accent uppercase tracking-widest">{currentSystemRole}</span>
                <button onClick={logout} className="text-[10px] font-bold text-league-muted hover:text-white uppercase transition-colors">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
