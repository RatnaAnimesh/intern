(function () {
  'use strict';

  // --- State ---
  let allInternships = [];
  let filteredInternships = [];
  let cursor = 0;
  const CHUNK_SIZE = 24;
  let activeSource = 'all';
  let searchTerm = '';
  let debounceTimer = null;

  // --- DOM refs ---
  const grid        = document.getElementById('grid');
  const loadingEl   = document.getElementById('loading-state');
  const emptyEl     = document.getElementById('empty-state');
  const countEl     = document.getElementById('result-count');
  const searchInput = document.getElementById('search-input');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const themeBtn    = document.getElementById('theme-toggle');
  const iconMoon    = document.getElementById('icon-moon');
  const iconSun     = document.getElementById('icon-sun');
  const resetBtn    = document.getElementById('reset-filters');

  // --- Theme ---
  function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    applyTheme(saved);
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      iconMoon.style.display = 'none';
      iconSun.style.display  = 'block';
    } else {
      iconMoon.style.display = 'block';
      iconSun.style.display  = 'none';
    }
  }

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Data Loading ---
  async function fetchData() {
    loadingEl.style.display = 'flex';
    grid.style.display = 'none';
    emptyEl.style.display = 'none';
    
    try {
      const response = await fetch('internships.json');
      const data = await response.json();
      allInternships = data.filter(r => r.company && r.title);
      
      // Artificial delay to appreciate the skeletons (optional, but makes it feel "native")
      setTimeout(() => {
        loadingEl.style.display = 'none';
        grid.style.display = 'grid';
        applyFilters();
      }, 800);
      
    } catch (err) {
      console.error('Fetch error:', err);
      loadingEl.innerHTML = '<p class="loader-text" style="text-align:center; width:100%">Failed to load opportunities. Please refresh.</p>';
    }
  }

  // --- Helpers ---
  function sourceClass(source) {
    if (!source) return 'startup';
    const s = source.toLowerCase();
    if (s.includes('structured')) return 'structured';
    if (s.includes('research')) return 'research';
    if (s.includes('open source')) return 'opensource';
    return 'startup';
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // --- Rendering (Chunked) ---
  function renderNextBatch() {
    const batch = filteredInternships.slice(cursor, cursor + CHUNK_SIZE);
    if (batch.length === 0) return;

    const fragment = document.createDocumentFragment();
    batch.forEach((job, index) => {
      let finalLink = job.apply_link || '#';
      if (finalLink.includes('startup.jobs')) {
        finalLink = `https://startup.jobs/?s=${encodeURIComponent(job.company + ' ' + job.title)}`;
      }

      const card = document.createElement('article');
      card.className = 'card';
      const delay = (index * 0.03);
      card.style.animationDelay = `${delay}s`;
      card.innerHTML = `
        <div class="card-header">
          <div class="card-meta">
            <div class="card-company">${escapeHTML(job.company)}</div>
            <h3 class="card-title">${escapeHTML(job.title)}</h3>
            <div class="card-tags">
               <span class="card-tag tag-${sourceClass(job.source)}">${escapeHTML(job.source || 'Internship')}</span>
               ${job.location ? `<span class="card-tag tag-location">${escapeHTML(job.location)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="card-info">
            <div class="info-item">
              <span class="info-label">Stipend</span>
              <span class="info-value accent">${escapeHTML(job.stipend || 'Competitive')}</span>
            </div>
            ${job.duration ? `
            <div class="info-item">
              <span class="info-label">Duration</span>
              <span class="info-value">${escapeHTML(job.duration)}</span>
            </div>` : ''}
          </div>
          ${job.requirements ? `<p class="card-desc">"${escapeHTML(job.requirements)}"</p>` : ''}
        </div>
        <div class="card-footer">
          <a href="${finalLink}" target="_blank" rel="noopener noreferrer" class="cta-link">
            Learn More
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
        </div>
      `;
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    cursor += CHUNK_SIZE;

    // Check if more to load for infinite scroll (optional)
    if (cursor < filteredInternships.length) {
      setupInfiniteScroll();
    }
  }

  let observer;
  function setupInfiniteScroll() {
    if (observer) observer.disconnect();
    
    // Simple sentinel: if the last card is visible, load more
    const lastCard = grid.lastElementChild;
    if (!lastCard) return;

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        renderNextBatch();
      }
    }, { rootMargin: '400px' });
    
    observer.observe(lastCard);
  }

  function applyFilters() {
    cursor = 0;
    grid.innerHTML = '';
    
    let results = allInternships;

    if (activeSource !== 'all') {
      results = results.filter(j => (j.source || '').toLowerCase().includes(activeSource.toLowerCase()));
    }

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      results = results.filter(j => {
        return (j.company + j.title + (j.requirements || '') + (j.location || '')).toLowerCase().includes(q);
      });
    }

    filteredInternships = results;
    countEl.textContent = `${results.length} OPPORTUNITIES`;
    
    if (results.length === 0) {
      emptyEl.style.display = 'block';
      grid.style.display = 'none';
    } else {
      emptyEl.style.display = 'none';
      grid.style.display = 'grid';
      renderNextBatch();
    }
  }

  // --- Listeners ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSource = btn.getAttribute('data-source');
      applyFilters();
    });
  });

  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 250);
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    activeSource = 'all';
    filterBtns.forEach(b => {
      b.classList.remove('active');
      if (b.getAttribute('data-source') === 'all') b.classList.add('active');
    });
    applyFilters();
  });

  // --- Start ---
  initTheme();
  fetchData();

})();
