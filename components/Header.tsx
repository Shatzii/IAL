
import React from 'react';
import { useApp } from '../App';
import { SystemRole } from '../types';

interface HeaderProps {
  currentView: 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms';
  setView: (view: 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms') => void;
}

const Ticker = () => {
  const { activityLogs } = useApp();
  const tickerItems = activityLogs.length > 0 ? activityLogs : [{ message: "OFFICIAL: European League Registration Now Open" }];

  return (
    <div className="bg-league-panel border-b border-league-border py-1 overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee">
        {[...tickerItems, ...tickerItems].map((log, i) => (
          <span key={i} className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-league-muted mx-8">
            <span className="w-1.5 h-1.5 bg-league-accent rounded-full mr-2 shadow-[0_0_5px_#e41d24]" />
            {log.message}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { currentSystemRole, setCurrentSystemRole } = useApp();

  const NavItem = ({ view, label, roles }: { view: typeof currentView, label: string, roles?: SystemRole[] }) => {
    if (roles && !roles.includes(currentSystemRole)) return null;

    return (
      <button
        onClick={() => setView(view)}
        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
          currentView === view 
            ? 'bg-league-accent text-white shadow-[0_0_15px_rgba(228,29,36,0.3)]' 
            : 'text-league-muted hover:text-white border border-transparent hover:border-league-border'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="sticky top-0 z-50">
      <Ticker />
      <header className="bg-league-bg/80 backdrop-blur-md border-b-2 border-league-accent shadow-lg">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 min-w-max mr-8">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => setView('profiles')}>
              <svg className="h-10 w-auto" viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10H25V50H10V10Z" fill="white"/>
                <path d="M30 50L55 10H75L100 50H80L75 40H55L50 50H30ZM58 32H72L65 18L58 32Z" fill="white"/>
                <path d="M105 10H120V40H140V50H105V10Z" fill="white"/>
                <rect x="0" y="28" width="150" height="4" fill="#e41d24" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="hidden md:block text-sm font-black uppercase tracking-[0.2em] text-league-accent -mb-1 leading-none">
                European League
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-league-muted font-bold">Recruiting OS</span>
                <select 
                  className="bg-transparent text-[8px] font-black uppercase tracking-widest text-league-accent border border-league-accent/30 rounded px-1 outline-none cursor-pointer"
                  value={currentSystemRole}
                  onChange={(e) => {
                    setCurrentSystemRole(e.target.value as SystemRole);
                    setView('profiles');
                  }}
                >
                  {Object.values(SystemRole).map(role => <option key={role} value={role} className="bg-black">{role}</option>)}
                </select>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2">
            <NavItem view="register" label="Apply" />
            <NavItem view="profiles" label="Pool" />
            <NavItem view="compare" label="Compare" roles={[SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM]} />
            <NavItem view="pipeline" label="Pipeline" roles={[SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM]} />
            <NavItem view="comms" label="Comms" />
            <NavItem view="schedule" label="Schedule" />
            <NavItem view="draft" label="Draft" roles={[SystemRole.LEAGUE_ADMIN]} />
            <NavItem view="franchise-admin" label="Franchise" roles={[SystemRole.LEAGUE_ADMIN, SystemRole.FRANCHISE_GM, SystemRole.COACH_STAFF]} />
            <NavItem view="admin" label="Admin" roles={[SystemRole.LEAGUE_ADMIN]} />
          </nav>
        </div>
      </header>
    </div>
  );
};
