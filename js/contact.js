document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#formStatus');
  const draftKey = 'vf_contact_draft';
  const fields = ['name', 'email', 'projectType', 'subject', 'messageText'];

  /* LOCAL STORAGE — keep the existing draft feature, but make it presentation-ready. */
  function saveDraft() {
    const draft = {};
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) draft[id] = el.value;
    });
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      const state = document.querySelector('#draftStatus');
      if (state) state.textContent = 'SAVED';
    } catch (_) {
      const state = document.querySelector('#draftStatus');
      if (state) state.textContent = 'BLOCKED';
    }
  }

  function loadDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (!draft) return;
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el && draft[id] != null) el.value = draft[id];
      });
      const state = document.querySelector('#draftStatus');
      if (state) state.textContent = 'RESTORED';
    } catch (_) { }
  }

  fields.forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', saveDraft);
    el?.addEventListener('change', saveDraft);
  });
  loadDraft();

  document.getElementById('clearDraft')?.addEventListener('click', () => {
    localStorage.removeItem(draftKey);
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const state = document.querySelector('#draftStatus');
    if (state) state.textContent = 'EMPTY';
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.querySelector('#name')?.value.trim();
    const email = document.querySelector('#email')?.value.trim();
    const subject = document.querySelector('#subject')?.value.trim();
    const message = document.querySelector('#messageText')?.value.trim();

    if (!name || !email || !subject || !message) {
      status.textContent = 'Please complete all required fields.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      return;
    }

    const count = Number(sessionStorage.getItem('vf_contact_submissions') || 0) + 1;
    sessionStorage.setItem('vf_contact_submissions', String(count));
    status.textContent = `Message prepared successfully. Session submissions: ${count}.`;
    localStorage.removeItem(draftKey);
    const state = document.querySelector('#draftStatus');
    if (state) state.textContent = 'CLEARED';
  });

  /* Route selector */
  const visual = document.querySelector('#routeVisual');
  const title = document.querySelector('#routeTitle');
  const label = document.querySelector('#routeLabel');
  const code = document.querySelector('#routeCode');
  const desc = document.querySelector('#routeDesc');

  /* ================================================================
     SESSION STORAGE — CONTACT REFRESH MEMORY

     Contact follows the same Session Storage principle as Multimedia:
     - the user explicitly enables Session memory
     - while Session memory is active, keep the CURRENT page position updated
     - on a real browser refresh, start at the Contact title
     - then smoothly travel back to the exact position that was last seen
     - normal navigation to another page must NOT trigger this restore
     ================================================================ */
  const CONTACT_SESSION_ROUTE = 'vf_contact_route';
  const CONTACT_SESSION_ACTIVE = 'vf_contact_session';
  const CONTACT_SESSION_SCROLL = 'vf_contact_scrollY';

  const CONTACT_PARTS = [
    document.querySelector('.ct-intro'),
    document.querySelector('#routes'),
    document.querySelector('#message'),
    document.querySelector('#contact-info'),
    document.querySelector('#technology'),
    document.querySelector('.ct-faq'),
    document.querySelector('.ct-finale')
  ].filter(Boolean);

  function getCurrentContactPart() {
    if (!CONTACT_PARTS.length) return { id: '', number: '' };
    const point = window.scrollY + (window.innerHeight * 0.5);
    let current = CONTACT_PARTS[0];
    CONTACT_PARTS.forEach(section => {
      if (section.offsetTop <= point) current = section;
    });
    const index = CONTACT_PARTS.indexOf(current);
    return {
      id: current.id || `contact-part-${index + 1}`,
      number: String(index + 1).padStart(2, '0')
    };
  }

  function readRememberedSession() {
    try {
      if (sessionStorage.getItem(CONTACT_SESSION_ACTIVE) !== 'active') return null;
      const rawY = sessionStorage.getItem(CONTACT_SESSION_SCROLL);
      const scrollY = rawY == null ? null : Number(rawY);
      return {
        route: sessionStorage.getItem(CONTACT_SESSION_ROUTE) || '',
        scrollY: Number.isFinite(scrollY) ? Math.max(0, scrollY) : null
      };
    } catch (_) {
      return null;
    }
  }

  function findRouteButton(route) {
    if (!route) return null;
    return document.querySelector(`.ct-route-btn[data-route="${CSS.escape(route)}"]`);
  }

  function saveRememberedSession() {
    try {
      const active = document.querySelector('.ct-route-btn.active');
      const route = active?.dataset.route || 'general';
      sessionStorage.setItem(CONTACT_SESSION_ROUTE, route);
      sessionStorage.setItem(CONTACT_SESSION_ACTIVE, 'active');
      sessionStorage.setItem(CONTACT_SESSION_SCROLL, String(Math.max(0, window.scrollY)));
      return getCurrentContactPart();
    } catch (_) {
      return null;
    }
  }

  /* Once Remember Your Session is enabled, the saved position follows the
     user's CURRENT position. This is deliberately the exact scroll position,
     because Refresh must travel from the Contact title back to where the user
     last stopped — not back to where the Remember button was clicked. */
  let sessionTrackingFrame = 0;
  window.addEventListener('scroll', () => {
    try {
      if (sessionStorage.getItem(CONTACT_SESSION_ACTIVE) !== 'active') return;
    } catch (_) {
      return;
    }
    if (sessionTrackingFrame) return;
    sessionTrackingFrame = requestAnimationFrame(() => {
      sessionTrackingFrame = 0;
      try {
        sessionStorage.setItem(CONTACT_SESSION_SCROLL, String(Math.max(0, window.scrollY)));
      } catch (_) { }
    });
  }, { passive: true });

  const savedSession = readRememberedSession();
  const initialRoute = document.querySelector('.ct-route-btn.active');

  function applyRoute(button, persistSession = false) {
    if (!button) return;
    document.querySelectorAll('.ct-route-btn').forEach(item => item.classList.remove('active'));
    button.classList.add('active');

    const routeName = button.dataset.route || 'general';
    if (visual) visual.dataset.route = routeName;
    const stage = document.querySelector('#routeStage');
    if (stage) stage.dataset.route = routeName;

    const words = (button.dataset.title || '').split(' ');
    if (title) {
      title.innerHTML = words.length > 1
        ? `${words[0]}<br><span>${words.slice(1).join(' ')}</span>`
        : button.dataset.title || '';
    }
    if (label) label.textContent = button.dataset.label || '';
    if (code) code.textContent = button.dataset.code || '';
    if (desc) desc.textContent = button.dataset.desc || '';

    const type = document.querySelector('#projectType');
    if (type) {
      const map = { general: 'General enquiry', collaboration: 'Collaboration', events: 'Workshop / Event' };
      type.value = map[routeName] || 'General enquiry';
    }

    if (persistSession) {
      try {
        if (sessionStorage.getItem(CONTACT_SESSION_ACTIVE) === 'active') {
          sessionStorage.setItem(CONTACT_SESSION_ROUTE, routeName);
        }
      } catch (_) { }
    }
  }

  applyRoute(initialRoute, false);

  /* Only a REAL reload may perform Contact Session restoration.
     Leaving Contact and coming back is ordinary navigation and must not
     trigger the restore animation. */
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const isRealRefresh = navigationEntry?.type === 'reload';

  function restoreRememberedSession() {
    const session = readRememberedSession();
    if (!session) return;

    const button = findRouteButton(session.route);
    if (button) applyRoute(button, false);

    const targetY = Number.isFinite(session.scrollY) ? session.scrollY : 0;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const finalY = Math.min(targetY, maxY);

    /* The important visual sequence: Contact title first, then the page
       physically travels back to the last saved position. */
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          window.scrollTo({ top: finalY, behavior: 'smooth' });
        }, 220);
      });
    });
  }

  if (isRealRefresh && savedSession) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    restoreRememberedSession();
  }

  document.querySelectorAll('.ct-route-btn').forEach(button => {
    button.addEventListener('click', () => {
      applyRoute(button, true);
      saveDraft();
    });
  });

  /* FAQ accordion */
  document.querySelectorAll('.ct-faq-list article button').forEach(button => {
    button.addEventListener('click', () => {
      button.parentElement.classList.toggle('open');
      button.querySelector('span').textContent = button.parentElement.classList.contains('open') ? '−' : '+';
    });
  });

  /* Real REST API call without relying on jQuery load order. */
  async function loadWeather() {
    const temp = document.querySelector('#weatherTemp');
    const text = document.querySelector('#weatherText');
    const wind = document.querySelector('#weatherWind');
    if (!temp || !text || !wind) return;

    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=4.337&longitude=101.135&current=temperature_2m,wind_speed_10m,weather_code&timezone=Asia%2FKuala_Lumpur');
      if (!response.ok) throw new Error('Weather request failed');
      const data = await response.json();
      const current = data.current || {};
      const weatherMap = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Rime fog',
        51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
        80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers', 95: 'Thunderstorm'
      };
      temp.textContent = `${Math.round(current.temperature_2m ?? 0)}°C`;
      text.textContent = weatherMap[current.weather_code] || 'Current conditions';
      wind.textContent = `Wind ${Math.round(current.wind_speed_10m ?? 0)} km/h`;
    } catch (_) {
      text.textContent = 'Live data unavailable';
      wind.textContent = 'Try again when online';
    }
  }
  loadWeather();

  /* ================================================================
     WEB TECHNOLOGY — same two-card visual, real functions underneath.
     Local: saves the contact draft.
     Session: remembers the selected route AND current Contact part/scroll
     position for this browser tab.
     ================================================================ */
  document.querySelectorAll('[data-ct-storage]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.ctStorage;
      const readout = document.querySelector('#ctStorageReadout');
      const state = document.querySelector('#ctStorageState');

      if (type === 'local') {
        saveDraft();
        if (readout) readout.textContent = 'Your current contact draft is saved in this browser and will be restored after refresh.';
        if (state) state.textContent = 'LOCAL / SAVED';
      } else if (type === 'session') {
        const active = document.querySelector('.ct-route-btn.active');
        try {
          const part = saveRememberedSession();
          const partNumber = part?.number || '';

          if (readout) {
            readout.textContent = partNumber
              ? `Route "${active?.dataset.label || 'General Enquiry'}" and Part ${partNumber} are remembered for this browser tab and can be restored after refresh.`
              : `Route "${active?.dataset.label || 'General Enquiry'}" is remembered for this browser tab and can be restored after refresh.`;
          }
          if (state) state.textContent = 'SESSION / ACTIVE';
        } catch (_) {
          if (readout) readout.textContent = 'Session storage is unavailable in this browser tab.';
          if (state) state.textContent = 'SESSION / BLOCKED';
        }
      }
    });
  });

  /* Cookie preference — keep Contact in sync with the same localStorage
     consent state used by Multimedia/cookies.js. */
  function refreshContactCookieStatus() {
    const el = document.querySelector('#ctCookiePreference');
    if (!el) return;

    let value = '';
    try {
      value = localStorage.getItem('vf-cookie-consent') || '';
    } catch (_) { }

    el.textContent = value === 'accepted'
      ? 'Accepted — preference remembered'
      : value === 'declined'
        ? 'Declined — preference remembered'
        : 'Waiting for your choice';
  }

  const ctCookieBanner = document.querySelector('#cookieBanner');

  /* Contact must be able to reopen the consent dialog at any time,
     including after the user has already accepted/declined it. */
  function openContactCookieBanner() {
    if (!ctCookieBanner) return;
    ctCookieBanner.classList.add('show');
    ctCookieBanner.setAttribute('aria-hidden', 'false');
  }

  document.querySelector('#ctManageCookies')?.addEventListener('click', openContactCookieBanner);

  /* cookies.js owns the real Accept/Decline actions. We only refresh the
     Contact readout after those actions so the two pages stay consistent. */
  document.querySelector('#acceptCookies')?.addEventListener('click', () => {
    setTimeout(refreshContactCookieStatus, 0);
  });
  document.querySelector('#declineCookies')?.addEventListener('click', () => {
    setTimeout(refreshContactCookieStatus, 0);
  });

  refreshContactCookieStatus();

  const returning = document.cookie.includes('vf_contact_visit=');
  document.cookie = `vf_contact_visit=${returning ? 'returning' : 'first'}; max-age=2592000; path=/; SameSite=Lax`;
});
