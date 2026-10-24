// Loaded in <head> so the theme is applied before first paint.
// Until the user picks a theme explicitly, it follows the system one.
const darkQuery = matchMedia("(prefers-color-scheme: dark)");

function readTheme() {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") return t;
  } catch {}
  return darkQuery.matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const next = readTheme() === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", next); } catch {}
  applyTheme(next);
}

darkQuery.addEventListener("change", () => applyTheme(readTheme()));
applyTheme(readTheme());
