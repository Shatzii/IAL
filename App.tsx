
import React, { useState, createContext, useContext, useEffect, useMemo, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, LeagueEvent, GradingConfig, Playbook, LearningModule, Team, Video, VideoTag, ExecutiveDirective, ContractStatus, Notification, RosterHealth, SessionMetadata, AuditActionType } from './types';

// Lazy load heavy components for performance
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const RegistrationForm = lazy(() => import('./components/RegistrationForm').then(m => ({ default: m.RegistrationForm })));
const Profiles = lazy(() => import('./components/Profiles').then(m => ({ default: m.Profiles })));
const Schedule = lazy(() => import('./components/Schedule').then(m => ({ default: m.Schedule })));
const DraftBoard = lazy(() => import('./components/DraftBoard').then(m => ({ default: m.DraftBoard })));
const FranchiseAdmin = lazy(() => import('./components/FranchiseAdmin').then(m => ({ default: m.FranchiseAdmin })));
const ComparisonView = lazy(() => import('./components/ComparisonView').then(m => ({ default: m.ComparisonView })));
const Pipeline = lazy(() => import('./components/Pipeline').then(m => ({ default: m.Pipeline })));
const CombineEvaluation = lazy(() => import('./components/CombineEvaluation').then(m => ({ default: m.CombineEvaluation })));
const CommsCenter = lazy(() => import('./components/CommsCenter').then(m => ({ default: m.CommsCenter })));
const Academy = lazy(() => import('./components/Academy').then(m => ({ default: m.Academy })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const AthletePortal = lazy(() => import('./components/AthletePortal').then(m => ({ default: m.AthletePortal })));
const RosterBuilder = lazy(() => import('./components/RosterBuilder').then(m => ({ default: m.RosterBuilder })));
const WarRoom = lazy(() => import('./components/WarRoom').then(m => ({ default: m.WarRoom })));
const CoachDashboard = lazy(() => import('./components/CoachDashboard').then(m => ({ default: m.CoachDashboard })));
const ContractStructures = lazy(() => import('./components/ContractStructures').then(m => ({ default: m.ContractStructures })));
const TeamFilmRoom = lazy(() => import('./components/TeamFilmRoom').then(m => ({ default: m.TeamFilmRoom })));
const AICommandNode = lazy(() => import('./components/AICommandNode').then(m => ({ default: m.AICommandNode })));
const SecurityHub = lazy(() => import('./components/SecurityHub').then(m => ({ default: m.SecurityHub })));

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
  },
  {
    id: 'HC-NOT-01',
    fullName: 'Marcus Sterling',
    email: 'nottingham@coach.ial.com',
    phone: '+44 7700 900123',
    dateOfBirth: '1975-08-22',
    nationality: 'United Kingdom',
    role: Role.COACH,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.DUSSELDORF, rank4: Franchise.STUTTGART, rank5: Franchise.ZURICH },
    createdAt: new Date().toISOString(),
    positions: ['HC', 'OC'],
    metrics: { speed: 3, strength: 4, agility: 3, iq: 9, versatility: 8 },
    scoutGrade: 9.6,
    isIronmanPotential: false,
    assignedFranchise: Franchise.NOTTINGHAM,
    assignedTeam: 'Hoods',
    documents: [],
    onboardingChecklist: [],
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop',
    needsHousing: false,
    personalBio: "Former European pro league champion with 15 years tactical experience."
  }
];

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
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  addProfile: (p: Profile) => Promise<boolean>;
  logActivity: (type: AuditActionType | string, message: string, subjectId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  setSelectedFranchise: (f: Franchise) => void;
  setDepthChartAssignment: (teamId: string, slotId: string, profileId: string | null) => void;
  isLoading: boolean;
  maskPII: (text: string, force?: boolean) => string;
  comparisonIds: string[];
  toggleComparison: (id: string) => void;
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
  const view = viewHistory[viewHistory.length - 1];

  const setView = (v: ViewState) => {
    if (v === view) return;
    setIsLoading(true);
    // Reduced transition delay for snappier feel
    setTimeout(() => {
      setViewHistory(prev => [...prev, v]);
      setIsLoading(false);
    }, 150);
  };

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('IAL_CORE_VAULT_v8');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(() => {
    return (localStorage.getItem('IAL_ROLE') as SystemRole) || SystemRole.PLAYER;
  });

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('IAL_USER_EMAIL'));
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(() => localStorage.getItem('IAL_USER_PID'));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!sessionStorage.getItem('IAL_ACTIVE_HANDSHAKE'));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [toasts, setToasts] = useState<any[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { localStorage.setItem('IAL_CORE_VAULT_v8', JSON.stringify(profiles)); }, [profiles]);

  const logActivity = (type: AuditActionType | string, message: string, subjectId: string) => {
    const actorId = currentUserProfileId || 'SYSTEM_DAEMON';
    const timestamp = new Date().toISOString();
    const hash = btoa(`${timestamp}|${type}|${message}|${actorId}`).substr(0, 16).toUpperCase();
    const newLog: ActivityLog = { id: Math.random().toString(36).substr(2, 9), timestamp, type, message, subjectId, actorId, hash };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const login = (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => {
    const session: SessionMetadata = {
        token: `jwt_${Math.random().toString(36).substr(2, 20)}`,
        expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
        ipAddress: '192.168.1.1',
        mfaVerified: true,
        deviceId: 'IAL-SECURE-NODE-01'
    };
    
    sessionStorage.setItem('IAL_ACTIVE_HANDSHAKE', JSON.stringify(session));
    setIsLoggedIn(true);
    setCurrentSystemRole(role);
    setCurrentUserEmail(email);
    if (franchise) setSelectedFranchise(franchise);
    if (profileId) setCurrentUserProfileId(profileId);
    
    logActivity(AuditActionType.AUTHENTICATION, `Handshake successful for role: ${role}`, email);
    
    if (role === SystemRole.PLAYER) setView('athlete-portal');
    else if (role === SystemRole.COACH_STAFF) setView('coach-dashboard');
    else if (role === SystemRole.FRANCHISE_GM) setView('franchise-admin');
    else if (role === SystemRole.LEAGUE_ADMIN) setView('admin');
    else setView('landing');
  };

  const logout = () => { 
    setIsLoggedIn(false); 
    sessionStorage.removeItem('IAL_ACTIVE_HANDSHAKE');
    setViewHistory(['landing']); 
  };

  const addToast = (message: string, type: any = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  // Memoized provider value to prevent child re-renders on every tiny state change
  const providerValue = useMemo(() => ({
    profiles, teams: [], directives: [], activityLogs, currentSystemRole, currentUserProfileId, currentUserEmail, isLoggedIn, selectedFranchise,
    login, logout, setView, updateProfile: (id: string, u: any) => setProfiles(p => p.map(x => x.id === id ? {...x, ...u} : x)),
    addProfile: async (p: any) => { setProfiles(prev => [p, ...prev]); return true; },
    logActivity, addToast, setSelectedFranchise, setDepthChartAssignment: () => {}, isLoading,
    maskPII: (text: string) => text.includes('@') ? text.charAt(0) + '***@***' : '***',
    comparisonIds, toggleComparison: (id: string) => setComparisonIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id].slice(0, 2))
  }), [profiles, activityLogs, currentSystemRole, isLoggedIn, selectedFranchise, isLoading, comparisonIds]);

  if (isBooting) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
       <svg className="h-16 animate-pulse" viewBox="0 0 240 80" fill="none"><path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/><text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic">IAL</text></svg>
       <div className="w-48 h-1 bg-white/5 rounded-full mt-8 overflow-hidden"><div className="h-full bg-league-accent animate-[loading_1s_ease-in-out_infinite]" style={{width: '30%'}} /></div>
       <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  );

  return (
    <AppContext.Provider value={providerValue}>
      <div className="min-h-screen bg-league-bg text-league-fg font-sans flex flex-col relative overflow-hidden">
        {toasts.map(t => (
          <div key={t.id} className={`fixed top-24 right-8 z-[1000] px-6 py-3 rounded-xl border font-black uppercase text-[10px] shadow-2xl animate-in slide-in-from-right-10 ${t.type === 'success' ? 'bg-league-ok/20 border-league-ok text-league-ok' : t.type === 'error' ? 'bg-league-accent/20 border-league-accent text-league-accent' : 'bg-league-blue/20 border-league-blue text-league-blue'}`}>
             {t.message}
          </div>
        ))}
        <Header currentView={view} setView={setView} />
        <main className={`flex-grow ${view === 'landing' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
          <Suspense fallback={<ViewSkeleton />}>
            <div className={`${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`}>
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
          </Suspense>
        </main>
      </div>
    </AppContext.Provider>
  );
};

const ViewSkeleton = () => (
  <div className="space-y-8 animate-pulse p-4">
    <div className="h-12 bg-white/5 rounded-2xl w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-white/5 rounded-[2.5rem]" />
      ))}
    </div>
  </div>
);

export default App;
