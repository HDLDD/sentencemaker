// Cloudflare Pages Function — /api/grammar
// 获取语法数据

const GRAMMAR_DATA = [
  {"id":1,"name":"一般现在时","level":"beginner","description":"表示经常发生的动作或存在的状态。","formula":"主语 + 动词原形 / 动词第三人称单数","example":"I get up at 7am. / She gets up at 7am.","tips":"当主语是第三人称单数时，动词加 -s 或 -es"},
  {"id":2,"name":"现在进行时","level":"beginner","description":"表示正在进行的动作。","formula":"主语 + am/is/are + doing","example":"He is reading a book right now.","tips":"常与 now, at the moment 等连用"},
  {"id":3,"name":"be动词用法","level":"beginner","description":"am/is/are 作为系动词。","formula":"主语 + am/is/are + 名词/形容词","example":"She is a teacher. / They are happy.","tips":"I 用 am，he/she/it 用 is，we/you/they 用 are"},
  {"id":4,"name":"like doing","level":"beginner","description":"表示喜欢做某事。","formula":"主语 + like/likes + doing / to do","example":"I like swimming.","tips":"like doing 强调习惯，like to do 强调具体某次"},
  {"id":5,"name":"现在完成时","level":"intermediate","description":"过去动作对现在造成影响或持续到现在。","formula":"主语 + have/has + 过去分词","example":"I have finished my homework.","tips":"常与 already, yet, ever, never 连用"},
  {"id":6,"name":"现在完成进行时","level":"advanced","description":"从过去持续到现在的动作。","formula":"主语 + have/has been + doing","example":"I have been waiting for an hour.","tips":"常与 for/since 连用"},
  {"id":7,"name":"be going to 将来时","level":"beginner","description":"计划好或即将发生的事。","formula":"主语 + am/is/are going to + 动词原形","example":"We are going to visit the museum tomorrow.","tips":"强调有计划性，与 will 不同"},
  {"id":8,"name":"because 原因状语从句","level":"intermediate","description":"说明主句动作发生的原因。","formula":"主句 + because + 从句","example":"Because it rained, we stayed at home.","tips":"because 后接完整句子"},
  {"id":9,"name":"形容词比较级","level":"intermediate","description":"比较两者差异。","formula":"主语 + be + 比较级 + than + 比较对象","example":"This book is more interesting than that one.","tips":"单音节 -er，多音节 more"},
  {"id":10,"name":"if 条件句（真实）","level":"intermediate","description":"真实可能性的条件。","formula":"If + 一般现在时，主句 + will/can + 动词原形","example":"If it rains, I will stay at home.","tips":"主将从现"},
  {"id":11,"name":"虚拟语气（与现在相反）","level":"advanced","description":"与现在事实相反的假设。","formula":"If + 主语 + 过去式(were)，主语 + would + 动词原形","example":"If I were you, I would study harder."},
  {"id":12,"name":"should have done","level":"advanced","description":"本应该做但没做。","formula":"主语 + should have + 过去分词","example":"You should have told me earlier."},
  {"id":13,"name":"被动语态","level":"advanced","description":"动作承受者做主语。","formula":"主语 + be + 过去分词","example":"This bridge was built in 2008."},
  {"id":14,"name":"倒装句","level":"advanced","description":"为强调把谓语提到主语前。","formula":"Not until + 倒装结构 + 剩余部分","example":"Not until then did I realize the truth."}
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const level = url.searchParams.get('level') || 'all';
  let data = [...GRAMMAR_DATA];
  if (level !== 'all') data = data.filter(g => g.level === level);

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
