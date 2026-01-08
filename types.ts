
export enum Role {
  PLAYER = 'PLAYER',
  COACH = 'COACH'
}

export enum SystemRole {
  LEAGUE_ADMIN = 'League Admin',
  FRANCHISE_GM = 'Franchise GM',
  COACH_STAFF = 'Coach Staff'
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
  speed: number;      // 1-10
  strength: number;   // 1-10
  agility: number;    // 1-10
  iq: number;         // 1-10
  versatility: number; // 1-10
}

export interface CombineResult {
  fortyYardDash?: string;
  benchPressReps?: number;
  verticalJump_cm?: number;
  broadJump_cm?: number;
  threeConeDrill?: string;
  shuttleRun?: string;
  recordedAt: string;
  recordedBy: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  role: Role;
  tier: TalentTier;
  status: RecruitingStatus;
  preferences: Preferences;
  createdAt: string;
  // Stats & Specialized Data
  height_cm?: number;
  weight_kg?: number;
  positions: string[];
  personalBio?: string; // New field for player history and fit statement
  experience_summary?: string;
  avatar_url?: string;
  highlightUrls?: string[];
  // Scouting & Arena Specifics
  scoutGrade?: number; 
  metrics: ScoutingMetrics;
  isIronmanPotential: boolean; 
  benchPressReps?: number;
  fortyYardDash?: string;
  scoutingReport?: string;
  fitScores?: Record<string, number>; 
  combineResults?: CombineResult[];
  // Franchise Management
  contractStatus?: ContractStatus;
  notes?: string;
  salary?: number;
  contractStart?: string;
  contractEnd?: string;
  totalValue?: number;
  capHit?: number;
  depthRanks?: Record<string, number>; 
  assignedFranchise?: Franchise;
  assignedTeam?: string;
}

export interface GradingConfig {
  speedWeight: number;
  strengthWeight: number;
  agilityWeight: number;
  iqWeight: number;
  versatilityWeight: number;
}

export interface FranchiseAlertConfig {
  minRosterSize: number;
  requiredPositions: Record<string, number>;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'SIGNING' | 'STATUS_CHANGE' | 'REGISTRATION' | 'RELEASE' | 'PLACEMENT' | 'NOTE_ADDED' | 'CONTRACT_UPDATE' | 'COMBINE_RESULT' | 'USER_DELETE' | 'ALERT_CONFIG' | 'GRADING_CONFIG';
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
  type: 'Tryout' | 'Combine' | 'Match' | 'Draft' | 'Training';
  status: 'Scheduled' | 'Completed' | 'Postponed';
  attendees?: string[]; // IDs of profiles
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: SystemRole;
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
}
