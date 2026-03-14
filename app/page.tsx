import Link from 'next/link';
import { Nav } from '@/components/Nav';

const TIER_CARDS = [
  {
    tier: 'Standard',
    entry: '1 SOL',
    prize: '~9.7 SOL',
    desc: '10 clubs · 3% protocol fee',
    color: '#888888',
  },
  {
    tier: 'Premium',
    entry: '5 SOL',
    prize: '~48.5 SOL',
    desc: '10 clubs · 3% protocol fee',
    color: '#f5a623',
  },
  {
    tier: 'Elite',
    entry: '10 SOL',
    prize: '~97 SOL',
    desc: '10 clubs · 3% protocol fee',
    color: '#a855f7',
  },
];

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-16">
          <div className="max-w-7xl mx-auto w-full">
            <h1
              className="font-display font-black leading-none animate-fade-up"
              style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', letterSpacing: '-0.02em', lineHeight: 0.9 }}
            >
              <span className="text-[#f5a623] block">OWN YOUR CLUB.</span>
              <span className="text-[#f0f0f0] block">PLAY EVERY LEAGUE.</span>
              <span className="text-[#f0f0f0] block">
                WIN ON CHAIN<span className="text-[#f5a623]">.</span>
              </span>
            </h1>

            <p className="mt-8 font-body text-[#888888] text-lg max-w-xl animate-fade-up animation-delay-200">
              Daily AI-simulated leagues on Solana. Entry fee becomes prize pool. No middlemen.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 animate-fade-up animation-delay-300">
              <Link
                href="/leagues"
                className="inline-flex items-center h-12 px-8 bg-[#f5a623] text-[#0a0a0f] font-display font-black text-sm tracking-widest hover:bg-[#b87d1a] transition-colors"
              >
                BROWSE LEAGUES
              </Link>
              <Link
                href="/clubs/create"
                className="inline-flex items-center h-12 px-8 border border-[#f5a623] text-[#f5a623] font-display font-black text-sm tracking-widest hover:bg-[#f5a623] hover:text-[#0a0a0f] transition-colors"
              >
                CREATE YOUR CLUB
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="font-display text-[10px] tracking-widest text-[#888888]">SCROLL</span>
            <div className="w-px h-8 bg-[#2a2a38] animate-scroll-bounce" />
          </div>
        </section>

        {/* ── STATS STRIP ──────────────────────────────────────── */}
        <section className="bg-[#f5a623] py-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { stat: '50%', label: 'TO FIRST PLACE' },
              { stat: '3%', label: 'PROTOCOL FEE' },
              { stat: '24H', label: 'FULL CYCLE' },
            ].map(({ stat, label }) => (
              <div key={label} className="flex flex-col items-center md:items-start">
                <span
                  className="font-display font-black text-[#0a0a0f] leading-none"
                  style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}
                >
                  {stat}
                </span>
                <span className="font-display font-bold text-sm tracking-widest text-[#0a0a0f]/60 mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2
              className="font-display font-black text-[#f0f0f0] mb-16"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              HOW IT WORKS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#2a2a38]">
              {[
                {
                  step: '01',
                  title: 'CREATE YOUR CLUB',
                  body: "Mint your identity on Solana. Name it. Badge it. It's yours forever.",
                },
                {
                  step: '02',
                  title: 'JOIN A LEAGUE',
                  body: 'Pay entry. Your SOL becomes the prize pool. Pick your squad from the global player pool.',
                },
                {
                  step: '03',
                  title: 'WIN ON CHAIN',
                  body: 'AI simulates the matches. Scores go on-chain. Prizes auto-distribute to your wallet.',
                },
              ].map(({ step, title, body }, i) => (
                <div
                  key={step}
                  className={`p-8 flex flex-col gap-4${i < 2 ? ' border-b md:border-b-0 md:border-r border-[#2a2a38]' : ''}`}
                >
                  <span className="font-display font-black text-[#f5a623] text-5xl leading-none">
                    STEP {step}
                  </span>
                  <h3 className="font-display font-black text-[#f0f0f0] text-xl tracking-wide">
                    {title}
                  </h3>
                  <p className="font-body text-[#888888] text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEAGUE TIERS PREVIEW ─────────────────────────────── */}
        <section className="py-24 px-6 bg-[#111118]">
          <div className="max-w-7xl mx-auto">
            <h2
              className="font-display font-black text-[#f0f0f0] mb-16"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              LEAGUE TIERS
            </h2>
            <div className="flex flex-col md:flex-row gap-0 border border-[#2a2a38] overflow-x-auto">
              {TIER_CARDS.map(({ tier, entry, prize, desc, color }, i) => (
                <div
                  key={tier}
                  className={`flex-1 p-8 flex flex-col gap-4 min-w-[260px]${i < 2 ? ' border-b md:border-b-0 md:border-r border-[#2a2a38]' : ''}`}
                >
                  <span
                    className="font-display font-black text-sm tracking-widest"
                    style={{ color }}
                  >
                    {tier.toUpperCase()}
                  </span>
                  <div>
                    <span
                      className="font-display font-black text-[#f5a623] leading-none"
                      style={{ fontSize: 'clamp(3rem, 8vw, 4rem)' }}
                    >
                      {entry}
                    </span>
                    <p className="font-display font-bold text-sm text-[#888888] mt-1">entry fee</p>
                  </div>
                  <div className="border-t border-[#2a2a38] pt-4">
                    <p className="font-display font-black text-[#f0f0f0] text-lg">
                      {prize} prize pool
                    </p>
                    <p className="font-body text-[#888888] text-xs mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link
                href="/leagues"
                className="inline-flex items-center h-12 px-10 border border-[#2a2a38] text-[#888888] font-display font-black text-sm tracking-widest hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
              >
                VIEW ALL LEAGUES →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer className="border-t border-[#2a2a38] py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-display font-bold text-sm text-[#888888] tracking-widest">
              CLUBCHAIN © 2026
            </span>
            <span className="inline-flex items-center gap-1.5 font-display font-bold text-xs tracking-widest text-[#f5a623] border border-[#f5a623]/30 px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] inline-block" />
              DEVNET
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
