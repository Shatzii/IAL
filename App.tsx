import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { RegistrationForm } from './components/RegistrationForm';
import { Profiles } from './components/Profiles';
import { Schedule } from './components/Schedule';
import { DraftBoard } from './components/DraftBoard';
import { FranchiseAdmin } from './components/FranchiseAdmin';
import { ComparisonView } from './components/ComparisonView';
import { Pipeline } from './components/Pipeline';
import { Header } from './components/Header';
import { CombineEvaluation } from './components/CombineEvaluation';
import { CommsCenter } from './components/CommsCenter';
import { Academy } from './components/Academy';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { AthletePortal } from './components/AthletePortal';
import { RosterBuilder } from './components/RosterBuilder';
import { WarRoom } from './components/WarRoom';
import { ElfRegistry } from './components/ElfRegistry';
import { CoachDashboard } from './components/CoachDashboard';
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule, OnboardingTask, Document, BroadcastDirective } from './types';
import { GoogleGenAI } from "@google/genai";

export type ViewState = 'landing' | 'login' | 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms' | 'academy' | 'athlete-portal' | 'roster-builder' | 'war-room' | 'elf-registry' | 'coach-dashboard';

const INITIAL_PROFILES: Profile[] = [
  // STUTTGART SURGE - ACTIVE & PROSPECTS
  { id: 'str-4', fullName: 'Reilly Hennessey', email: 'r.hennessey@stuttgart-surge.de', phone: '0', dateOfBirth: '1995-12-07', nationality: 'USA', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.ZURICH, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-01-01', scoutGrade: 9.8, positions: ['QB'], personalBio: "All-Star Quarterback. Lead Stuttgart to the championship game.", metrics: { speed: 7, strength: 7, agility: 8, iq: 10, versatility: 6 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.STUTTGART, assignedTeam: 'Surge', avatar_url: 'https://i.pravatar.cc/150?u=str-4' },
  { id: 'str-0', fullName: 'Tomiwa Oyewo', email: 't.oyewo@stuttgart-surge.de', phone: '0', dateOfBirth: '1998-01-01', nationality: 'Ireland', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM }, createdAt: '2024-01-01', positions: ['RB'], height_cm: 180, weight_kg: 95, metrics: { speed: 9, strength: 8, agility: 9, iq: 8, versatility: 7 }, isIronmanPotential: true, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.STUTTGART, assignedTeam: 'Surge', avatar_url: 'https://i.pravatar.cc/150?u=str-0' },
  { id: 'str-7', fullName: 'Louis Geyer', email: 'l.geyer@stuttgart-surge.de', phone: '0', dateOfBirth: '2000-01-01', nationality: 'Germany', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM }, createdAt: '2024-01-01', positions: ['WR'], height_cm: 188, weight_kg: 90, metrics: { speed: 9, strength: 7, agility: 9, iq: 8, versatility: 7 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.STUTTGART, assignedTeam: 'Surge', avatar_url: 'https://i.pravatar.cc/150?u=str-7' },
  
  // DRAFT POOL CANDIDATES (ELF PROS NOT YET ASSIGNED FOR 2026)
  { id: 'str-3', fullName: 'Michael Harley Jr', email: 'm.harley@prospect.ial.com', phone: '0', dateOfBirth: '1996-01-01', nationality: 'USA', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.NEW_LEAD, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.ZURICH, rank3: Franchise.DUSSELDORF, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM }, createdAt: '2024-05-01', positions: ['WR'], height_cm: 178, weight_kg: 82, metrics: { speed: 10, strength: 6, agility: 9, iq: 9, versatility: 8 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], avatar_url: 'https://i.pravatar.cc/150?u=str-3' },
  { id: 'str-1', fullName: 'Sasan Jelvani', email: 's.jelvani@prospect.ial.com', phone: '0', dateOfBirth: '1994-01-01', nationality: 'Germany', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.NEW_LEAD, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-05-01', positions: ['LB'], height_cm: 183, weight_kg: 95, metrics: { speed: 8, strength: 9, agility: 8, iq: 10, versatility: 7 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], avatar_url: 'https://i.pravatar.cc/150?u=str-1' },
  { id: 'str-13', fullName: 'Chris Mulumba', email: 'c.mulumba@prospect.ial.com', phone: '0', dateOfBirth: '1991-01-01', nationality: 'Finland', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.NEW_LEAD, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-05-01', positions: ['DE'], height_cm: 190, weight_kg: 127, metrics: { speed: 7, strength: 10, agility: 7, iq: 9, versatility: 6 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], avatar_url: 'https://i.pravatar.cc/150?u=str-13' },
  { id: 'str-17', fullName: 'Daniel Pedro', email: 'd.pedro@prospect.ial.com', phone: '0', dateOfBirth: '2003-01-01', nationality: 'UK', role: Role.PLAYER, tier: TalentTier.TIER3, status: RecruitingStatus.INACTIVE, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.NOTTINGHAM, rank3: Franchise.DUSSELDORF, rank4: Franchise.GLASGOW, rank5: Franchise.ZURICH }, createdAt: '2024-05-01', positions: ['WR'], height_cm: 189, weight_kg: 92, metrics: { speed: 8, strength: 6, agility: 8, iq: 7, versatility: 7 }, isIronmanPotential: true, documents: [], onboardingChecklist: [], avatar_url: 'https://i.pravatar.cc/150?u=str-17' },
];

interface AppState {
  profiles: Profile[];
  activityLogs: ActivityLog[];
  currentSystemRole: SystemRole;
  currentUserProfileId: string | null; 
  isLoggedIn: boolean;
  selectedFranchise: Franchise;
  messages: ChatMessage[];
  broadcasts: BroadcastDirective[];
  login: (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => void;
  logout: () => void;
  setView: (v: ViewState) => void;
  goBack: () => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  addProfile: (p: Profile) => void;
  logActivity: (type: string, message: string, subjectId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  sendMessage: (text: string, channelId: string, recipientId?: string) => void;
  setSelectedFranchise: (f: Franchise) => void;
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  gradingConfig: GradingConfig;
  comparisonIds: string[];
  toggleComparison: (id: string) => void;
  aiScoutSearch: (query: string) => Promise<string[] | null>;
  enrichDossier: (profileId: string) => Promise<void>;
  generateHypeAsset: (profileId: string) => Promise<void>;
  issueBroadcast: (msg: string, priority: 'CRITICAL' | 'STANDARD') => void;
  runTacticalSim: (playId: string) => Promise<void>;
  runAiRosterStrategy: (franchise: Franchise) => Promise<string>;
  runMockDraft: () => Promise<string>;
  translateIntel: (text: string, lang: string) => Promise<string>;
  summarizeVoucher: (id: string) => Promise<string>;
  startEvaluation: (event: LeagueEvent) => void;
  closeEvaluation: () => void;
  activeEvaluationEvent: LeagueEvent | null;
  isPrivacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  alertConfigs: any;
  playbooks: Playbook[];
  learningModules: LearningModule[];
  isBooting: boolean;
}

export const AppContext = createContext<AppState | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [viewHistory, setViewHistory] = useState<ViewState[]>(['landing']);
  const view = viewHistory[viewHistory.length - 1];

  const setView = (v: ViewState) => {
    setViewHistory(prev => {
      // Don't duplicate the current view if it's already at the top
      if (prev[prev.length - 1] === v) return prev;
      return [...prev, v];
    });
  };

  const goBack = () => {
    setViewHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };
  
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('IAL_PERSONNEL_REGISTRY');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('IAL_AUDIT_LOG');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('IAL_PERSONNEL_REGISTRY', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('IAL_AUDIT_LOG', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(SystemRole.PLAYER);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastDirective[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [activeEvaluationEvent, setActiveEvaluationEvent] = useState<LeagueEvent | null>(null);
  const [isPrivacyMode, setPrivacyMode] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const gradingConfig: GradingConfig = useMemo(() => ({
    speedWeight: 1.0, strengthWeight: 0.8, agilityWeight: 0.9, iqWeight: 1.2, versatilityWeight: 0.7
  }), []);

  const login = (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => {
    setIsLoggedIn(true);
    setCurrentSystemRole(role);
    if (franchise) setSelectedFranchise(franchise);
    if (profileId) setCurrentUserProfileId(profileId);
    logActivity('AUTH', `Session initialized for ${email}`, 'auth-node');
    
    if (role === SystemRole.PLAYER) {
      setView('athlete-portal');
    } else if (role === SystemRole.COACH_STAFF) {
      setView('coach-dashboard');
    } else {
      setView('landing');
    }
  };

  const logout = () => { setIsLoggedIn(false); setCurrentUserProfileId(null); setViewHistory(['landing']); };

  const logActivity = (type: string, message: string, subjectId: string) => {
    setActivityLogs(prev => [{ id: Math.random().toString(36), timestamp: new Date().toISOString(), type, message, subjectId }, ...prev].slice(0, 50));
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    logActivity('PURGE', `Personnel record ${id} removed from registry.`, 'admin');
  };

  const addProfile = (p: Profile) => setProfiles(prev => [...prev, p]);
  
  const addToast = (message: string, type: any = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const sendMessage = (text: string, channelId: string, recipientId?: string) => {
    const msg: ChatMessage = { id: Math.random().toString(36), senderId: currentUserProfileId || 'admin', senderName: currentSystemRole, senderRole: currentSystemRole, text, timestamp: new Date().toISOString(), channelId };
    setMessages(prev => [...prev, msg]);
  };

  const issueBroadcast = (message: string, priority: 'CRITICAL' | 'STANDARD') => {
    const b: BroadcastDirective = { id: Math.random().toString(36), message, priority, active: true, timestamp: new Date().toISOString() };
    setBroadcasts(prev => [b, ...prev]);
  };

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id].slice(-2));
  };

  const aiScoutSearch = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: `Find registry IDs matching: ${query}. Available: ${JSON.stringify(profiles.map(p => ({id: p.id, pos: p.positions, grade: p.scoutGrade})))}. Return JSON [id1, id2].` 
    });
    const match = response.text.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : null;
  };

  const enrichDossier = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Enrich athlete profile for ${profile.fullName}. focus on stats and news.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    updateProfile(profileId, { aiIntel: response.text });
  };

  const generateHypeAsset = async (profileId: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `A futuristic sports hype poster for an arena football player.` }] },
      config: { imageConfig: { aspectRatio: "9:16", imageSize: "1K" } }
    });
    const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (imagePart) updateProfile(profileId, { hypeAssetUrl: `data:image/png;base64,${imagePart.inlineData.data}` });
  };

  const runTacticalSim = async (playId: string) => {
    addToast("Initializing Tactical Simulation Engine...", "info");
  };

  const runAiRosterStrategy = async (franchise: Franchise) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze roster for ${franchise} and suggest strategy.`
    });
    return response.text || "Strategy generation unavailable.";
  };

  const runMockDraft = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simulate a mock draft for the International Arena League. Using these players: ${JSON.stringify(profiles.map(p => ({id: p.id, name: p.fullName, pos: p.positions, grade: p.scoutGrade})))}. Predict which of the 18 franchises would take them and why. Keep it concise.`
    });
    return response.text || "Simulation offline.";
  };

  const translateIntel = async (text: string, lang: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following sports intel to ${lang}: "${text}"`
    });
    return response.text || text;
  };

  const summarizeVoucher = async (id: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 3-bullet executive summary for a professional football scouting document ID: ${id}.`
    });
    return response.text || "Summary unavailable.";
  };

  return (
    <AppContext.Provider value={{ 
      profiles, activityLogs, currentSystemRole, currentUserProfileId, isLoggedIn, selectedFranchise, messages, broadcasts,
      login, logout, setView, goBack, updateProfile, deleteProfile, addProfile, logActivity, addToast, sendMessage, setSelectedFranchise,
      activeChannelId, setActiveChannelId, gradingConfig, comparisonIds, toggleComparison, aiScoutSearch, enrichDossier,
      generateHypeAsset, issueBroadcast, runTacticalSim, runAiRosterStrategy, runMockDraft, translateIntel, summarizeVoucher, 
      startEvaluation: (e) => { setActiveEvaluationEvent(e); setView('evaluation'); },
      closeEvaluation: () => { setActiveEvaluationEvent(null); goBack(); },
      activeEvaluationEvent, isPrivacyMode, setPrivacyMode, alertConfigs: { 
        [Franchise.NOTTINGHAM]: { minRosterSize: 12 }, 
        [Franchise.GLASGOW]: { minRosterSize: 12 }, 
        [Franchise.DUSSELDORF]: { minRosterSize: 12 }, 
        [Franchise.STUTTGART]: { minRosterSize: 12 }, 
        [Franchise.ZURICH]: { minRosterSize: 12 } 
      },
      playbooks, learningModules, isBooting
    }}>
      <style>{`:root { --franchise-accent: ${FRANCHISE_COLORS[selectedFranchise]}; }`}</style>
      
      {isBooting && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center font-mono p-6">
           <div className="w-full max-w-md space-y-4">
              <div className="text-league-accent font-black text-xl animate-pulse italic">IAL_SYSTEM_HANDSHAKE_INIT_v2.5</div>
              <div className="space-y-1">
                 <BootLine text="Verifying Registry Node Cluster..." delay={0} />
                 <BootLine text="Loading Personnel Encrpytion Modules..." delay={400} />
                 <BootLine text="Establishing Secure Franchise Uplinks..." delay={800} />
                 <BootLine text="Syncing 2026 Draft Logic..." delay={1200} />
                 <BootLine text="ACCESS GRANTED. COMMANDER." delay={1800} />
              </div>
              <div className="h-1 w-full bg-league-border rounded-full overflow-hidden mt-8">
                 <div className="h-full bg-league-accent animate-[bootProgress_3s_ease-in-out_forwards]" />
              </div>
           </div>
        </div>
      )}

      <div className="min-h-screen bg-league-bg text-league-fg font-sans selection:bg-league-accent flex flex-col">
        <Header currentView={view} setView={setView} />
        {broadcasts.some(b => b.active) && (
          <div className="bg-league-accent text-white py-2 overflow-hidden border-b border-white/20 z-[100]">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="mx-12 text-[10px] font-black uppercase tracking-[0.4em]">
                  <span className="mr-4">⚠️ LEAGUE DIRECTIVE:</span>
                  {broadcasts.find(b => b.active)?.message}
                </span>
              ))}
            </div>
          </div>
        )}
        <main className={`flex-grow ${view === 'landing' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
          {view !== 'landing' && (
            <div className="mb-6 flex items-center gap-4">
              <button 
                onClick={goBack}
                className="group flex items-center gap-2 px-4 py-2 bg-league-panel border border-league-border rounded-xl text-[10px] font-black uppercase tracking-widest text-league-muted hover:text-white hover:border-league-accent transition-all"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </button>
            </div>
          )}
          
          {view === 'landing' && <LandingPage />}
          {view === 'login' && <Login />}
          {view === 'register' && <RegistrationForm />}
          {view === 'admin' && <Dashboard />}
          {view === 'profiles' && <Profiles />}
          {view === 'schedule' && <Schedule />}
          {view === 'draft' && <DraftBoard />}
          {view === 'franchise-admin' && <FranchiseAdmin />}
          {view === 'compare' && <ComparisonView />}
          {view === 'pipeline' && <Pipeline />}
          {view === 'evaluation' && <CombineEvaluation />}
          {view === 'comms' && <CommsCenter />}
          {view === 'academy' && <Academy />}
          {view === 'athlete-portal' && <AthletePortal />}
          {view === 'roster-builder' && <RosterBuilder />}
          {view === 'war-room' && <WarRoom />}
          {view === 'elf-registry' && <ElfRegistry />}
          {view === 'coach-dashboard' && <CoachDashboard />}
        </main>
        
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className="px-6 py-3 rounded-full border shadow-2xl animate-in slide-in-from-bottom-4 bg-black/80 border-white/10 flex items-center gap-3 pointer-events-auto">
              <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-league-ok' : toast.type === 'error' ? 'bg-league-accent' : 'bg-league-blue'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes bootProgress { 0% { width: 0%; } 100% { width: 100%; } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-20%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </AppContext.Provider>
  );
};

const BootLine = ({ text, delay }: { text: string, delay: number }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <div className={`text-[10px] uppercase font-bold tracking-widest ${visible ? 'text-white' : 'text-transparent'}`}>[ {visible ? 'OK' : '..'} ] {text}</div>;
};

export default App;