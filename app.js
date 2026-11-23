/**
 * מחשבון מיצוי זכויות — בן לולו סיבוני משרד עורכי דין
 * גרסה בעברית בלבד (RTL מלא)
 * ארכיטקטורה עצמאית ונקייה (Pure Vanilla JS)
 * לכידת לידים מיידית • סנכרון לדשבורד bhvuk • תמיכה בוובהוק
 */

(function () {
  'use strict';

  const LEADS_DB_KEY = 'bls_law_leads_db_v1';
  const STORAGE_KEY = 'bls_law_wizard_draft_v1';
  const TRACKING_SESSION_KEY = 'bls_law_tracking_v1';

  function generateLeadId() {
    return `bls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function captureTracking() {
    let existing = {};
    try {
      const raw = sessionStorage.getItem(TRACKING_SESSION_KEY);
      if (raw) existing = JSON.parse(raw) || {};
    } catch (_) {}

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || existing.utm_source || '';
    const utmMedium = params.get('utm_medium') || existing.utm_medium || '';
    const utmCampaign = params.get('utm_campaign') || existing.utm_campaign || '';
    const utmTerm = params.get('utm_term') || existing.utm_term || '';
    const utmContent = params.get('utm_content') || existing.utm_content || '';
    const gclid = params.get('gclid') || existing.gclid || '';
    const fbclid = params.get('fbclid') || existing.fbclid || '';
    const referrer = existing.referrer || document.referrer || '';

    let sourceLabel = 'ישיר / אורגני';
    const srcLower = utmSource.toLowerCase();
    const refLower = referrer.toLowerCase();
    if (gclid || srcLower.includes('google') || srcLower.includes('adwords')) {
      sourceLabel = gclid || utmMedium.toLowerCase().includes('cpc') ? 'Google Ads' : 'Google';
    } else if (fbclid || srcLower.includes('facebook') || srcLower.includes('fb') || srcLower.includes('ig') || srcLower.includes('instagram') || srcLower.includes('meta')) {
      sourceLabel = 'Facebook / Instagram';
    } else if (srcLower.includes('tiktok')) {
      sourceLabel = 'TikTok';
    } else if (utmSource) {
      sourceLabel = utmSource;
    } else if (refLower.includes('google.')) {
      sourceLabel = 'חיפוש גוגל';
    } else if (refLower.includes('blslaw.co.il')) {
      sourceLabel = 'אתר ראשי blslaw';
    }

    const tracking = {
      sourceLabel,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
      gclid,
      fbclid,
      referrer
    };

    try {
      sessionStorage.setItem(TRACKING_SESSION_KEY, JSON.stringify(tracking));
    } catch (_) {}
    return tracking;
  }

  function fireAnalyticsEvent(eventName, payload = {}) {
    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: eventName, ...payload });
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }
      if (typeof window.fbq === 'function') {
        if (eventName === 'rights_lead_captured') {
          window.fbq('track', 'Lead', payload);
        } else if (eventName === 'rights_quiz_completed') {
          window.fbq('track', 'CompleteRegistration', payload);
        } else if (eventName === 'rights_whatsapp_click' || eventName === 'rights_phone_click') {
          window.fbq('track', 'Contact', payload);
        }
      }
    } catch (_) {}
  }

  const state = {
    leadId: generateLeadId(),
    view: 'intro', // 'intro' | 'step' | 'results'
    stepIndex: 0,
    tracking: captureTracking(),
    answers: {
      fullName: '',
      phone: '',
      consentContact: true,
      gender: null,
      age: '',
      causes: [],
      employment_status: null,
      income_bracket: null,
      disability_percent: null,
      timing: null,
      residual_impact: null,
      medical_docs: null,
      insurances: [],
      medical_areas: [],
      representation: null
    }
  };

  // DOM References
  const appShell = document.getElementById('app-shell');
  const progressContainer = document.getElementById('progress-container');
  const progressStepLabel = document.getElementById('progress-step-label');
  const progressPercent = document.getElementById('progress-percent');
  const progressFill = document.getElementById('progress-fill');
  const footerResetBtn = document.getElementById('footer-reset-btn');
  const footerResetSep = document.getElementById('footer-reset-sep');
  const toastEl = document.getElementById('toast');

  function t() {
    return window.RIGHTS_I18N.he;
  }

  function getQuestions() {
    return window.RIGHTS_QUESTIONS || [];
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isValidIsraeliPhone(raw) {
    const digits = String(raw || '').replace(/[\s\-()]/g, '').replace(/^\+972/, '0');
    return /^0(5[0-9]|7[2-9]|[23489])\d{7}$/.test(digits);
  }

  function formatPhoneClean(raw) {
    const digits = String(raw || '').replace(/[^\d]/g, '');
    if (digits.length === 10 && digits.startsWith('05')) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return raw.trim();
  }

  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 3200);
  }

  function applyDocumentLanguage() {
    const dict = t();
    document.documentElement.lang = 'he';
    document.documentElement.dir = 'rtl';
    document.title = dict.pageTitle;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('header-phone-label', dict.headerPhoneLabel);
    setText('footer-firm-name', dict.footerFirm);
    setText('footer-firm-address', dict.footerAddress);
    setText('footer-phone-label', dict.footerPhoneLabel);
    setText('footer-disclaimer', dict.footerDisclaimer);
    setText('footer-site-link', dict.footerSiteLink);
    setText('footer-admin-link', dict.footerAdminLink);
    setText('footer-reset-btn', dict.footerReset);
    setText('wa-fab-label', dict.waFabLabel);

    const waFab = document.getElementById('wa-fab-link');
    if (waFab) {
      waFab.href = `https://wa.me/${window.BLS_FIRM_CONFIG.whatsappNumber}?text=${encodeURIComponent(dict.waFabMessage)}`;
    }
  }

  /* ========================================================================
     Lead Storage & CRM Sync (Instant Lead Capture)
     ======================================================================== */
  function syncLeadToAdminDB(options = {}) {
    const name = state.answers.fullName.trim();
    const phoneRaw = state.answers.phone.trim();
    if (name.length < 2 && phoneRaw.replace(/\D/g, '').length < 7) return;

    try {
      const existingRaw = localStorage.getItem(LEADS_DB_KEY);
      const db = existingRaw ? JSON.parse(existingRaw) : [];
      if (!Array.isArray(db)) return;

      const questions = getQuestions();
      const totalSteps = questions.length;
      const isCompleted = options.completed === true || state.view === 'results';
      const currentQ = questions[Math.min(state.stepIndex, totalSteps - 1)];

      const heRailLabels = window.RIGHTS_I18N.he.railLabels;
      const lastStepLabel = isCompleted ? 'הושלם במלואו' : (heRailLabels[currentQ?.id] || 'פרטי קשר');

      const progressPct = isCompleted
        ? 100
        : Math.min(95, Math.max(12, Math.round(((state.stepIndex + 1) / totalSteps) * 100)));

      const evaluatedHe = isCompleted ? window.evaluateRights(state.answers) : null;
      const nowIso = new Date().toISOString();

      const idx = db.findIndex((item) => item.id === state.leadId);
      const prev = idx >= 0 ? db[idx] : null;

      const record = {
        id: state.leadId,
        createdAt: prev?.createdAt || nowIso,
        updatedAt: nowIso,
        language: 'he',
        fullName: name || 'ללא שם',
        phone: formatPhoneClean(phoneRaw),
        phoneValid: isValidIsraeliPhone(phoneRaw),
        consentContact: Boolean(state.answers.consentContact),
        completionStatus: isCompleted ? 'completed' : 'partial',
        crmStatus: prev?.crmStatus || 'new',
        notes: prev?.notes || '',
        lastStepId: currentQ?.id || 'contact',
        lastStepLabel,
        progressPct,
        tracking: state.tracking,
        answers: JSON.parse(JSON.stringify(state.answers)),
        evaluation: evaluatedHe
      };

      if (idx >= 0) {
        db[idx] = record;
      } else {
        db.unshift(record);
      }
      localStorage.setItem(LEADS_DB_KEY, JSON.stringify(db));

      // Trigger custom storage event for live open tabs
      window.dispatchEvent(new Event('storage'));

      // Webhook dispatch if configured
      const webhookUrl = window.BLS_FIRM_CONFIG.webhookUrl || window.BLS_WEBHOOK_URL;
      if (webhookUrl && (isCompleted || !prev)) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
          keepalive: true
        }).catch(() => {});
      }
    } catch (_) {}
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        leadId: state.leadId,
        view: state.view,
        stepIndex: state.stepIndex,
        answers: state.answers
      }));
    } catch (_) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.answers) {
        if (parsed.leadId) state.leadId = parsed.leadId;
        Object.assign(state.answers, parsed.answers);
        if (parsed.view === 'step' || parsed.view === 'results') {
          state.view = parsed.view;
          state.stepIndex = Number(parsed.stepIndex) || 0;
        }
      }
    } catch (_) {}
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    state.leadId = generateLeadId();
    state.view = 'intro';
    state.stepIndex = 0;
    state.answers = {
      fullName: '',
      phone: '',
      consentContact: true,
      gender: null,
      age: '',
      causes: [],
      employment_status: null,
      income_bracket: null,
      disability_percent: null,
      timing: null,
      residual_impact: null,
      medical_docs: null,
      insurances: [],
      medical_areas: [],
      representation: null
    };
    render();
    showToast(t().ui.resetToast);
  }

  /* ========================================================================
     Render Views (Intro, Step Console, Results)
     ======================================================================== */

  function renderIntro() {
    progressContainer.hidden = true;
    if (footerResetBtn) footerResetBtn.hidden = true;
    if (footerResetSep) footerResetSep.hidden = true;

    const dict = t();
    const intro = dict.intro;

    appShell.innerHTML = `
      <section class="intro-monolith" aria-labelledby="intro-title">
        <div class="intro-badge-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>${escapeHtml(intro.kicker)}</span>
        </div>

        <h1 id="intro-title" class="intro-title">
          <span class="title-gold">${escapeHtml(intro.titleAccent)}</span>
          ${escapeHtml(intro.titleRest)}
        </h1>

        <p class="intro-lead">${escapeHtml(intro.lead)}</p>

        <div class="intro-pillars">
          ${intro.trustItems.map((item) => `
            <div class="pillar-card">
              <div class="pillar-title">${escapeHtml(item.title)}</div>
              <div class="pillar-desc">${escapeHtml(item.desc)}</div>
            </div>
          `).join('')}
        </div>

        <div class="intro-cta-group">
          <button type="button" id="start-quiz-btn" class="btn-gold-primary">
            <span>${escapeHtml(intro.cta)}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <span class="intro-note">${escapeHtml(intro.note)}</span>
        </div>
      </section>
    `;

    document.getElementById('start-quiz-btn').addEventListener('click', () => {
      state.view = 'step';
      state.stepIndex = 0;
      fireAnalyticsEvent('rights_quiz_start');
      saveDraft();
      render();
    });
  }

  function renderStep() {
    progressContainer.hidden = false;
    if (footerResetBtn) footerResetBtn.hidden = false;
    if (footerResetSep) footerResetSep.hidden = false;

    const dict = t();
    const questions = getQuestions();
    const totalSteps = questions.length;
    const curIndex = Math.min(Math.max(0, state.stepIndex), totalSteps - 1);
    const qConfig = questions[curIndex];
    const stepDict = dict.steps[qConfig.id] || {};

    const pct = Math.round(((curIndex + 1) / totalSteps) * 100);
    progressStepLabel.textContent = dict.ui.stepOf(curIndex + 1, totalSteps);
    progressPercent.textContent = `${pct}%`;
    progressFill.style.inlineSize = `${pct}%`;

    // Dynamic Domain Proof banner
    const primaryCause = state.answers.causes[0] || 'default';
    const proof = dict.domainProofs[primaryCause] || dict.domainProofs.default;

    let formBodyHtml = '';

    // Step Type 1: Contact
    if (qConfig.type === 'contact') {
      formBodyHtml = `
        <div class="form-group">
          <label for="input-fullname" class="form-label">${escapeHtml(dict.ui.nameLabel)}</label>
          <input
            id="input-fullname"
            type="text"
            class="form-input"
            placeholder="${escapeHtml(dict.ui.namePlaceholder)}"
            value="${escapeHtml(state.answers.fullName)}"
            autocomplete="name"
          >
        </div>
        <div class="form-group">
          <label for="input-phone" class="form-label">${escapeHtml(dict.ui.phoneLabel)}</label>
          <input
            id="input-phone"
            type="tel"
            dir="ltr"
            class="form-input"
            placeholder="050-1234567"
            value="${escapeHtml(state.answers.phone)}"
            autocomplete="tel"
          >
          <div class="form-help">${escapeHtml(dict.ui.phoneHelp)}</div>
        </div>
        <label class="consent-box">
          <input
            type="checkbox"
            id="input-consent"
            ${state.answers.consentContact ? 'checked' : ''}
          >
          <span>${escapeHtml(dict.ui.consentText)}</span>
        </label>
      `;
    }

    // Step Type 2: Demographics (Gender + Age)
    else if (qConfig.type === 'demographics') {
      formBodyHtml = `
        <div class="dual-section">
          <div class="dual-title">${escapeHtml(stepDict.genderTitle)}</div>
          <div class="options-grid" style="grid-template-columns: repeat(3, 1fr);">
            ${stepDict.genderOptions.map((opt) => `
              <div
                class="option-pill is-radio ${state.answers.gender === opt.value ? 'is-selected' : ''}"
                data-demo-gender="${escapeHtml(opt.value)}"
              >
                <div class="option-checkbox-indicator">
                  ${state.answers.gender === opt.value ? '<div style="inline-size:8px;block-size:8px;border-radius:50%;background:currentColor;"></div>' : ''}
                </div>
                <div class="option-main-label">${escapeHtml(opt.label)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dual-section">
          <div class="dual-title">${escapeHtml(dict.ui.ageLabel)}</div>
          <input
            type="number"
            id="input-age-number"
            class="form-input"
            style="max-inline-size: 200px; margin-block-end: 1rem;"
            min="1"
            max="115"
            placeholder="35"
            value="${escapeHtml(state.answers.age)}"
          >
          <div class="form-help" style="margin-block-end: 0.65rem;">${escapeHtml(dict.ui.agePresetsLabel)}</div>
          <div class="options-grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));">
            ${stepDict.agePresets.map((preset) => `
              <div
                class="option-pill is-radio ${Number(state.answers.age) === preset.value ? 'is-selected' : ''}"
                data-preset-age="${preset.value}"
              >
                <div class="option-main-label">${escapeHtml(preset.label)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Step Type 3: Multi select (Causes, Medical areas)
    else if (qConfig.type === 'multi') {
      const selectedArr = qConfig.id === 'causes' ? state.answers.causes : state.answers.medical_areas;
      formBodyHtml = `
        <div class="options-grid">
          ${stepDict.options.map((opt) => {
            const isSelected = selectedArr.includes(opt.value);
            return `
              <div
                class="option-pill ${isSelected ? 'is-selected' : ''}"
                data-multi-val="${escapeHtml(opt.value)}"
              >
                <div class="option-checkbox-indicator">
                  ${isSelected ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                </div>
                <div class="option-text-group">
                  <div class="option-main-label">${escapeHtml(opt.label)}</div>
                  ${opt.hint ? `<div class="option-hint">${escapeHtml(opt.hint)}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Step Type 4: Single select
    else if (qConfig.type === 'single') {
      let currentVal = null;
      if (qConfig.id === 'disability_percent') currentVal = state.answers.disability_percent;
      if (qConfig.id === 'representation') currentVal = state.answers.representation;

      formBodyHtml = `
        <div class="options-grid">
          ${stepDict.options.map((opt) => {
            const isSelected = currentVal === opt.value;
            return `
              <div
                class="option-pill is-radio ${isSelected ? 'is-selected' : ''}"
                data-single-val="${escapeHtml(opt.value)}"
              >
                <div class="option-checkbox-indicator">
                  ${isSelected ? '<div style="inline-size:8px;block-size:8px;border-radius:50%;background:currentColor;"></div>' : ''}
                </div>
                <div class="option-text-group">
                  <div class="option-main-label">${escapeHtml(opt.label)}</div>
                  ${opt.hint ? `<div class="option-hint">${escapeHtml(opt.hint)}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Step Type 5: Dual Select
    else if (qConfig.type === 'dual_select') {
      if (qConfig.id === 'work_income') {
        formBodyHtml = `
          <div class="dual-section">
            <div class="dual-title">${escapeHtml(stepDict.employmentTitle)}</div>
            <div class="options-grid">
              ${stepDict.employmentOptions.map((opt) => `
                <div
                  class="option-pill is-radio ${state.answers.employment_status === opt.value ? 'is-selected' : ''}"
                  data-dual-part="emp"
                  data-dual-val="${escapeHtml(opt.value)}"
                >
                  <div class="option-checkbox-indicator">
                    ${state.answers.employment_status === opt.value ? '<div style="inline-size:8px;block-size:8px;border-radius:50%;background:currentColor;"></div>' : ''}
                  </div>
                  <div class="option-main-label">${escapeHtml(opt.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="dual-section">
            <div class="dual-title">${escapeHtml(stepDict.incomeTitle)}</div>
            <div class="options-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
              ${stepDict.incomeOptions.map((opt) => `
                <div
                  class="option-pill is-radio ${state.answers.income_bracket === opt.value ? 'is-selected' : ''}"
                  data-dual-part="inc"
                  data-dual-val="${escapeHtml(opt.value)}"
                >
                  <div class="option-checkbox-indicator">
                    ${state.answers.income_bracket === opt.value ? '<div style="inline-size:8px;block-size:8px;border-radius:50%;background:currentColor;"></div>' : ''}
                  </div>
                  <div class="option-main-label">${escapeHtml(opt.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (qConfig.id === 'incident_details') {
        formBodyHtml = `
          <div class="dual-section">
            <div class="dual-title">${escapeHtml(stepDict.timingTitle)}</div>
            <div class="options-grid">
              ${stepDict.timingOptions.map((opt) => `
                <div
                  class="option-pill is-radio ${state.answers.timing === opt.value ? 'is-selected' : ''}"
                  data-dual-part="timing"
                  data-dual-val="${escapeHtml(opt.value)}"
                >
                  <div class="option-checkbox-indicator">
                    ${state.answers.timing === opt.value ? '<div style="inline-size:8px;block-size:8px;border-radius:50%;background:currentColor;"></div>' : ''}
                  </div>
                  <div class="option-main-label">${escapeHtml(opt.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="dual-section">
            <div class="dual-title">${escapeHtml(stepDict.residualTitle)}</div>
            <div class="options-grid">
              ${stepDict.residualOptions.map((opt) => `
                <div
                  class="option-pill is-radio ${state.answers.residual_impact === opt.value ? 'is-selected' : ''}"
                  data-dual-part="residual"
                  data-dual-val="${escapeHtml(opt.value)}"
                >
                  <div class="option-checkbox-indicator">
                    ${state.answers.residual_impact === opt.value ? '<div style="inline-size:8px;block-size:8px;border-radius:50%;background:currentColor;"></div>' : ''}
                  </div>
                  <div class="option-main-label">${escapeHtml(opt.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (qConfig.id === 'docs_insurance') {
        formBodyHtml = `
          <div class="dual-section">
            <div class="dual-title">${escapeHtml(stepDict.docsTitle)}</div>
            <div class="options-grid">
              ${stepDict.docsOptions.map((opt) => `
                <div
                  class="option-pill is-radio ${state.answers.medical_docs === opt.value ? 'is-selected' : ''}"
                  data-dual-part="docs"
                  data-dual-val="${escapeHtml(opt.value)}"
                >
                  <div class="option-checkbox-indicator">
                    ${state.answers.medical_docs === opt.value ? '<div style="inline-size:8px;block-size:8px;border-radius:50%;background:currentColor;"></div>' : ''}
                  </div>
                  <div class="option-main-label">${escapeHtml(opt.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="dual-section">
            <div class="dual-title">${escapeHtml(stepDict.insuranceTitle)}</div>
            <div class="options-grid">
              ${stepDict.insuranceOptions.map((opt) => {
                const isSelected = state.answers.insurances.includes(opt.value);
                return `
                  <div
                    class="option-pill ${isSelected ? 'is-selected' : ''}"
                    data-dual-part="insurances_multi"
                    data-dual-val="${escapeHtml(opt.value)}"
                  >
                    <div class="option-checkbox-indicator">
                      ${isSelected ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                    <div class="option-main-label">${escapeHtml(opt.label)}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }
    }

    appShell.innerHTML = `
      <div class="stepper-layout">
        <aside class="step-rail">
          <div class="rail-heading">${escapeHtml(dict.ui.railTitle(curIndex + 1, totalSteps))}</div>
          <ul class="rail-steps-list">
            ${questions.map((q, idx) => {
              const label = dict.railLabels[q.id] || q.id;
              let cls = 'rail-item';
              if (idx < curIndex) cls += ' is-done';
              if (idx === curIndex) cls += ' is-current';
              return `
                <li class="${cls}">
                  <span class="rail-dot">${idx + 1}</span>
                  <span>${escapeHtml(label)}</span>
                </li>
              `;
            }).join('')}
          </ul>
          <div class="rail-trust-box">
            ${escapeHtml(dict.ui.railTrust)}
          </div>
        </aside>

        <section class="question-card" aria-labelledby="q-title">
          <span class="q-badge">${escapeHtml(stepDict.badge || '')}</span>
          <h2 id="q-title" class="q-title">${escapeHtml(stepDict.title || '')}</h2>
          <p class="q-subtitle">${escapeHtml(stepDict.subtitle || '')}</p>

          ${curIndex > 0 ? `
            <div class="domain-proof-banner">
              <span class="proof-badge">${escapeHtml(proof.badge)}</span>
              <span class="proof-text">${escapeHtml(proof.text)}</span>
            </div>
          ` : ''}

          <div class="q-form-body">
            ${formBodyHtml}
          </div>

          <div class="step-actions">
            <button type="button" id="step-back-btn" class="btn-secondary">
              ${escapeHtml(dict.ui.back)}
            </button>
            <button type="button" id="step-next-btn" class="btn-primary">
              ${curIndex === totalSteps - 1 ? escapeHtml(dict.ui.showResults) : escapeHtml(dict.ui.next)}
            </button>
          </div>
        </section>
      </div>
    `;

    bindStepEvents(qConfig, curIndex, totalSteps);
  }

  function bindStepEvents(qConfig, curIndex, totalSteps) {
    const dict = t();

    if (qConfig.type === 'contact') {
      const nameInput = document.getElementById('input-fullname');
      const phoneInput = document.getElementById('input-phone');
      const consentBox = document.getElementById('input-consent');

      nameInput.addEventListener('input', (e) => {
        state.answers.fullName = e.target.value;
        saveDraft();
      });
      phoneInput.addEventListener('input', (e) => {
        state.answers.phone = e.target.value;
        saveDraft();
      });
      consentBox.addEventListener('change', (e) => {
        state.answers.consentContact = e.target.checked;
        saveDraft();
      });
    }

    if (qConfig.type === 'demographics') {
      document.querySelectorAll('[data-demo-gender]').forEach((el) => {
        el.addEventListener('click', () => {
          state.answers.gender = el.dataset.demoGender;
          saveDraft();
          renderStep();
        });
      });
      const ageInput = document.getElementById('input-age-number');
      if (ageInput) {
        ageInput.addEventListener('input', (e) => {
          state.answers.age = e.target.value;
          saveDraft();
        });
      }
      document.querySelectorAll('[data-preset-age]').forEach((el) => {
        el.addEventListener('click', () => {
          state.answers.age = el.dataset.presetAge;
          saveDraft();
          renderStep();
        });
      });
    }

    if (qConfig.type === 'multi') {
      document.querySelectorAll('[data-multi-val]').forEach((el) => {
        el.addEventListener('click', () => {
          const val = el.dataset.multiVal;
          const targetArr = qConfig.id === 'causes' ? state.answers.causes : state.answers.medical_areas;
          const idx = targetArr.indexOf(val);
          if (idx >= 0) targetArr.splice(idx, 1);
          else targetArr.push(val);
          saveDraft();
          renderStep();
        });
      });
    }

    if (qConfig.type === 'single') {
      document.querySelectorAll('[data-single-val]').forEach((el) => {
        el.addEventListener('click', () => {
          const val = el.dataset.singleVal;
          if (qConfig.id === 'disability_percent') state.answers.disability_percent = val;
          if (qConfig.id === 'representation') state.answers.representation = val;
          saveDraft();
          renderStep();
        });
      });
    }

    if (qConfig.type === 'dual_select') {
      document.querySelectorAll('[data-dual-part]').forEach((el) => {
        el.addEventListener('click', () => {
          const part = el.dataset.dualPart;
          const val = el.dataset.dualVal;

          if (part === 'emp') state.answers.employment_status = val;
          if (part === 'inc') state.answers.income_bracket = val;
          if (part === 'timing') state.answers.timing = val;
          if (part === 'residual') state.answers.residual_impact = val;
          if (part === 'docs') state.answers.medical_docs = val;
          if (part === 'insurances_multi') {
            const arr = state.answers.insurances;
            const idx = arr.indexOf(val);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(val);
          }
          saveDraft();
          renderStep();
        });
      });
    }

    const backBtn = document.getElementById('step-back-btn');
    const nextBtn = document.getElementById('step-next-btn');

    backBtn.addEventListener('click', () => {
      if (curIndex === 0) {
        state.view = 'intro';
      } else {
        state.stepIndex = curIndex - 1;
      }
      saveDraft();
      render();
    });

    nextBtn.addEventListener('click', () => {
      if (qConfig.type === 'contact') {
        if (state.answers.fullName.trim().length < 2) {
          showToast(dict.ui.errName);
          return;
        }
        if (!isValidIsraeliPhone(state.answers.phone)) {
          showToast(dict.ui.errPhone);
          return;
        }
        syncLeadToAdminDB({ completed: false });
        fireAnalyticsEvent('rights_lead_captured', { lead_id: state.leadId });
      }

      if (qConfig.type === 'demographics') {
        const ageNum = Number(state.answers.age);
        if (!state.answers.gender || !ageNum || ageNum < 1 || ageNum > 115) {
          showToast(dict.ui.errDemo);
          return;
        }
      }

      if (qConfig.type === 'multi') {
        const arr = qConfig.id === 'causes' ? state.answers.causes : state.answers.medical_areas;
        if (arr.length === 0) {
          showToast(dict.ui.errMulti);
          return;
        }
      }

      if (qConfig.type === 'single') {
        const val = qConfig.id === 'disability_percent' ? state.answers.disability_percent : state.answers.representation;
        if (!val) {
          showToast(dict.ui.errMulti);
          return;
        }
      }

      if (qConfig.type === 'dual_select') {
        if (qConfig.id === 'work_income') {
          if (!state.answers.employment_status || !state.answers.income_bracket) {
            showToast(dict.ui.errDual);
            return;
          }
        } else if (qConfig.id === 'incident_details') {
          if (!state.answers.timing || !state.answers.residual_impact) {
            showToast(dict.ui.errDual);
            return;
          }
        } else if (qConfig.id === 'docs_insurance') {
          if (!state.answers.medical_docs) {
            showToast(dict.ui.errDual);
            return;
          }
        }
      }

      syncLeadToAdminDB({ completed: false });

      if (curIndex < totalSteps - 1) {
        state.stepIndex = curIndex + 1;
        saveDraft();
        render();
        window.scrollTo({ top: 120, behavior: 'smooth' });
      } else {
        state.view = 'results';
        syncLeadToAdminDB({ completed: true });
        fireAnalyticsEvent('rights_quiz_completed', { lead_id: state.leadId });
        saveDraft();
        render();
        window.scrollTo({ top: 80, behavior: 'smooth' });
      }
    });
  }

  function renderResults() {
    progressContainer.hidden = true;
    if (footerResetBtn) footerResetBtn.hidden = false;
    if (footerResetSep) footerResetSep.hidden = false;

    const dict = t();
    const evaluation = window.evaluateRights(state.answers);
    const dateStr = new Date().toLocaleDateString('he-IL');

    appShell.innerHTML = `
      <section class="results-card" aria-labelledby="results-title">
        <div class="results-header-monolith">
          <div class="results-eyebrow">${escapeHtml(dict.ui.resultsEyebrow)} • ${dateStr}</div>
          <h1 id="results-title" class="results-main-title">
            ${state.answers.fullName ? dict.ui.resultsTitleNamed(escapeHtml(state.answers.fullName)) : dict.ui.resultsTitleAnon}
          </h1>
          <p class="results-lead">
            ${dict.ui.resultsLeadHigh(evaluation.totalCount, evaluation.highPriorityCount)}
          </p>
        </div>

        <div class="kpi-row">
          <div class="kpi-tile">
            <div class="kpi-val highlight">${evaluation.totalCount}</div>
            <div class="kpi-label">${escapeHtml(dict.ui.kpiTracks)}</div>
          </div>
          <div class="kpi-tile">
            <div class="kpi-val highlight">${evaluation.highPriorityCount}</div>
            <div class="kpi-label">${escapeHtml(dict.ui.kpiPriority)}</div>
          </div>
          <div class="kpi-tile">
            <div class="kpi-val">${escapeHtml(evaluation.consultationFee)}</div>
            <div class="kpi-label">${escapeHtml(dict.ui.kpiConsult)}</div>
          </div>
        </div>

        ${evaluation.warning ? `
          <div class="warning-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 1 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>${escapeHtml(evaluation.warning)}</div>
          </div>
        ` : ''}

        <div class="tracks-container">
          ${evaluation.tracks.map((track) => {
            let statusCls = 'status-likely';
            let statusText = dict.ui.legendLikely;
            if (track.probability === 'possible') {
              statusCls = 'status-possible';
              statusText = dict.ui.legendPossible;
            } else if (track.probability === 'urgent') {
              statusCls = 'status-urgent';
              statusText = dict.ui.legendUrgent;
            }

            return `
              <article class="track-item-card">
                <div class="track-top">
                  <h3 class="track-title">${escapeHtml(track.title)}</h3>
                  <span class="status-tag ${statusCls}">${statusText}</span>
                </div>
                <p class="track-summary">${escapeHtml(track.summary)}</p>
                <div class="track-action-box">
                  <span class="track-action-label">${escapeHtml(dict.ui.nextStepPrefix)} </span>
                  <span>${escapeHtml(track.action)}</span>
                </div>
              </article>
            `;
          }).join('')}
        </div>

        <section class="results-cta-section">
          <h2 class="cta-box-title">
            ${state.answers.fullName ? dict.ui.ctaTitleNamed(escapeHtml(state.answers.fullName)) : dict.ui.ctaTitleAnon}
          </h2>
          <p class="cta-box-desc">
            ${state.answers.phone ? dict.ui.ctaBodyPhone(escapeHtml(state.answers.phone)) : dict.ui.ctaBodyGeneric}
          </p>

          <div class="cta-buttons-row">
            <a
              id="cta-whatsapp-link"
              href="https://wa.me/${window.BLS_FIRM_CONFIG.whatsappNumber}?text=${encodeURIComponent(`שלום, אני ${state.answers.fullName || 'לקוח/ה'}. סיימתי את שאלון מיצוי הזכויות באתר בן לולו סיבוני עם ${evaluation.totalCount} אפיקי פיצוי. אשמח לתיאום שיחת ייעוץ.`)}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-cta-whatsapp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 2C6.504 2 2.008 6.494 2.008 12.02c0 1.766.462 3.49 1.339 5.01L2 22l5.107-1.338a9.97 9.97 0 0 0 4.924 1.298h.004c5.526 0 10.022-4.494 10.022-10.02S17.557 2 12.031 2z"/></svg>
              <span>${escapeHtml(dict.ui.ctaWhatsapp)}</span>
            </a>

            <a
              id="cta-phone-link"
              href="tel:${window.BLS_FIRM_CONFIG.phoneDial}"
              class="btn-cta-call"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>${escapeHtml(dict.ui.ctaCall)} ${window.BLS_FIRM_CONFIG.phone}</span>
            </a>
          </div>
        </section>

        <div class="results-actions-bar">
          <button type="button" id="print-results-btn" class="btn-secondary">
            ${escapeHtml(dict.ui.btnPrint)}
          </button>
          <button type="button" id="edit-results-btn" class="btn-secondary">
            ${escapeHtml(dict.ui.btnEdit)}
          </button>
          <button type="button" id="restart-results-btn" class="btn-secondary">
            ${escapeHtml(dict.ui.btnRestart)}
          </button>
        </div>
      </section>
    `;

    document.getElementById('cta-whatsapp-link')?.addEventListener('click', () => {
      fireAnalyticsEvent('rights_whatsapp_click');
    });
    document.getElementById('cta-phone-link')?.addEventListener('click', () => {
      fireAnalyticsEvent('rights_phone_click');
    });
    document.getElementById('print-results-btn')?.addEventListener('click', () => {
      window.print();
    });
    document.getElementById('edit-results-btn')?.addEventListener('click', () => {
      state.view = 'step';
      state.stepIndex = 0;
      saveDraft();
      render();
    });
    document.getElementById('restart-results-btn')?.addEventListener('click', () => {
      resetAll();
    });
  }

  function render() {
    applyDocumentLanguage();
    if (state.view === 'intro') {
      renderIntro();
    } else if (state.view === 'step') {
      renderStep();
    } else if (state.view === 'results') {
      renderResults();
    }
  }

  if (footerResetBtn) {
    footerResetBtn.addEventListener('click', resetAll);
  }

  // Init
  loadDraft();
  render();
})();
