(() => {
  "use strict";
  const form = document.querySelector("[data-subscription-form]");
  if (!form) return;

  const submit = form.querySelector("[data-subscription-submit]");
  const status = form.querySelector("[data-subscription-status]");
  const frame = form.querySelector('iframe[name="subscription-result"]');
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

  const emailField = form.querySelector('[data-subscription-field="email"]');
  const consentField = form.querySelector('[data-subscription-field="consent"]');
  const ready = Boolean(form.action) && Boolean(emailField) && Boolean(consentField);

  form.addEventListener("submit", event => {
    setStatus("");
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    if (!ready) {
      event.preventDefault();
      setStatus("Не удалось подключиться к форме подписки. Попробуйте позже.", "error");
      return;
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
    document.dispatchEvent(new CustomEvent("subscription:submitted", {
      detail: {
        utm_source: values.utm_source,
        utm_medium: values.utm_medium,
        utm_campaign: values.utm_campaign,
        utm_content: values.utm_content
      }
    }));
    if (emailField) emailField.value = "";
    if (consentField) consentField.checked = false;
    setStatus("Спасибо! Заявка отправлена.", "sent");
  });
})();
