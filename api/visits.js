const env = typeof process === "undefined" ? {} : process.env;

const VISITS_KEY = env.VISIT_COUNTER_KEY || "leoos:visits";

const REDIS_URL =
  env.UPSTASH_REDIS_REST_URL ||
  env.KV_REST_API_URL;

const REDIS_TOKEN =
  env.UPSTASH_REDIS_REST_TOKEN ||
  env.KV_REST_API_TOKEN;

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, { Allow: "GET, POST" });
    }

    if (!REDIS_URL || !REDIS_TOKEN) {
      return json({ error: "missing_redis_config", count: null }, 503);
    }

    try {
      const command = request.method === "POST" ? "INCR" : "GET";
      const result = await redis([command, VISITS_KEY]);
      const count = Number(result || 0);

      return json({
        count: Number.isFinite(count) ? count : 0,
        counted: request.method === "POST",
      });
    } catch (error) {
      console.error("Visit counter failed", error);
      return json(
        {
          error: "visit_counter_unavailable",
          count: null,
        },
        502
      );
    }
  },
};

async function redis(command) {
  const response = await fetch(REDIS_URL.replace(/\/$/, ""), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Redis request failed with ${response.status}`);
  }

  return payload.result;
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}
