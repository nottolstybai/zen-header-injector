<div align="center">

<img src="icons/icon.svg" width="72" alt="Header Injector">

# Header Injector

</div>

Расширение для Zen и Firefox, которое добавляет свои HTTP-заголовки к запросам браузера.

## Быстрый старт

1. Установите расширение (см. [Установка](#установка)).
2. Нажмите на иконку расширения и выберите **+ Добавить header**.
3. Введите имя заголовка и значение.
4. Обновите страницу.

## Возможности

- Правила из имени заголовка и значения, каждое можно включить или выключить отдельно.
- Ограничение по хостам, например `*.example.ru`. По умолчанию правило действует на всех сайтах.
- Если заголовок уже есть в запросе, его значение заменяется.
- Светлая и тёмная тема.

## Установка

### Временная

1. Склонируйте репозиторий.
2. Откройте `about:debugging#/runtime/this-firefox`.
3. **Load Temporary Add-on** → выберите `manifest.json`.

Расширение пропадёт после перезапуска браузера.

### Постоянная, без подписи

Для Zen, Firefox Developer Edition и Nightly.

1. `about:config` → `xpinstall.signatures.required` = `false`.
2. Перезапустите браузер.
3. Соберите пакет:
   ```sh
   zip -r header-injector.xpi manifest.json background.js popup.html popup.css popup.js theme.js icons
   ```
4. `about:addons` → ⚙ → **Install Add-on From File…** → `header-injector.xpi`.

### Постоянная, с подписью Mozilla

Для любого Firefox. Подпись бесплатная, расширение не публикуется в каталоге (`unlisted`).

1. Получите ключи на https://addons.mozilla.org/developers/addon/api/key/ → **Generate new credentials**.
2. Подпишите:
   ```sh
   npx web-ext sign --channel=unlisted --api-key=<JWT issuer> --api-secret=<JWT secret>
   ```
3. Установите полученный `.xpi` через `about:addons` → ⚙ → **Install Add-on From File…**

Перед каждой новой подписью увеличивайте `version` в `manifest.json`.

## Проверка

1. Добавьте правило `x-test-header` = `test-123`.
2. Откройте https://httpbin.org/headers.
3. В ответе должно быть `"X-Test-Header": "test-123"`.

## Решение проблем

- **Нет цифры на иконке.** Нет активных правил. Проверьте общий переключатель и переключатель правила.
- **Оранжевый глобус.** Правило ограничено хостами. Нажмите на глобус → **все**.
- **Ошибки.** `about:debugging#/runtime/this-firefox` → Header Injector → **Inspect** → Console. Срабатывания пишутся строками `[header-injector] ...`.
- **Изменения не применились.** Для временной установки нажмите **Reload**. Если не помогло, переустановите расширение.

## Как это устроено

```
popup  ──storage.local──▶  background.js  ──webRequest.onBeforeSendHeaders──▶  запрос + header
```
