
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { SystemRole, Franchise } from '../types';

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
          <span key={i} className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-league-muted mx-8">
            <span className="w-1.5 h-1.5 bg-league-accent rounded-full mr-2 shadow-[0_0_5px_#e41d24]" />
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
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { currentSystemRole, setCurrentSystemRole, profiles, currentUserProfileId, setCurrentUserProfileId, isLoggedIn, logout } = useApp();
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
      ]
    },
    {
      title: "Talent Hub",
      items: [
        { view: 'profiles', label: 'Personnel Pool' },
        { view: 'compare', label: 'Scouting Lab', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
        { view: 'pipeline', label: 'Recruitment Funnel', roles: [SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM] },
      ]
    },
    {
      title: "Tactics",
      items: [
        { view: 'academy', label: 'Tactical Academy' },
        { view: 'comms', label: 'Secure Inbox' },
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
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 cursor-pointer group" onClick={() => setView('landing')}>
              <svg className="h-8 w-auto group-hover:scale-105 transition-transform" viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    isMenuOpen 
                      ? 'bg-league-accent border-league-accent text-white' 
                      : 'bg-league-panel border-league-border text-white hover:border-league-accent'
                  }`}
                >
                  Menu
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full left-0 mt-3 w-[260px] md:w-[500px] bg-league-panel/95 backdrop-blur-2xl border border-league-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 z-[100]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-4">
                      {menuSections.map((section, idx) => {
                        const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(currentSystemRole));
                        if (visibleItems.length === 0) return null;
                        return (
                          <div key={idx} className="p-2 space-y-2">
                            <h4 className="text-[8px] font-black uppercase text-league-accent tracking-[0.4em] mb-2 opacity-50">{section.title}</h4>
                            <div className="space-y-1">
                              {visibleItems.map(item => (
                                <button
                                  key={item.view}
                                  onClick={() => { setView(item.view); setIsMenuOpen(false); }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
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

          <div className="flex items-center gap-6">
            {!isLoggedIn ? (
              <button 
                onClick={() => setView('login')}
                className="bg-league-accent text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-125 transition-all shadow-[0_0_20px_#e41d2444]"
              >
                Secure Access
              </button>
            ) : (
              <div className="flex items-center gap-4 pl-4 border-l border-league-border">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-league-accent uppercase tracking-widest">{currentSystemRole} Node</span>
                  <button onClick={logout} className="text-[10px] font-bold text-league-muted hover:text-white uppercase transition-colors">Terminate Session</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
