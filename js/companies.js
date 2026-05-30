// MCA Internship & Guidance Hub - Companies Page Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize core UI shell (navbar active status set to 'companies')
  window.MCA_HUB.initCommonUI('companies');

  // Cache DOM element selectors
  const searchCompanyInput = document.getElementById('search-company');
  const searchRoleInput = document.getElementById('search-role');
  const searchLocationInput = document.getElementById('search-location');
  const deckContainer = document.getElementById('companies-deck-container');
  const resultsCounter = document.getElementById('results-counter');
  const resetFiltersBtn = document.getElementById('btn-reset-filters');

  let allExperiences = [];

  // 1. Fetch internships data
  allExperiences = await window.MCA_HUB.fetchInternships();

  // 2. Initial render
  if (allExperiences && allExperiences.length > 0) {
    updateView(allExperiences);
  } else {
    deckContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-database text-muted fa-3x mb-3"></i>
        <h4 class="fw-bold">No Records Available</h4>
        <p class="text-muted">The internship database is currently empty. Please check back later!</p>
      </div>
    `;
    resultsCounter.textContent = 'Found 0 experiences';
  }

  // 3. Setup real-time dynamic search event listeners
  [searchCompanyInput, searchRoleInput, searchLocationInput].forEach(inputElement => {
    if (inputElement) {
      inputElement.addEventListener('input', applyFilters);
    }
  });

  // 4. Reset filters button event listener
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (searchCompanyInput) searchCompanyInput.value = '';
      if (searchRoleInput) searchRoleInput.value = '';
      if (searchLocationInput) searchLocationInput.value = '';
      updateView(allExperiences);
    });
  }

  // Core filter logic executing case-insensitive substring matches
  function applyFilters() {
    const companyQuery = searchCompanyInput ? searchCompanyInput.value.toLowerCase().trim() : '';
    const roleQuery = searchRoleInput ? searchRoleInput.value.toLowerCase().trim() : '';
    const locationQuery = searchLocationInput ? searchLocationInput.value.toLowerCase().trim() : '';

    const filtered = allExperiences.filter(item => {
      const matchCompany = !companyQuery || item.internshipCompany.toLowerCase().includes(companyQuery);
      const matchRole = !roleQuery || item.internshipRole.toLowerCase().includes(roleQuery);
      const matchLocation = !locationQuery || item.companyLocation.toLowerCase().includes(locationQuery);
      return matchCompany && matchRole && matchLocation;
    });

    updateView(filtered);
  }

  // Sub-routine to update structural DOM elements with grid and counter stats
  function updateView(experiences) {
    // Update count labels
    if (resultsCounter) {
      resultsCounter.textContent = `Found ${experiences.length} experience${experiences.length === 1 ? '' : 's'}`;
    }

    // Handle zero matching items visually
    if (experiences.length === 0) {
      deckContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="glass-card p-5 border-light mx-auto" style="max-width: 500px;">
            <i class="fas fa-search-minus text-crimson fa-3x mb-3 animate-pulse"></i>
            <h4 class="fw-bold text-dark">No Matching Experiences</h4>
            <p class="text-muted">We couldn't find any reviews matching those search terms. Try modifying your queries or resetting filters.</p>
            <button class="btn btn-crimson btn-sm mt-3 px-4 rounded-pill" onclick="document.getElementById('btn-reset-filters').click()">
              Reset All Filters
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Render grid of cards
    deckContainer.innerHTML = experiences.map(item => {
      // Choose an appropriate icon based on internship location/type
      let typeIcon = 'fa-building';
      if (item.internshipType.toLowerCase() === 'remote') {
        typeIcon = 'fa-laptop-house';
      } else if (item.internshipType.toLowerCase() === 'hybrid') {
        typeIcon = 'fa-network-wired';
      }

      return `
        <div class="col-lg-4 col-md-6 col-sm-12 fade-in-entry">
          <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="fw-bold text-dark mb-0">${item.internshipCompany}</h5>
                <div class="rating-stars">
                  ${window.MCA_HUB.generateStarsHTML(item.companyRating)}
                </div>
              </div>
              <p class="fw-semibold text-medium mb-3">
                <i class="fas fa-briefcase text-crimson me-2"></i>${item.internshipRole}
              </p>
              
              <div class="d-flex flex-wrap gap-2 mb-4">
                <span class="badge-custom badge-crimson" title="Duration">
                  <i class="far fa-clock me-1"></i>${item.duration}
                </span>
                <span class="badge-custom badge-location" title="Location">
                  <i class="fas fa-map-marker-alt me-1"></i>${item.companyLocation}
                </span>
                <span class="badge-custom badge-type" title="Work Mode">
                  <i class="fas ${typeIcon} me-1"></i>${item.internshipType}
                </span>
              </div>
            </div>
            
            <a href="company.html?id=${item.id}" class="btn btn-crimson-outline w-100 rounded-pill btn-sm mt-auto">
              <i class="fas fa-info-circle me-1"></i>View Details
            </a>
          </div>
        </div>
      `;
    }).join('');
  }
});
