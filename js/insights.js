// MCA Internship & Guidance Hub - Analytics Dashboard Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize common UI (active tab 'insights')
  window.MCA_HUB.initCommonUI('insights');

  // 1. Fetch internships data
  const internships = await window.MCA_HUB.fetchInternships();
  if (!internships || internships.length === 0) return;

  // 2. Compute KPI Metrics Cards
  const totalCount = internships.length;
  let highestStipend = 0;
  let highestStipendText = "Unpaid";
  let guidanceYesCount = 0;
  let totalRatingSum = 0;

  internships.forEach(item => {
    // Stipend conversion: parse numeric value (e.g. "Above ₹10k" -> 10000)
    let stipendVal = 0;
    if (item.stipend) {
      const match = item.stipend.match(/\d+/);
      if (match) {
        let val = parseInt(match[0], 10);
        if (item.stipend.toLowerCase().includes('k')) {
          val = val * 1000;
        }
        stipendVal = val;
      }
    }
    
    if (stipendVal > highestStipend) {
      highestStipend = stipendVal;
      highestStipendText = item.stipend.trim();
    }
    
    // Guidance check
    if (item.guidanceAvailability === "Yes, definitely") {
      guidanceYesCount++;
    }
    // Rating sum
    totalRatingSum += item.companyRating;
  });

  const optinRate = Math.round((guidanceYesCount / totalCount) * 100);
  const avgRating = (totalRatingSum / totalCount).toFixed(1);

  // Bind metrics to DOM elements
  const stipendBadge = document.getElementById('highest-stipend-badge');
  const optinBadge = document.getElementById('optin-rate-badge');
  const ratingBadge = document.getElementById('average-rating-badge');

  if (stipendBadge) stipendBadge.textContent = highestStipend > 0 ? highestStipendText : "Unpaid";
  if (optinBadge) optinBadge.textContent = `${optinRate}%`;
  if (ratingBadge) ratingBadge.textContent = `${avgRating} / 5`;

  // 3. Global Chart.js Style Defaults Configuration
  Chart.defaults.font.family = "'Poppins', sans-serif";
  Chart.defaults.color = '#4a5568';
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(30, 37, 48, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor = '#ffffff';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;

  // Branding Color Palette Arrays
  const paletteCrimson = [
    '#9e1b23', // Deep Crimson
    '#c8323c', // Cherry Red
    '#e05a64', // Coral/Rose Red
    '#f28e96', // Light Salmon Pink
    '#2d3748', // Dark Slate Grey
    '#4a5568', // Medium Grey
    '#718096', // Light Grey
    '#a0aec0'  // Slate Accent
  ];

  // ----------------------------------------------------
  // CHART 1: Most Common Skills (Horizontal Bar Chart)
  // ----------------------------------------------------
  const skillsCount = {};
  internships.forEach(item => {
    if (item.skills && Array.isArray(item.skills)) {
      item.skills.forEach(skill => {
        const key = skill.trim();
        skillsCount[key] = (skillsCount[key] || 0) + 1;
      });
    }
  });

  // Sort and extract top 8 skills
  const sortedSkills = Object.keys(skillsCount)
    .sort((a, b) => skillsCount[b] - skillsCount[a])
    .slice(0, 8);
  const skillsData = sortedSkills.map(skill => skillsCount[skill]);

  new Chart(document.getElementById('chart-skills'), {
    type: 'bar',
    data: {
      labels: sortedSkills,
      datasets: [{
        label: 'Alumni Placed with Skill',
        data: skillsData,
        backgroundColor: 'rgba(158, 27, 35, 0.85)',
        hoverBackgroundColor: '#9e1b23',
        borderColor: '#9e1b23',
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { drawOnChartArea: false },
          ticks: { precision: 0 }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        }
      }
    }
  });

  // ----------------------------------------------------
  // CHART 2: Internship Locations (Doughnut Chart)
  // ----------------------------------------------------
  const locationCount = {};
  internships.forEach(item => {
    if (item.companyLocation) {
      const loc = item.companyLocation.trim();
      locationCount[loc] = (locationCount[loc] || 0) + 1;
    }
  });

  const locations = Object.keys(locationCount);
  const locationsData = locations.map(loc => locationCount[loc]);

  new Chart(document.getElementById('chart-locations'), {
    type: 'doughnut',
    data: {
      labels: locations,
      datasets: [{
        data: locationsData,
        backgroundColor: paletteCrimson.slice(0, locations.length),
        borderWidth: 2,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 15, padding: 15 }
        }
      },
      cutout: '60%'
    }
  });

  // ----------------------------------------------------
  // CHART 3: Internship Sources (Pie Chart)
  // ----------------------------------------------------
  const sourceCount = {};
  internships.forEach(item => {
    if (item.internshipSource) {
      const src = item.internshipSource.trim();
      sourceCount[src] = (sourceCount[src] || 0) + 1;
    }
  });

  const sources = Object.keys(sourceCount);
  const sourcesData = sources.map(src => sourceCount[src]);

  new Chart(document.getElementById('chart-sources'), {
    type: 'pie',
    data: {
      labels: sources,
      datasets: [{
        data: sourcesData,
        backgroundColor: [
          '#9e1b23', // On-Campus
          '#e05a64', // Off-Campus
          '#2d3748', // Referral
          '#718096'  // LinkedIn
        ],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 10 }
        }
      }
    }
  });

  // ----------------------------------------------------
  // CHART 4: Paid vs Unpaid Internships (Polar Area)
  // ----------------------------------------------------
  let paidCount = 0;
  let unpaidCount = 0;

  internships.forEach(item => {
    const stip = (item.stipend || '').toLowerCase().trim();
    if (stip.includes('unpaid') || stip.includes('no') || stip === '0' || stip === '') {
      unpaidCount++;
    } else {
      paidCount++;
    }
  });

  new Chart(document.getElementById('chart-stipends'), {
    type: 'polarArea',
    data: {
      labels: ['Paid Internships', 'Unpaid Internships'],
      datasets: [{
        data: [paidCount, unpaidCount],
        backgroundColor: [
          'rgba(25, 135, 84, 0.75)', // Green for Paid
          'rgba(158, 27, 35, 0.75)'  // Red for Unpaid
        ],
        borderColor: [
          '#198754',
          '#9e1b23'
        ],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12 }
        }
      },
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        }
      }
    }
  });

  // ----------------------------------------------------
  // CHART 5: Placement Potential (PPO) Distribution (Vertical Bar Chart)
  // ----------------------------------------------------
  let highPPO = 0;
  let mediumPPO = 0;
  let lowPPO = 0;

  internships.forEach(item => {
    const potential = item.placementPotential.toLowerCase();
    if (potential.includes('high')) {
      highPPO++;
    } else if (potential.includes('medium')) {
      mediumPPO++;
    } else {
      lowPPO++;
    }
  });

  new Chart(document.getElementById('chart-potential'), {
    type: 'bar',
    data: {
      labels: ['High Prospects', 'Medium Prospects', 'Low/Variable'],
      datasets: [{
        label: 'Experiences Count',
        data: [highPPO, mediumPPO, lowPPO],
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)', // Success green
          'rgba(255, 193, 7, 0.8)', // Warning gold
          'rgba(158, 27, 35, 0.8)'  // Crimson red
        ],
        borderColor: [
          '#198754',
          '#ffc107',
          '#9e1b23'
        ],
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { drawOnChartArea: false }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { precision: 0 }
        }
      }
    }
  });
});
