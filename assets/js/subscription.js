(() => {
  "use strict";
  const form = document.querySelector("[data-subscription-form]");
  if (!form) return;

  const submit = form.querySelector("[data-subscription-submit]");
  const status = form.querySelector("[data-subscription-status]");
  const frame = form.querySelector('iframe[name="subscription-result"]');
  const endpoint = String(window.IREN_KIPO_SUBSCRIPTION_ENDPOINT || "").trim();
  let submitted = false;

  const setStatus = (message, kind = "") => {
    status.textContent = message;
    status.dataset.state = kind;
  };

  const params = new URLSearchParams(location.search);
  for (const name of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const field = form.elements.namedItem(name);
    if (field) field.value = params.get(name) || "";
  }
  form.elements.namedItem("page_url").value = location.href;
  form.elements.namedItem("referrer").value = document.referrer || "";

  if (endpoint) form.action = endpoint;

  form.addEventListener("submit", event => {
    setStatus("");
    if (!endpoint) {
      event.preventDefault();
      setStatus("Подписка временно недоступна. Попробуйте немного позже.", "error");
      return;
    }
    if (!form.reportValidity()) {
      event.preventDefault();
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
    form.elements.namedItem("name").value = "";
    form.elements.namedItem("email").value = "";
    form.elements.namedItem("consent").checked = false;
    setStatus("Спасибо! Подписка оформлена.", "success");
  });
})();
