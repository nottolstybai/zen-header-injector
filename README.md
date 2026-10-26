<div align="center">

<img src="icons/icon.svg" width="72" alt="Header Injector">

# Header Injector

</div>

Расширение для Zen и Firefox: добавляет свои HTTP-заголовки к запросам. Правило можно ограничить хостами, например `*.example.ru`.

## Использование

Нажмите на иконку → **+ Добавить header** → введите имя и значение → обновите страницу.

Проверка: правило `x-test-header` = `test-123`, затем https://httpbin.org/headers. В ответе будет `"X-Test-Header": "test-123"`.

## Установка

**Временная** (до перезапуска браузера): `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → `manifest.json`.

**Постоянная, без подписи** (Zen, Developer Edition, Nightly):

1. `about:config` → `xpinstall.signatures.required` = `false`, перезапустите браузер.
2. Соберите пакет:
   ```sh
   zip -r header-injector.xpi manifest.json background.js popup.html popup.css popup.js theme.js icons
   ```
3. `about:addons` → ⚙ → **Install Add-on From File…** → `header-injector.xpi`.

**Постоянная, с подписью Mozilla** (любой Firefox): ключи на https://addons.mozilla.org/developers/addon/api/key/, затем
```sh
npx web-ext sign --channel=unlisted --api-key=<JWT issuer> --api-secret=<JWT secret>
```
Перед каждой подписью увеличивайте `version` в `manifest.json`.

## Как это устроено

```
popup  ──storage.local──▶  background.js  ──webRequest.onBeforeSendHeaders──▶  запрос + header
```
