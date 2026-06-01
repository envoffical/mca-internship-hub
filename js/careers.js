// MCA Internship & Guidance Hub - Careers Directory Portal Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize common UI elements (active tab 'careers')
  window.MCA_HUB.initCommonUI('careers');

  // DOM elements cache
  const searchTextVal = document.getElementById('search-text');
  const filterRegionVal = document.getElementById('filter-region');
  const filterTypeVal = document.getElementById('filter-type');
  const deckContainer = document.getElementById('careers-deck-container');
  const resultsCounter = document.getElementById('results-counter');
  const resetFiltersBtn = document.getElementById('btn-reset-filters');

  let allCareers = [];

  // 1. Fetch careers data (uses CORS safe fallback load)
  allCareers = await fetchCareers();

  if (allCareers && allCareers.length > 0) {
    // 2. Populate region and hub type filter selections dynamically
    populateFilters(allCareers);

    // 3. Initial render of cards
    updateCareersView(allCareers);
  } else {
    deckContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-database text-muted fa-3x mb-3"></i>
        <h4 class="fw-bold">Careers Database Empty</h4>
        <p class="text-muted">We could not load the placement directory. Please make sure the JSON database is present.</p>
      </div>
    `;
    resultsCounter.textContent = 'Found 0 placement directories';
  }

  // 4. Setup search and filter listeners
  [searchTextVal, filterRegionVal, filterTypeVal].forEach(el => {
    if (el) {
      el.addEventListener('input', applyCareersFilters);
      el.addEventListener('change', applyCareersFilters);
    }
  });

  // 5. Reset button handler
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (searchTextVal) searchTextVal.value = '';
      if (filterRegionVal) filterRegionVal.value = '';
      if (filterTypeVal) filterTypeVal.value = '';
      updateCareersView(allCareers);
    });
  }

  // Fetch helper loading data safely
  async function fetchCareers() {
    try {
      if (window.location.protocol === 'file:' && window.CAREERS_DATA) {
        return window.CAREERS_DATA;
      }
      const response = await fetch('data/careers.json');
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.warn("Dynamic fetch failed, falling back to window.CAREERS_DATA:", e);
      if (window.CAREERS_DATA) {
        return window.CAREERS_DATA;
      }
      return [];
    }
  }

  // Extract unique fields dynamically to populate filter selections
  function populateFilters(data) {
    const uniqueRegions = new Set();
    const uniqueTypes = new Set();

    data.forEach(item => {
      if (item.region) uniqueRegions.add(item.region.trim());
      if (item.type) uniqueTypes.add(item.type.trim());
    });

    // Populate region dropdown sorted alphabetically
    if (filterRegionVal) {
      Array.from(uniqueRegions).sort().forEach(region => {
        const opt = document.createElement('option');
        opt.value = region;
        opt.textContent = region;
        filterRegionVal.appendChild(opt);
      });
    }

    // Populate type dropdown sorted alphabetically
    if (filterTypeVal) {
      Array.from(uniqueTypes).sort().forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        filterTypeVal.appendChild(opt);
      });
    }
  }

  // Filter application pipeline
  function applyCareersFilters() {
    const textQuery = searchTextVal ? searchTextVal.value.toLowerCase().trim() : '';
    const regionFilter = filterRegionVal ? filterRegionVal.value.trim() : '';
    const typeFilter = filterTypeVal ? filterTypeVal.value.trim() : '';

    const filtered = allCareers.filter(item => {
      const matchText = !textQuery || 
        item.name.toLowerCase().includes(textQuery) ||
        item.address.toLowerCase().includes(textQuery) ||
        item.audience.toLowerCase().includes(textQuery) ||
        item.techStack.some(tech => tech.toLowerCase().includes(textQuery));

      const matchRegion = !regionFilter || item.region === regionFilter;
      const matchType = !typeFilter || item.type === typeFilter;

      return matchText && matchRegion && matchType;
    });

    updateCareersView(filtered);
  }

  // Render cards deck UI
  function updateCareersView(careers) {
    if (resultsCounter) {
      resultsCounter.textContent = `Found ${careers.length} career director${careers.length === 1 ? 'y' : 'ies'}`;
    }

    if (careers.length === 0) {
      deckContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="glass-card p-5 border-light mx-auto" style="max-width: 500px;">
            <i class="fas fa-search-minus text-crimson fa-3x mb-3 animate-pulse"></i>
            <h4 class="fw-bold text-dark">No Matching Portals</h4>
            <p class="text-muted">We could not find any placement hubs matching your search criteria. Try clearing some filters.</p>
            <button class="btn btn-crimson btn-sm mt-3 px-4 rounded-pill" onclick="document.getElementById('btn-reset-filters').click()">
              Reset All Filters
            </button>
          </div>
        </div>
      `;
      return;
    }

    deckContainer.innerHTML = careers.map(item => {
      // Determine link action
      const hasDirectUrl = item.careerLink.startsWith('http://') || item.careerLink.startsWith('https://');
      let actionBtnHTML = '';

      if (hasDirectUrl) {
        actionBtnHTML = `
          <a href="${item.careerLink}" target="_blank" class="btn btn-crimson btn-sm rounded-pill w-100 mt-auto d-flex align-items-center justify-content-center gap-2">
            <i class="fas fa-external-link-alt"></i>Visit Career Portal
          </a>
        `;
      } else {
        const searchQuery = `${item.name} careers hiring`;
        actionBtnHTML = `
          <a href="https://www.google.com/search?q=${encodeURIComponent(searchQuery)}" target="_blank" class="btn btn-crimson-outline btn-sm rounded-pill w-100 mt-auto d-flex align-items-center justify-content-center gap-2">
            <i class="fas fa-search"></i>Search Tenant Careers
          </a>
        `;
      }

      return `
        <div class="col-lg-4 col-md-6 col-sm-12 fade-in-entry">
          <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="fw-bold text-dark mb-0 text-break">${item.name}</h5>
              </div>
              <div class="mb-3">
                <span class="badge-custom badge-type" style="font-size: 0.75rem;">${item.type}</span>
              </div>
              
              <div class="mb-3">
                <p class="small text-muted mb-1">
                  <i class="fas fa-map-marker-alt text-crimson me-2"></i><strong>Address:</strong> ${item.address}, ${item.region}
                </p>
                <p class="small text-muted mb-0">
                  <i class="fas fa-users text-crimson me-2"></i><strong>Audience:</strong> ${item.audience}
                </p>
              </div>

              <div class="mb-4">
                <span class="small text-muted d-block mb-2"><strong>Focus Tech Stack:</strong></span>
                <div class="d-flex flex-wrap gap-1">
                  ${item.techStack.map(tech => `<span class="badge badge-custom badge-crimson text-uppercase" style="font-size: 0.68rem; letter-spacing: 0.3px;">${tech}</span>`).join('')}
                </div>
              </div>
            </div>
            
            ${actionBtnHTML}
          </div>
        </div>
      `;
    }).join('');
  }
});
