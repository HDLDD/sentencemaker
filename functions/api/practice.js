// Cloudflare Pages Function — /api/practice
// 获取题目 & 校验答案

// 内嵌题目数据（与前端一致，生产环境建议从 D1 读取）
const PRACTICE_DATA = [
  {"id":1,"level":"beginner","theme":"日常表达","prompt_cn":"我每天早上七点起床。","prompt_en":"I get up at 7 o'clock every morning.","keywords":["get up","every morning"],"grammar_point":"一般现在时"},
  {"id":2,"level":"beginner","theme":"日常表达","prompt_cn":"她是一个好老师。","prompt_en":"She is a good teacher.","keywords":["good teacher","is"],"grammar_point":"be动词"},
  {"id":3,"level":"beginner","theme":"爱好","prompt_cn":"我喜欢听音乐。","prompt_en":"I like listening to music.","keywords":["like","listening to music"],"grammar_point":"like doing"},
  {"id":4,"level":"beginner","theme":"饮食","prompt_cn":"他每天喝两杯咖啡。","prompt_en":"He drinks two cups of coffee every day.","keywords":["drinks","cups of coffee"],"grammar_point":"量词+一般现在时"},
  {"id":5,"level":"beginner","theme":"时间","prompt_cn":"现在是下午三点。","prompt_en":"It's three o'clock in the afternoon.","keywords":["o'clock","in the afternoon"],"grammar_point":"时间表达"},
  {"id":6,"level":"intermediate","theme":"经历","prompt_cn":"我从来没有去过北京。","prompt_en":"I have never been to Beijing.","keywords":["have never been","Beijing"],"grammar_point":"现在完成时"},
  {"id":7,"level":"intermediate","theme":"计划","prompt_cn":"他们下周要去爬山。","prompt_en":"They are going to climb the mountain next week.","keywords":["are going to","climb","next week"],"grammar_point":"be going to 将来时"},
  {"id":8,"level":"intermediate","theme":"原因","prompt_cn":"因为下雨了，所以我们没有去公园。","prompt_en":"Because it rained, we didn't go to the park.","keywords":["because","rained","didn't go"],"grammar_point":"because引导原因状语从句"},
  {"id":9,"level":"intermediate","theme":"比较","prompt_cn":"这本书比那本书更有趣。","prompt_en":"This book is more interesting than that one.","keywords":["more interesting","than"],"grammar_point":"比较级"},
  {"id":10,"level":"intermediate","theme":"条件","prompt_cn":"如果明天天气好，我们就去游泳。","prompt_en":"If the weather is good tomorrow, we will go swimming.","keywords":["if","weather","go swimming"],"grammar_point":"if条件句"},
  {"id":11,"level":"advanced","theme":"建议","prompt_cn":"你本应该早点告诉我这件事。","prompt_en":"You should have told me about this earlier.","keywords":["should have","told","earlier"],"grammar_point":"should have done 虚拟语气"},
  {"id":12,"level":"advanced","theme":"被动","prompt_cn":"这座桥建于2008年。","prompt_en":"This bridge was built in 2008.","keywords":["was built","in 2008"],"grammar_point":"被动语态"},
  {"id":13,"level":"advanced","theme":"假设","prompt_cn":"如果我是你，我会接受这个提议。","prompt_en":"If I were you, I would accept the offer.","keywords":["if I were","would accept"],"grammar_point":"虚拟语气（与现在相反）"},
  {"id":14,"level":"advanced","theme":"持续","prompt_cn":"我学英语已经学了五年了。","prompt_en":"I have been learning English for five years.","keywords":["have been learning","for five years"],"grammar_point":"现在完成进行时"},
  {"id":15,"level":"advanced","theme":"倒装","prompt_cn":"直到那时我才意识到真相。","prompt_en":"Not until then did I realize the truth.","keywords":["not until","did I realize"],"grammar_point":"倒装句"}
];

function normalize(s) {
  return s.toLowerCase().replace(/[^\w\s']/g, '').replace(/\s+/g, ' ').trim();
}

function keywordScore(answer, keywords) {
  const norm = normalize(answer);
  const hits = keywords.filter(kw => norm.includes(kw.toLowerCase()));
  return hits.length / keywords.length;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method;

  // CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET — 获取题目列表
  if (method === 'GET') {
    const level = url.searchParams.get('level') || 'all';
    const theme = url.searchParams.get('theme') || 'all';
    let data = [...PRACTICE_DATA];
    if (level !== 'all') data = data.filter(q => q.level === level);
    if (theme !== 'all') data = data.filter(q => q.theme === theme);

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // POST — 校验答案
  if (method === 'POST') {
    const body = await request.json();
    const { id: questionId, answer } = body;
    const q = PRACTICE_DATA.find(i => i.id === questionId);
    if (!q) {
      return new Response(JSON.stringify({ ok: false, error: '题目不存在' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const normalizedUser = normalize(answer);
    const normalizedRef = normalize(q.prompt_en);

    if (normalizedUser === normalizedRef) {
      return new Response(JSON.stringify({ ok: true, correct: true, score: 100, ref: q.prompt_en, grammar_point: q.grammar_point }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const kwScore = keywordScore(answer, q.keywords);
    if (kwScore >= 0.8) {
      return new Response(JSON.stringify({ ok: true, correct: 'partial', score: Math.round(kwScore * 80), ref: q.prompt_en, grammar_point: q.grammar_point, message: '意思正确，可以更精确哦！' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ ok: true, correct: false, score: 0, ref: q.prompt_en, grammar_point: q.grammar_point, message: '答案有些出入，看看参考答案吧！' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
