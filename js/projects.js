/* ==========================================================================
   FutureMotion Club — Projects Page Script
   DATA + RENDERING + LAZY MOTION VIDEO PREVIEWS
   ========================================================================== */

/* --------------------------------------------------------------------------
   PROJECT DATA
   -------------------------------------------------------------------------- */

const projectsData = [
  {
    id: 'hero',
    title: 'HERO',
    director: 'Daniel M. Lara',
    category: 'animation',
    displayCat: 'Animation',
    runtime: '03:20',
    logline: 'A 2D animated short exploring movement within a cinematic 3D pipeline.',
    videoId: 'pKmSdY56VtY',
    size: 'large',
    featured: true
  },
  {
    id: 'coffee-run',
    title: 'Coffee Run',
    director: 'Hjalti Hjalmarsson',
    category: 'animation',
    displayCat: 'Animation',
    runtime: '03:04',
    logline: 'A fast-paced stylized short about a barista running through a city.',
    videoId: 'PVGeM40dABA',
    size: 'medium',
    featured: false
  },
  {
    id: 'spring',
    title: 'Spring',
    director: 'Andy Goralczyk',
    category: 'animation',
    displayCat: 'Animation',
    runtime: '07:44',
    logline: 'A shepherd girl and her dog face ancient spirits to continue the cycle of life.',
    videoId: 'WhWc3b3KhnY',
    size: 'small',
    featured: false
  },
  {
    id: 'sintel',
    title: 'Sintel',
    director: 'Colin Levy',
    category: 'animation',
    displayCat: 'Animation',
    runtime: '14:48',
    logline: 'An epic fantasy about a young girl searching for her dragon friend.',
    videoId: 'eRsGyueVLvQ',
    size: 'large',
    featured: false
  },
  {
    id: 'wing-it',
    title: 'WING IT!',
    director: 'Rik Schutte',
    category: 'animation',
    displayCat: 'Animation',
    runtime: '03:26',
    logline: 'An uptight engineer gets an unwelcome visit from a wannabe-pilot.',
    videoId: 'u9lj-c29dxI',
    size: 'medium',
    featured: false
  },
  {
    id: 'agent-327',
    title: 'Agent 327',
    director: 'Colin Levy',
    category: 'animation',
    displayCat: 'Animation',
    runtime: '03:51',
    logline: 'A Dutch secret agent uncovers a conspiracy at a local barbershop.',
    videoId: 'mN0zPOpADL4',
    size: 'small',
    featured: false
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    director: 'Ian Hubert',
    category: 'editing',
    displayCat: 'Editing',
    runtime: '12:14',
    logline: 'A sci-fi short exploring live-action VFX, motion tracking, and cinematic editing.',
    videoId: 'R6MlUcmOul8',
    size: 'large',
    featured: false
  },
  {
    id: 'charge',
    title: 'CHARGE',
    director: 'Hjalti Hjalmarsson',
    category: 'editing',
    displayCat: 'Editing',
    runtime: '03:54',
    logline: 'Action editing study following a destitute man in an energy-scarce dystopia.',
    videoId: 'UXqq0ZvbOnk',
    size: 'medium',
    featured: false
  },
  {
    id: 'glass-half',
    title: 'Glass Half',
    director: 'Beorn Leonard',
    category: 'editing',
    displayCat: 'Motion',
    runtime: '03:13',
    logline: 'A stylized motion and visual storytelling study combining clear animation, graphic design and non-photorealistic rendering.',
    videoId: 'lqiN98z6Dak',
    size: 'small',
    featured: false,
    license: 'CC BY 4.0'
  },
  {
    id: 'cosmos-laundromat',
    title: 'Cosmos Laundromat',
    director: 'Mathieu Auvray',
    category: 'editing',
    displayCat: 'Editing',
    runtime: '12:10',
    logline: 'A cinematic editing and production-pipeline study combining animation, visual effects, sound and sequential storytelling.',
    videoId: 'Y-rmzh0PI3c',
    size: 'large',
    featured: false,
    license: 'Creative Commons'
  },
  {
    id: 'sprite-fright',
    title: 'Sprite Fright',
    director: 'Matthew Luhn',
    category: 'multimedia',
    displayCat: 'Multimedia',
    runtime: '10:39',
    logline: 'Multimedia storytelling blending 80s horror tropes with cartoon styling.',
    videoId: '_cMxraX_5RE',
    size: 'medium',
    featured: false
  }
];


/* --------------------------------------------------------------------------
   GLOBAL STATE
   -------------------------------------------------------------------------- */

let currentFilter = 'all';
let scrollObserver = null;
let videoPreviewObserver = null;
const previewFrames = new WeakMap();


/* --------------------------------------------------------------------------
   STORAGE HELPERS — localStorage + sessionStorage
   -------------------------------------------------------------------------- */

const STORAGE_KEYS = {
  filter: 'fm-project-filter',   // localStorage — remembers the last filter across visits
  viewed: 'fm-viewed-projects'   // sessionStorage — remembers watched videos for this tab session
};

function saveFilterPreference(filter) {
  try {
    localStorage.setItem(STORAGE_KEYS.filter, filter);
  } catch (err) {
    console.warn('localStorage not available:', err);
  }
}

function loadFilterPreference() {
  try {
    return localStorage.getItem(STORAGE_KEYS.filter) || 'all';
  } catch (err) {
    return 'all';
  }
}

function getViewedProjects() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.viewed)) || [];
  } catch (err) {
    return [];
  }
}

function markProjectAsViewed(id) {
  if (!id) return;

  try {
    const viewed = getViewedProjects();
    if (!viewed.includes(id)) {
      viewed.push(id);
      sessionStorage.setItem(STORAGE_KEYS.viewed, JSON.stringify(viewed));
    }
  } catch (err) {
    console.warn('sessionStorage not available:', err);
  }
}


/* --------------------------------------------------------------------------
  DOM REFERENCES
   -------------------------------------------------------------------------- */

const track = document.querySelector('.horizontal-track');
const emptyState = document.getElementById('emptyState');
const filterBar = document.getElementById('filterBar');
const videoModalEl = document.getElementById('videoModal');
const videoModal = videoModalEl ? new bootstrap.Modal(videoModalEl) : null;
const videoFrame = document.getElementById('videoFrame');
const featuredPlay = document.getElementById('featuredPlay');


/* --------------------------------------------------------------------------
   HELPER — SIZE CLASS
   -------------------------------------------------------------------------- */

function getSizeClass(size) {
  const map = {
    large: 'project-large',
    medium: 'project-medium',
    small: 'project-small'
  };
  return map[size] || '';
}


/* --------------------------------------------------------------------------
   YOUTUBE TITLE / META
   -------------------------------------------------------------------------- */

function getVideoTitle(project) {
  return `${project.title} — Open Movie Reference`;
}

function getVideoMeta(project) {
  return `${project.director} · ${project.title} · ${project.license || 'Creative Commons'}`;
}


/* --------------------------------------------------------------------------
   CREATE LAZY VIDEO PREVIEW
   -------------------------------------------------------------------------- */

function createMotionPreview(card) {
  if (!card) return;
  if (previewFrames.has(card)) return;

  const media = card.querySelector('.card-media');
  const overlay = card.querySelector('.play-overlay');

  if (!media || !overlay) return;

  const videoId = overlay.getAttribute('data-video');
  if (!videoId) return;

  /* Create YouTube iframe */
  const iframe = document.createElement('iframe');

  iframe.className = 'motion-preview-video';
  iframe.src =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1` +
    `&mute=1` +
    `&loop=1` +
    `&playlist=${encodeURIComponent(videoId)}` +
    `&controls=0` +
    `&playsinline=1` +
    `&rel=0` +
    `&modestbranding=1` +
    `&iv_load_policy=3` +
    `&disablekb=1`;

  iframe.title = overlay.getAttribute('data-title') || 'Project preview';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('loading', 'lazy');

  media.insertBefore(iframe, media.firstChild);

  const liveLabel = document.createElement('span');
  liveLabel.className = 'motion-live-label';
  liveLabel.textContent = 'LIVE PREVIEW';
  media.appendChild(liveLabel);
  previewFrames.set(card, iframe);
}


/* --------------------------------------------------------------------------
   REMOVE VIDEO WHEN CARD LEAVES VIEWPORT
   -------------------------------------------------------------------------- */

function removeMotionPreview(card) {
  if (!card) return;

  const iframe = previewFrames.get(card);
  if (!iframe) return;

  iframe.src = '';
  iframe.remove();

  const liveLabel = card.querySelector('.motion-live-label');
  if (liveLabel) {
    liveLabel.remove();
  }

  previewFrames.delete(card);
}


/* --------------------------------------------------------------------------
   VIDEO INTERSECTION OBSERVER
   -------------------------------------------------------------------------- */

function initMotionVideoPreviews() {
  if (videoPreviewObserver) {
    videoPreviewObserver.disconnect();
  }

  const cards = document.querySelectorAll('.horizontal-track .project-item');
  if (!cards.length) return;

  videoPreviewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        if (entry.isIntersecting) {
          createMotionPreview(card);
        }
        else {
          removeMotionPreview(card);
        }
      });
    },
    {
      rootMargin: '250px 300px',
      threshold: 0.01
    }
  );

  cards.forEach((card) => {
    videoPreviewObserver.observe(card);
  });
}


/* --------------------------------------------------------------------------
   RENDER PROJECT CARDS
   -------------------------------------------------------------------------- */

function renderProjects(filter = 'all') {
  /* Filter projects */
  const filtered = filter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === filter);

  /* Empty state */
  if (filtered.length === 0) {
    if (emptyState) {
      emptyState.classList.add('show');
    }
    if (track) {
      track.innerHTML = '';
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.remove('show');
  }

  /* Build cards */
  const cardsHtml = filtered
    .map((p, index) => {
      const sizeClass = getSizeClass(p.size);
      const hasVideo = Boolean(p.videoId);
      const btnDisabled = hasVideo ? '' : 'disabled';
      const btnText = hasVideo ? 'Watch' : 'Trailer Soon';
      const videoTitle = getVideoTitle(p);
      const videoMeta = getVideoMeta(p);

      const playOverlay = hasVideo
        ? `
          <div
            class="play-overlay"
            data-video="${p.videoId}"
            data-title="${videoTitle}"
            data-meta="${videoMeta}"
            data-id="${p.id}"
          >
            <i class="bi bi-play-circle-fill"></i>
          </div>
        `
        : '';

      const watchAttr = hasVideo
        ? `
          data-video="${p.videoId}"
          data-title="${videoTitle}"
          data-meta="${videoMeta}"
          data-id="${p.id}"
        `
        : '';
      const idxStr = String(index + 1).padStart(2, '0');
      const fallbackImage = hasVideo
        ? `
          <img
            class="motion-preview-fallback"
            src="https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg"
            alt="${p.title}"
            loading="lazy"
          >
        `
        : '';
      const isViewed = getViewedProjects().includes(p.id);

      const shareButtons = buildShareButtonsHtml(p.id);

      return `
        <div
          class="project-item ${sizeClass} ${isViewed ? 'is-viewed' : ''}"
          data-cat="${p.category}"
          data-id="${p.id}"
          style="transition-delay: ${index * 0.06}s"
        >
          <div class="project-index">
            ${idxStr}
          </div>

          <div class="card">
            <!-- CARD MEDIA -->
            <div class="card-media">
              ${fallbackImage}

              <!-- LEFT CATEGORY -->
              <span class="cat-tag">
                ${p.displayCat}
              </span>

              <!-- SESSION STORAGE — shown only if already watched -->
              <span class="viewed-badge">
                <i class="bi bi-check-circle-fill"></i>
                VIEWED
              </span>

              ${playOverlay}
            </div>

            <!-- CARD BODY -->
            <div class="card-body">
              <div class="card-title-row">
                <h3>${p.title}</h3>
                <span>${idxStr}</span>
              </div>

              <p class="director">${p.director}</p>
              <p class="logline">${p.logline}</p>

              <div class="project-footer">
                <span class="runtime">${p.runtime}</span>

                <button
                  class="watch-btn"
                  ${watchAttr}
                  ${btnDisabled}
                >
                  <i class="bi bi-play-fill"></i>
                  ${btnText}
                </button>
              </div>

              ${shareButtons}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  track.innerHTML = cardsHtml;
  requestAnimationFrame(() => {
    initScrollReveal();
    initMotionVideoPreviews();
  });
}

/* --------------------------------------------------------------------------
   SCROLL REVEAL
   -------------------------------------------------------------------------- */

function initScrollReveal() {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }

  const items = document.querySelectorAll('.horizontal-track .project-item');
  if (!items.length) return;

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  items.forEach((el) => {
    scrollObserver.observe(el);
  });
}

/* --------------------------------------------------------------------------
   VIDEO MODAL
   -------------------------------------------------------------------------- */

function openVideo(videoId, title, meta) {
  if (!videoId) {
    console.warn('No video ID provided');
    return;
  }

  if (!videoModal) return;

  videoFrame.src =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1`;

  document.getElementById('videoModalTitle').textContent = title;
  document.getElementById('videoMeta').textContent = meta;

  videoModal.show();
}

/* --------------------------------------------------------------------------
   CLEAN UP MODAL VIDEO
   -------------------------------------------------------------------------- */

if (videoModalEl) {
  videoModalEl.addEventListener('hidden.bs.modal', function () {
    videoFrame.src = '';
  });
}


/* --------------------------------------------------------------------------
   SOCIAL SHARE (jQuery)
   -------------------------------------------------------------------------- */
function buildShareButtonsHtml(projectId) {
  return `
    <div class="share-buttons" aria-label="Share this project">
      <button class="share-btn share-facebook" type="button" data-id="${projectId}" aria-label="Share on Facebook">
        <i class="bi bi-facebook"></i>
      </button>
      <button class="share-btn share-twitter" type="button" data-id="${projectId}" aria-label="Share on X">
        <i class="bi bi-twitter-x"></i>
      </button>
      <button class="share-btn share-whatsapp" type="button" data-id="${projectId}" aria-label="Share on WhatsApp">
        <i class="bi bi-whatsapp"></i>
      </button>
    </div>
  `;
}

function getShareUrl(projectId) {
  return window.location.origin + window.location.pathname + '#' + projectId;
}

$(document).on('click', '.share-facebook', function (e) {
  e.preventDefault();
  e.stopPropagation();

  const id = $(this).data('id');
  const project = projectsData.find(p => p.id === id);
  if (!project) return;

  const url =
    'https://www.facebook.com/sharer/sharer.php?u=' +
    encodeURIComponent(getShareUrl(id));

  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=520');
});

$(document).on('click', '.share-twitter', function (e) {
  e.preventDefault();
  e.stopPropagation();

  const id = $(this).data('id');
  const project = projectsData.find(p => p.id === id);
  if (!project) return;

  const text = encodeURIComponent(`Check out "${project.title}" on FutureMotion Club!`);
  const url =
    'https://twitter.com/intent/tweet?text=' + text +
    '&url=' + encodeURIComponent(getShareUrl(id));

  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=520');
});

$(document).on('click', '.share-whatsapp', function (e) {
  e.preventDefault();
  e.stopPropagation();

  const id = $(this).data('id');
  const project = projectsData.find(p => p.id === id);
  if (!project) return;

  const text = encodeURIComponent(
    `Check out "${project.title}" on FutureMotion Club! ${getShareUrl(id)}`
  );

  window.open(
    'https://wa.me/?text=' + text,
    '_blank',
    'noopener,noreferrer'
  );
});

/* --------------------------------------------------------------------------
   VIDEO TRIGGERS
   -------------------------------------------------------------------------- */

document.addEventListener('click', function (e) {
  const target = e.target.closest('.watch-btn:not(:disabled), .play-overlay, #featuredPlay');
  if (!target) return;

  const videoId = target.getAttribute('data-video');
  if (!videoId) return;

  const title = target.getAttribute('data-title') || 'Trailer';
  const meta = target.getAttribute('data-meta') || '';

  openVideo(videoId, title, meta);

  const projectId = target.getAttribute('data-id');
  if (projectId) {
    markProjectAsViewed(projectId);
    const card = document.querySelector(`.project-item[data-id="${projectId}"]`);
    if (card) {
      card.classList.add('is-viewed');
    }
  }
});


/* --------------------------------------------------------------------------
   FILTER BAR
   -------------------------------------------------------------------------- */

if (filterBar) {
  filterBar.addEventListener('click', function (e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    currentFilter = filter;

    saveFilterPreference(filter);
    renderProjects(filter);
  });
}


/* --------------------------------------------------------------------------
   FEATURED SECTION
   -------------------------------------------------------------------------- */

function updateFeatured() {
  const featured = projectsData.find(p => p.featured === true) || projectsData[0];
  if (!featured) return;

  /* Featured image */
  const img = document.getElementById('featuredImg');
  if (img && featured.videoId) {
    img.src = `https://img.youtube.com/vi/${featured.videoId}/maxresdefault.jpg`;
    img.alt = featured.title;
  }

  /* Featured title */
  const titleEl = document.getElementById('featuredTitle');
  if (titleEl) {
    const parts = featured.title.split(' ');
    if (parts.length > 1) {
      const first = parts.slice(0, -1).join(' ');
      const last = parts[parts.length - 1];
      titleEl.innerHTML = `${first} <span>${last}</span>`;
    } else {
      titleEl.innerHTML = `${featured.title} <span>✦</span>`;
    }
  }

  /* Featured description */
  const desc = document.getElementById('featuredDesc');
  if (desc) {
    desc.textContent = featured.logline;
  }

  /* Featured meta */
  const metaDivs = document.querySelectorAll('.featured-meta > div');
  if (metaDivs.length >= 4) {
    const formatLabel = featured.displayCat || 'Animation';

    metaDivs[0]?.querySelector('strong')?.replaceChildren(
      document.createTextNode(featured.director)
    );

    metaDivs[1]?.querySelector('strong')?.replaceChildren(
      document.createTextNode(formatLabel)
    );

    metaDivs[2]?.querySelector('strong')?.replaceChildren(
      document.createTextNode(featured.runtime)
    );
  }

  /* Featured play button */
  if (featuredPlay) {
    featuredPlay.setAttribute('data-video', featured.videoId || '');
    featuredPlay.setAttribute('data-title', getVideoTitle(featured));
    featuredPlay.setAttribute('data-meta', getVideoMeta(featured));
    featuredPlay.setAttribute('data-id', featured.id || '');
  }

  /* Featured share buttons */
  const featuredShareEl = document.getElementById('featuredShare');
  if (featuredShareEl) {
    featuredShareEl.querySelectorAll('.share-btn').forEach(btn =>
      btn.setAttribute('data-id', featured.id || '')
    );
  }
  fetchFeaturedVideoInfo(featured);
}


/* --------------------------------------------------------------------------
   RESTFUL API CALL — jQuery + YouTube oEmbed
   -------------------------------------------------------------------------- */

function fetchFeaturedVideoInfo(project) {
  if (!project || !project.videoId) return;
  if (typeof $ === 'undefined') return;

  const oEmbedUrl =
    'https://www.youtube.com/oembed?url=' +
    encodeURIComponent(`https://www.youtube.com/watch?v=${project.videoId}`) +
    '&format=json';

  $.getJSON(oEmbedUrl)
    .done(function (data) {
      const desc = document.getElementById('featuredDesc');
      if (!desc || !data || !data.title) return;

      /* Remove any badge from a previous call first */
      const oldBadge = document.querySelector('.api-live-badge');
      if (oldBadge) oldBadge.remove();

      const liveBadge = document.createElement('p');
      liveBadge.className = 'api-live-badge';
      liveBadge.innerHTML =
        `<i class="bi bi-cloud-check-fill"></i> Live from YouTube: “${data.title}” — ${data.author_name}`;

      desc.insertAdjacentElement('afterend', liveBadge);
    })
    .fail(function () {
      console.warn('YouTube oEmbed API request failed — showing static project data only.');
    });
}


/* --------------------------------------------------------------------------
   MOBILE DROPDOWN
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', function () {
  const dropdown = document.querySelector('.projects-dropdown');
  if (!dropdown) return;

  const toggleLink = dropdown.querySelector('.projects-main-link');
  if (toggleLink) {
    toggleLink.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle('open');
      }
    });
  }
  document.addEventListener('click', function (e) {
    if (window.innerWidth <= 768 && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
});

/* --------------------------------------------------------------------------
   PAUSE / RELEASE ALL PREVIEWS WHEN TAB IS HIDDEN
   -------------------------------------------------------------------------- */

document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    document.querySelectorAll('.horizontal-track .project-item').forEach(card =>
      removeMotionPreview(card)
    );
  } else {
    initMotionVideoPreviews();
  }
});

/* --------------------------------------------------------------------------
   FEATURED PRODUCTION — DESKTOP AUTOPLAY ON SCROLL
   -------------------------------------------------------------------------- */

function initFeaturedAutoplay() {
  if (window.matchMedia("(max-width: 767.98px)").matches) {
    return;
  }

  const featuredCard = document.getElementById("featuredCard");
  const featuredMedia = featuredCard?.querySelector(".featured-media");
  const iframe = document.getElementById("featuredAutoplay");
  const playButton = document.getElementById("featuredPlay");

  if (!featuredCard || !featuredMedia || !iframe || !playButton) {
    return;
  }

  /* Respect accessibility preference */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let isPlaying = false;

  function startPreview() {
    if (isPlaying) return;

    const videoId = playButton.dataset.video;
    if (!videoId) return;

    iframe.src =
      `https://www.youtube.com/embed/${videoId}` +
      `?autoplay=1` +
      `&mute=1` +
      `&controls=0` +
      `&loop=1` +
      `&playlist=${encodeURIComponent(videoId)}` +
      `&playsinline=1` +
      `&rel=0` +
      `&modestbranding=1`;

    iframe.classList.add("is-playing");
    featuredMedia.classList.add("is-autoplaying");
    isPlaying = true;
  }

  function stopPreview() {
    if (!isPlaying) return;

    iframe.src = "";
    iframe.classList.remove("is-playing");
    featuredMedia.classList.remove("is-autoplaying");
    isPlaying = false;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          startPreview();
        } else {
          stopPreview();
        }
      });
    },
    {
      threshold: [0, 0.25, 0.55, 0.75]
    }
  );

  observer.observe(featuredCard);

  /* Stop when browser tab is hidden */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopPreview();
    }
  });
}

/* --------------------------------------------------------------------------
   INIT
   -------------------------------------------------------------------------- */

function init() {
  updateFeatured();
  const savedFilter = loadFilterPreference();
  currentFilter = savedFilter;

  if (filterBar) {
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === savedFilter);
    });
  }

  renderProjects(savedFilter);
}

/* --------------------------------------------------------------------------
   DOM READY
   -------------------------------------------------------------------------- */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* Initialize featured autoplay */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeaturedAutoplay, { once: true });
} else {
  initFeaturedAutoplay();
}