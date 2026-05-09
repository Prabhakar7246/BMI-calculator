/* ============================================================
   BMI CALCULATOR — script.js
   Features: calculate, validate, meter, history, theme, units
   ============================================================ */

/* ---------- State ---------- */
let currentUnit = 'metric'; // 'metric' | 'imperial'

/* ---------- DOM Helpers ---------- */
const $  = id => document.getElementById(id);
const el = {
  height       : () => $('height'),
  weight       : () => $('weight'),
  heightInch   : () => $('heightInch'),
  heightUnit   : () => $('heightUnit'),
  weightUnit   : () => $('weightUnit'),
  heightError  : () => $('heightError'),
  weightError  : () => $('weightError'),
  heightInchRow: () => $('heightInchRow'),
  resultPanel  : () => $('resultPanel'),
  bmiValue     : () => $('bmiValue'),
  categoryBadge: () => $('categoryBadge'),
  meterNeedle  : () => $('meterNeedle'),
  feedbackMsg  : () => $('feedbackMsg'),
  suggestionBox: () => $('suggestionBox'),
  historyWrap  : () => $('historyWrap'),
  historyList  : () => $('historyList'),
  themeIcon    : () => $('themeIcon'),
  btnMetric    : () => $('btnMetric'),
  btnImperial  : () => $('btnImperial'),
};

/* ============================================================
   BMI CALCULATION LOGIC
   ============================================================ */

/**
 * Convert input values to kg and metres depending on unit mode.
 * Returns { weightKg, heightM } or null if invalid.
 */
function getConvertedValues() {
  const rawH = parseFloat(el.height().value);
  const rawW = parseFloat(el.weight().value);

  if (currentUnit === 'metric') {
    return {
      weightKg: rawW,
      heightM : rawH / 100
    };
  }

  // Imperial: height = feet (rawH) + inches (rawInch), weight = pounds
  const rawInch = parseFloat(el.heightInch().value) || 0;
  const totalInches = rawH * 12 + rawInch;
  return {
    weightKg: rawW * 0.453592,
    heightM : totalInches * 0.0254
  };
}

/**
 * Core BMI formula: weight(kg) / height(m)^2
 */
function computeBMI(weightKg, heightM) {
  return weightKg / (heightM * heightM);
}

/**
 * Return category object based on BMI value.
 */
function getCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', cls: 'cat-underweight', seg: 0, colour: '#38bdf8' };
  if (bmi < 25)   return { label: 'Normal',      cls: 'cat-normal',      seg: 1, colour: '#4ade80' };
  if (bmi < 30)   return { label: 'Overweight',  cls: 'cat-overweight',  seg: 2, colour: '#fbbf24' };
  return              { label: 'Obese',       cls: 'cat-obese',       seg: 3, colour: '#f87171' };
}

/**
 * Personalised feedback messages per category.
 */
function getFeedback(category) {
  const msgs = {
    Underweight: '⚠️ You are below a healthy weight range. Consider consulting a healthcare provider to build a nutritious plan that helps you reach a healthier weight.',
    Normal     : '✅ Great job! You are within a healthy weight range. Keep maintaining a balanced diet and regular physical activity.',
    Overweight : '⚡ You are slightly above the healthy range. Small lifestyle changes — like walking 30 mins daily and reducing processed food — can make a big difference.',
    Obese      : '🩺 Your BMI is in the obese range. This may increase health risks. Please consult a healthcare professional for personalised guidance.',
  };
  return msgs[category] || '';
}

/**
 * Calculate the healthy weight range for a given height (in metres).
 */
function getHealthyWeightRange(heightM) {
  const minKg = (18.5 * heightM * heightM).toFixed(1);
  const maxKg = (24.9 * heightM * heightM).toFixed(1);
  if (currentUnit === 'imperial') {
    const minLb = (minKg / 0.453592).toFixed(1);
    const maxLb = (maxKg / 0.453592).toFixed(1);
    return `${minLb} – ${maxLb} lb`;
  }
  return `${minKg} – ${maxKg} kg`;
}

/* ============================================================
   VALIDATION
   ============================================================ */
function validate() {
  let valid = true;
  el.heightError().textContent = '';
  el.weightError().textContent = '';

  const h = parseFloat(el.height().value);
  const w = parseFloat(el.weight().value);

  if (!el.height().value.trim() || isNaN(h) || h <= 0) {
    el.heightError().textContent = currentUnit === 'metric' ? 'Enter a valid height in cm.' : 'Enter valid feet.';
    valid = false;
  } else if (currentUnit === 'metric' && (h < 50 || h > 300)) {
    el.heightError().textContent = 'Height must be between 50–300 cm.';
    valid = false;
  } else if (currentUnit === 'imperial' && (h < 1 || h > 9)) {
    el.heightError().textContent = 'Feet must be between 1–9.';
    valid = false;
  }

  if (!el.weight().value.trim() || isNaN(w) || w <= 0) {
    el.weightError().textContent = currentUnit === 'metric' ? 'Enter a valid weight in kg.' : 'Enter valid lb.';
    valid = false;
  } else if (currentUnit === 'metric' && (w < 10 || w > 500)) {
    el.weightError().textContent = 'Weight must be between 10–500 kg.';
    valid = false;
  } else if (currentUnit === 'imperial' && (w < 22 || w > 1100)) {
    el.weightError().textContent = 'Weight must be between 22–1100 lb.';
    valid = false;
  }

  return valid;
}

/* ============================================================
   MAIN CALCULATE FUNCTION
   ============================================================ */
function calculateBMI() {
  if (!validate()) return;

  const { weightKg, heightM } = getConvertedValues();
  const bmi      = computeBMI(weightKg, heightM);
  const cat      = getCategory(bmi);
  const feedback = getFeedback(cat.label);
  const hwRange  = getHealthyWeightRange(heightM);
  const bmiRound = bmi.toFixed(1);

  /* --- Update result UI --- */
  // BMI value with pop animation
  el.bmiValue().textContent = bmiRound;
  el.bmiValue().classList.remove('pop');
  void el.bmiValue().offsetWidth; // reflow
  el.bmiValue().classList.add('pop');

  // Category badge
  el.categoryBadge().textContent = cat.label;
  el.categoryBadge().className   = 'category-badge ' + cat.cls;

  // Feedback message
  el.feedbackMsg().textContent = feedback;

  // Healthy weight suggestion
  el.suggestionBox().innerHTML =
    `<strong>Healthy weight for your height:</strong> ${hwRange}`;

  // Show result panel
  el.resultPanel().classList.remove('hidden');

  // Move needle on meter
  updateMeter(bmi, cat.seg);

  // Save to history
  saveHistory(bmiRound, cat.label, heightM, weightKg);
  renderHistory();
}

/* ============================================================
   METER / NEEDLE
   ============================================================ */
/**
 * Map BMI to a 0–100% position across the meter track.
 * Scale: 10 → 0%, 40+ → 100%
 */
function bmiToPercent(bmi) {
  const min = 10, max = 40;
  const clamped = Math.min(Math.max(bmi, min), max);
  return ((clamped - min) / (max - min)) * 100;
}

function updateMeter(bmi, activeSeg) {
  // Needle position
  const pct = bmiToPercent(bmi);
  el.meterNeedle().style.left = pct + '%';

  // Highlight active segment
  const segs = document.querySelectorAll('.meter-segment');
  segs.forEach((s, i) => {
    s.classList.toggle('active-seg', i === activeSeg);
  });
}

/* ============================================================
   HISTORY — localStorage
   ============================================================ */
const HISTORY_KEY = 'bmi_history';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(bmi, category, heightM, weightKg) {
  const history = loadHistory();
  const entry = {
    bmi, category,
    height: currentUnit === 'metric'
      ? (heightM * 100).toFixed(0) + ' cm'
      : ((heightM / 0.0254 / 12).toFixed(0)) + ' ft',
    weight: currentUnit === 'metric'
      ? weightKg.toFixed(1) + ' kg'
      : (weightKg / 0.453592).toFixed(1) + ' lb',
    date: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  };
  history.unshift(entry);           // newest first
  if (history.length > 8) history.pop(); // keep max 8
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const history = loadHistory();
  const list    = el.historyList();
  list.innerHTML = '';

  if (!history.length) {
    el.historyWrap().style.display = 'none';
    return;
  }
  el.historyWrap().style.display = 'block';

  history.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <span class="hi-bmi">BMI ${item.bmi}</span>
      <span class="hi-cat">${item.category}</span>
      <span class="hi-cat">${item.height} / ${item.weight}</span>
      <span class="hi-date">${item.date}</span>
    `;
    list.appendChild(li);
  });
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

/* ============================================================
   RESET
   ============================================================ */
function resetAll() {
  el.height().value     = '';
  el.weight().value     = '';
  el.heightInch().value = '';
  el.heightError().textContent = '';
  el.weightError().textContent = '';
  el.resultPanel().classList.add('hidden');
}

/* ============================================================
   UNIT SWITCHING
   ============================================================ */
function switchUnit(unit) {
  currentUnit = unit;

  if (unit === 'metric') {
    el.heightUnit().textContent = 'cm';
    el.weightUnit().textContent = 'kg';
    el.height().placeholder     = 'e.g. 175';
    el.weight().placeholder     = 'e.g. 70';
    el.heightInchRow().classList.add('hidden');
    el.btnMetric().classList.add('active');
    el.btnImperial().classList.remove('active');
  } else {
    el.heightUnit().textContent = 'ft';
    el.weightUnit().textContent = 'lb';
    el.height().placeholder     = 'feet';
    el.weight().placeholder     = 'e.g. 154';
    el.heightInchRow().classList.remove('hidden');
    el.btnImperial().classList.add('active');
    el.btnMetric().classList.remove('active');
  }
  resetAll();
}

/* ============================================================
   DARK / LIGHT THEME
   ============================================================ */
function initTheme() {
  const saved = localStorage.getItem('bmi_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light');
    el.themeIcon().textContent = '🌙';
  } else {
    document.body.classList.remove('light');
    el.themeIcon().textContent = '☀️';
  }
  localStorage.setItem('bmi_theme', theme);
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light');
  applyTheme(isLight ? 'dark' : 'light');
}

/* Bind theme button */
$('themeToggle').addEventListener('click', toggleTheme);

/* Allow Enter key to trigger calculation */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') calculateBMI();
});

/* ============================================================
   INIT
   ============================================================ */
(function init() {
  initTheme();
  renderHistory();
  // Hide history section on first load if empty
  if (!loadHistory().length) {
    el.historyWrap().style.display = 'none';
  }
})();
