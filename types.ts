export enum Role {
  PLAYER = 'PLAYER',
  COACH = 'COACH'
}

export enum SystemRole {
  LEAGUE_ADMIN = 'League Admin',
  FRANCHISE_GM = 'Franchise GM',
  COACH_STAFF = 'Coach Staff',
  PLAYER = 'Player'
}

export enum TalentTier {
  TIER1 = 'Franchise Athlete',
  TIER2 = 'Starter',
  TIER3 = 'Developmental'
}

export enum RecruitingStatus {
  NEW_LEAD = 'New Lead',
  PRE_SCREENED = 'Pre-Screened',
  TRYOUT_INVITED = 'Tryout Invited',
  TRYOUT_COMPLETED = 'Tryout Completed',
  OFFER_EXTENDED = 'Offer Extended',
  SIGNED = 'Signed',
  PLACED = 'Placed',
  INACTIVE = 'Inactive'
}

export enum Franchise {
  NOTTINGHAM = 'Nottingham',
  GLASGOW = 'Glasgow',
  DUSSELDORF = 'Düsseldorf',
  STUTTGART = 'Stuttgart',
  ZURICH = 'Zürich',
  BERLIN = 'Berlin',
  FEHERVAR = 'Fehérvár',
  WROCLAW = 'Wroclaw',
  HAMBURG = 'Hamburg',
  PRAGUE = 'Prague',
  NORDIC_STORM = 'Nordic Storm',
  VIENNA = 'Vienna',
  COLOGNE = 'Cologne',
  FRANKFURT = 'Frankfurt',
  MADRID = 'Madrid',
  MUNICH = 'Munich',
  PARIS = 'Paris',
  RAIDERS_TIROL = 'Raiders Tirol'
}

export const FRANCHISE_COLORS: Record<Franchise, string> = {
  [Franchise.NOTTINGHAM]: '#e41d24',
  [Franchise.GLASGOW]: '#40a9ff',
  [Franchise.DUSSELDORF]: '#23d18b',
  [Franchise.STUTTGART]: '#ffb84d',
  [Franchise.ZURICH]: '#722ed1',
  [Franchise.BERLIN]: '#ffcc00',
  [Franchise.FEHERVAR]: '#c5a059',
  [Franchise.WROCLAW]: '#00529b',
  [Franchise.HAMBURG]: '#003153',
  [Franchise.PRAGUE]: '#ffd700',
  [Franchise.NORDIC_STORM]: '#4682b4',
  [Franchise.VIENNA]: '#5d2a8f',
  [Franchise.COLOGNE]: '#af0000',
  [Franchise.FRANKFURT]: '#4b0082',
  [Franchise.MADRID]: '#f57c00',
  [Franchise.MUNICH]: '#000080',
  [Franchise.PARIS]: '#002654',
  [Franchise.RAIDERS_TIROL]: '#a0a0a0'
};

export const FRANCHISE_TEAMS: Record<Franchise, string[]> = {
  [Franchise.NOTTINGHAM]: ['Hoods', 'Outlaws'],
  [Franchise.GLASGOW]: ['Tigers', 'Rocks'],
  [Franchise.DUSSELDORF]: ['Panthers', 'Fire'],
  [Franchise.STUTTGART]: ['Surge', 'Scorpions'],
  [Franchise.ZURICH]: ['Helvetic Guards', 'Renegades'],
  [Franchise.BERLIN]: ['Thunder', 'Adler'],
  [Franchise.FEHERVAR]: ['Enthroners', 'Crowns'],
  [Franchise.WROCLAW]: ['Panthers', 'Jaguars'],
  [Franchise.HAMBURG]: ['Sea Devils', 'Blue Devils'],
  [Franchise.PRAGUE]: ['Lions', 'Royals'],
  [Franchise.NORDIC_STORM]: ['Storm', 'Vikings'],
  [Franchise.VIENNA]: ['Vikings', 'Empire'],
  [Franchise.COLOGNE]: ['Centurions', 'Legion'],
  [Franchise.FRANKFURT]: ['Galaxy', 'Universe'],
  [Franchise.MADRID]: ['Bravos', 'Toros'],
  [Franchise.MUNICH]: ['Ravens', 'Blizzard'],
  [Franchise.PARIS]: ['Musketeers', 'Guard'],
  [Franchise.RAIDERS_TIROL]: ['Raiders', 'Explorers']
};

export interface Preferences {
  rank1: Franchise;
  rank2: Franchise;
  rank3: Franchise;
  rank4: Franchise;
  rank5: Franchise;
}

export interface ScoutingMetrics {
  speed: number;
  strength: number;
  agility: number;
  iq: number;
  versatility: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'CV' | 'Passport' | 'Medical' | 'Contract';
  url: string;
  scanStatus: 'CLEAN' | 'SCANNING' | 'INFECTED';
  uploadedAt: string;
}

export interface OnboardingTask {
  id: string;
  title: string;
  isCompleted: boolean;
  category: 'Legal' | 'Travel' | 'Medical' | 'Logistics';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
}

export interface VideoTag {
  timestamp: string;
  note: string;
  scoutId: string;
  scoutName: string;
}

export interface GradingConfig {
  speedWeight: number;
  strengthWeight: number;
  agilityWeight: number;
  iqWeight: number;
  versatilityWeight: number;
}

export interface CombineResult {
  fortyYardDash?: string;
  benchPressReps?: number;
  verticalJump_cm?: number;
  broadJump_cm?: number;
  recordedAt: string;
  recordedBy: string;
}

export interface SearchGroundingSource {
  title: string;
  uri: string;
}

export interface Profile {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  role: Role;
  tier: TalentTier;
  status: RecruitingStatus;
  preferences: Preferences;
  createdAt: string;
  height_cm?: number;
  weight_kg?: number;
  positions: string[];
  personalBio?: string;
  highlightUrls?: string[];
  scoutGrade?: number; 
  metrics: ScoutingMetrics;
  isIronmanPotential: boolean; 
  benchPressReps?: number;
  fortyYardDash?: string;
  assignedFranchise?: Franchise;
  assignedTeam?: string;
  documents: Document[];
  onboardingChecklist: OnboardingTask[];
  draftReadiness?: number; 
  videoAnalysisTags?: VideoTag[];
  avatar_url?: string;
  capHit?: number;
  combineResults?: CombineResult[];
  aiIntel?: string;
  aiIntelSources?: SearchGroundingSource[];
  hypeAssetUrl?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  subjectId: string;
}

export interface BroadcastDirective {
  id: string;
  message: string;
  priority: 'CRITICAL' | 'STANDARD';
  active: boolean;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  channelId: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  allowedRoles?: SystemRole[];
  franchiseScope?: Franchise;
  isDirect?: boolean;
  participants?: string[];
}

export interface Play {
  id: string;
  name: string;
  formation: string;
  category: string;
  description: string;
  simVideoUrl?: string;
}

export interface Playbook {
  id: string;
  franchise?: Franchise;
  name: string;
  plays: Play[];
  lastUpdated: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  lessons: { id: string; title: string; durationMins: number }[];
}

export interface LeagueEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  franchise: Franchise | 'League Wide';
  type: string;
  status: string;
}