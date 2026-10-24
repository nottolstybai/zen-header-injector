<div align="center">

<img src="icons/icon.svg" width="72" alt="Header Injector">

# Header Injector

Расширение для **Zen / Firefox**, которое добавляет свои заголовки к запросам.
Например, чтобы на тестовом стенде направить запросы с фронта на нужную версию бэкенда или включить фичу.

![Firefox](https://img.shields.io/badge/Firefox-115%2B-FF7139?logo=firefoxbrowser&logoColor=white)
![Zen](https://img.shields.io/badge/Zen-supported-1e66f5)
![Manifest](https://img.shields.io/badge/manifest-v2-6c6f85)

</div>

---

## ⚡ Быстрый старт

1. Установи расширение ([как](#-установка)).
2. Нажми на иконку 💉 → **+ Добавить header**.
3. Впиши имя header'а и значение.
4. Обнови страницу: header уже уходит в запросы.

> [!TIP]
> Header ставится **на всех сайтах**, пока правило включено. Закончил тестировать — выключи тумблер правила или общий тумблер сверху.

## ✨ Что умеет

| | |
|---|---|
| 🧩 **Правила** | Имя header'а + значение, у каждого свой тумблер, плюс общий выключатель |
| 🌐 **Где применять** | По умолчанию на всех сайтах. Глобус 🌐 в строке правила: ограничить хостами (`*.stg.example.ru`) или текущим сайтом в один клик |
| 🔗 **API тоже** | Правило срабатывает, если совпал хост запроса **или** страницы, с которой он ушёл, так что запросы фронта в API тоже получают header |
| ♻️ **Перезапись** | Если такой header уже есть в запросе, значение заменяется |
| 🎨 **Тема** | Светлая / тёмная (Catppuccin Latte / Mocha), по умолчанию как в системе |

## 📦 Установка

<details>
<summary><b>🧪 Временно</b> — за 10 секунд, до перезапуска браузера</summary>

<br>

1. Склонируй репозиторий.
2. Открой `about:debugging#/runtime/this-firefox`.
3. **Load Temporary Add-on** → выбери `manifest.json`.

</details>

<details>
<summary><b>📌 Навсегда, без подписи</b> — Zen / Firefox Developer Edition / Nightly</summary>

<br>

1. `about:config` → `xpinstall.signatures.required` = `false`.
2. Полностью перезапусти браузер (`Cmd+Q`).
3. Собери пакет:
   ```sh
   zip -r header-injector.xpi manifest.json background.js popup.html popup.css popup.js theme.js icons
   ```
4. `about:addons` → ⚙ → **Install Add-on From File…** → `header-injector.xpi`.

Если расширение показывается как «отключено, не проверено», значит браузер требует подпись. Тогда нужен способ ниже.

</details>

<details>
<summary><b>✅ Навсегда, с подписью Mozilla</b> — любой Firefox, удобно раздавать коллегам</summary>

<br>

Подпись бесплатная, расширение **не публикуется** в каталоге (`unlisted`).

1. Ключи: https://addons.mozilla.org/developers/addon/api/key/ → *Generate new credentials*.
2. Подпиши:
   ```sh
   npx web-ext sign --channel=unlisted --api-key=<JWT issuer> --api-secret=<JWT secret>
   ```
3. Готовый `.xpi` лежит в `web-ext-artifacts/`, его можно ставить через `about:addons` → ⚙ → **Install Add-on From File…**

> [!NOTE]
> Перед каждой новой подписью подними `version` в `manifest.json`.

</details>

## ✅ Проверка, что работает

- [ ] Добавь правило `x-test-header` = `test-123`.
- [ ] Открой https://httpbin.org/headers.
- [ ] В ответе есть `"X-Test-Header": "test-123"`.

<details>
<summary><b>🛠 Не работает? Чек-лист</b></summary>

<br>

- **На иконке нет цифры.** Нет активных правил: проверь общий тумблер и тумблер правила.
- **Глобус оранжевый.** Правило ограничено хостами. Нажми на глобус → **все**.
- **Ошибки.** `about:debugging#/runtime/this-firefox` → Header Injector → **Inspect** → Console. Каждое срабатывание пишет строку `[header-injector] ...`.
- **Иконка/код не обновились после правок.** Для временной установки: **Reload**. Иконку на панели браузер кэширует, помогает только Remove → Load заново.

</details>

<details>
<summary><b>🧠 Как это устроено</b></summary>

<br>

```
popup  ──storage.local──▶  background.js  ──webRequest.onBeforeSendHeaders──▶  запрос + header
```

- `background.js`: слушает все запросы и добавляет header, если правило совпало по хосту запроса, `documentUrl` или `originUrl`.
- `popup.*`: UI правил, сохраняет изменения сразу в `storage.local`.
- `theme.js`: светлая/тёмная тема, выбор хранится в `localStorage` попапа.

Manifest V2 выбран специально: Firefox продолжает его поддерживать, а `webRequest` с `blocking` выдаёт доступ ко всем сайтам сразу при установке, без отдельных разрешений, как это бывает в MV3.

</details>
