import { useState } from 'react';
import { Star, Loader2, CheckCircle2, X } from 'lucide-react';
import { supabase, type Review } from '@/lib/supabase';

type Props = {
  onSubmitted: (review: Review) => void;
  onClose: () => void;
};

const games = ['Valorant', 'Bloodstrike', 'Minecraft', 'Roblox', 'Middleman Service', 'Other'];

export default function ReviewForm({ onSubmitted, onClose }: Props) {
  const [name, setName] = useState('');
  const [game, setGame] = useState('Valorant');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !body.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        name: name.trim(),
        game,
        rating,
        title: title.trim(),
        body: body.trim(),
        verified: false,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      setError('Something went wrong submitting your review. Please try again.');
      return;
    }

    onSubmitted(data as Review);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Leave a Review</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          Bought an account? Share your experience to vouch for the seller.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John D."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Game
            </label>
            <div className="flex flex-wrap gap-2">
              {games.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGame(g)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    game === g
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                  >
                    <Star
                      size={28}
                      className={
                        (hoverRating || rating) >= val
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600 fill-slate-600'
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Your Review
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others about your experience buying an account..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 font-semibold text-white transition-all hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Submit Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
