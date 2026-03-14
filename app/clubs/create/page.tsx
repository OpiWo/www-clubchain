'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import clsx from 'clsx';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';

const BADGE_COLORS = [
  '#e84545', '#f5a623', '#22c55e', '#3b82f6',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
  '#84cc16', '#06b6d4', '#6366f1', '#d946ef',
  '#0ea5e9', '#eab308', '#10b981', '#ef4444',
];

const MAX_NAME = 32;

export default function CreateClubPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  const [name, setName] = useState('');
  const [badge, setBadge] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!connected || !publicKey) return;
    if (!name.trim()) {
      setError('Club name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const club = await api.createClub({
        name: name.trim(),
        badge,
        managerPubkey: publicKey.toBase58(),
      });
      router.push(`/clubs/${club.pubkey}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create club.');
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <h1
            className="font-display font-black text-[#f0f0f0] leading-none mb-2"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.01em', lineHeight: 0.95 }}
          >
            CREATE YOUR CLUB
          </h1>
          <div className="h-1 bg-[#f5a623] w-16 mb-10" />

          {!connected ? (
            <div className="border border-[#2a2a38] bg-[#111118] p-10 text-center flex flex-col items-center gap-6">
              <p className="font-display font-bold text-[#f0f0f0] text-lg tracking-wide">
                CONNECT YOUR WALLET TO CONTINUE
              </p>
              <p className="font-body text-[#888888] text-sm">
                You need a Phantom wallet to create a club on Solana.
              </p>
              <WalletMultiButton />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Step 1: Name */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <label className="font-display font-black text-[#f0f0f0] text-xl tracking-wide">
                    NAME YOUR CLUB
                  </label>
                  <span className={clsx(
                    'font-body text-xs',
                    name.length > MAX_NAME - 5 ? 'text-[#e84545]' : 'text-[#888888]'
                  )}>
                    {name.length}/{MAX_NAME}
                  </span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
                  placeholder="Enter your club name..."
                  maxLength={MAX_NAME}
                  className="w-full h-14 bg-[#111118] border border-[#2a2a38] px-4 font-body text-[#f0f0f0] text-lg placeholder-[#888888]/50 focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              {/* Step 2: Badge */}
              <div className="space-y-4">
                <p className="font-display font-black text-[#f0f0f0] text-xl tracking-wide">
                  PICK YOUR BADGE
                </p>
                <div className="grid grid-cols-8 gap-3">
                  {BADGE_COLORS.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBadge(idx)}
                      className={clsx(
                        'w-full aspect-square rounded-full transition-all duration-150 flex items-center justify-center',
                        badge === idx
                          ? 'ring-2 ring-[#f5a623] ring-offset-2 ring-offset-[#0a0a0f] scale-110'
                          : 'hover:scale-105 opacity-60 hover:opacity-100'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Badge ${idx}`}
                      aria-pressed={badge === idx}
                    />
                  ))}
                </div>
                <p className="font-body text-[#888888] text-xs">
                  Selected badge #{badge}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="border border-[#e84545]/30 bg-[#e84545]/5 px-4 py-3">
                  <p className="font-body text-[#e84545] text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className={clsx(
                  'w-full h-14 font-display font-black text-sm tracking-widest transition-all duration-150',
                  loading || !name.trim()
                    ? 'bg-[#2a2a38] text-[#888888] cursor-not-allowed'
                    : 'bg-[#f5a623] text-[#0a0a0f] hover:bg-[#b87d1a]'
                )}
              >
                {loading ? 'CONFIRMING ON-CHAIN...' : 'CREATE CLUB ON SOLANA'}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
