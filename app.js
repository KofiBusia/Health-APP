/* ═══════════════════════════════════════════
   VitalAge — App Logic
   ═══════════════════════════════════════════ */

'use strict';

// ─── DATA ───────────────────────────────────

const FOOD = {
  eat: [
    {
      cat: 'PROTEINS', color: '#ff6b6b',
      items: [
        { name:'Grilled Fish (Tilapia, Mackerel)', freq:'3-4×/week', portion:'1 piece', time:'Lunch', benefit:'Omega-3s for heart & brain; reduces inflammation' },
        { name:'Chicken (grilled, light soup)', freq:'3-4×/week', portion:'1 piece', time:'Lunch', benefit:'Lean protein preserves muscle mass through your 40s' },
        { name:'Beans & Black-eyed Peas', freq:'2-3×/week', portion:'1 cup cooked', time:'Lunch', benefit:'Plant protein + soluble fiber lowers cholesterol' },
        { name:'Eggs (boiled, scrambled)', freq:'Daily', portion:'2 eggs', time:'Breakfast', benefit:'Complete protein, choline for cognitive function' },
        { name:'Unsalted Groundnuts', freq:'Daily snack', portion:'Small handful', time:'Snack', benefit:'Healthy fats, magnesium, arginine for blood vessels' },
        { name:'Plain Greek Yoghurt', freq:'4-5×/week', portion:'150g', time:'Breakfast', benefit:'Probiotics + calcium + protein — gut & bone health' },
      ]
    },
    {
      cat: 'VEGETABLES', color: '#00e5cc',
      items: [
        { name:'Kontomire (Cocoyam Leaves)', freq:'Daily', portion:'1 cup', time:'Lunch', benefit:'Iron, calcium, folate, vitamin K — bone & blood' },
        { name:'Okra', freq:'3-4×/week', portion:'1 cup', time:'Lunch', benefit:'Mucilage fiber slows glucose absorption — blood sugar control' },
        { name:'Garden Eggs (Eggplant)', freq:'2-3×/week', portion:'2-3 pieces', time:'Lunch/Snack', benefit:'Nasunin antioxidant protects brain cell membranes' },
        { name:'Cabbage & Carrots', freq:'Daily', portion:'1 cup', time:'Lunch', benefit:'Vitamin C + beta-carotene — immune & skin health' },
        { name:'Avocado', freq:'3-4×/week', portion:'½ fruit', time:'Lunch/Snack', benefit:'Monounsaturated fats lower LDL; potassium lowers BP' },
        { name:'Tomatoes, Onions, Peppers', freq:'Daily', portion:'As desired', time:'Cooking', benefit:'Lycopene + quercetin — anti-cancer, anti-inflammatory' },
        { name:'Spinach / Leafy Greens', freq:'Daily', portion:'2 cups raw', time:'Any meal', benefit:'Magnesium, folate, nitrates — blood pressure & energy' },
      ]
    },
    {
      cat: 'COMPLEX CARBS', color: '#ffd700',
      items: [
        { name:'Oats (plain, unsweetened)', freq:'Daily', portion:'½ cup dry', time:'Breakfast', benefit:'Beta-glucan reduces cholesterol by up to 10%' },
        { name:'Brown Rice', freq:'3-4×/week', portion:'½ cup cooked', time:'Lunch', benefit:'Sustained energy, B vitamins, lower glycemic than white' },
        { name:'Sweet Potato', freq:'3×/week', portion:'1 medium', time:'Lunch', benefit:'Beta-carotene, fiber, potassium — anti-inflammatory' },
        { name:'Plantain (boiled only)', freq:'2-3×/week', portion:'1 small', time:'Lunch', benefit:'Resistant starch feeds good gut bacteria' },
        { name:'Yam (boiled)', freq:'2-3×/week', portion:'200g', time:'Lunch', benefit:'Vitamin B6, manganese — hormone & nerve health' },
      ]
    },
    {
      cat: 'SUPERFOODS & DRINKS', color: '#667eea',
      items: [
        { name:'Water', freq:'Continuous', portion:'2.5–3L daily', time:'All day', benefit:'Every metabolic process requires adequate hydration' },
        { name:'Green Tea', freq:'1-2×/day', portion:'250ml', time:'Morning/Afternoon', benefit:'EGCG catechins: fat burning, anti-cancer, brain health' },
        { name:'Ginger Tea', freq:'Daily', portion:'250ml', time:'Morning', benefit:'Gingerols: anti-inflammatory, digestion, immunity' },
        { name:'Moringa (powder/tea)', freq:'4-5×/week', portion:'1 tsp', time:'Morning', benefit:'Complete amino acids, iron 3× spinach, vitamin C' },
        { name:'Turmeric (in cooking)', freq:'Daily', portion:'½ tsp', time:'Cooking', benefit:'Curcumin: most studied natural anti-inflammatory compound' },
        { name:'Cinnamon (in porridge/tea)', freq:'Daily', portion:'½ tsp', time:'Breakfast', benefit:'Lowers blood sugar, reduces insulin resistance' },
      ]
    },
  ],

  avoid: [
    {
      cat: 'SUGARS & SWEET DRINKS', color: '#ff4757', sev: 'avoid',
      items: [
        { name:'Soda (Coke, Pepsi, Fanta, Sprite)', note:'Zero tolerance', impact:'10–15 teaspoons of sugar per can; spikes insulin' },
        { name:'Malt drinks (Malta, Power Malt)', note:'High hidden sugar', impact:'Marketed as healthy — they are not; very high GI' },
        { name:'Packaged juices with added sugar', note:'Make fresh or eat whole fruit', impact:'Liquid sugar with zero fiber = immediate blood glucose spike' },
        { name:'Sugar in tea, coffee, or porridge', note:'Use cinnamon instead', impact:'Trains taste buds to expect sweetness; promotes insulin resistance' },
        { name:'Candy, cakes, sweet biscuits', note:'Special occasions only', impact:'Empty calories + blood sugar rollercoaster = fatigue & cravings' },
      ]
    },
    {
      cat: 'ALCOHOL', color: '#ff4757', sev: 'avoid',
      items: [
        { name:'Beer (all types)', note:'Complete elimination', impact:'Empty calories, liver stress, disrupts deep sleep, raises BP' },
        { name:'Spirits with sugary mixers', note:'Complete elimination', impact:'Double impact: alcohol toxicity + sugar spike simultaneously' },
        { name:'Traditional drinks (pito, akpeteshie)', note:'Complete elimination', impact:'High alcohol, often unregulated content, severe liver stress' },
      ]
    },
    {
      cat: 'PROCESSED & FRIED FOODS', color: '#ff9800', sev: 'limit',
      items: [
        { name:'White bread', note:'Max 1×/month', impact:'High GI, nutrient-stripped; raises blood sugar fast' },
        { name:'Instant noodles', note:'Make fresh soup instead', impact:'Ultra-processed, extremely high sodium, no nutritional value' },
        { name:'Processed meats (sausage, ham)', note:'Choose fresh meat/fish', impact:'WHO Group 1 carcinogen; high sodium, nitrites, saturated fat' },
        { name:'Deep-fried chicken/fish', note:'Choose grilled, steamed, or baked', impact:'Oxidized oils form harmful aldehydes; calorie-dense' },
        { name:'Fried plantain (kelewele, tatale)', note:'Max 1×/week', impact:'Absorbs up to 40% of cooking oil when deep-fried' },
        { name:'Chin-chin, puff-puff, bofrot', note:'Special occasions only', impact:'Deep-fried refined carbs — high GI + high fat simultaneously' },
        { name:'Sugary breakfast cereals', note:'Choose plain oats instead', impact:'Hidden sugar, low fiber, blood sugar crash by 10 AM' },
      ]
    },
    {
      cat: 'EXCESS SALT', color: '#ff9800', sev: 'limit',
      items: [
        { name:'Extra stock cubes (Maggi, Knorr)', note:'½ cube per pot maximum', impact:'Each cube has ~1g sodium — near daily recommended limit' },
        { name:'Adding salt at the table', note:'Use herbs and spices instead', impact:'Sodium accumulation leads to hypertension over time' },
        { name:'Very salty snacks', note:'Choose unsalted groundnuts', impact:'Sodium retention causes bloating and blood pressure spike' },
      ]
    },
  ],

  schedule: [
    { time:'6:30 AM', title:'Wake & Hydrate', desc:'Drink 250–500ml of water immediately. Add a small pinch of sea salt and squeeze of lemon on exercise days to prime electrolytes.', icon:'🌅' },
    { time:'7:00 AM', title:'Morning Movement', desc:'10–15 min of light stretching, walking, or sun salutations. Even brief morning movement regulates cortisol and sets your circadian clock.', icon:'🧘' },
    { time:'7:30 AM', title:'Breakfast', desc:'Plain oats with moringa + cinnamon, or 2 boiled eggs with kontomire. Always include protein at breakfast to maintain muscle mass.', icon:'🍳' },
    { time:'8:00 AM', title:'Morning Supplements', desc:'Take vitamins with food: Vitamin D3 (2000–4000 IU), Omega-3, Magnesium Glycinate. Never on an empty stomach.', icon:'💊' },
    { time:'10:00 AM', title:'Mid-Morning Snack', desc:'Small handful of unsalted groundnuts, garden eggs, or 1 piece of whole fruit. Keeps blood sugar stable until lunch.', icon:'🥜' },
    { time:'12:00 PM', title:'Lunch — Main Meal', desc:'Your largest and most nutrient-dense meal. Grilled fish or chicken + kontomire or okra soup + complex carb. This is when digestive capacity is highest.', icon:'🍽️' },
    { time:'12:15 PM', title:'Herbal Medicine', desc:'Take herbal supplements mid-meal with warm water for optimal absorption and to minimize stomach upset.', icon:'🌿' },
    { time:'3:00 PM', title:'Afternoon Snack (optional)', desc:'Only if genuinely hungry: ½ avocado, boiled egg, or garden eggs. Skip if not hungry — learn to distinguish hunger from boredom.', icon:'🥑' },
    { time:'5:00 PM', title:'Exercise Window', desc:'Football, gym, or 30-min brisk walk. Late afternoon is optimal for physical performance, strength, and fat-burning due to peak body temperature.', icon:'⚽' },
    { time:'6:00 PM', title:'Eating Window Closes', desc:'Stop all food intake. Water, ginger tea, green tea, or plain herbal tea only. This 12–16 hour fast resets insulin sensitivity and autophagy.', icon:'🚫' },
    { time:'7:00 PM', title:'Wind-Down Routine', desc:'Dim lights, avoid screens if possible, read or spend time with family. Reducing blue light exposure 2 hours before bed dramatically improves sleep quality.', icon:'🌙' },
    { time:'9:30 PM', title:'Sleep', desc:'Aim for 7–8 hours. Sleep is when growth hormone surges, muscles repair, memories consolidate, and the glymphatic system clears brain waste.', icon:'😴' },
  ],

  shopping: [
    {
      cat: '🐟 PROTEINS', items: [
        { name:'Fresh tilapia or mackerel', qty:'3–4 pieces' },
        { name:'Chicken (fresh, not processed)', qty:'1–2 pieces' },
        { name:'Eggs', qty:'1–2 dozen' },
        { name:'Unsalted groundnuts', qty:'500g bag' },
        { name:'Dried beans / black-eyed peas', qty:'500g' },
        { name:'Plain Greek yoghurt', qty:'2 tubs' },
      ]
    },
    {
      cat: '🥬 VEGETABLES', items: [
        { name:'Kontomire (cocoyam leaves)', qty:'2–3 bunches' },
        { name:'Okra', qty:'500g' },
        { name:'Garden eggs', qty:'6–8 pieces' },
        { name:'Tomatoes', qty:'1kg' },
        { name:'Onions', qty:'4–5 bulbs' },
        { name:'Cabbage', qty:'1 small head' },
        { name:'Carrots', qty:'500g' },
        { name:'Avocados', qty:'4–6 (buy half-ripe)' },
        { name:'Spinach or lettuce', qty:'1 bunch' },
      ]
    },
    {
      cat: '🌾 CARBS & GRAINS', items: [
        { name:'Plain rolled oats (no flavour)', qty:'1kg bag' },
        { name:'Brown rice', qty:'1–2kg' },
        { name:'Sweet potatoes', qty:'4–6 medium' },
        { name:'Plantain (slightly green)', qty:'3–4 fingers' },
        { name:'Yam', qty:'1 medium tuber' },
      ]
    },
    {
      cat: '🌿 HERBS & SPICES', items: [
        { name:'Fresh ginger root', qty:'200g' },
        { name:'Garlic (whole bulbs)', qty:'3–4 bulbs' },
        { name:'Turmeric powder', qty:'Small jar' },
        { name:'Cinnamon (Ceylon sticks or powder)', qty:'Small jar' },
        { name:'Green tea bags', qty:'1 box (20 bags)' },
        { name:'Moringa powder', qty:'100g bag' },
      ]
    },
    {
      cat: '💊 SUPPLEMENTS', items: [
        { name:'Vitamin D3 (2000–4000 IU)', qty:'Monthly supply' },
        { name:'Omega-3 Fish Oil', qty:'Monthly supply' },
        { name:'Magnesium Glycinate (300–400mg)', qty:'Monthly supply' },
      ]
    },
  ],
};

const HABITS = [
  { id:'noSugar',     icon:'🍬', name:'No Sugar Added', desc:'Avoided added sugar in food & drinks today' },
  { id:'noAlcohol',   icon:'🚫', name:'No Alcohol',     desc:'Completely alcohol-free today' },
  { id:'noLateEat',   icon:'⏰', name:'No Late Eating', desc:'Finished eating before 6:00 PM' },
  { id:'exercise',    icon:'⚽', name:'Exercise Done',  desc:'At least 30 min of physical activity' },
  { id:'vitamins',    icon:'💊', name:'Vitamins Taken', desc:'Took daily supplements with food' },
  { id:'herbalMeds',  icon:'🌿', name:'Herbal Medicine',desc:'Took herbal medicine with warm water' },
  { id:'goodSleep',   icon:'😴', name:'Good Sleep',     desc:'Got 7–8 hours of quality sleep last night' },
];

// Age-based health intelligence
function getAgeData(age, gender) {
  const g = (gender || 'male').toLowerCase();

  const tips = {
    all: [
      `At ${age}, your body needs ${age >= 50 ? '1.2g' : '0.8g'} of protein per kg of body weight daily to preserve muscle mass.`,
      'Drinking water before each meal reduces calorie intake by ~13% naturally.',
      'Sleep deprivation raises cortisol, which directly causes belly fat accumulation.',
      'Walking 7,000–10,000 steps daily reduces all-cause mortality by 50–70%.',
      'Chewing food 20–30 times per bite dramatically improves nutrient absorption and satiety.',
      'Strength training 2–3× per week is the single most powerful anti-aging intervention.',
      'Chronic stress is as harmful as smoking 5 cigarettes a day — manage it actively.',
      'Intermittent fasting (12–16 hour window) improves insulin sensitivity and cellular repair.',
      'The gut microbiome controls 70% of your immune system — eat diverse, fermented foods.',
      'Sunlight on skin for 15–20 min daily is the best source of Vitamin D — a hormone, not just a vitamin.',
      'Deep breathing for 5 minutes lowers blood pressure as effectively as some medications.',
      'Omega-3 fatty acids from fish reduce cardiovascular risk by 28% over 5 years.',
      'Magnesium deficiency affects 75% of people and causes poor sleep, anxiety, and muscle cramps.',
      'Adding turmeric + black pepper together makes curcumin 2,000% more bioavailable.',
      'Your liver regenerates every 3–5 years — but only if you give it a break from alcohol.',
    ],
    20: [
      'Your 20s are your biological investment decade — habits formed now are 3× harder to change later.',
      'Bone density peaks at 25–30. Maximize it now with weight-bearing exercise and calcium.',
      'Your resting metabolic rate will drop ~2% per decade after 25 — build muscle mass now to offset this.',
      'Sleep 8–9 hours. Your prefrontal cortex is still developing until age 25.',
    ],
    30: [
      'Your metabolism has begun slowing. Add strength training 3×/week minimum.',
      'Blood pressure can silently rise in your 30s — check it at least once per year.',
      'Stress-related cortisol spikes in your 30s cause visceral belly fat — prioritize recovery.',
      'Skin collagen production drops 1% per year after 25 — hydration and sleep are your best skincare.',
    ],
    40: [
      `At 40+, testosterone${g === 'female' ? '/estrogen' : ''} declines 1–2% per year. Strength training helps maintain both naturally.`,
      'Visceral fat increases in your 40s — waist under 94cm (men) or 80cm (women) is the critical target.',
      'Your 40s are when lifestyle diseases silently build. Annual blood work is non-negotiable.',
      'Muscle mass declines 3–8% per decade after 30 — prioritize protein at every meal.',
      'Vision changes are normal after 40 — annual eye exams detect early glaucoma and macular issues.',
      'Recovery time after exercise increases in your 40s — rest days are as important as workout days.',
    ],
    50: [
      `${g === 'female' ? 'Perimenopause/menopause' : 'Andropause'} significantly affects energy, sleep, and body composition in your 50s.`,
      'Heart disease risk doubles in your 50s. Know your numbers: BP, LDL, HDL, blood sugar, waist.',
      'Calcium + Vitamin D3 + K2 together protect bone density as hormones decline.',
      'Brain health: learn something new every week — language, instrument, skill. Neuroplasticity is use-it-or-lose-it.',
      'Social connections in your 50s are as protective as quitting smoking 15 cigarettes/day.',
    ],
    60: [
      'Balance exercises (single-leg stand, tai chi) prevent falls — the #1 cause of injury death after 65.',
      'Protein needs actually increase after 60. Aim for 1.2–1.6g per kg body weight.',
      'Hearing loss is underdiagnosed — it accelerates cognitive decline when untreated.',
      'Staying purposeful and socially engaged is the strongest predictor of healthy aging.',
    ],
  };

  const screenings = {
    all: [
      { name:'Blood Pressure', freq:'Every 6–12 months', icon:'🩺', due: age >= 18 },
      { name:'Fasting Blood Sugar (HbA1c)', freq:'Annually', icon:'🩸', due: age >= 35 },
      { name:'Cholesterol Panel (Lipid Profile)', freq:'Every 2–5 years', icon:'❤️', due: age >= 20 },
      { name:'Dental Checkup', freq:'Every 6 months', icon:'🦷', due: true },
      { name:'Eye Exam', freq:'Every 1–2 years', icon:'👁️', due: age >= 40 },
      { name:'Kidney Function (Creatinine, eGFR)', freq:'Annually', icon:'🔬', due: age >= 40 },
      { name:'Colorectal Cancer Screening', freq:'Every 10 years', icon:'🏥', due: age >= 45 },
      { name:'Skin Cancer Check', freq:'Annually', icon:'☀️', due: age >= 40 },
    ],
    male: [
      { name:'Prostate PSA Test', freq:'Annually', icon:'♂️', due: age >= 40 },
      { name:'Testosterone Level Check', freq:'If symptoms present', icon:'⚡', due: age >= 40 },
    ],
    female: [
      { name:'Mammogram', freq:'Annually', icon:'♀️', due: age >= 40 },
      { name:'Cervical Smear (Pap)', freq:'Every 3 years', icon:'🔬', due: age >= 21 },
      { name:'Bone Density (DEXA Scan)', freq:'Baseline at 50', icon:'🦴', due: age >= 50 },
    ],
  };

  const ageTier = age < 30 ? 20 : age < 40 ? 30 : age < 50 ? 40 : age < 60 ? 50 : 60;
  const allTips = [...tips.all, ...(tips[ageTier] || [])];

  const allScreenings = [...screenings.all, ...(screenings[g] || [])].filter(s => s.due);

  const alerts = {
    20: { icon:'🌱', title:'Foundation Decade', msg:'Your 20s are your biological investment window. Habits built now compound for decades. Prioritize sleep, exercise, and whole foods above everything else.' },
    30: { icon:'⚡', title:'Momentum Decade', msg:'Metabolism starts slowing now. Strength training 3×/week is the most powerful anti-aging tool available. Stress management is also critical — cortisol causes belly fat.' },
    40: { icon:'🔬', title:'Awareness Decade', msg:'Lifestyle diseases silently build in your 40s. Annual blood work (sugar, cholesterol, BP) is non-negotiable. Muscle preservation through protein + resistance training is your health insurance.' },
    50: { icon:'🛡️', title:'Protection Decade', msg:'Your 50s require active protection of heart, bones, and brain. Know all your health numbers. Calcium, D3, and weight-bearing exercise are essential. Social connection is medicine.' },
    60: { icon:'🌟', title:'Vitality Decade', msg:`Your 60s can be your most purposeful decade. Focus on balance, strength, brain engagement, and deep social bonds. These predict healthy aging more than almost anything else.` },
  };

  return { tips: allTips, screenings: allScreenings, alert: alerts[ageTier] };
}

// ─── STATE ───────────────────────────────────

const STATE = {
  profile: null,
  logs: {},
  shopChecked: {},
  tipIndex: 0,
  step: 0,
  selectedGender: null,
  selectedGoals: new Set(),
  charts: {},
};

// ─── STORAGE ─────────────────────────────────

const Store = {
  save() {
    localStorage.setItem('va_profile', JSON.stringify(STATE.profile));
    localStorage.setItem('va_logs', JSON.stringify(STATE.logs));
    localStorage.setItem('va_shop', JSON.stringify(STATE.shopChecked));
    localStorage.setItem('va_tipIdx', STATE.tipIndex);
  },
  load() {
    try {
      STATE.profile = JSON.parse(localStorage.getItem('va_profile')) || null;
      STATE.logs = JSON.parse(localStorage.getItem('va_logs')) || {};
      STATE.shopChecked = JSON.parse(localStorage.getItem('va_shop')) || {};
      STATE.tipIndex = parseInt(localStorage.getItem('va_tipIdx')) || 0;
    } catch(e) {
      STATE.profile = null; STATE.logs = {}; STATE.shopChecked = {};
    }
  },
};

// ─── HELPERS ─────────────────────────────────

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function calcAge(dob) {
  const d = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmt(date) {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function toast(msg, dur = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), dur);
}

function getLog() {
  const k = todayKey();
  if (!STATE.logs[k]) {
    STATE.logs[k] = { date: k, waterMl: 0, energy: 5, noSugar: false, noAlcohol: false, noLateEat: false, exercise: false, vitamins: false, herbalMeds: false, goodSleep: false, waist: '', weight: '', notes: '' };
  }
  return STATE.logs[k];
}

function calcScore(log) {
  if (!log) return 0;
  const habits = ['noSugar','noAlcohol','noLateEat','exercise','vitamins','herbalMeds','goodSleep'];
  const done = habits.filter(h => log[h]).length;
  const habitScore = (done / habits.length) * 50;
  const waterScore = Math.min(log.waterMl / 2500, 1) * 25;
  const energyScore = ((log.energy || 5) / 10) * 15;
  return Math.round(Math.min(100, 10 + habitScore + waterScore + energyScore));
}

function calcStreak() {
  const keys = Object.keys(STATE.logs).sort().reverse();
  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0,0,0,0);

  for (let i = 0; i < keys.length; i++) {
    const logDate = new Date(keys[i] + 'T00:00:00');
    const diff = Math.round((checkDate - logDate) / 86400000);
    if (diff <= 1) {
      const log = STATE.logs[keys[i]];
      const sc = calcScore(log);
      if (sc > 20) { streak++; checkDate = logDate; }
      else break;
    } else break;
  }
  return streak;
}

function last7() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    days.push({ key: k, label: d.toLocaleDateString('en-GB', { weekday:'short' }), log: STATE.logs[k] || null });
  }
  return days;
}

// ─── APP OBJECT ──────────────────────────────

const App = {

  // ── INIT ──
  init() {
    Store.load();
    this._genIcon();
    setTimeout(() => {
      // Hide splash, show next screen — direct style, no CSS class tricks
      document.getElementById('splash').style.display = 'none';
      if (STATE.profile) {
        document.getElementById('main').style.display = 'flex';
        this.refreshHome();
        this.buildFood();
        this.buildTracker();
      } else {
        document.getElementById('onboarding').style.display = 'block';
      }
    }, 2000);
  },

  // ── ONBOARDING — go(n) shows step n, hides all others ──
  go(n) {
    // Validate before advancing
    if (n === 2) {
      const name = document.getElementById('inp-name').value.trim();
      if (!name) { toast('Please enter your name 👋'); return; }
    }
    if (n === 3) {
      const dob = document.getElementById('inp-dob').value;
      if (!dob) { toast('Please select your date of birth 🎂'); return; }
      if (!STATE.selectedGender) { toast('Please select your biological sex'); return; }
      const age = calcAge(dob);
      if (age < 13 || age > 110) { toast('Please check your date of birth'); return; }
    }
    // Show the target step, hide all others — direct style.display
    for (let i = 0; i <= 3; i++) {
      const el = document.getElementById('step-' + i);
      if (el) el.style.display = (i === n) ? 'flex' : 'none';
    }
    STATE.step = n;
  },

  // Keep old names as aliases so nothing breaks
  nextStep() { this.go(STATE.step + 1); },
  prevStep()  { this.go(STATE.step - 1); },

  pickGender(btn) {
    document.querySelectorAll('.ob-sex-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    STATE.selectedGender = btn.dataset.g;
  },

  toggleGoal(btn) {
    const g = btn.dataset.goal;
    if (STATE.selectedGoals.has(g)) { STATE.selectedGoals.delete(g); btn.classList.remove('selected'); }
    else { STATE.selectedGoals.add(g); btn.classList.add('selected'); }
  },

  finish() {
    const name = document.getElementById('inp-name').value.trim();
    const dob = document.getElementById('inp-dob').value;
    STATE.profile = {
      name,
      dob,
      gender: STATE.selectedGender,
      goals: [...STATE.selectedGoals],
      joined: todayKey(),
    };
    Store.save();
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('main').style.display = 'flex';
    this.refreshHome();
    this.buildFood();
    this.buildTracker();
    toast(`Welcome to VitalAge, ${name.split(' ')[0]}! 🎉`, 3000);
  },

  // ── NAVIGATION ──
  tab(name) {
    // Show only the selected tab — direct style.display, no classList
    ['home', 'track', 'food', 'progress', 'more'].forEach(t => {
      const el = document.getElementById('tab-' + t);
      if (el) el.style.display = (t === name) ? 'flex' : 'none';
    });
    document.querySelectorAll('.bnav').forEach(b => {
      b.classList.toggle('active', b.dataset.t === name);
    });

    if (name === 'progress') this.buildProgress();
    if (name === 'more') this.buildMore();
    if (name === 'track') this.refreshTracker();
  },

  foodTab(name, btn) {
    document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.food-sec').forEach(s => s.classList.remove('active'));
    document.getElementById(`food-${name}`).classList.add('active');
  },

  // ── HOME ──
  refreshHome() {
    if (!STATE.profile) return;
    const { name, dob, gender } = STATE.profile;
    const age = calcAge(dob);
    const log = getLog();
    const score = calcScore(log);
    const streak = calcStreak();
    const ageData = getAgeData(age, gender);

    // Header
    document.getElementById('greeting').textContent = greet() + ',';
    document.getElementById('uname').textContent = name.split(' ')[0];
    document.getElementById('age-num').textContent = age;

    // Score ring animation
    const arc = document.getElementById('score-arc');
    const circumference = 377;
    const offset = circumference - (score / 100) * circumference;
    setTimeout(() => {
      arc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
      arc.style.strokeDashoffset = offset;
    }, 100);

    // Animate score number
    this._countUp('score-num', 0, score, 1200);

    // Score tier
    const tiers = [[86,'Peak Health 🏆'],[71,'Thriving 💪'],[51,'On Track ✅'],[31,'Building 📈'],[0,'Getting Started 🌱']];
    const tier = tiers.find(t => score >= t[0]);
    const msgs = {
      86: "You're operating at an elite level. Maintain consistency and inspire others.",
      71: "Strong habits in place. A few more consistent days will push you higher.",
      51: "Good momentum. Focus on water intake and sleep to unlock the next level.",
      31: "You're building your foundation. Every habit completed today compounds tomorrow.",
      0: "Every journey starts here. Log your first habits to see your score climb.",
    };
    document.getElementById('score-tier').textContent = tier[1];
    document.getElementById('score-msg').textContent = msgs[tier[0]];

    const habits = HABITS;
    const done = habits.filter(h => log[h.id]).length;
    document.getElementById('streak-val').textContent = streak;
    document.getElementById('habits-val').textContent = `${done}/${habits.length}`;

    // Alert
    const al = ageData.alert;
    document.getElementById('alert-icon').textContent = al.icon;
    document.getElementById('alert-title').textContent = al.title;
    document.getElementById('alert-msg').textContent = al.msg;

    // Mini habits
    const mhEl = document.getElementById('mini-habits');
    mhEl.innerHTML = '';
    const miniItems = [
      { id:'water', icon:'💧', name:'Water', val: log.waterMl >= 2500 ? '✓ Goal Met!' : `${log.waterMl}ml / 2500ml`, done: log.waterMl >= 2500 },
      ...habits.slice(0,4).map(h => ({ id:h.id, icon:h.icon, name:h.name, val:log[h.id] ? 'Done ✓' : 'Not yet', done:log[h.id] })),
    ];
    miniItems.forEach(item => {
      const el = document.createElement('div');
      el.className = `mini-habit${item.done ? ' done' : ''}`;
      el.innerHTML = `<div class="mh-icon">${item.icon}</div><div class="mh-info"><div class="mh-name">${item.name}</div><div class="mh-val">${item.val}</div></div><div class="mh-check">${item.done ? '✓' : ''}</div>`;
      mhEl.appendChild(el);
    });

    // Tip
    const tips = ageData.tips;
    STATE.tipIndex = STATE.tipIndex % tips.length;
    document.getElementById('tip-text').textContent = tips[STATE.tipIndex];

    // Screenings
    const scEl = document.getElementById('screenings');
    scEl.innerHTML = '';
    ageData.screenings.slice(0, 5).forEach(sc => {
      const el = document.createElement('div');
      el.className = 'screening-item';
      el.innerHTML = `<div class="sc-status ${sc.due ? 'due' : 'ok'}"></div><div class="sc-name">${sc.icon} ${sc.name}</div><div class="sc-freq">${sc.freq}</div>`;
      scEl.appendChild(el);
    });
  },

  nextTip() {
    if (!STATE.profile) return;
    const age = calcAge(STATE.profile.dob);
    const tips = getAgeData(age, STATE.profile.gender).tips;
    STATE.tipIndex = (STATE.tipIndex + 1) % tips.length;
    document.getElementById('tip-text').textContent = tips[STATE.tipIndex];
    Store.save();
  },

  quickWater() {
    const log = getLog();
    log.waterMl = Math.min(log.waterMl + 250, 3000);
    Store.save();
    this.refreshTracker();
    this.refreshHome();
    toast(`💧 ${log.waterMl}ml logged`);
  },

  quickLog(habitId) {
    const log = getLog();
    log[habitId] = true;
    Store.save();
    this.refreshHome();
    this.refreshTracker();
    toast('✅ Logged!');
  },

  // ── TRACKER ──
  buildTracker() {
    // Water cups
    const cupsEl = document.getElementById('water-cups');
    cupsEl.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const btn = document.createElement('button');
      btn.className = 'cup';
      btn.innerHTML = '💧';
      btn.setAttribute('aria-label', `Cup ${i+1} (${(i+1)*250}ml)`);
      btn.addEventListener('click', () => {
        const log = getLog();
        const ml = (i + 1) * 250;
        log.waterMl = (log.waterMl === ml) ? ml - 250 : ml;
        if (log.waterMl < 0) log.waterMl = 0;
        Store.save();
        this.refreshTracker();
        this.refreshHome();
      });
      cupsEl.appendChild(btn);
    }

    // Habits
    const listEl = document.getElementById('habit-list');
    listEl.innerHTML = '';
    HABITS.forEach(h => {
      const el = document.createElement('div');
      el.className = 'habit-item';
      el.id = `hi-${h.id}`;
      el.innerHTML = `<div class="habit-check" id="hc-${h.id}"></div><div class="habit-icon">${h.icon}</div><div class="habit-info"><div class="habit-name">${h.name}</div><div class="habit-desc">${h.desc}</div></div>`;
      el.addEventListener('click', () => {
        const log = getLog();
        log[h.id] = !log[h.id];
        Store.save();
        this.refreshTracker();
        this.refreshHome();
      });
      listEl.appendChild(el);
    });

    // Energy slider
    const slider = document.getElementById('energy-slider');
    slider.addEventListener('input', (e) => {
      const log = getLog();
      log.energy = parseInt(e.target.value);
      Store.save();
      this.refreshTracker();
    });

    // Metric inputs
    ['waist', 'weight'].forEach(m => {
      document.getElementById(`${m}-inp`).addEventListener('change', (e) => {
        const log = getLog();
        log[m] = e.target.value;
        Store.save();
      });
    });
    document.getElementById('notes-inp').addEventListener('input', (e) => {
      const log = getLog();
      log.notes = e.target.value;
    });
    document.getElementById('notes-inp').addEventListener('blur', () => Store.save());

    this.refreshTracker();
  },

  refreshTracker() {
    const log = getLog();
    document.getElementById('track-date').textContent = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short' });

    // Water
    const cups = document.querySelectorAll('.cup');
    cups.forEach((cup, i) => cup.classList.toggle('filled', log.waterMl >= (i + 1) * 250));
    document.getElementById('water-ml-disp').textContent = `${log.waterMl} ml`;

    // Habits
    HABITS.forEach(h => {
      const item = document.getElementById(`hi-${h.id}`);
      const check = document.getElementById(`hc-${h.id}`);
      if (item && check) {
        item.classList.toggle('checked', !!log[h.id]);
        check.textContent = log[h.id] ? '✓' : '';
      }
    });

    // Energy
    const slider = document.getElementById('energy-slider');
    if (slider) {
      slider.value = log.energy || 5;
      document.getElementById('energy-display').textContent = `${log.energy || 5} / 10`;
    }

    // Metrics
    if (log.waist) document.getElementById('waist-inp').value = log.waist;
    if (log.weight) document.getElementById('weight-inp').value = log.weight;
    if (log.notes) document.getElementById('notes-inp').value = log.notes;
  },

  updateEnergy(val) {
    document.getElementById('energy-display').textContent = `${val} / 10`;
    const log = getLog();
    log.energy = parseInt(val);
    Store.save();
  },

  saveLog() {
    const log = getLog();
    log.waist = document.getElementById('waist-inp').value;
    log.weight = document.getElementById('weight-inp').value;
    log.notes = document.getElementById('notes-inp').value;
    Store.save();
    this.refreshHome();
    toast('✅ Day logged successfully!', 3000);
  },

  // ── FOOD ──
  buildFood() {
    // EAT
    const eatEl = document.getElementById('food-eat');
    eatEl.innerHTML = '';
    FOOD.eat.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'food-category';
      div.innerHTML = `<div class="food-cat-header"><div class="food-cat-dot" style="background:${cat.color}"></div><div class="food-cat-name">${cat.cat}</div></div>`;
      cat.items.forEach(item => {
        div.innerHTML += `<div class="food-item">
          <div class="food-item-top"><div class="food-item-name">${item.name}</div><div class="food-freq">${item.freq}</div></div>
          <div class="food-meta"><span class="food-tag">📏 ${item.portion}</span><span class="food-tag">⏰ ${item.time}</span></div>
          <div class="food-benefit">→ ${item.benefit}</div>
        </div>`;
      });
      eatEl.appendChild(div);
    });

    // AVOID
    const avoidEl = document.getElementById('food-avoid');
    avoidEl.innerHTML = '';
    FOOD.avoid.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'food-category';
      div.innerHTML = `<div class="food-cat-header"><div class="food-cat-dot" style="background:${cat.color}"></div><div class="food-cat-name">${cat.cat}</div></div>`;
      cat.items.forEach(item => {
        div.innerHTML += `<div class="avoid-item">
          <div class="avoid-top"><span class="avoid-sev ${cat.sev === 'avoid' ? 'sev-avoid' : 'sev-limit'}">${cat.sev === 'avoid' ? '❌ Avoid' : '⚠️ Limit'}</span><div class="avoid-name">${item.name}</div></div>
          <div class="avoid-note">📌 ${item.note}</div>
          <div class="avoid-impact">⚠️ ${item.impact}</div>
        </div>`;
      });
      avoidEl.appendChild(div);
    });

    // SCHEDULE
    const schEl = document.getElementById('food-schedule');
    schEl.innerHTML = '<div style="padding:8px 0">';
    FOOD.schedule.forEach(s => {
      schEl.innerHTML += `<div class="schedule-item">
        <div class="sch-time">${s.time}</div>
        <div class="sch-dot">${s.icon}</div>
        <div class="sch-content"><div class="sch-title">${s.title}</div><div class="sch-desc">${s.desc}</div></div>
      </div>`;
    });
    schEl.innerHTML += '</div>';

    // SHOPPING
    const shopEl = document.getElementById('food-shopping');
    shopEl.innerHTML = '';
    FOOD.shopping.forEach((cat, ci) => {
      const div = document.createElement('div');
      div.className = 'shop-category';
      div.innerHTML = `<div class="shop-cat-title">${cat.cat}</div>`;
      cat.items.forEach((item, ii) => {
        const key = `${ci}-${ii}`;
        const checked = STATE.shopChecked[key];
        const el = document.createElement('div');
        el.className = `shop-item${checked ? ' checked' : ''}`;
        el.innerHTML = `<div class="shop-check">${checked ? '✓' : ''}</div><div class="shop-name">${item.name}</div><div class="shop-qty">${item.qty}</div>`;
        el.addEventListener('click', () => {
          STATE.shopChecked[key] = !STATE.shopChecked[key];
          Store.save();
          el.classList.toggle('checked', STATE.shopChecked[key]);
          el.querySelector('.shop-check').textContent = STATE.shopChecked[key] ? '✓' : '';
          el.querySelector('.shop-name').style.textDecoration = STATE.shopChecked[key] ? 'line-through' : '';
          el.querySelector('.shop-name').style.color = STATE.shopChecked[key] ? 'var(--text3)' : '';
        });
        div.appendChild(el);
      });
      shopEl.appendChild(div);
    });
  },

  // ── PROGRESS ──
  buildProgress() {
    const days7 = last7();
    const scores = days7.map(d => d.log ? calcScore(d.log) : null);
    const waters = days7.map(d => d.log ? d.log.waterMl : null);
    const energies = days7.map(d => d.log ? (d.log.energy || 0) : null);
    const labels = days7.map(d => d.label);

    const chartOpts = (color) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw !== null ? ctx.raw : 'No data' } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8fb3c8', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8fb3c8', font: { size: 11 } }, beginAtZero: true },
      },
    });

    const makeDataset = (data, color, label) => ({
      label,
      data,
      borderColor: color,
      backgroundColor: `${color}22`,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: color,
      pointRadius: 4,
      spanGaps: true,
    });

    // Destroy old charts
    ['score','water','energy'].forEach(id => {
      if (STATE.charts[id]) { STATE.charts[id].destroy(); delete STATE.charts[id]; }
    });

    STATE.charts.score = new Chart(document.getElementById('ch-score'), {
      type: 'line',
      data: { labels, datasets: [makeDataset(scores, '#00e5cc', 'Health Score')] },
      options: { ...chartOpts('#00e5cc'), scales: { ...chartOpts('#00e5cc').scales, y: { ...chartOpts('#00e5cc').scales.y, max: 100 } } },
    });

    STATE.charts.water = new Chart(document.getElementById('ch-water'), {
      type: 'bar',
      data: { labels, datasets: [{ label:'Water (ml)', data: waters, backgroundColor: '#3b82f680', borderColor: '#3b82f6', borderRadius: 6, spanGaps: true }] },
      options: chartOpts('#3b82f6'),
    });

    STATE.charts.energy = new Chart(document.getElementById('ch-energy'), {
      type: 'line',
      data: { labels, datasets: [makeDataset(energies, '#ffd700', 'Energy')] },
      options: { ...chartOpts('#ffd700'), scales: { ...chartOpts('#ffd700').scales, y: { ...chartOpts('#ffd700').scales.y, max: 10 } } },
    });

    // Stats
    const allLogs = Object.values(STATE.logs);
    document.getElementById('days-tracked').textContent = allLogs.length;
    document.getElementById('best-streak').textContent = calcStreak();
    const avgE = allLogs.length ? Math.round(allLogs.reduce((s, l) => s + (l.energy || 0), 0) / allLogs.length * 10) / 10 : '--';
    document.getElementById('avg-energy').textContent = avgE;

    // Habit consistency
    const hcEl = document.getElementById('habit-consist');
    hcEl.innerHTML = '';
    HABITS.forEach(h => {
      const logs = last7().filter(d => d.log);
      const pct = logs.length ? Math.round((logs.filter(d => d.log[h.id]).length / logs.length) * 100) : 0;
      const el = document.createElement('div');
      el.className = 'hc-item';
      el.innerHTML = `<div class="hc-top"><span class="hc-name">${h.icon} ${h.name}</span><span class="hc-pct">${pct}%</span></div><div class="hc-bar"><div class="hc-fill" style="width:0%"></div></div>`;
      hcEl.appendChild(el);
      setTimeout(() => el.querySelector('.hc-fill').style.width = `${pct}%`, 100);
    });

    // Metrics log
    const mlEl = document.getElementById('metrics-log');
    const withMetrics = Object.values(STATE.logs).filter(l => l.waist || l.weight).slice(-5).reverse();
    if (withMetrics.length === 0) {
      mlEl.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:8px">Log your waist and weight in the Track tab to see your progress here.</p>';
    } else {
      mlEl.innerHTML = '';
      withMetrics.forEach(l => {
        const el = document.createElement('div');
        el.className = 'ml-item';
        el.innerHTML = `<div class="ml-date">${fmt(l.date)}</div><div class="ml-vals">${l.waist ? `<span class="ml-val">📏 ${l.waist}cm</span>` : ''}${l.weight ? `<span class="ml-val">⚖️ ${l.weight}kg</span>` : ''}</div>`;
        mlEl.appendChild(el);
      });
    }
  },

  // ── MORE / PROFILE ──
  buildMore() {
    if (!STATE.profile) return;
    const { name, dob, gender, goals, joined } = STATE.profile;
    const age = calcAge(dob);
    const el = document.getElementById('profile-card');
    const goalLabels = { weight:'⚖️ Weight', energy:'⚡ Energy', heart:'❤️ Heart', muscle:'💪 Strength', sleep:'😴 Sleep', stress:'🧘 Stress', longevity:'🌱 Longevity', gut:'🦠 Gut Health' };
    el.innerHTML = `
      <div class="profile-name">${name}</div>
      <div class="profile-age">${gender === 'male' ? '♂' : '♀'} · ${age} years old · Born ${fmt(dob)}</div>
      <div class="profile-age">Member since ${fmt(joined)}</div>
      ${goals && goals.length ? `<div class="profile-goals">${goals.map(g => `<span class="profile-goal">${goalLabels[g] || g}</span>`).join('')}</div>` : ''}
    `;
  },

  toggleNotif(on) {
    if (on && 'Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') toast('🔔 Reminders enabled!');
        else { document.getElementById('notif-toggle').checked = false; toast('Notifications blocked in browser settings'); }
      });
    }
  },

  resetApp() {
    if (!confirm('This will delete all your data permanently. Are you sure?')) return;
    localStorage.clear();
    location.reload();
  },

  // ── UTILS ──
  _countUp(elId, from, to, dur) {
    const el = document.getElementById(elId);
    if (!el) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(from + (to - from) * p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  _genIcon() {
    // Generate PWA icon via canvas for Apple devices
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 192;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0,0,192,192);
      g.addColorStop(0,'#00e5cc'); g.addColorStop(1,'#667eea');
      ctx.fillStyle = '#050c15';
      ctx.fillRect(0,0,192,192);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.roundRect(20,20,152,152,30); ctx.fill();
      ctx.strokeStyle = '#050c15';
      ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(30,96); ctx.lineTo(56,96); ctx.lineTo(70,130); ctx.lineTo(96,42); ctx.lineTo(122,130); ctx.lineTo(136,96); ctx.lineTo(162,96);
      ctx.stroke();
      const url = c.toDataURL('image/png');
      const link = document.getElementById('apple-icon');
      if (link) link.href = url;
    } catch(e) {}
  },
};

// ── START ──
document.addEventListener('DOMContentLoaded', () => App.init());

// ── SERVICE WORKER ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
