/* ==========================================================================
   FutureMotion Club — Gallery Page Script
   gallery.js only; shared behaviour remains in style.css + shared JS files.
   ========================================================================== */

/* --------------------------------------------------------------------------
   DATA
   -------------------------------------------------------------------------- */

const GALLERY_DATA = [
  { id: 1, category: "storyboard", title: "Opening Scene — Rough Pass", author: "Elysia Tan", img: "Images/Gallery/Gallery_1.jpg", desc: "First pass of thumbnail panels blocking out the opening scene, focused on establishing camera framing before detail work." },
  { id: 2, category: "storyboard", title: "Chase Sequence — Panel Layout", author: "Rayhan Idris", img: "Images/Gallery/Gallery_2.jpg", desc: "Panel-by-panel layout for the mid-film chase sequence, with arrows marking character movement across frames." },
  { id: 3, category: "storyboard", title: "Ending Montage — Thumbnails", author: "Elysia Tan", img: "Images/Gallery/Gallery_3.jpg", desc: "Small thumbnail sketches used to plan pacing for the closing montage before moving to a full animatic." },
  { id: 4, category: "character", title: "Mira — Turnaround Sheet", author: "Naledi Osei", img: "Images/Gallery/Gallery_4.jpg", desc: "Front, 3/4 and back views of the lead character, drawn to keep proportions consistent across the team." },
  { id: 5, category: "character", title: "Sidekick Robot — Expression Sheet", author: "Jonas Beckett", img: "Images/Gallery/Gallery_5.jpg", desc: "A set of expression studies for the sidekick character, used as a reference sheet for reaction shots." },
  { id: 6, category: "character", title: "Mira — Colour Model", author: "Naledi Osei", img: "Images/Gallery/Gallery_6.jpg", desc: "Final colour flats and shading guide handed off to keep on-model colour consistent across scenes." },
  { id: 7, category: "3d", title: "Cafe Interior — Blender Pass", author: "Yusuf Rahman", img: "Images/Gallery/Gallery_7.jpg", desc: "Early interior layout built in Blender to test lighting and camera angles for a cafe scene." },
  { id: 8, category: "3d", title: "Robot Companion — Base Mesh", author: "Camille Dubois", img: "Images/Gallery/Gallery_8.jpg", desc: "Base mesh and early rig test for the sidekick robot, modeled for a low-poly, mobile-friendly pipeline." },
  { id: 9, category: "3d", title: "Treehouse Prop Kit", author: "Yusuf Rahman", img: "Images/Gallery/Gallery_9.jpg", desc: "A small kit of modeled props — ladder, lantern, crates — reused across several environment scenes." },
  { id: 10, category: "concept", title: "Neon District — Mood Study", author: "Priya Sharma", img: "Images/Gallery/Gallery_10.jpg", desc: "Colour and lighting exploration for a neon-lit backdrop, used to lock the palette before background painting." },
  { id: 11, category: "concept", title: "Underwater City — Colour Script", author: "Ahmad Faris", img: "Images/Gallery/Gallery_11.jpg", desc: "A short colour script mapping mood shifts across three key scenes set in an underwater city." },
  { id: 12, category: "concept", title: "Festival Poster — Draft 2", author: "Priya Sharma", img: "Images/Gallery/Gallery_12.jpg", desc: "Second-pass layout for the club's showreel festival poster, refining type hierarchy from the first draft." }
];

const CATEGORY_LABEL = {
  storyboard: "Storyboard",
  character: "Character Design",
  "3d": "3D & Modeling",
  concept: "Concept Art"
};

const VALID_FILTERS = new Set([
  "all",
  "storyboard",
  "character",
  "3d",
  "concept",
  "favorites"
]);


/* --------------------------------------------------------------------------
   DOM REFERENCES
   -------------------------------------------------------------------------- */

const grid = document.getElementById("galleryGrid");
const favCountEl = document.getElementById("favCount");
const filterBar = document.getElementById("filterBar");
const gallerySearchInput = document.getElementById("gallerySearch");
const gallerySortSelect = document.getElementById("gallerySort");
const galleryResultCount = document.getElementById("galleryResultCount");
const galleryReset = document.getElementById("galleryReset");
const emptyState = document.getElementById("emptyState");
const lightboxModalEl = document.getElementById("lightboxModal");



/* --------------------------------------------------------------------------
   FLIP CARDS — click, tap, Enter, or Space
   -------------------------------------------------------------------------- */

function initFlipCards() {
  document.querySelectorAll(".flip-card").forEach((card) => {
    function toggleCard() {
      const flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(flipped));
    }

    card.addEventListener("click", toggleCard);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleCard();
    });
  });
}


/* --------------------------------------------------------------------------
   FAVORITES — persistent localStorage
   -------------------------------------------------------------------------- */

const FAV_KEY = "vf_gallery_favorites";

function getFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAV_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter((id) => Number.isInteger(id) && GALLERY_DATA.some((item) => item.id === id));
  } catch (_) {
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn("Unable to save gallery favorites:", error);
  }
}

function toggleFavorite(id) {
  let favorites = getFavorites();
  favorites = favorites.includes(id) ? favorites.filter((value) => value !== id) : [...favorites, id];
  saveFavorites(favorites);
  return favorites;
}

function updateFavCount() {
  if (favCountEl) {
    favCountEl.textContent = `(${getFavorites().length})`;
  }
}


/* --------------------------------------------------------------------------
   SESSION — unique frames explored this tab/session
   -------------------------------------------------------------------------- */

const SESSION_KEY = "vf_gallery_viewed_frames_this_session";

function getSessionViewedFrames() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter((id) => Number.isInteger(id) && GALLERY_DATA.some((item) => item.id === id));
  } catch (_) {
    return [];
  }
}

let sessionViewedFrames = getSessionViewedFrames();

function markSessionFrameViewed(id) {
  if (!sessionViewedFrames.includes(id)) {
    sessionViewedFrames.push(id);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionViewedFrames));
    } catch (error) {
      console.warn("Session storage is unavailable:", error);
    }
  }
  renderSessionBadge();
}

function renderSessionBadge() {
  const countEl = document.getElementById("sessionCount");
  const dotsEl = document.getElementById("sessionDots");

  const viewedCount = sessionViewedFrames.length;
  const totalCount = GALLERY_DATA.length;

  if (countEl) {
    countEl.innerHTML = `
    <span class="session-count-number">
      ${String(viewedCount).padStart(2, "0")} / ${String(totalCount).padStart(2, "0")}
    </span>
    <span class="session-count-text">
      FRAMES EXPLORED THIS VISIT
    </span>
  `;
  }

  if (dotsEl) {
    dotsEl.innerHTML = GALLERY_DATA.map((item) => {
      const viewed = sessionViewedFrames.includes(item.id);
      return `<span class="session-dot ${viewed ? "is-viewed" : ""}" title="Frame ${String(item.id).padStart(2, "0")}"></span>`;
    }).join("");
  }
}


/* --------------------------------------------------------------------------
   COOKIE — last filter only, and only after cookie consent
   -------------------------------------------------------------------------- */

const FILTER_COOKIE = "vf_gallery_last_filter";
const COOKIE_CONSENT_KEY = "vf-cookie-consent";

function hasCookieConsent() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch (_) {
    return false;
  }
}

function setCookie(name, value, days) {
  if (!hasCookieConsent()) return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  if (!hasCookieConsent()) return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.substring(name.length + 1)) : null;
}

function clearCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function initCookiePreferenceSync() {

  const acceptBtn = document.getElementById("acceptCookies");
  const declineBtn = document.getElementById("declineCookies");

  acceptBtn?.addEventListener("click", () => {

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch (_) {}

    setCookie(FILTER_COOKIE, activeFilter, 30);
  });


  declineBtn?.addEventListener("click", () => {

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    } catch (_) {}

    clearCookie(FILTER_COOKIE);
  });
}


/* --------------------------------------------------------------------------
   FILTER + SEARCH
   -------------------------------------------------------------------------- */

let activeFilter = "all";
let searchQuery = "";
let sortMode = "default";

function restoreSavedFilter() {
  const savedFilter = getCookie(FILTER_COOKIE);
  if (!savedFilter || !VALID_FILTERS.has(savedFilter)) return;

  const button = document.querySelector(`.filter-btn[data-filter="${savedFilter}"]`);
  if (!button) return;

  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");
  activeFilter = savedFilter;
}


/* --------------------------------------------------------------------------
   RENDER GALLERY
   -------------------------------------------------------------------------- */

function renderGrid() {
  if (!grid) return;

  const favorites = getFavorites();

  grid.innerHTML = GALLERY_DATA.map((item, index) => {
    const tiltClass = index % 3 === 0 ? "tilt-left" : index % 3 === 2 ? "tilt-right" : "";
    const isFav = favorites.includes(item.id);

    return `
      <div id="frame-${item.id}" class="gallery-item reveal" data-category="${item.category}" data-id="${item.id}" data-search="${(item.title + " " + item.author).toLowerCase()}" style="transition-delay:${(index % 6) * 0.04}s">
        <div class="card ${tiltClass}" data-id="${item.id}" role="button" tabindex="0" aria-label="Open ${item.title}">
          <span class="card-tag">${CATEGORY_LABEL[item.category]}</span>
          <button class="card-fav ${isFav ? "is-fav" : ""}" data-id="${item.id}" aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}" type="button">
            ${isFav ? "★\uFE0E" : "☆\uFE0E"}
          </button>
          <img src="${item.img}" alt="${item.title}" loading="lazy">
          <div class="card-body">
            <h3>${item.title}</h3>
            <p>by ${item.author}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");

  updateFavCount();

  if (window.VFReveal) {
    window.VFReveal.observe(".gallery-item.reveal");
  }

  const galleryParent = document.querySelector(".archive-gallery");
  if (galleryParent?.classList.contains("visible")) {
    const items = galleryParent.querySelectorAll(".gallery-item");
    items.forEach((item, index) => {
      item.style.transition = "none";
      item.style.opacity = "0";
      item.style.transform = "translateY(25px)";
      void item.offsetHeight;
      const delay = index * 0.04;
      item.style.transition = `opacity 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) ${delay}s`;
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    });
  }
}
/* --------------------------------------------------------------------------
   SORT GALLERY
   -------------------------------------------------------------------------- */

function applySort() {
  if (!grid) return;

  const items = Array.from(
    grid.querySelectorAll(".gallery-item")
  );

  items.sort((a, b) => {

    const idA = Number(a.dataset.id);
    const idB = Number(b.dataset.id);

    const titleA =
      a.querySelector("h3")?.textContent.trim() || "";

    const titleB =
      b.querySelector("h3")?.textContent.trim() || "";

    const categoryA = a.dataset.category || "";
    const categoryB = b.dataset.category || "";

    switch (sortMode) {

      case "reverse":
        return idB - idA;

      case "az":
        return titleA.localeCompare(titleB);

      case "category": {
        const categoryCompare =
          CATEGORY_LABEL[categoryA].localeCompare(
            CATEGORY_LABEL[categoryB]
          );

        if (categoryCompare !== 0) {
          return categoryCompare;
        }

        return idA - idB;
      }

      case "default":
      default:
        return idA - idB;
    }
  });

  items.forEach((item) => {
    grid.appendChild(item);
  });
}

function applyFilter() {
  if (!grid) return;
  applySort();

  const favorites = getFavorites();
  const items = [...grid.querySelectorAll(".gallery-item")];

  items.forEach((element) => {
    const category = element.dataset.category;
    const id = Number.parseInt(element.dataset.id, 10);

    const categoryMatch = activeFilter === "all" ||
      (activeFilter === "favorites" ? favorites.includes(id) : category === activeFilter);

    const searchMatch = !searchQuery || (element.dataset.search || "").includes(searchQuery);

    element.hidden = !(categoryMatch && searchMatch);
  });

  /* Update number of visible frames */
  const visibleCount =
    items.filter((element) => !element.hidden).length;

  if (galleryResultCount) {
    galleryResultCount.textContent =
      `${String(visibleCount).padStart(2, "0")} / ` +
      `${String(GALLERY_DATA.length).padStart(2, "0")} FRAMES SHOWN`;
  }


  /* Only show this status when controls have changed */
  const hasActiveControls =
    activeFilter !== "all" ||
    searchQuery !== "" ||
    sortMode !== "default";

  if (galleryReset) {
    galleryReset.hidden = !hasActiveControls;
  }

  if (!emptyState) return;

  const visibleItems = items.some((element) => !element.hidden);
  const showEmpty = !visibleItems && (activeFilter === "favorites" || searchQuery !== "");

  emptyState.classList.toggle("show", showEmpty);

  if (!showEmpty) return;

  const heading = emptyState.querySelector("h3");
  const body = emptyState.querySelector("p");

  if (searchQuery) {
    if (heading) heading.textContent = "No matches";
    if (body) body.textContent = `Nothing in ${activeFilter === "favorites" ? "your favorites" : "The Gallery"} matches "${searchQuery}" — try a different title, artist, or clear the search.`;
  } else {
    if (heading) heading.textContent = "Your reel is empty";
    if (body) body.textContent = "Tap the ☆ on any piece to pin it here — it is saved on this device with localStorage.";
  }
}

function bindGalleryEvents() {
  filterBar?.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button || !VALID_FILTERS.has(button.dataset.filter)) return;

    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    activeFilter = button.dataset.filter;
    setCookie(FILTER_COOKIE, activeFilter, 30);
    applyFilter();
  });

  if (gallerySearchInput) {
    gallerySearchInput.addEventListener("input", (event) => {
      searchQuery = event.target.value.trim().toLowerCase();
      applyFilter();
    });
  }

  if (gallerySortSelect) {

    gallerySortSelect.addEventListener("change", (event) => {
      sortMode = event.target.value;
      applyFilter();
    });
  }

  if (galleryReset) {
    galleryReset.addEventListener("click", () => {

      activeFilter = "all";
      searchQuery = "";
      sortMode = "default";

      if (gallerySearchInput) {
        gallerySearchInput.value = "";
      }

      if (gallerySortSelect) {
        gallerySortSelect.value = "default";
      }

      document.querySelectorAll(".filter-btn").forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.filter === "all"
        );
      });

      setCookie(FILTER_COOKIE, "all", 30);

      applyFilter();
    });
  }

  if (!grid) return;

  grid.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".card-fav");
    if (favoriteButton) {
      event.stopPropagation();
      const card = favoriteButton.closest(".card");
      const id = Number.parseInt(favoriteButton.dataset.id, 10);
      if (!Number.isInteger(id)) return;

      toggleFavorite(id);
      updateCardFavorite(card, id);
      return;
    }

    const card = event.target.closest(".card");
    if (!card) return;

    const id = Number.parseInt(card.dataset.id, 10);
    if (Number.isInteger(id)) openLightbox(id);
  });

  grid.addEventListener("keydown", (event) => {
    if (event.target.closest(".card-fav")) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest(".card");
    if (!card) return;

    event.preventDefault();
    const id = Number.parseInt(card.dataset.id, 10);
    if (Number.isInteger(id)) openLightbox(id);
  });
}

function updateCardFavorite(card, id) {
  if (!card) return;

  const favorites = getFavorites();
  const isFav = favorites.includes(id);
  const button = card.querySelector(".card-fav");

  if (button) {
    button.textContent = isFav ? "★\uFE0E" : "☆\uFE0E";
    button.classList.toggle("is-fav", isFav);
    button.setAttribute("aria-label", isFav ? "Remove from favorites" : "Add to favorites");
  }

  updateFavCount();
  applyFilter();
}


/* --------------------------------------------------------------------------
   LIGHTBOX + DEEP LINKS
   -------------------------------------------------------------------------- */

let currentIndex = 0;
let isLightboxOpen = false;
let previousFocusedElement = null;

const closeBtn = document.getElementById("lightboxClose");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const lightboxModal = lightboxModalEl ? {
  show() {
    previousFocusedElement = document.activeElement;
    lightboxModalEl.classList.add("open");
    lightboxModalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-locked");
    isLightboxOpen = true;
    closeBtn?.focus();
  },
  hide() {
    lightboxModalEl.classList.remove("open");
    lightboxModalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-locked");
    isLightboxOpen = false;
    if (previousFocusedElement instanceof HTMLElement) {
      previousFocusedElement.focus();
    }
  }
} : null;

function openLightbox(id) {
  const index = GALLERY_DATA.findIndex((item) => item.id === id);
  if (index === -1) return;

  currentIndex = index;
  showFrame(currentIndex);
  lightboxModal?.show();
}

function showFrame(index) {
  const item = GALLERY_DATA[index];
  if (!item) return;

  markSessionFrameViewed(item.id);

  const img = document.getElementById("lightboxImg");
  const title = document.getElementById("lightboxTitle");
  const meta = document.getElementById("lightboxMeta");
  const desc = document.getElementById("lightboxDesc");
  const counter = document.getElementById("lightboxCounter");

  if (img) { img.src = item.img; img.alt = item.title; }
  if (title) title.textContent = item.title;
  if (meta) meta.textContent = `${CATEGORY_LABEL[item.category]} · by ${item.author}`;
  if (desc) desc.textContent = item.desc;
  if (counter) counter.textContent = `Frame ${String(index + 1).padStart(2, "0")} / ${GALLERY_DATA.length}`;

  updateShareLinks(item);
}

function bindLightboxEvents() {
  closeBtn?.addEventListener("click", () => lightboxModal?.hide());

  lightboxModalEl?.addEventListener("click", (event) => {
    if (event.target === lightboxModalEl) lightboxModal?.hide();
  });

  prevBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + GALLERY_DATA.length) % GALLERY_DATA.length;
    showFrame(currentIndex);
  });

  nextBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % GALLERY_DATA.length;
    showFrame(currentIndex);
  });

  document.addEventListener("keydown", (event) => {
    if (!isLightboxOpen) return;
    if (event.key === "ArrowLeft") prevBtn?.click();
    if (event.key === "ArrowRight") nextBtn?.click();
    if (event.key === "Escape") lightboxModal?.hide();
  });
}

function frameIdFromHash() {
  const match = window.location.hash.match(/^#frame-(\d+)$/);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return GALLERY_DATA.some((item) => item.id === id) ? id : null;
}

function openFrameFromHash() {
  const id = frameIdFromHash();
  if (id !== null) openLightbox(id);
}


/* --------------------------------------------------------------------------
   MET MUSEUM API — daily fixed reference, still using jQuery $.ajax()
   -------------------------------------------------------------------------- */

const MET_QUERY_TERMS = [
  "landscape", "portrait", "figure", "drawing", "sculpture",
  "architecture", "still life", "animals", "seascape", "abstract"
];

const MET_DAILY_CACHE_KEY = "vf_met_daily_reference";

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaySeed() {
  return Number(getTodayKey().replace(/-/g, ""));
}

function getCachedDailyMet() {
  try {
    const saved = JSON.parse(localStorage.getItem(MET_DAILY_CACHE_KEY));
    if (!saved || saved.date !== getTodayKey() || !saved.artwork?.imageUrl) return null;
    return saved.artwork;
  } catch (_) {
    return null;
  }
}

function saveDailyMet(artwork) {
  try {
    localStorage.setItem(MET_DAILY_CACHE_KEY, JSON.stringify({ date: getTodayKey(), artwork }));
  } catch (error) {
    console.warn("Unable to save today's Met reference:", error);
  }
}

function renderMetArtwork(artwork) {
  const metContent = document.getElementById("metContent");
  if (!metContent) return;

  const img = document.createElement("img");
  img.src = artwork.imageUrl;
  img.alt = artwork.title;
  img.loading = "lazy";

  const info = document.createElement("div");
  info.className = "met-info";

  const heading = document.createElement("h4");
  heading.textContent = artwork.title;

  const meta = document.createElement("p");
  meta.textContent = `${artwork.artist} · ${artwork.date}`;

  const link = document.createElement("a");
  link.href = artwork.linkUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = "met-link";
  link.textContent = "🔗 View on Met Museum";

  info.append(heading, meta, link);
  metContent.replaceChildren(img, info);
}

function requestMetArtwork(seed, saveAsDaily, termOffset = 0) {
  if (typeof window.jQuery === "undefined") {
    showMetError("jQuery did not load, so the Met reference could not be requested.");
    return;
  }

  if (termOffset >= MET_QUERY_TERMS.length) {
    showMetError("No usable artwork with an image could be found.");
    return;
  }

  const term = MET_QUERY_TERMS[(seed + termOffset) % MET_QUERY_TERMS.length];

  window.jQuery.ajax({
    url: `https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true&hasImages=true&q=${encodeURIComponent(term)}`,
    method: "GET",
    dataType: "json",
    success(searchData) {
      const ids = Array.isArray(searchData.objectIDs) ? searchData.objectIDs : [];
      if (!ids.length) {
        requestMetArtwork(seed, saveAsDaily, termOffset + 1);
        return;
      }

      const pool = ids.slice(0, 40);
      const startIndex = seed % pool.length;
      const maxAttempts = Math.min(pool.length, 15);

      function tryCandidate(attempt) {
        if (attempt >= maxAttempts) {
          requestMetArtwork(seed, saveAsDaily, termOffset + 1);
          return;
        }

        const objectId = pool[(startIndex + attempt) % pool.length];

        window.jQuery.ajax({
          url: `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
          method: "GET",
          dataType: "json",
          success(artwork) {
            const imageUrl = artwork.primaryImageSmall || artwork.primaryImage;
            if (!imageUrl) {
              tryCandidate(attempt + 1);
              return;
            }

            const reference = {
              objectId: artwork.objectID,
              imageUrl,
              title: artwork.title || "Untitled",
              artist: artwork.artistDisplayName || "Unknown Artist",
              date: artwork.objectDate || "Unknown Date",
              linkUrl: artwork.objectURL || "#"
            };

            if (saveAsDaily) saveDailyMet(reference);
            renderMetArtwork(reference);
          },
          error() {
            tryCandidate(attempt + 1);
          }
        });
      }

      tryCandidate(0);
    },
    error() {
      requestMetArtwork(seed, saveAsDaily, termOffset + 1);
    }
  });
}

function getMetArtwork(forceRandom = false) {
  const metContent = document.getElementById("metContent");
  if (!metContent) return;

  if (!forceRandom) {
    const cachedArtwork = getCachedDailyMet();
    if (cachedArtwork) {
      renderMetArtwork(cachedArtwork);
      return;
    }
  }

  metContent.innerHTML = "<p>Loading reference...</p>";

  const seed = forceRandom ? Math.floor(Math.random() * 1000000) : getDaySeed();
  requestMetArtwork(seed, !forceRandom);
}

function showMetError(reason) {
  if (reason) console.error("Met API Error:", reason);

  const metContent = document.getElementById("metContent");
  if (metContent) {
    metContent.innerHTML = "<p>Unable to load today's inspiration. Please refresh later.</p>";
  }
}


/* --------------------------------------------------------------------------
   SECTION REVEAL
   -------------------------------------------------------------------------- */

function observeSections() {
  const sections = document.querySelectorAll(".pipeline-section, .reference-section, .archive-gallery");

  if (!sections.length || typeof IntersectionObserver === "undefined") {
    sections.forEach((section) => section.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

  sections.forEach((section) => observer.observe(section));
}


/* --------------------------------------------------------------------------
   SOCIAL SHARE — positioned last per request
   -------------------------------------------------------------------------- */

function absoluteUrl(path) {
  try {
    return new URL(path, window.location.href).href;
  } catch (_) {
    return path;
  }
}

function updateShareLinks(item) {
  const pageUrl = `${window.location.href.split("#")[0]}#frame-${item.id}`;
  const shareText = `"${item.title}" by ${item.author} — FutureMotion Club Gallery`;

  const twitterBtn = document.querySelector(".share-twitter");
  const facebookBtn = document.querySelector(".share-facebook");
  const pinterestBtn = document.querySelector(".share-pinterest");
  const copyBtn = document.querySelector(".share-copy");

  if (twitterBtn) {
    twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  }

  if (facebookBtn) {
    facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  }

  if (pinterestBtn) {
    pinterestBtn.href = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(absoluteUrl(item.img))}&description=${encodeURIComponent(shareText)}`;
  }

  if (copyBtn) {
    copyBtn.dataset.shareUrl = pageUrl;
  }
}

function initCopyShare() {
  const copyShareBtn = document.querySelector(".share-copy");
  if (!copyShareBtn) return;

  copyShareBtn.addEventListener("click", async () => {
    const url = copyShareBtn.dataset.shareUrl || window.location.href;
    const original = copyShareBtn.textContent;

    try {
      await navigator.clipboard.writeText(url);
    } catch (_) {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    copyShareBtn.textContent = "✅";
    copyShareBtn.classList.add("copied");
    copyShareBtn.setAttribute("aria-label", "Link copied!");

    setTimeout(() => {
      copyShareBtn.textContent = original;
      copyShareBtn.classList.remove("copied");
      copyShareBtn.setAttribute("aria-label", "Copy link to clipboard");
    }, 1500);
  });
}


/* --------------------------------------------------------------------------
   INITIALIZATION
   -------------------------------------------------------------------------- */

function init() {
  restoreSavedFilter();
  renderGrid();
  applyFilter();
  renderSessionBadge();

  bindGalleryEvents();
  bindLightboxEvents();
  initCopyShare();
  initFlipCards();
  initCookiePreferenceSync();
  observeSections();

  getMetArtwork();

  document.getElementById("metShuffle")?.addEventListener("click", () => {
    getMetArtwork(true);
  });

  openFrameFromHash();

  window.addEventListener("hashchange", openFrameFromHash);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}