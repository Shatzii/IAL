
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
import { CoachDashboard } from './components/CoachDashboard';
import { ContractStructures } from './components/ContractStructures';
import { TeamFilmRoom } from './components/TeamFilmRoom';
import { AICommandNode } from './components/AICommandNode';
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule, Team, Video, VideoTag, VideoStatus, VideoSourceType, ExecutiveDirective, DirectiveStatus, DirectivePriority, ContractStatus } from './types';
import { GoogleGenAI, Type } from "@google/genai";

export type ViewState = 'landing' | 'login' | 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms' | 'academy' | 'athlete-portal' | 'roster-builder' | 'war-room' | 'coach-dashboard' | 'contract-structure' | 'film-room' | 'ai-assistant';

const INITIAL_PROFILES: Profile[] = [];

const INITIAL_TEAMS: Team[] = [
  { id: 'team-nott-1', name: 'Nottingham Hoods', franchise: Franchise.NOTTINGHAM, rosterIds: [], coachIds: ['nottingham@gm.ial.com', 'jeff.hunt@nottingham.ial.com'] },
  { id: 'team-zuri-1', name: 'Zurich Guards', franchise: Franchise.ZURICH, rosterIds: [], coachIds: ['zurich@gm.ial.com', 'talib.wise@zurich.ial.com'] },
  { id: 'team-glas-1', name: 'Glasgow Tigers', franchise: Franchise.GLASGOW, rosterIds: [], coachIds: ['glasgow@gm.ial.com', 'phil.garcia@glasgow.ial.com'] },
  { id: 'team-duss-1', name: 'Düsseldorf Panthers', franchise: Franchise.DUSSELDORF, rosterIds: [], coachIds: ['dusseldorf@gm.ial.com', 'chris.mckinny@dusseldorf.ial.com'] },
  { id: 'team-stut-1', name: 'Stuttgart Surge', franchise: Franchise.STUTTGART, rosterIds: [], coachIds: ['stuttgart@gm.ial.com', 'keith.hill@stuttgart.ial.com'] }
];

const DEFAULT_GRADING: GradingConfig = {
  speedWeight: 1,
  strengthWeight: 1,
  agilityWeight: 1,
  iqWeight: 1,
  versatilityWeight: 1
};

interface AppState {
  profiles: Profile[];
  teams: Team[];
  directives: ExecutiveDirective[];
  activityLogs: ActivityLog[];
  currentSystemRole: SystemRole;
  currentUserProfileId: string | null; 
  currentUserEmail: string | null;
  isLoggedIn: boolean;
  selectedFranchise: Franchise;
  login: (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => void;
  logout: () => void;
  setView: (v: ViewState) => void;
  goBack: () => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  addProfile: (p: Profile) => void;
  updateDirective: (id: string, updates: Partial<ExecutiveDirective>) => void;
  addDirective: (d: ExecutiveDirective) => void;
  proposeContract: (profileId: string, amount: number, notes: string) => void;
  resolveContract: (profileId: string, status: ContractStatus, thoughts: string) => void;
  logActivity: (type: string, message: string, subjectId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  sendMessage: (text: string, channelId: string, recipientId?: string) => void;
  setSelectedFranchise: (f: Franchise) => void;
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  isBooting: boolean;
  isLoading: boolean;
  gradingConfig: GradingConfig;
  activeEvaluationEvent: LeagueEvent | null;
  startEvaluation: (e: LeagueEvent) => void;
  closeEvaluation: () => void;
  videos: Video[];
  addVideo: (v: Video) => void;
  videoTags: VideoTag[];
  updateVideoTag: (id: string, updates: Partial<VideoTag>) => void;
  analyzeVideoAi: (videoId: string) => Promise<void>;
  messages: ChatMessage[];
  issueBroadcast: (text: string, priority: string) => void;
  generateHypeAsset: (profileId: string) => Promise<void>;
  playbooks: Playbook[];
  learningModules: LearningModule[];
  runTacticalSim: (playId: string) => Promise<void>;
  translateIntel: (text: string, target: string) => Promise<string>;
  summarizeVoucher: (id: string) => Promise<string>;
  enrichDossier: (id: string) => Promise<void>;
  aiScoutSearch: (query: string) => Promise<string[]>;
  toggleComparison: (id: string) => void;
  comparisonIds: string[];
  runAiRosterStrategy: (f: Franchise) => Promise<string>;
  runMockDraft: () => Promise<string>;
}

export const AppContext = createContext<AppState | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Enterprise Art Primitives
const CyberSeal = () => (
  <svg className="absolute opacity-[0.03] pointer-events-none" viewBox="0 0 500 500" fill="white">
     <path d="M250 50 L450 150 V350 L250 450 L50 350 V150 Z" stroke="currentColor" strokeWidth="2" fill="none" />
     <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="10 20" />
     <path d="M150 250 H350 M250 150 V350" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);

const App: React.FC = () => {
  const [viewHistory, setViewHistory] = useState<ViewState[]>(['landing']);
  const [isLoading, setIsLoading] = useState(false);
  const view = viewHistory[viewHistory.length - 1];

  const setView = (v: ViewState) => {
    setIsLoading(true);
    setTimeout(() => {
      setViewHistory(prev => (prev[prev.length - 1] === v ? prev : [...prev, v]));
      setIsLoading(false);
      window.scrollTo(0, 0);
    }, 800);
  };

  const goBack = () => {
    setIsLoading(true);
    setTimeout(() => {
      setViewHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setIsLoading(false);
    }, 400);
  };
  
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('IAL_PERSONNEL_REGISTRY_v5');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [directives, setDirectives] = useState<ExecutiveDirective[]>(() => {
    const saved = localStorage.getItem('IAL_EXEC_DIRECTIVES_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('IAL_AUDIT_LOG_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [videos, setVideos] = useState<Video[]>([]);
  const [videoTags, setVideoTags] = useState<VideoTag[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeEvaluationEvent, setActiveEvaluationEvent] = useState<LeagueEvent | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [gradingConfig] = useState<GradingConfig>(DEFAULT_GRADING);

  useEffect(() => { localStorage.setItem('IAL_PERSONNEL_REGISTRY_v5', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('IAL_EXEC_DIRECTIVES_v5', JSON.stringify(directives)); }, [directives]);
  useEffect(() => { localStorage.setItem('IAL_AUDIT_LOG_v5', JSON.stringify(activityLogs)); }, [activityLogs]);

  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(SystemRole.PLAYER);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const login = (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => {
    setIsLoggedIn(true);
    setCurrentSystemRole(role);
    setCurrentUserEmail(email);
    if (franchise) setSelectedFranchise(franchise);
    if (profileId) setCurrentUserProfileId(profileId);
    
    if (role === SystemRole.PLAYER) setView('athlete-portal');
    else if (role === SystemRole.COACH_STAFF) setView('coach-dashboard');
    else setView('admin');
  };

  const logout = () => { 
    setIsLoggedIn(false); 
    setCurrentUserProfileId(null); 
    setCurrentUserEmail(null);
    setViewHistory(['landing']); 
    addToast("Uplink Successfully Disconnected.", "info");
  };

  const logActivity = (type: string, message: string, subjectId: string) => {
    const newLog = { id: Math.random().toString(36), timestamp: new Date().toISOString(), type, message, subjectId };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addProfile = (p: Profile) => setProfiles(prev => [...prev, p]);

  const updateDirective = (id: string, updates: Partial<ExecutiveDirective>) => {
    setDirectives(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const addDirective = (d: ExecutiveDirective) => setDirectives(prev => [d, ...prev]);

  const proposeContract = (profileId: string, amount: number, notes: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const offer = { amount, status: ContractStatus.PENDING_EXECUTIVE, franchise: selectedFranchise, timestamp: new Date().toISOString(), notes };
    updateProfile(profileId, { contractOffer: offer });
    addDirective({
      id: 'cont-' + Math.random().toString(36).substr(2, 5),
      title: `Contract Offer: ${profile.fullName}`,
      description: `GM ${selectedFranchise} proposing $${amount.toLocaleString()} deal.`,
      requester: currentUserEmail || 'GM',
      franchise: selectedFranchise,
      priority: DirectivePriority.CRITICAL,
      status: DirectiveStatus.PENDING,
      createdAt: new Date().toISOString(),
      type: 'CONTRACT',
      relatedProfileId: profileId
    });
    logActivity('CONTRACT_PROPOSAL', `Contract of $${amount.toLocaleString()} proposed for ${profile.fullName}`, profileId);
    addToast("Proposal Transmitted to Vault.", "success");
  };

  const resolveContract = (profileId: string, status: ContractStatus, thoughts: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || !profile.contractOffer) return;
    updateProfile(profileId, { 
      contractOffer: { ...profile.contractOffer, status },
      status: status === ContractStatus.APPROVED ? RecruitingStatus.OFFER_EXTENDED : profile.status
    });
    const directive = directives.find(d => d.relatedProfileId === profileId && d.status === DirectiveStatus.PENDING);
    if (directive) {
      updateDirective(directive.id, { 
        status: status === ContractStatus.APPROVED ? DirectiveStatus.AUTHORIZED : DirectiveStatus.DENIED,
        commishThoughts: thoughts,
        resolvedAt: new Date().toISOString()
      });
    }
    logActivity('CONTRACT_RESOLVED', `Commissioner ${status}: ${profile.fullName}`, profileId);
    addToast(`Contract ${status}.`, "success");
  };

  const addToast = (message: string, type: any = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const aiScoutSearch = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a search of the personnel pool for: ${query}. Personnel: ${JSON.stringify(profiles.map(p => ({id: p.id, name: p.fullName, pos: p.positions})))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || '[]');
  };

  const translateIntel = async (text: string, target: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate to ${target}: ${text}`,
    });
    return response.text || text;
  };

  const enrichDossier = async (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Enrich profile: ${JSON.stringify(profile.metrics)}`,
    });
    updateProfile(id, { aiIntel: response.text });
  };

  const summarizeVoucher = async (docId: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize doc: ${docId}`,
    });
    return response.text || 'Archive metadata inaccessible.';
  };

  const runMockDraft = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Simulate IAL Draft using pool: ${JSON.stringify(profiles.filter(p => !p.assignedFranchise))}`,
    });
    return response.text || 'Simulation failed.';
  };

  const runAiRosterStrategy = async (f: Franchise) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const roster = profiles.filter(p => p.assignedFranchise === f);
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze ${f} roster: ${JSON.stringify(roster)}`,
    });
    return response.text || 'Strategy link severed.';
  };

  return (
    <AppContext.Provider value={{ 
      profiles, teams: INITIAL_TEAMS, directives, activityLogs, currentSystemRole, currentUserProfileId, currentUserEmail, isLoggedIn, selectedFranchise,
      login, logout, setView, goBack, updateProfile, addProfile, updateDirective, addDirective, proposeContract, resolveContract, logActivity, addToast, 
      sendMessage: (text, chanId) => {
        const msg: ChatMessage = { id: Math.random().toString(36), channelId: chanId, senderId: currentUserProfileId || 'admin', senderName: currentUserEmail || 'Admin', senderRole: currentSystemRole, text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, msg]);
      }, 
      setSelectedFranchise, activeChannelId, setActiveChannelId, isBooting, isLoading, gradingConfig, activeEvaluationEvent, 
      startEvaluation: (e) => { setActiveEvaluationEvent(e); setView('evaluation'); }, 
      closeEvaluation: () => setActiveEvaluationEvent(null),
      videos, addVideo: (v) => setVideos(prev => [...prev, v]), videoTags, 
      updateVideoTag: (id, updates) => setVideoTags(prev => prev.map(t => t.id === id ? {...t, ...updates} : t)),
      analyzeVideoAi: async () => { addToast("Syncing AI Overlay...", "info"); },
      messages, issueBroadcast: (text) => logActivity('BROADCAST', text, 'LEAGUE_COMMAND'),
      generateHypeAsset: async (pid) => { updateProfile(pid, { hypeAssetUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop' }); },
      playbooks: [{ id: 'pb1', name: 'Standard Arena 50-Node', plays: [], lastUpdated: '2024-Q1' }],
      learningModules: [], runTacticalSim: async () => {}, translateIntel, summarizeVoucher, enrichDossier, aiScoutSearch, 
      toggleComparison: (id) => setComparisonIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 2)), 
      comparisonIds, runAiRosterStrategy, runMockDraft
    }}>
      {isBooting && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center font-mono p-6">
           <CyberSeal />
           <svg className="h-24 md:h-32 mb-8 animate-pulse relative z-10" viewBox="0 0 240 80" fill="none"><path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/><text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic">IAL</text></svg>
           <p className="text-league-accent font-black tracking-[0.5em] animate-pulse relative z-10 uppercase text-xs">Synchronizing Enterprise Roster Node</p>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center transition-all">
           <div className="animate-bounce">
              <svg className="h-16 md:h-24" viewBox="0 0 240 80" fill="none"><path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/><text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic">IAL</text></svg>
           </div>
           <p className="mt-8 text-[10px] font-black uppercase tracking-[0.6em] text-league-accent animate-pulse">Establishing Secure Socket...</p>
        </div>
      )}

      <div className="min-h-screen bg-league-bg text-league-fg font-sans selection:bg-league-accent flex flex-col relative overflow-hidden">
        {/* Global Art: Subtle Scanlines */}
        <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] [background-size:100%_4px,3px_100%]" />
        
        <Header currentView={view} setView={setView} />
        <main className={`flex-grow ${view === 'landing' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
          {!isLoading && view !== 'landing' && (
            <button onClick={goBack} className="group flex items-center gap-2 px-4 py-2 mb-6 bg-league-panel border border-league-border rounded-xl text-[10px] font-black uppercase tracking-widest text-league-muted hover:text-white transition-all">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>Back
            </button>
          )}
          <div className={`${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-500`}>
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
            {view === 'coach-dashboard' && <CoachDashboard />}
            {view === 'contract-structure' && <ContractStructures />}
            {view === 'film-room' && <TeamFilmRoom />}
            {view === 'ai-assistant' && <AICommandNode />}
          </div>
        </main>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className="px-6 py-3 rounded-full border shadow-2xl bg-black/80 border-white/10 flex items-center gap-3 backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full ${t.type === 'success' ? 'bg-league-ok shadow-[0_0_8px_#23d18b]' : 'bg-league-accent shadow-[0_0_8px_#e41d24]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
