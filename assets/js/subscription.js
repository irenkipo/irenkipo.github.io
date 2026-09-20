(() => {
  "use strict";
  const form = document.querySelector("[data-subscription-form]");
  if (!form) return;

  const submit = form.querySelector("[data-subscription-submit]");
  const status = form.querySelector("[data-subscription-status]");
  const frame = form.querySelector('iframe[name="subscription-result"]');
  const config = window.IREN_KIPO_SUBSCRIPTION || {};
  const fields = config.fields || {};
  let submitted = false;

  const setStatus = (message, kind = "") => {
    status.textContent = message;
    status.dataset.state = kind;
  };

  const params = new URLSearchParams(location.search);
  const values = {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    page_url: location.href,
    referrer: document.referrer || ""
  };

  for (const [key, value] of Object.entries(values)) {
    const control = form.elements.namedItem(key);
    if (control) control.value = value;
  }

  const requiredMappings = ["email", "consent"];
  const ready = Boolean(config.action) && requiredMappings.every(key => Boolean(fields[key]));

  form.addEventListener("submit", event => {
    setStatus("");
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    if (!ready) {
      event.preventDefault();
      setStatus("Форма почти готова: завершается подключение к Google Forms.", "error");
      return;
    }

    form.action = config.action;
    for (const [logicalName, googleName] of Object.entries(fields)) {
      const control = form.elements.namedItem(logicalName);
      if (control && googleName) control.setAttribute("name", googleName);
    }

    submitted = true;
    submit.disabled = true;
    submit.textContent = "Отправляем…";
    setStatus("Отправляем…", "pending");
  });

  frame.addEventListener("load", () => {
    if (!submitted) return;
    submitted = false;
    submit.disabled = false;
    submit.textContent = "Подписаться";
    const email = form.querySelector('input[type="email"]');
    const consent = form.querySelector('input[type="checkbox"]');
    if (email) email.value = "";
    if (consent) consent.checked = false;
    setStatus("Спасибо! Вы подписаны на новости Ирэн Кипо.", "success");
  });
})();
