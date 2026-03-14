'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, Player } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { Skeleton } from '@/components/ui/Skeleton';

type Position = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';

const POSITION_COLORS: Record<string, string> = {
  GK: '#3b82f6',
  DEF: '#22c55e',
  MID: '#f5a623',
  FWD: '#e84545',
};

function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(3);
}

function PositionBadge({ position }: { position: string }) {
  const color = POSITION_COLORS[position] ?? '#888888';
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-display font-bold tracking-widest"
      style={{ color, border: `1px solid ${color}40`, background: `${color}18` }}
    >
      {position}
    </span>
  );
}

function RatingBar({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-[#2a2a38] relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#f5a623]"
          style={{ width: `${rating}%` }}
        />
      </div>
      <span className="font-display font-black text-sm text-[#f0f0f0] w-6 text-right leading-none">
        {rating}
      </span>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const isAvailable = !player.current_league;
  return (
    <Link
      href={`/players/${player.player_id}`}
      className="group block bg-[#111118] border border-[#2a2a38] hover:border-[#f5a623]/50 transition-all duration-200 hover:-translate-y-px"
    >
      <div className="p-5">
        {/* Top row: position badge + availability */}
        <div className="flex items-center justify-between mb-3">
          <PositionBadge position={player.position} />
          <span
            className={`text-[10px] font-display font-bold tracking-widest ${
              isAvailable ? 'text-[#22c55e]' : 'text-[#888888]'
            }`}
          >
            {isAvailable ? '● AVAILABLE' : '● LOCKED'}
          </span>
        </div>

        {/* Name */}
        <h3
          className="font-display font-black text-[#f0f0f0] leading-none mb-1 group-hover:text-[#f5a623] transition-colors"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
        >
          {player.name}
        </h3>
        <p className="font-body text-[#888888] text-xs mb-4">{player.nationality}</p>

        {/* Rating */}
        <div className="mb-4">
          <p className="font-display font-bold text-[9px] tracking-widest text-[#888888] mb-1.5">RATING</p>
          <RatingBar rating={player.rating} />
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-[#2a2a38] flex items-center justify-between">
          <span className="font-display font-bold text-[9px] tracking-widest text-[#888888]">PRICE</span>
          <span className="font-display font-black text-[#f5a623] text-sm">
            {lamportsToSol(player.price)} SOL
          </span>
        </div>
      </div>
    </Link>
  );
}

function PlayerCardSkeleton() {
  return (
    <div className="bg-[#111118] border border-[#2a2a38] p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <div className="pt-3 border-t border-[#2a2a38]">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const [position, setPosition] = useState<Position>('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['players', position, availableOnly],
    queryFn: () =>
      api.getPlayers({
        position: position === 'ALL' ? undefined : position,
        available: availableOnly || undefined,
        limit: 40,
      }),
    staleTime: 30_000,
  });

  const POSITIONS: Position[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="font-display font-bold text-[10px] tracking-widest text-[#f5a623] mb-2">
              GLOBAL POOL
            </p>
            <h1
              className="font-display font-black text-[#f0f0f0] leading-none"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.01em', lineHeight: 0.95 }}
            >
              PLAYERS
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Position tabs */}
            <div className="flex border border-[#2a2a38]">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-4 py-2 font-display font-bold text-xs tracking-widest transition-colors ${
                    position === pos
                      ? 'bg-[#f5a623] text-[#0a0a0f]'
                      : 'text-[#888888] hover:text-[#f0f0f0]'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            {/* Available toggle */}
            <button
              onClick={() => setAvailableOnly((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 border font-display font-bold text-xs tracking-widest transition-colors ${
                availableOnly
                  ? 'border-[#22c55e] text-[#22c55e] bg-[#22c55e]/10'
                  : 'border-[#2a2a38] text-[#888888] hover:border-[#f0f0f0] hover:text-[#f0f0f0]'
              }`}
            >
              <span className="text-[8px]">●</span> AVAILABLE ONLY
            </button>

            {!isLoading && players && (
              <span className="font-body text-[#888888] text-xs ml-auto">
                {players.length} players
              </span>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlayerCardSkeleton key={i} />
              ))}
            </div>
          ) : players && players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player) => (
                <PlayerCard key={player.player_id} player={player} />
              ))}
            </div>
          ) : (
            <div className="border border-[#2a2a38] p-20 text-center">
              <p className="font-display font-black text-[#888888] text-2xl tracking-wide">NO PLAYERS FOUND</p>
              <p className="font-body text-[#888888] text-sm mt-2">
                {availableOnly ? 'No available players match the filter.' : 'The player pool is empty.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
