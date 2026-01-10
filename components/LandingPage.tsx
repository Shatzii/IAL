import React from 'react';
import { useApp } from '../App';
import { RegistrationForm } from './RegistrationForm';
import { Franchise, FRANCHISE_COLORS } from '../types';
import { DeploymentMap } from './DeploymentMap';

export const LandingPage: React.FC = () => {
  const { setView } = useApp();

  return (
    <div className="animate-in fade-in duration-1000 bg-league-bg min-h-screen">
      {/* 0. Branding Header & Cinematic Entry */}
      <section className="bg-black pt-12 pb-8 md:pb-20 border-b border-league-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
           <div className="w-full h-full bg-[radial-gradient(#e41d24_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Full Logo Display */}
          <div className="flex flex-col items-center mb-12 md:mb-20 animate-float">
             <svg className="w-64 md:w-96 h-auto" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Red Helmet */}
                <path d="M10 40C10 25 22 15 35 15C48 15 60 25 60 40V55H10V40Z" fill="#e41d24"/>
                <path d="M25 15V35M35 15V35M45 15V35" stroke="white" strokeWidth="3"/>
                <rect x="15" y="45" width="40" height="8" rx="2" fill="#1a1a1a" stroke="white" strokeWidth="1"/>
                {/* IAL Stylized */}
                <text x="70" y="60" fill="white" fontSize="56" fontWeight="900" fontStyle="italic" fontFamily="Inter, sans-serif">IAL</text>
                <rect x="70" y="34" width="70" height="5" fill="#e41d24" />
                <text x="70" y="78" fill="white" fontSize="9" fontWeight="900" letterSpacing="3" fontFamily="Inter, sans-serif">INTERNATIONAL ARENA LEAGUE</text>
             </svg>
             
             {/* Flags Bar (Replicated from provided image) */}
             <div className="flex gap-4 mt-8 opacity-60">
                {['🇺🇸', '🇨🇦', '🇩🇪', '🇨🇭', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'].map((flag, i) => (
                  <span key={i} className="text-2xl grayscale hover:grayscale-0 transition-all cursor-default">{flag}</span>
                ))}
             </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-video rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border-2 border-league-accent/50 shadow-[0_0_80px_rgba(228,29,36,0.4)] bg-league-panel group">
              <iframe 
                className="absolute inset-0 w-full h-full scale-[1.01]"
                src="https://www.youtube.com/embed/tkcuP16oo54?si=4j03-GxCAg-HVIh5&autoplay=1&mute=1&loop=1&playlist=tkcuP16oo54&controls=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3" 
                title="IAL League Cinematic" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-[16px] border-black/20 rounded-[2.5rem] md:rounded-[4rem]"></div>
            </div>
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-6">
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-league-accent rounded-full animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white italic">Live Cinematic Stream // Operational Telemetry</span>
               </div>
               <div className="flex gap-6 text-[10px] font-bold text-league-muted uppercase tracking-widest">
                  <span>Resolving: 4K Ultra-Low Latency</span>
                  <span className="text-league-ok">Status: Stable</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Registry Entry - Hero Position */}
      <section className="py-20 md:py-32 bg-league-bg relative border-b border-league-border overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e41d24 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-league-accent/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-12 md:mb-24 space-y-6 md:space-y-10 animate-in slide-in-from-top-10 duration-1000">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black italic uppercase text-white tracking-tighter leading-[0.8] md:leading-none">PLAYER DRAFT 2026</h1>
            <div className="inline-block px-10 py-4 rounded-full border-2 border-league-accent bg-league-accent/20 text-league-accent text-[12px] md:text-[14px] font-black uppercase tracking-[0.8em] animate-pulse">
              Node Hub • Secure Induction
            </div>
          </div>
          
          <div className="bg-league-panel border-4 border-league-accent p-8 md:p-24 rounded-[4rem] md:rounded-[6rem] shadow-[0_0_200px_rgba(228,29,36,0.25)] relative backdrop-blur-3xl overflow-hidden">
             <div className="absolute top-12 left-12 opacity-10">
                <svg className="w-20 h-20 text-league-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"></path></svg>
             </div>
             <RegistrationForm />
          </div>
        </div>
      </section>

      {/* Deployment Hub - Map Section */}
      <section className="py-24 md:py-40 bg-league-bg border-b border-league-border relative">
         <div className="container mx-auto px-4 max-w-6xl">
           <div className="flex flex-col lg:flex-row gap-20 items-center">
             <div className="lg:w-1/2 space-y-10 text-center lg:text-left">
                <div className="flex items-center gap-6 justify-center lg:justify-start">
                  <div className="h-1 w-16 bg-league-accent" />
                  <h2 className="text-[14px] font-black uppercase tracking-[0.8em] text-league-accent italic leading-none">Global Nodes</h2>
                </div>
                <h3 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">HIGH-SPEED TACTICAL DEPLOYMENT</h3>
                <p className="text-league-muted font-bold italic uppercase text-base md:text-lg leading-relaxed max-w-xl opacity-80">
                  IAL operates on a decentralized franchise architecture. Your registry entry routes you through the primary node of your choice.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8">
                   {Object.values(Franchise).map(f => (
                     <div key={f} className="bg-league-panel border-2 border-league-border p-5 rounded-2xl flex items-center gap-4 group hover:border-league-accent transition-all cursor-default shadow-xl">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: FRANCHISE_COLORS[f], color: FRANCHISE_COLORS[f] }} />
                        <span className="text-[12px] font-black uppercase text-white tracking-widest">{f}</span>
                     </div>
                   ))}
                </div>
             </div>
             <div className="lg:w-1/2 w-full scale-110">
                <DeploymentMap />
             </div>
           </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 md:py-48 border-t-4 border-league-accent bg-league-panel relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-20 md:space-y-32">
          <div className="flex flex-col items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
            <svg className="h-16 md:h-24 w-auto cursor-pointer" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <path d="M10 40C10 25 22 15 35 15C48 15 60 25 60 40V55H10V40Z" fill="#e41d24"/>
                <text x="70" y="60" fill="white" fontSize="56" fontWeight="900" fontStyle="italic" fontFamily="Inter, sans-serif">IAL</text>
                <rect x="70" y="34" width="70" height="5" fill="#e41d24" />
            </svg>
            <div className="flex gap-4">
              {['🇺🇸', '🇨🇦', '🇩🇪', '🇨🇭', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'].map((flag, i) => <span key={i} className="text-xl">{flag}</span>)}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-10 md:gap-24 text-[12px] md:text-[14px] font-black uppercase tracking-[0.6em] text-league-muted">
            <a href="#" className="hover:text-league-accent transition-colors">Command HQ</a>
            <a href="#" className="hover:text-league-accent transition-colors">Tactical Grid</a>
            <a href="#" className="hover:text-league-accent transition-colors">Privacy Node</a>
            <a href="#" className="hover:text-league-accent transition-colors">Legal Protocol</a>
          </div>
          <p className="text-[10px] font-black text-league-muted/30 uppercase tracking-[0.8em] italic">
            © 2026 International Arena League Central Command • Node Authorization v2.7.0-STABLE
          </p>
        </div>
      </footer>
    </div>
  );
};