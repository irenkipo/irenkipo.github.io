const HEADERS = [
  'timestamp','name','email','consent','utm_source','utm_medium','utm_campaign','utm_content',
  'page_url','referrer','status'
];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (String(p.website || '').trim()) return html_('Спасибо.');

  const email = String(p.email || '').trim().toLowerCase();
  const name = String(p.name || '').trim();
  const consent = String(p.consent || '').trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || consent !== 'yes') {
    return html_('Не удалось оформить подписку. Проверьте адрес электронной почты и согласие.');
  }

  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('SUBSCRIBERS_SHEET_ID');
  const ownerEmail = props.getProperty('OWNER_EMAIL');
  if (!sheetId || !ownerEmail) return html_('Подписка временно недоступна.');

  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName('Подписчики') || ss.insertSheet('Подписчики');
  ensureHeaders_(sheet);

  const data = sheet.getDataRange().getValues();
  const emailCol = HEADERS.indexOf('email');
  let existingRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][emailCol] || '').trim().toLowerCase() === email) {
      existingRow = i + 1;
      break;
    }
  }

  const row = [
    new Date(), name, email, 'YES',
    String(p.utm_source || ''), String(p.utm_medium || ''), String(p.utm_campaign || ''),
    String(p.utm_content || ''), String(p.page_url || ''), String(p.referrer || ''),
    existingRow > 0 ? 'EXISTING' : 'SUBSCRIBED'
  ];

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, HEADERS.length).setValues([row]);
  } else {
    sheet.appendRow(row);
    MailApp.sendEmail({
      to: ownerEmail,
      subject: 'Новый подписчик — Ирэн Кипо',
      htmlBody:
        '<p><strong>Новый подписчик на новости Ирэн Кипо.</strong></p>' +
        '<p>Имя: ' + escapeHtml_(name || '—') + '<br>' +
        'E-mail: ' + escapeHtml_(email) + '<br>' +
        'Источник: ' + escapeHtml_(String(p.utm_source || 'прямой переход')) + '<br>' +
        'Материал: ' + escapeHtml_(String(p.utm_content || '—')) + '</p>'
    });
  }

  MailApp.sendEmail({
    to: email,
    subject: 'Подписка на новости Ирэн Кипо',
    htmlBody:
      '<p>' + (name ? escapeHtml_(name) + ', ' : '') + 'спасибо за подписку.</p>' +
      '<p>Буду присылать новости о книгах и серии «Всё хорошо».</p>' +
      '<p>Ирэн Кипо</p>'
  });

  return html_('Спасибо! Подписка оформлена.');
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (current.join('|') !== HEADERS.join('|')) {
    throw new Error('SUBSCRIBER_SHEET_HEADER_MISMATCH');
  }
}

function html_(message) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="ru"><meta charset="utf-8"><body style="font-family:Arial,sans-serif">' +
    '<p>' + escapeHtml_(message) + '</p></body></html>'
  );
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
