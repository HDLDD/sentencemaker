// =========================================
// App — 主应用（SPA 路由 + 页面渲染）
// =========================================

const App = {
  currentPage: 'dashboard',
  currentPractice: null,
  practiceList: [],
  practiceIndex: 0,

  init() {
    this.setupRouter();
    this.setupSidebar();
    this.setupFilters();
    this.loadPage('dashboard');
    this.initThemes();
  },

  // -------- 路由 --------
  setupRouter() {
    window.addEventListener('hashchange', () => {
      const page = location.hash.slice(1) || 'dashboard';
      this.loadPage(page);
    });
  },

  loadPage(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const el = document.getElementById('page-' + page);
    const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (el) el.classList.add('active');
    if (nav) nav.classList.add('active');

    // 关闭移动端侧栏
    document.getElementById('sidebar').classList.remove('open');

    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'practice': this.renderPractice(); break;
      case 'grammar': this.renderGrammar(); break;
      case 'vocab': this.renderVocab(); break;
      case 'questions': this.renderQuestions(); break;
      case 'progress': this.renderProgress(); break;
    }
  },

  // -------- 侧栏 --------
  setupSidebar() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  },

  // -------- 主题筛选器 --------
  initThemes() {
    const themes = Utils.getThemes(PracticeData, 'theme');
    const selectors = ['practiceThemeFilter', 'questionsThemeFilter'];
    selectors.forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      themes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        sel.appendChild(opt);
      });
    });

    const vocabThemes = Utils.getThemes(VocabData, 'theme');
    const vsel = document.getElementById('vocabThemeFilter');
    if (vsel) {
      vocabThemes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        vsel.appendChild(opt);
      });
    }
  },

  // -------- 筛选器事件绑定 --------
  setupFilters() {
    // 练习页筛选
    document.getElementById('practiceLevelFilter')?.addEventListener('change', () => this.renderPractice());
    document.getElementById('practiceThemeFilter')?.addEventListener('change', () => this.renderPractice());
    document.getElementById('shuffleBtn')?.addEventListener('click', () => this.renderPractice(true));

    // 语法页筛选
    document.getElementById('grammarList')?.addEventListener('click', (e) => {
      const item = e.target.closest('.grammar-item');
      if (!item) return;
      const detail = item.querySelector('.grammar-detail');
      if (detail) detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.grammar-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.grammar-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderGrammar();
      });
    });

    // 词汇页
    document.getElementById('vocabLevelFilter')?.addEventListener('change', () => this.renderVocab());
    document.getElementById('vocabThemeFilter')?.addEventListener('change', () => this.renderVocab());
    document.getElementById('vocabSearch')?.addEventListener('input', Utils.debounce ? (() => this.renderVocab()) : (() => this.renderVocab()));

    document.getElementById('vocabGrid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.vocab-card');
      if (card) card.classList.toggle('expanded');
    });

    // 题库页
    document.getElementById('questionsLevelFilter')?.addEventListener('change', () => this.renderQuestions());
    document.getElementById('questionsThemeFilter')?.addEventListener('change', () => this.renderQuestions());
    document.getElementById('questionsList')?.addEventListener('click', (e) => {
      const item = e.target.closest('.question-item');
      if (item) item.classList.toggle('expanded');
    });

    // 提交答案
    document.getElementById('submitBtn')?.addEventListener('click', () => this.submitAnswer());
    document.getElementById('nextBtn')?.addEventListener('click', () => this.nextQuestion());

    // Enter 提交
    document.getElementById('answerInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.submitAnswer();
      }
    });

    // 重置进度
    document.getElementById('resetProgressBtn')?.addEventListener('click', () => {
      if (confirm('确定要重置所有学习数据吗？此操作不可恢复。')) {
        ProgressManager.reset();
        this.renderProgress();
        this.renderDashboard();
      }
    });
  },

  // -------- DASHBOARD --------
  renderDashboard() {
    const p = ProgressManager.get();
    const today = Utils.today();
    const todayData = p.dailyHistory[today];
    const todayCount = todayData ? todayData.total : 0;
    const accuracy = p.totalQuestions > 0 ? Math.round(p.totalCorrect / p.totalQuestions * 100) + '%' : '--';

    document.getElementById('todayCount').textContent = todayCount;
    document.getElementById('accuracyRate').textContent = accuracy;
    document.getElementById('streakDays').textContent = p.streakDays;
    document.getElementById('questionCount').textContent = PracticeData.length;

    // 每日提示
    const tips = ['每天进步一点点！', '坚持就是胜利！', '今天你造句了吗？', 'Practice makes perfect!'];
    document.getElementById('dailyTip').textContent = tips[Math.floor(Math.random() * tips.length)];
  },

  // -------- PRACTICE --------
  renderPractice(shuffle) {
    const level = document.getElementById('practiceLevelFilter').value;
    const theme = document.getElementById('practiceThemeFilter').value;

    let list = [...PracticeData];
    if (level !== 'all') list = list.filter(q => q.level === level);
    if (theme !== 'all') list = list.filter(q => q.theme === theme);

    if (list.length === 0) {
      document.getElementById('practiceCardContainer').innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray-400);">当前筛选条件下没有题目</p>';
      return;
    }

    if (shuffle) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }

    this.practiceList = list;
    this.practiceIndex = 0;

    // 恢复卡片结构（防止之前被替换）
    const container = document.getElementById('practiceCardContainer');
    if (!container.querySelector('.practice-header')) {
      // 重建
    }
    this.showQuestion(0);
  },

  showQuestion(index) {
    if (index >= this.practiceList.length) index = 0;
    if (index < 0) index = this.practiceList.length - 1;
    this.practiceIndex = index;

    const q = this.practiceList[index];
    document.getElementById('promptText').textContent = q.prompt_cn;
    document.getElementById('practiceLevel').textContent = { beginner: '初级', intermediate: '中级', advanced: '高级' }[q.level] || q.level;
    document.getElementById('practiceTheme').textContent = q.theme;
    document.getElementById('practiceNum').textContent = `${index + 1} / ${this.practiceList.length}`;
    document.getElementById('keywordHint').textContent = q.keywords.join(', ');
    document.getElementById('grammarHint').textContent = `语法点：${q.grammar_point}`;

    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').disabled = false;
    document.getElementById('submitBtn').style.display = 'inline-flex';
    document.getElementById('feedbackArea').style.display = 'none';
    document.getElementById('answerInput').focus();
  },

  async submitAnswer() {
    const answer = document.getElementById('answerInput').value.trim();
    if (!answer) { Utils.toast('请输入你的英文句子', 'error'); return; }

    const q = this.practiceList[this.practiceIndex];
    document.getElementById('answerInput').disabled = true;
    document.getElementById('submitBtn').style.display = 'none';

    const result = await API.checkAnswer(q.id, answer);
    const fb = document.getElementById('feedbackArea');
    const fr = document.getElementById('feedbackResult');

    if (result.correct === true) {
      fr.className = 'feedback-result correct';
      fr.textContent = '✅ 完全正确！太棒了！';
    } else if (result.correct === 'partial') {
      fr.className = 'feedback-result partial';
      fr.textContent = `⚠️ ${result.message || '接近正确！'}`;
    } else {
      fr.className = 'feedback-result wrong';
      fr.textContent = `❌ ${result.message || '继续加油！'}`;
    }

    document.getElementById('correctAnswer').textContent = result.ref || q.prompt_en;
    document.getElementById('grammarAnalysis').textContent = result.grammar_point || q.grammar_point;

    fb.style.display = 'block';
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    ProgressManager.recordResult(result.correct);
  },

  nextQuestion() {
    this.practiceIndex++;
    if (this.practiceIndex >= this.practiceList.length) {
      Utils.toast('🎉 已完成所有题目！', 'success');
      this.practiceIndex = 0;
    }
    this.showQuestion(this.practiceIndex);
  },

  // -------- GRAMMAR --------
  renderGrammar() {
    const active = document.querySelector('.grammar-filter .filter-btn.active');
    const level = active ? active.dataset.level : 'all';
    const list = level === 'all' ? GrammarData : GrammarData.filter(g => g.level === level);
    const el = document.getElementById('grammarList');

    el.innerHTML = list.map(g => `
      <div class="grammar-item">
        <div class="grammar-item-header">
          <h3>${g.name}</h3>
          <span class="grammar-level ${g.level}">${{ beginner: '初级', intermediate: '中级', advanced: '高级' }[g.level]}</span>
        </div>
        <p class="grammar-desc">${g.description}</p>
        <div class="grammar-detail" style="display:none;">
          <div class="grammar-formula">${g.formula}</div>
          <div class="grammar-example">📝 ${g.example}</div>
          ${g.tips ? `<div class="grammar-tips">💡 ${g.tips}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  // -------- VOCAB --------
  renderVocab() {
    const level = document.getElementById('vocabLevelFilter').value;
    const theme = document.getElementById('vocabThemeFilter').value;
    const search = document.getElementById('vocabSearch').value;

    let list = [...VocabData];
    if (level !== 'all') list = list.filter(v => v.level === level);
    if (theme !== 'all') list = list.filter(v => v.theme === theme);
    if (search) list = list.filter(v => v.word.toLowerCase().includes(search.toLowerCase()) || v.meaning.includes(search));

    const el = document.getElementById('vocabGrid');
    el.innerHTML = list.map(v => `
      <div class="vocab-card">
        <div class="vocab-word">${v.word}</div>
        <div class="vocab-meaning">${v.meaning}</div>
        <div class="vocab-tags">
          <span class="vocab-tag">${{ beginner: '初级', intermediate: '中级' }[v.level]}</span>
          <span class="vocab-tag">${v.theme}</span>
        </div>
        <div class="vocab-example">💬 ${v.example}</div>
      </div>
    `).join('');
  },

  // -------- QUESTIONS --------
  renderQuestions() {
    const level = document.getElementById('questionsLevelFilter').value;
    const theme = document.getElementById('questionsThemeFilter').value;

    let list = [...PracticeData];
    if (level !== 'all') list = list.filter(q => q.level === level);
    if (theme !== 'all') list = list.filter(q => q.theme === theme);

    const el = document.getElementById('questionsList');
    el.innerHTML = list.map(q => `
      <div class="question-item">
        <div class="question-header">
          <span class="badge">${q.grammar_point}</span>
          <span class="badge badge-theme">${q.theme}</span>
          <span class="badge">${{ beginner: '初级', intermediate: '中级', advanced: '高级' }[q.level]}</span>
        </div>
        <div class="question-prompt">${q.prompt_cn}</div>
        <div class="question-keywords">🔑 ${q.keywords.join(', ')}</div>
        <div class="question-answer">✅ ${q.prompt_en}</div>
      </div>
    `).join('');
  },

  // -------- PROGRESS --------
  renderProgress() {
    const p = ProgressManager.get();
    document.getElementById('totalPractice').textContent = p.totalQuestions;
    document.getElementById('totalCorrect').textContent = p.totalCorrect;
    document.getElementById('totalAccuracy').textContent = p.totalQuestions > 0 ? Math.round(p.totalCorrect / p.totalQuestions * 100) + '%' : '--';

    // 成就徽章
    const badges = {
      beginner: p.totalQuestions >= 5,
      persistent: p.streakDays >= 3,
      master: p.totalQuestions >= 20 && (p.totalCorrect / p.totalQuestions) >= 0.7,
      explorer: new Set(p.dailyHistory ? Object.keys(p.dailyHistory) : []).size >= 5
    };

    const badgeNames = { beginner: '🌱 初学者', persistent: '🔥 坚持达人', master: '🏅 造句大师', explorer: '🗺️ 探索者' };
    const badgeEls = document.querySelectorAll('.badge-item');
    badgeEls.forEach(el => {
      const key = el.dataset.badge;
      if (badges[key]) {
        el.classList.remove('locked');
        el.classList.add('unlocked');
        el.innerHTML = `<span class="badge-icon">${badgeNames[key].split(' ')[0]}</span><span>${badgeNames[key].slice(2)}</span>`;
      } else {
        el.classList.add('locked');
        el.classList.remove('unlocked');
      }
    });

    // 正确率趋势图（简单柱状）
    const chartEl = document.getElementById('accuracyChart');
    const hist = p.accuracyHistory || [];
    if (hist.length < 2) {
      chartEl.innerHTML = '<p class="chart-empty">还没有足够的数据，开始练习吧！</p>';
      return;
    }

    const recent = hist.slice(-10);
    const max = Math.max(...recent.map(h => h.accuracy), 100);
    chartEl.innerHTML = `<div style="display:flex;align-items:flex-end;gap:4px;height:120px;padding:0 8px;">
      ${recent.map(h => {
        const ht = Math.max((h.accuracy / max) * 100, 4);
        const color = h.accuracy >= 80 ? '#10b981' : h.accuracy >= 50 ? '#f59e0b' : '#ef4444';
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;">
          <div style="width:100%;height:${ht}px;background:${color};border-radius:4px 4px 0 0;min-height:4px;transition:height 0.3s;" title="${h.accuracy}%"></div>
          <span style="font-size:10px;color:#9ca3af;margin-top:4px;transform:rotate(-45deg);white-space:nowrap;">${h.date.slice(5)}</span>
        </div>`;
      }).join('')}
    </div>`;
  }
};

// -------- 启动 --------
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  // 处理初始 hash
  if (!location.hash) location.hash = '#dashboard';
});
