
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
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule, OnboardingTask, Document, BroadcastDirective } from './types';
import { GoogleGenAI } from "@google/genai";

const INITIAL_PROFILES: Profile[] = [
  { id: 'n1', fullName: 'Marcus Thorne', email: 'm.thorne@ial.uk', phone: '+44 7700 900001', dateOfBirth: '1998-05-22', nationality: 'United Kingdom', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.ZURICH, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF }, createdAt: '2024-01-10', scoutGrade: 9.2, positions: ['LB', 'JACK'], personalBio: "Former D1 linebacker with professional arena experience. Elite at reading fly-motion.", metrics: { speed: 8, strength: 10, agility: 8, iq: 10, versatility: 9 }, isIronmanPotential: true, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.NOTTINGHAM, assignedTeam: 'Hoods', draftReadiness: 100, avatar_url: 'https://i.pravatar.cc/150?u=n1', capHit: 850000 },
  { id: 'n2', fullName: 'Dante Rossi', email: 'd.rossi@ial.it', phone: '+39 312 456 7890', dateOfBirth: '1999-11-04', nationality: 'Italy', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.ZURICH, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-01-12', scoutGrade: 9.8, positions: ['WR', 'MOTION'], personalBio: "Track star converted to wideout. Vertical leap is officially top 1% of the registry.", metrics: { speed: 10, strength: 6, agility: 10, iq: 8, versatility: 7 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.STUTTGART, assignedTeam: 'Surge', draftReadiness: 100, avatar_url: 'https://i.pravatar.cc/150?u=n2', capHit: 920000 },
  { id: 'n3', fullName: 'Hans Muller', email: 'h.muller@ial.de', phone: '+49 151 2345678', dateOfBirth: '1997-03-15', nationality: 'Germany', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-01-15', scoutGrade: 9.5, positions: ['DL', 'OL'], personalBio: "Ironman specimen. Can anchor the offensive line and then generate elite pressure on the interior DL.", metrics: { speed: 6, strength: 10, agility: 7, iq: 9, versatility: 10 }, isIronmanPotential: true, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.STUTTGART, assignedTeam: 'Surge', draftReadiness: 100, avatar_url: 'https://i.pravatar.cc/150?u=n3', capHit: 880000 },
  { id: 'n4', fullName: 'Jamal Williams', email: 'j.williams@ial.us', phone: '+1 404 555 0199', dateOfBirth: '2000-08-21', nationality: 'USA', role: Role.PLAYER, tier: TalentTier.TIER2, status: RecruitingStatus.SIGNED, preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.STUTTGART, rank4: Franchise.DUSSELDORF, rank5: Franchise.ZURICH }, createdAt: '2024-01-18', scoutGrade: 8.4, positions: ['DB', 'SAFETY'], personalBio: "Hard-hitting safety with elite zone coverage instincts.", metrics: { speed: 8, strength: 7, agility: 8, iq: 9, versatility: 6 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.GLASGOW, draftReadiness: 90, avatar_url: 'https://i.pravatar.cc/150?u=n4', capHit: 550000 },
  { id: 'n5', fullName: 'Erik Jorgensen', email: 'e.jorg@ial.se', phone: '+46 8 123 45 67', dateOfBirth: '1996-12-01', nationality: 'Sweden', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.SIGNED, preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-01-20', scoutGrade: 9.0, positions: ['QB'], personalBio: "Accurate pocket passer with mobility. Played top-tier European ball for 5 seasons.", metrics: { speed: 7, strength: 6, agility: 7, iq: 10, versatility: 5 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.ZURICH, draftReadiness: 95, avatar_url: 'https://i.pravatar.cc/150?u=n5', capHit: 1100000 },
  { id: 'n6', fullName: 'Carlos Mendez', email: 'c.mendez@ial.es', phone: '+34 91 123 4567', dateOfBirth: '1999-05-15', nationality: 'Spain', role: Role.PLAYER, tier: TalentTier.TIER2, status: RecruitingStatus.TRYOUT_INVITED, preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.STUTTGART, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-01-25', scoutGrade: 8.1, positions: ['WR', 'KR'], personalBio: "Electric return specialist. High motor.", metrics: { speed: 9, strength: 5, agility: 9, iq: 7, versatility: 8 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], draftReadiness: 75, avatar_url: 'https://i.pravatar.cc/150?u=n6' },
  { id: 'n7', fullName: 'Liam O\'Shea', email: 'l.oshea@ial.ie', phone: '+353 85 123 4567', dateOfBirth: '1997-11-20', nationality: 'Ireland', role: Role.PLAYER, tier: TalentTier.TIER2, status: RecruitingStatus.PRE_SCREENED, preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.DUSSELDORF, rank4: Franchise.STUTTGART, rank5: Franchise.ZURICH }, createdAt: '2024-01-28', scoutGrade: 7.9, positions: ['K', 'P'], personalBio: "Soccer-style kicker with a 60+ yard range.", metrics: { speed: 6, strength: 7, agility: 6, iq: 8, versatility: 5 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], draftReadiness: 60, avatar_url: 'https://i.pravatar.cc/150?u=n7' },
  { id: 'n8', fullName: 'Sven Lindholm', email: 's.lind@ial.se', phone: '+46 70 987 6543', dateOfBirth: '1995-03-02', nationality: 'Sweden', role: Role.PLAYER, tier: TalentTier.TIER3, status: RecruitingStatus.NEW_LEAD, preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.NOTTINGHAM, rank4: Franchise.GLASGOW, rank5: Franchise.DUSSELDORF }, createdAt: '2024-02-01', scoutGrade: 6.5, positions: ['LB'], personalBio: "Former regional MVP. Developmental project with high upside.", metrics: { speed: 7, strength: 7, agility: 7, iq: 6, versatility: 5 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], draftReadiness: 40, avatar_url: 'https://i.pravatar.cc/150?u=n8' },
  { id: 'n9', fullName: 'Pierre Dubois', email: 'p.dubois@ial.fr', phone: '+33 6 12 34 56 78', dateOfBirth: '1998-08-12', nationality: 'France', role: Role.PLAYER, tier: TalentTier.TIER1, status: RecruitingStatus.OFFER_EXTENDED, preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.STUTTGART, rank3: Franchise.ZURICH, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM }, createdAt: '2024-02-05', scoutGrade: 9.1, positions: ['DL', 'OL'], personalBio: "The 'French Wall'. Massive reach and interior power.", metrics: { speed: 5, strength: 10, agility: 6, iq: 9, versatility: 9 }, isIronmanPotential: true, documents: [], onboardingChecklist: [], draftReadiness: 90, avatar_url: 'https://i.pravatar.cc/150?u=n9' },
  { id: 'n10', fullName: 'Anton Weber', email: 'a.weber@ial.de', phone: '+49 170 111 2233', dateOfBirth: '2001-01-30', nationality: 'Germany', role: Role.PLAYER, tier: TalentTier.TIER2, status: RecruitingStatus.NEW_LEAD, preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-02-10', scoutGrade: 8.3, positions: ['DB', 'MOTION'], personalBio: "Fast twitch athlete. Elite closing speed.", metrics: { speed: 10, strength: 6, agility: 9, iq: 7, versatility: 8 }, isIronmanPotential: true, documents: [], onboardingChecklist: [], draftReadiness: 55, avatar_url: 'https://i.pravatar.cc/150?u=n10' },
  { id: 'n11', fullName: 'Talib Wise', email: 't.wise@ial.com', phone: '+1 312 555 0101', dateOfBirth: '1985-05-15', nationality: 'USA', role: Role.COACH, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.NOTTINGHAM, rank4: Franchise.GLASGOW, rank5: Franchise.DUSSELDORF }, createdAt: '2023-12-01', scoutGrade: 10.0, positions: ['HEAD COACH'], personalBio: "Arena legend. Strategic mastermind behind multiple championships.", metrics: { speed: 5, strength: 5, agility: 5, iq: 10, versatility: 10 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.ZURICH, avatar_url: 'https://i.pravatar.cc/150?u=n11' },
  { id: 'n12', fullName: 'Coach Sarah Miller', email: 's.miller@ial.uk', phone: '+44 7911 123456', dateOfBirth: '1988-10-10', nationality: 'United Kingdom', role: Role.COACH, tier: TalentTier.TIER1, status: RecruitingStatus.PLACED, preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.DUSSELDORF, rank4: Franchise.STUTTGART, rank5: Franchise.ZURICH }, createdAt: '2024-01-05', scoutGrade: 9.5, positions: ['OFFENSIVE COORDINATOR'], personalBio: "Pioneer in vertical arena schemes. High tactical IQ.", metrics: { speed: 5, strength: 5, agility: 5, iq: 10, versatility: 8 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.NOTTINGHAM, avatar_url: 'https://i.pravatar.cc/150?u=n12' },
  { id: 'n13', fullName: 'Jack Thompson', email: 'j.thompson@ial.uk', phone: '+44 7700 900013', dateOfBirth: '2000-12-12', nationality: 'United Kingdom', role: Role.PLAYER, tier: TalentTier.TIER3, status: RecruitingStatus.NEW_LEAD, preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.DUSSELDORF, rank4: Franchise.STUTTGART, rank5: Franchise.ZURICH }, createdAt: '2024-02-15', scoutGrade: 7.2, positions: ['WR'], personalBio: "Raw speed. Track background.", metrics: { speed: 10, strength: 4, agility: 8, iq: 6, versatility: 5 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], draftReadiness: 30, avatar_url: 'https://i.pravatar.cc/150?u=n13' },
  { id: 'n14', fullName: 'Lukas Meier', email: 'l.meier@ial.ch', phone: '+41 44 123 4567', dateOfBirth: '1996-06-25', nationality: 'Switzerland', role: Role.PLAYER, tier: TalentTier.TIER2, status: RecruitingStatus.SIGNED, preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW }, createdAt: '2024-01-15', scoutGrade: 8.5, positions: ['LB', 'JACK'], personalBio: "The heart of Zurich's defensive project. Disciplined.", metrics: { speed: 7, strength: 8, agility: 8, iq: 9, versatility: 7 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], assignedFranchise: Franchise.ZURICH, draftReadiness: 95, avatar_url: 'https://i.pravatar.cc/150?u=n14' },
  { id: 'n15', fullName: 'Arjun Gupta', email: 'a.gupta@ial.in', phone: '+91 98765 43210', dateOfBirth: '1999-09-09', nationality: 'India', role: Role.PLAYER, tier: TalentTier.TIER3, status: RecruitingStatus.TRYOUT_INVITED, preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.ZURICH, rank4: Franchise.DUSSELDORF, rank5: Franchise.STUTTGART }, createdAt: '2024-02-20', scoutGrade: 6.8, positions: ['DB'], personalBio: "International scholar athlete. High adaptability.", metrics: { speed: 8, strength: 5, agility: 8, iq: 9, versatility: 6 }, isIronmanPotential: false, documents: [], onboardingChecklist: [], draftReadiness: 50, avatar_url: 'https://i.pravatar.cc/150?u=n15' }
];

export type ViewState = 'landing' | 'login' | 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms' | 'academy' | 'athlete-portal' | 'roster-builder' | 'war-room';

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
  const [view, setView] = useState<ViewState>('landing');
  
  // Persistence Initialization
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('IAL_PERSONNEL_REGISTRY');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('IAL_AUDIT_LOG');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist State Changes
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
    setView(role === SystemRole.PLAYER ? 'athlete-portal' : 'landing');
  };

  const logout = () => { setIsLoggedIn(false); setCurrentUserProfileId(null); setView('landing'); };

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
      contents: `Simulate a mock draft for the International Arena League. Using these players: ${JSON.stringify(profiles.map(p => ({id: p.id, name: p.fullName, pos: p.positions, grade: p.scoutGrade})))}. Predict which of the 5 franchises (Nottingham, Glasgow, Düsseldorf, Stuttgart, Zürich) would take them and why. Keep it concise.`
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
      login, logout, setView, updateProfile, deleteProfile, addProfile, logActivity, addToast, sendMessage, setSelectedFranchise,
      activeChannelId, setActiveChannelId, gradingConfig, comparisonIds, toggleComparison, aiScoutSearch, enrichDossier,
      generateHypeAsset, issueBroadcast, runTacticalSim, runAiRosterStrategy, runMockDraft, translateIntel, summarizeVoucher, 
      startEvaluation: (e) => { setActiveEvaluationEvent(e); setView('evaluation'); },
      closeEvaluation: () => { setActiveEvaluationEvent(null); setView('schedule'); },
      activeEvaluationEvent, isPrivacyMode, setPrivacyMode, alertConfigs: { Nottingham: { minRosterSize: 12 }, Glasgow: { minRosterSize: 12 }, Düsseldorf: { minRosterSize: 12 }, Stuttgart: { minRosterSize: 12 }, Zürich: { minRosterSize: 12 } },
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
