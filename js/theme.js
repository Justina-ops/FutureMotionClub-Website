/* =========================================================
   THEME.JS — Shared FutureMotion theme system
   Storage key and DOM attribute are identical on every page.
   ========================================================= */

(() => {
  const STORAGE_KEY = "vf_theme";
  const root = document.documentElement;

  function getTheme() {
    return root.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
    }

    syncButtons();
  }

  function syncButtons() {
    const theme = getTheme();

    document.querySelectorAll(".mm-theme").forEach(button => {
      button.innerHTML =
        theme === "light"
          ? "☀ <span>LIGHT</span>"
          : "☾ <span>DARK</span>";
    });

    /* Backward-compatible support for any remaining legacy button. */
    document.querySelectorAll(".theme-toggle").forEach(button => {
      const icon = button.querySelector(".icon");
      const label = button.querySelector(".label");

      if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
      if (label) label.textContent = theme === "light" ? "Light" : "Dark";
    });
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved === "light" ? "light" : "dark");

  document.addEventListener("DOMContentLoaded", () => {
    syncButtons();

    document.querySelectorAll(".mm-theme, .theme-toggle").forEach(button => {
      button.addEventListener("click", () => {
        const next = getTheme() === "light" ? "dark" : "light";
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
      });
    });
  });
})();
