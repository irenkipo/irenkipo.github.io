(() => {
  "use strict";
  const form = document.querySelector("[data-subscription-form]");
  if (!form) return;

  const config = window.IREN_KIPO_SUBSCRIPTION || {};
  const submit = form.querySelector("[data-subscription-submit]");
  const status = form.querySelector("[data-subscription-status]");
  const frame = form.querySelector('iframe[name="subscription-result"]');
  const emailField = form.querySelector('[data-subscription-field="email"]');
  const consentField = form.querySelector('[data-subscription-field="consent"]');
  let submitted = false;

  const setStatus = (message, kind = "") => {
    status.textContent = message;
    status.dataset.state = kind;
  };

  if (config.action) form.action = config.action;
  if (emailField && config.fields && config.fields.email) emailField.name = config.fields.email;
  if (consentField && config.fields && config.fields.consent) consentField.name = config.fields.consent;

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

  const ready = Boolean(config.action) && Boolean(emailField) && Boolean(consentField);

  form.addEventListener("submit", event => {
    setStatus("");
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    if (!ready) {
      event.preventDefault();
      setStatus("Не удалось подключиться к подписке. Попробуйте позже.", "error");
      return;
    }

    submitted = true;
    submit.disabled = true;
    submit.textContent = "Отправляем…";
    setStatus("Отправляем…", "pending");
  });

  window.addEventListener("message", event => {
    if (!submitted) return;
    if (!config.messageOrigin || event.origin !== config.messageOrigin) return;
    const data = event.data || {};
    if (data.type !== "iren-kipo-subscription-result") return;

    submitted = false;
    submit.disabled = false;
    submit.textContent = "Подписаться";

    const message = data.message || (data.status === "SUBSCRIBED" ? "Спасибо! Вы получите письмо." : data.status === "ALREADY_SUBSCRIBED" ? "Вы уже подписаны." : "Не удалось оформить подписку. Попробуйте позже.");
    const kind = data.status === "SUBSCRIBED" ? "sent" : data.status === "ALREADY_SUBSCRIBED" ? "sent" : "error";
    setStatus(message, kind);

    if (data.status === "SUBSCRIBED") {
      document.dispatchEvent(new CustomEvent("subscription:submitted", {
        detail: {
          utm_source: values.utm_source,
          utm_medium: values.utm_medium,
          utm_campaign: values.utm_campaign,
          utm_content: values.utm_content
        }
      }));
      emailField.value = "";
      consentField.checked = false;
    }
  });

  frame.addEventListener("load", () => {
    if (!submitted) return;
    window.setTimeout(() => {
      if (!submitted) return;
      submitted = false;
      submit.disabled = false;
      submit.textContent = "Подписаться";
      setStatus("Не удалось получить подтверждение подписки. Попробуйте позже.", "error");
    }, 5000);
  });
})();
