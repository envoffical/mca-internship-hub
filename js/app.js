// MCA Internship & Guidance Hub - Core Global JavaScript

// Global utility functions and state management
window.MCA_HUB = {
  // Fetch internships from internships.json
  fetchInternships: async function() {
    try {
      // If running on local disk (file://), try using pre-loaded global variable first to bypass CORS
      if (window.location.protocol === 'file:' && window.INTERNSHIPS_DATA) {
        return this.normalizeData(window.INTERNSHIPS_DATA);
      }

      const response = await fetch('data/internships.json');
      if (!response.ok) {
        throw new Error(`Failed to load data (Status: ${response.status})`);
      }
      const rawData = await response.json();
      return this.normalizeData(rawData);
    } catch (error) {
      console.warn("Dynamic fetch failed (possibly local CORS). Attempting fallback script:", error);
      if (window.INTERNSHIPS_DATA) {
        return this.normalizeData(window.INTERNSHIPS_DATA);
      }
      console.error("Error loading internships database:", error);
      this.displayErrorAlert();
      return [];
    }
  },

  // Central normalization adapter mapping raw keys to camelCase standard properties
  normalizeData: function(rawData) {
    return rawData.map((item, index) => {
      if (item.id !== undefined && item.internshipCompany !== undefined) {
        return item; // already normalized or mock format
      }

      // Normalize dynamic skills
      const rawSkills = item["What skills, technologies, or projects helped you get selected? (Eg: Java, Python, AWS, Linux, Web Development, Projects, etc.) "] || "";
      let skills = [];
      if (rawSkills && typeof rawSkills === "string") {
        skills = rawSkills.split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0 && s.toLowerCase() !== "n/a");
      } else if (Array.isArray(rawSkills)) {
        skills = rawSkills;
      }

      // Map qualitative rating word to numeric 1-5
      const rawRating = item["How would you rate your overall internship experience in the company?  "] || "";
      let companyRating = 4; // Default Good
      if (typeof rawRating === "string") {
        const lowerRating = rawRating.toLowerCase();
        if (lowerRating.includes("excellent")) companyRating = 5;
        else if (lowerRating.includes("good")) companyRating = 4;
        else if (lowerRating.includes("average")) companyRating = 3;
        else if (lowerRating.includes("below expectations")) companyRating = 2;
      } else if (typeof rawRating === "number") {
        companyRating = rawRating;
      }

      // Map guidance availability
      const guidance = item["Would you be open to helping juniors with internship-related doubts or opportunities?  "] || "";
      let guidanceAvailability = "No, sorry";
      if (typeof guidance === "string") {
        const lowerGuidance = guidance.toLowerCase();
        if (lowerGuidance.includes("yes") || lowerGuidance.includes("definitely")) {
          guidanceAvailability = "Yes, definitely";
        }
      }

      // Parse selection process with multi-OS newline fallbacks
      const selectionProcess = item["Describe the selection process briefly.\r\n(Interview, coding test, tasks, etc.)"] || 
                               item["Describe the selection process briefly.\n(Interview, coding test, tasks, etc.)"] || "Not detailed.";

      return {
        id: index + 1,
        name: item["Name"] ? item["Name"].trim() : "Alumni Mentor",
        emailId: item["Email Id"] ? item["Email Id"].trim() : "",
        mcaBatch: item["MCA Batch  "] ? item["MCA Batch  "].trim() : "N/A",
        internshipCompany: item["Internship Company "] ? item["Internship Company "].trim() : "Unknown Company",
        internshipRole: item[" Internship Role  "] ? item[" Internship Role  "].trim() : "Software Intern",
        companyLocation: item["Company Location"] ? item["Company Location"].trim() : "Remote",
        internshipType: item["Internship Type  "] ? item["Internship Type  "].trim() : "Offline",
        duration: item["Duration "] ? item["Duration "].trim() : "8 Weeks",
        stipend: item["   Stipend  "] ? item["   Stipend  "].trim() : "Unpaid",
        skills: skills,
        selectionProcess: selectionProcess.trim(),
        internshipSource: item["How did you discover or apply for this internship?  "] ? item["How did you discover or apply for this internship?  "].trim() : "Other",
        placementPotential: item["How likely is this internship to lead to placement opportunities?  "] ? item["How likely is this internship to lead to placement opportunities?  "].trim() : "Moderate",
        guidanceAvailability: guidanceAvailability,
        companyRating: companyRating,
        advice: item["Any advice or mistakes juniors should keep in mind while preparing for internships? "] ? 
                item["Any advice or mistakes juniors should keep in mind while preparing for internships? "].trim() : 
                "Focus on sharpening your tech skills, keep communication clear, and start applying early!"
      };
    });
  },

  // Generate star rating HTML string
  generateStarsHTML: function(rating) {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star text-warning"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star text-muted" style="opacity: 0.4;"></i>';
    }
    return starsHTML;
  },

  // Format Stipend Display
  formatStipend: function(stipendString) {
    if (!stipendString) return '<span class="badge badge-custom badge-dark">Not Disclosed</span>';
    const clean = stipendString.trim();
    if (clean.toLowerCase() === 'unpaid') {
      return '<span class="badge badge-custom badge-crimson">Unpaid</span>';
    }
    return `<span class="badge badge-custom badge-crimson"><i class="fas fa-wallet me-1"></i>${clean}</span>`;
  },

  // Display absolute error overlay if data fails
  displayErrorAlert: function() {
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'container my-5 text-center';
      errorDiv.innerHTML = `
        <div class="glass-card p-5 border-danger mx-auto" style="max-width: 600px;">
          <i class="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>
          <h3 class="fw-bold">Database Load Failure</h3>
          <p class="text-muted">We encountered an issue fetching the internship experiences. Please make sure the JSON database is uploaded and you are serving this website from a web server.</p>
          <button class="btn btn-crimson mt-3" onclick="window.location.reload()">
            <i class="fas fa-sync-alt me-2"></i>Retry Connection
          </button>
        </div>
      `;
      mainContainer.innerHTML = '';
      mainContainer.appendChild(errorDiv);
    }
  },

  // Initialize common UI structures
  initCommonUI: function(activePageName) {
    this.renderNavbar(activePageName);
    this.renderFooter();
    this.setupNavbarTransition();
    this.setupPageLoader();
  },

  // Render responsive modern Navbar
  renderNavbar: function(activePage) {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    navbarContainer.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light fixed-top navbar-custom">
        <div class="container">
          <a class="navbar-brand" href="index.html">
            <i class="fas fa-graduation-cap"></i>
            MCA <span>Internship Hub</span>
          </a>
          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mcaHubNavbar" aria-controls="mcaHubNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <i class="fas fa-bars text-dark fs-4"></i>
          </button>
          <div class="collapse navbar-collapse" id="mcaHubNavbar">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 gap-1 mt-3 mt-lg-0">
              <li class="nav-item">
                <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">
                  <i class="fas fa-home me-1 d-lg-none"></i>Home
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'companies' ? 'active' : ''}" href="companies.html">
                  <i class="fas fa-building me-1 d-lg-none"></i>Companies
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'skills' ? 'active' : ''}" href="skills.html">
                  <i class="fas fa-laptop-code me-1 d-lg-none"></i>Skills
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'guidance' ? 'active' : ''}" href="guidance.html">
                  <i class="fas fa-user-friends me-1 d-lg-none"></i>Guidance
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'insights' ? 'active' : ''}" href="insights.html">
                  <i class="fas fa-chart-pie me-1 d-lg-none"></i>Insights
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `;
  },

  // Render professional dark Footer
  renderFooter: function() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    const currentYear = new Date().getFullYear();
    footerContainer.innerHTML = `
      <footer class="footer-custom">
        <div class="container">
          <div class="row align-items-center gy-4">
            <div class="col-md-6 text-center text-md-start">
              <h5 class="fw-bold text-white mb-2">
                <i class="fas fa-graduation-cap text-danger me-2"></i>MCA Internship & Guidance Hub
              </h5>
              <p class="small text-muted mb-0">
                Built using internship experiences voluntarily shared by MCA alumni to support future batches.
              </p>
            </div>
            <div class="col-md-6">
              <ul class="list-inline text-center text-md-end mb-0">
                <li class="list-inline-item mx-2"><a href="index.html" class="small text-muted">Home</a></li>
                <li class="list-inline-item mx-2"><a href="companies.html" class="small text-muted">Companies</a></li>
                <li class="list-inline-item mx-2"><a href="skills.html" class="small text-muted">Skills</a></li>
                <li class="list-inline-item mx-2"><a href="guidance.html" class="small text-muted">Guidance</a></li>
                <li class="list-inline-item mx-2"><a href="insights.html" class="small text-muted">Insights</a></li>
              </ul>
              <p class="small text-muted text-center text-md-end mt-2 mb-0">
                &copy; ${currentYear} MCA Alumni Community. Made with passion for juniors.
              </p>
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  // Setup dynamic opacity shift on header scroll
  setupNavbarTransition: function() {
    const navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    });
  },

  // Show a premium glassmorphic email modal
  showEmailModal: function(name, email, batch, subject) {
    // Remove existing modal if any
    const existingModal = document.getElementById('custom-email-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal element
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-email-modal';
    modalOverlay.className = 'custom-modal-overlay';
    
    modalOverlay.innerHTML = `
      <div class="custom-modal-card">
        <button class="custom-modal-close-btn" aria-label="Close modal">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-crimson-light text-crimson rounded-circle mb-3" 
               style="width: 60px; height: 60px; background: rgba(158, 27, 35, 0.08); color: var(--primary-red); border: 2px solid rgba(158, 27, 35, 0.15);">
            <i class="fas fa-envelope fs-4"></i>
          </div>
          <h4 class="fw-bold text-dark mb-1">Contact Alumni Mentor</h4>
          <p class="small text-muted mb-0">${name} (MCA Batch of ${batch})</p>
        </div>
        
        <p class="small text-muted text-center">
          You can copy the email address below to contact them, or open your default mail application.
        </p>
        
        <div class="custom-email-box">
          <span class="custom-email-text" id="modal-email-text">${email}</span>
          <button class="custom-copy-btn" id="modal-copy-btn">
            <i class="far fa-copy"></i><span>Copy</span>
          </button>
        </div>
        
        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-outline-secondary w-50 rounded-pill btn-sm py-2" id="modal-cancel-btn">
            Close
          </button>
          <a href="mailto:${email}?subject=${encodeURIComponent(subject)}" class="btn btn-crimson w-50 rounded-pill btn-sm py-2 d-flex align-items-center justify-content-center gap-2">
            <i class="fas fa-paper-plane"></i>Open Mail
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Force reflow and add class to transition
    setTimeout(() => {
      modalOverlay.classList.add('show');
    }, 10);

    // Setup Event Listeners
    const closeBtn = modalOverlay.querySelector('.custom-modal-close-btn');
    const cancelBtn = modalOverlay.querySelector('#modal-cancel-btn');
    const copyBtn = modalOverlay.querySelector('#modal-copy-btn');

    const closeModal = () => {
      modalOverlay.classList.remove('show');
      setTimeout(() => {
        modalOverlay.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close on click outside the card
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // Copy function
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        const icon = copyBtn.querySelector('i');
        const text = copyBtn.querySelector('span');
        
        copyBtn.classList.add('copied');
        icon.className = 'fas fa-check';
        text.textContent = 'Copied!';
        
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          icon.className = 'far fa-copy';
          text.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        // Fallback for older browsers or non-HTTPS local environments
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed'; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          const icon = copyBtn.querySelector('i');
          const text = copyBtn.querySelector('span');
          
          copyBtn.classList.add('copied');
          icon.className = 'fas fa-check';
          text.textContent = 'Copied!';
          
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            icon.className = 'far fa-copy';
            text.textContent = 'Copy';
          }, 2000);
        } catch (copyErr) {
          console.error('Fallback copy failed: ', copyErr);
        }
        document.body.removeChild(textArea);
      }
    });
  },

  // Setup grace loader
  setupPageLoader: function() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    
    // Add small delay to let browser finish laying out elements smoothly
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }, 400);
  }
};
