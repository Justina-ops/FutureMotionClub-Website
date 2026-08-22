/* =========================================================
   FUTUREMOTION — REPEATING SCROLL REVEAL
   Home + About sections animate every time they enter the viewport.
   ========================================================= */

window.VFReveal = (() => {
  const observed = new WeakSet();
  let observer = null;

  function getObserver() {
    if (observer) return observer;

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px"
    });

    return observer;
  }

  function observe(selector = ".reveal, .reveal-group") {
    const obs = getObserver();

    document.querySelectorAll(selector).forEach((el) => {
      if (observed.has(el)) return;
      observed.add(el);
      obs.observe(el);
    });
  }

  function addSectionReveals() {
    const body = document.body;
    if (!body.classList.contains("index-page") && !body.classList.contains("about-page")) return;

    document.querySelectorAll("section").forEach((section) => {
      if (!section.classList.contains("reveal") && !section.classList.contains("reveal-group")) {
        section.classList.add("reveal");
      }
    });

    document.querySelectorAll(".hero, .about-header, .grid-section").forEach((el) => {
      if (!el.classList.contains("reveal") && !el.classList.contains("reveal-group")) {
        el.classList.add("reveal");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    addSectionReveals();
    observe();
  });

  return { observe };
})();
