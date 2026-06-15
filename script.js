// =============================================
// STATE
// =============================================
let salary = 0;
let allocations = [];
let selectedPlanKey = '';

// =============================================
// PLANS — No locks. Fully adjustable starting points.
// =============================================
const plans = {
  '50/30/20': [
    { id: 'bills', category: 'Bills & Essentials', percentage: 50, amount: 0 },
    { id: 'spending', category: 'Guilt-Free Spending', percentage: 30, amount: 0 },
    { id: 'savings', category: 'Savings & Debt', percentage: 20, amount: 0 },
  ],
  '60/20/20': [
    { id: 'bills', category: 'Bills & Essentials', percentage: 60, amount: 0 },
    { id: 'spending', category: 'Guilt-Free Spending', percentage: 20, amount: 0 },
    { id: 'savings', category: 'Savings & Debt', percentage: 20, amount: 0 },
  ],
  'custom': [],
};

const catColors = ['#4ade80', '#f59e0b', '#3b82f6', '#a78bfa', '#f472b6', '#38bdf8', '#fb923c', '#34d399'];

// =============================================
// DARK / LIGHT MODE
// =============================================
function getTheme() {
  return localStorage.getItem('flowguard-theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const iconLight = '☀️';
  const iconDark = '🌙';
  document.querySelectorAll('.theme-icon').forEach(el => {
    el.textContent = theme === 'light' ? iconLight : iconDark;
  });
}

function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('flowguard-theme', next);
  applyTheme(next);
}

// Apply saved theme on load
applyTheme(getTheme());

// Theme toggle buttons
document.getElementById('theme-toggle-landing').addEventListener('click', toggleTheme);
document.getElementById('theme-toggle-dash').addEventListener('click', toggleTheme);

// =============================================
// LOCAL STORAGE
// =============================================
function savePlan() {
  const data = { salary, allocations, selectedPlanKey, savedAt: new Date().toISOString() };
  localStorage.setItem('flowguard-plan', JSON.stringify(data));
}

function loadPlan() {
  const raw = localStorage.getItem('flowguard-plan');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearPlan() {
  localStorage.removeItem('flowguard-plan');
}

function hasReturningPlan() {
  const plan = loadPlan();
  return plan && plan.salary > 0 && plan.allocations && plan.allocations.length > 0;
}

// =============================================
// SCREEN NAVIGATION
// =============================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// ON LOAD: DETECT RETURNING USER
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  if (hasReturningPlan()) {
    const plan = loadPlan();
    salary = plan.salary;
    allocations = plan.allocations;
    selectedPlanKey = plan.selectedPlanKey;
    renderDashboard();
    showScreen('screen-dashboard');
  }
});

// =============================================
// LANDING PAGE BUTTONS
// =============================================
document.getElementById('btn-hero-start').addEventListener('click', () => showScreen('screen-salary'));
document.getElementById('btn-nav-start').addEventListener('click', () => showScreen('screen-salary'));
document.getElementById('btn-dash-new').addEventListener('click', () => {
  document.getElementById('salary-input').value = '';
  salary = 0;
  allocations = [];
  selectedPlanKey = '';
  clearPlan();
  showScreen('screen-salary');
});

// =============================================
// SCREEN 1: SALARY INPUT
// =============================================
document.getElementById('salary-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('salary-input');
  salary = Number(input.value);
  if (salary > 0) {
    document.getElementById('plan-salary-display').textContent = '$' + salary.toLocaleString();
    showScreen('screen-plan');
  }
});

document.getElementById('btn-back-to-landing').addEventListener('click', () => showScreen('screen-landing'));
document.getElementById('btn-back-to-salary').addEventListener('click', () => showScreen('screen-salary'));

// =============================================
// SCREEN 2: PLAN SELECTION
// =============================================
function renderPlanCards() {
  const container = document.getElementById('plan-options');
  container.innerHTML = '';

  const planKeys = ['50/30/20', '60/20/20', 'custom'];
  const colors = [
    ['essentials', 'spending', 'savings'],
    ['essentials', 'spending', 'savings'],
  ];
  const shortLabels = [
    ['50% Bills', '30% Fun', '20% Save'],
    ['60% Bills', '20% Fun', '20% Save'],
  ];

  planKeys.forEach((key, idx) => {
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.addEventListener('click', () => selectPlan(key));

    const name = document.createElement('div');
    name.className = 'plan-name';
    name.textContent = key === 'custom' ? 'Build Your Own Split' : key;
    card.appendChild(name);

    if (key !== 'custom') {
      const plan = plans[key];
      const breakdown = document.createElement('div');
      breakdown.className = 'plan-breakdown';

      const bar = document.createElement('div');
      bar.className = 'plan-bar';
      plan.forEach((item, i) => {
        const seg = document.createElement('div');
        seg.className = 'bar-segment ' + colors[idx][i];
        seg.style.width = item.percentage + '%';
        bar.appendChild(seg);
      });
      breakdown.appendChild(bar);

      const labels = document.createElement('div');
      labels.className = 'plan-labels';
      shortLabels[idx].forEach(label => {
        const span = document.createElement('span');
        span.textContent = label;
        labels.appendChild(span);
      });
      breakdown.appendChild(labels);

      card.appendChild(breakdown);
    } else {
      const desc = document.createElement('p');
      desc.className = 'custom-desc';
      desc.textContent = 'Start from scratch — add and name your own categories.';
      card.appendChild(desc);
    }

    container.appendChild(card);
  });
}

renderPlanCards();

function selectPlan(key) {
  selectedPlanKey = key;
  
  if (key === 'custom') {
    allocations = [];
  } else {
    allocations = JSON.parse(JSON.stringify(plans[key]));
    allocations.forEach(item => {
      item.amount = Math.round((item.percentage / 100) * salary * 100) / 100;
    });
  }
  
  renderAllocationScreen();
  showScreen('screen-allocate');
}

// =============================================
// SCREEN 3: ALLOCATION (SMOOTH SLIDERS)
// =============================================
function renderAllocationScreen() {
  document.getElementById('allocate-salary-display').textContent = '$' + salary.toLocaleString();

  const list = document.getElementById('allocations-list');
  list.innerHTML = '';

  if (allocations.length === 0) {
    const hint = document.createElement('div');
    hint.className = 'custom-hint';
    hint.textContent = 'Start fresh! Add categories below and name them whatever you like. Every dollar gets a purpose.';
    list.appendChild(hint);
  }

  allocations.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'allocation-item' + (item.isNew ? ' new-category' : '');

    const info = document.createElement('div');
    info.className = 'item-info';
    
    const leftSide = document.createElement('div');
    leftSide.style.display = 'flex';
    leftSide.style.alignItems = 'center';
    leftSide.style.gap = '8px';
    
    const cat = document.createElement('span');
    cat.className = 'item-category';
    cat.textContent = item.category;
    leftSide.appendChild(cat);
    
    info.appendChild(leftSide);

    if (selectedPlanKey === 'custom') {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-cat-btn';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Remove category';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCategory(index);
      });
      info.appendChild(removeBtn);
    }

    div.appendChild(info);

    const controls = document.createElement('div');
    controls.className = 'item-controls';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;
    slider.value = item.percentage;
    slider.className = 'percentage-slider';
    slider.dataset.index = index;
    
    slider.addEventListener('input', function() {
      const idx = parseInt(this.dataset.index);
      const newPct = parseInt(this.value);
      allocations[idx].percentage = newPct;
      allocations[idx].amount = Math.round((newPct / 100) * salary * 100) / 100;
      allocations[idx].isNew = false;
      
      const pctSpan = this.parentElement.querySelector('.percentage');
      const amtInput = this.parentElement.querySelector('.amount-input');
      if (pctSpan) pctSpan.textContent = newPct + '%';
      if (amtInput) amtInput.value = allocations[idx].amount;
      
      updateRemaining();
    });
    
    controls.appendChild(slider);

    const values = document.createElement('div');
    values.className = 'item-values';

    const pct = document.createElement('span');
    pct.className = 'percentage';
    pct.textContent = item.percentage + '%';
    values.appendChild(pct);

    const amt = document.createElement('input');
    amt.type = 'number';
    amt.value = item.amount;
    amt.className = 'amount-input';
    amt.min = 0;
    amt.max = salary;
    amt.step = 1;
    amt.dataset.index = index;
    
    amt.addEventListener('input', function() {
      const idx = parseInt(this.dataset.index);
      let newAmt = parseFloat(this.value);
      if (isNaN(newAmt)) newAmt = 0;
      if (newAmt < 0) newAmt = 0;
      if (newAmt > salary) newAmt = salary;
      
      allocations[idx].amount = newAmt;
      allocations[idx].percentage = salary > 0 ? Math.round((newAmt / salary) * 100) : 0;
      allocations[idx].isNew = false;
      
      const sliderEl = this.parentElement.parentElement.querySelector('.percentage-slider');
      const pctSpan = this.parentElement.querySelector('.percentage');
      if (sliderEl) sliderEl.value = allocations[idx].percentage;
      if (pctSpan) pctSpan.textContent = allocations[idx].percentage + '%';
      
      updateRemaining();
    });
    
    values.appendChild(amt);
    controls.appendChild(values);
    div.appendChild(controls);
    list.appendChild(div);
  });

  if (selectedPlanKey === 'custom') {
    const addRow = document.createElement('div');
    addRow.className = 'add-cat-row';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-category';
    addBtn.textContent = '+ Add Category';
    addBtn.addEventListener('click', addCategory);
    addRow.appendChild(addBtn);
    list.appendChild(addRow);
  }

  updateRemaining();
}

function addCategory() {
  const name = prompt('What would you like to call this category?', '');
  if (!name || name.trim() === '') return;
  
  const trimmedName = name.trim();
  
  const duplicate = allocations.find(a => a.category.toLowerCase() === trimmedName.toLowerCase());
  if (duplicate) {
    alert('You already have a category called "' + trimmedName + '". Please use a different name.');
    return;
  }
  
  const newCat = {
    id: 'custom-' + Date.now(),
    category: trimmedName,
    percentage: 0,
    amount: 0,
    isNew: true,
  };
  
  allocations.push(newCat);
  renderAllocationScreen();
  
  setTimeout(() => {
    const items = document.querySelectorAll('.allocation-item.new-category');
    const lastItem = items[items.length - 1];
    if (lastItem) {
      lastItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

function removeCategory(index) {
  if (allocations.length <= 1) {
    allocations[index].percentage = 0;
    allocations[index].amount = 0;
    renderAllocationScreen();
  } else {
    const name = allocations[index].category;
    const confirmed = confirm('Remove "' + name + '" from your plan?');
    if (!confirmed) return;
    allocations.splice(index, 1);
    renderAllocationScreen();
  }
}

function updateRemaining() {
  const totalAllocated = allocations.reduce((sum, item) => sum + item.amount, 0);
  const remaining = Math.round((salary - totalAllocated) * 100) / 100;

  const box = document.getElementById('remaining-box');
  box.classList.remove('positive', 'negative', 'zero');

  document.getElementById('remaining-amount').textContent = '$' + remaining.toLocaleString();

  const hint = document.getElementById('remaining-hint');
  const btn = document.getElementById('btn-confirm');

  if (remaining < 0) {
    box.classList.add('negative');
    hint.textContent = '(reduce some allocations — you\'re over by $' + Math.abs(remaining).toLocaleString() + ')';
    btn.disabled = true;
  } else if (remaining > 0) {
    box.classList.add('positive');
    hint.textContent = '(allocate all your income — $' + remaining.toLocaleString() + ' still unassigned)';
    btn.disabled = true;
  } else {
    box.classList.add('zero');
    hint.textContent = '✓ Every dollar has a job';
    btn.disabled = false;
  }
}

document.getElementById('btn-back-to-plan').addEventListener('click', () => showScreen('screen-plan'));

document.getElementById('btn-confirm').addEventListener('click', () => {
  savePlan();
  renderEncouragementScreen();
  showScreen('screen-encourage');
});

// =============================================
// SCREEN 4: ENCOURAGEMENT
// =============================================
function renderEncouragementScreen() {
  const hour = new Date().getHours();
  const totalCategories = allocations.length;
  const largestCategory = allocations.reduce((max, item) => item.amount > max.amount ? item : max, allocations[0]);
  
  // Pick encouraging message based on plan type
  const messages = {
    '50/30/20': {
      icon: '🌟',
      title: 'Solid foundation.',
      body: 'The 50/30/20 rule has helped thousands build financial stability. You just gave every dollar a purpose — that takes discipline most people never develop. Proud of you.'
    },
    '60/20/20': {
      icon: '💪',
      title: 'Aggressive and intentional.',
      body: '60% to essentials, 20% to living, 20% to your future. That\'s the split of someone who means business. Your future self is already thanking you.'
    },
    'custom': {
      icon: '🎨',
      title: 'Your money, your rules.',
      body: `You built a completely custom plan with ${totalCategories} categories — led by "${largestCategory.category}" at $${largestCategory.amount.toLocaleString()}. That wasn\'t easy. But you did it.`
    }
  };
  
  const msg = messages[selectedPlanKey] || {
    icon: '✅',
    title: 'Plan locked in.',
    body: 'Every dollar now has a job. That\'s more than most people can say. You showed up for yourself today.'
  };
  
  document.getElementById('encourage-icon').textContent = msg.icon;
  document.getElementById('encourage-title').textContent = msg.title;
  document.getElementById('encourage-body').textContent = msg.body;
}

document.getElementById('btn-to-dashboard').addEventListener('click', () => {
  renderDashboard();
  showScreen('screen-dashboard');
});

// =============================================
// SCREEN 5: DASHBOARD
// =============================================
function renderDashboard() {
  const hour = new Date().getHours();
  let greeting = '👋 Welcome back';
  if (hour < 12) greeting = '🌅 Good Morning';
  else if (hour < 18) greeting = '☀️ Good Afternoon';
  else greeting = '🌙 Good Evening';
  
  document.getElementById('dash-greeting').textContent = greeting;
  
  // Subtitle based on whether they just allocated or are returning
  const plan = loadPlan();
  if (plan && plan.savedAt) {
    const savedDate = new Date(plan.savedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - savedDate) / 60000);
    
    if (diffMinutes < 2) {
      document.getElementById('dash-subtitle').textContent = 'Your plan is now active. You did it.';
    } else if (diffMinutes < 60) {
      document.getElementById('dash-subtitle').textContent = 'Plan active for ' + diffMinutes + ' minutes. Going strong.';
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      document.getElementById('dash-subtitle').textContent = 'Your plan has been active for ' + hours + ' hour' + (hours > 1 ? 's' : '') + '.';
    } else {
      const days = Math.floor(diffMinutes / 1440);
      document.getElementById('dash-subtitle').textContent = 'Your plan has been active for ' + days + ' day' + (days > 1 ? 's' : '') + '. Consistency is everything.';
    }
  }
  
  document.getElementById('dash-salary').textContent = '$' + salary.toLocaleString() + '/month';

  // Bar chart
  const bar = document.getElementById('dash-bar');
  bar.innerHTML = '';
  allocations.forEach((item, i) => {
    const seg = document.createElement('div');
    seg.className = 'dash-bar-segment';
    seg.style.width = item.percentage + '%';
    seg.style.backgroundColor = catColors[i % catColors.length];
    seg.style.height = '100%';
    bar.appendChild(seg);
  });

  // Category list
  const catList = document.getElementById('dash-categories');
  catList.innerHTML = '';
  allocations.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'dash-category-row';

    const left = document.createElement('div');
    left.className = 'dash-cat-left';
    const dot = document.createElement('div');
    dot.className = 'dash-cat-dot';
    dot.style.backgroundColor = catColors[i % catColors.length];
    left.appendChild(dot);
    const name = document.createElement('span');
    name.className = 'dash-cat-name';
    name.textContent = item.category;
    left.appendChild(name);

    const right = document.createElement('div');
    right.className = 'dash-cat-right';
    const amt = document.createElement('span');
    amt.className = 'dash-cat-amount';
    amt.textContent = '$' + item.amount.toLocaleString();
    right.appendChild(amt);
    const pct = document.createElement('span');
    pct.className = 'dash-cat-pct';
    pct.textContent = item.percentage + '%';
    right.appendChild(pct);

    row.appendChild(left);
    row.appendChild(right);
    catList.appendChild(row);
  });

  // Stats
  const stats = document.getElementById('dash-stats');
  stats.innerHTML = '';
  
  const largest = allocations.reduce((max, item) => item.amount > max.amount ? item : max, allocations[0]);
  const smallest = allocations.reduce((min, item) => item.amount < min.amount ? item : min, allocations[0]);
  
  const statData = [
    { value: allocations.length, label: 'Categories' },
    { value: '$' + largest.amount.toLocaleString(), label: 'Largest: ' + largest.category },
    { value: salary > 0 ? Math.round((allocations.reduce((s, i) => s + i.amount, 0) / salary) * 100) + '%' : '0%', label: 'Allocated' },
    { value: '30 days', label: 'Coverage Period' },
  ];

  statData.forEach(s => {
    const statDiv = document.createElement('div');
    statDiv.className = 'dash-stat';
    const val = document.createElement('div');
    val.className = 'dash-stat-value';
    val.textContent = s.value;
    const lab = document.createElement('div');
    lab.className = 'dash-stat-label';
    lab.textContent = s.label;
    statDiv.appendChild(val);
    statDiv.appendChild(lab);
    stats.appendChild(statDiv);
  });
}