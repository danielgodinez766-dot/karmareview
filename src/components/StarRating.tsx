import { Star } from 'lucide-react';

type Props = {
  rating: number;
  size?: number;
};

export default function StarRating({ rating, size = 18 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-600 fill-slate-600'
          }
        />
      ))}
    </div>
  );
}
