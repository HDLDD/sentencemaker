// =========================================
// Utils — 工具函数
// =========================================

const Utils = {
  /** 显示 Toast 提示 */
  toast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.background = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#1f2937';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  },

  /** 本地存储读写 */
  storage: {
    get(key, def = null) {
      try { const v = localStorage.getItem('sb_' + key); return v ? JSON.parse(v) : def; }
      catch { return def; }
    },
    set(key, val) { localStorage.setItem('sb_' + key, JSON.stringify(val)); },
    remove(key) { localStorage.removeItem('sb_' + key); }
  },

  /** 生成唯一ID */
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },

  /** 简单相似度比较（用于答案校验） */
  normalize(s) {
    return s.toLowerCase()
      .replace(/[^\w\s']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /** 关键词得分 */
  keywordScore(answer, keywords) {
    const norm = this.normalize(answer);
    const hits = keywords.filter(kw => norm.includes(kw.toLowerCase()));
    return { score: hits.length / keywords.length, hits, total: keywords.length };
  },

  /** 获取唯一主题列表 */
  getThemes(items, key = 'theme') {
    return [...new Set(items.map(i => i[key]))].filter(Boolean).sort();
  },

  /** 格式化日期 */
  today() { return new Date().toISOString().slice(0, 10); }
};
