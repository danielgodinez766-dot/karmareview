/*
# Add pg_cron job to poll the Discord notification edge function

1. New Functions
- `poll_discord_queue()` — a SECURITY DEFINER function that calls the edge function via net.http_post. The edge function URL is built from the project reference. Uses the anon key for authorization.

2. New Cron Jobs
- `discord_notify_poll` — runs every minute, calls `poll_discord_queue()`.

3. Security
- `poll_discord_queue()` is SECURITY DEFINER with search_path locked to `net, public`.
- The cron job runs in the `postgres` role context.
*/

CREATE OR REPLACE FUNCTION public.poll_discord_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = net, public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://ftekjsfugzofljboucgi.supabase.co/functions/v1/discord-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZWtqc2Z1Z3pvZmxqYm91Y2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTYyMzIsImV4cCI6MjEwMzU5MjIzMn0.89ntwno4xf1blrrosRG_7YcnwcJwPCZiAazMLszCl-Y'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
END;
$$;

SELECT cron.schedule(
  'discord_notify_poll',
  '* * * * *',
  $$ SELECT public.poll_discord_queue(); $$
);
