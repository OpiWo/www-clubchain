'use client';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-[#2a2a38] bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="font-display font-black text-xl text-[#f0f0f0] leading-none tracking-wide">CLUBCHAIN</span>
          <span className="text-[10px] text-[#f5a623] tracking-[0.3em] font-body font-medium">FANTASY · FOOTBALL · ON CHAIN</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/leagues"
            className="font-display font-bold text-sm tracking-widest text-[#888888] hover:text-[#f0f0f0] transition-colors"
          >
            LEAGUES
          </Link>
          <Link
            href="/players"
            className="font-display font-bold text-sm tracking-widest text-[#888888] hover:text-[#f0f0f0] transition-colors"
          >
            PLAYERS
          </Link>
        </div>
        <WalletMultiButton />
      </div>
    </nav>
  );
}
