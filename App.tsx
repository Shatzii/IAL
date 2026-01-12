
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
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule, Team, Video, VideoTag, VideoStatus, VideoSourceType, ExecutiveDirective, DirectiveStatus, DirectivePriority, ContractStatus, Notification, RosterHealth } from './types';
import { GoogleGenAI, Type } from "@google/genai";

export type ViewState = 'landing' | 'login' | 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms' | 'academy' | 'athlete-portal' | 'roster-builder' | 'war-room' | 'coach-dashboard' | 'contract-structure' | 'film-room' | 'ai-assistant';

const INITIAL_TEAMS: Team[] = [
  { id: 'team-nott-1', name: 'Hoods', franchise: Franchise.NOTTINGHAM, rosterIds: [], coachIds: ['nottingham@gm.ial.com'] },
  { id: 'team-zuri-1', name: 'Guards', franchise: Franchise.ZURICH, rosterIds: [], coachIds: ['zurich@gm.ial.com'] },
  { id: 'team-glas-1', name: 'Tigers', franchise: Franchise.GLASGOW, rosterIds: [], coachIds: ['glasgow@gm.ial.com'] },
  { id: 'team-duss-1', name: 'Panthers', franchise: Franchise.DUSSELDORF, rosterIds: [], coachIds: ['dusseldorf@gm.ial.com'] },
  { id: 'team-stut-1', name: 'Surge', franchise: Franchise.STUTTGART, rosterIds: [], coachIds: ['stuttgart@gm.ial.com'] }
];

const DEFAULT_GRADING: GradingConfig = {
  speedWeight: 1, strengthWeight: 1, agilityWeight: 1, iqWeight: 1, versatilityWeight: 1
};

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
  logActivity: (type: string, message: string, subjectId: string) => void;
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
  calculateRosterHealth: (f: Franchise) => RosterHealth;
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
      window.scrollTo(0, 0);
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
    return saved ? JSON.parse(saved) : [];
  });

  const [directives, setDirectives] = useState<ExecutiveDirective[]>(() => {
    const saved = localStorage.getItem('IAL_EXEC_DIRECTIVES_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('IAL_AUDIT_LOG_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('IAL_NOTIFICATIONS_v8');
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
  const [gradingConfig] = useState<GradingConfig>(DEFAULT_GRADING);

  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(SystemRole.LEAGUE_ADMIN);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>('admin-root');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>('admin@ial-football.com');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
      syncWithVault();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { localStorage.setItem('IAL_CORE_VAULT_v8', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('IAL_EXEC_DIRECTIVES_v8', JSON.stringify(directives)); }, [directives]);
  useEffect(() => { localStorage.setItem('IAL_AUDIT_LOG_v8', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem('IAL_NOTIFICATIONS_v8', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('IAL_DEPTH_CHARTS_v8', JSON.stringify(depthCharts)); }, [depthCharts]);

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newN: Notification = { ...n, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), read: false };
    setNotifications(prev => [newN, ...prev]);
  };

  const syncWithVault = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 400));
    setIsSyncing(false);
  };

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
    addToast("Uplink Disconnected.", "info");
  };

  const logActivity = (type: string, message: string, subjectId: string) => {
    const newLog = { id: Math.random().toString(36), timestamp: new Date().toISOString(), type, message, subjectId };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const enrichDossier = async (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    
    addToast("Synthesizing Neural Intelligence...", "info");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Profile Data: ${JSON.stringify(profile)}. Metrics: ${JSON.stringify(profile.metrics)}. 
            Task: 1. Write a professional 3-sentence scouting dossier. 
            2. Calculate an 'Ironman Coefficient' (0.0 to 1.0) based on versatility and metric balance.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intel: { type: Type.STRING },
                        ic: { type: Type.NUMBER }
                    },
                    required: ["intel", "ic"]
                }
            }
        });
        
        const data = JSON.parse(response.text);
        updateProfile(id, { 
            aiIntel: data.intel, 
            ironmanCoefficient: data.ic 
        });
        addToast("Personnel Dossier Enriched.", "success");
    } catch (e) {
        addToast("Neural Link Failure.", "error");
    }
  };

  const calculateRosterHealth = (f: Franchise): RosterHealth => {
    const roster = profiles.filter(p => p.assignedFranchise === f && p.role === Role.PLAYER);
    const posCounts = roster.reduce((acc: any, p) => {
        p.positions.forEach(pos => acc[pos] = (acc[pos] || 0) + 1);
        return acc;
    }, {});

    const gaps: string[] = [];
    if (!posCounts['QB']) gaps.push('CRITICAL: Primary QB Node missing');
    if ((posCounts['OL'] || 0) < 4) gaps.push('URGENT: Wall Node density low (<4 OL)');
    if ((posCounts['DB'] || 0) < 3) gaps.push('STRATEGIC: Secondary coverage below threshold');

    const score = Math.max(0, 100 - (gaps.length * 25));
    
    return {
        integrityScore: score,
        gaps,
        recommendations: gaps.length > 0 ? ["Acquire Tier 2 depth immediately.", "Evaluate Ironman conversion for current assets."] : ["Roster balanced. Optimize T1 utilization."]
    };
  };

  const generateHypeAsset = async (pid: string) => {
     addToast("Synthesizing Social Node Asset...", "info");
     await new Promise(r => setTimeout(r, 1500));
     updateProfile(pid, { 
         hypeAssetUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop' 
     });
     addToast("Draft Card Synthesized.", "success");
  };

  const addProfile = async (p: Profile): Promise<boolean> => {
    try {
      setProfiles(prev => [p, ...prev]);
      logActivity('INDUCTION', `Personnel Node ${p.fullName} Committed.`, p.id);
      return true;
    } catch (e) {
      return false;
    }
  };

  const setDepthChartAssignment = (teamId: string, slotId: string, profileId: string | null) => {
    const targetTeam = INITIAL_TEAMS.find(t => t.id === teamId);
    if (!targetTeam) return;

    setDepthCharts(prev => {
      const teamChart = { ...(prev[teamId] || {}) };
      if (profileId) teamChart[slotId] = profileId;
      else delete teamChart[slotId];
      return { ...prev, [teamId]: teamChart };
    });

    if (profileId) {
        updateProfile(profileId, {
            assignedFranchise: targetTeam.franchise,
            assignedTeam: targetTeam.name,
            status: RecruitingStatus.SIGNED
        });
    }
  };

  const addToast = (message: string, type: any = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  return (
    <AppContext.Provider value={{ 
      profiles, teams: INITIAL_TEAMS, directives, activityLogs, notifications, depthCharts, currentSystemRole, currentUserProfileId, currentUserEmail, isLoggedIn, selectedFranchise,
      login, logout, setView, goBack, updateProfile, addProfile, updateDirective: (id, updates) => setDirectives(prev => prev.map(d => d.id === id ? {...d, ...updates} : d)), 
      addDirective: (d) => setDirectives(prev => [d, ...prev]), 
      proposeContract: (id, amt, notes) => {
          updateProfile(id, { contractOffer: { amount: amt, status: ContractStatus.PENDING_EXECUTIVE, franchise: selectedFranchise, timestamp: new Date().toISOString(), notes } });
          addToast("Proposal Transmitted.", "success");
      },
      resolveContract: (id, status) => {
          updateProfile(id, { 
              contractOffer: { ...profiles.find(px => px.id === id)?.contractOffer!, status },
              status: status === ContractStatus.APPROVED ? RecruitingStatus.OFFER_EXTENDED : RecruitingStatus.NEW_LEAD
          });
          addToast(`Contract ${status}.`, "success");
      },
      signContract: (id) => {
          updateProfile(id, { status: RecruitingStatus.SIGNED, contractOffer: { ...profiles.find(px => px.id === id)?.contractOffer!, status: ContractStatus.SIGNED, signedAt: new Date().toISOString() } });
          addToast("Contract Execution Complete.", "success");
      },
      logActivity, addToast, addNotification, markNotificationRead: (id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n)), setDepthChartAssignment,
      sendMessage: (text, chanId) => {
        const msg: ChatMessage = { id: Math.random().toString(36), channelId: chanId, senderId: currentUserProfileId || 'admin', senderName: currentUserEmail || 'Admin', senderRole: currentSystemRole, text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, msg]);
      }, 
      setSelectedFranchise, activeChannelId, setActiveChannelId, isBooting, isLoading, isSyncing, gradingConfig, activeEvaluationEvent, 
      startEvaluation: (e) => { setActiveEvaluationEvent(e); setView('evaluation'); }, 
      closeEvaluation: () => setActiveEvaluationEvent(null),
      videos, addVideo: (v) => setVideos(prev => [...prev, v]), videoTags, 
      updateVideoTag: (id, updates) => setVideoTags(prev => prev.map(t => t.id === id ? {...t, ...updates} : t)),
      analyzeVideoAi: async () => addToast("Analysis Complete.", "success"), messages, issueBroadcast: (text) => logActivity('BROADCAST', text, 'LEAGUE_COMMAND'),
      generateHypeAsset,
      playbooks: [
          { 
              id: 'pb1', 
              name: 'Standard Arena 50-Node', 
              plays: [
                  { 
                      id: 'p1', name: 'Vertical High-Mo', formation: 'Trip Set', category: 'Pass', description: 'Deep motion crosser targeting the wall zone.', 
                      assignments: [
                          { position: 'QB', objective: 'Lead receiver into wall gap', vector: 'Diagonal-Up' },
                          { position: 'WR', objective: 'High-speed wall clear', vector: 'Vertical' }
                      ] 
                  }
              ], 
              lastUpdated: '2024-Q1' 
          }
      ],
      learningModules: [], runTacticalSim: async () => {}, translateIntel: async (t) => t, summarizeVoucher: async () => "Summary ready.", 
      enrichDossier, 
      aiScoutSearch: async () => [], 
      toggleComparison: (id) => setComparisonIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 2)), 
      comparisonIds, runAiRosterStrategy: async () => "Strategy optimized.", runMockDraft: async () => "Draft complete.", syncWithVault,
      calculateRosterHealth
    }}>
      {isBooting && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center font-mono p-6">
           <svg className="h-24 animate-pulse" viewBox="0 0 240 80" fill="none"><path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/><text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic">IAL</text></svg>
           <p className="text-league-accent font-black tracking-[0.5em] uppercase text-xs mt-8">Initializing Core Vault v8</p>
        </div>
      )}

      <div className="min-h-screen bg-league-bg text-league-fg font-sans flex flex-col relative overflow-hidden">
        <Header currentView={view} setView={setView} />
        <main className={`flex-grow ${view === 'landing' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
          {!isLoading && view !== 'landing' && (
            <button onClick={goBack} className="group flex items-center gap-2 px-4 py-2 mb-6 bg-league-panel border border-league-border rounded-xl text-[10px] font-black uppercase tracking-widest text-league-muted hover:text-white transition-all">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>Back
            </button>
          )}
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
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
