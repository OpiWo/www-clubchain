import clsx from 'clsx';

type StatusBadgeProps = {
  status: 'Pending' | 'Active' | 'Locked' | 'Playing' | 'Finished' | 'Cancelled';
};

type TierBadgeProps = {
  tier: 'Standard' | 'Premium' | 'Elite';
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const classes = clsx(
    'inline-flex items-center px-2 py-0.5 text-[10px] font-display font-bold tracking-widest',
    {
      'bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/30': status === 'Active',
      'bg-green-500/10 text-green-400 border border-green-500/30': status === 'Playing',
      'bg-[#888888]/10 text-[#888888] border border-[#888888]/30': status === 'Finished' || status === 'Locked',
      'bg-blue-500/10 text-blue-400 border border-blue-500/30': status === 'Pending',
      'bg-[#e84545]/10 text-[#e84545] border border-[#e84545]/30': status === 'Cancelled',
    }
  );
  return <span className={classes}>{status.toUpperCase()}</span>;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const classes = clsx(
    'inline-flex items-center px-2 py-0.5 text-[10px] font-display font-bold tracking-widest',
    {
      'bg-[#888888]/10 text-[#888888] border border-[#888888]/30': tier === 'Standard',
      'bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/30': tier === 'Premium',
      'bg-purple-500/10 text-purple-400 border border-purple-500/30': tier === 'Elite',
    }
  );
  return <span className={classes}>{tier.toUpperCase()}</span>;
}
