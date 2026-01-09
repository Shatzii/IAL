
import React from 'react';
import { useApp } from '../App';
import { RegistrationForm } from './RegistrationForm';
import { Franchise, FRANCHISE_COLORS } from '../types';
import { DeploymentMap } from './DeploymentMap';

export const LandingPage: React.FC = () => {
  const { setView } = useApp();

  return (
    <div className="animate-in fade-in duration-1000 bg-league-bg min-h-screen">
      {/* 1. Registry Entry - Hero Position */}
      <section className="py-12 md:py-24 bg-league-bg relative border-b border-league-border overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e41d24 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-league-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-10 md:mb-20 space-y-4 md:space-y-8 animate-in slide-in-from-top-10 duration-1000">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic uppercase text-white tracking-tighter leading-[0.85] md:leading-none">IAL PLAYER DRAFT 2026</h1>
            <div className="inline-block px-6 md:px-8 py-3 rounded-full border-2 border-league-accent bg-league-accent/10 text-league-accent text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] animate-pulse">
              Node Hub • Authorized Recruitment Portal
            </div>
          </div>
          
          <div className="bg-league-panel border-2 md:border-4 border-league-accent p-6 md:p-20 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_150px_rgba(228,29,36,0.2)] relative backdrop-blur-3xl overflow-hidden">
             <div className="absolute top-10 left-10 hidden md:block">
                <svg className="w-16 h-16 text-league-accent opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"></path></svg>
             </div>
             <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-league-accent/10 blur-[80px] rounded-full" />
             <RegistrationForm />
          </div>
        </div>
      </section>

      {/* Deployment Hub - Map Section */}
      <section className="py-24 md:py-32 bg-league-bg border-b border-league-border relative">
         <div className="container mx-auto px-4 max-w-6xl">
           <div className="flex flex-col lg:flex-row gap-16 items-center">
             <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="h-0.5 w-12 bg-league-accent" />
                  <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-league-accent italic leading-none">Tactical Geography</h2>
                </div>
                <h3 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter leading-none">5 OPERATIONAL NODES. ONE LEAGUE.</h3>
                <p className="text-league-muted font-bold italic uppercase text-sm md:text-base leading-relaxed max-w-xl opacity-70">
                  The International Arena League operates across a high-speed network of franchise nodes. Your induction preference determines your primary strategic routing.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
                   {Object.values(Franchise).map(f => (
                     <div key={f} className="bg-league-panel border border-league-border px-4 py-3 rounded-xl flex items-center gap-3 group hover:border-league-accent transition-colors">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FRANCHISE_COLORS[f] }} />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">{f}</span>
                     </div>
                   ))}
                </div>
             </div>
             <div className="lg:w-1/2 w-full">
                <DeploymentMap />
             </div>
           </div>
         </div>
      </section>

      {/* Message from COO */}
      <section className="py-24 md:py-40 bg-league-panel border-b border-league-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-league-bg border border-league-border p-8 md:p-20 rounded-[3rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <svg className="w-32 md:w-48 h-32 md:h-48" fill="white" viewBox="0 0 24 24"><path d="M14 17h7v2h-7v-2zm0-4h7v2h-7v-2zm0-4h7v2h-7V9zm-9 7V5h2v11h3l-4 4-4-4h3z"/></svg>
            </div>
            
            <div className="space-y-12 md:space-y-16 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 md:w-16 bg-league-accent" />
                <h2 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] text-league-accent italic leading-none">Command Directive</h2>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white border-b border-league-accent pb-2 inline-block">THE VISION</h3>
                    <p className="text-league-muted font-bold italic uppercase text-sm md:text-base leading-relaxed opacity-80">
                        In 2005, the energy of arena football changed my trajectory. Since then, I've seen the fragility of traditional leagues. IAL is the stable future fans deserve—a high-scoring, high-tech, and high-impact theater of competition.
                    </p>
                </div>

                <div className="space-y-8">
                    <p className="text-white font-black italic uppercase text-xl md:text-3xl leading-tight tracking-tighter">
                        "This is higher scoring, faster action, and a league designed for the fans of tomorrow."
                    </p>
                    <p className="text-league-muted font-bold italic uppercase text-sm md:text-base leading-relaxed opacity-80">
                        Our recruitment process is rigorous because our standard is excellence. If you have the data to prove you belong, the pool is waiting.
                    </p>
                </div>
              </div>

              <div className="pt-12 flex items-center gap-6 md:gap-8 border-t border-league-border">
                <div className="w-16 md:w-20 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-league-accent flex items-center justify-center font-black italic text-2xl md:text-3xl text-white shadow-2xl flex-shrink-0">
                  TM
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Tom Mitchell</div>
                  <div className="text-[9px] md:text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mt-2 italic">Chief Operating Officer • Central Command</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 md:py-40 border-t border-league-border bg-league-panel relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-16 md:space-y-20">
          <svg className="h-12 md:h-20 w-auto grayscale opacity-40 hover:grayscale-0 transition-all duration-700 cursor-pointer" viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <path d="M10 10H25V50H10V10Z" fill="white"/>
            <path d="M30 50L55 10H75L100 50H80L75 40H55L50 50H30ZM58 32H72L65 18L58 32Z" fill="white"/>
            <path d="M105 10H120V40H140V50H105V10Z" fill="white"/>
            <rect x="0" y="28" width="150" height="4" fill="#e41d24" />
          </svg>
          <div className="flex flex-wrap justify-center gap-8 md:gap-20 text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-league-muted">
            <a href="#" className="hover:text-league-accent transition-colors">Executive HQ</a>
            <a href="#" className="hover:text-league-accent transition-colors">Tactical Nodes</a>
            <a href="#" className="hover:text-league-accent transition-colors">Privacy Ops</a>
            <a href="#" className="hover:text-league-accent transition-colors">Dossier Terms</a>
          </div>
          <p className="text-[9px] font-black text-league-muted/20 uppercase tracking-[0.6em] italic">
            © 2026 International Arena League Central Command • Node Connection v2.6.5-PROD
          </p>
        </div>
      </footer>
    </div>
  );
};
