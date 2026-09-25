(() => {
  "use strict";

  const root = document.querySelector("[data-audio-player]");
  if (!root) return;

  const KEY = "iren_kipo_audio_progress_v1";
  const audio = root.querySelector("[data-audio-element]");
  const status = root.querySelector("[data-audio-status]");
  const buttons = [...root.querySelectorAll("[data-audio-chapter]")];
  const openButton = document.querySelector('[data-open="audio"]');
  let active = null;
  let restored = false;
  let lastSavedSecond = -1;

  function loadProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!value || typeof value !== "object") return null;
      const chapter = Number(value.chapter || 0);
      const time = Number(value.time || 0);
      if (!Number.isInteger(chapter) || chapter < 1 || chapter > 11) return null;
      if (!Number.isFinite(time) || time < 0) return null;
      return { chapter, time };
    } catch {
      return null;
    }
  }

  function writeProgress(chapter, time) {
    if (!chapter) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        chapter,
        time: Math.max(0, Number(time) || 0),
        updated_at: new Date().toISOString()
      }));
    } catch {}
  }

  function saveCurrent(force = false) {
    if (!active) return;
    const second = Math.max(0, Math.floor(Number(audio.currentTime) || 0));
    if (!force && second === lastSavedSecond) return;
    lastSavedSecond = second;
    writeProgress(active, Number(audio.currentTime) || 0);
  }

  function select(button, resumeTime = null) {
    if (!button) return;

    const src = button.dataset.audioSrc;
    const title = button.dataset.audioTitle || "Глава";
    const chapter = Number(button.dataset.audioChapter || 0);
    if (!src || !chapter) return;

    const absoluteSrc = new URL(src, document.baseURI).href;
    const changingSource = audio.src !== absoluteSrc;

    if (changingSource) {
      if (active && audio.src) saveCurrent(true);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    buttons.forEach(item => item.setAttribute("aria-current", String(item === button)));
    active = chapter;
    status.textContent = title;

    if (changingSource) {
      if (resumeTime !== null && resumeTime > 0) {
        audio.addEventListener("loadedmetadata", () => {
          const duration = Number(audio.duration);
          const target = Number.isFinite(duration) && duration > 1
            ? Math.min(resumeTime, duration - 0.5)
            : resumeTime;
          try { audio.currentTime = Math.max(0, target); } catch {}
          lastSavedSecond = Math.floor(Math.max(0, target));
        }, { once: true });
      }

      audio.src = src;
      audio.load();
    } else if (resumeTime !== null && resumeTime > 0) {
      try { audio.currentTime = resumeTime; } catch {}
      lastSavedSecond = Math.floor(resumeTime);
    }

    if (resumeTime === null) {
      lastSavedSecond = 0;
      writeProgress(active, 0);
    }

    document.dispatchEvent(new CustomEvent("audiobook:chapter-select", {
      detail: { chapter: active, title }
    }));
  }

  function restoreSavedProgress() {
    if (restored) return;
    restored = true;
    const saved = loadProgress();
    if (!saved) return;
    const button = buttons.find(item => Number(item.dataset.audioChapter || 0) === saved.chapter);
    if (button) select(button, saved.time);
  }

  buttons.forEach(button => button.addEventListener("click", () => {
    select(button);
    const play = audio.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  }));

  openButton?.addEventListener("click", restoreSavedProgress);

  audio.addEventListener("play", () => {
    if (!active) return;
    document.dispatchEvent(new CustomEvent("audiobook:play", { detail: { chapter: active } }));
  });

  audio.addEventListener("timeupdate", () => {
    const second = Math.floor(Number(audio.currentTime) || 0);
    if (second % 5 === 0) saveCurrent();
  });

  audio.addEventListener("pause", () => saveCurrent(true));

  audio.addEventListener("ended", () => {
    const next = buttons.find(item => Number(item.dataset.audioChapter || 0) === active + 1);
    try {
      if (next) {
        writeProgress(active + 1, 0);
      } else {
        localStorage.removeItem(KEY);
      }
    } catch {}
  });

  audio.addEventListener("error", () => {
    status.textContent = "Не удалось загрузить аудио. Попробуйте выбрать главу ещё раз.";
  });

  addEventListener("pagehide", () => saveCurrent(true));
})();
