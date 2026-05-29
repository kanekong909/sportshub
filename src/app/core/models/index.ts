export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  country?: string;
  logoUrl?: string;
  season?: string;
  sport: Sport;
}

export interface Stadium {
  id: string;
  name: string;
  capacity?: number;
  city?: string;
  country?: string;
  inaugurated?: number;
  lastRenovated?: number;
  surface?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  group?: string;
  sport: Sport;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  jerseyNumber?: number;
  nationality?: string;
  birthDate?: string;
  birthPlace?: string;
  height?: number;
  weight?: number;
  photoUrl?: string;
  biography?: string;
  active: boolean;
  position?: Position;
  team?: { id: string; name: string; slug: string; logoUrl?: string };
  seasonStats?: PlayerSeasonStats[];
}

export interface PlayerSeasonStats {
  id: string;
  season: string;
  stats: Record<string, any>;
  league: League;
}

export interface TeamSeasonStats {
  id: string;
  season: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position?: number;
  league: League;
}

export interface Title {
  id: string;
  name: string;
  year: number;
  description?: string;
}

export interface TeamHistory {
  id: string;
  year: number;
  event: string;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  foundedYear?: number;
  country?: string;
  city?: string;
  description?: string;
  stadium?: Stadium;
  leagues?: { league: League }[];
  players?: Player[];
  seasonStats?: TeamSeasonStats[];
  titles?: Title[];
  history?: TeamHistory[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  _count?: { favoriteTeams: number; followedPlayers: number; notes: number };
}

export interface UserNote {
  id: string;
  content: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
