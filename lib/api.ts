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
