'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api, Match, MatchEvent, Commentary } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncate(str: string, len = 8): string {
  if (str.length <= len * 2 + 3) return str;
  return `${str.slice(0, len)}...${str.slice(-len)}`;
}

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  save: '🧤',
  miss: '❌',
  kickoff: '🏁',
  halftime: '⏸',
  fulltime: '🏆',
};

const EVENT_LABELS: Record<string, string> = {
  goal: 'GOAL',
  save: 'SAVE',
  miss: 'MISSED',
  kickoff: 'KICK OFF',
  halftime: 'HALF TIME',
  fulltime: 'FULL TIME',
};

// ─── Status badge ─────────────────────────────────────────────────────────────

function MatchStatusBadge({ status }: { status: Match['status'] }) {
  const cfg = {
    scheduled: { color: '#888888', label: 'SCHEDULED', pulse: false },
    playing: { color: '#22c55e', label: 'LIVE', pulse: true },
    finished: { color: '#f5a623', label: 'FINISHED', pulse: false },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-display font-bold tracking-widest"
      style={{ color: cfg.color, border: `1px solid ${cfg.color}40`, background: `${cfg.color}18` }}
    >
      {cfg.pulse && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: cfg.color }}
        />
      )}
      {cfg.label}
    </span>
  );
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────

function Scoreboard({ match }: { match: Match }) {
  const hasScore = match.home_score !== null && match.away_score !== null;
  const homeName = match.home_club_name ?? truncate(match.home_club, 10);
  const awayName = match.away_club_name ?? truncate(match.away_club, 10);

  return (
    <div className="relative border border-[#2a2a38] bg-[#111118] overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #f5a623 0px, #f5a623 1px, transparent 1px, transparent 40px)',
        }}
      />

      <div className="relative z-10 p-8 md:p-12">
        <div className="flex items-center justify-center gap-6 md:gap-12">
          {/* Home */}
          <div className="flex-1 text-right">
            <p className="font-body text-[#888888] text-xs tracking-widest mb-2">HOME</p>
            <h2
              className="font-display font-black text-[#f0f0f0] leading-none"
              style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)' }}
            >
              {homeName}
            </h2>
          </div>

          {/* Score */}
          <div className="shrink-0 text-center">
            {hasScore ? (
              <div
                className="font-display font-black text-[#f5a623] leading-none"
                style={{ fontSize: 'clamp(3rem, 12vw, 8rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                {match.home_score} — {match.away_score}
              </div>
            ) : (
              <div
                className="font-display font-black text-[#2a2a38] leading-none animate-pulse"
                style={{ fontSize: 'clamp(3rem, 12vw, 8rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                — —
              </div>
            )}
            <div className="mt-3 flex justify-center">
              <MatchStatusBadge status={match.status} />
            </div>
          </div>

          {/* Away */}
          <div className="flex-1 text-left">
            <p className="font-body text-[#888888] text-xs tracking-widest mb-2">AWAY</p>
            <h2
              className="font-display font-black text-[#f0f0f0] leading-none"
              style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)' }}
            >
              {awayName}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event timeline ───────────────────────────────────────────────────────────

function EventRow({ event, visible }: { event: MatchEvent; visible: boolean }) {
  const isGoal = event.event_type === 'goal';
  return (
    <div
      className={`flex items-start gap-4 py-3 border-b border-[#2a2a38] last:border-b-0 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="w-10 shrink-0 text-center">
        <span className="font-display font-black text-xs text-[#888888]">{event.minute}&apos;</span>
      </div>
      <div className="shrink-0 w-7 text-center text-base leading-none mt-0.5">
        {EVENT_ICONS[event.event_type] ?? '·'}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={`font-display font-bold text-xs tracking-widest ${
            isGoal ? 'text-[#f5a623]' : 'text-[#888888]'
          }`}
        >
          {EVENT_LABELS[event.event_type] ?? event.event_type.toUpperCase()}
        </span>
        {event.player_name && (
          <span className="font-body text-[#f0f0f0] text-xs ml-2">{event.player_name}</span>
        )}
      </div>
    </div>
  );
}

// ─── Commentary feed ──────────────────────────────────────────────────────────

function CommentaryFeed({
  commentary,
  isLive,
}: {
  commentary: Commentary[];
  isLive: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (!isLive) {
      setVisibleCount(commentary.length);
      return;
    }
    // Animate new entries one by one at 3.3 s intervals
    const newItems = commentary.length - prevLengthRef.current;
    if (newItems <= 0) return;

    let i = 0;
    const reveal = () => {
      i++;
      setVisibleCount(prevLengthRef.current + i);
      if (i < newItems) setTimeout(reveal, 3300);
      else prevLengthRef.current = commentary.length;
    };
    setTimeout(reveal, 300);
  }, [commentary.length, isLive]);

  if (commentary.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-display font-bold text-[#888888] text-sm tracking-wide">
          {isLive ? 'COMMENTARY LOADING…' : 'NO COMMENTARY AVAILABLE'}
        </p>
      </div>
    );
  }

  const visible = isLive ? commentary.slice(0, visibleCount) : commentary;

  return (
    <div className="space-y-0 divide-y divide-[#2a2a38]">
      {visible.map((c) => (
        <div key={c.id} className="px-5 py-4 flex items-start gap-3">
          <span className="font-display font-black text-[10px] text-[#f5a623] shrink-0 w-8 mt-0.5">
            {c.minute}&apos;
          </span>
          <p className="font-body text-[#f0f0f0] text-sm leading-relaxed">{c.text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MatchViewerPage() {
  const params = useParams();
  const pubkey = params.pubkey as string;
  const matchId = Number(params.matchId);

  const isLiveOrScheduled = (status?: Match['status']) =>
    status === 'playing' || status === 'scheduled';

  const { data: events } = useQuery<MatchEvent[]>({
    queryKey: ['match-events', matchId],
    queryFn: () => api.getMatchEvents(matchId),
    enabled: !isNaN(matchId),
    refetchInterval: (query) =>
      isLiveOrScheduled(query.state.data ? undefined : undefined) ? 10_000 : false,
  });

  const { data: commentary, isLoading: commentaryLoading } = useQuery<Commentary[]>({
    queryKey: ['match-commentary', matchId],
    queryFn: () => api.getMatchCommentary(matchId),
    enabled: !isNaN(matchId),
    refetchInterval: 5_000,
  });

  // We need the match status — derive from events or fetch separately via league
  // Use a simple polling query for the match status via getMatches (no single-match endpoint)
  const [matchData, setMatchData] = useState<Match | null>(null);

  // Fetch match list for the league to get this specific match's data
  const { data: allMatches, isLoading: matchLoading } = useQuery<Match[]>({
    queryKey: ['matches-for-viewer', pubkey],
    queryFn: () => api.getMatches(pubkey),
    enabled: !!pubkey,
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (allMatches) {
      const found = allMatches.find((m) => m.id === matchId);
      if (found) setMatchData(found);
    }
  }, [allMatches, matchId]);

  if (matchLoading && !matchData) return <LoadingSkeleton />;

  if (!matchData && !matchLoading) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <div className="border border-[#e84545]/30 bg-[#e84545]/5 p-12 text-center">
              <p className="font-display font-black text-[#e84545] text-2xl tracking-wide">MATCH NOT FOUND</p>
              <Link
                href={`/leagues/${pubkey}`}
                className="mt-6 inline-flex h-10 px-6 border border-[#2a2a38] text-[#888888] font-display font-bold text-xs tracking-widest items-center hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
              >
                ← BACK TO LEAGUE
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const isLive = matchData?.status === 'playing';
  const isFinished = matchData?.status === 'finished';

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href={`/leagues/${pubkey}`}
            className="font-display font-bold text-xs tracking-widest text-[#888888] hover:text-[#f5a623] transition-colors"
          >
            ← BACK TO LEAGUE
          </Link>

          {/* Scoreboard */}
          <div className="mt-6 mb-10">
            {matchData ? (
              <Scoreboard match={matchData} />
            ) : (
              <Skeleton className="h-48 w-full" />
            )}
          </div>

          {/* Two-column: commentary + events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commentary */}
            <div className="border border-[#2a2a38]">
              <div className="px-5 py-4 border-b border-[#2a2a38] bg-[#111118] flex items-center justify-between">
                <h3 className="font-display font-black text-[#f0f0f0] tracking-wide">COMMENTARY</h3>
                {isLive && (
                  <span className="text-[9px] font-display font-bold tracking-widest text-[#22c55e] flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              {commentaryLoading ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <CommentaryFeed commentary={commentary ?? []} isLive={isLive} />
              )}
            </div>

            {/* Event timeline */}
            <div className="border border-[#2a2a38]">
              <div className="px-5 py-4 border-b border-[#2a2a38] bg-[#111118]">
                <h3 className="font-display font-black text-[#f0f0f0] tracking-wide">MATCH EVENTS</h3>
              </div>
              <div className="divide-y divide-[#2a2a38]">
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      visible={isFinished || true}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="font-display font-bold text-[#888888] text-sm tracking-wide">
                      {matchData?.status === 'scheduled' ? 'MATCH NOT STARTED' : 'NO EVENTS YET'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
