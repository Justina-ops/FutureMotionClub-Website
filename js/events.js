window.addEventListener('DOMContentLoaded', () => {

  /* ================================================================
     DOM REFS
  ================================================================= */

  const eventCards = document.querySelectorAll('.event-card');

  if (!eventCards.length) return;

  /* ================================================================
     REGISTRATION STORAGE
  ================================================================= */

  function getRegistrations() {
    try {
      return JSON.parse(localStorage.getItem('vf-event-registrations')) || [];
    } catch (_) {
      return [];
    }
  }

  function addRegistration(record) {
    const registrations = getRegistrations();
    registrations.push(record);
    localStorage.setItem('vf-event-registrations', JSON.stringify(registrations));
  }

  function isRegistered(eventId) {
    return getRegistrations().some(record => record.eventId === eventId);
  }


  /* ================================================================
     DRAFT STORAGE
  ================================================================= */

  function saveDraft(eventId, data) {
    sessionStorage.setItem('vf_event_draft_' + eventId, JSON.stringify(data));
  }

  function getDraft(eventId) {
    try {
      return JSON.parse(sessionStorage.getItem('vf_event_draft_' + eventId));
    } catch (_) {
      return null;
    }
  }

  function clearDraft(eventId) {
    sessionStorage.removeItem('vf_event_draft_' + eventId);
  }


  /* ================================================================
     TOAST
  ================================================================= */

  let toastEl = document.getElementById('vfToast');

  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'vfToast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }

  function showToast(message, duration = 3200) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }


  /* ================================================================
     UTILITY FUNCTIONS
  ================================================================= */

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function getStatusLabel(status) {
    const labels = {
      upcoming: 'Upcoming',
      live: 'Live Now',
      soldout: 'Sold Out',
      past: 'Past Event'
    };
    return labels[status] || '';
  }

  function computeStatus(card) {
    if (card.dataset.soldout === 'true') {
      return 'soldout';
    }
    const start = new Date(card.dataset.start).getTime();
    const end = card.dataset.end
      ? new Date(card.dataset.end).getTime()
      : start + 2 * 60 * 60 * 1000;
    const now = Date.now();
    if (now < start) return 'upcoming';
    if (now >= start && now < end) return 'live';
    return 'past';
  }


  /* ================================================================
     SEAT BARS
  ================================================================= */

  eventCards.forEach(card => {
    const fill = card.querySelector('.seats-fill');
    if (!fill) return;
    const total = parseInt(card.dataset.seatsTotal || '0', 10);
    const left = parseInt(card.dataset.seatsLeft || '0', 10);
    if (!total) return;
    const takenPercentage = Math.min(100, Math.max(0, ((total - left) / total) * 100));
    fill.style.width = `${takenPercentage}%`;
  });


  /* ================================================================
     REFRESH CARD
  ================================================================= */

  function refreshCard(card) {
    const status = computeStatus(card);

    // Status badge
    const statusElement = card.querySelector('.event-status');
    if (statusElement) {
      statusElement.textContent = getStatusLabel(status);
      statusElement.className = `event-status status-${status}`;
    }

    card.classList.toggle('is-past', status === 'past');

    // Countdown
    const countdown = card.querySelector('.countdown');
    if (countdown) {
      const start = new Date(card.dataset.start).getTime();
      const now = Date.now();
      const difference = start - now;
      const statusLine = countdown.querySelector('.countdown-status-line');

      if (status === 'live') {
        countdown.classList.add('is-live');
        countdown.classList.remove('is-ended');
        if (statusLine) statusLine.textContent = 'Happening right now';
      } else if (status === 'past') {
        countdown.classList.add('is-ended');
        countdown.classList.remove('is-live');
        if (statusLine) statusLine.textContent = 'This event has ended';
      } else {
        countdown.classList.remove('is-live', 'is-ended');
        const days = Math.floor(difference / 86400000);
        const hours = Math.floor((difference % 86400000) / 3600000);
        const minutes = Math.floor((difference % 3600000) / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);

        const daysEl = countdown.querySelector('.cd-days');
        const hoursEl = countdown.querySelector('.cd-hours');
        const minutesEl = countdown.querySelector('.cd-mins');
        const secondsEl = countdown.querySelector('.cd-secs');

        if (daysEl) daysEl.textContent = pad(Math.max(days, 0));
        if (hoursEl) hoursEl.textContent = pad(Math.max(hours, 0));
        if (minutesEl) minutesEl.textContent = pad(Math.max(minutes, 0));
        if (secondsEl) secondsEl.textContent = pad(Math.max(seconds, 0));
        if (statusLine) statusLine.textContent = 'Starts soon';
      }
    }

    // Register button
    const registerButton = card.querySelector('.btn-register');
    if (!registerButton) return;

    const eventId = card.dataset.id;

    if (isRegistered(eventId)) {
      registerButton.textContent = '✓ Registered';
      registerButton.classList.add('is-registered');
      registerButton.disabled = true;
    } else if (status === 'soldout') {
      registerButton.textContent = 'Sold Out';
      registerButton.disabled = true;
    } else if (status === 'past') {
      registerButton.textContent = 'Registration Closed';
      registerButton.disabled = true;
    } else {
      registerButton.textContent = 'Register Now';
      registerButton.classList.remove('is-registered');
      registerButton.disabled = false;
    }
  }

  function refreshAll() {
    eventCards.forEach(refreshCard);
  }

  refreshAll();
  setInterval(refreshAll, 1000);


  /* ================================================================
     GOOGLE CALENDAR
  ================================================================= */

  function toGoogleCalendarDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  document.querySelectorAll('.btn-calendar').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.event-card');
      if (!card) return;

      const start = card.dataset.start;
      const end = card.dataset.end || new Date(new Date(start).getTime() + 2 * 60 * 60 * 1000).toISOString();

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: card.dataset.title || 'FutureMotion Club Event',
        dates: `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`,
        details: card.dataset.desc || '',
        location: card.dataset.location || ''
      });

      window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    });
  });


  /* ================================================================
     REGISTRATION MODAL
  ================================================================= */

  const overlay = document.getElementById('eventModalOverlay');
  const closeButton = document.getElementById('eventModalClose');
  const cancelButton = document.getElementById('eventModalCancel');
  const modalTitle = document.getElementById('eventModalTitle');
  const modalMeta = document.getElementById('eventModalMeta');
  const draftNote = document.getElementById('eventDraftNote');
  const form = document.getElementById('eventRegForm');
  const errorElement = document.getElementById('eventFormError');
  const eventIdField = document.getElementById('regEventId');
  const nameField = document.getElementById('regName');
  const emailField = document.getElementById('regEmail');
  const phoneField = document.getElementById('regPhone');
  const ticketsField = document.getElementById('regTickets');
  const notesField = document.getElementById('regNotes');
  const agreeField = document.getElementById('regAgree');

  let activeCard = null;

  function openModal(card) {
    if (!card || !overlay) return;

    activeCard = card;
    const eventId = card.dataset.id;

    modalTitle.textContent = `Register — ${card.dataset.title || ''}`;

    const date = new Date(card.dataset.start);
    const formattedDate = date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    modalMeta.textContent = `${formattedDate} · ${card.dataset.location || ''}`;
    eventIdField.value = eventId;
    errorElement.textContent = '';
    errorElement.classList.remove('show');

    const draft = getDraft(eventId);

    if (draft) {
      nameField.value = draft.name || '';
      emailField.value = draft.email || '';
      phoneField.value = draft.phone || '';
      ticketsField.value = draft.tickets || '1';
      notesField.value = draft.notes || '';
      agreeField.checked = false;
      draftNote.hidden = false;
    } else {
      form.reset();
      eventIdField.value = eventId;
      draftNote.hidden = true;
    }

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-locked');

    setTimeout(() => nameField.focus(), 100);
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-locked');
    activeCard = null;
  }

  // Open modal on register button click
  document.querySelectorAll('.btn-register').forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      openModal(button.closest('.event-card'));
    });
  });

  if (closeButton) closeButton.addEventListener('click', closeModal);
  if (cancelButton) cancelButton.addEventListener('click', closeModal);

  if (overlay) {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeModal();
    });
  }


  /* ================================================================
     AUTOSAVE FORM
  ================================================================= */

  [nameField, emailField, phoneField, ticketsField, notesField].forEach(field => {
    if (!field) return;
    field.addEventListener('input', () => {
      if (!activeCard) return;
      saveDraft(activeCard.dataset.id, {
        name: nameField.value,
        email: emailField.value,
        phone: phoneField.value,
        tickets: ticketsField.value,
        notes: notesField.value
      });
      draftNote.hidden = true;
    });
  });


  /* ================================================================
     SUBMIT REGISTRATION
  ================================================================= */

  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();

      if (!nameField.value.trim() || !emailField.value.trim()) {
        errorElement.textContent = 'Please fill in your name and email.';
        errorElement.classList.add('show');
        return;
      }

      if (!agreeField.checked) {
        errorElement.textContent = 'Please open and accept the Terms & Conditions and photography consent.';
        errorElement.classList.add('show');
        return;
      }

      const eventId = eventIdField.value;
      const title = activeCard ? activeCard.dataset.title : '';

      addRegistration({
        eventId,
        eventTitle: title,
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        phone: phoneField.value.trim(),
        tickets: ticketsField.value,
        notes: notesField.value.trim(),
        registeredAt: new Date().toISOString()
      });

      clearDraft(eventId);

      if (activeCard) refreshCard(activeCard);

      closeModal();
      showToast(`You're registered for ${title}!`);
    });
  }


  /* ================================================================
     TERMS & CONDITIONS POPUP
  ================================================================= */

  const termsOverlay = document.getElementById('termsOverlay');
  const termsOpen = document.getElementById('termsOpen');
  const termsClose = document.getElementById('termsClose');
  const termsDone = document.getElementById('termsDone');

  function openTerms() {
    if (!termsOverlay) return;
    termsOverlay.classList.add('open');
    termsOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeTerms() {
    if (!termsOverlay) return;
    termsOverlay.classList.remove('open');
    termsOverlay.setAttribute('aria-hidden', 'true');
  }

  if (termsOpen) termsOpen.addEventListener('click', openTerms);
  if (termsClose) termsClose.addEventListener('click', closeTerms);
  if (termsDone) termsDone.addEventListener('click', closeTerms);

  if (termsOverlay) {
    termsOverlay.addEventListener('click', event => {
      if (event.target === termsOverlay) closeTerms();
    });
  }


  /* ================================================================
     ESCAPE KEY
  ================================================================= */

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    if (termsOverlay && termsOverlay.classList.contains('open')) {
      closeTerms();
      return;
    }

    if (overlay && overlay.classList.contains('open')) {
      closeModal();
    }
  });


  /* ================================================================
     SEARCH + FILTER
  ================================================================= */

  const filterButtons = document.querySelectorAll('.filter-btn');
  const viewButtons = document.querySelectorAll('.view-btn');
  const searchInput = document.getElementById('eventSearch');
  const searchClear = document.getElementById('searchClear');
  const sortSelect = document.getElementById('eventSort');
  const upcomingGrid = document.getElementById('upcomingGrid');
  const upcomingLoadWrap = document.getElementById('upcomingLoadWrap');
  const loadAllUpcomingBtn = document.getElementById('loadAllUpcomingBtn');
  const showLessUpcomingBtn = document.getElementById('showLessUpcomingBtn');
  const pastTimeline = document.getElementById('pastTimeline');
  const upcomingDivider = document.getElementById('upcomingDivider');
  const pastDivider = document.getElementById('pastDivider');

  let currentFilter = 'all';
  let upcomingExpanded = false;

  function isFilterActive() {
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    return currentFilter !== 'all' || searchTerm !== '';
  }

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;
    const filterActive = isFilterActive();

    eventCards.forEach(card => {
      const category = card.dataset.category || '';
      const title = (card.dataset.title || '').toLowerCase();
      const description = (card.dataset.desc || '').toLowerCase();
      const location = (card.dataset.location || '').toLowerCase();

      const matchesFilter = currentFilter === 'all' || category === currentFilter;
      const matchesSearch = searchTerm === '' ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        location.includes(searchTerm);
      const matches = matchesFilter && matchesSearch;

      if (matches) visibleCount++;

      let finalShow = matches;

      if (finalShow && card.classList.contains('upcoming-extra') && !upcomingExpanded && !filterActive) {
        finalShow = false;
      }

      const wrapper = card.closest('.timeline-row') || card;
      wrapper.style.display = finalShow ? '' : 'none';
    });

    const noResults = document.getElementById('noEventResults');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    if (searchClear) {
      searchClear.classList.toggle('show', searchTerm !== '');
    }

    if (upcomingLoadWrap) {
      const hasExtras = upcomingGrid && upcomingGrid.querySelector('.upcoming-extra');
      upcomingLoadWrap.hidden = !hasExtras || filterActive;
    }
  }

  // Filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      applyFilters();
    });
  });

  // View / jump buttons
  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      viewButtons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const targetId = button.dataset.jump;
      const target = targetId && document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Intersection Observer for jump buttons
  if ('IntersectionObserver' in window && pastDivider && upcomingDivider) {
    const jumpObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const isPast = entry.target === pastDivider;
        viewButtons.forEach(button => {
          button.classList.toggle('active', isPast
            ? button.dataset.jump === 'pastDivider'
            : button.dataset.jump === 'upcomingDivider'
          );
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    jumpObserver.observe(upcomingDivider);
    jumpObserver.observe(pastDivider);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      applyFilters();
      searchInput.focus();
    });
  }


  /* ================================================================
     LOAD ALL / SHOW LESS (UPCOMING)
  ================================================================= */

  if (loadAllUpcomingBtn) {
    loadAllUpcomingBtn.addEventListener('click', () => {
      upcomingExpanded = true;
      if (upcomingGrid) upcomingGrid.classList.add('show-extra');
      loadAllUpcomingBtn.hidden = true;
      if (showLessUpcomingBtn) showLessUpcomingBtn.hidden = false;
      applyFilters();
    });
  }

  if (showLessUpcomingBtn) {
    showLessUpcomingBtn.addEventListener('click', () => {
      upcomingExpanded = false;
      if (upcomingGrid) upcomingGrid.classList.remove('show-extra');
      showLessUpcomingBtn.hidden = true;
      if (loadAllUpcomingBtn) loadAllUpcomingBtn.hidden = false;
      applyFilters();
      if (upcomingDivider) {
        upcomingDivider.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }


  /* ================================================================
     PAST EVENT — EXPAND / COLLAPSE
  ================================================================= */

  document.querySelectorAll('.timeline-card .btn-expand-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const timelineItem = button.closest('.timeline-item');
      if (!timelineItem) return;
      const isExpanded = timelineItem.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const label = button.querySelector('.expand-label');
      if (label) {
        label.textContent = isExpanded ? 'Hide Details' : 'View Full Details';
      }
      if (!isExpanded) {
        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });


  /* ================================================================
     SORT
  ================================================================= */

  function getEventStart(card) {
    return new Date(card.dataset.start).getTime();
  }

  function getEventPrice(card) {
    return parseFloat(card.dataset.price || '0');
  }

  function sortByValue(list, sortValue) {
    return list.sort((a, b) => {
      switch (sortValue) {
        case 'date-desc':
          return getEventStart(b.card) - getEventStart(a.card);
        case 'price-asc':
          return getEventPrice(a.card) - getEventPrice(b.card);
        case 'price-desc':
          return getEventPrice(b.card) - getEventPrice(a.card);
        case 'date-asc':
        default:
          return getEventStart(a.card) - getEventStart(b.card);
      }
    });
  }

  function applySort() {
    const sortValue = sortSelect ? sortSelect.value : 'date-asc';

    if (upcomingGrid) {
      const upcomingItems = Array.from(upcomingGrid.querySelectorAll('.event-card')).map(card => ({ card, el: card }));
      sortByValue(upcomingItems, sortValue).forEach((item, index) => {
        item.el.style.order = index + 1;
      });
    }

    if (pastTimeline) {
      const rowItems = Array.from(pastTimeline.querySelectorAll('.timeline-row'))
        .map(row => ({ card: row.querySelector('.event-card'), el: row }))
        .filter(item => item.card);
      sortByValue(rowItems, sortValue).forEach((item, index) => {
        item.el.style.order = index + 1;
      });
    }
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applySort();
      applyFilters();
    });
  }

  applySort();
  applyFilters();


  /* ================================================================
     FEATURED EVENT COUNTDOWN
  ================================================================= */

  const featuredCountdown = document.getElementById('countdown');

  if (featuredCountdown) {
    // Motion Graphics Bootcamp — change this date/time if needed.
    const targetDate = new Date('2026-08-29T19:00:00').getTime();

    function updateFeaturedCountdown() {
      const now = Date.now();
      const difference = targetDate - now;

      const daysEl = document.getElementById('countdownDays');
      const hoursEl = document.getElementById('countdownHours');
      const minutesEl = document.getElementById('countdownMinutes');
      const secondsEl = document.getElementById('countdownSeconds');

      if (difference <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(difference / 86400000);
      const hours = Math.floor((difference % 86400000) / 3600000);
      const minutes = Math.floor((difference % 3600000) / 60000);
      const seconds = Math.floor((difference % 60000) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateFeaturedCountdown();
    setInterval(updateFeaturedCountdown, 1000);
  }


  /* ================================================================
     EVENT SOCIAL SHARE
  ================================================================= */

  const shareOverlay = document.getElementById('eventShareOverlay');
  const shareClose = document.getElementById('eventShareClose');
  const shareTitle = document.getElementById('eventShareTitle');
  const shareDescription = document.getElementById('eventShareDescription');
  const facebookBtn = document.getElementById('shareFacebook');
  const twitterBtn = document.getElementById('shareTwitter');
  const whatsappBtn = document.getElementById('shareWhatsApp');
  const copyBtn = document.getElementById('shareCopy');
  const copyStatus = document.getElementById('shareCopyStatus');

  if (shareOverlay) {
    let currentShareUrl = '';
    let currentShareTitle = '';

    function openShareModal(eventCard) {
      const title = eventCard.dataset.title ||
        eventCard.querySelector('.event-title')?.textContent.trim() ||
        'FutureMotion Event';

      const eventId = eventCard.dataset.id || eventCard.id || '';
      const baseUrl = window.location.href.split('#')[0];
      const shareUrl = eventId ? `${baseUrl}#${eventId}` : baseUrl;

      currentShareUrl = shareUrl;
      currentShareTitle = title;

      shareTitle.innerHTML = `Share this <em>Event</em>`;
      shareDescription.textContent = `Share "${title}" with your friends and classmates.`;

      facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
      whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`;

      copyStatus.classList.remove('show');

      shareOverlay.classList.add('active');
      shareOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('share-modal-open');
    }

    function closeShareModal() {
      shareOverlay.classList.remove('active');
      shareOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('share-modal-open');
    }

    // Share button triggers
    document.querySelectorAll('.btn-share-event').forEach(button => {
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        const eventCard = this.closest('.event-card');
        if (!eventCard) return;
        openShareModal(eventCard);
      });
    });

    // Copy link
    copyBtn.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(currentShareUrl);
        copyStatus.classList.add('show');
        setTimeout(() => copyStatus.classList.remove('show'), 1800);
      } catch (_) {
        // Fallback for browsers that block navigator.clipboard
        const textarea = document.createElement('textarea');
        textarea.value = currentShareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy'); // Deprecated but kept as fallback
        textarea.remove();
        copyStatus.classList.add('show');
        setTimeout(() => copyStatus.classList.remove('show'), 1800);
      }
    });

    shareClose.addEventListener('click', closeShareModal);

    shareOverlay.addEventListener('click', function (event) {
      if (event.target === shareOverlay) closeShareModal();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && shareOverlay.classList.contains('active')) {
        closeShareModal();
      }
    });
  }

});
