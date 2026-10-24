// State shape in storage.local:
// { enabled: bool, rules: [{ id, enabled, hosts: "api.example.com, *.stg.example.com", name, value }] }
// Empty hosts means the rule applies to every site.
let state = { enabled: true, rules: [] };

function hostPatternToRegExp(pattern) {
  const escaped = pattern.trim().toLowerCase().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp("^" + escaped + "$");
}

function compile(rules) {
  return rules
    .filter((r) => r.enabled && r.name && r.name.trim())
    .map((r) => ({
      name: r.name.trim(),
      value: r.value ?? "",
      patterns: (r.hosts ?? "").split(/[,\s]+/).filter(Boolean).map(hostPatternToRegExp),
    }));
}

let compiled = [];

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function matches(rule, hosts) {
  if (rule.patterns.length === 0) return true;
  return hosts.some((h) => h && rule.patterns.some((re) => re.test(h)));
}

function onBeforeSendHeaders(details) {
  if (!state.enabled || compiled.length === 0) return {};

  // Match the request host itself, plus the page that initiated it,
  // so API calls from a matched front-end also get the header.
  const hosts = [hostOf(details.url), hostOf(details.documentUrl), hostOf(details.originUrl)];

  const headers = details.requestHeaders;
  let changed = false;
  for (const rule of compiled) {
    if (!matches(rule, hosts)) continue;
    const lower = rule.name.toLowerCase();
    const existing = headers.find((h) => h.name.toLowerCase() === lower);
    if (existing) existing.value = rule.value;
    else headers.push({ name: rule.name, value: rule.value });
    changed = true;
    console.log("[header-injector]", rule.name, "->", details.url);
  }
  return changed ? { requestHeaders: headers } : {};
}

browser.webRequest.onBeforeSendHeaders.addListener(
  onBeforeSendHeaders,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

function updateBadge() {
  const active = state.enabled && compiled.length > 0;
  browser.browserAction.setBadgeText({ text: active ? String(compiled.length) : "" });
  browser.browserAction.setBadgeBackgroundColor({ color: "#2e7d32" });
}

async function load() {
  const stored = await browser.storage.local.get(["enabled", "rules"]);
  state.enabled = stored.enabled ?? true;
  state.rules = stored.rules ?? [];
  compiled = compile(state.rules);
  updateBadge();
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.enabled) state.enabled = changes.enabled.newValue;
  if (changes.rules) state.rules = changes.rules.newValue ?? [];
  compiled = compile(state.rules);
  console.log("[header-injector] rules updated", state.enabled, compiled.length);
  updateBadge();
});

load();
