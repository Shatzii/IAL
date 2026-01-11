
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
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule, OnboardingTask, Document, BroadcastDirective, Team, Video, VideoTag, VideoStatus, VideoSourceType } from './types';
import { GoogleGenAI, Type } from "@google/genai";

export type ViewState = 'landing' | 'login' | 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms' | 'academy' | 'athlete-portal' | 'roster-builder' | 'war-room' | 'coach-dashboard' | 'contract-structure' | 'film-room';

const INITIAL_TEAMS: Team[] = [
  { id: 'team-nott-1', name: 'Nottingham Hoods', franchise: Franchise.NOTTINGHAM, rosterIds: ['str-4', 'str-0'], coachIds: ['jeff.hunt@nottingham.ial.com', 'nottingham@coach.ial.com'] },
  { id: 'team-zuri-1', name: 'Zurich Guards', franchise: Franchise.ZURICH, rosterIds: [], coachIds: ['talib.wise@zurich.ial.com'] },
  { id: 'team-glas-1', name: 'Glasgow Tigers', franchise: Franchise.GLASGOW, rosterIds: [], coachIds: ['phil.garcia@glasgow.ial.com'] },
  { id: 'team-duss-1', name: 'Düsseldorf Panthers', franchise: Franchise.DUSSELDORF, rosterIds: [], coachIds: ['chris.mckinny@dusseldorf.ial.com'] },
  { id: 'team-stut-1', name: 'Stuttgart Surge', franchise: Franchise.STUTTGART, rosterIds: [], coachIds: ['keith.hill@stuttgart.ial.com'] }
];

const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    teamId: 'team-nott-1',
    uploadedByUserId: 'coach-1',
    title: 'Nottingham Q1 Game Film - vs London',
    description: 'Offensive series 1-4 from opening day.',
    sourceType: VideoSourceType.GAME,
    status: VideoStatus.READY,
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    durationSeconds: 596,
    createdAt: '2024-03-01',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=300&h=200&fit=crop'
  }
];

const INITIAL_TAGS: VideoTag[] = [
  { id: 'tag-1', videoId: 'vid-1', source: 'coach', tStartMs: 12000, tEndMs: 15000, label: 'pocket_movement', note: 'Great step up to avoid pressure.', approved: true, createdAt: '2024-03-01' }
];

const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-global-1',
    name: 'IAL Base Arena Schemes',
    lastUpdated: '2024-03-10',
    plays: [
      { id: 'play-1', name: 'Wall Stutter', formation: 'Trips Wall', category: 'Pass', description: 'Primary WR uses wall stutter to clear the corner.' },
      { id: 'play-2', name: 'High Motion Mesh', formation: 'Spread 2x2', category: 'Pass', description: 'Vertical high motion to pull LB out of the box.' }
    ]
  }
];

const INITIAL_LEARNING_MODULES: LearningModule[] = [
  { id: 'lm1', title: 'Ironman Substitution Logic', description: 'Mastering the dual-role transition in high-speed arena environments.', category: 'Tactics', lessons: [{id: 'l1', title: 'The 20-Second Personnel Switch', durationMins: 12}] }
];

const INITIAL_PROFILES: Profile[] = [
  { id: 'str-4', fullName: 'Reilly Hennessey', email: 'r.hennessey@stuttgart-surge.de', phone: '0', dateOfBirth: '1995-12-07', nationality: 'USA', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.ZURICH, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-01-01', scoutGrade: 9.8, positions: ['QB'], personalBio: "All-Star Quarterback. Lead Stuttgart to the championship game.", metrics: { speed: 7, strength: 7, agility: 8, iq: 10, versatility: 6 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.NOTTINGHAM, assignedTeam: 'Hoods', avatar_url: 'https://i.pravatar.cc/150?u=str-4' },
  { id: 'str-0', fullName: 'Tomiwa Oyewo', email: 't.oyewo@stuttgart-surge.de', phone: '0', dateOfBirth: '1998-01-01', nationality: 'Ireland', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM }, createdAt: '2024-01-01', positions: ['RB'], height_cm: 180, weight_kg: 95, metrics: { speed: 9, strength: 8, agility: 9, iq: 8, versatility: 7 }, isIronmanPotential: true, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.NOTTINGHAM, assignedTeam: 'Hoods', avatar_url: 'https://i.pravatar.cc/150?u=str-0' }
];

interface AppState {
  profiles: Profile[];
  teams: Team[];
  videos: Video[];
  videoTags: VideoTag[];
  activityLogs: ActivityLog[];
  currentSystemRole: SystemRole;
  currentUserProfileId: string | null; 
  currentUserEmail: string | null;
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
  addVideo: (v: Video) => void;
  addVideoTag: (t: VideoTag) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  updateVideoTag: (id: string, updates: Partial<VideoTag>) => void;
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
  issueBroadcast: (message: string, priority: 'CRITICAL' | 'STANDARD') => void;
  runTacticalSim: (playId: string) => Promise<void>;
  runAiRosterStrategy: (franchise: Franchise) => Promise<string>;
  runMockDraft: () => Promise<string>;
  translateIntel: (text: string, lang: string) => Promise<string>;
  summarizeVoucher: (id: string) => Promise<string>;
  analyzeVideoAi: (videoId: string) => Promise<void>;
  startEvaluation: (event: LeagueEvent) => void;
  closeEvaluation: () => void;
  activeEvaluationEvent: LeagueEvent | null;
  isPrivacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  alertConfigs: any;
  playbooks: Playbook[];
  learningModules: LearningModule[];
  isBooting: boolean;
  isLoading: boolean;
}

export const AppContext = createContext<AppState | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const LoadingLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 45C10 25 25 15 45 15C65 15 75 25 75 45V60H10V45Z" fill="#e41d24"/>
    <path d="M35 15V45M55 15V45" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <rect x="18" y="52" width="50" height="6" rx="1" fill="#111" stroke="white" strokeWidth="1"/>
    <text x="85" y="58" fill="white" fontSize="52" fontWeight="900" fontStyle="italic" fontFamily="Inter, sans-serif">IAL</text>
    <rect x="85" y="32" width="70" height="5" fill="#e41d24" />
    <text x="85" y="74" fill="white" fontSize="8" fontWeight="900" letterSpacing="3" fontFamily="Inter, sans-serif" opacity="0.8">INTERNATIONAL ARENA LEAGUE</text>
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
    const saved = localStorage.getItem('IAL_PERSONNEL_REGISTRY');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('IAL_AUDIT_LOG');
    return saved ? JSON.parse(saved) : [];
  });

  // Database Persistence Synchronization
  useEffect(() => {
    localStorage.setItem('IAL_PERSONNEL_REGISTRY', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('IAL_AUDIT_LOG', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [videoTags, setVideoTags] = useState<VideoTag[]>(INITIAL_TAGS);
  const [playbooks] = useState<Playbook[]>(INITIAL_PLAYBOOKS);
  const [learningModules] = useState<LearningModule[]>(INITIAL_LEARNING_MODULES);
  
  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(SystemRole.PLAYER);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastDirective[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  
  const toggleComparison = (id: string) => {
    setComparisonIds(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id) 
        : (prev.length < 2 ? [...prev, id] : prev)
    );
  };

  const [activeEvaluationEvent, setActiveEvaluationEvent] = useState<LeagueEvent | null>(null);
  const [isPrivacyMode, setPrivacyMode] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const gradingConfig: GradingConfig = useMemo(() => ({
    speedWeight: 1.0, strengthWeight: 0.8, agilityWeight: 0.9, iqWeight: 1.2, versatilityWeight: 0.7
  }), []);

  const login = (email: string, role: SystemRole, franchise?: Franchise, profileId?: string) => {
    setIsLoggedIn(true);
    setCurrentSystemRole(role);
    setCurrentUserEmail(email);
    if (franchise) setSelectedFranchise(franchise);
    if (profileId) setCurrentUserProfileId(profileId);
    
    if (role === SystemRole.PLAYER) {
      const foundProfile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (foundProfile) {
        setCurrentUserProfileId(foundProfile.id);
        setView('athlete-portal');
      } else {
        setView('register');
      }
    } else if (role === SystemRole.COACH_STAFF) {
      setView('coach-dashboard');
    } else {
      setView('admin');
    }
  };

  const logout = () => { 
    setIsLoggedIn(false); 
    setCurrentUserProfileId(null); 
    setCurrentUserEmail(null);
    setViewHistory(['landing']); 
    addToast("Session Securely Terminated.", "info");
  };

  const logActivity = (type: string, message: string, subjectId: string) => {
    const newLog = { id: Math.random().toString(36), timestamp: new Date().toISOString(), type, message, subjectId };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProfile = (id: string) => setProfiles(prev => prev.filter(p => p.id !== id));
  const addProfile = (p: Profile) => setProfiles(prev => [...prev, p]);

  const addVideo = (v: Video) => setVideos(prev => [v, ...prev]);
  const addVideoTag = (t: VideoTag) => setVideoTags(prev => [...prev, t]);
  const updateVideo = (id: string, updates: Partial<Video>) => setVideos(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  const updateVideoTag = (id: string, updates: Partial<VideoTag>) => setVideoTags(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  
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
    logActivity('BROADCAST', `League-wide directive issued: ${message}`, 'HQ');
  };

  const aiScoutSearch = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: `Find registry IDs matching: ${query}. Available: ${JSON.stringify(profiles.map(p => ({id: p.id, pos: p.positions, grade: p.scoutGrade, name: p.fullName, loc: p.nationality})))}. Return ONLY a JSON array of matching IDs, e.g. ["id1", "id2"].` 
    });
    try {
      const match = response.text.match(/\[.*\]/s);
      return match ? JSON.parse(match[0]) : null;
    } catch { return null; }
  };

  const enrichDossier = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Deep dive enrichment for athlete ${profile.fullName}. Provide competitive intelligence, news, and scouting highlights.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
      title: c.web?.title || 'Intelligence Source', uri: c.web?.uri || '#'
    })) || [];
    updateProfile(profileId, { aiIntel: response.text, aiIntelSources: sources });
  };

  const analyzeVideoAi = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    updateVideo(videoId, { status: VideoStatus.ANALYZING });
    addToast("Neural Strategy Engine Engaged...", "info");

    const team = teams.find(t => t.id === video.teamId);
    const roster = profiles.filter(p => team?.rosterIds.includes(p.id)).map(p => ({ name: p.fullName, pos: p.positions[0] }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: JSON.stringify({
          task: "Generate timestamped tactical field notes for arena football film.",
          taxonomy: ["wall_leverage", "motion_timing", "release", "mac_jack_handover", "rebound_net_play", "decision_speed", "pocket_movement", "explosive_play", "missed_assignment"],
          context: { team: team?.name || "Unknown", roster: roster }
        }),
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tags: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                t_start_ms: { type: Type.NUMBER },
                                t_end_ms: { type: Type.NUMBER },
                                label: { type: Type.STRING },
                                note: { type: Type.STRING },
                                players: { type: Type.ARRAY, items: { type: Type.STRING } },
                                confidence: { type: Type.NUMBER }
                            },
                            required: ["t_start_ms", "t_end_ms", "label", "note"]
                        }
                    }
                }
            }
        }
      });

      const result = JSON.parse(response.text);
      if (result.tags) {
        result.tags.forEach((tag: any) => {
          addVideoTag({
            id: 'ai-tag-' + Math.random().toString(36).substr(2, 5),
            videoId: videoId,
            source: 'ai',
            tStartMs: tag.t_start_ms,
            tEndMs: tag.t_end_ms,
            label: tag.label,
            note: tag.note,
            players: tag.players,
            confidence: tag.confidence,
            approved: false,
            createdAt: new Date().toISOString()
          });
        });
      }
      updateVideo(videoId, { status: VideoStatus.READY });
      addToast("AI Analysis Complete.", "success");
      logActivity('AI_ANALYSIS', `Tactical scan completed for ${video.title}`, videoId);
    } catch (err) {
      console.error(err);
      updateVideo(videoId, { status: VideoStatus.FAILED });
      addToast("AI Node Error.", "error");
    }
  };

  const generateHypeAsset = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    addToast("Synthesizing Neural Asset...", "info");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `High-energy cinematic arena football poster for ${profile.fullName} (${profile.positions[0]}). Neon red lighting, metallic textures, professional sports design.` }] },
      config: { imageConfig: { aspectRatio: "9:16", imageSize: "1K" } }
    });
    const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (part) {
      updateProfile(profileId, { hypeAssetUrl: `data:image/png;base64,${part.inlineData.data}` });
      addToast("Hype Asset Finalized.", "success");
    }
  };

  const runTacticalSim = async (playId: string): Promise<void> => {
    console.debug(`Simulating: ${playId}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const runAiRosterStrategy = async (franchise: Franchise) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze roster for ${franchise} and list 3 recruitment priorities.`
    });
    return response.text || "Strategy offline.";
  };

  const runMockDraft = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Predict top 3 2026 IAL picks."
    });
    return response.text || "Simulation offline.";
  };

  const translateIntel = async (text: string, lang: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate to ${lang}: "${text}"`
    });
    return response.text || text;
  };

  const summarizeVoucher = async (id: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize athlete document ${id} in 2 bullets.`
    });
    return response.text || "Summary unavailable.";
  };

  return (
    <AppContext.Provider value={{ 
      profiles, teams, videos, videoTags, activityLogs, currentSystemRole, currentUserProfileId, currentUserEmail, isLoggedIn, selectedFranchise, messages, broadcasts,
      login, logout, setView, goBack, updateProfile, deleteProfile, addProfile, addVideo, addVideoTag, updateVideo, updateVideoTag, logActivity, addToast, sendMessage, setSelectedFranchise,
      activeChannelId, setActiveChannelId, gradingConfig, comparisonIds, toggleComparison, aiScoutSearch, enrichDossier,
      generateHypeAsset, issueBroadcast, runTacticalSim, runAiRosterStrategy, runMockDraft, translateIntel, summarizeVoucher, analyzeVideoAi,
      startEvaluation: (e) => { setActiveEvaluationEvent(e); setView('evaluation'); },
      closeEvaluation: () => { setActiveEvaluationEvent(null); goBack(); },
      activeEvaluationEvent, isPrivacyMode, setPrivacyMode, alertConfigs: { 
        [Franchise.NOTTINGHAM]: { minRosterSize: 12 }, 
        [Franchise.GLASGOW]: { minRosterSize: 12 }, 
        [Franchise.DUSSELDORF]: { minRosterSize: 12 }, 
        [Franchise.STUTTGART]: { minRosterSize: 12 }, 
        [Franchise.ZURICH]: { minRosterSize: 12 } 
      },
      playbooks, learningModules, isBooting, isLoading
    }}>
      {isBooting && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center font-mono p-6 animate-in fade-in duration-500">
           <LoadingLogo className="h-24 md:h-32 mb-8 animate-pulse" />
           <p className="text-league-accent font-black tracking-[0.5em] animate-pulse">IAL_CORE_BOOT_v2.7</p>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
           <div className="relative animate-bounce duration-1000">
              <LoadingLogo className="h-16 md:h-24" />
           </div>
           <p className="mt-8 text-[10px] font-black uppercase tracking-[0.6em] text-league-accent animate-pulse italic">Syncing Node Cluster...</p>
        </div>
      )}

      <div className="min-h-screen bg-league-bg text-league-fg font-sans selection:bg-league-accent flex flex-col">
        <Header currentView={view} setView={setView} />
        <main className={`flex-grow ${view === 'landing' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
          {!isLoading && view !== 'landing' && (
            <div className="mb-6 flex items-center justify-between">
              <button onClick={goBack} className="group flex items-center gap-2 px-4 py-2 bg-league-panel border border-league-border rounded-xl text-[10px] font-black uppercase tracking-widest text-league-muted hover:text-white transition-all">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7"></path></svg>
                Back
              </button>
            </div>
          )}
          <div className={`${isLoading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-500`}>
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
          </div>
        </main>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="px-6 py-3 rounded-full border shadow-2xl bg-black/80 border-white/10 flex items-center gap-3 pointer-events-auto">
              <div className={`w-2 h-2 rounded-full ${t.type === 'success' ? 'bg-league-ok' : 'bg-league-accent'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
