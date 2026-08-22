/* =========================================================
   FUTUREMOTION — CLIENT-SIDE STORAGE
   Used only by index.html and about.html.

   Cookie:     remembers the latest visit timestamp (30 days).
   localStorage: stores durable site preferences / visit count.
   sessionStorage: stores the current browser-session page context.
   ========================================================= */

(() => {
  "use strict";

  const COOKIE_NAME = "fm_last_visit";
  const LOCAL_KEY = "fm_site_preferences";
  const SESSION_KEY = "fm_session";

  function setCookie(name, value, maxAgeSeconds) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const target = `${encodeURIComponent(name)}=`;
    const pair = document.cookie.split("; ").find(item => item.startsWith(target));
    return pair ? decodeURIComponent(pair.slice(target.length)) : null;
  }

  function readLocalPreferences() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return { visitCount: 0, lastPage: "" };
      const parsed = JSON.parse(raw);
      return {
        visitCount: Number.isFinite(parsed.visitCount) ? parsed.visitCount : 0,
        lastPage: typeof parsed.lastPage === "string" ? parsed.lastPage : ""
      };
    } catch {
      return { visitCount: 0, lastPage: "" };
    }
  }

  function writeLocalPreferences(preferences) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(preferences));
    } catch {
      // Storage may be unavailable in private/restricted browsing modes.
    }
  }

  function readSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function writeSession(session) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Storage may be unavailable in private/restricted browsing modes.
    }
  }

  const page = document.body.classList.contains("about-page") ? "about" : "home";
  const now = new Date().toISOString();
  const previousCookieVisit = getCookie(COOKIE_NAME);
  const existingSession = readSession();
  const preferences = readLocalPreferences();

  // Cookie: useful for a simple first-party last-visit timestamp.
  setCookie(COOKIE_NAME, now, 60 * 60 * 24 * 30);

  // localStorage: persists a lightweight site preference record across visits.
  preferences.visitCount += 1;
  preferences.lastPage = page;
  preferences.lastVisitedAt = now;
  writeLocalPreferences(preferences);

  // sessionStorage: keeps page context only for the current browser session.
  const session = {
    startedAt: existingSession?.startedAt || now,
    currentPage: page,
    previousPage: existingSession?.currentPage || "",
    pageVisits: (existingSession?.pageVisits || 0) + 1
  };
  writeSession(session);

  // Expose non-sensitive state for page-specific scripts without adding globals.
  document.documentElement.dataset.storageReady = "true";
  document.documentElement.dataset.sessionPage = page;

  // Allow optional text targets on either page without requiring them.
  const welcome = document.querySelector("[data-storage-welcome]");
  if (welcome) {
    if (previousCookieVisit) {
      welcome.textContent = "Welcome back to FutureMotion.";
    } else {
      welcome.textContent = "Welcome to FutureMotion.";
    }
  }
})();
