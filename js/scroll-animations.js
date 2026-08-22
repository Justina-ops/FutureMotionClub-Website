/* =========================================================
   FUTUREMOTION — SCROLL UTILITIES
   Reveal behavior is handled by reveal.js / repeat-reveal.js.
   This file only owns the shared Back-to-Top button.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initBackToTop();
});

function initBackToTop() {
  const button = document.getElementById("scrollTopBtn");
  if (!button) return;

  const toggleButton = () => {
    button.classList.toggle("visible", window.scrollY > 300);
  };

  toggleButton();
  window.addEventListener("scroll", toggleButton, { passive: true });

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}
