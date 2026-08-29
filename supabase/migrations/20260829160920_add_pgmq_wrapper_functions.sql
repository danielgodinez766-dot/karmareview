/*
# Add public wrapper functions for pgmq queue access

1. New Functions
- `pgmq_read_review(queue_name text, vt integer, qty integer)` — wraps pgmq.read() so the edge function can call it via Supabase RPC. Returns msg_id, read_ct, and message (jsonb).
- `pgmq_delete_review(queue_name text, msg_id bigint)` — wraps pgmq.delete() so the edge function can remove processed messages.

2. Modified Functions
- `notify_discord_review()` — updated to send jsonb (not text) to match pgmq.send signature.

3. Security
- Both wrappers are SECURITY DEFINER, owned by postgres, with search_path locked to pgmq, public.
- Granted EXECUTE to anon and authenticated so the service-role client can call them.
*/

CREATE OR REPLACE FUNCTION public.notify_discord_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $$
BEGIN
  PERFORM pgmq.send('discord_reviews', jsonb_build_object('review_id', NEW.id));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.pgmq_read_review(
  queue_name text,
  vt integer,
  qty integer
)
RETURNS TABLE (
  msg_id bigint,
  read_ct integer,
  message jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pgmq, public
AS $$
  SELECT msg_id, read_ct, message
  FROM pgmq.read(queue_name, vt, qty);
$$;

CREATE OR REPLACE FUNCTION public.pgmq_delete_review(
  queue_name text,
  msg_id bigint
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pgmq, public
AS $$
  SELECT pgmq.delete(queue_name, msg_id);
$$;

GRANT EXECUTE ON FUNCTION public.pgmq_read_review(text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pgmq_delete_review(text, bigint) TO anon, authenticated;
