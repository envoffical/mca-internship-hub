// MCA Internship & Guidance Hub - Guidance Page Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize common UI shell (active tab 'guidance')
  window.MCA_HUB.initCommonUI('guidance');

  // Select DOM elements
  const searchInput = document.getElementById('mentor-search');
  const deckContainer = document.getElementById('mentors-deck-container');
  const mentorsCounter = document.getElementById('mentors-counter');

  let activeMentors = [];

  // 1. Fetch internships database
  const internships = await window.MCA_HUB.fetchInternships();

  // 2. Perform strict filtering: Only alumni open to guidance are listed
  activeMentors = internships.filter(item => item.guidanceAvailability === "Yes, definitely");

  // 3. Initial render
  if (activeMentors && activeMentors.length > 0) {
    updateView(activeMentors);
  } else {
    deckContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-user-shield text-muted fa-3x mb-3"></i>
        <h4 class="fw-bold">No Active Mentors</h4>
        <p class="text-muted">There are currently no active mentors listed. Check back as new reviews get uploaded!</p>
      </div>
    `;
    if (mentorsCounter) mentorsCounter.textContent = '0 Active Community Mentors';
  }

  // 4. Setup search query event listener
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Core filtering routine searching by company or graduating batch
  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = activeMentors.filter(item => {
      const matchCompany = item.internshipCompany.toLowerCase().includes(query);
      const matchBatch = item.mcaBatch.toLowerCase().includes(query);
      const matchName = item.name.toLowerCase().includes(query);
      return !query || matchCompany || matchBatch || matchName;
    });

    updateView(filtered);
  }

  // Sub-routine to update structural DOM elements with grid and counter stats
  function updateView(mentors) {
    // Update count labels
    if (mentorsCounter) {
      mentorsCounter.textContent = `${mentors.length} Active Community Mentor${mentors.length === 1 ? '' : 's'}`;
    }

    // Handle zero matches
    if (mentors.length === 0) {
      deckContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="glass-card p-5 border-light mx-auto" style="max-width: 500px;">
            <i class="fas fa-user-slash text-crimson fa-3x mb-3"></i>
            <h4 class="fw-bold text-dark">No Mentors Match Your Search</h4>
            <p class="text-muted">Try searching for alternative company names or graduation batches (e.g. 2023 or 2024).</p>
            <button class="btn btn-crimson btn-sm mt-3 px-4 rounded-pill" onclick="document.getElementById('mentor-search').value = ''; document.getElementById('mentor-search').dispatchEvent(new Event('input'))">
              Show All Mentors
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Render list
    deckContainer.innerHTML = mentors.map(item => {
      // Extract initials for circular avatar layouts
      const names = item.name.split(' ');
      const initials = names.map(n => n[0]).join('').substring(0, 2).toUpperCase();

      return `
        <div class="col-lg-4 col-md-6 col-sm-12 fade-in-entry">
          <div class="glass-card mentor-card h-100 d-flex flex-column justify-content-between">
            <div>
              <!-- Pulsing active indicator -->
              <span class="pulse-badge" title="Verified active volunteer">Open for Help</span>
              
              <!-- Avatar Initials & Identity Row -->
              <div class="d-flex align-items-center mb-4">
                <div class="d-flex align-items-center justify-content-center fw-bold fs-5 me-3 rounded-circle" 
                     style="width: 55px; height: 55px; background: rgba(158, 27, 35, 0.08); color: var(--primary-red); border: 2px solid rgba(158, 27, 35, 0.15);">
                  ${initials}
                </div>
                <div>
                  <h5 class="fw-bold text-dark mb-0">${item.name}</h5>
                  <p class="small text-muted mb-0">MCA Batch of ${item.mcaBatch}</p>
                </div>
              </div>

              <!-- Career Status -->
              <div class="solid-card bg-light p-3 border-0 rounded-3 mb-4">
                <p class="small text-muted mb-1" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Current Placement</p>
                <h6 class="fw-bold text-dark mb-1">${item.internshipRole}</h6>
                <p class="small fw-semibold text-crimson mb-0"><i class="fas fa-building me-1"></i>${item.internshipCompany}</p>
              </div>

              <!-- Domain Expertise -->
              <p class="small text-muted mb-2 fw-semibold">Mentoring domains:</p>
              <div class="d-flex flex-wrap gap-2 mb-4">
                ${item.skills.slice(0, 4).map(skill => `<span class="badge badge-custom badge-crimson text-uppercase" style="font-size: 0.7rem;">${skill}</span>`).join('')}
                ${item.skills.length > 4 ? `<span class="badge badge-custom badge-dark" style="font-size: 0.7rem;">+${item.skills.length - 4}</span>` : ''}
              </div>
            </div>

            <!-- Privacy Protected CTA Email Link -->
            <div class="mt-auto">
              <button onclick="window.MCA_HUB.showEmailModal('${item.name.replace(/'/g, "\\'")}', '${item.emailId}', '${item.mcaBatch}', 'MCA Mentorship Request [Batch ${item.mcaBatch}]')" class="btn btn-crimson w-100 rounded-pill btn-sm">
                <i class="fas fa-paper-plane me-2"></i>Contact Alumni
              </button>
              <p class="text-center text-light mt-2 mb-0" style="font-size: 0.7rem;">
                <i class="fas fa-shield-alt me-1"></i>No phone numbers shared. Please maintain professionalism.
              </p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
});
