import { BadgeCheck, Gamepad2, ShieldCheck } from 'lucide-react';
import type { Review } from '@/lib/supabase';
import StarRating from './StarRating';

type Props = {
  review: Review;
};

const gameColors: Record<string, string> = {
  Valorant: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Bloodstrike: 'bg-red-500/15 text-red-300 border-red-500/30',
  Minecraft: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Roblox: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Middleman Service': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Other: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const gameIcons: Record<string, React.ReactNode> = {
  'Middleman Service': <ShieldCheck size={12} />,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReviewCard({ review }: Props) {
  const colorClass = gameColors[review.game] ?? gameColors['Other'];

  return (
    <div className="group relative rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/60 hover:bg-slate-800/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-sm font-bold text-white">
            {review.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-white">{review.name}</p>
              {review.verified && (
                <BadgeCheck size={16} className="text-emerald-400" />
              )}
            </div>
            <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}
        >
          {gameIcons[review.game] ?? <Gamepad2 size={12} />}
          {review.game}
        </span>
      </div>

      <div className="mt-4">
        <StarRating rating={review.rating} />
      </div>

      <h3 className="mt-3 font-semibold text-white">{review.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{review.body}</p>

      {review.verified && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
          <BadgeCheck size={13} />
          Verified Purchase
        </p>
      )}
    </div>
  );
}
