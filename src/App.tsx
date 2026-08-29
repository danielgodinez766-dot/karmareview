import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  PenLine,
  Gamepad2,
  Loader2,
  Search,
} from 'lucide-react';
import { supabase, type Review } from '@/lib/supabase';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';

const games = ['All', 'Valorant', 'Bloodstrike', 'Minecraft', 'Roblox', 'Middleman Service', 'Other'];

export default function App() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load reviews. Please refresh the page.');
        setLoading(false);
        return;
      }

      setReviews(data as Review[]);
      setLoading(false);
    }

    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesGame = filter === 'All' || r.game === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q);
      return matchesGame && matchesSearch;
    });
  }, [reviews, filter, search]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : '0.0';
    const verified = reviews.filter((r) => r.verified).length;
    return { total, avg, verified };
  }, [reviews]);

  function handleSubmitted(review: Review) {
    setReviews((prev) => [review, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold leading-tight">KarmaReviews</p>
              <p className="text-xs text-slate-400">Trusted Account Reviews</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-emerald-400 hover:to-teal-400"
          >
            <PenLine size={16} />
            <span className="hidden sm:inline">Write a Review</span>
            <span className="sm:hidden">Review</span>
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-4 py-1.5 text-xs text-slate-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            Trusted by {stats.total}+ verified buyers
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
            Don't just take our word for it.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Read what buyers say.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Real reviews from clients who purchased game accounts or used the
            middleman service across Valorant, Bloodstrike, Minecraft, and Roblox.
            Every vouch is from an actual transaction.
          </p>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-center gap-1.5">
                <Star size={20} className="text-amber-400 fill-amber-400" />
                <p className="text-2xl font-bold sm:text-3xl">{stats.avg}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Average Rating
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-center gap-1.5">
                <Users size={20} className="text-emerald-400" />
                <p className="text-2xl font-bold sm:text-3xl">{stats.total}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Total Reviews
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-center gap-1.5">
                <TrendingUp size={20} className="text-teal-400" />
                <p className="text-2xl font-bold sm:text-3xl">{stats.verified}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Verified Buys
              </p>
            </div>
          </div>
        </section>

        {/* Filters + Search */}
        <section className="sticky top-[73px] z-30 -mx-4 border-b border-slate-800/60 bg-slate-950/80 px-4 py-4 backdrop-blur-lg sm:top-[73px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {games.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === g
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  {g !== 'All' && <Gamepad2 size={13} />}
                  {g}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:w-56"
              />
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-emerald-400" />
              <p className="mt-3 text-sm text-slate-400">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Star size={40} className="text-slate-600" />
              <p className="mt-4 text-slate-400">
                No reviews found. Be the first to leave one!
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="font-semibold text-slate-300">KarmaReviews</span>
          </div>
          <p className="mt-2">
            Trusted account marketplace reviews. All vouches are from verified
            transactions.
          </p>
        </div>
      </footer>

      {showForm && (
        <ReviewForm
          onSubmitted={handleSubmitted}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
