
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
import { SecurityHub } from './components/SecurityHub';
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule, Team, Video, VideoTag, VideoStatus, VideoSourceType, ExecutiveDirective, DirectiveStatus, DirectivePriority, ContractStatus, Notification, RosterHealth, SessionMetadata, AuditActionType } from './types';
import { GoogleGenAI } from "@google/genai";

export type ViewState = 'landing' | 'login' | 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms' | 'academy' | 'athlete-portal' | 'roster-builder' | 'war-room' | 'coach-dashboard' | 'contract-structure' | 'film-room' | 'ai-assistant' | 'security-hub';

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'P-99A1X',
    fullName: 'Jackson "The Wall" Vance',
    email: 'jackson.v@scout-ial.net',
    phone: '+1 555-0102',
    dateOfBirth: '1998-05-12',
    nationality: 'USA',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.NOTTINGHAM, rank4: Franchise.GLASGOW, rank5: Franchise.DUSSELDORF },
    createdAt: new Date().toISOString(),
    positions: ['QB'],
    height_cm: 193,
    weight_kg: 102,
    metrics: { speed: 8, strength: 7, agility: 8, iq: 9, versatility: 6 },
    scoutGrade: 9.4,
    ironmanCoefficient: 0.45,
    isIronmanPotential: false,
    assignedFranchise: Franchise.ZURICH,
    assignedTeam: 'Guards',
    documents: [],
    onboardingChecklist: [],
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    needsHousing: true
  }
];

interface AppState {
  profiles: Profile[];
  teams: Team[];
  directives: ExecutiveDirective[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  depthCharts: Record<string, Record<string, string>>;
  currentSystemRole: SystemRole;
  currentUserProfileId: string | null; 
  currentUserEmail: string | null;
  currentSession: SessionMetadata | null;
  isLoggedIn: boolean;
  selectedFranchise: Franchise;
  login: (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => void;
  logout: () => void;
  setView: (v: ViewState) => void;
  goBack: () => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  addProfile: (p: Profile) => Promise<boolean>;
  updateDirective: (id: string, updates: Partial<ExecutiveDirective>) => void;
  addDirective: (d: ExecutiveDirective) => void;
  proposeContract: (profileId: string, amount: number, notes: string) => void;
  resolveContract: (profileId: string, status: ContractStatus, thoughts: string) => void;
  signContract: (profileId: string) => void;
  logActivity: (type: AuditActionType | string, message: string, subjectId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  sendMessage: (text: string, channelId: string, recipientId?: string) => void;
  setSelectedFranchise: (f: Franchise) => void;
  setDepthChartAssignment: (teamId: string, slotId: string, profileId: string | null) => void;
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  isBooting: boolean;
  isLoading: boolean;
  isSyncing: boolean;
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
  syncWithVault: () => Promise<void>;
  syncFromGlobal: () => Promise<void>;
  calculateRosterHealth: (f: Franchise) => RosterHealth;
  globalNetworkTotal: number;
  maskPII: (text: string, force?: boolean) => string;
}

export const AppContext = createContext<AppState | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [viewHistory, setViewHistory] = useState<ViewState[]>(['landing']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const view = viewHistory[viewHistory.length - 1];

  const setView = (v: ViewState) => {
    setIsLoading(true);
    setTimeout(() => {
      setViewHistory(prev => (prev[prev.length - 1] === v ? prev : [...prev, v]));
      setIsLoading(false);
    }, 400);
  };

  const goBack = () => {
    setIsLoading(true);
    setTimeout(() => {
      setViewHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setIsLoading(false);
    }, 200);
  };
  
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('IAL_CORE_VAULT_v8');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [currentSession, setCurrentSession] = useState<SessionMetadata | null>(() => {
    const saved = sessionStorage.getItem('IAL_ACTIVE_HANDSHAKE');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(() => {
    return (localStorage.getItem('IAL_ROLE') as SystemRole) || SystemRole.PLAYER;
  });

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('IAL_USER_EMAIL'));
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(() => localStorage.getItem('IAL_USER_PID'));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!sessionStorage.getItem('IAL_ACTIVE_HANDSHAKE'));

  const [directives, setDirectives] = useState<ExecutiveDirective[]>(() => {
    const saved = localStorage.getItem('IAL_EXEC_DIRECTIVES_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('IAL_AUDIT_LOG_IMMUTABLE');
    return saved ? JSON.parse(saved) : [];
  });

  const [depthCharts, setDepthCharts] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('IAL_DEPTH_CHARTS_v8');
    return saved ? JSON.parse(saved) : {};
  });

  const [videos, setVideos] = useState<Video[]>([]);
  const [videoTags, setVideoTags] = useState<VideoTag[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeEvaluationEvent, setActiveEvaluationEvent] = useState<LeagueEvent | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [gradingConfig] = useState<GradingConfig>({ speedWeight: 1, strengthWeight: 1, agilityWeight: 1, iqWeight: 1, versatilityWeight: 1 });
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { localStorage.setItem('IAL_CORE_VAULT_v8', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('IAL_AUDIT_LOG_IMMUTABLE', JSON.stringify(activityLogs)); }, [activityLogs]);

  const logActivity = (type: AuditActionType | string, message: string, subjectId: string) => {
    const actorId = currentUserProfileId || 'SYSTEM_DAEMON';
    const timestamp = new Date().toISOString();
    const hash = btoa(`${timestamp}|${type}|${message}|${actorId}`).substr(0, 16).toUpperCase();
    const newLog: ActivityLog = { id: Math.random().toString(36).substr(2, 9), timestamp, type, message, subjectId, actorId, hash };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 500));
  };

  const generateHypeAsset = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    addToast("Neural Hype Engine Initializing...", "info");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A cinematic, ultra-realistic sports marketing poster for an arena football player named ${profile.fullName}. 
      The player is a ${profile.positions.join('/')} and looks powerful and elite. 
      The setting is a high-tech, futuristic indoor arena with neon red lights and intense atmosphere. 
      Professional photography style, high contrast, 8k resolution.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: prompt }],
        config: { imageConfig: { aspectRatio: "3:4" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64Data}`;
          setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, hypeAssetUrl: imageUrl } : p));
          addToast("Hype Asset Synthesized successfully.", "success");
          logActivity(AuditActionType.DATA_MODIFY, `Hype Card Generated for ${profile.fullName}`, profileId);
        }
      }
    } catch (err) {
      console.error(err);
      addToast("Hype Synthesis Failed. Re-routing...", "error");
    }
  };

  const maskPII = (text: string, force: boolean = false) => {
    if (!force && currentSystemRole === SystemRole.LEAGUE_ADMIN) return text;
    if (!text) return '';
    if (text.includes('@')) {
        const [user, domain] = text.split('@');
        return `${user.charAt(0)}***@***.${domain.split('.').pop()}`;
    }
    if (text.startsWith('+')) {
        return `${text.substr(0, 3)}********`;
    }
    return '********';
  };

  const login = (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => {
    const session: SessionMetadata = {
        token: `jwt_${Math.random().toString(36).substr(2, 20)}`,
        expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
        ipAddress: '192.168.1.1',
        mfaVerified: true,
        deviceId: 'IAL-SECURE-NODE-01'
    };
    
    setCurrentSession(session);
    sessionStorage.setItem('IAL_ACTIVE_HANDSHAKE', JSON.stringify(session));
    setIsLoggedIn(true);
    setCurrentSystemRole(role);
    setCurrentUserEmail(email);
    if (franchise) setSelectedFranchise(franchise);
    if (profileId) setCurrentUserProfileId(profileId);
    
    logActivity(AuditActionType.AUTHENTICATION, `Handshake successful for role: ${role}`, email);
    
    if (role === SystemRole.PLAYER) setView('athlete-portal');
    else if (role === SystemRole.COACH_STAFF) setView('coach-dashboard');
    else setView('admin');
  };

  const logout = () => { 
    logActivity(AuditActionType.AUTHENTICATION, "Session Terminated by User", currentUserProfileId || 'unknown');
    setIsLoggedIn(false); 
    setCurrentSession(null);
    sessionStorage.removeItem('IAL_ACTIVE_HANDSHAKE');
    setViewHistory(['landing']); 
  };

  const addToast = (message: string, type: any = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  return (
    <AppContext.Provider value={{ 
      profiles, teams: [], directives, activityLogs, notifications: [], depthCharts, currentSystemRole, currentUserProfileId, currentUserEmail, currentSession, isLoggedIn, selectedFranchise,
      login, logout, setView, goBack, updateProfile: (id, u) => setProfiles(p => p.map(x => x.id === id ? {...x, ...u} : x)),
      addProfile: async (p) => { setProfiles(prev => [p, ...prev]); return true; },
      updateDirective: (id, u) => {}, addDirective: (d) => {},
      proposeContract: () => {}, resolveContract: () => {}, signContract: () => {},
      logActivity, addToast, addNotification: (n) => {}, markNotificationRead: (id) => {},
      sendMessage: () => {}, setSelectedFranchise, setDepthChartAssignment: () => {}, activeChannelId, setActiveChannelId,
      isBooting, isLoading, isSyncing, gradingConfig, activeEvaluationEvent, startEvaluation: (e) => setActiveEvaluationEvent(e), closeEvaluation: () => setActiveEvaluationEvent(null),
      videos, addVideo: (v) => setVideos(p => [...p, v]), videoTags, updateVideoTag: () => {}, analyzeVideoAi: async () => {},
      messages, issueBroadcast: () => {}, generateHypeAsset, playbooks: [], learningModules: [],
      runTacticalSim: async () => {}, translateIntel: async (t) => t, summarizeVoucher: async () => '',
      enrichDossier: async () => {}, aiScoutSearch: async () => [], toggleComparison: (id) => setComparisonIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]),
      comparisonIds, runAiRosterStrategy: async () => '', runMockDraft: async () => '', syncWithVault: async () => {}, syncFromGlobal: async () => {},
      calculateRosterHealth: () => ({ integrityScore: 100, gaps: [], recommendations: [] }), globalNetworkTotal: profiles.length + 124,
      maskPII
    }}>
      {isBooting ? (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
           <svg className="h-20 animate-pulse" viewBox="0 0 240 80" fill="none"><path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/><text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic">IAL</text></svg>
           <p className="text-[10px] font-black uppercase text-league-accent tracking-[0.5em] mt-8">Booting Enterprise Node v2.9.1</p>
        </div>
      ) : (
        <div className="min-h-screen bg-league-bg text-league-fg font-sans flex flex-col relative overflow-hidden">
          {toasts.map(t => (
            <div key={t.id} className={`fixed top-24 right-8 z-[1000] px-6 py-3 rounded-xl border font-black uppercase text-[10px] shadow-2xl animate-in slide-in-from-right-10 ${t.type === 'success' ? 'bg-league-ok/20 border-league-ok text-league-ok' : t.type === 'error' ? 'bg-league-accent/20 border-league-accent text-league-accent' : 'bg-league-blue/20 border-league-blue text-league-blue'}`}>
               {t.message}
            </div>
          ))}
          <Header currentView={view} setView={setView} />
          <main className={`flex-grow ${view === 'landing' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
            <div className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
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
              {view === 'security-hub' && <SecurityHub />}
            </div>
          </main>
        </div>
      )}
    </AppContext.Provider>
  );
};

export default App;
