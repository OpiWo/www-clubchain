'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('asgard_token')) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.adminLogin(email, password);
      localStorage.setItem('asgard_token', token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] flex flex-col items-center justify-center px-6">
      {/* Terminal-style header */}
      <div className="mb-10 text-center">
        <p className="font-mono text-[#f5a623] text-[10px] tracking-[0.4em] mb-2">SYSTEM ACCESS</p>
        <h1 className="font-display font-black text-[#f0f0f0] text-4xl tracking-[0.08em]">ASGARD</h1>
        <p className="font-mono text-[#444455] text-xs mt-2 tracking-widest">ADMIN CONTROL PANEL</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm border border-[#2a2a38] bg-[#0d0d14]">
        {/* Top bar */}
        <div className="px-6 py-3 border-b border-[#2a2a38] bg-[#111118] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e84545]" />
          <span className="w-2 h-2 rounded-full bg-[#f5a623]" />
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="font-mono text-[#444455] text-[10px] ml-2 tracking-wider">admin.clubchain</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-[#444455] mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-10 bg-[#07070b] border border-[#2a2a38] px-3 font-mono text-sm text-[#f0f0f0] placeholder-[#333344] focus:outline-none focus:border-[#f5a623] transition-colors"
              placeholder="admin@clubchain.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-[#444455] mb-1.5">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-10 bg-[#07070b] border border-[#2a2a38] px-3 font-mono text-sm text-[#f0f0f0] placeholder-[#333344] focus:outline-none focus:border-[#f5a623] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-[#e84545] text-xs border border-[#e84545]/30 bg-[#e84545]/5 px-3 py-2">
              ERROR: {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#f5a623] text-[#07070b] font-display font-black text-sm tracking-[0.2em] hover:bg-[#d4901f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'AUTHENTICATING…' : 'AUTHENTICATE'}
          </button>
        </form>
      </div>

      <p className="mt-8 font-mono text-[#222233] text-[10px] tracking-widest">
        CLUBCHAIN ASGARD v1.0 · DEVNET
      </p>
    </div>
  );
}
