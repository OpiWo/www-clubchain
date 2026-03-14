const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Health
  health: () => apiFetch<{ status: string }>('/health'),

  // Clubs
  getClub: (pubkey: string) => apiFetch<Club>(`/clubs/${pubkey}`),
  createClub: (body: { name: string; badge: number; managerPubkey: string }) =>
    apiFetch<Club>('/clubs', { method: 'POST', body: JSON.stringify(body) }),

  // Leagues
  getLeagues: (params?: { status?: string; tier?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<League[]>(`/leagues${qs ? `?${qs}` : ''}`);
  },
  getLeague: (pubkey: string) => apiFetch<LeagueDetail>(`/leagues/${pubkey}`),
  joinLeague: (pubkey: string, managerPubkey: string) =>
    apiFetch<Record<string, unknown>>(`/leagues/${pubkey}/join`, {
      method: 'POST',
      body: JSON.stringify({ managerPubkey }),
    }),

  // Players
  getPlayers: (params?: { position?: string; available?: boolean; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return apiFetch<Player[]>(`/players${qs ? `?${qs}` : ''}`);
  },
  getPlayer: (playerId: number) => apiFetch<Player>(`/players/${playerId}`),

  // Matches
  getMatches: (leaguePubkey: string) =>
    apiFetch<Match[]>(`/matches?league=${leaguePubkey}`),
  getMatchEvents: (matchId: number) =>
    apiFetch<MatchEvent[]>(`/matches/${matchId}/events`),
  getMatchCommentary: (matchId: number) =>
    apiFetch<Commentary[]>(`/matches/${matchId}/commentary`),

  // Admin
  adminLogin: (email: string, password: string) =>
    apiFetch<{ token: string }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  asgardGetLeagues: (token: string) =>
    apiFetch<League[]>('/asgard/leagues', { headers: { 'x-asgard-secret': token } }),
  asgardGetPlayers: (token: string) =>
    apiFetch<Player[]>('/asgard/players', { headers: { 'x-asgard-secret': token } }),
  asgardGetOracleStatus: (token: string) =>
    apiFetch<OracleStatus>('/asgard/oracle/status', { headers: { 'x-asgard-secret': token } }),
  asgardInitializeProtocol: (token: string, body: { entryFeeBps: number; purchaseFeeBps: number; prizeFeeBps: number; treasury?: string }) =>
    apiFetch<{ success: boolean; configPda: string }>('/asgard/oracle/initialize', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'x-asgard-secret': token },
    }),
  asgardRequestAirdrop: (token: string, amount = 1) =>
    apiFetch<{ success: boolean; signature: string; balance: number; amount: number }>('/asgard/oracle/airdrop', {
      method: 'POST',
      body: JSON.stringify({ amount }),
      headers: { 'x-asgard-secret': token },
    }),
  asgardGeneratePlayers: (token: string, count = 20) =>
    apiFetch<{ generated: number }>('/asgard/players/generate', {
      method: 'POST',
      body: JSON.stringify({ count }),
      headers: { 'x-asgard-secret': token },
    }),
};

// Types
export interface Club {
  pubkey: string;
  manager: string;
  name: string;
  badge: number;
  created_at: string;
}

export interface League {
  pubkey: string;
  league_id: number;
  name: string;
  tier: 'Standard' | 'Premium' | 'Elite';
  entry_fee: number; // lamports
  max_clubs: number;
  clubs_count: number;
  status: 'Pending' | 'Active' | 'Locked' | 'Playing' | 'Finished' | 'Cancelled';
  transfer_open: string;
  transfer_close: string;
  kickoff_time: string;
}

export interface LeagueDetail extends League {
  standings: Standing[];
}

export interface Standing {
  pubkey: string;
  manager: string;
  club_name: string;
  badge: number;
  points: number;
  matches_played: number;
  goals_for: number;
  goals_against: number;
  budget_remaining: number;
}

export interface Player {
  player_id: number;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  nationality: string;
  club_team: string;
  rating: number;
  price: number;
  current_league: string | null;
  on_chain_pubkey: string;
}

export interface Match {
  id: number;
  league: string;
  match_index: number;
  home_club: string;
  away_club: string;
  home_club_name?: string;
  away_club_name?: string;
  home_score: number | null;
  away_score: number | null;
  status: 'scheduled' | 'playing' | 'finished';
  scheduled_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface MatchEvent {
  id: number;
  match_id: number;
  minute: number;
  event_type: 'goal' | 'save' | 'miss' | 'kickoff' | 'halftime' | 'fulltime';
  club: string | null;
  player_name: string | null;
  detail: Record<string, unknown>;
}

export interface OracleStatus {
  oracle: { pubkey: string; balance: number; balanceLamports: number };
  program: { id: string; rpc: string };
  initialized: boolean;
  protocolConfig: {
    pda: string;
    authority: string;
    treasury: string;
    entryFeeBps: number;
    purchaseFeeBps: number;
    prizeFeeBps: number;
    leagueCount: number;
  } | null;
}

export interface Commentary {
  id: number;
  match_id: number;
  minute: number;
  text: string;
}
