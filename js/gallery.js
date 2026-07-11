// Kai's Creations — public gallery script
// Data-driven from content/creations.json. Read-only: no write/upload here.

(function () {
  const CATEGORY_LABELS = { lego: 'Lego', paper: 'Paper Craft', art: 'Art' };

  const galleryEl = document.getElementById('gallery');
  const emptyStateEl = document.getElementById('empty-state');
  const resultCountEl = document.getElementById('result-count');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const chipButtons = Array.from(document.querySelectorAll('.chip'));

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxTags = document.getElementById('lightbox-tags');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxTimerBar = document.getElementById('lightbox-timer-bar');

  let allItems = [];
  let activeCategory = 'all';
  let searchTerm = '';
  let sortMode = 'order';
  let visibleItems = [];
  let lightboxIndex = -1;

  function formatDate(item) {
    if (!item.date) return 'Date unknown';
    const d = new Date(item.date + 'T00:00:00');
    if (isNaN(d.getTime())) return 'Date unknown';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function matchesFilters(item) {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (!searchTerm) return true;
    const haystack = [item.title, ...(item.tags || [])].join(' ').toLowerCase();
    return haystack.includes(searchTerm);
  }

  function sortItems(items) {
    const copy = items.slice();
    switch (sortMode) {
      case 'date-desc':
        return copy.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      case 'date-asc':
        return copy.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      case 'title-asc':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'order':
      default:
        return copy.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  }

  function updateCounts() {
    const counts = { all: allItems.length, lego: 0, paper: 0, art: 0 };
    allItems.forEach((item) => { if (counts[item.category] !== undefined) counts[item.category] += 1; });
    document.getElementById('count-all').textContent = `(${counts.all})`;
    document.getElementById('count-lego').textContent = `(${counts.lego})`;
    document.getElementById('count-paper').textContent = `(${counts.paper})`;
    document.getElementById('count-art').textContent = `(${counts.art})`;
  }

  function render() {
    const filtered = sortItems(allItems.filter(matchesFilters));
    visibleItems = filtered;
    galleryEl.innerHTML = '';

    if (filtered.length === 0) {
      emptyStateEl.classList.add('is-visible');
    } else {
      emptyStateEl.classList.remove('is-visible');
    }

    filtered.forEach((item, idx) => {
      const card = document.createElement('button');
      card.className = 'card';
      card.type = 'button';
      card.style.animationDelay = `${Math.min(idx, 10) * 40}ms`;
      card.setAttribute('data-id', item.id);
      card.setAttribute('aria-label', `Open ${item.title}`);

      const badgeClass = `card__badge--${item.category}`;
      const tagsHtml = (item.tags || []).slice(0, 3).map((t) => `<span class="card__tag">${escapeHtml(t)}</span>`).join('');

      card.innerHTML = `
        <div class="card__media">
          <img src="${escapeAttr(item.thumb || item.image)}" alt="${escapeAttr(item.alt || item.title)}" loading="lazy">
          <span class="card__badge ${badgeClass}">${CATEGORY_LABELS[item.category] || item.category}</span>
          ${item.featured ? '<span class="card__star" title="Featured">⭐</span>' : ''}
        </div>
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(item.title)}</h3>
          <div class="card__meta"><span>${formatDate(item)}</span></div>
          <div class="card__tags">${tagsHtml}</div>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(idx));
      galleryEl.appendChild(card);
    });

    resultCountEl.textContent = filtered.length === allItems.length
      ? `Showing all ${filtered.length} creations`
      : `Showing ${filtered.length} of ${allItems.length} creations`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(str) { return escapeHtml(str); }

  // Slideshow: a line under the lightbox drains over 10s, then auto-advances.
  const SLIDESHOW_MS = 10000;
  let slideshowRaf = null;

  function startSlideshowTimer() {
    stopSlideshowTimer();
    const startTime = performance.now();
    lightboxTimerBar.style.width = '100%';
    function tick(now) {
      const t = (now - startTime) / SLIDESHOW_MS;
      if (t >= 1) { stepLightbox(1); return; } // openLightbox restarts the timer
      lightboxTimerBar.style.width = `${(1 - t) * 100}%`;
      slideshowRaf = requestAnimationFrame(tick);
    }
    slideshowRaf = requestAnimationFrame(tick);
  }

  function stopSlideshowTimer() {
    if (slideshowRaf !== null) cancelAnimationFrame(slideshowRaf);
    slideshowRaf = null;
    lightboxTimerBar.style.width = '100%';
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const item = visibleItems[index];
    if (!item) return;
    lightboxImg.src = item.image;
    lightboxImg.alt = item.alt || item.title;
    lightboxTitle.textContent = item.title;
    lightboxMeta.textContent = `${CATEGORY_LABELS[item.category] || item.category} · ${formatDate(item)}`;
    lightboxTags.innerHTML = (item.tags || []).map((t) => `<span class="card__tag">${escapeHtml(t)}</span>`).join('');
    const firstOpen = !lightbox.classList.contains('is-open');
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (firstOpen) lightboxClose.focus();
    startSlideshowTimer();
  }

  function closeLightbox() {
    stopSlideshowTimer();
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lightboxIndex = -1;
  }

  function stepLightbox(delta) {
    if (lightboxIndex === -1) return;
    const next = (lightboxIndex + delta + visibleItems.length) % visibleItems.length;
    openLightbox(next);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => stepLightbox(-1));
  lightboxNext.addEventListener('click', () => stepLightbox(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  chipButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      chipButtons.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      activeCategory = btn.getAttribute('data-cat');
      render();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  sortSelect.addEventListener('change', (e) => {
    sortMode = e.target.value;
    render();
  });

  function loadManifest() {
    fetch('content/creations.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.items)) throw new Error('Manifest missing items array');
        allItems = data.items.filter((item) => item && item.id && item.image);
        updateCounts();
        render();
      })
      .catch((err) => {
        console.error('Failed to load creations manifest:', err);
        galleryEl.innerHTML = '';
        emptyStateEl.classList.add('is-visible');
        emptyStateEl.querySelector('h2').textContent = "Couldn't load the gallery";
        emptyStateEl.querySelector('p').textContent = 'The creations manifest is missing or invalid. Check content/creations.json.';
        resultCountEl.textContent = '';
      });
  }

  loadManifest();
})();
