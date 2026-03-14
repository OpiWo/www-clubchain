'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api, Club } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { Skeleton } from '@/components/ui/Skeleton';

const BADGE_COLORS = [
  '#e84545', '#f5a623', '#22c55e', '#3b82f6',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
  '#84cc16', '#06b6d4', '#6366f1', '#d946ef',
  '#0ea5e9', '#eab308', '#10b981', '#ef4444',
];

function truncate(str: string, len = 6): string {
  if (str.length <= len * 2 + 3) return str;
  return `${str.slice(0, len)}...${str.slice(-len)}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ClubBadge({ badge }: { badge: number }) {
  const color = BADGE_COLORS[badge % BADGE_COLORS.length] ?? '#888888';
  return (
    <div
      className="w-20 h-20 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-label={`Badge ${badge}`}
    />
  );
}

export default function ClubProfilePage() {
  const params = useParams();
  const pubkey = params.pubkey as string;

  const { data: club, isLoading, isError } = useQuery<Club>({
    queryKey: ['club', pubkey],
    queryFn: () => api.getClub(pubkey),
    retry: 1,
    enabled: !!pubkey,
  });

  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex gap-6 items-center">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </>
    );
  }

  if (isError || !club) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div className="border border-[#e84545]/30 bg-[#e84545]/5 p-12 text-center">
              <p className="font-display font-black text-[#e84545] text-2xl tracking-wide">
                CLUB NOT FOUND
              </p>
              <p className="font-body text-[#888888] text-sm mt-3">
                This club does not exist or the address is invalid.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-10 px-6 border border-[#2a2a38] text-[#888888] font-display font-bold text-xs tracking-widest items-center hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
              >
                ← HOME
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Club identity */}
          <div className="flex items-center gap-6 mb-10">
            <ClubBadge badge={club.badge} />
            <div>
              <h1
                className="font-display font-black text-[#f0f0f0] leading-none"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}
              >
                {club.name}
              </h1>
              <p className="font-body text-[#888888] text-sm mt-2">Badge #{club.badge}</p>
            </div>
          </div>

          {/* Details */}
          <div className="border border-[#2a2a38] divide-y divide-[#2a2a38]">
            {[
              { label: 'MANAGER', value: truncate(club.manager, 8) },
              { label: 'CLUB ADDRESS', value: truncate(club.pubkey, 8) },
              { label: 'CREATED', value: formatDate(club.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-6 py-4">
                <span className="font-display font-bold text-[10px] tracking-widest text-[#888888]">
                  {label}
                </span>
                <span className="font-body text-[#f0f0f0] text-sm font-mono">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/leagues"
              className="inline-flex h-12 px-8 bg-[#f5a623] text-[#0a0a0f] font-display font-black text-sm tracking-widest items-center hover:bg-[#b87d1a] transition-colors"
            >
              BROWSE LEAGUES
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
