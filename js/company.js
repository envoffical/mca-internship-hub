// MCA Internship & Guidance Hub - Company Details Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize common UI components (active tab 'companies')
  window.MCA_HUB.initCommonUI('companies');

  const contentContainer = document.getElementById('experience-detail-content');
  if (!contentContainer) return;

  // 1. Parse 'id' from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const rawId = urlParams.get('id');
  const recordId = parseInt(rawId, 10);

  // 2. Fetch internships database
  const internships = await window.MCA_HUB.fetchInternships();

  // 3. Find matching record
  const record = internships.find(item => item.id === recordId);

  // 4. Handle record not found
  if (isNaN(recordId) || !record) {
    contentContainer.innerHTML = `
      <div class="glass-card p-5 text-center my-5 border-danger mx-auto" style="max-width: 600px;">
        <i class="fas fa-search text-danger fa-3x mb-3 animate-pulse"></i>
        <h3 class="fw-bold text-dark">Experience Record Not Found</h3>
        <p class="text-muted">The experience ID "${rawId || 'null'}" you requested does not match any current records in our database.</p>
        <a href="companies.html" class="btn btn-crimson mt-3 px-4 rounded-pill">
          <i class="fas fa-arrow-left me-2"></i>Return to Boards
        </a>
      </div>
    `;
    return;
  }

  // 5. Render details
  document.title = `${record.internshipCompany} - ${record.internshipRole} Review`;

  // Format selection process timeline into items
  let processSteps = [];
  if (record.selectionProcess.includes('->')) {
    processSteps = record.selectionProcess.split('->')
      .map(step => step.trim())
      .filter(step => step.length > 0);
  } else {
    processSteps = record.selectionProcess.split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0);
  }

  const timelineHTML = processSteps.map((step, idx) => {
    // Check if the step starts with "X." (like 1. 2. 3.) or just assign list counts
    const stepLabelMatch = step.match(/^(\d+\.?\s*)(.*)/);
    if (stepLabelMatch) {
      return `
        <div class="timeline-step">
          <h6 class="fw-bold text-dark mb-1">${stepLabelMatch[1]}</h6>
          <p class="text-medium small mb-0">${stepLabelMatch[2]}</p>
        </div>
      `;
    }
    return `
      <div class="timeline-step">
        <h6 class="fw-bold text-dark mb-1">Round ${idx + 1}</h6>
        <p class="text-medium small mb-0">${step}</p>
      </div>
    `;
  }).join('');

  // Format location / type icons
  let locationIcon = 'fa-map-marker-alt';
  let typeIcon = 'fa-building';
  if (record.internshipType.toLowerCase() === 'remote') {
    typeIcon = 'fa-laptop-house';
  } else if (record.internshipType.toLowerCase() === 'hybrid') {
    typeIcon = 'fa-network-wired';
  }

  // Check guidance availability to render the privacy-secure Contact Card
  let contactCardHTML = '';
  if (record.guidanceAvailability === "Yes, definitely") {
    contactCardHTML = `
      <div class="glass-card p-4 border-success mt-4" style="background-color: rgba(25, 135, 84, 0.03);">
        <div class="d-flex align-items-center mb-3">
          <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center me-3 animate-pulse" style="width: 40px; height: 40px;">
            <i class="fas fa-handshake"></i>
          </div>
          <div>
            <h6 class="fw-bold text-dark mb-0">${record.name}</h6>
            <p class="small text-muted mb-0">Alumni Batch of ${record.mcaBatch}</p>
          </div>
        </div>
        <p class="small text-medium mb-3">
          This alumnus has explicitly volunteered to assist juniors. Click below to draft an email query regarding preparation, resources, or general guidance.
        </p>
        <button onclick="window.MCA_HUB.showEmailModal('${record.name.replace(/'/g, "\\'")}', '${record.emailId}', '${record.mcaBatch}', 'MCA Guidance Inquiry - ${record.internshipCompany.replace(/'/g, "\\'")}')" class="btn btn-success w-100 rounded-pill btn-sm">
          <i class="fas fa-envelope me-1"></i>Contact Alumni via Email
        </button>
      </div>
    `;
  } else {
    contactCardHTML = `
      <div class="glass-card p-4 border-light mt-4">
        <div class="d-flex align-items-center mb-3">
          <div class="bg-secondary text-white rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px; opacity: 0.6;">
            <i class="fas fa-user-slash"></i>
          </div>
          <div>
            <h6 class="fw-bold text-muted mb-0">Mentor Contact Inactive</h6>
            <p class="small text-muted mb-0">Direct support not selected</p>
          </div>
        </div>
        <p class="small text-light mb-0">
          This alumnus is currently focused on work duties and did not opt-in for direct email inquiries. Please check their advice section or refer to the <a href="guidance.html" class="text-crimson fw-semibold">Guidance Panel</a> to connect with active mentors.
        </p>
      </div>
    `;
  }

  contentContainer.innerHTML = `
    <!-- Top Showcase Header -->
    <div class="details-header px-4 px-md-5 text-center text-md-start">
      <div class="row align-items-center gy-4">
        <div class="col-md-8">
          <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start align-items-center mb-3">
            <span class="badge badge-custom badge-crimson">Batch ${record.mcaBatch}</span>
            <div class="rating-stars">
              ${window.MCA_HUB.generateStarsHTML(record.companyRating)}
            </div>
          </div>
          <h1 class="fw-extrabold text-dark mb-2">${record.internshipCompany}</h1>
          <h4 class="text-medium fw-semibold">${record.internshipRole}</h4>
        </div>
        <div class="col-md-4 text-center text-md-end">
          <span class="badge-custom fs-5 px-4 py-2 border rounded-pill ${record.internshipType.toLowerCase() === 'remote' ? 'badge-type' : 'badge-location'}">
            <i class="fas ${locationIcon} me-2"></i>${record.companyLocation}
          </span>
        </div>
      </div>
    </div>

    <!-- Info Metrics Row -->
    <div class="row g-3 mb-5">
      <div class="col-md-3 col-6">
        <div class="glass-card p-3 text-center h-100">
          <i class="far fa-clock text-crimson mb-2 fs-4"></i>
          <p class="small text-muted mb-1">Duration</p>
          <h6 class="fw-bold text-dark mb-0">${record.duration}</h6>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="glass-card p-3 text-center h-100">
          <i class="fas fa-wallet text-crimson mb-2 fs-4"></i>
          <p class="small text-muted mb-1">Stipend Rate</p>
          <h6 class="fw-bold text-dark mb-0">${record.stipend}</h6>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="glass-card p-3 text-center h-100">
          <i class="fas ${typeIcon} text-crimson mb-2 fs-4"></i>
          <p class="small text-muted mb-1">Work Mode</p>
          <h6 class="fw-bold text-dark mb-0">${record.internshipType}</h6>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="glass-card p-3 text-center h-100">
          <i class="fas fa-route text-crimson mb-2 fs-4"></i>
          <p class="small text-muted mb-1">Source / Channel</p>
          <h6 class="fw-bold text-dark mb-0">${record.internshipSource}</h6>
        </div>
      </div>
    </div>

    <!-- Main Detailed Breakdown -->
    <div class="row g-5">
      
      <!-- Left Column: Core Description and Timeline -->
      <div class="col-lg-8">
        
        <!-- Selection Process Panel -->
        <div class="solid-card p-4 mb-4">
          <h5 class="details-section-title">
            <i class="fas fa-tasks"></i>Selection Process & Rounds
          </h5>
          <div class="timeline-process mt-4">
            ${timelineHTML}
          </div>
        </div>

        <!-- Placement Potential -->
        <div class="solid-card p-4 mb-4">
          <h5 class="details-section-title">
            <i class="fas fa-star-of-life"></i>Placement Potential (PPO)
          </h5>
          <p class="text-medium mb-0">${record.placementPotential}</p>
        </div>

        <!-- Alumni Advice Block -->
        <div class="solid-card p-4 mb-4">
          <h5 class="details-section-title">
            <i class="fas fa-comment-dots"></i>Advice for Aspirants
          </h5>
          <div class="wisdom-card bg-light border-0 shadow-none m-0 rounded-4">
            <p class="wisdom-text mb-0">"${record.advice}"</p>
          </div>
        </div>

      </div>

      <!-- Right Column: Skills list and Contact Info -->
      <div class="col-lg-4">
        
        <!-- Skills Tag Deck -->
        <div class="solid-card p-4">
          <h5 class="details-section-title">
            <i class="fas fa-laptop-code"></i>Skills Required
          </h5>
          <div class="d-flex flex-wrap gap-2 mt-3">
            ${record.skills.map(skill => `<span class="badge badge-custom badge-crimson text-uppercase">${skill}</span>`).join('')}
          </div>
        </div>

        <!-- Mentorship Connect Deck -->
        ${contactCardHTML}

      </div>
    </div>
  `;
});
