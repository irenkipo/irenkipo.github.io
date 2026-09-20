# Подписка: Google Apps Script

Этот каталог содержит серверную часть русской формы подписки на сайте.

Одноразовая настройка:
1. Создать закрытую Google-таблицу для подписчиков.
2. Создать Apps Script, вставить `Code.gs`.
3. В Script Properties задать:
   - `SUBSCRIBERS_SHEET_ID` — ID закрытой таблицы;
   - `OWNER_EMAIL` — адрес Ирэн Кипо для уведомлений.
4. Развернуть как Web app: Execute as owner; access — anyone.
5. Скопировать URL `/exec` в `src/assets/js/subscription-config.js` и зеркальный `assets/js/subscription-config.js`.
6. После этого выполнить QA и только затем merge/deploy.

Форма на сайте полностью русская. Google-интерфейс посетителю не показывается.
Данные: дата, имя, e-mail, согласие, UTM source/medium/campaign/content, URL страницы, referrer, статус.
При новой подписке владелец получает уведомление, подписчик — русское подтверждение. Повторный e-mail обновляет существующую строку вместо создания дубля.
