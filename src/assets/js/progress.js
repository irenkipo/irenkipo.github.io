(() => {
  "use strict";

  const KEY = "iren_kipo_reading_progress_v1";
  const CHAPTER_PATH = /^\/read\/chapter-(\d{2})\/$/;

  function loadProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!value || typeof value !== "object") return null;
      if (!CHAPTER_PATH.test(String(value.path || ""))) return null;
      const chapter = Number(value.chapter || 0);
      const ratio = Number(value.ratio || 0);
      if (!Number.isInteger(chapter) || chapter < 1 || chapter > 11) return null;
      if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) return null;
      return { chapter, path: String(value.path), ratio };
    } catch {
      return null;
    }
  }

  function saveProgress(chapter) {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    const ratio = Math.max(0, Math.min(1, scrollY / max));
    try {
      localStorage.setItem(KEY, JSON.stringify({
        chapter,
        path: location.pathname,
        ratio,
        updated_at: new Date().toISOString()
      }));
    } catch {}
  }

  const saved = loadProgress();

  if (location.pathname === "/" && saved) {
    const readLink = document.querySelector('a.button.primary[href="read/"]');
    if (readLink) readLink.href = saved.path;
  }

  const article = document.querySelector(".chapter-text[data-chapter]");
  if (!article) return;

  const chapter = Number(article.dataset.chapter || 0);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 11) return;

  if (saved && saved.chapter === chapter && saved.path === location.pathname && saved.ratio > 0) {
    const restore = () => {
      const doc = document.documentElement;
      const max = Math.max(0, doc.scrollHeight - innerHeight);
      if (max > 0) scrollTo(0, Math.round(max * saved.ratio));
    };
    requestAnimationFrame(() => requestAnimationFrame(restore));
  }

  let timer = 0;
  const queueSave = () => {
    if (timer) return;
    timer = window.setTimeout(() => {
      timer = 0;
      saveProgress(chapter);
    }, 500);
  };

  saveProgress(chapter);
  addEventListener("scroll", queueSave, { passive: true });
  addEventListener("resize", queueSave, { passive: true });
  addEventListener("pagehide", () => saveProgress(chapter));
})();
