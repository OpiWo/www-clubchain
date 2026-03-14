import Link from 'next/link';
import { League } from '@/lib/api';
import { StatusBadge, TierBadge } from './Badge';

function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(1);
}

function formatKickoff(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    return `Kickoff: ${time} UTC ${isToday ? 'today' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  } catch {
    return 'Kickoff: TBD';
  }
}

interface LeagueCardProps {
  league: League;
}

export function LeagueCard({ league }: LeagueCardProps) {
  const fillPct = Math.round((league.clubs_count / league.max_clubs) * 100);

  return (
    <Link href={`/leagues/${league.pubkey}`} className="block group">
      <div className="bg-[#111118] border border-[#2a2a38] p-6 flex flex-col gap-4 hover:border-[#f5a623]/40 transition-colors duration-200 h-full">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <TierBadge tier={league.tier} />
          <StatusBadge status={league.status} />
        </div>

        {/* League name */}
        <h3 className="font-display font-bold text-xl text-[#f0f0f0] leading-tight group-hover:text-[#f5a623] transition-colors">
          {league.name}
        </h3>

        {/* Entry fee + count */}
        <div className="flex items-end justify-between">
          <div>
            <span className="font-display font-black text-4xl text-[#f5a623] leading-none">
              {lamportsToSol(league.entry_fee)}
            </span>
            <span className="font-display font-bold text-lg text-[#888888] ml-1">SOL</span>
          </div>
          <span className="font-display font-bold text-sm text-[#888888]">
            {league.clubs_count}/{league.max_clubs}
          </span>
        </div>

        {/* Kickoff */}
        <p className="font-body text-xs text-[#888888]">{formatKickoff(league.kickoff_time)}</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#2a2a38] w-full">
          <div
            className="h-full bg-[#f5a623] transition-all duration-300"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <p className="font-body text-xs text-[#888888] -mt-2">
          {league.clubs_count} club{league.clubs_count !== 1 ? 's' : ''} joined
        </p>
      </div>
    </Link>
  );
}
