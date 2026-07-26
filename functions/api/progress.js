// Cloudflare Pages Function — /api/progress
// 读取/写入学习进度

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 如无 D1 绑定，使用内存存储（开发/演示用）
  // 生产环境应在 wrangler.toml 中配置 [[d1_databases]]

  // GET — 获取进度
  if (method === 'GET') {
    try {
      if (env && env.DB) {
        const result = await env.DB.prepare('SELECT * FROM progress WHERE id = 1').first();
        return new Response(JSON.stringify({ ok: true, data: result ? JSON.parse(result.data) : getDefaultProgress() }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      return new Response(JSON.stringify({ ok: true, data: getDefaultProgress(), note: 'No D1 binding. Progress stored only in localStorage on the frontend.' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: true, data: getDefaultProgress(), note: 'D1 fallback. Progress stored in frontend localStorage.' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  // POST — 保存进度
  if (method === 'POST') {
    try {
      const body = await request.json();

      if (env && env.DB) {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO progress (id, data, updated_at) VALUES (1, ?, ?)'
        ).bind(JSON.stringify(body), new Date().toISOString()).run();
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}

function getDefaultProgress() {
  return {
    totalQuestions: 0,
    totalCorrect: 0,
    streakDays: 0,
    lastStudyDate: '',
    dailyHistory: {},
    dates: [],
    accuracyHistory: []
  };
}
