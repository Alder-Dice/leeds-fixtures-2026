// Leeds United - World Cup 2026 Fixtures Data
const fixtures = [
  { id: 1, player: 'Brenden Aaronson', initials: 'BA', nation: 'USA', flag: '🇺🇸', opponent: 'Paraguay', dateStr: 'June 13', timeStr: '1:00 AM', utcDateTime: '2026-06-13T01:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  { id: 2, player: 'Noah Okafor', initials: 'NO', nation: 'Switzerland', flag: '🇨🇭', opponent: 'Qatar', dateStr: 'June 13', timeStr: '7:00 PM', utcDateTime: '2026-06-13T19:00:00Z', venue: "Levi's Stadium, Santa Clara" },
  { id: 3, player: 'Ao Tanaka', initials: 'AT', nation: 'Japan', flag: '🇯🇵', opponent: 'Netherlands', dateStr: 'June 14', timeStr: '8:00 PM', utcDateTime: '2026-06-14T20:00:00Z', venue: 'AT&T Stadium, Arlington, TX' },
  { id: 4, player: 'Gabriel Gudmundsson', initials: 'GG', nation: 'Sweden', flag: '🇸🇪', opponent: 'Tunisia', dateStr: 'June 15', timeStr: '2:00 AM', utcDateTime: '2026-06-15T02:00:00Z', venue: 'Estadio Akron, Guadalajara, MX' },
  { id: 5, player: 'Noah Okafor', initials: 'NO', nation: 'Switzerland', flag: '🇨🇭', opponent: 'Bosnia & Herzegovina', dateStr: 'June 18', timeStr: '7:00 PM', utcDateTime: '2026-06-18T19:00:00Z', venue: 'Los Angeles Stadium, Los Angeles' },
  { id: 6, player: 'Brenden Aaronson', initials: 'BA', nation: 'USA', flag: '🇺🇸', opponent: 'Australia', dateStr: 'June 19', timeStr: '7:00 PM', utcDateTime: '2026-06-19T19:00:00Z', venue: 'Seattle Stadium, Seattle' },
  { id: 7, player: 'Gabriel Gudmundsson', initials: 'GG', nation: 'Sweden', flag: '🇸🇪', opponent: 'Netherlands', dateStr: 'June 20', timeStr: '5:00 PM', utcDateTime: '2026-06-20T17:00:00Z', venue: 'NRG Stadium, Houston, TX' },
  { id: 8, player: 'Ao Tanaka', initials: 'AT', nation: 'Japan', flag: '🇯🇵', opponent: 'Tunisia', dateStr: 'June 21', timeStr: '4:00 AM', utcDateTime: '2026-06-21T04:00:00Z', venue: 'Estadio BBVA, Guadalupe, MX' },
  { id: 9, player: 'Noah Okafor', initials: 'NO', nation: 'Switzerland', flag: '🇨🇭', opponent: 'Canada', dateStr: 'June 24', timeStr: '7:00 PM', utcDateTime: '2026-06-24T19:00:00Z', venue: 'BC Place, Vancouver, CAN' },
  { id: 10, player: 'Ao Tanaka', initials: 'AT', nation: 'Japan', flag: '🇯🇵', opponent: 'Sweden', dateStr: 'June 25', timeStr: '11:00 PM', utcDateTime: '2026-06-25T23:00:00Z', venue: 'AT&T Stadium, Arlington, TX' },
  { id: 11, player: 'Gabriel Gudmundsson', initials: 'GG', nation: 'Sweden', flag: '🇸🇪', opponent: 'Japan', dateStr: 'June 25', timeStr: '11:00 PM', utcDateTime: '2026-06-25T23:00:00Z', venue: 'AT&T Stadium, Arlington, TX' },
  { id: 12, player: 'Brenden Aaronson', initials: 'BA', nation: 'USA', flag: '🇺🇸', opponent: 'Turkey', dateStr: 'June 26', timeStr: '2:00 AM', utcDateTime: '2026-06-26T02:00:00Z', venue: 'SoFi Stadium, Los Angeles' }
];

// App State
let activeFilters = {
  player: null,    // Null means all players
  search: ''
};
let isLocalTimezone = false;
let countdownInterval = null;
let currentPredictions = JSON.parse(localStorage.getItem('lufc_wc2026_preds')) || {};

// DOM Elements
const fixturesListEl = document.getElementById('fixtures-list');
const timezoneToggleBtn = document.getElementById('timezone-toggle');
const tzBtnTextEl = document.getElementById('tz-btn-text');
const resultsCountEl = document.getElementById('results-count');
const searchInput = document.getElementById('search-input');
const playerSummaryCards = document.querySelectorAll('.player-summary-card');

// Modal Elements
const predictionModal = document.getElementById('prediction-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalSaveBtn = document.getElementById('modal-save-btn');
const predScore1Input = document.getElementById('pred-score-1');
const predScore2Input = document.getElementById('pred-score-2');
const matchNotesTextarea = document.getElementById('match-notes');
let activeEditingFixtureId = null;

// Initialize Application
function init() {
  setupEventListeners();
  renderFixtures();
  updateHeroSection();
}

// Event Listeners
function setupEventListeners() {
  // Timezone Toggle
  timezoneToggleBtn.addEventListener('click', () => {
    isLocalTimezone = !isLocalTimezone;
    tzBtnTextEl.textContent = isLocalTimezone ? 'Switch to GMT Time' : 'Switch to Local Time';
    document.getElementById('hero-tz-indicator').textContent = isLocalTimezone 
      ? `Local Time (${Intl.DateTimeFormat().resolvedOptions().timeZone})` 
      : 'All times in GMT';
    renderFixtures();
    updateHeroSection();
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    activeFilters.search = e.target.value.toLowerCase().trim();
    renderFixtures();
  });



  // Player Selection Cards
  playerSummaryCards.forEach(card => {
    card.addEventListener('click', () => {
      const player = card.getAttribute('data-player');
      if (activeFilters.player === player) {
        // Toggle off
        activeFilters.player = null;
        card.classList.remove('active-filter');
      } else {
        // Clear all active classes
        playerSummaryCards.forEach(c => c.classList.remove('active-filter'));
        // Toggle on
        activeFilters.player = player;
        card.classList.add('active-filter');
      }
      renderFixtures();
      updateHeroSection();
    });
  });

  // Modal Events
  modalCloseBtn.addEventListener('click', hidePredictionModal);
  modalCancelBtn.addEventListener('click', hidePredictionModal);
  modalSaveBtn.addEventListener('click', savePrediction);

  // Close modal on background click
  predictionModal.addEventListener('click', (e) => {
    if (e.target === predictionModal) {
      hidePredictionModal();
    }
  });
}



// Time Formatting Helpers
function formatMatchDateTime(utcDateStr) {
  const date = new Date(utcDateStr);
  if (isLocalTimezone) {
    // Format to local date & time
    const dateOpts = { month: 'short', day: 'numeric', weekday: 'short' };
    const timeOpts = { hour: '2-digit', minute: '2-digit', hour12: true };
    return {
      date: date.toLocaleDateString(undefined, dateOpts),
      time: date.toLocaleTimeString(undefined, timeOpts)
    };
  } else {
    // Format using UTC time matching the sheet
    // e.g. June 13, 1:00 AM GMT
    const dateOpts = { month: 'short', day: 'numeric', timeZone: 'UTC' };
    const timeOpts = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };
    // Format UTC string manually or using timeZone: 'UTC'
    return {
      date: date.toLocaleDateString('en-US', dateOpts),
      time: date.toLocaleTimeString('en-US', timeOpts) + ' GMT'
    };
  }
}

// Render the Fixtures Table
function renderFixtures() {
  fixturesListEl.innerHTML = '';
  const now = new Date();

  // Filter fixtures
  const filtered = fixtures.filter(fix => {
    // 1. Player Filter
    if (activeFilters.player && fix.player !== activeFilters.player) {
      return false;
    }

    // 2. Search Filter
    if (activeFilters.search) {
      const matchesSearch = 
        fix.player.toLowerCase().includes(activeFilters.search) ||
        fix.nation.toLowerCase().includes(activeFilters.search) ||
        fix.opponent.toLowerCase().includes(activeFilters.search) ||
        fix.venue.toLowerCase().includes(activeFilters.search);
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Update counter
  resultsCountEl.textContent = `Showing ${filtered.length} of ${fixtures.length} fixtures`;

  if (filtered.length === 0) {
    fixturesListEl.innerHTML = `
      <div class="glass" style="padding: 40px; text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 12px; display: block; color: var(--accent-color);"></i>
        No matches found matching your filters.
      </div>
    `;
    return;
  }

  // Generate HTML
  filtered.forEach(fix => {
    const fixDate = new Date(fix.utcDateTime);
    const isPast = fixDate < now;
    const formatted = formatMatchDateTime(fix.utcDateTime);
    
    // Check for saved predictions
    const pred = currentPredictions[fix.id];
    let scoreDisplay = '';
    if (pred && (pred.score1 !== '' || pred.score2 !== '')) {
      scoreDisplay = `<span class="badge badge-accent" style="font-size: 0.8rem; padding: 4px 10px;">Pred: ${pred.score1} - ${pred.score2}</span>`;
    }

    const card = document.createElement('div');
    card.className = `fixture-card glass`;
    card.innerHTML = `
      <div class="fix-player-info">
        <div class="player-avatar-small">
          ${fix.initials}
          <span class="flag-badge-small">${fix.flag}</span>
        </div>
        <div class="fix-player-text">
          <h5>${fix.player}</h5>
          <span>${fix.nation}</span>
        </div>
      </div>

      <div class="fix-vs">
        <span class="opp-badge">VS</span>
        <span class="fix-vs-text">${fix.opponent}</span>
      </div>

      <div class="fix-date-time">
        <span class="fix-date">${formatted.date}</span>
        <span class="fix-time">${formatted.time}</span>
      </div>

      <div class="fix-venue" title="${fix.venue}">
        <i class="fa-solid fa-location-dot" style="margin-right: 4px; color: rgba(255,255,255,0.25);"></i>
        ${fix.venue}
      </div>

      <div class="fix-status">
        ${scoreDisplay}
        <span class="status-indicator ${isPast ? 'status-finished' : 'status-upcoming'}">
          ${isPast ? 'Finished' : 'Upcoming'}
        </span>
        <button class="pred-action" onclick="event.stopPropagation(); showPredictionModal(${fix.id})">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </div>
    `;

    // Clicking card opens prediction modal too
    card.addEventListener('click', () => showPredictionModal(fix.id));
    fixturesListEl.appendChild(card);
  });
}

// Find Next Fixture and Update Hero Section + Countdown
function updateHeroSection() {
  const now = new Date();
  
  // Filter fixtures by selected player if active
  const relevantFixtures = activeFilters.player 
    ? fixtures.filter(f => f.player === activeFilters.player)
    : fixtures;

  // Find the first fixture in the future
  let nextFix = relevantFixtures.find(fix => new Date(fix.utcDateTime) > now);
  
  // If all fixtures are past, take the last one
  if (!nextFix && relevantFixtures.length > 0) {
    nextFix = relevantFixtures[relevantFixtures.length - 1];
  }

  const fixDate = new Date(nextFix.utcDateTime);
  const formatted = formatMatchDateTime(nextFix.utcDateTime);

  // Populate UI
  document.getElementById('hero-player-name').textContent = nextFix.player;
  document.getElementById('hero-player-nation').textContent = nextFix.nation;
  document.getElementById('hero-player-initials').textContent = nextFix.initials;
  document.getElementById('hero-player-flag').textContent = nextFix.flag;
  document.getElementById('hero-opponent-name').textContent = nextFix.opponent;
  document.getElementById('hero-date').textContent = formatted.date;
  document.getElementById('hero-time').textContent = formatted.time;
  document.getElementById('hero-venue').textContent = nextFix.venue;

  // Clear existing interval
  if (countdownInterval) clearInterval(countdownInterval);

  if (fixDate > now) {
    // Start countdown
    const runCountdown = () => {
      const current = new Date();
      const diff = fixDate - current;

      if (diff <= 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdown').innerHTML = `<div class="badge badge-accent" style="font-size: 1.2rem; padding: 8px 16px;">MATCH LIVE / FINISHED</div>`;
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
      document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
    };

    runCountdown();
    countdownInterval = setInterval(runCountdown, 1000);
  } else {
    document.getElementById('countdown').innerHTML = `<div class="badge badge-accent" style="font-size: 1.2rem; padding: 8px 16px;">ALL FIXTURES COMPLETED</div>`;
  }
}

// Show Prediction Modal
window.showPredictionModal = function(fixtureId) {
  activeEditingFixtureId = fixtureId;
  const fix = fixtures.find(f => f.id === fixtureId);
  if (!fix) return;

  // Update modal content
  document.getElementById('modal-match-title').textContent = `${fix.player} (${fix.nation}) vs ${fix.opponent}`;
  const formatted = formatMatchDateTime(fix.utcDateTime);
  document.getElementById('modal-match-date').textContent = `${formatted.date} • ${formatted.time} • ${fix.venue}`;
  document.getElementById('modal-player-avatar').textContent = fix.initials;
  document.getElementById('modal-player-team-name').textContent = fix.nation;
  document.getElementById('modal-opponent-team-name').textContent = fix.opponent;

  // Load existing predictions
  const saved = currentPredictions[fixtureId] || { score1: '', score2: '', notes: '' };
  predScore1Input.value = saved.score1;
  predScore2Input.value = saved.score2;
  matchNotesTextarea.value = saved.notes;

  // Display modal
  predictionModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent bg scroll
};

// Hide Prediction Modal
function hidePredictionModal() {
  predictionModal.classList.remove('active');
  document.body.style.overflow = 'auto';
  activeEditingFixtureId = null;
}

// Save Prediction
function savePrediction() {
  if (!activeEditingFixtureId) return;
  
  const score1 = predScore1Input.value.trim();
  const score2 = predScore2Input.value.trim();
  const notes = matchNotesTextarea.value.trim();

  currentPredictions[activeEditingFixtureId] = {
    score1: score1 !== '' ? parseInt(score1) : '',
    score2: score2 !== '' ? parseInt(score2) : '',
    notes: notes
  };

  localStorage.setItem('lufc_wc2026_preds', JSON.stringify(currentPredictions));
  
  hidePredictionModal();
  renderFixtures();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
