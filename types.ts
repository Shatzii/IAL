
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
  TIER1 = 'Franchise (Negotiated Contract)',
  TIER2 = 'Starter (1k / Game)',
  TIER3 = 'Backup / Practice Squad'
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
  ZURICH = 'Zürich'
}

export interface Team {
  id: string;
  name: string;
  franchise: Franchise;
  rosterIds: string[];
  coachIds: string[];
}

export enum VideoSourceType {
  GAME = 'game',
  PRACTICE = 'practice',
  HIGHLIGHT = 'highlight',
  SCOUTING = 'scouting'
}

export enum VideoStatus {
  UPLOADED = 'uploaded',
  TRANSCODING = 'transcoding',
  READY = 'ready',
  ANALYZING = 'analyzing',
  FAILED = 'failed'
}

export interface TacticalContext {
  down?: number;
  distance?: number;
  yardLine?: number;
  playType?: 'RUN' | 'PASS' | 'SPECIAL';
  formation?: string;
  motionType?: 'VERTICAL_HIGH' | 'JET' | 'SET';
  zone?: 'RED_ZONE' | 'WALL_ZONE' | 'NET_ZONE' | 'OPEN_FIELD';
}

export interface Video {
  id: string;
  teamId: string;
  uploadedByUserId: string;
  athleteId?: string; 
  title: string;
  description: string;
  sourceType: VideoSourceType;
  status: VideoStatus;
  url: string; 
  durationSeconds: number;
  thumbnailUrl?: string;
  createdAt: string;
  tacticalContext?: TacticalContext;
}

export interface VideoTag {
  id: string;
  videoId: string;
  createdByUserId?: string;
  source: 'ai' | 'coach' | 'admin';
  tStartMs: number;
  tEndMs: number;
  label: string; 
  note: string;
  confidence?: number;
  players?: string[]; 
  approved: boolean;
  isSelfScout?: boolean;
  opponentId?: string; 
  createdAt: string;
  // Spatial coordinates for on-video pings (0-100 scale)
  x_coord?: number;
  y_coord?: number;
}

export interface VideoClip {
  id: string;
  videoId: string;
  title: string;
  tStartMs: number;
  tEndMs: number;
  createdByUserId: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  teamId: string;
  title: string;
  description: string;
  clipIds: string[];
  createdByUserId: string;
  createdAt: string;
}

export const FRANCHISE_COLORS: Record<Franchise, string> = {
  [Franchise.NOTTINGHAM]: '#e41d24',
  [Franchise.GLASGOW]: '#40a9ff',
  [Franchise.DUSSELDORF]: '#23d18b',
  [Franchise.STUTTGART]: '#ffb84d',
  [Franchise.ZURICH]: '#722ed1'
};

export const FRANCHISE_TEAMS: Record<Franchise, string[]> = {
  [Franchise.NOTTINGHAM]: ['Hoods', 'Outlaws'],
  [Franchise.GLASGOW]: ['Tigers', 'Rocks'],
  [Franchise.DUSSELDORF]: ['Panthers', 'Fire'],
  [Franchise.STUTTGART]: ['Surge', 'Scorpions'],
  [Franchise.ZURICH]: ['Guards', 'Renegades']
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

export interface VideoTagLegacy {
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
  videoAnalysisTags?: VideoTagLegacy[];
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
