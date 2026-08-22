document.addEventListener("DOMContentLoaded", () => {
  const projects = [
    { id: 1, title: "Motion Identity", category: "motion", type: "MOTION GRAPHICS", year: "2026", desc: "A visual identity experiment combining typography, movement and digital composition.", img: "Images/Multimedia/motion.jpeg" },
    { id: 2, title: "Digital Worlds", category: "3d", type: "3D", year: "2026", desc: "A futuristic 3D environment exploring lighting, depth and digital atmosphere.", img: "Images/Multimedia/render.jpeg" },
    { id: 3, title: "Frame By Frame", category: "animation", type: "ANIMATION", year: "2026", desc: "An animation study focusing on timing, movement and storytelling through sequential frames.", img: "Images/Multimedia/poster.jpeg" },
    { id: 4, title: "Visual Stories", category: "video", type: "VIDEO / EDITING", year: "2026", desc: "A video production project combining cinematography, editing and visual storytelling.", img: "Images/Multimedia/camera.jpeg" },
    { id: 5, title: "Future Interface", category: "design", type: "DESIGN", year: "2026", desc: "A futuristic interface concept using motion, glowing elements and dynamic transitions.", img: "Images/Multimedia/design.jpeg" },
    { id: 6, title: "Editing Workflow", category: "video", type: "VIDEO / EDITING", year: "2026", desc: "A visual editing workflow showing timeline composition, sequencing and post-production techniques.", img: "Images/Multimedia/editing.jpeg" }];
  const grid = document.querySelector('#projectGrid'), count = document.querySelector('#projectCount'), filters = document.querySelectorAll('.filter'), modal = document.querySelector('#projectModal');
  function card(p) { const a = document.createElement('article'); a.className = 'project'; a.innerHTML = `<div class="project-img"><img src="${p.img}" alt="${p.title}" loading="lazy"><div class="project-tags"><span>${p.type}</span><span>${p.year}</span></div></div><div class="project-body"><h3>${p.title}</h3><p>${p.desc}</p><div class="project-actions"><button type="button" data-id="${p.id}">VIEW PROJECT <span>→</span></button><button type="button" class="save-project" data-save="${p.id}" aria-label="Save project">☆</button></div></div>`; return a }
  function render(filter = 'all') {
    if (!grid) return;
    grid.innerHTML = '';
    const list = filter === 'all'
      ? projects
      : Array.isArray(filter)
        ? projects.filter(p => filter.includes(p.category))
        : filter === '3d-animation'
          ? projects.filter(p => p.category === '3d' || p.category === 'animation')
          : projects.filter(p => p.category === filter);
    list.forEach((p, i) => {
      const c = card(p);
      c.style.opacity = '0';
      c.style.transform = 'translateY(22px)';
      grid.appendChild(c);
      requestAnimationFrame(() => {
        c.style.transition = `opacity .5s ease ${i * .05}s,transform .5s ease ${i * .05}s`;
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
    });
    if (count) count.textContent = String(list.length).padStart(2, '0');
  }
  function renderActiveFilters() {
    if (!grid) return;
    const active = [...filters].filter(f => f.classList.contains('active')).map(f => f.dataset.filter);
    if (active.includes('all') || active.length === 0) { render('all'); return; }
    render(active);
  }
  function setActiveFilters(list) {
    filters.forEach(f => f.classList.toggle('active', list.includes(f.dataset.filter)));
    renderActiveFilters();
  }
  filters.forEach(f => f.addEventListener('click', () => {
    const key = f.dataset.filter;
    if (key === 'all') { setActiveFilters(['all']); return; }
    const current = [...filters].filter(x => x.classList.contains('active') && x.dataset.filter !== 'all').map(x => x.dataset.filter);
    if (current.includes(key)) {
      current.splice(current.indexOf(key), 1);
    } else {
      current.push(key);
    }
    setActiveFilters(current.length ? current : ['all']);
  }));
  setActiveFilters(['all']);
  if (grid) grid.addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (!b || !modal) return; const p = projects.find(x => x.id === +b.dataset.id); document.querySelector('#mCat').textContent = `${p.category.toUpperCase()} / PROJECT`; document.querySelector('#mTitle').textContent = p.title; document.querySelector('#mDesc').textContent = p.desc; document.querySelector('#mType').textContent = p.type; document.querySelector('#mYear').textContent = p.year; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open') });
  function closeModal() { if (!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open') }; document.querySelectorAll('.md-modal .close,.md-modal-backdrop').forEach(x => x.addEventListener('click', closeModal)); document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() });
  // Area interaction preserves original shortcut behavior while upgrading the visuals.
  const areaStage = document.querySelector('#areaStage'); document.querySelectorAll('.md-area').forEach((a, i) => a.addEventListener('mouseenter', () => { document.querySelectorAll('.md-area').forEach(x => x.classList.remove('active')); a.classList.add('active'); if (areaStage && innerWidth > 1000) { areaStage.style.gridTemplateColumns = ['1.75fr 1fr 1fr 1fr', '1fr 1.75fr 1fr 1fr', '1fr 1fr 1.75fr 1fr', '1fr 1fr 1fr 1.75fr'][i] } })); areaStage?.addEventListener('mouseleave', () => { if (innerWidth > 1000) areaStage.style.gridTemplateColumns = '1.75fr 1fr 1fr 1fr' });
  document.querySelectorAll('.text-btn').forEach(b => b.addEventListener('click', () => {
    const area = b.dataset.area;
    if (area === '3d-animation') {
      setActiveFilters(['3d', 'animation']);
    } else {
      setActiveFilters([area]);
    }
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  }));
  // Workbench interaction — three production tools only.
  // Hover updates the preview; click jumps to the matching internal showcase.
  const preview = document.querySelector('#toolPreview');
  const tIndex = document.querySelector('#toolIndex');
  const tName = document.querySelector('#toolName');
  const tDesc = document.querySelector('#toolDesc');
  const toolButtons = document.querySelectorAll('.md-tool');

  function updateTool(btn) {
    if (!btn) return;
    toolButtons.forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    if (preview) preview.src = btn.dataset.img;
    if (tIndex) tIndex.textContent = btn.dataset.index;
    if (tName) tName.textContent = btn.dataset.name;
    if (tDesc) tDesc.textContent = btn.dataset.desc;
  }
  toolButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => updateTool(btn));
    btn.addEventListener('focus', () => updateTool(btn));
    btn.addEventListener('click', () => {
      updateTool(btn);
      const target = btn.dataset.showcase;
      const film = document.querySelector(`.md-film[data-showcase="${target}"]`);
      if (film) {
        selectFilm(film);
        document.querySelector('#showcase')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Screening room + YouTube oEmbed metadata through jQuery REST API.
  // The showcase itself stays inside Multimedia; YouTube is only the final viewing action.
  let currentVideo = 'PVGeM40dABA';
  const pImg = document.querySelector('#playerPoster');
  const pTitle = document.querySelector('#playerTitle');
  const pCat = document.querySelector('#playerCat');
  const open = document.querySelector('#playerOpen');
  const external = document.querySelector('#playerExternal');
  const meta = document.querySelector('#videoMeta');

  function selectFilm(btn) {
    if (!btn) return;
    document.querySelectorAll('.md-film').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    currentVideo = btn.dataset.video;
    if (pImg) pImg.src = btn.dataset.img;
    if (pTitle) pTitle.textContent = btn.dataset.title;
    if (pCat) pCat.textContent = btn.dataset.cat;

    try {
      sessionStorage.setItem('vf_mm_showcase', btn.dataset.showcase || btn.dataset.title);
    } catch (e) { }

    if (meta) meta.innerHTML = '<span>JQUERY / REST</span><strong>LOADING VIDEO METADATA…</strong>';

    if (window.jQuery) {
      $.getJSON(
        'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + encodeURIComponent(currentVideo) + '&format=json'
      ).done(d => {
        if (meta) meta.innerHTML = `<span>JQUERY / REST</span><strong>${d.title || btn.dataset.title} · ${d.author_name || 'YouTube Creator'}</strong>`;
      }).fail(() => {
        if (meta) meta.innerHTML = '<span>JQUERY / REST</span><strong>Metadata request could not be completed in this local session.</strong>';
      });
    }
  }

  document.querySelectorAll('.md-film').forEach(b => b.addEventListener('click', () => selectFilm(b)));

  function openCurrentVideo() {
    window.open(
      `https://www.youtube.com/watch?v=${encodeURIComponent(currentVideo)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }
  open?.addEventListener('click', openCurrentVideo);
  external?.addEventListener('click', openCurrentVideo);

  // Restore order: sessionStorage (current tab) first, then localStorage (saved choice).
  // The original two-card Studio Memory visual is intentionally preserved.
  let savedShowcase = '';
  let savedFavourite = '';
  try {
    savedShowcase = sessionStorage.getItem('vf_mm_showcase') || '';
    savedFavourite = localStorage.getItem('vf_mm_favourite_showcase') || '';
  } catch (e) { }
  const restoredShowcase = savedShowcase || savedFavourite;
  const initialFilm = document.querySelector(`.md-film[data-showcase="${restoredShowcase}"]`) || document.querySelector('.md-film.active');
  selectFilm(initialFilm);

  // Production process original behavior preserved.
  document.querySelectorAll('.process-item').forEach(item => {
    const b = item.querySelector('.more');
    item.classList.remove('open');
    if (b) b.textContent = 'MORE +';
    b?.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      b.textContent = isOpen ? 'LESS −' : 'MORE +';
    });
  });
  /* ================================================================
     STUDIO MEMORY — REAL LOCAL + SESSION STORAGE
     The original two-card visual is intentionally preserved.
     Local = saved favourite showcase across visits.
     Session = current showcase for this browser tab.
     Cookies remain in js/cookies.js and use the existing consent banner.
     ================================================================ */
  const memoryReadout = document.querySelector('#storageReadout');
  const memoryState = document.querySelector('#storageState');
  const memoryButtons = document.querySelectorAll('[data-memory]');

  function setMemoryStatus(message, state) {
    if (memoryReadout) memoryReadout.textContent = message;
    if (memoryState) memoryState.textContent = state;
  }

  memoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.memory;
      const active = document.querySelector('.md-film.active');
      const key = active?.dataset.showcase || 'animation';
      const title = active?.dataset.title || 'Animation Showcase';

      if (type === 'local') {
        try {
          localStorage.setItem('vf_mm_favourite_showcase', key);
          localStorage.setItem('vf_mm_favourite_title', title);
          setMemoryStatus(`Saved "${title}" to this browser. It remains available after refresh and when you return.`, `FRAME / SAVED`);
        } catch (e) {
          setMemoryStatus('Local storage is unavailable in this browser.', 'LOCAL / BLOCKED');
        }
      }

      if (type === 'session') {
        try {
          sessionStorage.setItem('vf_mm_showcase', key);
          setMemoryStatus(`"${title}" will be remembered while this browser tab stays open.`, `VISIT / ACTIVE`);
        } catch (e) {
          setMemoryStatus('Session storage is unavailable in this browser tab.', 'SESSION / BLOCKED');
        }
      }
    });
  });

  // Cookie preference — use the same localStorage key as the existing
  // cookie banner, so the visible status and the real Accept/Decline actions stay in sync.
  function refreshCookieStatus() {
    const el = document.querySelector('#cookiePreference');
    if (!el) return;
    let value = '';
    try {
      value = localStorage.getItem('vf-cookie-consent') || '';
    } catch (_) { }
    el.textContent = value === 'accepted' ? 'Accepted — preference remembered' :
      value === 'declined' ? 'Declined — preference remembered' :
        'Waiting for your choice';
  }
  refreshCookieStatus();

  // Keep the existing cookie banner/functionality. Multimedia's Manage Cookies
  // button opens that same banner instead of relying on a missing external helper.
  const mmCookieBanner = document.querySelector('#cookieBanner');
  window.FutureMotionCookie = window.FutureMotionCookie || {};
  window.FutureMotionCookie.open = () => {
    if (!mmCookieBanner) return;
    mmCookieBanner.classList.add('show');
    mmCookieBanner.setAttribute('aria-hidden', 'false');
  };
  window.FutureMotionCookie.close = () => {
    if (!mmCookieBanner) return;
    mmCookieBanner.classList.remove('show');
    mmCookieBanner.setAttribute('aria-hidden', 'true');
  };

  document.querySelector('#manageCookies')?.addEventListener('click', () => {
    window.FutureMotionCookie.open();
  });

  // Refresh the small preference readout after the existing cookie buttons are used.
  document.querySelector('#acceptCookies')?.addEventListener('click', () => {
    setTimeout(refreshCookieStatus, 0);
  });
  document.querySelector('#declineCookies')?.addEventListener('click', () => {
    setTimeout(refreshCookieStatus, 0);
  });

  // Keep a small session counter for the Multimedia page.
  const views = +(sessionStorage.getItem('vf_mm_session_views') || 0) + 1;
  sessionStorage.setItem('vf_mm_session_views', String(views));
  const sessionEl = document.querySelector('#mmSession');
  if (sessionEl) sessionEl.textContent = `SESSION ${String(views).padStart(2, '0')}`;

  refreshCookieStatus();

});