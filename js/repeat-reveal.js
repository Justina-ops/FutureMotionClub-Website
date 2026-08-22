/* =========================================================
   FUTUREMOTION — REPEAT SCROLL REVEAL
   Add class="repeat-reveal" when an element should animate
   every time it enters the viewport.
   ========================================================= */

window.VFRepeatReveal = (() => {
  let observer = null;

  function init(selector = ".repeat-reveal") {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      }, {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      });
    }

    elements.forEach((el) => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => init());

  return { init };
})();
