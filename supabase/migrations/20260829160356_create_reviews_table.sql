/*
# Create reviews table for client vouches

1. New Tables
- `reviews`
  - `id` (uuid, primary key)
  - `name` (text, not null) — the client's display name
  - `game` (text, not null) — the game the account was for (Valorant, Bloodstrike, Minecraft, Roblox, Other)
  - `rating` (integer, not null, 1-5) — star rating
  - `title` (text, not null) — short review headline
  - `body` (text, not null) — the review content
  - `verified` (boolean, default false) — whether the purchase is verified
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `reviews`.
- Allow anon + authenticated to SELECT (public reviews, visible to all visitors).
- Allow anon + authenticated to INSERT (clients can submit reviews without signing in).
- No UPDATE or DELETE from the frontend (reviews are immutable once posted).
3. Important Notes
- This is a single-tenant, no-auth app — no sign-in screen.
- Reviews are public and anyone can submit one.
- An index on `created_at` supports ordering reviews by newest first.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  game text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  body text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);
