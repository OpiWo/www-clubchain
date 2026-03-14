'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, League, Player, OracleStatus } from '@/lib/api';
import { StatusBadge, TierBadge } from '@/components/ui/Badge';

function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(2);
}

function truncate(str: string, len = 8): string {
  if (str.length <= len * 2 + 3) return str;
  return `${str.slice(0, len)}...${str.slice(-len)}`;
}

const POSITION_COLORS: Record<string, string> = {
  GK: '#3b82f6',
  DEF: '#22c55e',
  MID: '#f5a623',
  FWD: '#e84545',
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[#2a2a38] bg-[#0d0d14] p-5">
      <p className="font-mono text-[9px] tracking-widest text-[#444455] mb-1">{label}</p>
      <p className="font-display font-black text-[#f5a623] text-3xl leading-none">{value}</p>
      {sub && <p className="font-mono text-[#444455] text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-mono text-[10px] tracking-widest text-[#444455]">›</span>
      <h2 className="font-display font-black text-[#f0f0f0] text-lg tracking-wide">{children}</h2>
      <div className="flex-1 border-t border-[#2a2a38]" />
    </div>
  );
}

// ─── Job monitor ──────────────────────────────────────────────────────────────

const JOBS = [
  { name: 'close-transfer-window', schedule: '14:00 UTC daily', status: 'active' },
  { name: 'run-match', schedule: 'Hourly 14:00–23:00 UTC', status: 'active' },
  { name: 'distribute-prizes', schedule: '00:00 UTC daily', status: 'active' },
];

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('asgard_token') : null;
    if (!t) {
      router.replace('/admin/login');
    } else {
      setToken(t);
    }
  }, [router]);

  const [bootstrapMsg, setBootstrapMsg] = useState('');
  const [bootstrapping, setBootstrapping] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { data: oracleStatus, refetch: refetchOracle } = useQuery<OracleStatus>({
    queryKey: ['oracle-status', token],
    queryFn: () => api.asgardGetOracleStatus(token!),
    enabled: !!token,
    refetchInterval: 15_000,
  });

  async function handleInitialize() {
    if (!token) return;
    setBootstrapping(true);
    setBootstrapMsg('');
    try {
      const res = await api.asgardInitializeProtocol(token, {
        entryFeeBps: 300,
        purchaseFeeBps: 200,
        prizeFeeBps: 300,
      });
      setBootstrapMsg(`✓ Protocol initialized — config PDA: ${res.configPda}`);
      refetchOracle();
    } catch (e) {
      setBootstrapMsg(`✗ ${(e as Error).message}`);
    } finally {
      setBootstrapping(false);
    }
  }

  async function handleAirdrop() {
    if (!token) return;
    setAirdropping(true);
    setBootstrapMsg('');
    try {
      const res = await api.asgardRequestAirdrop(token, 2);
      setBootstrapMsg(`✓ Airdrop: ${res.amount} SOL — balance now ${res.balance.toFixed(3)} SOL`);
      refetchOracle();
    } catch (e) {
      setBootstrapMsg(`✗ ${(e as Error).message}`);
    } finally {
      setAirdropping(false);
    }
  }

  async function handleGeneratePlayers() {
    if (!token) return;
    setGenerating(true);
    setBootstrapMsg('');
    try {
      const res = await api.asgardGeneratePlayers(token, 20);
      setBootstrapMsg(`✓ Generated ${res.generated} players`);
    } catch (e) {
      setBootstrapMsg(`✗ ${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  }

  const { data: leagues, isLoading: leaguesLoading } = useQuery<League[]>({
    queryKey: ['asgard-leagues', token],
    queryFn: () => api.asgardGetLeagues(token!),
    enabled: !!token,
    retry: 1,
  });

  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['asgard-players', token],
    queryFn: () => api.asgardGetPlayers(token!),
    enabled: !!token,
    retry: 1,
  });

  function logout() {
    if (typeof window !== 'undefined') localStorage.removeItem('asgard_token');
    router.push('/admin/login');
  }

  if (!token) return null;

  // Derived stats
  const totalLeagues = leagues?.length ?? 0;
  const activeLeagues = leagues?.filter((l) => l.status === 'Active' || l.status === 'Playing').length ?? 0;
  const totalPlayers = players?.length ?? 0;
  const prizePool = leagues?.reduce((acc, l) => {
    return acc + (l.entry_fee * l.clubs_count * 0.97) / 1_000_000_000;
  }, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#07070b] text-[#f0f0f0]">
      {/* Top bar */}
      <header className="border-b border-[#2a2a38] bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display font-black text-[#f5a623] text-lg tracking-widest">ASGARD</span>
            <span className="font-mono text-[10px] text-[#444455] tracking-widest">CONTROL PANEL</span>
          </div>
          <button
            onClick={logout}
            className="font-mono text-[10px] tracking-widest text-[#444455] hover:text-[#e84545] transition-colors"
          >
            LOGOUT ×
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="TOTAL LEAGUES" value={leaguesLoading ? '…' : totalLeagues} />
          <StatCard label="ACTIVE / PLAYING" value={leaguesLoading ? '…' : activeLeagues} />
          <StatCard label="TOTAL PLAYERS" value={playersLoading ? '…' : totalPlayers} />
          <StatCard
            label="TOTAL PRIZE POOLS"
            value={leaguesLoading ? '…' : `${prizePool.toFixed(2)}`}
            sub="SOL"
          />
        </div>

        {/* League table */}
        <div>
          <SectionHeading>LEAGUES</SectionHeading>
          <div className="border border-[#2a2a38] overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#2a2a38] bg-[#0d0d14]">
                  {['NAME', 'TIER', 'STATUS', 'CLUBS', 'ENTRY FEE', 'PRIZE POOL', 'PUBKEY'].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 font-mono text-[9px] tracking-widest text-[#444455] text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaguesLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center font-mono text-[#444455] text-xs">
                      LOADING…
                    </td>
                  </tr>
                ) : leagues && leagues.length > 0 ? (
                  leagues.map((league) => (
                    <tr
                      key={league.pubkey}
                      className="border-b border-[#2a2a38] last:border-b-0 hover:bg-[#111118]/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-display font-bold text-[#f0f0f0] text-sm">
                        {league.name}
                      </td>
                      <td className="py-3 px-4">
                        <TierBadge tier={league.tier} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={league.status} />
                      </td>
                      <td className="py-3 px-4 font-mono text-[#888888] text-xs">
                        {league.clubs_count}/{league.max_clubs}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#888888] text-xs">
                        {lamportsToSol(league.entry_fee)} SOL
                      </td>
                      <td className="py-3 px-4 font-mono text-[#f5a623] text-xs">
                        {lamportsToSol(league.entry_fee * league.clubs_count * 0.97)} SOL
                      </td>
                      <td className="py-3 px-4 font-mono text-[#444455] text-[10px]">
                        {truncate(league.pubkey)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center font-mono text-[#444455] text-xs">
                      NO LEAGUES FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player table */}
        <div>
          <SectionHeading>PLAYER POOL</SectionHeading>
          <div className="border border-[#2a2a38] overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#2a2a38] bg-[#0d0d14]">
                  {['ID', 'NAME', 'POS', 'RATING', 'PRICE', 'STATUS'].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 font-mono text-[9px] tracking-widest text-[#444455] text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playersLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center font-mono text-[#444455] text-xs">
                      LOADING…
                    </td>
                  </tr>
                ) : players && players.length > 0 ? (
                  players.slice(0, 50).map((player) => {
                    const posColor = POSITION_COLORS[player.position] ?? '#888888';
                    const isAvailable = !player.current_league;
                    return (
                      <tr
                        key={player.player_id}
                        className="border-b border-[#2a2a38] last:border-b-0 hover:bg-[#111118]/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-[#444455] text-xs">{player.player_id}</td>
                        <td className="py-3 px-4 font-display font-bold text-[#f0f0f0] text-sm">
                          {player.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5"
                            style={{
                              color: posColor,
                              border: `1px solid ${posColor}40`,
                              background: `${posColor}18`,
                            }}
                          >
                            {player.position}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#888888] text-xs">{player.rating}</td>
                        <td className="py-3 px-4 font-mono text-[#f5a623] text-xs">
                          {lamportsToSol(player.price)} SOL
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: isAvailable ? '#22c55e' : '#888888' }}
                          >
                            {isAvailable ? 'AVAILABLE' : 'LOCKED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center font-mono text-[#444455] text-xs">
                      NO PLAYERS IN POOL
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {players && players.length > 50 && (
              <div className="px-4 py-3 border-t border-[#2a2a38] bg-[#0d0d14]">
                <p className="font-mono text-[#444455] text-[10px] tracking-widest">
                  SHOWING 50 OF {players.length} PLAYERS
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Oracle Bootstrap */}
        <div>
          <SectionHeading>ORACLE &amp; BOOTSTRAP</SectionHeading>
          <div className="border border-[#2a2a38] p-6 space-y-5">
            {/* Status row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#07070b] border border-[#2a2a38] p-4">
                <p className="font-mono text-[9px] tracking-widest text-[#444455] mb-1">ORACLE</p>
                <p className="font-mono text-[10px] text-[#888888] break-all">
                  {oracleStatus ? `${oracleStatus.oracle.pubkey.slice(0, 8)}…` : '…'}
                </p>
              </div>
              <div className="bg-[#07070b] border border-[#2a2a38] p-4">
                <p className="font-mono text-[9px] tracking-widest text-[#444455] mb-1">BALANCE</p>
                <p className={`font-display font-black text-xl ${oracleStatus && oracleStatus.oracle.balance < 0.1 ? 'text-[#e84545]' : 'text-[#f5a623]'}`}>
                  {oracleStatus ? `${oracleStatus.oracle.balance.toFixed(3)} SOL` : '…'}
                </p>
              </div>
              <div className="bg-[#07070b] border border-[#2a2a38] p-4">
                <p className="font-mono text-[9px] tracking-widest text-[#444455] mb-1">PROTOCOL</p>
                <p className={`font-mono text-[10px] font-bold ${oracleStatus?.initialized ? 'text-[#22c55e]' : 'text-[#e84545]'}`}>
                  {oracleStatus === undefined ? '…' : oracleStatus.initialized ? '● INITIALIZED' : '● NOT INITIALIZED'}
                </p>
              </div>
              <div className="bg-[#07070b] border border-[#2a2a38] p-4">
                <p className="font-mono text-[9px] tracking-widest text-[#444455] mb-1">LEAGUES CREATED</p>
                <p className="font-display font-black text-xl text-[#f5a623]">
                  {oracleStatus?.protocolConfig?.leagueCount ?? '—'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAirdrop}
                disabled={airdropping}
                className="h-9 px-5 border border-[#2a2a38] text-[#888888] font-mono text-[10px] tracking-widest hover:border-[#f5a623] hover:text-[#f5a623] transition-colors disabled:opacity-40"
              >
                {airdropping ? 'REQUESTING…' : '↓ AIRDROP 2 SOL (DEVNET)'}
              </button>
              <button
                onClick={handleInitialize}
                disabled={bootstrapping || oracleStatus?.initialized}
                className="h-9 px-5 border font-mono text-[10px] tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-[#f5a623] text-[#f5a623] hover:bg-[#f5a623] hover:text-[#07070b]"
              >
                {bootstrapping ? 'INITIALIZING…' : oracleStatus?.initialized ? '✓ PROTOCOL READY' : '⚡ INITIALIZE PROTOCOL'}
              </button>
              <button
                onClick={handleGeneratePlayers}
                disabled={generating || !oracleStatus?.initialized}
                className="h-9 px-5 border border-[#2a2a38] text-[#888888] font-mono text-[10px] tracking-widest hover:border-[#22c55e] hover:text-[#22c55e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generating ? 'GENERATING…' : '+ GENERATE 20 PLAYERS'}
              </button>
            </div>

            {/* Fee config (when initialized) */}
            {oracleStatus?.protocolConfig && (
              <div className="pt-4 border-t border-[#2a2a38] grid grid-cols-3 gap-4">
                {[
                  { label: 'ENTRY FEE', value: `${oracleStatus.protocolConfig.entryFeeBps} bps` },
                  { label: 'PURCHASE FEE', value: `${oracleStatus.protocolConfig.purchaseFeeBps} bps` },
                  { label: 'PRIZE FEE', value: `${oracleStatus.protocolConfig.prizeFeeBps} bps` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-mono text-[9px] tracking-widest text-[#444455]">{label}</p>
                    <p className="font-mono text-[#888888] text-xs mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Result message */}
            {bootstrapMsg && (
              <div className={`px-4 py-3 border font-mono text-xs ${bootstrapMsg.startsWith('✓') ? 'border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5' : 'border-[#e84545]/30 text-[#e84545] bg-[#e84545]/5'}`}>
                {bootstrapMsg}
              </div>
            )}
          </div>
        </div>

        {/* Job monitor */}
        <div>
          <SectionHeading>JOB SCHEDULER</SectionHeading>
          <div className="border border-[#2a2a38]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a38] bg-[#0d0d14]">
                  {['JOB NAME', 'SCHEDULE', 'STATUS'].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 font-mono text-[9px] tracking-widest text-[#444455] text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JOBS.map((job) => (
                  <tr
                    key={job.name}
                    className="border-b border-[#2a2a38] last:border-b-0"
                  >
                    <td className="py-3 px-4 font-mono text-[#f0f0f0] text-xs">{job.name}</td>
                    <td className="py-3 px-4 font-mono text-[#888888] text-xs">{job.schedule}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] text-[#22c55e] flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
