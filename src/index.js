// Minimal Worker entry point — serves static assets from frontend/
// All API logic is client-side (inlined in api.js).
// When D1 is configured, this worker can proxy API requests.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API routes — proxy to Pages Functions logic if needed
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, url, env);
    }

    // Static assets handled by wrangler's assets feature
    return env.ASSETS.fetch(request);
  }
};

async function handleAPI(request, url, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(JSON.stringify({
    ok: false,
    note: 'API data is embedded client-side. Server-side API requires D1 database setup.'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
