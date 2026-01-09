
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
      ]
    },
    {
      title: "Talent Hub",
      items: [
        { view: 'profiles', label: 'Personnel Pool' },
        { view: 'elf-registry', label: 'ELF Pro Registry' },
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
        { view: 'comms', label: 'Secure Inbox' },
        { view: 'roster-builder', label: 'Ironman Depth Chart', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM, SystemRole.COACH_STAFF] },
      ]
    },
    {
      title: "Administration",
      items: [
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
              <svg className="h-6 md:h-8 w-auto group-hover:scale-105 transition-transform" viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10H25V50H10V10Z" fill="white"/>
                <path d="M30 50L55 10H75L100 50H80L75 40H55L50 50H30ZM58 32H72L65 18L58 32Z" fill="white"/>
                <path d="M105 10H120V40H140V50H105V10Z" fill="white"/>
                <rect x="0" y="28" width="150" height="4" fill="#e41d24" />
              </svg>
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
            <DraftClock />
            
            <div className="flex items-center gap-3 md:gap-6">
              {!isLoggedIn ? (
                <button 
                  onClick={() => setView('login')}
                  className="bg-league-accent text-white px-4 md:px-8 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] hover:brightness-125 transition-all shadow-[0_0_20px_#e41d2444]"
                >
                  Access
                </button>
              ) : (
                <div className="flex items-center gap-2 md:gap-4 pl-3 md:pl-4 border-l border-league-border">
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] md:text-[8px] font-black text-league-accent uppercase tracking-widest">{currentSystemRole.split(' ')[0]}</span>
                    <button onClick={logout} className="hidden md:block text-[10px] font-bold text-league-muted hover:text-white uppercase transition-colors">Logout</button>
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
