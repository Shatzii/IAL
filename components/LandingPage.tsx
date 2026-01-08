
import React from 'react';
import { useApp } from '../App';
import { RegistrationForm } from './RegistrationForm';
import { Franchise, FRANCHISE_COLORS } from '../types';

export const LandingPage: React.FC = () => {
  const { setView } = useApp();

  return (
    <div className="animate-in fade-in duration-1000 bg-league-bg min-h-screen">
      {/* 1. Registry Entry - Hero Position */}
      <section className="py-20 bg-league-bg relative border-b border-league-border">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e41d24 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-7xl font-black italic uppercase text-white tracking-tighter leading-none">IAL PLAYER DRAFT 2026</h1>
            <div className="inline-block px-6 py-2 rounded-full border-2 border-league-accent bg-league-accent/10 text-league-accent text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">
              Node ID 2.5.0-STABLE • Active Recruitment Window
            </div>
          </div>
          
          <div className="bg-league-panel border-4 border-league-accent p-10 md:p-20 rounded-[5rem] shadow-[0_0_120px_rgba(228,29,36,0.2)] relative">
             <div className="absolute top-10 left-10 hidden md:block">
                <svg className="w-12 h-12 text-league-accent opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"></path></svg>
             </div>
             <RegistrationForm />
          </div>
        </div>
      </section>

      {/* 2. Message from COO - Authenticated Section */}
      <section className="py-32 bg-league-panel border-b border-league-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-league-bg border border-league-border p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg className="w-32 h-32" fill="white" viewBox="0 0 24 24"><path d="M14 17h7v2h-7v-2zm0-4h7v2h-7v-2zm0-4h7v2h-7V9zm-9 7V5h2v11h3l-4 4-4-4h3z"/></svg>
            </div>
            
            <div className="space-y-12 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 bg-league-accent" />
                <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-league-accent italic leading-none">About IAL FootBall</h2>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-widest text-white border-b border-league-accent pb-2 inline-block">IN THE BEGINNING…</h3>
                    <p className="text-league-muted font-bold italic uppercase text-sm leading-relaxed">
                        In 2005, I attended my first AFL game. I had a great time. I couldn’t believe what I was watching and the energy in the arena. A couple of years later I ended up in the front office with that team and in 2008 I assisted in one of the biggest business turnarounds in AFL history with a legendary franchise in Arizona. I spent the next few years traveling, working with various teams and leagues of Indoor/Arena Football bringing them a model for business success.
                    </p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-widest text-white border-b border-league-accent pb-2 inline-block">2012 EXPANSION TEAM</h3>
                    <p className="text-league-muted font-bold italic uppercase text-sm leading-relaxed">
                        In 2012, I established an expansion team that quickly became a top team in all indoor football. In all this time I became an avid fan of the sport, but in disbelief in the way the front offices handled the business aspect which would lead to eventual teams and leagues folding.
                    </p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-widest text-white border-b border-league-accent pb-2 inline-block">WE’RE FOCUSED ON THE FANS</h3>
                    <p className="text-white font-black italic uppercase text-lg leading-tight tracking-tighter">
                        "The fans are the ones that always end up losing the most. For this reason, I began to formulate a plan to stabilize a league that fans can enjoy and count on for generations."
                    </p>
                    <p className="text-league-muted font-bold italic uppercase text-sm leading-relaxed">
                        This is what IAL Football is about. Traditional arena style football with a few modifications to make it higher scoring and faster action.
                    </p>
                </div>
              </div>

              <div className="pt-10 flex items-center gap-6 border-t border-league-border">
                <div className="w-16 h-16 rounded-2xl bg-league-accent flex items-center justify-center font-black italic text-2xl text-white shadow-lg">
                  TM
                </div>
                <div>
                  <div className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Tom Mitchell</div>
                  <div className="text-[9px] font-black uppercase text-league-accent tracking-[0.4em] mt-1">Chief Operating Officer • IAL Command</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Franchises Grid */}
      <section className="py-32 overflow-hidden bg-league-bg">
         <div className="container mx-auto px-4 mb-20 text-center space-y-4">
            <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">OPERATIONAL NODES</h2>
            <div className="text-[11px] font-black uppercase text-league-accent tracking-[0.5em] italic">Authorized Franchise Deployment Zones</div>
         </div>
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {Object.values(Franchise).map(f => (
              <div key={f} className="group relative bg-league-panel border border-league-border p-10 rounded-[2.5rem] hover:border-league-accent transition-all cursor-default overflow-hidden shadow-2xl">
                <div 
                  className="absolute top-0 right-0 w-40 h-40 opacity-5 transition-opacity translate-x-12 -translate-y-12 rounded-full blur-2xl" 
                  style={{ backgroundColor: FRANCHISE_COLORS[f] }}
                />
                <h4 className="text-2xl font-black italic uppercase text-white mb-4 z-10 relative leading-none tracking-tighter">{f}</h4>
                <div className="h-1 w-12 transition-all group-hover:w-full" style={{ backgroundColor: FRANCHISE_COLORS[f] }} />
              </div>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-league-border bg-league-panel relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-16">
          <svg className="h-16 w-auto grayscale opacity-40" viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10H25V50H10V10Z" fill="white"/>
            <path d="M30 50L55 10H75L100 50H80L75 40H55L50 50H30ZM58 32H72L65 18L58 32Z" fill="white"/>
            <path d="M105 10H120V40H140V50H105V10Z" fill="white"/>
            <rect x="0" y="28" width="150" height="4" fill="#e41d24" />
          </svg>
          <div className="flex flex-wrap justify-center gap-16 text-[11px] font-black uppercase tracking-[0.5em] text-league-muted">
            <a href="#" className="hover:text-league-accent transition-colors">Executive HQ</a>
            <a href="#" className="hover:text-league-accent transition-colors">Privacy Node</a>
            <a href="#" className="hover:text-league-accent transition-colors">Terms of Play</a>
          </div>
          <p className="text-[10px] font-black text-league-muted/30 uppercase tracking-[0.5em] italic">
            © 2024 International Arena League Central Command
          </p>
        </div>
      </footer>
    </div>
  );
};
