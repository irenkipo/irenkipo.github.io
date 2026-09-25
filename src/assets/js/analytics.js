(() => {
  "use strict";

  const MEASUREMENT_ID = "G-5F54GZZN18";
  const NATIVE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf4CueonKqtg43EaRjTHyjK3V_PbcGvwwzNju_QM2_mjdCspg/formResponse";
  const NATIVE_EMAIL_FIELD = "entry.639030799";
  const NATIVE_CONSENT_FIELD = "entry.2056694574";
  const OWNER_KEY = "iren_kipo_owner_test";
  const OWNER_PARAM = "owner_test";

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

  function ownerTestMode() {
    const params = new URLSearchParams(location.search);
    const command = params.get(OWNER_PARAM);
    try {
      if (command === "1") localStorage.setItem(OWNER_KEY, "1");
      if (command === "0") localStorage.removeItem(OWNER_KEY);
    } catch {}

    if (command === "1" || command === "0") {
      params.delete(OWNER_PARAM);
      const query = params.toString();
      const cleaned = location.pathname + (query ? "?" + query : "") + location.hash;
      try { history.replaceState(null, "", cleaned); } catch {}
    }

    try { return localStorage.getItem(OWNER_KEY) === "1"; } catch { return false; }
  }

  const OWNER_TEST = ownerTestMode();

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

  function compactToken(value, fallback = "na", max = 16) {
    const token = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
      .slice(0, max);
    return token || fallback;
  }

  function pageCode() {
    if (document.body?.dataset.page === "404") return "404";
    if (location.pathname === "/") return "home";
    if (location.pathname === "/read/") return "read";
    const chapter = location.pathname.match(/^\/read\/chapter-(\d{2})\/$/);
    if (chapter) return "c" + chapter[1];
    if (location.pathname === "/privacy.html") return "privacy";
    if (location.pathname === "/terms.html") return "terms";
    if (location.pathname === "/unsubscribe.html") return "unsubscribe";
    return "other";
  }

  function sourceToken() {
    const a = currentAttribution();
    const source = compactToken(a.utm_source, "", 10);
    const content = compactToken(a.utm_content, "", 6);
    if (source && content) return compactToken(source + "-" + content, "utm", 18);
    if (source) return source;

    if (!document.referrer) return "direct";
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === location.origin) return "internal";
      const host = ref.hostname.toLowerCase();
      const social = SOCIAL_HOSTS.get(host);
      if (social) return social;
      if (/(^|\.)(google|bing|yandex|duckduckgo|yahoo)\./.test(host)) return "search";
      return "referral";
    } catch {
      return "direct";
    }
  }

  function isExternalEntry() {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav && nav.type === "reload") return false;
    } catch {}
    if (!document.referrer) return true;
    try { return new URL(document.referrer).origin !== location.origin; } catch { return true; }
  }

  function nativeEvent(eventName, dimension = "all", source = sourceToken()) {
    if (OWNER_TEST) return;
    const event = compactToken(eventName, "event", 16);
    const dim = compactToken(dimension, "all", 12);
    const src = compactToken(source, "direct", 18);
    const email = `site.${event}.${dim}.${src}@analytics.invalid`;
    const body = new URLSearchParams();
    body.set(NATIVE_EMAIL_FIELD, email);
    body.set(NATIVE_CONSENT_FIELD, "Согласен");

    try {
      fetch(NATIVE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        credentials: "omit",
        keepalive: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body
      }).catch(() => {});
    } catch {}
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

  if (!OWNER_TEST) {
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
  }

  function sendEvent(name, parameters = {}) {
    if (OWNER_TEST) return;
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
      nativeEvent("litres", "out");
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
      if (downloadFormat === "epub") nativeEvent("dl-epub", "book1");
      else if (downloadFormat === "pdf") nativeEvent("dl-pdf", "book1");
      else if (downloadFormat === "audiobook_zip") nativeEvent("dl-audio", "book1");
      return;
    }
    if (url.origin === location.origin && location.pathname === "/" && url.pathname === "/read/") {
      sendEvent("read_start", params);
      nativeEvent("read", "start");
      return;
    }
    const chapter = url.pathname.match(/^\/read\/chapter-(\d{2})\/$/);
    if (url.origin === location.origin && chapter) {
      sendEvent("chapter_start", { ...params, chapter_number: Number(chapter[1]) });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = pageCode();
    nativeEvent("page", currentPage);
    if (isExternalEntry()) nativeEvent("visit", currentPage);

    document.addEventListener("click", event => {
      const audioOpen = event.target.closest('[data-open="audio"]');
      if (audioOpen) {
        sendEvent("audiobook_open");
        nativeEvent("audioopen", "book1");
      }
      const chapterButton = event.target.closest("[data-audio-chapter]");
      if (chapterButton) {
        const chapterNumber = Number(chapterButton.dataset.audioChapter);
        sendEvent("audiobook_chapter_select", { chapter_number: chapterNumber });
        if (chapterNumber) {
          sendEvent("audiobook_chapter_select_ch" + String(chapterNumber).padStart(2, "0"));
          nativeEvent("audioselect", "c" + String(chapterNumber).padStart(2, "0"));
        }
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
      nativeEvent("audioplay", "c" + String(chapter).padStart(2, "0"));
    });

    document.addEventListener("subscription:submitted", event => {
      const detail = event.detail || {};
      sendEvent("subscription_submit", {
        utm_source: detail.utm_source || attributionParameters().utm_source,
        utm_medium: detail.utm_medium || attributionParameters().utm_medium,
        utm_campaign: detail.utm_campaign || attributionParameters().utm_campaign,
        utm_content: detail.utm_content || attributionParameters().utm_content
      });
      nativeEvent("subscribe", "form");
    });

    if (document.body?.dataset.page === "404") {
      sendEvent("404_view", {
        requested_path: location.pathname + location.search,
        page_referrer: document.referrer || undefined
      });
      nativeEvent("err404", "404");
    }

    const chapter = location.pathname.match(/^\/read\/chapter-(\d{2})\/$/);
    if (chapter) {
      const chapterNumber = Number(chapter[1]);
      const chapterCode = "c" + chapter[1];
      sendEvent("chapter_open", { chapter_number: chapterNumber });
      nativeEvent("copen", chapterCode);

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
            nativeEvent(threshold === 50 ? "p50" : "p90", chapterCode);
            if (chapterNumber === 11 && threshold === 90) {
              sendEvent("book_complete", { book_title: "В зоне видимости" });
              nativeEvent("complete", "book1");
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
