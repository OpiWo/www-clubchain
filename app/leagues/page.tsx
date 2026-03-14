'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, League } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { LeagueCard } from '@/components/ui/LeagueCard';
import { LeagueCardSkeleton } from '@/components/ui/Skeleton';
import clsx from 'clsx';

type StatusFilter = 'ALL' | 'Active' | 'Playing' | 'Finished';

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'Active', 'Playing', 'Finished'];

export default function LeaguesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data: leagues, isLoading, isError } = useQuery<League[]>({
    queryKey: ['leagues', statusFilter],
    queryFn: () =>
      api.getLeagues(statusFilter !== 'ALL' ? { status: statusFilter } : undefined),
    retry: 1,
  });

  const filteredLeagues = leagues ?? [];

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="mb-12">
            <h1
              className="font-display font-black text-[#f0f0f0] leading-none"
              style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', letterSpacing: '-0.02em', lineHeight: 0.9 }}
            >
              LEAGUES
            </h1>
            <div className="h-1 bg-[#f5a623] mt-4 w-24" />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 mb-8">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  'h-8 px-4 font-display font-bold text-xs tracking-widest transition-colors',
                  statusFilter === s
                    ? 'bg-[#f5a623] text-[#0a0a0f]'
                    : 'border border-[#2a2a38] text-[#888888] hover:border-[#f5a623] hover:text-[#f5a623]'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LeagueCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="border border-[#e84545]/30 bg-[#e84545]/5 p-8 text-center">
              <p className="font-display font-bold text-[#e84545] tracking-wide">
                FAILED TO LOAD LEAGUES
              </p>
              <p className="font-body text-[#888888] text-sm mt-2">
                The API may be unavailable. Try again later.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredLeagues.length === 0 && (
            <div className="border border-[#2a2a38] p-16 text-center">
              <p className="font-display font-black text-[#888888] text-2xl tracking-widest">
                NO LEAGUES FOUND
              </p>
              <p className="font-body text-[#888888] text-sm mt-3">
                {statusFilter !== 'ALL'
                  ? `No ${statusFilter.toLowerCase()} leagues right now.`
                  : 'No leagues have been created yet.'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredLeagues.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeagues.map((league) => (
                <LeagueCard key={league.pubkey} league={league} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
