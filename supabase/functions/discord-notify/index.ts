import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");

const GAME_COLORS: Record<string, number> = {
  Valorant: 0xff4655,
  Bloodstrike: 0xe63946,
  Minecraft: 0x2ecc71,
  Roblox: 0x00a2ff,
  "Middleman Service": 0xf59e0b,
  Other: 0x64748b,
};

const GAME_EMOJIS: Record<string, string> = {
  Valorant: "🎯",
  Bloodstrike: "🩸",
  Minecraft: "⛏️",
  Roblox: "🎮",
  "Middleman Service": "🛡️",
  Other: "🕹️",
};

function starString(rating: number): string {
  return "⭐".repeat(rating) + "✰".repeat(5 - rating);
}

type QueueMessage = {
  msg_id: number;
  read_ct: number;
  message: { review_id: string };
};

type Review = {
  name: string;
  game: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  created_at: string;
};

async function processQueue(): Promise<{ processed: number; errors: number }> {
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < 10; i++) {
    const { data: messages, error: readError } = await supabase.rpc(
      "pgmq_read_review",
      {
        queue_name: "discord_reviews",
        vt: 30,
        qty: 1,
      },
    );

    if (readError) {
      console.error("Queue read error:", readError.message);
      break;
    }

    if (!messages || messages.length === 0) break;

    const msg = messages[0] as QueueMessage;
    const reviewId = msg.message.review_id;

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("name, game, rating, title, body, verified, created_at")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      console.error("Failed to fetch review:", reviewError?.message);
      await supabase.rpc("pgmq_delete_review", {
        queue_name: "discord_reviews",
        msg_id: msg.msg_id,
      });
      errors++;
      continue;
    }

    const r = review as Review;

    // Only post verified vouches
    if (!r.verified) {
      await supabase.rpc("pgmq_delete_review", {
        queue_name: "discord_reviews",
        msg_id: msg.msg_id,
      });
      continue;
    }

    const embed = {
      title: `${GAME_EMOJIS[r.game] ?? "🕹️"} New Verified Vouch — ${r.game}`,
      description: `**${starString(r.rating)}** (${r.rating}/5)`,
      color: GAME_COLORS[r.game] ?? 0x64748b,
      fields: [
        { name: "Reviewer", value: r.name, inline: true },
        { name: "Game", value: r.game, inline: true },
        { name: "Rating", value: `${r.rating}/5 ⭐`, inline: true },
        { name: "Title", value: r.title },
        {
          name: "Review",
          value: r.body.length > 1024 ? r.body.slice(0, 1021) + "..." : r.body,
        },
      ],
      footer: { text: "KarmaReviews • Verified Purchase" },
      timestamp: r.created_at,
    };

    if (DISCORD_WEBHOOK_URL) {
      try {
        const resp = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "KarmaReviews",
            embeds: [embed],
          }),
        });

        if (!resp.ok) {
          const body = await resp.text();
          console.error(`Discord webhook failed (${resp.status}): ${body}`);
          break;
        }
      } catch (err) {
        console.error("Discord fetch error:", err);
        break;
      }
    } else {
      console.log("DISCORD_WEBHOOK_URL not set — skipping Discord post");
    }

    await supabase.rpc("pgmq_delete_review", {
      queue_name: "discord_reviews",
      msg_id: msg.msg_id,
    });

    processed++;
  }

  return { processed, errors };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const result = await processQueue();
    return new Response(
      JSON.stringify({
        success: true,
        processed: result.processed,
        errors: result.errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
