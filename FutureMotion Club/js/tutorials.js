/* ================================================================
   1. GITHUB SEARCH API
================================================================ */

const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';

const TOOL_SEARCH_TERMS = {
  'video-production': 'premiere-pro',
  '2d-animation': 'after-effects',
  'motion-graphics': 'motion-graphics',
  '3d-vfx': 'blender',
  'digital-design': 'video-editing',
  'audio-multimedia': 'adobe-audition'
};


/* ================================================================
   2. FETCH RELATED GITHUB RESOURCE
================================================================ */

function fetchRelatedResource(tool, onSuccess) {
  const term = TOOL_SEARCH_TERMS[tool] || tool;

  if (!term) return;

  $.ajax({
    url: GITHUB_SEARCH_URL,
    method: 'GET',
    dataType: 'json',
    data: {
      q: `${term} in:name,description,topics`,
      sort: 'stars',
      order: 'desc',
      per_page: 1
    },
    success: function (response) {
      const repo = response && response.items && response.items[0];

      if (repo && onSuccess) {
        onSuccess(repo);
      }
    },
    error: function (jqXHR, textStatus) {
      console.warn('GitHub API request failed:', textStatus);
    }
  });
}


/* ================================================================
   3. FORMAT STAR COUNT
================================================================ */

function formatStarCount(count) {
  const number = parseInt(count, 10);

  if (isNaN(number)) {
    return '';
  }

  return number.toLocaleString();
}


/* ================================================================
   4. SOCIAL SHARE BUTTONS
================================================================ */

function renderShareButtons(container, title, url) {
  const $container = $(container);

  if (!$container.length) {
    return;
  }

  $container.empty();

  const shareLinks = [
    {
      label: 'Facebook',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1z"/></svg>',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      label: 'X / Twitter',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.2-8.2L3 2h6.2l4.3 5.7L18.9 2zm-1.1 17.7h1.7L8.2 4.2H6.4l11.4 15.5z"/></svg>',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      label: 'WhatsApp',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6a11.9 11.9 0 0 0 5.7 1.5h.1c6.5 0 11.8-5.3 11.8-11.9 0-3.2-1.2-6.2-3.4-8.5z"/></svg>',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      label: 'LinkedIn',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.7 3.2A2.7 2.7 0 1 1 4.7 8.6a2.7 2.7 0 0 1 0-5.4zM2.4 9.7h4.6V24H2.4V9.7zM9.9 9.7h4.4v2c.6-1.1 2.1-2.4 4.8-2.4 5.1 0 6 3.4 6 7.8V24h-4.6v-6.1c0-1.5 0-3.5-2.1-3.5s-2.4 1.7-2.4 3.4V24H9.9V9.7z"/></svg>',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }
  ];

  shareLinks.forEach(function (link) {
    $('<a>', {
      href: link.href,
      target: '_blank',
      rel: 'noopener noreferrer',
      class: 'share-btn',
      html: link.icon,
      'aria-label': `Share on ${link.label}`,
      title: `Share on ${link.label}`
    }).appendTo($container);
  });
}


/* ================================================================
   5. RECENTLY VIEWED TUTORIALS
================================================================ */

const RECENT_STORAGE_KEY = 'vf-recent-tutorials';


/* ================================================================
   6. GET RECENTLY VIEWED
================================================================ */

function getRecentlyViewed() {
  try {
    const saved = localStorage.getItem(RECENT_STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Could not read recently viewed tutorials.', error);
    return [];
  }
}


/* ================================================================
   7. SAVE RECENTLY VIEWED (UNLIMITED)
================================================================ */

function saveRecentlyViewed(tutorialId) {
  if (!tutorialId) {
    return;
  }

  let recent = getRecentlyViewed();

  // Remove duplicate
  recent = recent.filter(function (id) {
    return id !== tutorialId;
  });

  // Put newest tutorial first
  recent.unshift(tutorialId);

  // IMPORTANT: Do NOT slice the array — unlimited recently viewed

  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent));
  } catch (error) {
    console.warn('Could not save recently viewed tutorials.', error);
  }

  // Immediately update the page
  renderRecentlyViewed();
}


/* ================================================================
   8. RENDER RECENTLY VIEWED
================================================================ */

function renderRecentlyViewed() {
  const content = document.getElementById('recentlyContent');

  if (!content) {
    return;
  }

  const recent = getRecentlyViewed();

  // Clear previous content
  content.innerHTML = '';


  /* ============================================================
     8a. EMPTY STATE
  ============================================================ */

  if (recent.length === 0) {
    content.innerHTML = `
      <div class="recently-empty">
        <span class="recently-empty-icon">◷</span>
        <div>
          <strong>YOU HAVEN'T WATCHED ANYTHING YET</strong>
          <p>Explore a tutorial and it will appear here.</p>
        </div>
      </div>
    `;
    return;
  }


  /* ============================================================
     8b. RECENTLY VIEWED SCROLL AREA
  ============================================================ */

  const grid = document.createElement('div');
  grid.className = 'recently-grid';

  recent.forEach(function (tutorialId) {
    // Find original tutorial card
    const originalCard = document.querySelector(`.tutorial-card[data-id="${CSS.escape(tutorialId)}"]`);

    // Ignore invalid / deleted tutorials
    if (!originalCard) {
      return;
    }

    // Clone original card
    const recentCard = originalCard.cloneNode(true);

    // Remove animation/reveal states
    recentCard.classList.remove('reveal');
    recentCard.classList.add('recently-viewed-card');
    recentCard.style.display = 'flex';
    recentCard.style.opacity = '1';
    recentCard.style.visibility = 'visible';
    recentCard.style.transform = 'none';

    // Handle iframe
    const recentIframe = recentCard.querySelector('iframe');

    if (recentIframe) {
      recentIframe.loading = 'eager';

      // Re-assign src to force initialization after cloning
      const iframeSrc = recentIframe.getAttribute('src');
      recentIframe.setAttribute('src', iframeSrc);
    }

    // Prevent cloned card's iframe from interfering with click
    recentCard.addEventListener('click', function (event) {
      if (event.target.closest('a') || event.target.closest('button')) {
        return;
      }

      // Open the original tutorial
      originalCard.click();
    });

    grid.appendChild(recentCard);
  });


  /* ============================================================
     8c. NO VALID CARDS
  ============================================================ */

  if (!grid.children.length) {
    content.innerHTML = `
      <div class="recently-empty">
        <span class="recently-empty-icon">◷</span>
        <div>
          <strong>YOU HAVEN'T WATCHED ANYTHING YET</strong>
          <p>Explore a tutorial and it will appear here.</p>
        </div>
      </div>
    `;
    return;
  }


  /* ============================================================
     8d. ADD SCROLL AREA
  ============================================================ */

  content.appendChild(grid);


  /* ============================================================
     8e. SCROLL REMINDER (only show when > 3 tutorials)
  ============================================================ */

  if (grid.children.length > 3) {
    const reminder = document.createElement('div');
    reminder.className = 'recently-scroll-reminder';
    reminder.innerHTML = `
      <span class="reminder-arrow">←</span>
      <span>Drag horizontally to view more tutorials</span>
      <span class="reminder-arrow">→</span>
    `;
    content.appendChild(reminder);
  }
}


/* ================================================================
   9. CLEAR RECENTLY VIEWED
================================================================ */

function clearRecentlyViewed() {
  localStorage.removeItem(RECENT_STORAGE_KEY);
  renderRecentlyViewed();
}


/* ================================================================
   10. GENERIC MODAL HELPER
================================================================ */

function setupModal(overlayId, closeId) {
  const overlay = document.getElementById(overlayId);
  const closeBtn = document.getElementById(closeId);

  if (!overlay) {
    return null;
  }

  function close(onClosed) {
    overlay.classList.remove('open');
    document.body.classList.remove('modal-locked');

    if (onClosed) {
      setTimeout(onClosed, 250);
    }
  }

  function open() {
    overlay.classList.add('open');
    document.body.classList.add('modal-locked');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      close(overlay._onClose);
    });
  }

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
      close(overlay._onClose);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && overlay.classList.contains('open')) {
      close(overlay._onClose);
    }
  });

  return {
    overlay: overlay,
    open: open,
    close: close
  };
}


/* ================================================================
   11. PAGE INITIALIZATION
================================================================ */

window.addEventListener('DOMContentLoaded', function () {

  /* ==============================================================
     11a. FIND TUTORIAL CARDS
  ============================================================== */

  const tutorialCards = document.querySelectorAll('.tutorial-card');

  if (!tutorialCards.length) {
    renderRecentlyViewed();
    return;
  }


  /* ==============================================================
     11b. FILTER / SEARCH / SORT ELEMENTS
  ============================================================== */

  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('tutorialSearch');
  const sortSelect = document.getElementById('tutorialSort');
  const loadAllBtn = document.getElementById('loadAllBtn');
  const tutorialGrid = document.querySelector('.tutorial-grid');


  /* ==============================================================
     11c. FILTER STATE
  ============================================================== */

  let currentFilter = 'all';
  let showAll = false;
  const CARDS_PER_PAGE = 6;

  const LEVEL_RANK = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  };


  /* ==============================================================
     11d. FILTER / SEARCH / SORT FUNCTION
  ============================================================== */

  function filterTutorials() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const matchedCards = [];

    tutorialCards.forEach(function (card) {
      const cardCategory = card.dataset.tool || '';
      const matchesFilter = currentFilter === 'all' || cardCategory === currentFilter;
      const cardText = card.textContent.toLowerCase().trim();
      const matchesSearch = searchTerm === '' || cardText.includes(searchTerm);

      if (matchesFilter && matchesSearch) {
        matchedCards.push(card);
      } else {
        card.style.display = 'none';
      }
    });


    /* ============================================================
       11e. SORT
    ============================================================ */

    const sortValue = sortSelect ? sortSelect.value : 'default';

    if (sortValue !== 'default' && tutorialGrid) {
      matchedCards.sort(function (cardA, cardB) {
        if (sortValue === 'duration-asc' || sortValue === 'duration-desc') {
          const durationA = parseInt(cardA.dataset.duration, 10) || 0;
          const durationB = parseInt(cardB.dataset.duration, 10) || 0;

          return sortValue === 'duration-asc' ? durationA - durationB : durationB - durationA;
        }

        if (sortValue === 'level-asc' || sortValue === 'level-desc') {
          const levelA = LEVEL_RANK[cardA.dataset.level] || 0;
          const levelB = LEVEL_RANK[cardB.dataset.level] || 0;

          return sortValue === 'level-asc' ? levelA - levelB : levelB - levelA;
        }

        return 0;
      });

      matchedCards.forEach(function (card) {
        tutorialGrid.appendChild(card);
      });
    }


    /* ============================================================
       11f. SHOW / HIDE CARDS
    ============================================================ */

    const visibleLimit = showAll ? matchedCards.length : CARDS_PER_PAGE;

    matchedCards.forEach(function (card, index) {
      card.style.display = index < visibleLimit ? '' : 'none';
    });


    /* ============================================================
       11g. LOAD ALL BUTTON
    ============================================================ */

    if (loadAllBtn) {
      const hasMore = matchedCards.length > CARDS_PER_PAGE;

      loadAllBtn.classList.toggle('hidden', !hasMore);
      loadAllBtn.textContent = showAll ? 'Show Less' : 'Load All';
    }


    /* ============================================================
       11h. NO RESULTS
    ============================================================ */

    const visibleCards = Math.min(visibleLimit, matchedCards.length);
    let noResults = document.getElementById('noTutorialResults');

    if (visibleCards === 0) {
      if (!noResults && tutorialGrid) {
        noResults = document.createElement('p');
        noResults.id = 'noTutorialResults';
        noResults.textContent = 'No tutorials found. Try another search or category.';
        noResults.style.textAlign = 'center';
        noResults.style.gridColumn = '1 / -1';
        noResults.style.padding = '40px 20px';
        noResults.style.color = 'var(--text-muted)';
        tutorialGrid.appendChild(noResults);
      }

      if (noResults) {
        noResults.style.display = 'block';
      }
    } else {
      if (noResults) {
        noResults.style.display = 'none';
      }
    }
  }


  /* ==============================================================
     11i. CATEGORY FILTER BUTTONS
  ============================================================== */

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (button) {
        button.classList.remove('active');
      });

      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      showAll = false;
      filterTutorials();
    });
  });


  /* ==============================================================
     11j. SEARCH
  ============================================================== */

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      showAll = false;
      filterTutorials();
    });
  }


  /* ==============================================================
     11k. SORT
  ============================================================== */

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      filterTutorials();
    });
  }


  /* ==============================================================
     11l. LOAD ALL
  ============================================================== */

  if (loadAllBtn) {
    loadAllBtn.addEventListener('click', function () {
      showAll = !showAll;
      filterTutorials();
    });
  }


  /* ==============================================================
     11m. TUTORIAL MODAL
  ============================================================== */

  const modal = setupModal('tutorialModalOverlay', 'tutorialModalClose');

  const modalIframe = document.getElementById('tutorialModalIframe');
  const modalBadges = document.getElementById('tutorialModalBadges');
  const modalTitle = document.getElementById('tutorialModalTitle');
  const modalDesc = document.getElementById('tutorialModalDesc');
  const modalCredit = document.getElementById('tutorialModalCredit');
  const modalSteps = document.getElementById('tutorialModalSteps');
  const modalDuration = document.getElementById('tutorialModalDuration');
  const modalSoftware = document.getElementById('tutorialModalSoftware');
  const modalOutcome = document.getElementById('tutorialModalOutcome');


  /* ==============================================================
     11n. MODAL OPEN
  ============================================================== */

  if (modal) {
    modal.overlay._onClose = function () {
      if (modalIframe) {
        modalIframe.src = '';
      }
    };

    tutorialCards.forEach(function (card) {
      card.addEventListener('click', function (event) {
        if (event.target.closest('button') || event.target.closest('a')) {
          return;
        }

        const videoId = card.dataset.video || '';
        const title = card.dataset.title || 'Tutorial';
        const description = card.dataset.desc || '';
        const credit = card.dataset.credit || '';
        const infoValues = card.querySelectorAll('.tutorial-info .info-value');
        let duration = '';
        let software = '';
        let outcome = '';

        if (infoValues.length >= 3) {
          duration = infoValues[0].textContent.trim();
          software = infoValues[1].textContent.trim();
          outcome = infoValues[2].textContent.trim();
        }


        /* ========================================================
           11o. YOUTUBE
        ======================================================== */

        if (modalIframe && videoId) {
          modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }


        /* ========================================================
           11p. BADGES
        ======================================================== */

        if (modalBadges) {
          const cardMeta = card.querySelector('.tutorial-meta');
          modalBadges.innerHTML = cardMeta ? cardMeta.innerHTML : '';
        }


        /* ========================================================
           11q. TEXT
        ======================================================== */

        if (modalTitle) {
          modalTitle.textContent = title;
        }

        if (modalDesc) {
          modalDesc.textContent = description;
        }

        if (modalCredit) {
          modalCredit.textContent = credit ? `Video: ${credit}` : '';
        }

        if (modalDuration) {
          modalDuration.textContent = duration;
        }

        if (modalSoftware) {
          modalSoftware.textContent = software;
        }

        if (modalOutcome) {
          modalOutcome.textContent = outcome;
        }


        /* ========================================================
           11r. STEPS
        ======================================================== */

        if (modalSteps) {
          const steps = card.querySelector('.tutorial-steps');
          modalSteps.innerHTML = steps ? steps.innerHTML : '';
        }


        /* ========================================================
           11s. GITHUB RESOURCE
        ======================================================== */

        const resourceRow = document.getElementById('tutorialModalResourceRow');
        const resourceLink = document.getElementById('tutorialModalResource');

        if (resourceRow) {
          resourceRow.hidden = true;
        }

        const tool = card.dataset.tool;

        if (tool) {
          fetchRelatedResource(tool, function (repo) {
            if (resourceLink) {
              resourceLink.innerHTML = `
                <span class="resource-name">${repo.full_name}</span>
                <span class="resource-stars">★ ${formatStarCount(repo.stargazers_count)} stars</span>
                <span class="resource-action">View on GitHub →</span>
              `;
              resourceLink.href = repo.html_url;
            }

            if (resourceRow) {
              resourceRow.hidden = false;
            }
          });
        }


        /* ========================================================
           11t. SOCIAL SHARE
        ======================================================== */

        const shareUrl = card.dataset.id
          ? `${window.location.origin}${window.location.pathname}?tutorial=${encodeURIComponent(card.dataset.id)}`
          : window.location.href;

        renderShareButtons('#tutorialModalShare', title, shareUrl);


        /* ========================================================
           11u. OPEN MODAL
        ======================================================== */

        modal.open();


        /* ========================================================
           11v. SAVE RECENTLY VIEWED
        ======================================================== */

        if (card.dataset.id) {
          saveRecentlyViewed(card.dataset.id);
        }
      });
    });
  }


  /* ==============================================================
     11w. DEEP LINK
  ============================================================== */

  const sharedTutorialId = new URLSearchParams(window.location.search).get('tutorial');

  if (sharedTutorialId) {
    const sharedCard = document.querySelector(`.tutorial-card[data-id="${CSS.escape(sharedTutorialId)}"]`);

    if (sharedCard) {
      sharedCard.click();
    }
  }


  /* ==============================================================
     11x. FEATURED TUTORIAL
  ============================================================== */

  const featuredViewLesson = document.getElementById('featuredViewLesson');

  if (featuredViewLesson) {
    featuredViewLesson.addEventListener('click', function () {
      const featuredCard = document.querySelector('.tutorial-card[data-id="motion-kinetic-typography"]');

      if (featuredCard) {
        featuredCard.click();
      }
    });
  }


  /* ==============================================================
     11y. CHOOSE YOUR PATH CAROUSEL
  ============================================================== */

  const pathTrack = document.getElementById('pathTrack');

  if (pathTrack) {
    const pathCards = Array.from(pathTrack.querySelectorAll('.path-card'));
    const pathPrevBtn = document.getElementById('pathPrev');
    const pathNextBtn = document.getElementById('pathNext');
    const pathDotsWrap = document.getElementById('pathDots');

    let currentPage = 0;
    let totalPages = 1;
    let dots = [];


    /* ============================================================
       11z. GET CARDS PER VIEW
    ============================================================ */

    function getCardsPerView() {
      if (window.innerWidth <= 600) {
        return 1;
      }

      if (window.innerWidth <= 900) {
        return 2;
      }

      return 3;
    }


    /* ============================================================
       11aa. BUILD DOTS
    ============================================================ */

    function buildDots() {
      if (!pathDotsWrap) {
        return;
      }

      pathDotsWrap.innerHTML = '';
      dots = [];

      const cardsPerView = getCardsPerView();

      totalPages = Math.max(1, Math.ceil(pathCards.length / cardsPerView));

      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'path-dot';
        dot.setAttribute('aria-label', `Go to category page ${i + 1}`);

        dot.addEventListener('click', function () {
          goToPage(i);
        });

        pathDotsWrap.appendChild(dot);
        dots.push(dot);
      }
    }


    /* ============================================================
       11ab. GO TO PAGE
    ============================================================ */

    function goToPage(pageIndex) {
      const cardsPerView = getCardsPerView();

      totalPages = Math.max(1, Math.ceil(pathCards.length / cardsPerView));

      currentPage = (pageIndex + totalPages) % totalPages;

      pathTrack.style.transform = `translateX(calc(-${currentPage} * (100% + 35px)))`;

      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === currentPage);
      });
    }


    /* ============================================================
       11ac. PATH ARROW EVENTS
    ============================================================ */

    if (pathPrevBtn) {
      pathPrevBtn.addEventListener('click', function () {
        goToPage(currentPage - 1);
      });
    }

    if (pathNextBtn) {
      pathNextBtn.addEventListener('click', function () {
        goToPage(currentPage + 1);
      });
    }


    /* ============================================================
       11ad. RESIZE HANDLER
    ============================================================ */

    window.addEventListener('resize', function () {
      buildDots();
      goToPage(currentPage);
    });


    /* ============================================================
       11ae. PATH CARD CLICKS
    ============================================================ */

    pathCards.forEach(function (pathCard) {
      pathCard.addEventListener('click', function () {
        const targetFilter = pathCard.dataset.pathFilter;
        const matchingBtn = document.querySelector(`.filter-btn[data-filter="${targetFilter}"]`);

        if (matchingBtn) {
          matchingBtn.click();
        }

        const tutorialSection = document.querySelector('.tutorial-section');

        if (tutorialSection) {
          tutorialSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });


    /* ============================================================
       11af. INITIALIZE CAROUSEL
    ============================================================ */

    buildDots();
    goToPage(0);
  }


  /* ==============================================================
     11ag. INITIAL FILTER
  ============================================================== */

  filterTutorials();


  /* ==============================================================
     11ah. INITIALIZE RECENTLY VIEWED
  ============================================================== */

  renderRecentlyViewed();


  /* ==============================================================
     11ai. CLEAR RECENTLY VIEWED BUTTON
  ============================================================== */

  const clearButton = document.getElementById('clearRecentlyViewed');

  if (clearButton) {
    clearButton.addEventListener('click', clearRecentlyViewed);
  }

});


/* ================================================================
   END OF TUTORIAL.JS
================================================================ */