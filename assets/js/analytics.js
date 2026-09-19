(() => {
  "use strict";
  const MEASUREMENT_ID = "G-5F54GZZN18";
  const CONSENT_KEY = "irenkipo.analyticsConsent.v1";
  const SOCIAL_HOSTS = new Map([
    ["www.instagram.com", "instagram"], ["instagram.com", "instagram"],
    ["www.facebook.com", "facebook"], ["facebook.com", "facebook"],
    ["www.threads.com", "threads"], ["threads.com", "threads"],
    ["www.youtube.com", "youtube"], ["youtube.com", "youtube"],
    ["t.me", "telegram"],
    ["www.tiktok.com", "tiktok"], ["tiktok.com", "tiktok"]
  ]);
  let gaLoaded = false;
  function readConsent() {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch { return null; }
  }
  function writeConsent(value) { try { localStorage.setItem(CONSENT_KEY, value); } catch {} }
  function analyticsAllowed() { return readConsent() === "granted"; }
  function initDataLayer() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  }
  function loadAnalytics() {
    if (gaLoaded || !analyticsAllowed()) return;
    gaLoaded = true;
    initDataLayer();
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
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
    const chapter = location.pathname.match(/^\/read\/chapter-(\d{2})\/$/);
    if (chapter) window.gtag("event", "chapter_open", { chapter_number: Number(chapter[1]), transport_type: "beacon" });
  }
  function removeBanner() { document.querySelector("[data-analytics-banner]")?.remove(); }
  function applyChoice(value) {
    const hadAnalytics = gaLoaded;
    writeConsent(value);
    removeBanner();
    if (value === "granted") { loadAnalytics(); return; }
    if (hadAnalytics && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      setTimeout(() => location.reload(), 80);
    }
  }
  function showBanner() {
    removeBanner();
    const banner = document.createElement("section");
    banner.className = "analytics-consent";
    banner.dataset.analyticsBanner = "";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Настройки аналитики");
    banner.innerHTML =
      '<p>Мы используем Google Analytics, чтобы понимать, как посетители находят сайт и пользуются им.</p>' +
      '<div class="analytics-consent-actions">' +
      '<button type="button" data-analytics-consent="granted">Разрешить аналитику</button>' +
      '<button type="button" data-analytics-consent="denied">Не разрешать</button>' +
      '<a href="/privacy.html">Подробнее</a></div>';
    banner.addEventListener("click", event => {
      const button = event.target.closest("[data-analytics-consent]");
      if (button) applyChoice(button.dataset.analyticsConsent);
    });
    document.body.appendChild(banner);
  }
  function sendEvent(name, parameters = {}) {
    if (!analyticsAllowed() || typeof window.gtag !== "function") return;
    window.gtag("event", name, { transport_type: "beacon", ...parameters });
  }
  function trackMeaningfulClick(event) {
    const link = event.target.closest("a[href]");
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const params = { link_url: url.href };
    if (url.hostname === "www.litres.ru" || url.hostname === "litres.ru") return sendEvent("litres_click", params);
    if (url.hostname === "docs.google.com") return sendEvent("subscribe_click", params);
    const social = SOCIAL_HOSTS.get(url.hostname);
    if (social) return sendEvent("social_click", { ...params, social_network: social });
    if (link.hasAttribute("download") || /\/assets\/books\/book1\.(?:epub|pdf)$/i.test(url.pathname)) {
      return sendEvent("book_download", { ...params, file_name: url.pathname.split("/").pop() });
    }
    if (url.origin === location.origin && location.pathname === "/" && url.pathname === "/read/") return sendEvent("read_start", params);
    const chapter = url.pathname.match(/^\/read\/chapter-(\d{2})\/$/);
    if (url.origin === location.origin && chapter) sendEvent("chapter_start", { ...params, chapter_number: Number(chapter[1]) });
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", trackMeaningfulClick, true);
    const manage = document.querySelector("[data-analytics-manage]");
    if (manage) manage.addEventListener("click", showBanner);
    const consent = readConsent();
    if (consent === "granted") loadAnalytics();
    else if (consent === null) showBanner();
  });
})();