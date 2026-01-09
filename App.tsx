
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
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule } from './types';
import { GoogleGenAI } from "@google/genai";

const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb_offense_universal',
    name: 'Universal Arena Offensive Scheme v2.1',
    lastUpdated: '2024-03-15',
    plays: [
      { 
        id: 'p1', 
        name: 'Thunder Motion Slant', 
        formation: 'A-Spread (Motion Right)', 
        category: 'Offense', 
        description: 'The Motion Receiver (Z) breaks at full speed towards the line. If the Jack LB steps up, look for the quick slant behind. If the Mac LB drops, look for the deep out.',
        publishedAt: '2024-03-01' 
      },
      { 
        id: 'p2', 
        name: 'Net Recovery Bubble', 
        formation: 'Trips Right', 
        category: 'Offense', 
        description: 'Intentional high-arc throw towards the rebound nets. The X-receiver is coached to time the bounce for a secondary recovery catch.',
        publishedAt: '2024-03-02' 
      }
    ]
  }
];

const INITIAL_MODULES: LearningModule[] = [
  {
    id: 'm1',
    title: 'Tactics: The 50-Yard War',
    description: 'Mastering the unique rules: The Rebound Net, The Motion, and Ironman Substitution.',
    category: 'Tactics',
    thumbnailUrl: '',
    lessons: [
      { id: 'l1', title: 'Scoring off the Net', contentType: 'Video', durationMins: 12 }
    ]
  }
];

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'n1',
    fullName: 'Marcus Thorne',
    email: 'm.thorne@ial.uk',
    phone: '+44 7700 900001',
    dateOfBirth: '1998-05-22',
    nationality: 'United Kingdom',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PRE_SCREENED,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.ZURICH, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-01-10',
    scoutGrade: 9.9,
    positions: ['LB', 'JACK'],
    personalBio: "Former D1 linebacker with professional arena experience. Elite at reading fly-motion.",
    metrics: { speed: 8, strength: 10, agility: 8, iq: 10, versatility: 9 },
    isIronmanPotential: true,
    avatar_url: '',
    location: { lat: 52.9548, lng: -1.1581 },
    documents: [],
    onboardingChecklist: [],
    combineResults: [],
    assignedFranchise: Franchise.NOTTINGHAM
  },
  {
    id: 'n2',
    fullName: 'Lukas Weber',
    email: 'l.weber@ial.de',
    phone: '+49 151 1234567',
    dateOfBirth: '1999-11-04',
    nationality: 'Germany',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.STUTTGART, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-02-12',
    scoutGrade: 8.5,
    positions: ['QB'],
    personalBio: "Precision passer with high football IQ. Prefers quick release offensive schemes.",
    metrics: { speed: 6, strength: 7, agility: 7, iq: 10, versatility: 6 },
    isIronmanPotential: false,
    avatar_url: '',
    location: { lat: 51.2277, lng: 6.7735 },
    documents: [],
    onboardingChecklist: [],
    combineResults: [],
    assignedFranchise: Franchise.DUSSELDORF
  },
  {
    id: 'n3',
    fullName: 'Callum McLoud',
    email: 'c.mcloud@ial.scot',
    phone: '+44 7800 123456',
    dateOfBirth: '2001-03-15',
    nationality: 'Scotland',
    role: Role.PLAYER,
    tier: TalentTier.TIER3,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.STUTTGART, rank4: Franchise.DUSSELDORF, rank5: Franchise.ZURICH },
    createdAt: '2024-03-01',
    scoutGrade: 7.2,
    positions: ['WR', 'DB'],
    personalBio: "Young, fast, and aggressive. Developing route running but elite ball skills.",
    metrics: { speed: 9, strength: 5, agility: 9, iq: 6, versatility: 8 },
    isIronmanPotential: true,
    avatar_url: '',
    location: { lat: 55.8642, lng: -4.2518 },
    documents: [],
    onboardingChecklist: [],
    combineResults: []
  },
  {
    id: 'n4',
    fullName: 'Alistair Vane',
    email: 'a.vane@ial.ch',
    phone: '+41 44 123 45 67',
    dateOfBirth: '1995-08-20',
    nationality: 'Switzerland',
    role: Role.COACH,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.DUSSELDORF, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2023-12-05',
    scoutGrade: 9.5,
    positions: ['OC', 'Head Coach'],
    personalBio: "Strategic mastermind with multiple European titles. Specialized in rebound net tactics.",
    metrics: { speed: 3, strength: 3, agility: 3, iq: 10, versatility: 7 },
    isIronmanPotential: false,
    avatar_url: '',
    location: { lat: 47.3769, lng: 8.5417 },
    documents: [],
    onboardingChecklist: [],
    combineResults: [],
    assignedFranchise: Franchise.ZURICH
  }
];

export type ViewState = 'landing' | 'login' | 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms' | 'academy';

interface AppState {
  profiles: Profile[];
  activityLogs: ActivityLog[];
  currentSystemRole: SystemRole;
  currentUserProfileId: string | null; 
  isPrivacyMode: boolean;
  messages: ChatMessage[];
  selectedFranchise: Franchise;
  isLoggedIn: boolean;
  login: (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => void;
  logout: () => void;
  setSelectedFranchise: (f: Franchise) => void;
  setPrivacyMode: (val: boolean) => void;
  setCurrentSystemRole: (role: SystemRole) => void;
  setCurrentUserProfileId: (id: string | null) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  addProfile: (p: Profile) => void;
  deleteProfile: (id: string) => void;
  logActivity: (type: string, message: string, subjectId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  aiScoutSearch: (query: string) => Promise<string[] | null>;
  sendMessage: (text: string, channelId: string, recipientId?: string) => void;
  alertConfigs: Record<Franchise, { minRosterSize: number }>;
  startEvaluation: (event: LeagueEvent) => void;
  runAiRosterStrategy: (franchise: Franchise) => Promise<string>;
  comparisonIds: string[];
  toggleComparison: (id: string) => void;
  activeEvaluationEvent: LeagueEvent | null;
  closeEvaluation: () => void;
  gradingConfig: GradingConfig;
  setView: (v: ViewState) => void;
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  playbooks: Playbook[];
  learningModules: LearningModule[];
}

export const AppContext = createContext<AppState | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(SystemRole.PLAYER);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [isPrivacyMode, setPrivacyMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [activeEvaluationEvent, setActiveEvaluationEvent] = useState<LeagueEvent | null>(null);
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [playbooks] = useState<Playbook[]>(INITIAL_PLAYBOOKS);
  const [learningModules] = useState<LearningModule[]>(INITIAL_MODULES);

  const login = (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => {
    setIsLoggedIn(true);
    setCurrentSystemRole(role);
    if (franchise) setSelectedFranchise(franchise);
    if (profileId) setCurrentUserProfileId(profileId);
    
    logActivity('AUTH', `Personnel session initialized for ${email} as ${role}`, 'auth-node');
    addToast(`Session Authorized: Welcome, ${role}`, 'success');
    setView('landing');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentSystemRole(SystemRole.PLAYER);
    setCurrentUserProfileId(null);
    logActivity('AUTH', `Personnel session terminated`, 'auth-node');
    setView('landing');
  };

  const alertConfigs: Record<Franchise, { minRosterSize: number }> = useMemo(() => ({
    [Franchise.NOTTINGHAM]: { minRosterSize: 20 },
    [Franchise.GLASGOW]: { minRosterSize: 20 },
    [Franchise.DUSSELDORF]: { minRosterSize: 20 },
    [Franchise.STUTTGART]: { minRosterSize: 20 },
    [Franchise.ZURICH]: { minRosterSize: 20 },
  }), []);

  const gradingConfig: GradingConfig = useMemo(() => ({
    speedWeight: 1.0,
    strengthWeight: 0.8,
    agilityWeight: 0.9,
    iqWeight: 1.2,
    versatilityWeight: 0.7
  }), []);

  const addToast = (message: string, type: any = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addProfile = (p: Profile) => {
    setProfiles(prev => [...prev, p]);
    logActivity('REGISTRATION', `New profile registered: ${p.fullName}`, p.id);
    logActivity('USER_CREATED', `Account provisioned for ${p.fullName}`, p.id);
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const logActivity = (type: string, message: string, subjectId: string) => {
    setActivityLogs(prev => [{ id: Math.random().toString(36), timestamp: new Date().toISOString(), type, message, subjectId }, ...prev].slice(0, 50));
  };

  const sendMessage = (text: string, channelId: string, recipientId?: string) => {
    const senderProfile = profiles.find(p => p.id === currentUserProfileId);
    const msg: ChatMessage = { 
      id: Math.random().toString(36), 
      senderId: currentUserProfileId || 'system-admin', 
      senderName: senderProfile?.fullName || currentSystemRole, 
      senderRole: currentSystemRole,
      text, 
      timestamp: new Date().toISOString(), 
      channelId,
      recipientId
    };
    setMessages(prev => [...prev, msg]);
  };

  const aiScoutSearch = async (query: string): Promise<string[] | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = profiles.map(p => ({ id: p.id, name: p.fullName, pos: p.positions, tier: p.tier, grade: p.scoutGrade, nationality: p.nationality }));
      const prompt = `Filter these profiles: ${JSON.stringify(context)}. Query: "${query}". Return ONLY a JSON array of matching IDs. No text. Example: ["n1", "n2"]`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      const match = response.text.match(/\[.*\]/s);
      return match ? JSON.parse(match[0]) : null;
    } catch (e) {
      console.error(e);
      addToast("AI Scout Intelligence Offline", "error");
      return null;
    }
  };

  const runAiRosterStrategy = async (franchise: Franchise): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const roster = profiles.filter(p => p.assignedFranchise === franchise);
      const prompt = `Analyze this roster for the ${franchise} franchise: ${JSON.stringify(roster)}. Provide a one-sentence strategic gap analysis focusing on positions and talent tiers.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      return response.text || "No insights available.";
    } catch (e) {
      return "Strategic analysis offline.";
    }
  };

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const startEvaluation = (event: LeagueEvent) => {
    setActiveEvaluationEvent(event);
    setView('evaluation');
  };

  const closeEvaluation = () => {
    setActiveEvaluationEvent(null);
    setView('schedule');
  };

  useEffect(() => {
    const color = FRANCHISE_COLORS[selectedFranchise];
    document.documentElement.style.setProperty('--franchise-accent', color);
  }, [selectedFranchise]);

  return (
    <AppContext.Provider value={{ 
      profiles, activityLogs, currentSystemRole, currentUserProfileId, isPrivacyMode, messages, selectedFranchise, isLoggedIn, login, logout,
      setSelectedFranchise, setPrivacyMode, setCurrentSystemRole, setCurrentUserProfileId, updateProfile, addProfile, deleteProfile, logActivity, 
      addToast, aiScoutSearch, sendMessage, alertConfigs, startEvaluation, runAiRosterStrategy, comparisonIds, toggleComparison, activeEvaluationEvent, 
      closeEvaluation, gradingConfig, setView, activeChannelId, setActiveChannelId, playbooks, learningModules
    }}>
      <style>{`
        :root { --franchise-accent: #e41d24; }
        .bg-franchise { background-color: var(--franchise-accent); }
        .text-franchise { color: var(--franchise-accent); }
        .border-franchise { border-color: var(--franchise-accent); }
      `}</style>
      <div className="min-h-screen bg-league-bg text-league-fg font-sans selection:bg-league-accent flex flex-col">
        <Header currentView={view} setView={setView} />
        <main className={`flex-grow ${view === 'landing' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
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
        </main>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className={`px-6 py-3 rounded-full border shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-3 backdrop-blur-md pointer-events-auto bg-black/80 border-white/10`}>
              <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-league-ok shadow-[0_0_10px_#23d18b]' : toast.type === 'error' ? 'bg-league-accent shadow-[0_0_10px_#e41d24]' : 'bg-league-blue shadow-[0_0_10px_#40a9ff]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
