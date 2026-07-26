// Cloudflare Pages Function — /api/vocab
// 获取词汇数据

const VOCAB_DATA = [
  {"id":1,"word":"abandon","level":"intermediate","meaning":"放弃","theme":"action","example":"They had to abandon the project due to lack of funding."},
  {"id":2,"word":"benefit","level":"intermediate","meaning":"好处，益处","theme":"abstract","example":"Regular exercise has many health benefits."},
  {"id":3,"word":"consequence","level":"intermediate","meaning":"结果，后果","theme":"abstract","example":"Every action has a consequence."},
  {"id":4,"word":"demonstrate","level":"intermediate","meaning":"展示，证明","theme":"action","example":"Let me demonstrate how this machine works."},
  {"id":5,"word":"environment","level":"beginner","meaning":"环境","theme":"nature","example":"We must protect the environment."},
  {"id":6,"word":"frequent","level":"intermediate","meaning":"频繁的","theme":"frequency","example":"She makes frequent trips to Shanghai."},
  {"id":7,"word":"generous","level":"intermediate","meaning":"慷慨的","theme":"character","example":"He is very generous with his time."},
  {"id":8,"word":"hesitate","level":"intermediate","meaning":"犹豫","theme":"action","example":"Don't hesitate to ask for help."},
  {"id":9,"word":"imagine","level":"beginner","meaning":"想象","theme":"thought","example":"Can you imagine living on Mars?"},
  {"id":10,"word":"knowledge","level":"beginner","meaning":"知识","theme":"abstract","example":"Knowledge is power."},
  {"id":11,"word":"necessary","level":"beginner","meaning":"必要的","theme":"abstract","example":"Sleep is necessary for good health."},
  {"id":12,"word":"opportunity","level":"intermediate","meaning":"机会","theme":"abstract","example":"This is a great opportunity to learn."},
  {"id":13,"word":"patient","level":"beginner","meaning":"耐心的","theme":"character","example":"You need to be patient when learning a language."},
  {"id":14,"word":"recognize","level":"intermediate","meaning":"认出，识别","theme":"perception","example":"I didn't recognize him with the new hairstyle."},
  {"id":15,"word":"significant","level":"intermediate","meaning":"重要的，显著的","theme":"abstract","example":"This is a significant achievement."},
  {"id":16,"word":"temperature","level":"beginner","meaning":"温度","theme":"nature","example":"The temperature dropped below zero."},
  {"id":17,"word":"understand","level":"beginner","meaning":"理解","theme":"thought","example":"I understand what you mean."},
  {"id":18,"word":"volunteer","level":"intermediate","meaning":"志愿者，自愿","theme":"action","example":"She volunteers at the local hospital."},
  {"id":19,"word":"weather","level":"beginner","meaning":"天气","theme":"nature","example":"The weather is beautiful today."},
  {"id":20,"word":"achieve","level":"intermediate","meaning":"实现，达到","theme":"action","example":"He worked hard to achieve his goals."}
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
  const theme = url.searchParams.get('theme') || 'all';
  const search = url.searchParams.get('search') || '';

  let data = [...VOCAB_DATA];
  if (level !== 'all') data = data.filter(v => v.level === level);
  if (theme !== 'all') data = data.filter(v => v.theme === theme);
  if (search) data = data.filter(v => v.word.toLowerCase().includes(search.toLowerCase()) || v.meaning.includes(search));

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
