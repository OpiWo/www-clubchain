'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { api, LeagueDetail, Standing, Player, Match } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { StatusBadge, TierBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Helpers ────────────────────────────────────────────────────────────────

function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(2);
}

function truncate(str: string, len = 8): string {
  if (str.length <= len * 2 + 3) return str;
  return `${str.slice(0, len)}...${str.slice(-len)}`;
}

function formatTime(iso: string): string {
  try {
    return (
      new Date(iso).toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      }) + ' UTC'
    );
  } catch {
    return iso;
  }
}

// ─── Badge components ────────────────────────────────────────────────────────

const BADGE_COLORS = [
  '#e84545', '#f5a623', '#22c55e', '#3b82f6',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
  '#84cc16', '#06b6d4', '#6366f1', '#d946ef',
  '#0ea5e9', '#eab308', '#10b981', '#ef4444',
];

function BadgeCircle({ badge }: { badge: number }) {
  const color = BADGE_COLORS[badge % BADGE_COLORS.length] ?? '#888888';
  return (
    <span
      className="inline-block w-5 h-5 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-label={`Badge ${badge}`}
    />
  );
}

const POSITION_COLORS: Record<string, string> = {
  GK: '#3b82f6',
  DEF: '#22c55e',
  MID: '#f5a623',
  FWD: '#e84545',
};

// ─── Standings ────────────────────────────────────────────────────────────────

function StandingsRow({ standing, rank }: { standing: Standing; rank: number }) {
  const isFirst = rank === 1;
  return (
    <tr
      className={`border-b border-[#2a2a38] last:border-b-0 transition-colors hover:bg-[#1a1a24]/50${
        isFirst ? ' border-l-2 border-l-[#f5a623]' : ''
      }`}
    >
      <td className={`py-3 px-4 font-display font-black text-xl ${isFirst ? 'text-[#f5a623]' : 'text-[#888888]'}`}>
        {rank}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <BadgeCircle badge={standing.badge} />
          <span className="font-display font-bold text-[#f0f0f0] text-sm">{standing.club_name}</span>
        </div>
      </td>
      <td className="py-3 px-4 font-body text-[#888888] text-sm text-center">{standing.matches_played}</td>
      <td className="py-3 px-4 font-body text-[#888888] text-sm text-center">{standing.goals_for}</td>
      <td className="py-3 px-4 font-body text-[#888888] text-sm text-center">{standing.goals_against}</td>
      <td className="py-3 px-4 font-display font-black text-[#f0f0f0] text-lg text-center">{standing.points}</td>
    </tr>
  );
}

// ─── Match status badge ───────────────────────────────────────────────────────

function MatchStatusBadge({ status }: { status: Match['status'] }) {
  const cfg = {
    scheduled: { color: '#888888', label: 'SCHEDULED' },
    playing: { color: '#22c55e', label: 'LIVE' },
    finished: { color: '#f5a623', label: 'FINISHED' },
  }[status];
  return (
    <span
      className="text-[9px] font-display font-bold tracking-widest px-2 py-0.5"
      style={{ color: cfg.color, border: `1px solid ${cfg.color}40`, background: `${cfg.color}18` }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ match, leaguePubkey }: { match: Match; leaguePubkey: string }) {
  const hasScore = match.home_score !== null && match.away_score !== null;
  return (
    <Link
      href={`/leagues/${leaguePubkey}/match/${match.id}`}
      className="block bg-[#111118] border border-[#2a2a38] hover:border-[#f5a623]/40 transition-colors p-5"
    >
      {/* Score / dash */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="font-display font-black text-[#f0f0f0] text-2xl leading-none truncate max-w-[100px] text-right">
          {match.home_club_name ?? truncate(match.home_club, 6)}
        </span>
        <span className="font-display font-black text-3xl leading-none text-[#f5a623] shrink-0">
          {hasScore ? `${match.home_score} — ${match.away_score}` : '—'}
        </span>
        <span className="font-display font-black text-[#f0f0f0] text-2xl leading-none truncate max-w-[100px] text-left">
          {match.away_club_name ?? truncate(match.away_club, 6)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-body text-[#888888] text-xs">{formatTime(match.scheduled_at)}</span>
        <MatchStatusBadge status={match.status} />
      </div>
    </Link>
  );
}

// ─── Transfer window player row ───────────────────────────────────────────────

function PlayerRow({ player, onBuy }: { player: Player; onBuy: (player: Player) => void }) {
  const posColor = POSITION_COLORS[player.position] ?? '#888888';
  return (
    <tr className="border-b border-[#2a2a38] last:border-b-0 hover:bg-[#1a1a24]/50 transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/players/${player.player_id}`}
          className="font-display font-bold text-[#f0f0f0] text-sm hover:text-[#f5a623] transition-colors"
        >
          {player.name}
        </Link>
      </td>
      <td className="py-3 px-4">
        <span
          className="text-[10px] font-display font-bold tracking-widest px-2 py-0.5"
          style={{ color: posColor, border: `1px solid ${posColor}40`, background: `${posColor}18` }}
        >
          {player.position}
        </span>
      </td>
      <td className="py-3 px-4 font-body text-[#888888] text-sm text-center">{player.rating}</td>
      <td className="py-3 px-4 font-display font-black text-[#f5a623] text-sm text-right">
        {lamportsToSol(player.price)} SOL
      </td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={() => onBuy(player)}
          className="h-8 px-4 border border-[#2a2a38] text-[#888888] font-display font-bold text-[10px] tracking-widest hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
        >
          BUY
        </button>
      </td>
    </tr>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'info' | 'error' | 'success' }) {
  const color = type === 'error' ? '#e84545' : type === 'success' ? '#22c55e' : '#f5a623';
  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-5 py-4 border font-display font-bold text-sm tracking-wide shadow-2xl max-w-sm"
      style={{ borderColor: color, background: '#111118', color }}
    >
      {message}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-16 w-2/3" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeagueDetailPage() {
  const params = useParams();
  const pubkey = params.pubkey as string;
  const { publicKey, connected } = useWallet();

  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [joining, setJoining] = useState(false);

  function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const { data: league, isLoading, isError } = useQuery<LeagueDetail>({
    queryKey: ['league', pubkey],
    queryFn: () => api.getLeague(pubkey),
    retry: 1,
    enabled: !!pubkey,
  });

  const { data: matches } = useQuery<Match[]>({
    queryKey: ['matches', pubkey],
    queryFn: () => api.getMatches(pubkey),
    enabled: !!pubkey,
    refetchInterval: 60_000,
  });

  const showTransferWindow =
    league?.status === 'Active' || league?.status === 'Locked' || league?.status === 'Playing';

  const { data: availablePlayers } = useQuery<Player[]>({
    queryKey: ['players-available'],
    queryFn: () => api.getPlayers({ available: true, limit: 30 }),
    enabled: showTransferWindow,
    staleTime: 30_000,
  });

  async function handleJoin() {
    if (!connected || !publicKey) {
      showToast('Connect your wallet first', 'error');
      return;
    }
    setJoining(true);
    try {
      await api.joinLeague(pubkey, publicKey.toString());
      showToast('Joined league! (wallet signing coming in next update)', 'success');
    } catch (err) {
      showToast((err as Error).message || 'Failed to join league', 'error');
    } finally {
      setJoining(false);
    }
  }

  function handleBuy(player: Player) {
    showToast(`Buy ${player.name} — wallet signing coming soon`, 'info');
  }

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !league) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="border border-[#e84545]/30 bg-[#e84545]/5 p-12 text-center">
              <p className="font-display font-black text-[#e84545] text-2xl tracking-wide">
                LEAGUE NOT FOUND
              </p>
              <p className="font-body text-[#888888] text-sm mt-3">
                This league does not exist or the API is unavailable.
              </p>
              <Link
                href="/leagues"
                className="mt-6 inline-flex h-10 px-6 border border-[#2a2a38] text-[#888888] font-display font-bold text-xs tracking-widest items-center hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
              >
                ← BACK TO LEAGUES
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const prizePool = lamportsToSol(league.entry_fee * league.clubs_count * 0.97);

  return (
    <>
      <Nav />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/leagues"
            className="font-display font-bold text-xs tracking-widest text-[#888888] hover:text-[#f5a623] transition-colors"
          >
            ← LEAGUES
          </Link>

          {/* League name + badges */}
          <div className="mt-4 flex flex-wrap items-start gap-4">
            <h1
              className="font-display font-black text-[#f0f0f0] leading-none w-full"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.01em', lineHeight: 0.95 }}
            >
              {league.name}
            </h1>
            <div className="flex gap-2 flex-wrap">
              <TierBadge tier={league.tier} />
              <StatusBadge status={league.status} />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'ENTRY FEE', value: `${lamportsToSol(league.entry_fee)} SOL` },
              { label: 'CLUBS JOINED', value: `${league.clubs_count} / ${league.max_clubs}` },
              { label: 'PRIZE POOL', value: `${prizePool} SOL` },
              { label: 'KICKOFF', value: formatTime(league.kickoff_time) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#111118] border border-[#2a2a38] p-4">
                <p className="font-display font-bold text-[10px] tracking-widest text-[#888888]">{label}</p>
                <p className="font-display font-black text-[#f5a623] text-xl mt-1 leading-tight">{value}</p>
              </div>
            ))}
          </div>

          {/* JOIN button — Active leagues only */}
          {league.status === 'Active' && (
            <div className="mt-8 flex items-center gap-4 p-5 border border-[#f5a623]/20 bg-[#f5a623]/5">
              <div className="flex-1">
                <p className="font-display font-black text-[#f0f0f0] text-lg leading-tight">
                  JOIN THIS LEAGUE
                </p>
                <p className="font-body text-[#888888] text-sm mt-1">
                  Entry fee: {lamportsToSol(league.entry_fee)} SOL · Spots left:{' '}
                  {league.max_clubs - league.clubs_count}
                </p>
              </div>
              {connected ? (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="h-11 px-8 bg-[#f5a623] text-[#0a0a0f] font-display font-black text-sm tracking-widest hover:bg-[#d4901f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joining ? 'JOINING…' : 'JOIN LEAGUE'}
                </button>
              ) : (
                <p className="font-display font-bold text-xs tracking-widest text-[#888888]">
                  CONNECT WALLET TO JOIN
                </p>
              )}
            </div>
          )}

          {/* Standings table */}
          <div className="mt-12">
            <h2 className="font-display font-black text-[#f0f0f0] text-2xl tracking-wide mb-4">
              STANDINGS
            </h2>
            {league.standings && league.standings.length > 0 ? (
              <div className="border border-[#2a2a38] overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-[#2a2a38] bg-[#111118]">
                      {['RANK', 'CLUB', 'P', 'GF', 'GA', 'PTS'].map((h) => (
                        <th
                          key={h}
                          className="py-3 px-4 font-display font-bold text-[10px] tracking-widest text-[#888888] text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {league.standings.map((standing, idx) => (
                      <StandingsRow key={standing.pubkey} standing={standing} rank={idx + 1} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-[#2a2a38] p-12 text-center">
                <p className="font-display font-bold text-[#888888] tracking-wide">NO STANDINGS YET</p>
                <p className="font-body text-[#888888] text-sm mt-2">
                  Standings will appear once the transfer window closes.
                </p>
              </div>
            )}
          </div>

          {/* Transfer window */}
          {showTransferWindow && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display font-black text-[#f0f0f0] text-2xl tracking-wide">
                  TRANSFER WINDOW
                </h2>
                {league.status === 'Active' && (
                  <span className="text-[10px] font-display font-bold tracking-widest text-[#22c55e] border border-[#22c55e]/30 bg-[#22c55e]/10 px-2 py-0.5">
                    OPEN
                  </span>
                )}
                {league.status === 'Locked' && (
                  <span className="text-[10px] font-display font-bold tracking-widest text-[#888888] border border-[#888888]/30 bg-[#888888]/10 px-2 py-0.5">
                    CLOSED
                  </span>
                )}
              </div>

              {availablePlayers && availablePlayers.length > 0 ? (
                <div className="border border-[#2a2a38] overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#2a2a38] bg-[#111118]">
                        {['PLAYER', 'POS', 'RATING', 'PRICE', ''].map((h) => (
                          <th
                            key={h}
                            className={`py-3 px-4 font-display font-bold text-[10px] tracking-widest text-[#888888] text-left${
                              h === 'PRICE' || h === '' ? ' text-right' : ''
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {availablePlayers.map((player) => (
                        <PlayerRow key={player.player_id} player={player} onBuy={handleBuy} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-[#2a2a38] p-12 text-center">
                  <p className="font-display font-bold text-[#888888] tracking-wide">NO AVAILABLE PLAYERS</p>
                  <p className="font-body text-[#888888] text-sm mt-2">
                    All players are currently locked in leagues.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Matches */}
          <div className="mt-12">
            <h2 className="font-display font-black text-[#f0f0f0] text-2xl tracking-wide mb-4">
              MATCHES
            </h2>
            {matches && matches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} leaguePubkey={pubkey} />
                ))}
              </div>
            ) : (
              <div className="border border-[#2a2a38] p-12 text-center">
                <p className="font-display font-bold text-[#888888] tracking-wide">NO MATCHES YET</p>
                <p className="font-body text-[#888888] text-sm mt-2">
                  Fixtures are generated when the transfer window closes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
