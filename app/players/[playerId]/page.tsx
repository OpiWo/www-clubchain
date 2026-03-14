'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api, Player } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { Skeleton } from '@/components/ui/Skeleton';

const POSITION_COLORS: Record<string, string> = {
  GK: '#3b82f6',
  DEF: '#22c55e',
  MID: '#f5a623',
  FWD: '#e84545',
};

function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(3);
}

function truncate(str: string, len = 8): string {
  if (str.length <= len * 2 + 3) return str;
  return `${str.slice(0, len)}...${str.slice(-len)}`;
}

function RatingMeter({ rating }: { rating: number }) {
  const bars = 20;
  const filled = Math.round((rating / 100) * bars);
  return (
    <div className="flex items-end gap-[3px] h-10">
      {Array.from({ length: bars }).map((_, i) => {
        const isFilled = i < filled;
        const height = 30 + ((i / bars) * 70);
        return (
          <div
            key={i}
            className="w-2 transition-colors"
            style={{
              height: `${height}%`,
              backgroundColor: isFilled ? '#f5a623' : '#2a2a38',
              opacity: isFilled ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-2/3" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </main>
    </>
  );
}

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = Number(params.playerId);

  const { data: player, isLoading, isError } = useQuery<Player>({
    queryKey: ['player', playerId],
    queryFn: () => api.getPlayer(playerId),
    enabled: !isNaN(playerId),
    retry: 1,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !player) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="border border-[#e84545]/30 bg-[#e84545]/5 p-12 text-center">
              <p className="font-display font-black text-[#e84545] text-2xl tracking-wide">PLAYER NOT FOUND</p>
              <Link
                href="/players"
                className="mt-6 inline-flex h-10 px-6 border border-[#2a2a38] text-[#888888] font-display font-bold text-xs tracking-widest items-center hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
              >
                ← BACK TO PLAYERS
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const posColor = POSITION_COLORS[player.position] ?? '#888888';
  const isAvailable = !player.current_league;

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/players"
            className="font-display font-bold text-xs tracking-widest text-[#888888] hover:text-[#f5a623] transition-colors"
          >
            ← PLAYERS
          </Link>

          {/* Hero — position accent line */}
          <div className="mt-6 mb-10 relative pl-6" style={{ borderLeft: `3px solid ${posColor}` }}>
            <span
              className="inline-flex items-center px-2 py-0.5 text-[10px] font-display font-bold tracking-widest mb-3"
              style={{ color: posColor, border: `1px solid ${posColor}40`, background: `${posColor}18` }}
            >
              {player.position}
            </span>
            <h1
              className="font-display font-black text-[#f0f0f0] leading-none"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-0.02em', lineHeight: 0.9 }}
            >
              {player.name}
            </h1>
            <div className="mt-3 flex items-center gap-4">
              <span className="font-body text-[#888888] text-sm">{player.nationality}</span>
              {player.club_team && (
                <>
                  <span className="text-[#2a2a38]">·</span>
                  <span className="font-body text-[#888888] text-sm">{player.club_team}</span>
                </>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-[#111118] border border-[#2a2a38] p-5">
              <p className="font-display font-bold text-[9px] tracking-widest text-[#888888] mb-1">RATING</p>
              <p className="font-display font-black text-[#f5a623] text-4xl leading-none">{player.rating}</p>
            </div>
            <div className="bg-[#111118] border border-[#2a2a38] p-5">
              <p className="font-display font-bold text-[9px] tracking-widest text-[#888888] mb-1">PRICE</p>
              <p className="font-display font-black text-[#f5a623] text-2xl leading-none">
                {lamportsToSol(player.price)}
              </p>
              <p className="font-display font-bold text-[9px] tracking-widest text-[#888888] mt-1">SOL</p>
            </div>
            <div className="bg-[#111118] border border-[#2a2a38] p-5 col-span-2 md:col-span-1">
              <p className="font-display font-bold text-[9px] tracking-widest text-[#888888] mb-1">STATUS</p>
              <p
                className="font-display font-black text-xl leading-none"
                style={{ color: isAvailable ? '#22c55e' : '#888888' }}
              >
                {isAvailable ? 'AVAILABLE' : 'LOCKED'}
              </p>
            </div>
          </div>

          {/* Rating visualiser */}
          <div className="bg-[#111118] border border-[#2a2a38] p-6 mb-6">
            <p className="font-display font-bold text-[9px] tracking-widest text-[#888888] mb-4">RATING PROFILE</p>
            <RatingMeter rating={player.rating} />
          </div>

          {/* League lock */}
          {player.current_league && (
            <div className="border border-[#f5a623]/30 bg-[#f5a623]/5 p-5 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-[9px] tracking-widest text-[#f5a623] mb-1">
                  LOCKED IN LEAGUE
                </p>
                <p className="font-body text-[#888888] text-xs font-mono">
                  {truncate(player.current_league)}
                </p>
              </div>
              <Link
                href={`/leagues/${player.current_league}`}
                className="flex-shrink-0 h-9 px-5 border border-[#f5a623] text-[#f5a623] font-display font-bold text-xs tracking-widest inline-flex items-center hover:bg-[#f5a623] hover:text-[#0a0a0f] transition-colors"
              >
                VIEW LEAGUE →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
