/**
 * מערכת ניהול פניות ולידים (bhvuk) — בן לולו סיבוני משרד עורכי דין
 * דשבורד CRM עצמאי, לכידת לידים בזמן אמת, סנכרון רב-לשוני, ניהול סטטוסים וייצוא CSV
 */

(function () {
  'use strict';

  const LEADS_DB_KEY = 'bls_law_leads_db_v1';
  const AUTH_SESSION_KEY = 'bls_admin_session_v1';

  // Allowed passwords: blslaw2026, blslaw2020, ghtlaw2020
  const VALID_PASSWORDS = ['blslaw2026', 'blslaw2020', 'ghtlaw2020'];

  const CRM_STATUSES = [
    { value: 'new', label: 'חדש' },
    { value: 'in_progress', label: 'בטיפול' },
    { value: 'meeting', label: 'תואמה פגישה' },
    { value: 'closed', label: 'נסגר / לא רלוונטי' }
  ];

  const CAUSE_LABELS = {
    road_accident: 'תאונת דרכים',
    work_injury: 'תאונת עבודה',
    hostilities_terror: 'נפגעי איבה וטרור',
    defense_ministry: 'משרד הביטחון',
    national_insurance: 'ביטוח לאומי',
    insurance_claims: 'תביעות ביטוח',
    medical_malpractice: 'רשלנות ונזקי גוף',
    default: 'פנייה כללית'
  };

  const uiState = {
    authenticated: false,
    leads: [],
    filter: 'all',
    search: '',
    activeLeadId: null
  };

  // DOM Elements
  const authGateEl = document.getElementById('auth-gate');
  const adminAppEl = document.getElementById('admin-app');
  const authFormEl = document.getElementById('auth-form');
  const authPasswordInput = document.getElementById('auth-password');
  const authErrorEl = document.getElementById('auth-error');
  const authToggleVisBtn = document.getElementById('auth-toggle-vis');
  const logoutBtn = document.getElementById('logout-btn');

  const tbodyEl = document.getElementById('leads-tbody');
  const mobileListEl = document.getElementById('leads-mobile-list');
  const emptyStateEl = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const drawerEl = document.getElementById('lead-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerContent = document.getElementById('drawer-content');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerStatusPill = document.getElementById('drawer-status-pill');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const toastEl = document.getElementById('toast');

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    setTimeout(() => {
      toastEl.hidden = true;
    }, 2800);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ========================================================================
     Auth Gate Management
     ======================================================================== */
  function checkSessionAuth() {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'authenticated';
  }

  function authenticate(pw) {
    const cleanPw = String(pw || '').trim();
    if (VALID_PASSWORDS.includes(cleanPw)) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'authenticated');
      uiState.authenticated = true;
      authGateEl.hidden = true;
      adminAppEl.hidden = false;
      loadLeads();
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    uiState.authenticated = false;
    authGateEl.hidden = false;
    adminAppEl.hidden = true;
    if (authPasswordInput) authPasswordInput.value = '';
  }

  authFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    authErrorEl.textContent = '';
    const success = authenticate(authPasswordInput.value);
    if (!success) {
      authErrorEl.textContent = 'סיסמה שגויה. אנא נסו שוב.';
      authPasswordInput.focus();
    }
  });

  authToggleVisBtn.addEventListener('click', () => {
    const isPw = authPasswordInput.type === 'password';
    authPasswordInput.type = isPw ? 'text' : 'password';
    authToggleVisBtn.textContent = isPw ? 'הסתר' : 'הצג';
  });

  logoutBtn.addEventListener('click', logout);

  /* ========================================================================
     Leads Database Operations
     ======================================================================== */
  function loadLeads() {
    try {
      const raw = localStorage.getItem(LEADS_DB_KEY);
      uiState.leads = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(uiState.leads)) uiState.leads = [];
    } catch (_) {
      uiState.leads = [];
    }
    renderDashboard();
  }

  function saveLeads() {
    try {
      localStorage.setItem(LEADS_DB_KEY, JSON.stringify(uiState.leads));
    } catch (_) {}
  }

  // Live storage event sync across open tabs
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key === LEADS_DB_KEY) {
      loadLeads();
    }
  });

  /* ========================================================================
     Filtering, Search & KPIs
     ======================================================================== */
  function getFilteredLeads() {
    let list = [...uiState.leads];

    if (uiState.filter === 'completed') {
      list = list.filter((l) => l.completionStatus === 'completed');
    } else if (uiState.filter === 'partial') {
      list = list.filter((l) => l.completionStatus === 'partial');
    } else if (uiState.filter === 'new') {
      list = list.filter((l) => l.crmStatus === 'new');
    }

    if (uiState.search.trim()) {
      const q = uiState.search.trim().toLowerCase();
      list = list.filter((l) => {
        const name = (l.fullName || '').toLowerCase();
        const phone = (l.phone || '').replace(/\D/g, '');
        const causes = Array.isArray(l.answers?.causes) ? l.answers.causes.join(' ') : '';
        const source = (l.tracking?.sourceLabel || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || causes.includes(q) || source.includes(q);
      });
    }

    return list;
  }

  function updateKPIs() {
    const total = uiState.leads.length;
    const completed = uiState.leads.filter((l) => l.completionStatus === 'completed').length;
    const partial = uiState.leads.filter((l) => l.completionStatus === 'partial').length;
    const newCount = uiState.leads.filter((l) => l.crmStatus === 'new').length;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayCount = uiState.leads.filter((l) => new Date(l.createdAt).getTime() > oneDayAgo).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-partial').textContent = partial;
    document.getElementById('stat-today').textContent = todayCount;

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('stat-completed-rate').textContent = `${rate}% שיעור סיום`;

    document.getElementById('count-all').textContent = total;
    document.getElementById('count-completed').textContent = completed;
    document.getElementById('count-partial').textContent = partial;
    document.getElementById('count-new').textContent = newCount;
  }

  /* ========================================================================
     Rendering Dashboard
     ======================================================================== */
  function renderDashboard() {
    updateKPIs();
    const leads = getFilteredLeads();

    if (leads.length === 0) {
      tbodyEl.innerHTML = '';
      mobileListEl.innerHTML = '';
      emptyStateEl.hidden = false;
      return;
    }

    emptyStateEl.hidden = true;

    // Desktop Table
    tbodyEl.innerHTML = leads.map((lead) => {
      const date = new Date(lead.createdAt).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      const causes = Array.isArray(lead.answers?.causes) ? lead.answers.causes : [];
      const primaryCauseKey = causes[0] || 'default';
      const causeText = CAUSE_LABELS[primaryCauseKey] || 'נזקי גוף';

      const isCompleted = lead.completionStatus === 'completed';
      const crmStatusObj = CRM_STATUSES.find((s) => s.value === lead.crmStatus) || CRM_STATUSES[0];

      return `
        <tr class="lead-row" data-lead-id="${escapeHtml(lead.id)}">
          <td><bdi dir="ltr">${escapeHtml(date)}</bdi></td>
          <td class="lead-name">${escapeHtml(lead.fullName || 'ללא שם')}</td>
          <td><bdo dir="ltr" class="lead-phone">${escapeHtml(lead.phone || '-')}</bdo></td>
          <td>${escapeHtml(causeText)}</td>
          <td>
            <span class="completion-tag ${isCompleted ? 'completed' : 'partial'}">
              ${isCompleted ? 'הושלם (100%)' : `חלקי (${lead.progressPct || 25}%)`}
            </span>
          </td>
          <td>${escapeHtml(lead.tracking?.sourceLabel || 'ישיר')}</td>
          <td>
            <span class="status-badge ${escapeHtml(lead.crmStatus || 'new')}">
              ${escapeHtml(crmStatusObj.label)}
            </span>
          </td>
          <td>
            <div class="row-actions" onclick="event.stopPropagation()">
              <a href="tel:${escapeHtml(lead.phone)}" class="icon-btn" title="חיוג">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>
              <a href="https://wa.me/972${escapeHtml((lead.phone || '').replace(/^0/, ''))}?text=${encodeURIComponent(`שלום ${lead.fullName || ''}, קיבלנו את פנייתך במחשבון הזכויות של משרד עורכי דין בן לולו סיבוני.`)}" target="_blank" class="icon-btn wa" title="וואטסאפ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 2C6.504 2 2.008 6.494 2.008 12.02c0 1.766.462 3.49 1.339 5.01L2 22l5.107-1.338a9.97 9.97 0 0 0 4.924 1.298h.004c5.526 0 10.022-4.494 10.022-10.02S17.557 2 12.031 2z"/></svg>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Mobile View
    mobileListEl.innerHTML = leads.map((lead) => {
      const isCompleted = lead.completionStatus === 'completed';
      const crmStatusObj = CRM_STATUSES.find((s) => s.value === lead.crmStatus) || CRM_STATUSES[0];
      return `
        <div class="mobile-lead-card" data-lead-id="${escapeHtml(lead.id)}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <strong class="lead-name">${escapeHtml(lead.fullName || 'ללא שם')}</strong>
            <span class="status-badge ${escapeHtml(lead.crmStatus || 'new')}">${escapeHtml(crmStatusObj.label)}</span>
          </div>
          <div style="font-size:0.86rem; color:var(--ink); margin-bottom:0.5rem;">
            <bdo dir="ltr">${escapeHtml(lead.phone || '-')}</bdo> • ${escapeHtml(lead.tracking?.sourceLabel || 'ישיר')}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="completion-tag ${isCompleted ? 'completed' : 'partial'}">
              ${isCompleted ? 'שאלון הושלם' : `ננטש בשלב ${lead.lastStepLabel || 'התחלה'}`}
            </span>
            <div class="row-actions" onclick="event.stopPropagation()">
              <a href="tel:${escapeHtml(lead.phone)}" class="icon-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>
              <a href="https://wa.me/972${escapeHtml((lead.phone || '').replace(/^0/, ''))}" target="_blank" class="icon-btn wa"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 2C6.504 2 2.008 6.494 2.008 12.02c0 1.766.462 3.49 1.339 5.01L2 22l5.107-1.338a9.97 9.97 0 0 0 4.924 1.298h.004c5.526 0 10.022-4.494 10.022-10.02S17.557 2 12.031 2z"/></svg></a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Row Click Events
    document.querySelectorAll('[data-lead-id]').forEach((el) => {
      el.addEventListener('click', () => {
        openLeadDrawer(el.dataset.leadId);
      });
    });
  }

  /* ========================================================================
     Lead Detail Drawer
     ======================================================================== */
  function openLeadDrawer(leadId) {
    const lead = uiState.leads.find((l) => l.id === leadId);
    if (!lead) return;

    uiState.activeLeadId = leadId;
    drawerTitle.textContent = lead.fullName || 'פרטי פנייה';

    const crmStatusObj = CRM_STATUSES.find((s) => s.value === lead.crmStatus) || CRM_STATUSES[0];
    drawerStatusPill.className = `status-badge ${lead.crmStatus || 'new'}`;
    drawerStatusPill.textContent = crmStatusObj.label;

    const date = new Date(lead.createdAt).toLocaleString('he-IL');
    const answers = lead.answers || {};

    let evaluationHtml = '';
    if (Array.isArray(lead.evaluation?.tracks)) {
      evaluationHtml = `
        <div>
          <div class="drawer-section-title">מסלולי זכויות שאותרו (${lead.evaluation.tracks.length})</div>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${lead.evaluation.tracks.map((t) => `
              <div style="background:#fff; border:1px solid var(--border); border-radius:6px; padding:0.65rem;">
                <div style="font-weight:700; color:var(--ink);">${escapeHtml(t.title)}</div>
                <div style="font-size:0.8rem; color:var(--ink-muted); margin-top:2px;">${escapeHtml(t.badge || '')} • ${escapeHtml(t.action || '')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    drawerContent.innerHTML = `
      <!-- Contact & Action Box -->
      <div style="background:#fff; border:1.5px solid var(--border); border-radius:10px; padding:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div>
            <div style="font-size:1.15rem; font-weight:800;">${escapeHtml(lead.fullName || 'ללא שם')}</div>
            <div style="font-family:var(--font-display); font-size:1rem; color:var(--ink);"><bdo dir="ltr">${escapeHtml(lead.phone)}</bdo></div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <a href="tel:${escapeHtml(lead.phone)}" class="btn btn-gold" style="padding:0.4rem 0.9rem;">חיוג</a>
            <a href="https://wa.me/972${escapeHtml((lead.phone || '').replace(/^0/, ''))}?text=${encodeURIComponent(`שלום ${lead.fullName || ''}, קיבלנו את פנייתך במחשבון הזכויות של משרד עורכי דין בן לולו סיבוני.`)}" target="_blank" class="btn" style="background:#25d366; color:#fff; padding:0.4rem 0.9rem;">וואטסאפ</a>
          </div>
        </div>
        <div style="font-size:0.78rem; color:var(--ink-muted);">
          מועד פנייה: <bdi dir="ltr">${escapeHtml(date)}</bdi> • מקור: <strong>${escapeHtml(lead.tracking?.sourceLabel || 'ישיר')}</strong>
        </div>
      </div>

      <!-- CRM Status & Notes -->
      <div style="background:var(--cream-deep); border-radius:8px; padding:1rem;">
        <label for="drawer-crm-status" style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.35rem;">סטטוס טיפול ב-CRM:</label>
        <select id="drawer-crm-status" style="width:100%; padding:0.5rem; border-radius:6px; border:1px solid var(--border); margin-bottom:0.85rem; font-family:inherit;">
          ${CRM_STATUSES.map((st) => `
            <option value="${st.value}" ${lead.crmStatus === st.value ? 'selected' : ''}>${st.label}</option>
          `).join('')}
        </select>

        <label for="drawer-notes" style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.35rem;">הערות פנימיות של המשרד:</label>
        <textarea id="drawer-notes" class="drawer-notes-textarea" placeholder="לדוגמה: שיחה בוצעה, נקבעה פגישה במשרד ליום שלישי...">${escapeHtml(lead.notes || '')}</textarea>
      </div>

      ${evaluationHtml}

      <!-- Detailed Answers Breakdown -->
      <div>
        <div class="drawer-section-title">תשובות מפורטות מהשאלון</div>
        <div class="drawer-data-list">
          <div class="data-item">
            <span class="data-label">עילת פגיעה:</span>
            <span class="data-val">${escapeHtml(Array.isArray(answers.causes) ? answers.causes.map((c) => CAUSE_LABELS[c] || c).join(', ') : '-')}</span>
          </div>
          <div class="data-item">
            <span class="data-label">גיל ומגדר:</span>
            <span class="data-val">${answers.age ? `${answers.age} (${answers.gender === 'female' ? 'אישה' : answers.gender === 'male' ? 'גבר' : 'לא צוין'})` : '-'}</span>
          </div>
          <div class="data-item">
            <span class="data-label">תעסוקה והכנסה:</span>
            <span class="data-val">${answers.employment_status || '-'} • ${answers.income_bracket || '-'}</span>
          </div>
          <div class="data-item">
            <span class="data-label">מועד המקרה:</span>
            <span class="data-val">${answers.timing || '-'}</span>
          </div>
          <div class="data-item">
            <span class="data-label">חומרת פגיעה:</span>
            <span class="data-val">${answers.residual_impact || '-'}</span>
          </div>
          <div class="data-item">
            <span class="data-label">תיעוד רפואי:</span>
            <span class="data-val">${answers.medical_docs || '-'}</span>
          </div>
          <div class="data-item">
            <span class="data-label">אחוזי נכות שנקבעו:</span>
            <span class="data-val">${answers.disability_percent || 'טרם נקבעו'}</span>
          </div>
          <div class="data-item">
            <span class="data-label">ייצוג משפטי קודם:</span>
            <span class="data-val">${answers.representation || 'ללא ייצוג'}</span>
          </div>
        </div>
      </div>
    `;

    drawerBackdrop.hidden = false;
    drawerEl.hidden = false;

    // Attach events inside drawer
    document.getElementById('drawer-crm-status').addEventListener('change', (e) => {
      lead.crmStatus = e.target.value;
      saveLeads();
      renderDashboard();
      drawerStatusPill.className = `status-badge ${lead.crmStatus}`;
      drawerStatusPill.textContent = CRM_STATUSES.find((s) => s.value === lead.crmStatus)?.label || '';
      showToast('סטטוס CRM עודכן בהצלחה');
    });

    document.getElementById('drawer-notes').addEventListener('input', (e) => {
      lead.notes = e.target.value;
      saveLeads();
    });
  }

  function closeLeadDrawer() {
    drawerBackdrop.hidden = true;
    drawerEl.hidden = true;
    uiState.activeLeadId = null;
  }

  drawerCloseBtn.addEventListener('click', closeLeadDrawer);
  drawerBackdrop.addEventListener('click', closeLeadDrawer);

  /* ========================================================================
     CSV Export
     ======================================================================== */
  btnExportCsv.addEventListener('click', () => {
    if (uiState.leads.length === 0) {
      showToast('אין לידים לייצוא');
      return;
    }

    const headers = ['ID', 'תאריך', 'שם מלא', 'טלפון', 'סטטוס בדיקה', 'סטטוס CRM', 'עילה עיקרית', 'מקור הגעה', 'הערות'];
    const rows = uiState.leads.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleString('he-IL'),
      `"${(l.fullName || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      l.completionStatus === 'completed' ? 'הושלם' : 'חלקי',
      CRM_STATUSES.find((s) => s.value === l.crmStatus)?.label || l.crmStatus,
      Array.isArray(l.answers?.causes) ? l.answers.causes.join('; ') : '',
      `"${l.tracking?.sourceLabel || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bls_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('קובץ CSV הורד בהצלחה');
  });

  /* ========================================================================
     Toolbar Events
     ======================================================================== */
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      uiState.filter = btn.dataset.filter;
      renderDashboard();
    });
  });

  searchInput.addEventListener('input', (e) => {
    uiState.search = e.target.value;
    renderDashboard();
  });

  // Init
  if (checkSessionAuth()) {
    uiState.authenticated = true;
    authGateEl.hidden = true;
    adminAppEl.hidden = false;
    loadLeads();
  } else {
    authGateEl.hidden = false;
    adminAppEl.hidden = true;
  }
})();
