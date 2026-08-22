/* =========================================================
   NAV.JS — Shared FutureMotion navigation
   One implementation for every page.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".mm-menu-toggle");
  const menu = document.querySelector(".mm-nav");

  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", event => {
    if (!menu.classList.contains("open")) return;

    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });
});
