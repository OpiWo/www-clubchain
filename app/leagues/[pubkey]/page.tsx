'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api, LeagueDetail, Standing } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { StatusBadge, TierBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(2);
}

function truncate(str: string, len = 8): string {
  if (str.length <= len * 2 + 3) return str;
  return `${str.slice(0, len)}...${str.slice(-len)}`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }) + ' UTC';
  } catch {
    return iso;
  }
}

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

export default function LeagueDetailPage() {
  const params = useParams();
  const pubkey = params.pubkey as string;

  const { data: league, isLoading, isError } = useQuery<LeagueDetail>({
    queryKey: ['league', pubkey],
    queryFn: () => api.getLeague(pubkey),
    retry: 1,
    enabled: !!pubkey,
  });

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
                <p className="font-display font-bold text-[#888888] tracking-wide">
                  NO STANDINGS YET
                </p>
                <p className="font-body text-[#888888] text-sm mt-2">
                  Standings will appear once the transfer window closes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
