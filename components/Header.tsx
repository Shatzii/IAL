
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { SystemRole, Franchise } from '../types';
import { DraftClock } from './DraftClock';

interface HeaderProps {
  currentView: any;
  setView: (view: any) => void;
}

const Ticker = () => {
  const { activityLogs } = useApp();
  const tickerItems = activityLogs.length > 0 ? activityLogs : [{ message: "OFFICIAL: European League Registration Now Open" }];

  return (
    <div className="bg-league-panel border-b border-league-border py-1 overflow-hidden whitespace-nowrap z-[60] relative">
      <div className="flex animate-marquee">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((log, i) => (
          <span key={i} className="inline-flex items-center text-[8px] md:text-[9px] font-black uppercase tracking-widest text-league-muted mx-4 md:mx-8">
            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-league-accent rounded-full mr-2 shadow-[0_0_5px_#e41d24]" />
            {log.message}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

const IALLogoSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/>
    <path d="M35 15V45M55 15V45" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <rect x="18" y="52" width="50" height="6" rx="1" fill="#111" stroke="white" strokeWidth="1"/>
    <text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic" fontFamily="Inter, sans-serif">IAL</text>
    <rect x="85" y="32" width="70" height="5" fill="#e41d24" />
    <text x="85" y="74" fill="white" fontSize="8" fontWeight="900" letterSpacing="3" fontFamily="Inter, sans-serif" opacity="0.8">INTERNATIONAL ARENA LEAGUE</text>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { currentSystemRole, isLoggedIn, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuSections = [
    {
      title: "Navigation",
      items: [
        { view: 'landing', label: 'League Home' },
        { view: 'register', label: 'Draft Induction', roles: [SystemRole.PLAYER, SystemRole.LEAGUE_ADMIN] },
        { view: 'schedule', label: 'Operations Timeline' },
        { view: 'athlete-portal', label: 'Athlete Portal', roles: [SystemRole.PLAYER, SystemRole.LEAGUE_ADMIN] },
        { view: 'coach-dashboard', label: 'Coach Dashboard', roles: [SystemRole.COACH_STAFF, SystemRole.LEAGUE_ADMIN] },
      ]
    },
    {
      title: "Talent Hub",
      items: [
        { view: 'profiles', label: 'Personnel Pool' },
        { view: 'compare', label: 'Scouting Lab', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'pipeline', label: 'Recruitment Funnel', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'war-room', label: 'War Room Feed', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'draft', label: 'Draft Operations', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
      ]
    },
    {
      title: "Tactics",
      items: [
        { view: 'academy', label: 'Tactical Academy' },
        { view: 'film-room', label: 'Team Film Room', roles: [SystemRole.COACH_STAFF, SystemRole.PLAYER, SystemRole.LEAGUE_ADMIN] },
        { view: 'comms', label: 'Secure Inbox' },
        { view: 'roster-builder', label: 'Ironman Depth Chart', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM, SystemRole.COACH_STAFF] },
      ]
    },
    {
      title: "Administration",
      items: [
        { view: 'contract-structure', label: 'Contract Structures', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'franchise-admin', label: 'Franchise Desk', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'admin', label: 'Central Command', roles: [SystemRole.LEAGUE_ADMIN] },
      ]
    }
  ];

  return (
    <div className="sticky top-0 z-50" ref={menuRef}>
      <Ticker />
      <header className="bg-league-bg/90 backdrop-blur-xl border-b-2 border-league-accent shadow-2xl">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex-shrink-0 cursor-pointer group" onClick={() => setView('landing')}>
              <IALLogoSVG className="h-10 md:h-14 w-auto" />
            </div>

            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    isMenuOpen 
                      ? 'bg-league-accent border-league-accent text-white' 
                      : 'bg-league-panel border-league-border text-white hover:border-league-accent'
                  }`}
                >
                  Menu
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full left-0 mt-3 w-[85vw] md:w-[500px] bg-league-panel/95 backdrop-blur-2xl border border-league-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 z-[100]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {menuSections.map((section, idx) => {
                        const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(currentSystemRole));
                        if (visibleItems.length === 0) return null;
                        return (
                          <div key={idx} className="p-2 space-y-2">
                            <h4 className="text-[8px] font-black uppercase text-league-accent tracking-[0.4em] mb-2 opacity-50 border-b border-league-border pb-1">{section.title}</h4>
                            <div className="grid grid-cols-1 gap-1">
                              {visibleItems.map(item => (
                                <button
                                  key={item.view}
                                  onClick={() => { setView(item.view); setIsMenuOpen(false); }}
                                  className={`w-full text-left px-3 py-2.5 md:py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    currentView === item.view ? 'bg-white/10 text-white' : 'text-league-muted hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-8">
            <div className="hidden lg:block">
               <div className="flex flex-col items-end mr-6 opacity-30 hover:opacity-100 transition-opacity">
                  <div className="text-[7px] font-black uppercase text-league-muted tracking-[0.2em] mb-1 italic">Network Health</div>
                  <div className="flex gap-1">
                     <div className="w-1.5 h-1.5 bg-league-ok rounded-full shadow-[0_0_5px_#23d18b]" />
                     <div className="w-1.5 h-1.5 bg-league-ok rounded-full shadow-[0_0_5px_#23d18b]" />
                     <div className="w-1.5 h-1.5 bg-league-accent rounded-full animate-pulse" />
                  </div>
               </div>
            </div>
            
            <div className="hidden lg:block">
              <DraftClock />
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {!isLoggedIn ? (
                <>
                  <button 
                    onClick={() => setView('register')}
                    className="hidden sm:block bg-white text-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] hover:bg-league-accent hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  >
                    APPLY FOR DRAFT
                  </button>
                  <button 
                    onClick={() => setView('login')}
                    className="bg-league-accent text-white px-4 md:px-8 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] hover:brightness-125 transition-all shadow-[0_0_20px_#e41d2444]"
                  >
                    LOGIN
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 md:gap-4 pl-3 md:pl-4 border-l border-league-border">
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] md:text-[8px] font-black text-league-accent uppercase tracking-widest">{currentSystemRole.split(' ')[0]}</span>
                    <button onClick={logout} className="text-[10px] font-bold text-league-muted hover:text-white uppercase transition-colors">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
