const rulesEl = document.getElementById("rules");
const emptyEl = document.getElementById("empty");
const enabledEl = document.getElementById("enabled");
const statusEl = document.getElementById("status");
const tpl = document.getElementById("rule-tpl");

let rules = [];
let enabled = true;
let currentHost = "";
let savedTimer;

function flashSaved() {
  clearTimeout(savedTimer);
  statusEl.textContent = "✓ сохранено";
  statusEl.className = "status on";
  savedTimer = setTimeout(renderStatus, 900);
}

// Save immediately: the popup can be closed at any moment, a debounced write would be lost.
async function save() {
  await browser.storage.local.set({ rules: JSON.parse(JSON.stringify(rules)) });
  flashSaved();
}

function plural(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "header";
  return "headers";
}

function renderStatus() {
  const active = rules.filter((r) => r.enabled && r.name && r.name.trim()).length;
  if (!enabled) {
    statusEl.textContent = "Выключено";
    statusEl.className = "status";
  } else if (active === 0) {
    statusEl.textContent = "Нет активных headers";
    statusEl.className = "status";
  } else {
    statusEl.textContent = `Активно: ${active} ${plural(active)}`;
    statusEl.className = "status on";
  }
}

function renderScope(card, rule) {
  const hosts = (rule.hosts ?? "").trim();
  const scopeBtn = card.querySelector(".r-scope");
  scopeBtn.classList.toggle("limited", Boolean(hosts));
  scopeBtn.title = hosts ? `Только: ${hosts}` : "На всех сайтах";
  card.querySelector(".r-all").classList.toggle("active", !hosts);
  card.querySelector(".r-here").classList.toggle("active", Boolean(hosts) && hosts === currentHost);
}

// Monospace font, so width in ch matches the text exactly (+ padding).
function fitName(el) {
  const len = Math.max(el.value.length || el.placeholder.length, 6);
  el.style.width = `calc(${len}ch + 18px)`;
}

function renderRule(rule) {
  const card = tpl.content.firstElementChild.cloneNode(true);
  const toggle = card.querySelector(".r-enabled");
  const name = card.querySelector(".r-name");
  const value = card.querySelector(".r-value");
  const hosts = card.querySelector(".r-hosts");
  const here = card.querySelector(".r-here");
  const all = card.querySelector(".r-all");
  const scopeBtn = card.querySelector(".r-scope");
  const scope = card.querySelector(".scope");

  toggle.checked = rule.enabled;
  name.value = rule.name ?? "";
  value.value = rule.value ?? "";
  hosts.value = rule.hosts ?? "";
  card.classList.toggle("off", !rule.enabled);
  here.disabled = !currentHost;
  if (currentHost) here.title = `Только ${currentHost}`;

  scopeBtn.addEventListener("click", () => {
    scope.hidden = !scope.hidden;
    scopeBtn.classList.toggle("open", !scope.hidden);
    if (!scope.hidden) hosts.focus();
  });
  toggle.addEventListener("change", () => {
    rule.enabled = toggle.checked;
    card.classList.toggle("off", !rule.enabled);
    save();
  });
  fitName(name);
  name.addEventListener("input", () => { rule.name = name.value; fitName(name); save(); });
  value.addEventListener("input", () => { rule.value = value.value; save(); });
  hosts.addEventListener("input", () => { rule.hosts = hosts.value; renderScope(card, rule); save(); });
  here.addEventListener("click", () => {
    rule.hosts = currentHost;
    hosts.value = currentHost;
    renderScope(card, rule);
    save();
  });
  all.addEventListener("click", () => {
    rule.hosts = "";
    hosts.value = "";
    renderScope(card, rule);
    save();
  });
  card.querySelector(".r-del").addEventListener("click", () => {
    rules = rules.filter((r) => r !== rule);
    save();
    render();
  });

  renderScope(card, rule);
  return card;
}

function render() {
  rulesEl.replaceChildren(...rules.map(renderRule));
  emptyEl.hidden = rules.length > 0;
  renderStatus();
}

document.getElementById("add").addEventListener("click", () => {
  rules.push({ id: crypto.randomUUID(), enabled: true, hosts: "", name: "", value: "" });
  save();
  render();
  rulesEl.lastElementChild?.querySelector(".r-name").focus();
});

enabledEl.addEventListener("change", async () => {
  enabled = enabledEl.checked;
  await browser.storage.local.set({ enabled });
  flashSaved();
});

document.getElementById("theme").addEventListener("click", toggleTheme);

(async () => {
  const stored = await browser.storage.local.get(["enabled", "rules"]);
  enabled = stored.enabled ?? true;
  enabledEl.checked = enabled;
  rules = stored.rules ?? [];
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    if (url.protocol === "http:" || url.protocol === "https:") currentHost = url.hostname;
  } catch {}
  document.getElementById("current").textContent = currentHost || "—";
  render();
})();
