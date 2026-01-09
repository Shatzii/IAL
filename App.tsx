
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
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, TalentTier, SystemRole, ChatMessage, FRANCHISE_COLORS, LeagueEvent, GradingConfig, Playbook, LearningModule, OnboardingTask, Document } from './types';
import { GoogleGenAI } from "@google/genai";

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
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.ZURICH, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-01-10',
    scoutGrade: 9.2,
    positions: ['LB', 'JACK'],
    personalBio: "Former D1 linebacker with professional arena experience. Elite at reading fly-motion.",
    metrics: { speed: 8, strength: 10, agility: 8, iq: 10, versatility: 9 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.NOTTINGHAM,
    assignedTeam: 'Hoods',
    draftReadiness: 100,
    avatar_url: 'https://i.pravatar.cc/150?u=n1'
  },
  {
    id: 'n2',
    fullName: 'Dante Rossi',
    email: 'd.rossi@ial.it',
    phone: '+39 312 456 7890',
    dateOfBirth: '1999-11-04',
    nationality: 'Italy',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.ZURICH, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-12',
    scoutGrade: 9.8,
    positions: ['WR', 'MOTION'],
    personalBio: "Track star converted to wideout. Vertical leap is officially top 1% of the registry.",
    metrics: { speed: 10, strength: 6, agility: 10, iq: 8, versatility: 7 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.STUTTGART,
    assignedTeam: 'Surge',
    draftReadiness: 100,
    avatar_url: 'https://i.pravatar.cc/150?u=n2'
  },
  {
    id: 'n3',
    fullName: 'Hans Muller',
    email: 'h.muller@ial.de',
    phone: '+49 151 2345678',
    dateOfBirth: '1997-03-15',
    nationality: 'Germany',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-15',
    scoutGrade: 9.5,
    positions: ['DL', 'OL'],
    personalBio: "Ironman specimen. Can anchor the offensive line and then generate elite pressure on the interior DL.",
    metrics: { speed: 6, strength: 10, agility: 7, iq: 9, versatility: 10 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.STUTTGART,
    assignedTeam: 'Surge',
    draftReadiness: 100,
    avatar_url: 'https://i.pravatar.cc/150?u=n3'
  },
  {
    id: 'n4',
    fullName: 'Jamal Williams',
    email: 'j.williams@ial.us',
    phone: '+1 404 555 0199',
    dateOfBirth: '2000-08-21',
    nationality: 'USA',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.STUTTGART, rank4: Franchise.DUSSELDORF, rank5: Franchise.ZURICH },
    createdAt: '2024-01-18',
    scoutGrade: 8.4,
    positions: ['DB', 'SAFETY'],
    personalBio: "Hard-hitting safety with elite zone coverage instincts. Looking to make a mark in the European league.",
    metrics: { speed: 8, strength: 7, agility: 8, iq: 9, versatility: 6 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.GLASGOW,
    draftReadiness: 90,
    avatar_url: 'https://i.pravatar.cc/150?u=n4'
  },
  {
    id: 'n5',
    fullName: 'Erik Jorgensen',
    email: 'e.jorg@ial.se',
    phone: '+46 8 123 45 67',
    dateOfBirth: '1996-12-01',
    nationality: 'Sweden',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-20',
    scoutGrade: 9.0,
    positions: ['QB'],
    personalBio: "Accurate pocket passer with mobility. Played top-tier European ball for 5 seasons.",
    metrics: { speed: 7, strength: 6, agility: 7, iq: 10, versatility: 5 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.ZURICH,
    draftReadiness: 95,
    avatar_url: 'https://i.pravatar.cc/150?u=n5'
  },
  {
    id: 'n6',
    fullName: 'Carlos Mendez',
    email: 'c.mendez@ial.es',
    phone: '+34 91 123 45 67',
    dateOfBirth: '2001-05-10',
    nationality: 'Spain',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.TRYOUT_COMPLETED,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.STUTTGART, rank3: Franchise.ZURICH, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2024-01-22',
    scoutGrade: 7.9,
    positions: ['WR', 'KR'],
    personalBio: "Electric return man with reliable hands. High ceiling in an arena offense.",
    metrics: { speed: 9, strength: 5, agility: 9, iq: 7, versatility: 8 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    draftReadiness: 70,
    avatar_url: 'https://i.pravatar.cc/150?u=n6'
  },
  {
    id: 'n7',
    fullName: 'Kevin O\'Connor',
    email: 'k.oconnor@ial.ie',
    phone: '+353 1 123 4567',
    dateOfBirth: '1995-10-29',
    nationality: 'Ireland',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.ZURICH, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-01-25',
    scoutGrade: 8.1,
    positions: ['OL', 'CENTER'],
    personalBio: "Veteran presence. Reliable anchor with extensive indoor football experience in low-tier leagues.",
    metrics: { speed: 4, strength: 9, agility: 5, iq: 9, versatility: 6 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.GLASGOW,
    draftReadiness: 85,
    avatar_url: 'https://i.pravatar.cc/150?u=n7'
  },
  {
    id: 'n8',
    fullName: 'Liam Smith',
    email: 'l.smith@ial.uk',
    phone: '+44 20 7946 0123',
    dateOfBirth: '1999-02-14',
    nationality: 'United Kingdom',
    role: Role.PLAYER,
    tier: TalentTier.TIER3,
    status: RecruitingStatus.PRE_SCREENED,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.DUSSELDORF, rank4: Franchise.STUTTGART, rank5: Franchise.ZURICH },
    createdAt: '2024-01-28',
    scoutGrade: 6.8,
    positions: ['DB'],
    personalBio: "Developmental talent with raw athletic tools. Needs coaching but shows flashes of elite speed.",
    metrics: { speed: 9, strength: 5, agility: 7, iq: 5, versatility: 5 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    draftReadiness: 50,
    avatar_url: 'https://i.pravatar.cc/150?u=n8'
  },
  {
    id: 'n9',
    fullName: 'Pierre Dubois',
    email: 'p.dubois@ial.fr',
    phone: '+33 1 23 45 67 89',
    dateOfBirth: '1997-09-03',
    nationality: 'France',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.DUSSELDORF, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2024-02-01',
    scoutGrade: 8.2,
    positions: ['LB', 'FB'],
    personalBio: "Versatile athlete who can play the Jack LB position and pull duties as a goal-line FB.",
    metrics: { speed: 7, strength: 8, agility: 7, iq: 8, versatility: 9 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.ZURICH,
    draftReadiness: 88,
    avatar_url: 'https://i.pravatar.cc/150?u=n9'
  },
  {
    id: 'n10',
    fullName: 'Hiroki Tanaka',
    email: 'h.tanaka@ial.jp',
    phone: '+81 90 1234 5678',
    dateOfBirth: '2000-01-12',
    nationality: 'Japan',
    role: Role.PLAYER,
    tier: TalentTier.TIER3,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.ZURICH, rank3: Franchise.STUTTGART, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-02-03',
    scoutGrade: 7.2,
    positions: ['K', 'WR'],
    personalBio: "Specialist kicker with deep range. High-accuracy leg with some background in track.",
    metrics: { speed: 7, strength: 5, agility: 8, iq: 7, versatility: 6 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    draftReadiness: 40,
    avatar_url: 'https://i.pravatar.cc/150?u=n10'
  },
  {
    id: 'n11',
    fullName: 'Andrej Kovac',
    email: 'a.kovac@ial.cz',
    phone: '+420 123 456 789',
    dateOfBirth: '1996-07-07',
    nationality: 'Czech Republic',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.PRE_SCREENED,
    preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.ZURICH, rank3: Franchise.DUSSELDORF, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2024-02-05',
    scoutGrade: 8.0,
    positions: ['OL', 'DL'],
    personalBio: "Physical grinder. Excels in close-quarters combat on the line. Extremely durable.",
    metrics: { speed: 5, strength: 9, agility: 6, iq: 8, versatility: 8 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    draftReadiness: 65,
    avatar_url: 'https://i.pravatar.cc/150?u=n11'
  },
  {
    id: 'n12',
    fullName: 'Lars Nilsson',
    email: 'l.nilsson@ial.no',
    phone: '+47 123 45 678',
    dateOfBirth: '1998-12-25',
    nationality: 'Norway',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.DUSSELDORF, rank3: Franchise.STUTTGART, rank4: Franchise.ZURICH, rank5: Franchise.NOTTINGHAM },
    createdAt: '2024-02-08',
    scoutGrade: 8.5,
    positions: ['QB', 'SAFETY'],
    personalBio: "Former dual-threat college QB with high processing speed. Also capable of playing safety in ironman rotations.",
    metrics: { speed: 8, strength: 7, agility: 8, iq: 9, versatility: 9 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.GLASGOW,
    draftReadiness: 92,
    avatar_url: 'https://i.pravatar.cc/150?u=n12'
  },
  {
    id: 'n13',
    fullName: 'Marco Silva',
    email: 'm.silva@ial.pt',
    phone: '+351 912 345 678',
    dateOfBirth: '2001-08-30',
    nationality: 'Portugal',
    role: Role.PLAYER,
    tier: TalentTier.TIER3,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.DUSSELDORF, rank4: Franchise.ZURICH, rank5: Franchise.STUTTGART },
    createdAt: '2024-02-10',
    scoutGrade: 7.0,
    positions: ['WR', 'DB'],
    personalBio: "Young, hungry wideout. Explosive release off the line. Still learning the arena nuance.",
    metrics: { speed: 9, strength: 5, agility: 8, iq: 6, versatility: 7 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    draftReadiness: 35,
    avatar_url: 'https://i.pravatar.cc/150?u=n13'
  },
  {
    id: 'n14',
    fullName: 'Samual Adebayo',
    email: 's.adebayo@ial.uk',
    phone: '+44 7700 900014',
    dateOfBirth: '1995-04-12',
    nationality: 'United Kingdom',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.NOTTINGHAM, rank3: Franchise.GLASGOW, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-02-12',
    scoutGrade: 9.3,
    positions: ['DL', 'OL'],
    personalBio: "Power lifter strength with surprisingly quick feet. A nightmare for interior guards in the 50-yard game.",
    metrics: { speed: 6, strength: 10, agility: 7, iq: 9, versatility: 8 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.ZURICH,
    draftReadiness: 98,
    avatar_url: 'https://i.pravatar.cc/150?u=n14'
  },
  {
    id: 'n15',
    fullName: 'Jack Thompson',
    email: 'j.thompson@ial.au',
    phone: '+61 412 345 678',
    dateOfBirth: '1999-06-20',
    nationality: 'Australia',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.OFFER_EXTENDED,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.GLASGOW, rank3: Franchise.NOTTINGHAM, rank4: Franchise.ZURICH, rank5: Franchise.STUTTGART },
    createdAt: '2024-02-14',
    scoutGrade: 8.6,
    positions: ['DB', 'WR'],
    personalBio: "Rugby convert. Aggressive tackling with great field vision. Elite catch radius for his size.",
    metrics: { speed: 8, strength: 8, agility: 9, iq: 7, versatility: 9 },
    isIronmanPotential: true,
    documents: [],
    onboardingChecklist: [],
    draftReadiness: 80,
    avatar_url: 'https://i.pravatar.cc/150?u=n15'
  },
  {
    id: 'c1',
    fullName: 'Talib Wise',
    email: 'talib.wise@zurich.ial.com',
    phone: '+41 44 123 4567',
    dateOfBirth: '1982-10-10',
    nationality: 'USA',
    role: Role.COACH,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.DUSSELDORF, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2023-11-01',
    scoutGrade: 10.0,
    positions: ['HEAD COACH'],
    personalBio: "Legendary Arena Football veteran. Officially appointed as Head Coach of Zurich. Master of the Ironman scheme.",
    metrics: { speed: 0, strength: 0, agility: 0, iq: 10, versatility: 10 },
    isIronmanPotential: false,
    documents: [],
    onboardingChecklist: [],
    assignedFranchise: Franchise.ZURICH,
    avatar_url: 'https://i.pravatar.cc/150?u=c1'
  }
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
  playbooks: Playbook[];
  learningModules: LearningModule[];
  aiScoutSearch: (query: string) => Promise<string[] | null>;
  runAiRosterStrategy: (franchise: Franchise) => Promise<string>;
  startEvaluation: (event: LeagueEvent) => void;
  closeEvaluation: () => void;
  activeEvaluationEvent: LeagueEvent | null;
  isPrivacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  alertConfigs: any;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise>(Franchise.NOTTINGHAM);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('chan_global');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [activeEvaluationEvent, setActiveEvaluationEvent] = useState<LeagueEvent | null>(null);
  const [isPrivacyMode, setPrivacyMode] = useState(false);

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

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUserProfileId(null);
    setView('landing');
  };

  const logActivity = (type: string, message: string, subjectId: string) => {
    setActivityLogs(prev => [{ id: Math.random().toString(36), timestamp: new Date().toISOString(), type, message, subjectId }, ...prev].slice(0, 50));
  };

  const handleWorkflowTriggers = (id: string, updates: Partial<Profile>) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    if (updates.status === RecruitingStatus.SIGNED && profile.status !== RecruitingStatus.SIGNED) {
      const onboarding: OnboardingTask[] = [
        { id: 't1', title: 'Countersign Induction Agreement', isCompleted: false, category: 'Legal' },
        { id: 't2', title: 'Submit Medical Clearance', isCompleted: false, category: 'Medical' }
      ];
      const doc: Document = { id: 'd1', name: 'Standard Contract v2026', type: 'Contract', url: '#', scanStatus: 'CLEAN', uploadedAt: new Date().toISOString() };
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, onboardingChecklist: onboarding, documents: [...p.documents, doc] } : p));
      addToast(`Induction packet generated for ${profile.fullName}`, 'success');
      logActivity('WORKFLOW', `Automated induction workflow triggered for ${profile.fullName}`, id);
    }
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    handleWorkflowTriggers(id, updates);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    logActivity('DELETE', `Profile ${id} removed from registry`, id);
  };

  const addProfile = (p: Profile) => setProfiles(prev => [...prev, p]);
  const addToast = (message: string, type: any = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const sendMessage = (text: string, channelId: string, recipientId?: string) => {
    const msg: ChatMessage = { 
      id: Math.random().toString(36), 
      senderId: currentUserProfileId || 'admin', 
      senderName: currentSystemRole, 
      senderRole: currentSystemRole, 
      text, 
      timestamp: new Date().toISOString(), 
      channelId 
    };
    setMessages(prev => [...prev, msg]);
  };

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]);
  };

  const aiScoutSearch = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Identify profiles matching: ${query}. Data: ${JSON.stringify(profiles)}. Return JSON array of IDs.` });
    const match = response.text.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : null;
  };

  const runAiRosterStrategy = async (f: Franchise) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Roster analysis for ${f}: ${JSON.stringify(profiles.filter(p => p.assignedFranchise === f))}. Provide 1 strategic gap.` });
    return response.text;
  };

  return (
    <AppContext.Provider value={{ 
      profiles, activityLogs, currentSystemRole, currentUserProfileId, isLoggedIn, selectedFranchise, messages,
      login, logout, setView, updateProfile, deleteProfile, addProfile, logActivity, addToast, sendMessage, setSelectedFranchise,
      activeChannelId, setActiveChannelId, gradingConfig, comparisonIds, toggleComparison, playbooks: [], learningModules: [],
      aiScoutSearch, runAiRosterStrategy, startEvaluation: (e) => { setActiveEvaluationEvent(e); setView('evaluation'); },
      closeEvaluation: () => { setActiveEvaluationEvent(null); setView('schedule'); },
      activeEvaluationEvent, isPrivacyMode, setPrivacyMode, alertConfigs: { Nottingham: { minRosterSize: 20 }, Glasgow: { minRosterSize: 20 }, Düsseldorf: { minRosterSize: 20 }, Stuttgart: { minRosterSize: 20 }, Zürich: { minRosterSize: 20 } }
    }}>
      <style>{`:root { --franchise-accent: ${FRANCHISE_COLORS[selectedFranchise]}; }`}</style>
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
          {view === 'athlete-portal' && <AthletePortal />}
          {view === 'roster-builder' && <RosterBuilder />}
          {view === 'war-room' && <WarRoom />}
        </main>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className="px-6 py-3 rounded-full border shadow-2xl animate-in slide-in-from-bottom-4 bg-black/80 border-white/10 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-league-ok' : 'bg-league-accent'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
};
export default App;
