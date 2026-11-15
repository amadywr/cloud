// ---------- 1. Apply the theme immediately ----------
// This part runs as soon as the browser reads the <script> tag in <head>,
// before the page is drawn. That way a dark-mode visitor never sees a
// flash of the light theme.

const STORAGE_KEY = "theme";

// Read a saved choice. localStorage can throw in some private-browsing
// modes, so wrap it in try/catch and fall back gracefully.
function getSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not saved; the toggle still works for this visit.
  }
}

// No saved choice? Follow the operating system's light/dark setting.
function getInitialTheme() {
  const saved = getSavedTheme();
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Setting data-theme on <html> switches the CSS variables in styles.css.
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

applyTheme(getInitialTheme());

// ---------- 2. Wire up the page once the HTML has loaded ----------
// The button doesn't exist yet while <head> is being read, so wait for
// the DOMContentLoaded event before looking it up.

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("theme-toggle");

  // The button label says what clicking it will switch TO.
  function updateButtonLabel() {
    const isDark = document.documentElement.dataset.theme === "dark";
    button.textContent = isDark ? "Light mode" : "Dark mode";
  }

  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
    updateButtonLabel();
  });

  updateButtonLabel();

  // Visitor count: added in Part A2, when the Express API exists.
  // It will call fetch("/api/visits") and put the number in #visit-count.
});
