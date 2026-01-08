
import React, { useState, createContext, useContext, useEffect } from 'react';
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
import { Profile, Role, RecruitingStatus, Franchise, ActivityLog, ContractStatus, TalentTier, LeagueEvent, SystemRole, FranchiseAlertConfig, GradingConfig, ChatMessage } from './types';
import { GoogleGenAI } from "@google/genai";

const INITIAL_PROFILES: Profile[] = [
  // EXISTING PROFILES
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
    personalBio: "Former D1 linebacker with professional arena experience in the US. I bring leadership, a high football IQ, and absolute physicality to the Nottingham defense. My history includes 3 years of All-Star honors.",
    metrics: { speed: 8, strength: 10, agility: 8, iq: 10, versatility: 9 },
    isIronmanPotential: true,
    avatar_url: 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?q=80&w=400&h=400&auto=format&fit=crop',
    combineResults: [{ fortyYardDash: '4.65s', benchPressReps: 32, verticalJump_cm: 85, recordedAt: '2024-01-20', recordedBy: 'CHIEF_SCOUT' }]
  },
  {
    id: 'n2',
    fullName: 'Ryan Sterling',
    email: 'r.sterling@ial.com',
    phone: '+1 555-0102',
    dateOfBirth: '2000-11-12',
    nationality: 'USA',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.DUSSELDORF, rank3: Franchise.STUTTGART, rank4: Franchise.ZURICH, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-11',
    scoutGrade: 8.5,
    positions: ['WR', 'OS'],
    personalBio: "Speed is my primary asset. I've been a deep threat in vertical offenses for my entire career. I'm looking to bring explosive plays to the European circuit.",
    metrics: { speed: 9, strength: 6, agility: 9, iq: 8, versatility: 7 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&auto=format&fit=crop',
    combineResults: []
  },
  {
    id: 'z1',
    fullName: 'Swiss Brunner',
    email: 's.brunner@ial.ch',
    phone: '+41 44 123 45 67',
    dateOfBirth: '1998-02-14',
    nationality: 'Switzerland',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PRE_SCREENED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.NOTTINGHAM, rank3: Franchise.STUTTGART, rank4: Franchise.GLASGOW, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-01-22',
    scoutGrade: 9.9,
    positions: ['QB', 'JACK'],
    personalBio: "Dual-threat quarterback with Swiss precision. I lead by example and excel in high-pressure arena environments. My background includes European Championship wins.",
    metrics: { speed: 8, strength: 7, agility: 9, iq: 10, versatility: 10 },
    isIronmanPotential: true,
    avatar_url: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=400&h=400&auto=format&fit=crop',
    combineResults: [{ fortyYardDash: '4.52s', benchPressReps: 22, verticalJump_cm: 98, recordedAt: '2024-01-24', recordedBy: 'CHIEF_SCOUT' }]
  },
  // 15 NEW PROFILES
  {
    id: 'd1',
    fullName: 'Dante Varga',
    email: 'd.varga@ial.de',
    phone: '+49 151 12345678',
    dateOfBirth: '1996-08-19',
    nationality: 'Germany',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.STUTTGART, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-25',
    scoutGrade: 9.6,
    positions: ['QB'],
    personalBio: "The premier German gunslinger. I've broken every local passing record. My history in the GFL makes me a perfect fit for the Düsseldorf Dragons. I want to win on my home soil.",
    metrics: { speed: 6, strength: 7, agility: 7, iq: 10, versatility: 6 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop',
    assignedFranchise: Franchise.DUSSELDORF
  },
  {
    id: 's1',
    fullName: 'Elena Rossi',
    email: 'e.rossi@ial.it',
    phone: '+39 340 123 4567',
    dateOfBirth: '1985-04-12',
    nationality: 'Italy',
    role: Role.COACH,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.ZURICH, rank3: Franchise.DUSSELDORF, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2024-01-05',
    scoutGrade: 9.8,
    positions: ['HC', 'OC'],
    personalBio: "Championship-winning coach from the Italian Bowl. Known for a creative vertical offense that exploits arena field dimensions. I have 15 years of coaching history at the highest European levels.",
    metrics: { speed: 2, strength: 2, agility: 2, iq: 10, versatility: 9 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&auto=format&fit=crop',
    assignedFranchise: Franchise.STUTTGART
  },
  {
    id: 'g3',
    fullName: 'Jaxson Miller',
    email: 'j.miller@ial.us',
    phone: '+1 615-555-0199',
    dateOfBirth: '1997-01-02',
    nationality: 'USA',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.ZURICH, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-02-01',
    scoutGrade: 9.4,
    positions: ['DL', 'NT'],
    personalBio: "6'4, 140kg of pure power. I'm 'The Wall'. I played NFL preseason ball and I'm ready to dominate the trenches in Glasgow. I fit their physical identity perfectly.",
    metrics: { speed: 4, strength: 10, agility: 5, iq: 8, versatility: 3 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 'z2',
    fullName: 'Björn Ironside',
    email: 'b.iron@ial.no',
    phone: '+47 900 12 345',
    dateOfBirth: '1999-12-10',
    nationality: 'Norway',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.PRE_SCREENED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.DUSSELDORF, rank3: Franchise.GLASGOW, rank4: Franchise.NOTTINGHAM, rank5: Franchise.STUTTGART },
    createdAt: '2024-01-28',
    scoutGrade: 8.8,
    positions: ['FB', 'LB'],
    personalBio: "A true two-way Ironman. I thrive on the physical demands of arena football. I've played in the Norwegian league for 5 years and I'm ready for the next level in Switzerland.",
    metrics: { speed: 7, strength: 9, agility: 6, iq: 8, versatility: 10 },
    isIronmanPotential: true,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 'd2',
    fullName: 'Luca Moretti',
    email: 'l.moretti@ial.it',
    phone: '+39 333 987 6543',
    dateOfBirth: '2001-02-14',
    nationality: 'Italy',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.TRYOUT_INVITED,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.ZURICH, rank3: Franchise.STUTTGART, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2024-02-05',
    scoutGrade: 8.2,
    positions: ['DB', 'DS'],
    personalBio: "Elite ball-hawk. I led the Italian league in interceptions last season. I have the lateral quickness needed for the arena game and I want to prove it in Germany.",
    metrics: { speed: 8, strength: 5, agility: 9, iq: 9, versatility: 6 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 'n3',
    fullName: 'Sarah Jenkins',
    email: 's.jenkins@ial.uk',
    phone: '+44 7700 900055',
    dateOfBirth: '1988-11-20',
    nationality: 'United Kingdom',
    role: Role.COACH,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.STUTTGART, rank4: Franchise.DUSSELDORF, rank5: Franchise.ZURICH },
    createdAt: '2024-01-08',
    scoutGrade: 9.5,
    positions: ['OC', 'WR-COACH'],
    personalBio: "Innovator of the 'Nottingham Speed' system. My background is in sports science and high-performance strategy. I focus on player-centric development and rapid execution.",
    metrics: { speed: 3, strength: 3, agility: 3, iq: 10, versatility: 8 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&auto=format&fit=crop',
    assignedFranchise: Franchise.NOTTINGHAM
  },
  {
    id: 'g4',
    fullName: 'Amir Khan',
    email: 'a.khan@ial.uk',
    phone: '+44 7700 900099',
    dateOfBirth: '2002-05-15',
    nationality: 'United Kingdom',
    role: Role.PLAYER,
    tier: TalentTier.TIER3,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.DUSSELDORF, rank4: Franchise.STUTTGART, rank5: Franchise.ZURICH },
    createdAt: '2024-02-10',
    scoutGrade: 7.5,
    positions: ['WR', 'KR'],
    personalBio: "Young, explosive, and ready to learn. I've been the standout track star in my region. I want to transition my speed to the arena field under Glasgow's banner.",
    metrics: { speed: 10, strength: 4, agility: 8, iq: 6, versatility: 5 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 's2',
    fullName: 'Hans Schmidt',
    email: 'h.schmidt@ial.de',
    phone: '+49 170 9876543',
    dateOfBirth: '1994-03-25',
    nationality: 'Germany',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.OFFER_EXTENDED,
    preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-15',
    scoutGrade: 9.7,
    positions: ['K', 'P'],
    personalBio: "The most accurate leg in Europe. 95% career FG rate. My experience in pressure situations makes me a reliable asset for Stuttgart's championship run.",
    metrics: { speed: 5, strength: 8, agility: 5, iq: 9, versatility: 4 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 'z3',
    fullName: 'Mateo Garcia',
    email: 'm.garcia@ial.es',
    phone: '+34 600 123 456',
    dateOfBirth: '1997-07-30',
    nationality: 'Spain',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.PRE_SCREENED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.NOTTINGHAM, rank3: Franchise.GLASGOW, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-01-20',
    scoutGrade: 8.9,
    positions: ['LB', 'JACK'],
    personalBio: "High-intensity defender from Madrid. I've been a captain for 4 years. I bring a combination of lateral speed and tackling precision that fits the Zürich scheme.",
    metrics: { speed: 8, strength: 8, agility: 8, iq: 9, versatility: 7 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 'd3',
    fullName: 'Chloe Lefebvre',
    email: 'c.le@ial.fr',
    phone: '+33 6 12 34 56 78',
    dateOfBirth: '2000-09-12',
    nationality: 'France',
    role: Role.PLAYER,
    tier: TalentTier.TIER3,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.ZURICH, rank3: Franchise.NOTTINGHAM, rank4: Franchise.GLASGOW, rank5: Franchise.STUTTGART },
    createdAt: '2024-02-15',
    scoutGrade: 7.2,
    positions: ['WR', 'OS'],
    personalBio: "I'm looking to make my mark on the European stage. I've been a top performer in the French development leagues and I want to bring my agility to Düsseldorf.",
    metrics: { speed: 8, strength: 5, agility: 9, iq: 7, versatility: 6 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 'n4',
    fullName: 'Oliver Brown',
    email: 'o.brown@ial.uk',
    phone: '+44 7700 900111',
    dateOfBirth: '1998-01-05',
    nationality: 'United Kingdom',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.SIGNED,
    preferences: { rank1: Franchise.NOTTINGHAM, rank2: Franchise.GLASGOW, rank3: Franchise.ZURICH, rank4: Franchise.DUSSELDORF, rank5: Franchise.STUTTGART },
    createdAt: '2024-01-12',
    scoutGrade: 8.4,
    positions: ['DB', 'DS'],
    personalBio: "Shutdown corner with a physical edge. I've played in the GFL and BAFA Premiership. Nottingham is my first choice because of their defensive culture.",
    metrics: { speed: 8, strength: 7, agility: 8, iq: 8, versatility: 7 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=400&h=400&auto=format&fit=crop',
    assignedFranchise: Franchise.NOTTINGHAM
  },
  {
    id: 'g5',
    fullName: 'Fiona MacDonald',
    email: 'f.mac@ial.scot',
    phone: '+44 7700 900222',
    dateOfBirth: '1982-06-30',
    nationality: 'Scotland',
    role: Role.COACH,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PLACED,
    preferences: { rank1: Franchise.GLASGOW, rank2: Franchise.NOTTINGHAM, rank3: Franchise.ZURICH, rank4: Franchise.STUTTGART, rank5: Franchise.DUSSELDORF },
    createdAt: '2024-01-02',
    scoutGrade: 9.9,
    positions: ['DC', 'LB-COACH'],
    personalBio: "The architect of the 'Highland Wall'. I specialize in aggressive, pressure-heavy defensive schemes. 20 years of experience across Europe and North America.",
    metrics: { speed: 2, strength: 4, agility: 2, iq: 10, versatility: 7 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&h=400&auto=format&fit=crop',
    assignedFranchise: Franchise.GLASGOW
  },
  {
    id: 'd4',
    fullName: 'Erik Vossen',
    email: 'e.vossen@ial.nl',
    phone: '+31 6 1234 5678',
    dateOfBirth: '1995-11-15',
    nationality: 'Netherlands',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.TRYOUT_INVITED,
    preferences: { rank1: Franchise.DUSSELDORF, rank2: Franchise.STUTTGART, rank3: Franchise.ZURICH, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-30',
    scoutGrade: 9.2,
    positions: ['OL', 'DL'],
    personalBio: "Massive frame with dancing feet. I'm a natural fit for the arena game's close-quarters combat. I've anchored offensive lines in the ELF and GFL for years.",
    metrics: { speed: 5, strength: 10, agility: 7, iq: 8, versatility: 9 },
    isIronmanPotential: true,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 's3',
    fullName: 'Sven Larsson',
    email: 's.larsson@ial.se',
    phone: '+46 70 123 45 67',
    dateOfBirth: '1998-04-20',
    nationality: 'Sweden',
    role: Role.PLAYER,
    tier: TalentTier.TIER2,
    status: RecruitingStatus.NEW_LEAD,
    preferences: { rank1: Franchise.STUTTGART, rank2: Franchise.DUSSELDORF, rank3: Franchise.ZURICH, rank4: Franchise.GLASGOW, rank5: Franchise.NOTTINGHAM },
    createdAt: '2024-02-12',
    scoutGrade: 8.1,
    positions: ['QB', 'P'],
    personalBio: "Smart, calculating field general. I have a background in both Nordic leagues and European tournaments. I'm a reliable backup and special teams asset.",
    metrics: { speed: 6, strength: 7, agility: 6, iq: 9, versatility: 8 },
    isIronmanPotential: true,
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=400&h=400&auto=format&fit=crop'
  },
  {
    id: 'z4',
    fullName: 'Isabella Conti',
    email: 'i.conti@ial.it',
    phone: '+39 347 111 2222',
    dateOfBirth: '2001-08-25',
    nationality: 'Italy',
    role: Role.PLAYER,
    tier: TalentTier.TIER1,
    status: RecruitingStatus.PRE_SCREENED,
    preferences: { rank1: Franchise.ZURICH, rank2: Franchise.STUTTGART, rank3: Franchise.DUSSELDORF, rank4: Franchise.NOTTINGHAM, rank5: Franchise.GLASGOW },
    createdAt: '2024-01-18',
    scoutGrade: 9.3,
    positions: ['WR', 'OS'],
    personalBio: "Dynamic playmaker with exceptional hands. I've been the primary target in Italian professional leagues. I want to bring my scoring ability to Zürich.",
    metrics: { speed: 9, strength: 5, agility: 10, iq: 8, versatility: 7 },
    isIronmanPotential: false,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&auto=format&fit=crop'
  }
];

const DEFAULT_ALERTS: Record<Franchise, FranchiseAlertConfig> = {
  [Franchise.NOTTINGHAM]: { minRosterSize: 15, requiredPositions: { QB: 2, WR: 4 } },
  [Franchise.GLASGOW]: { minRosterSize: 15, requiredPositions: { QB: 2, WR: 4 } },
  [Franchise.DUSSELDORF]: { minRosterSize: 15, requiredPositions: { QB: 2, WR: 4 } },
  [Franchise.STUTTGART]: { minRosterSize: 15, requiredPositions: { QB: 2, WR: 4 } },
  [Franchise.ZURICH]: { minRosterSize: 15, requiredPositions: { QB: 2, WR: 4 } },
};

const DEFAULT_GRADING: GradingConfig = {
  speedWeight: 1.5,
  strengthWeight: 1.2,
  agilityWeight: 1.0,
  iqWeight: 1.0,
  versatilityWeight: 0.8
};

type ViewState = 'register' | 'admin' | 'profiles' | 'schedule' | 'draft' | 'franchise-admin' | 'compare' | 'pipeline' | 'evaluation' | 'comms';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  profiles: Profile[];
  activityLogs: ActivityLog[];
  comparisonIds: string[];
  watchlistIds: string[];
  activeEvaluationEvent: LeagueEvent | null;
  currentSystemRole: SystemRole;
  alertConfigs: Record<Franchise, FranchiseAlertConfig>;
  gradingConfig: GradingConfig;
  isPrivacyMode: boolean;
  toasts: Toast[];
  messages: ChatMessage[];
  setPrivacyMode: (val: boolean) => void;
  setCurrentSystemRole: (role: SystemRole) => void;
  updateAlertConfig: (franchise: Franchise, config: FranchiseAlertConfig) => void;
  updateGradingConfig: (config: GradingConfig) => void;
  addProfile: (p: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  logActivity: (type: ActivityLog['type'], message: string, subjectId: string) => void;
  toggleComparison: (id: string) => void;
  toggleWatchlist: (id: string) => void;
  startEvaluation: (event: LeagueEvent) => void;
  closeEvaluation: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  runAiRosterStrategy: (franchise: Franchise) => Promise<string>;
  sendMessage: (text: string, channelId: string) => void;
}

export const AppContext = createContext<AppState | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [activeEvaluationEvent, setActiveEvaluationEvent] = useState<LeagueEvent | null>(null);
  const [currentSystemRole, setCurrentSystemRole] = useState<SystemRole>(SystemRole.LEAGUE_ADMIN);
  const [alertConfigs, setAlertConfigs] = useState<Record<Franchise, FranchiseAlertConfig>>(DEFAULT_ALERTS);
  const [gradingConfig, setGradingConfig] = useState<GradingConfig>(DEFAULT_GRADING);
  const [isPrivacyMode, setPrivacyMode] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const sendMessage = (text: string, channelId: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'current-user',
      senderName: currentSystemRole,
      senderRole: currentSystemRole,
      text,
      timestamp: new Date().toISOString(),
      channelId
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => {
      const exists = prev.includes(id);
      if (exists) return prev.filter(i => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const toggleWatchlist = (id: string) => {
    setWatchlistIds(prev => {
      const exists = prev.includes(id);
      addToast(exists ? 'Removed from watchlist' : 'Added to watchlist', 'info');
      return exists ? prev.filter(i => i !== id) : [...prev, id];
    });
  };

  const startEvaluation = (event: LeagueEvent) => {
    setActiveEvaluationEvent(event);
    setView('evaluation');
    addToast(`Evaluation session started: ${event.title}`, 'success');
  };

  const closeEvaluation = () => {
    setActiveEvaluationEvent(null);
    setView('schedule');
    addToast('Evaluation session closed', 'info');
  };

  const logActivity = (type: ActivityLog['type'], message: string, subjectId: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      message,
      subjectId
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const updateAlertConfig = (franchise: Franchise, config: FranchiseAlertConfig) => {
    setAlertConfigs(prev => ({ ...prev, [franchise]: config }));
    logActivity('ALERT_CONFIG', `Updated alert thresholds for ${franchise}`, 'SYSTEM');
    addToast(`Updated ${franchise} alerts`, 'success');
  };

  const updateGradingConfig = (config: GradingConfig) => {
    setGradingConfig(config);
    logActivity('GRADING_CONFIG', 'Updated global scout grading multipliers', 'SYSTEM');
    addToast('Global grading multipliers updated', 'success');
  };

  const addProfile = (p: Profile) => {
    setProfiles(prev => [p, ...prev]);
    logActivity('REGISTRATION', `New application: ${p.fullName}`, p.id);
    addToast(`Registry Updated: ${p.fullName}`, 'success');
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const profile = profiles.find(p => p.id === id);
    if (profile && updates.status && updates.status !== profile.status) {
      logActivity('STATUS_CHANGE', `${profile.fullName} -> ${updates.status}`, id);
      addToast(`Status: ${profile.fullName} is now ${updates.status}`, 'info');
    }
  };

  const deleteProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      setProfiles(prev => prev.filter(p => p.id !== id));
      logActivity('USER_DELETE', `ADMIN REMOVED: ${profile.fullName}`, id);
      addToast(`Permanent Deletion: ${profile.fullName}`, 'error');
    }
  };

  const runAiRosterStrategy = async (franchise: Franchise): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const roster = profiles.filter(p => p.assignedFranchise === franchise);
      const available = profiles.filter(p => !p.assignedFranchise);
      
      const prompt = `Analyze this franchise roster for ${franchise}: ${JSON.stringify(roster.map(p => ({name: p.fullName, pos: p.positions})))}
      Available draft pool: ${JSON.stringify(available.map(p => ({id: p.id, name: p.fullName, pos: p.positions, grade: p.scoutGrade})))}
      Identity strategy: ${franchise === Franchise.NOTTINGHAM ? 'Vertical Offense' : 'Balanced'}.
      Recommend 2 specific players from the pool to sign immediately and explain why based on positional need and scout grade.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
      });
      return response.text || 'No strategic insights generated.';
    } catch (e) {
      console.error(e);
      return 'Strategy engine offline. Check API connectivity.';
    }
  };

  return (
    <AppContext.Provider value={{ 
      profiles, 
      activityLogs, 
      comparisonIds, 
      watchlistIds, 
      activeEvaluationEvent,
      currentSystemRole,
      alertConfigs,
      gradingConfig,
      isPrivacyMode,
      toasts,
      messages,
      setPrivacyMode,
      setCurrentSystemRole,
      updateAlertConfig,
      updateGradingConfig,
      addProfile, 
      updateProfile, 
      deleteProfile,
      logActivity, 
      toggleComparison, 
      toggleWatchlist,
      startEvaluation,
      closeEvaluation,
      addToast,
      runAiRosterStrategy,
      sendMessage
    }}>
      <div className="min-h-screen bg-league-bg text-league-fg font-sans selection:bg-league-accent selection:text-white flex flex-col">
        <Header currentView={view} setView={setView} />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
          <div className="animate-in fade-in duration-700">
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
          </div>
        </main>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className={`px-6 py-3 rounded-full border shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-3 backdrop-blur-md pointer-events-auto ${
                toast.type === 'success' ? 'bg-league-ok/20 border-league-ok text-league-ok' :
                toast.type === 'error' ? 'bg-league-accent/20 border-league-accent text-league-accent' :
                'bg-league-blue/20 border-league-blue text-league-blue'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
          ))}
        </div>

        <footer className="mt-auto py-10 border-t border-league-border text-center">
          <p className="text-league-muted text-[10px] font-black uppercase tracking-[0.4em]">
            European League • Global Operations Center
          </p>
        </footer>
      </div>
    </AppContext.Provider>
  );
};

export default App;
