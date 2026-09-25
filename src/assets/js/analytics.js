(() => {
  "use strict";
  const MEASUREMENT_ID = "G-5F54GZZN18";
  const SOCIAL_HOSTS = new Map([
    ["www.instagram.com", "instagram"], ["instagram.com", "instagram"],
    ["www.facebook.com", "facebook"], ["facebook.com", "facebook"],
    ["www.threads.com", "threads"], ["threads.com", "threads"],
    ["www.youtube.com", "youtube"], ["youtube.com", "youtube"],
    ["t.me", "telegram"],
    ["www.tiktok.com", "tiktok"], ["tiktok.com", "tiktok"]
  ]);

  const ATTRIBUTION_KEY = "iren_kipo_campaign_attribution";
  const ATTRIBUTION_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

  function currentAttribution() {
    const direct = Object.fromEntries(ATTRIBUTION_FIELDS.map(key => [key, new URLSearchParams(location.search).get(key) || ""]));
    if (direct.utm_source || direct.utm_medium || direct.utm_campaign || direct.utm_content) {
      try { sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(direct)); } catch {}
      return direct;
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "{}");
      return Object.fromEntries(ATTRIBUTION_FIELDS.map(key => [key, typeof saved[key] === "string" ? saved[key] : ""]));
    } catch {
      return Object.fromEntries(ATTRIBUTION_FIELDS.map(key => [key, ""]));
    }
  }

  function attributionParameters() {
    const a = currentAttribution();
    return Object.fromEntries(ATTRIBUTION_FIELDS.map(key => [key, a[key] || undefined]));
  }

  currentAttribution();

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.gtag("set", "allow_google_signals", false);
  window.gtag("set", "allow_ad_personalization_signals", false);
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
  script.dataset.ga4 = MEASUREMENT_ID;
  document.head.appendChild(script);

  function sendEvent(name, parameters = {}) {
    window.gtag("event", name, { transport_type: "beacon", ...attributionParameters(), ...parameters });
  }

  function trackMeaningfulClick(event) {
    const link = event.target.closest("a[href]");
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const params = { link_url: url.href };

    if (url.hostname === "www.litres.ru" || url.hostname === "litres.ru") {
      sendEvent("litres_click", params);
      return;
    }
    if (url.hostname === "docs.google.com") {
      sendEvent("subscribe_click", params);
      return;
    }
    const social = SOCIAL_HOSTS.get(url.hostname);
    if (social) {
      sendEvent("social_click", { ...params, social_network: social });
      return;
    }
    if (link.hasAttribute("download") || /\/assets\/books\/book1\.(?:epub|pdf)$/i.test(url.pathname)) {
      const fileName = url.pathname.split("/").pop() || "";
      let downloadFormat = "other";
      if (/\.epub$/i.test(fileName)) downloadFormat = "epub";
      else if (/\.pdf$/i.test(fileName)) downloadFormat = "pdf";
      else if (/\.zip$/i.test(fileName) || /audiobook/i.test(fileName)) downloadFormat = "audiobook_zip";
      sendEvent("book_download", { ...params, file_name: fileName, download_format: downloadFormat });
      if (downloadFormat !== "other") sendEvent("book_download_" + downloadFormat, params);
      return;
    }
    if (url.origin === location.origin && location.pathname === "/" && url.pathname === "/read/") {
      sendEvent("read_start", params);
      return;
    }
    const chapter = url.pathname.match(/^\/read\/chapter-(\d{2})\/$/);
    if (url.origin === location.origin && chapter) {
      sendEvent("chapter_start", { ...params, chapter_number: Number(chapter[1]) });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", event => {
      const audioOpen = event.target.closest('[data-open="audio"]');
      if (audioOpen) sendEvent("audiobook_open");
      const chapterButton = event.target.closest("[data-audio-chapter]");
      if (chapterButton) {
        const chapterNumber = Number(chapterButton.dataset.audioChapter);
        sendEvent("audiobook_chapter_select", { chapter_number: chapterNumber });
        if (chapterNumber) sendEvent("audiobook_chapter_select_ch" + String(chapterNumber).padStart(2, "0"));
      }
      trackMeaningfulClick(event);
    }, true);
    const played = new Set();
    document.addEventListener("audiobook:play", event => {
      const chapter = Number(event.detail?.chapter || 0);
      if (!chapter || played.has(chapter)) return;
      played.add(chapter);
      sendEvent("audiobook_play", { chapter_number: chapter });
      sendEvent("audiobook_play_ch" + String(chapter).padStart(2, "0"));
    });
    document.addEventListener("subscription:submitted", event => {
      const detail = event.detail || {};
      sendEvent("subscription_submit", {
        utm_source: detail.utm_source || attributionParameters().utm_source,
        utm_medium: detail.utm_medium || attributionParameters().utm_medium,
        utm_campaign: detail.utm_campaign || attributionParameters().utm_campaign,
        utm_content: detail.utm_content || attributionParameters().utm_content
      });
    });
    if (document.body?.dataset.page === "404") {
      sendEvent("404_view", {
        requested_path: location.pathname + location.search,
        page_referrer: document.referrer || undefined
      });
    }

    const chapter = location.pathname.match(/^\/read\/chapter-(\d{2})\/$/);
    if (chapter) {
      const chapterNumber = Number(chapter[1]);
      sendEvent("chapter_open", { chapter_number: chapterNumber });

      const milestones = new Set();
      const reportProgress = () => {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - innerHeight);
        const progress = Math.max(0, Math.min(100, Math.round((scrollY / max) * 100)));
        for (const threshold of [50, 90]) {
          if (progress >= threshold && !milestones.has(threshold)) {
            milestones.add(threshold);
            sendEvent("chapter_progress", { chapter_number: chapterNumber, percent_read: threshold });
            sendEvent("chapter_progress_" + threshold, { chapter_number: chapterNumber });
            if (chapterNumber === 11 && threshold === 90) {
              sendEvent("book_complete", { book_title: "В зоне видимости" });
            }
          }
        }
      };
      addEventListener("scroll", reportProgress, { passive: true });
      addEventListener("resize", reportProgress, { passive: true });
      reportProgress();
    }
  });
})();