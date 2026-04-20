/* ============================================================
   BITS Internship Portal — Vanilla JS Application
   ============================================================
   Zero build step. 
   Features:
   - CSV Fetching & Parsing
   - Semantic Scoring via Web Worker (TFJS)
   - Apple-inspired design
   - Real-time search & filtering
   ============================================================ */

(function () {
  'use strict';

  // --- State ---
  let allInternships = [];
  let activeSource = 'all';
  let searchTerm = '';
  let debounceTimer = null;
  let worker = null;

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

  themeBtn.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Worker Management ---
  function initWorker() {
    worker = new Worker('worker.js');
    
    worker.onmessage = function(e) {
      const { type, payload } = e.data;
      
      if (type === 'READY') {
        fetchData();
      }
      
      if (type === 'SCORES_CALCULATED') {
        allInternships.forEach((job, i) => {
          job.match_percentage = payload[i];
        });
        // Initial sort by match percentage
        allInternships.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
        loadingEl.style.display = 'none';
        applyFilters();
      }
    };
    
    worker.postMessage({ type: 'INIT' });
  }

  // --- Fetch & Load JSON ---
  function fetchData() {
    fetch('internships.json')
      .then(response => response.json())
      .then(data => {
        allInternships = data.filter(function (r) {
          return r.company && r.title;
        });
        
        // Ask worker to calculate scores
        if (worker) {
          loadingEl.querySelector('.loader-text').textContent = 'Calculating relevance scores...';
          worker.postMessage({ type: 'GET_SCORES', payload: allInternships });
        } else {
          loadingEl.style.display = 'none';
          renderCards(allInternships);
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        loadingEl.innerHTML = '<p class="loader-text">Failed to load data. Please try again later.</p>';
      });
  }

  // --- Source helpers ---
  function sourceClass(source) {
    if (!source) return 'startup';
    if (source.includes('Structured')) return 'structured';
    if (source.includes('Research'))   return 'research';
    if (source.includes('Open Source')) return 'opensource';
    return 'startup';
  }

  function sourceIcon(source) {
    var cls = sourceClass(source);
    var letters = { structured: '★', research: '◆', opensource: '⟨⟩', startup: '▲' };
    return letters[cls] || '▲';
  }

  // --- Card HTML ---
  function cardHTML(job, index) {
    var cls   = sourceClass(job.source);
    var match = job.match_percentage || 0;
    var isTop = match >= 85 || (job.source || '').includes('Structured') || (job.source || '').includes('Research');
    var delay = Math.min(index * 0.04, 0.6);

    return '<article class="card' + (isTop ? ' top-match' : '') + '" style="animation-delay:' + delay + 's">'
      + '<div class="card-header">'
      +   '<div class="card-icon ' + cls + '">' + sourceIcon(job.source) + '</div>'
      +   '<div class="card-meta">'
      +     '<div class="card-company">' + escapeHTML(job.company) + '</div>'
      +     '<div class="card-title">' + escapeHTML(job.title) + '</div>'
      +     (job.source ? '<span class="card-source-tag tag-' + cls + '">' + escapeHTML(job.source) + '</span>' : '')
      +   '</div>'
      + '</div>'
      + '<div class="card-match-bar mb-4">'
      +   '<div class="match-progress-bg">'
      +     '<div class="match-progress-fill ' + (match >= 85 ? 'high' : '') + '" style="width: ' + match + '%"></div>'
      +   '</div>'
      +   '<div class="match-label">' + match + '% MATCH</div>'
      + '</div>'
      + '<div class="card-details">'
      +   '<div class="card-detail">'
      +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
      +     '<span>' + escapeHTML(job.location || 'India') + '</span>'
      +   '</div>'
      +   '<div class="card-detail">'
      +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
      +     '<span class="card-stipend">' + escapeHTML(job.stipend || 'Competitive') + '</span>'
      +   '</div>'
      +   (job.duration ? '<div class="card-detail">'
      +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
      +     '<span>' + escapeHTML(job.duration) + '</span>'
      +   '</div>' : '')
      + '</div>'
      + (job.requirements ? '<div class="card-req"><p>"' + escapeHTML(job.requirements) + '"</p></div>' : '')
      + '<a href="' + escapeHTML(job.apply_link || '#') + '" target="_blank" rel="noopener noreferrer" class="card-cta ' + (isTop ? 'primary' : 'secondary') + '">'
      +   '<span>Secure Seat</span>'
      +   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
      + '</a>'
    + '</article>';
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // --- Render ---
  function renderCards(data) {
    if (data.length === 0) {
      grid.style.display = 'none';
      emptyEl.style.display = 'block';
      countEl.textContent = '0 roles';
      return;
    }

    emptyEl.style.display = 'none';
    grid.style.display = 'grid';
    countEl.textContent = data.length + ' role' + (data.length !== 1 ? 's' : '') + ' found';

    var html = '';
    for (var i = 0; i < data.length; i++) {
      html += cardHTML(data[i], i);
    }
    grid.innerHTML = html;
  }

  // --- Filter & Search ---
  function applyFilters() {
    var results = allInternships;

    // Source filter
    if (activeSource !== 'all') {
      if (activeSource === 'Remote') {
        results = results.filter(function (j) {
          var loc = (j.location || '').toLowerCase();
          return loc.includes('remote') || loc.includes('work from home');
        });
      } else {
        results = results.filter(function (j) {
          return j.source === activeSource;
        });
      }
    }

    // Text search
    if (searchTerm.trim() !== '') {
      var q = searchTerm.toLowerCase();
      results = results.filter(function (j) {
        var blob = (j.company + ' ' + j.title + ' ' + j.requirements + ' ' + j.location + ' ' + j.source).toLowerCase();
        return blob.includes(q);
      });
    }

    renderCards(results);
  }

  // --- Event Listeners ---
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeSource = btn.getAttribute('data-source');
      applyFilters();
    });
  });

  searchInput.addEventListener('input', function () {
    searchTerm = searchInput.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 200);
  });

  // --- Kick off ---
  initTheme();
  initWorker();

})();
