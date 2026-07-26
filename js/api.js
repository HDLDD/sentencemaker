// =========================================
// API — 数据接口层
// =========================================

const API = {
  /** 获取题目列表 */
  async getPractice(level = 'all', theme = 'all') {
    let data = PracticeData;
    if (level !== 'all') data = data.filter(q => q.level === level);
    if (theme !== 'all') data = data.filter(q => q.theme === theme);
    return { ok: true, data };
  },

  /** 校验答案 */
  async checkAnswer(questionId, userAnswer) {
    const q = PracticeData.find(i => i.id === questionId);
    if (!q) return { ok: false, error: '题目不存在' };

    const normalizedUser = Utils.normalize(userAnswer);
    const normalizedRef = Utils.normalize(q.prompt_en);

    // 完全匹配
    if (normalizedUser === normalizedRef) {
      return { ok: true, correct: true, score: 100, ref: q.prompt_en, grammar_point: q.grammar_point };
    }

    // 关键词匹配
    const kwResult = Utils.keywordScore(userAnswer, q.keywords);
    if (kwResult.score >= 0.8) {
      return { ok: true, correct: 'partial', score: Math.round(kwResult.score * 80), ref: q.prompt_en, grammar_point: q.grammar_point, message: '意思正确，可以更精确哦！' };
    }

    return { ok: true, correct: false, score: 0, ref: q.prompt_en, grammar_point: q.grammar_point, message: '答案有些出入，看看参考答案吧！' };
  },

  /** 获取语法列表 */
  async getGrammar(level = 'all') {
    let data = GrammarData;
    if (level !== 'all') data = data.filter(g => g.level === level);
    return { ok: true, data };
  },

  /** 获取词汇列表 */
  async getVocab(level = 'all', theme = 'all', search = '') {
    let data = VocabData;
    if (level !== 'all') data = data.filter(v => v.level === level);
    if (theme !== 'all') data = data.filter(v => v.theme === theme);
    if (search) data = data.filter(v => v.word.toLowerCase().includes(search.toLowerCase()) || v.meaning.includes(search));
    return { ok: true, data };
  },

  /** 获取进度 */
  async getProgress() {
    return { ok: true, data: ProgressManager.get() };
  },

  /** 保存进度 */
  async saveProgress(data) {
    ProgressManager.save(data);
    return { ok: true };
  }
};

// =========================================
// 进度管理
// =========================================
const ProgressManager = {
  get() {
    return Utils.storage.get('progress', {
      totalQuestions: 0,
      totalCorrect: 0,
      streakDays: 0,
      lastStudyDate: '',
      dailyHistory: {},
      dates: [],
      accuracyHistory: []
    });
  },

  save(data) {
    Utils.storage.set('progress', data);
  },

  recordResult(correct) {
    const p = this.get();
    const today = Utils.today();

    p.totalQuestions++;

    // 更新每日记录
    if (!p.dailyHistory[today]) {
      p.dailyHistory[today] = { correct: 0, total: 0 };
    }
    p.dailyHistory[today].total++;

    if (correct === true || correct === 'partial') {
      p.totalCorrect++;
      p.dailyHistory[today].correct++;
    }

    // 更新连续天数
    if (p.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (p.lastStudyDate === yesterday || !p.lastStudyDate) {
        p.streakDays++;
      } else {
        p.streakDays = 1;
      }
      p.lastStudyDate = today;
      p.dates.push(today);
    }

    // 正确率历史
    const acc = p.totalQuestions > 0 ? Math.round(p.totalCorrect / p.totalQuestions * 100) : 0;
    p.accuracyHistory.push({ date: today, accuracy: acc });

    this.save(p);
    return p;
  },

  reset() {
    Utils.storage.remove('progress');
    Utils.toast('学习数据已重置', 'success');
  }
};

// =========================================
// 静态数据（内嵌，无需后端也能运行）
// =========================================
const PracticeData = [
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

const GrammarData = [
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

const VocabData = [
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
