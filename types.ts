
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

export enum ContractStatus {
  UNOFFERED = 'Unoffered',
  OFFERED = 'Offered',
  NEGOTIATING = 'Negotiating',
  SIGNED = 'Signed',
  TERMINATED = 'Terminated'
}

export enum Franchise {
  NOTTINGHAM = 'Nottingham',
  GLASGOW = 'Glasgow',
  DUSSELDORF = 'Düsseldorf',
  STUTTGART = 'Stuttgart',
  ZURICH = 'Zürich'
}

export const FRANCHISE_COLORS: Record<Franchise, string> = {
  [Franchise.NOTTINGHAM]: '#e41d24',
  [Franchise.GLASGOW]: '#40a9ff',
  [Franchise.DUSSELDORF]: '#23d18b',
  [Franchise.STUTTGART]: '#ffb84d',
  [Franchise.ZURICH]: '#722ed1'
};

export const FRANCHISE_TEAMS: Record<Franchise, string[]> = {
  [Franchise.NOTTINGHAM]: ['Nottingham Hoods', 'Sherwood Sabres', 'Trent Titans'],
  [Franchise.GLASGOW]: ['Glasgow Gladiators', 'Clyde Crusaders', 'Highland Hammers'],
  [Franchise.DUSSELDORF]: ['Düsseldorf Dragons', 'Rhine Rangers', 'Neon Knights'],
  [Franchise.STUTTGART]: ['Stuttgart Surge', 'Baden Blitz', 'MHP Mustangs'],
  [Franchise.ZURICH]: ['Zürich Zephyrs', 'Alpine Aces', 'Lakeside Lancers'],
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
}

export interface CombineResult {
  fortyYardDash: string;
  benchPressReps: number;
  verticalJump_cm: number;
  broadJump_cm: number;
  recordedAt: string;
  recordedBy: string;
}

export interface GradingConfig {
  speedWeight: number;
  strengthWeight: number;
  agilityWeight: number;
  iqWeight: number;
  versatilityWeight: number;
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
  experience_summary?: string;
  avatar_url?: string;
  highlightUrls?: string[];
  scoutGrade?: number; 
  metrics: ScoutingMetrics;
  isIronmanPotential: boolean; 
  benchPressReps?: number;
  fortyYardDash?: string;
  scoutingReport?: string;
  assignedFranchise?: Franchise;
  assignedTeam?: string;
  location?: { lat: number; lng: number };
  documents: Document[];
  onboardingChecklist: OnboardingTask[];
  salary?: number;
  capHit?: number;
  depthRanks?: Record<string, number>;
  contractEnd?: string;
  combineResults?: CombineResult[];
  currentClub?: string;
  isUnderContract?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  subjectId: string;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: SystemRole | string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  channelId: string;
  recipientId?: string; // For DMs
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  isDirect?: boolean; // New flag for Inboxes
  allowedRoles?: SystemRole[];
  franchiseScope?: Franchise;
  participants?: string[]; // IDs of users in DM
}

// Tactical & Educational Interfaces
export interface Play {
  id: string;
  name: string;
  formation: string;
  category: 'Offense' | 'Defense' | 'Special Teams';
  diagramUrl?: string;
  videoUrl?: string;
  description: string;
  publishedAt: string;
}

export interface Playbook {
  id: string;
  franchise?: Franchise;
  team?: string;
  name: string;
  plays: Play[];
  lastUpdated: string;
}

export interface Lesson {
  id: string;
  title: string;
  contentType: 'Video' | 'Text' | 'Quiz';
  contentUrl?: string;
  durationMins: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'Tactics' | 'Health' | 'Rules' | 'Career';
  lessons: Lesson[];
  thumbnailUrl?: string;
}
