
import React, { useState } from 'react';
import { useApp } from '../App';
import { RegistrationForm } from './RegistrationForm';
import { Franchise, FRANCHISE_COLORS } from '../types';
import { DeploymentMap } from './DeploymentMap';
import { AIChatWidget } from './AIChatWidget';

const IALHeroLogo = () => (
  <svg className="w-64 md:w-[600px] h-auto" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 60C15 35 35 20 65 20C95 20 115 35 115 60V85H15V60Z" fill="#e41d24"/>
    <path d="M50 20V60M80 20V60" stroke="white" strokeWidth="6" strokeLinecap="round"/>
    <rect x="30" y="72" width="70" height="8" rx="2" fill="#111" stroke="white" strokeWidth="2"/>
    <text x="125" y="80" fill="white" fontSize="85" fontWeight="900" fontStyle="italic" fontFamily="Inter, sans-serif">IAL</text>
    <rect x="125" y="42" width="130" height="8" fill="#e41d24" />
    <text x="125" y="105" fill="white" fontSize="13" fontWeight="900" letterSpacing="5" fontFamily="Inter, sans-serif">INTERNATIONAL ARENA LEAGUE</text>
  </svg>
);

const FRANCHISE_META: Record<Franchise, { country: string, flag: string }> = {
  [Franchise.NOTTINGHAM]: { country: 'United Kingdom', flag: '🇬🇧' },
  [Franchise.GLASGOW]: { country: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  [Franchise.DUSSELDORF]: { country: 'Germany', flag: '🇩🇪' },
  [Franchise.STUTTGART]: { country: 'Germany', flag: '🇩🇪' },
  [Franchise.ZURICH]: { country: 'Switzerland', flag: '🇨🇭' },
};

export const LandingPage: React.FC = () => {
  const { setView, globalNetworkTotal } = useApp();
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);

  const VIDEO_ID = "tkcuP16oo54"; 

  return (
    <div className="animate-in fade-in duration-1000 bg-league-bg min-h-screen relative">
      <AIChatWidget isOpen={isAiWidgetOpen} setIsOpen={setIsAiWidgetOpen} />

      {/* Hero Section */}
      <section className="bg-black pt-12 pb-8 md:pb-20 border-b border-league-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
           <div className="w-full h-full bg-[radial-gradient(#e41d24_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-12 md:mb-20 animate-float">
             <IALHeroLogo />
             <div className="flex gap-4 mt-8 opacity-60">
                {['🇺🇸', '🇨🇦', '🇩🇪', '🇨🇭', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'].map((flag, i) => (
                  <span key={i} className="text-2xl grayscale hover:grayscale-0 transition-all cursor-default">{flag}</span>
                ))}
             </div>
             <p className="mt-6 text-[12px] md:text-[14px] font-black uppercase tracking-[0.6em] text-white italic text-center max-w-lg">
               ELITE ARENA FOOTBALL. GLOBAL TALENT. NO IMPORT RULES.
             </p>
             
             {/* Global Network Counter */}
             <div className="mt-10 flex flex-col items-center">
                <div className="bg-league-panel border border-league-accent/30 px-6 py-3 rounded-full flex items-center gap-4 shadow-[0_0_20px_rgba(228,29,36,0.2)]">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-league-ok animate-pulse shadow-[0_0_8px_#23d18b]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Live Registry</span>
                   </div>
                   <div className="h-4 w-[1px] bg-white/10" />
                   <div className="text-xl font-black italic text-league-accent tracking-tighter">
                      {globalNetworkTotal} <span className="text-[9px] font-black uppercase text-league-muted tracking-widest ml-1">Elite Athletes Registered</span>
                   </div>
                </div>
                <p className="text-[8px] font-bold text-league-muted uppercase tracking-[0.4em] mt-3 opacity-40">Across Zurich, Dusseldorf, Nottingham, Stuttgart, Glasgow Nodes</p>
             </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-video rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border-2 border-league-accent/50 shadow-[0_0_80px_rgba(228,29,36,0.4)] bg-league-panel group">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&rel=0&modestbranding=1&playsinline=1`}
                title="IAL European Division" 
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowFullScreen
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-[16px] border-black/20 rounded-[2.5rem] md:rounded-[4rem]"></div>
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row justify-center gap-6">
               <button onClick={() => document.getElementById('draft-form')?.scrollIntoView({ behavior: 'smooth' })} className="bg-league-accent text-white px-12 py-5 rounded-2xl font-black italic uppercase tracking-widest text-lg shadow-[0_0_40px_rgba(228,29,36,0.4)] hover:scale-105 transition-transform">Apply for the Draft</button>
               <button onClick={() => setIsAiWidgetOpen(true)} className="bg-league-panel border-2 border-league-border text-white px-12 py-5 rounded-2xl font-black italic uppercase tracking-widest text-lg hover:border-league-accent transition-all">Command Assistant</button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust + Badge Strip */}
      <section className="bg-league-panel border-b border-league-border py-8">
         <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
            <div className="flex justify-between min-w-[1000px] gap-8">
               <BadgeBlock title="PROFESSIONAL ARENA FOOTBALL" />
               <BadgeBlock title="ALL COUNTRIES WELCOME" />
               <BadgeBlock title="NO IMPORT LIMITS" />
               <BadgeBlock title="PAID TO PLAY OPPORTUNITIES" />
               <BadgeBlock title="FAST RESPONSE TIMES" />
            </div>
         </div>
      </section>

      {/* Global Games Section - Carousel Implementation */}
      <section className="py-12 md:py-16 bg-league-bg border-b border-league-border relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-league-accent/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
         
         <div className="container mx-auto px-4 max-w-6xl relative z-10">
           <div className="flex flex-col lg:flex-row gap-12 items-center">
             <div className="lg:w-2/5 space-y-6 text-center lg:text-left">
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="h-0.5 w-10 bg-league-accent" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-league-accent italic leading-none">Global Games</h2>
                </div>
                <h3 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter leading-none">GLOBAL ROSTERS. NO LIMITS.</h3>
                <p className="text-league-muted font-bold italic uppercase text-xs md:text-sm leading-relaxed max-w-sm opacity-80">
                  Zero import restrictions. If you can play at the elite level, you have a home in the IAL European Division.
                </p>
                <div className="hidden lg:block pt-8">
                   <DeploymentMap />
                </div>
             </div>

             <div className="lg:w-3/5 w-full">
                <div className="flex overflow-x-auto gap-4 pb-8 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
                   {Object.values(Franchise).map(f => (
                     <div key={f} className="snap-center flex-shrink-0 w-[240px] md:w-[280px] bg-league-panel border border-league-border p-6 rounded-[2rem] group hover:border-league-accent transition-all shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -translate-y-16 translate-x-16 rounded-full blur-2xl group-hover:bg-league-accent/10 transition-colors" />
                        <div className="flex justify-between items-start mb-8 relative z-10">
                           <span className="text-4xl">{FRANCHISE_META[f].flag}</span>
                           <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] mt-2" style={{ backgroundColor: FRANCHISE_COLORS[f], color: FRANCHISE_COLORS[f] }} />
                        </div>
                        <div className="space-y-1 relative z-10">
                           <h4 className="text-lg md:text-xl font-black italic uppercase text-white leading-none tracking-tighter group-hover:text-league-accent transition-colors">{f}</h4>
                           <p className="text-[10px] font-bold text-league-muted uppercase tracking-widest">{FRANCHISE_META[f].country}</p>
                        </div>
                        <div className="mt-10 pt-6 border-t border-white/5 relative z-10">
                           <div className="flex items-center gap-2">
                              <span className="text-[14px] font-black italic text-white">25</span>
                              <span className="text-[8px] font-black uppercase text-league-muted tracking-[0.2em]">Elite Roster Slots</span>
                           </div>
                           <p className="text-[7px] font-bold text-league-muted uppercase mt-1 opacity-40">Operational Node Synchronized</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-center lg:justify-start gap-2 mt-2 opacity-30">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className="w-8 h-1 bg-white/20 rounded-full" />
                   ))}
                </div>
             </div>
           </div>
         </div>
      </section>

      {/* Paid To Play Section */}
      <section className="py-20 bg-black border-b border-league-border relative">
         <div className="container mx-auto px-4 text-center max-w-4xl space-y-10">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter">PAID TO PLAY</h2>
            <div className="bg-league-panel border-l-4 border-league-accent p-8 rounded-2xl shadow-2xl">
               <p className="text-lg md:text-xl text-white font-black italic uppercase leading-relaxed mb-4">
                 All franchises operate on a unified 3-tier compensation model. Professional contracts for professional athletes.
               </p>
               <p className="text-[9px] text-league-muted font-bold uppercase tracking-[0.4em] opacity-40">
                 Final compensation is determined by franchise contract and league guidelines.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <TierCard tier="FRANCHISE" price="NEGOTIATED" desc="INDIVIDUAL CONTRACT STATUS" />
               <TierCard tier="STARTER" price="1K / GAME" desc="STANDARD MATCH FEE" />
               <TierCard tier="BACKUP/DEV" price="PRACTICE" desc="PRACTICE SQUAD NODE" />
            </div>
         </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-league-bg border-b border-league-border">
         <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-[12px] font-black uppercase tracking-[0.8em] text-league-accent italic mb-12 text-center">Induction Workflow</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
               <ProcessStep num="01" title="APPLY" desc="Submit Registry Dossier" />
               <ProcessStep num="02" title="EVALUATION" desc="Film, Stats, Interview" />
               <ProcessStep num="03" title="SELECTION" desc="Tryout or Direct Sign" />
               <ProcessStep num="04" title="PLACEMENT" desc="Team Node Assignment" />
               <ProcessStep num="05" title="CONTRACT" desc="Onboarding + Deployment" />
            </div>
         </div>
      </section>

      {/* Draft Form Section */}
      <section id="draft-section" className="py-24 md:py-32 bg-league-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e41d24 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 space-y-8 animate-in slide-in-from-top-10 duration-1000">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black italic uppercase text-white tracking-tighter leading-none">PLAYER DRAFT 2026</h1>
            <div className="inline-block px-8 py-3 rounded-full border border-league-accent bg-league-accent/10 text-league-accent text-[11px] md:text-[12px] font-black uppercase tracking-[0.6em] animate-pulse">
              Official Registration Hub
            </div>
          </div>
          
          <div className="bg-league-panel border-2 border-league-accent p-6 md:p-20 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_100px_rgba(228,29,36,0.15)] relative backdrop-blur-3xl overflow-hidden">
             <RegistrationForm />
          </div>

          <div className="mt-16 text-center">
             <div className="p-6 bg-league-panel border border-league-border rounded-2xl inline-block max-w-sm mx-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-league-muted mb-3">Prefer to apply by chat?</p>
                <button 
                  onClick={() => setIsAiWidgetOpen(true)}
                  className="bg-league-blue text-white px-6 py-2.5 rounded-lg font-black uppercase italic text-[9px] tracking-widest hover:brightness-110 shadow-xl"
                >
                  Launch AI Intake Assistant
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-black border-t border-league-border">
         <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-12 text-center">FREQUENTLY ASKED QUESTIONS</h2>
            <div className="space-y-3">
               <FaqItem q="Do you take players from any country?" a="Yes. IAL is a global platform. We actively recruit elite talent from the US, Europe, Asia, and Oceania." />
               <FaqItem q="Are there import rules?" a="No. Unlike other European leagues, IAL has zero import limitations. If you can play, you can be signed." />
               <FaqItem q="Is this paid?" a="Yes. We offer professional contracts across three tiers: Franchise (Negotiated), Starter (1k/Game), and Backup/Practice Squad." />
               <FaqItem q="Do I need EU citizenship?" a="Not required. We work with each player case-by-case on eligibility and visa requirements." />
               <FaqItem q="What film do I need?" a="High-quality highlights are required. Full game film is highly preferred for Tier 1 evaluation." />
               <FaqItem q="What is arena football?" a="A high-speed, high-scoring version of American football played on a 50-yard padded field. Fast-paced and fan-focused." />
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 md:py-32 border-t border-league-border bg-league-panel relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-16">
          <IALHeroLogo />
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[11px] md:text-[12px] font-black uppercase tracking-[0.5em] text-league-muted">
             <a href="#" className="hover:text-league-accent transition-colors">Contact HQ</a>
             <a href="#" className="hover:text-league-accent transition-colors">Privacy Node</a>
             <a href="#" className="hover:text-league-accent transition-colors">Recruiting Disclaimer</a>
          </div>
          <p className="text-[9px] font-black text-league-muted/30 uppercase tracking-[0.6em] italic">
            © 2026 International Arena League European Division • Node Authorization v2.7.0
          </p>
        </div>
      </footer>
    </div>
  );
};

const BadgeBlock = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3">
     <div className="w-1.5 h-1.5 bg-league-accent rounded-full shadow-[0_0_8px_#e41d24]" />
     <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">{title}</span>
  </div>
);

const TierCard = ({ tier, price, desc }: { tier: string, price: string, desc: string }) => (
  <div className="bg-league-bg border border-league-border p-5 rounded-xl group hover:border-league-accent transition-all">
     <div className="text-league-accent font-black text-lg italic mb-1">{price}</div>
     <div className="text-white font-black uppercase tracking-widest text-base mb-1">{tier}</div>
     <div className="text-[7px] font-bold text-league-muted uppercase tracking-[0.2em]">{desc}</div>
  </div>
);

const ProcessStep = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
  <div className="text-center group">
     <div className="text-3xl font-black italic text-league-accent/20 group-hover:text-league-accent transition-colors mb-3">{num}</div>
     <div className="text-white font-black uppercase tracking-widest mb-1 text-[11px]">{title}</div>
     <div className="text-[8px] font-bold text-league-muted uppercase tracking-widest leading-tight">{desc}</div>
  </div>
);

const FaqItem = ({ q, a }: { q: string, a: string }) => (
  <div className="bg-league-panel border border-league-border p-5 rounded-xl group hover:border-league-accent transition-all">
     <h4 className="text-[10px] font-black uppercase text-white tracking-widest mb-2">{q}</h4>
     <p className="text-[9px] font-bold text-league-muted uppercase leading-relaxed opacity-60">{a}</p>
  </div>
);
