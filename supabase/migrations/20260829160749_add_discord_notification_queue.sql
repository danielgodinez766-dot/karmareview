/*
# Add Discord notification queue and trigger

1. Extensions
- Enable `pgmq` (Postgres message queue) to buffer outgoing Discord notifications.

2. New Queue
- `discord_reviews` — a pgmq queue that holds review IDs to be posted to Discord.

3. New Functions
- `notify_discord_review()` — a trigger function that enqueues the new review's ID into the `discord_reviews` queue whenever a row is inserted into `reviews`.

4. New Triggers
- `trg_notify_discord_review` — AFTER INSERT on `reviews`, calls `notify_discord_review()`.

5. Security
- The trigger function runs with `SECURITY DEFINER` as the `postgres` role so it can write to the pgmq schema.
- No new RLS policies needed — the queue is internal infrastructure, not exposed to the anon role.
*/

CREATE EXTENSION IF NOT EXISTS pgmq;

SELECT pgmq.create('discord_reviews');

CREATE OR REPLACE FUNCTION public.notify_discord_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $$
BEGIN
  PERFORM pgmq.send('discord_reviews', json_build_object('review_id', NEW.id)::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_discord_review ON public.reviews;
CREATE TRIGGER trg_notify_discord_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_discord_review();
