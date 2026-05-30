// MCA Internship & Guidance Hub - Skills Page Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize common UI shell (active tab 'skills')
  window.MCA_HUB.initCommonUI('skills');

  // Select DOM elements
  const deckGrid = document.getElementById('skills-deck-grid');
  const resultsContainer = document.getElementById('skills-results-container');
  const matchingGrid = document.getElementById('matching-experiences-grid');
  const promptBanner = document.getElementById('skills-prompt-banner');
  const activeLabel = document.getElementById('active-skill-label');
  const frequencyBadge = document.getElementById('skill-frequency-badge');

  // 1. Fetch internships data
  const internships = await window.MCA_HUB.fetchInternships();
  if (!internships || internships.length === 0) {
    if (deckGrid) deckGrid.innerHTML = '<p class="text-center w-100 text-muted">No database loaded</p>';
    return;
  }

  // 2. Extract and compile skill metrics (frequencies & experiences mapping)
  const skillsMap = {}; // Will hold: { "React": { count: 3, experiences: [...] } }

  internships.forEach(item => {
    if (item.skills && Array.isArray(item.skills)) {
      item.skills.forEach(rawSkill => {
        const skill = rawSkill.trim();
        // Case-preserving but matching standard strings
        const key = Object.keys(skillsMap).find(k => k.toLowerCase() === skill.toLowerCase()) || skill;
        
        if (!skillsMap[key]) {
          skillsMap[key] = {
            count: 0,
            experiences: []
          };
        }
        skillsMap[key].count++;
        skillsMap[key].experiences.push(item);
      });
    }
  });

  // Sort compiled skills by popularity (count descending), then alphabetically
  const sortedSkills = Object.keys(skillsMap).sort((a, b) => {
    if (skillsMap[b].count !== skillsMap[a].count) {
      return skillsMap[b].count - skillsMap[a].count;
    }
    return a.localeCompare(b);
  });

  // 3. Render compiled Skill Cards
  if (deckGrid) {
    deckGrid.innerHTML = sortedSkills.map(skillName => `
      <div class="col">
        <div class="skill-card hover-up h-100 d-flex flex-column align-items-center justify-content-center" data-skill="${skillName}">
          <div class="skill-name text-truncate w-100">${skillName}</div>
          <div class="skill-count">${skillsMap[skillName].count} Review${skillsMap[skillName].count === 1 ? '' : 's'}</div>
        </div>
      </div>
    `).join('');

    // Bind click events to all rendered skill cards
    const cards = deckGrid.querySelectorAll('.skill-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const skill = card.getAttribute('data-skill');
        
        // Toggle active states in DOM
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        // Show matching reviews
        showMatchingExperiences(skill, skillsMap[skill]);
      });
    });
  }

  // 4. Render matching listings sub-routine
  function showMatchingExperiences(skillName, skillData) {
    if (!resultsContainer || !promptBanner || !matchingGrid || !activeLabel || !frequencyBadge) return;

    // Toggle container view states
    promptBanner.classList.add('d-none');
    resultsContainer.classList.remove('d-none');

    // Update headings
    activeLabel.textContent = skillName;
    frequencyBadge.textContent = `${skillData.count} Match${skillData.count === 1 ? '' : 'es'}`;

    // Render cards
    matchingGrid.innerHTML = skillData.experiences.map(item => {
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
              
              <div class="d-flex flex-wrap gap-2 mb-3">
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
              
              <p class="small text-muted mb-4 line-clamp-3">"${item.advice}"</p>
            </div>
            
            <a href="company.html?id=${item.id}" class="btn btn-crimson-outline w-100 rounded-pill btn-sm mt-auto">
              <i class="fas fa-eye me-1"></i>View Details
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Smooth scroll down to view container
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
