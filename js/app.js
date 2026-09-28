/**
 * FitPulse Main Application Controller
 * Handles UI interactions, PWA installation, rendering, debounced auto-saves.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    selectedDate: getTodayYMD(),
    currentWorkout: null,
    activeTab: 'tab-log',
    settings: StorageManager.getSettings(),
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(), // 0-11
    deferredPrompt: null,
    saveDebounceTimer: null,
    selectedMuscleFilter: 'ALL',
    searchQuery: ''
  };

  // Helper: Format YYYY-MM-DD from Date object using local time
  function getTodayYMD() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateHuman(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const todayStr = getTodayYMD();

    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formatted = d.toLocaleDateString(undefined, options);

    if (dateStr === todayStr) {
      return `Today, ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    return formatted;
  }

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const DOM = {
    // Header & PWA
    btnPwaInstall: document.getElementById('btn-pwa-install'),
    btnQuickTheme: document.getElementById('btn-quick-theme'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    brandLogoBtn: document.getElementById('brand-logo-btn'),

    // Navigation
    mainNav: document.getElementById('main-nav'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Date Navigator
    btnPrevDay: document.getElementById('btn-prev-day'),
    btnNextDay: document.getElementById('btn-next-day'),
    btnGoToday: document.getElementById('btn-go-today'),
    btnDateTrigger: document.getElementById('btn-date-trigger'),
    datePickerInput: document.getElementById('date-picker-input'),
    dateDisplayText: document.getElementById('date-display-text'),
    saveStatusIndicator: document.getElementById('save-status-indicator'),
    saveStatusText: document.getElementById('save-status-text'),

    // Daily Stats Strip
    statExercisesCount: document.getElementById('stat-exercises-count'),
    statSetsCompleted: document.getElementById('stat-sets-completed'),
    statCardioMins: document.getElementById('stat-cardio-mins'),
    statCardioCals: document.getElementById('stat-cardio-cals'),

    // Routine & Rest Day
    routineNameInput: document.getElementById('routine-name-input'),
    restDayCheckbox: document.getElementById('rest-day-checkbox'),
    restDayBanner: document.getElementById('rest-day-banner'),
    workoutContentSections: document.getElementById('workout-content-sections'),
    btnUnmarkRest: document.getElementById('btn-unmark-rest'),
    routinePresetChips: document.querySelectorAll('.preset-chip'),

    // Strength
    strengthCountBadge: document.getElementById('strength-count-badge'),
    btnOpenExercisePicker: document.getElementById('btn-open-exercise-picker'),
    exercisesListContainer: document.getElementById('exercises-list-container'),
    exercisesEmptyState: document.getElementById('exercises-empty-state'),
    btnEmptyAddExercise: document.getElementById('btn-empty-add-exercise'),

    // Cardio
    cardioCountBadge: document.getElementById('cardio-count-badge'),
    btnAddCardioSession: document.getElementById('btn-add-cardio-session'),
    cardioListContainer: document.getElementById('cardio-list-container'),
    cardioEmptyState: document.getElementById('cardio-empty-state'),
    btnEmptyAddCardio: document.getElementById('btn-empty-add-cardio'),

    // Recovery & Reflection
    energyStarsSelector: document.getElementById('energy-stars-selector'),
    dailyBodyweightInput: document.getElementById('daily-bodyweight-input'),
    dailyNotesTextarea: document.getElementById('daily-notes-textarea'),

    // Calendar & History
    calPrevMonth: document.getElementById('cal-prev-month'),
    calNextMonth: document.getElementById('cal-next-month'),
    calMonthTitle: document.getElementById('cal-month-title'),
    calendarDaysGrid: document.getElementById('calendar-days-grid'),
    historyTimelineContainer: document.getElementById('history-timeline-container'),

    // Stats View
    statsStreakVal: document.getElementById('stats-streak-val'),
    statsWorkoutsVal: document.getElementById('stats-workouts-val'),
    statsSetsVal: document.getElementById('stats-sets-val'),
    statsVolumeVal: document.getElementById('stats-volume-val'),
    statsCardioTimeVal: document.getElementById('stats-cardio-time-val'),
    statsCaloriesVal: document.getElementById('stats-calories-val'),
    personalRecordsContainer: document.getElementById('personal-records-container'),

    // Settings View
    controlWeightUnit: document.getElementById('control-weight-unit'),
    controlDistanceUnit: document.getElementById('control-distance-unit'),
    controlTheme: document.getElementById('control-theme'),
    controlRestSeconds: document.getElementById('control-rest-seconds'),
    settingSoundToggle: document.getElementById('setting-sound-toggle'),
    btnExportBackup: document.getElementById('btn-export-backup'),
    btnImportTrigger: document.getElementById('btn-import-trigger'),
    fileImportInput: document.getElementById('file-import-input'),
    btnLoadSampleData: document.getElementById('btn-load-sample-data'),
    btnClearAllData: document.getElementById('btn-clear-all-data'),

    // Modal: Exercise Picker
    modalExercisePicker: document.getElementById('modal-exercise-picker'),
    btnClosePickerModal: document.getElementById('btn-close-picker-modal'),
    exerciseSearchInput: document.getElementById('exercise-search-input'),
    muscleFilterChips: document.getElementById('muscle-filter-chips'),
    modalExerciseList: document.getElementById('modal-exercise-list'),
    customExerciseNameInput: document.getElementById('custom-exercise-name-input'),
    customExerciseMuscleSelect: document.getElementById('custom-exercise-muscle-select'),
    btnSaveCustomExercise: document.getElementById('btn-save-custom-exercise'),

    // Export Day Workout
    btnHeaderExportDay: document.getElementById('btn-header-export-day'),
    btnExportDay: document.getElementById('btn-export-day'),
    exportDayBtnLabel: document.getElementById('export-day-btn-label'),
    modalExportDay: document.getElementById('modal-export-day'),
    exportModalSubtitle: document.getElementById('export-modal-subtitle'),
    btnCloseExportModal: document.getElementById('btn-close-export-modal'),
    btnDownloadDayJson: document.getElementById('btn-download-day-json'),
    btnCopyDayJson: document.getElementById('btn-copy-day-json'),
    copyJsonBtnText: document.getElementById('copy-json-btn-text'),
    exportDayJsonPreview: document.getElementById('export-day-json-preview'),

    // Toast
    appToast: document.getElementById('app-toast')
  };

  // =========================================================================
  // Initialization
  // =========================================================================
  function init() {
    // 1. Check or load initial sample data if completely empty
    StorageManager.populateSampleDataIfEmpty();

    // 2. Apply saved theme & settings
    applyTheme(state.settings.theme);
    updateUnitLabels();

    // 3. Initialize gym rest timer UI
    if (window.RestTimer) {
      window.RestTimer.init();
    }

    // 4. Register PWA Service Worker
    registerServiceWorker();

    // 5. Setup event listeners
    bindEvents();

    // 6. Load current day's workout
    loadDayWorkout(state.selectedDate);

    // 7. Render initial calendar
    renderCalendar();
  }

  // =========================================================================
  // Service Worker & PWA Install
  // =========================================================================
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('FitPulse PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch(err => {
            console.warn('ServiceWorker registration error:', err);
          });
      });
    }

    // Install prompt handler
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      if (DOM.btnPwaInstall) {
        DOM.btnPwaInstall.classList.remove('hidden');
      }
    });

    window.addEventListener('appinstalled', () => {
      state.deferredPrompt = null;
      if (DOM.btnPwaInstall) {
        DOM.btnPwaInstall.classList.add('hidden');
      }
      showToast('FitPulse installed successfully! 🎉');
    });

    if (DOM.btnPwaInstall) {
      DOM.btnPwaInstall.addEventListener('click', async () => {
        if (!state.deferredPrompt) return;
        state.deferredPrompt.prompt();
        const choice = await state.deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          console.log('User accepted PWA installation');
        }
        state.deferredPrompt = null;
        DOM.btnPwaInstall.classList.add('hidden');
      });
    }
  }

  // =========================================================================
  // Navigation & Tabs
  // =========================================================================
  function switchTab(tabId) {
    state.activeTab = tabId;

    // Update nav buttons
    DOM.mainNav.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update tab visibility
    DOM.tabContents.forEach(tab => {
      if (tab.id === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Lazy load tab-specific views
    if (tabId === 'tab-history') {
      renderCalendar();
      renderHistoryTimeline();
    } else if (tabId === 'tab-stats') {
      renderStatsView();
    } else if (tabId === 'tab-settings') {
      syncSettingsUI();
    }
  }

  // =========================================================================
  // Theme Management
  // =========================================================================
  function applyTheme(theme) {
    state.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    StorageManager.saveSettings({ theme });

    if (theme === 'light') {
      DOM.themeIconSun.classList.add('hidden');
      DOM.themeIconMoon.classList.remove('hidden');
    } else {
      DOM.themeIconSun.classList.remove('hidden');
      DOM.themeIconMoon.classList.add('hidden');
    }
  }

  function toggleTheme() {
    const next = state.settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function updateUnitLabels() {
    const wUnit = state.settings.weightUnit || 'kg';
    document.querySelectorAll('.unit-label-weight').forEach(el => {
      el.textContent = wUnit;
    });
  }

  // =========================================================================
  // Workout Day Loading & Saving
  // =========================================================================
  function loadDayWorkout(dateStr) {
    state.selectedDate = dateStr;
    state.currentWorkout = StorageManager.getDayWorkout(dateStr);

    // Update Date Header
    DOM.dateDisplayText.textContent = formatDateHuman(dateStr);
    DOM.datePickerInput.value = dateStr;

    // Update Export button label
    if (DOM.exportDayBtnLabel) {
      DOM.exportDayBtnLabel.textContent = (dateStr === getTodayYMD()) ? "Export Today's Workout (JSON)" : "Export Workout (JSON)";
    }

    // Populate Routine & Rest Day
    DOM.routineNameInput.value = state.currentWorkout.routineName || '';
    DOM.restDayCheckbox.checked = !!state.currentWorkout.isRestDay;

    // Toggle rest day UI
    if (state.currentWorkout.isRestDay) {
      DOM.restDayBanner.classList.remove('hidden');
      DOM.workoutContentSections.classList.add('hidden');
    } else {
      DOM.restDayBanner.classList.add('hidden');
      DOM.workoutContentSections.classList.remove('hidden');
    }

    // Populate Recovery & Notes
    DOM.dailyBodyweightInput.value = state.currentWorkout.bodyWeight || '';
    DOM.dailyNotesTextarea.value = state.currentWorkout.generalNotes || '';
    renderEnergyStars(state.currentWorkout.energyLevel || 0);

    // Render Strength & Cardio
    renderExercises();
    renderCardio();
    updateDailyStats();
    markSavedStatus();
  }

  function saveCurrentWorkoutDebounced() {
    markSavingStatus();
    if (state.saveDebounceTimer) {
      clearTimeout(state.saveDebounceTimer);
    }
    state.saveDebounceTimer = setTimeout(() => {
      try {
        StorageManager.saveDayWorkout(state.selectedDate, state.currentWorkout);
        markSavedStatus();
        updateDailyStats();
      } catch (e) {
        console.error('Failed to save workout:', e);
        DOM.saveStatusText.textContent = 'Save error';
      }
    }, 300);
  }

  function markSavingStatus() {
    DOM.saveStatusIndicator.classList.remove('saved');
    DOM.saveStatusIndicator.classList.add('saving');
    DOM.saveStatusText.textContent = 'Saving...';
  }

  function markSavedStatus() {
    DOM.saveStatusIndicator.classList.remove('saving');
    DOM.saveStatusIndicator.classList.add('saved');
    DOM.saveStatusText.textContent = 'Saved to device';
  }

  function updateDailyStats() {
    const workout = state.currentWorkout;
    if (!workout || workout.isRestDay) {
      DOM.statExercisesCount.textContent = workout && workout.isRestDay ? 'Rest' : '0';
      DOM.statSetsCompleted.textContent = '0 / 0';
      DOM.statCardioMins.textContent = '0 min';
      DOM.statCardioCals.textContent = '0 kcal';
      return;
    }

    // Exercises & sets
    const exCount = (workout.exercises || []).length;
    let totalSets = 0;
    let completedSets = 0;

    (workout.exercises || []).forEach(ex => {
      if (Array.isArray(ex.sets)) {
        totalSets += ex.sets.length;
        ex.sets.forEach(s => {
          if (s.completed) completedSets++;
        });
      }
    });

    // Cardio
    let cardioMins = 0;
    let cardioCals = 0;
    (workout.cardio || []).forEach(c => {
      cardioMins += parseFloat(c.duration) || 0;
      cardioCals += parseFloat(c.calories) || 0;
    });

    DOM.statExercisesCount.textContent = exCount;
    DOM.statSetsCompleted.textContent = `${completedSets} / ${totalSets}`;
    DOM.statCardioMins.textContent = `${Math.round(cardioMins)} min`;
    DOM.statCardioCals.textContent = `${Math.round(cardioCals)} kcal`;

    DOM.strengthCountBadge.textContent = `${exCount} ${exCount === 1 ? 'exercise' : 'exercises'}`;
    const cCount = (workout.cardio || []).length;
    DOM.cardioCountBadge.textContent = `${cCount} ${cCount === 1 ? 'session' : 'sessions'}`;
  }

  // =========================================================================
  // Strength Exercises & Sets Rendering
  // =========================================================================
  function renderExercises() {
    const container = DOM.exercisesListContainer;
    container.innerHTML = '';

    const exercises = state.currentWorkout.exercises || [];

    if (exercises.length === 0) {
      DOM.exercisesEmptyState.classList.remove('hidden');
      return;
    } else {
      DOM.exercisesEmptyState.classList.add('hidden');
    }

    const weightUnit = state.settings.weightUnit || 'kg';

    exercises.forEach((exercise, exIndex) => {
      const card = document.createElement('div');
      card.className = 'exercise-card';
      card.dataset.index = exIndex;

      // Look up previous workout PR / stats
      const prev = StorageManager.getPreviousPerformance(exercise.name, state.selectedDate);
      const prevHintHTML = prev
        ? `<div class="previous-log-hint">Last (${formatDateHuman(prev.date)}): ${escapeHtml(prev.summary)}</div>`
        : `<div class="previous-log-hint" style="color: var(--text-muted);">First time logging this exercise</div>`;

      // Build Sets rows
      let setsHTML = '';
      (exercise.sets || []).forEach((set, setIndex) => {
        const isDone = !!set.completed;
        const setNum = setIndex + 1;
        const setType = set.type || 'working';

        setsHTML += `
          <tr class="set-row ${isDone ? 'is-done' : ''}" data-set-index="${setIndex}">
            <td class="col-set">
              <span class="set-number-badge">${setNum}</span>
            </td>
            <td class="col-type">
              <select class="set-type-select" data-field="type">
                <option value="working" ${setType === 'working' ? 'selected' : ''}>Work</option>
                <option value="warmup" ${setType === 'warmup' ? 'selected' : ''}>Warm</option>
                <option value="drop" ${setType === 'drop' ? 'selected' : ''}>Drop</option>
                <option value="failure" ${setType === 'failure' ? 'selected' : ''}>Fail</option>
              </select>
            </td>
            <td class="col-weight">
              <input type="number" step="0.5" class="input-num-field set-weight-input" data-field="weight" value="${set.weight !== undefined && set.weight !== null ? set.weight : ''}" placeholder="0">
            </td>
            <td class="col-reps">
              <input type="number" step="1" class="input-num-field set-reps-input" data-field="reps" value="${set.reps !== undefined && set.reps !== null ? set.reps : ''}" placeholder="0">
            </td>
            <td class="col-timer">
              <button type="button" class="btn-icon btn-rest-trigger" data-action="timer" title="Start Rest Timer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
            </td>
            <td class="col-done">
              <button type="button" class="btn-set-check ${isDone ? 'checked' : ''}" data-action="toggle-done" title="Mark Set Done">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </td>
            <td class="col-del">
              <button type="button" class="btn-icon btn-del-set" data-action="delete-set" title="Delete Set">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </td>
          </tr>
        `;
      });

      card.innerHTML = `
        <div class="exercise-card-header">
          <div class="exercise-title-group">
            <div class="exercise-name-row">
              <span class="exercise-name-text">${escapeHtml(exercise.name)}</span>
              <span class="muscle-badge">${escapeHtml(exercise.targetMuscle || 'Other')}</span>
            </div>
            ${prevHintHTML}
          </div>

          <div class="exercise-actions-group">
            <button type="button" class="btn-card-action" data-action="move-up" title="Move Up" ${exIndex === 0 ? 'disabled style="opacity: 0.3;"' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button type="button" class="btn-card-action" data-action="move-down" title="Move Down" ${exIndex === exercises.length - 1 ? 'disabled style="opacity: 0.3;"' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button type="button" class="btn-card-action btn-delete" data-action="delete-exercise" title="Delete Exercise">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <div class="sets-table-wrap">
          <table class="sets-table">
            <thead>
              <tr>
                <th class="col-set">Set</th>
                <th class="col-type">Type</th>
                <th class="col-weight">${weightUnit.toUpperCase()}</th>
                <th class="col-reps">Reps</th>
                <th class="col-timer">Rest</th>
                <th class="col-done">Done</th>
                <th class="col-del"></th>
              </tr>
            </thead>
            <tbody>
              ${setsHTML}
            </tbody>
          </table>
        </div>

        <div class="exercise-card-footer">
          <div class="exercise-footer-actions">
            <button type="button" class="btn-add-set" data-action="add-set">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Add Set</span>
            </button>
            <button type="button" class="btn-copy-set" data-action="copy-last-set">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Duplicate Last Set</span>
            </button>
          </div>
          <input type="text" class="exercise-note-input" data-field="exercise-notes" value="${escapeHtml(exercise.notes || '')}" placeholder="Exercise cues (e.g., bench angle, grip width, seat setting)...">
        </div>
      `;

      bindExerciseCardEvents(card, exIndex);
      container.appendChild(card);
    });
  }

  function bindExerciseCardEvents(card, exIndex) {
    const exercise = state.currentWorkout.exercises[exIndex];

    // Card Header Actions
    card.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const setRow = btn.closest('.set-row');
        const setIndex = setRow ? parseInt(setRow.dataset.setIndex, 10) : null;

        if (action === 'delete-exercise') {
          if (confirm(`Remove "${exercise.name}" from today's workout?`)) {
            state.currentWorkout.exercises.splice(exIndex, 1);
            saveCurrentWorkoutDebounced();
            renderExercises();
            showToast('Exercise removed');
          }
        } else if (action === 'move-up') {
          if (exIndex > 0) {
            const temp = state.currentWorkout.exercises[exIndex];
            state.currentWorkout.exercises[exIndex] = state.currentWorkout.exercises[exIndex - 1];
            state.currentWorkout.exercises[exIndex - 1] = temp;
            saveCurrentWorkoutDebounced();
            renderExercises();
          }
        } else if (action === 'move-down') {
          if (exIndex < state.currentWorkout.exercises.length - 1) {
            const temp = state.currentWorkout.exercises[exIndex];
            state.currentWorkout.exercises[exIndex] = state.currentWorkout.exercises[exIndex + 1];
            state.currentWorkout.exercises[exIndex + 1] = temp;
            saveCurrentWorkoutDebounced();
            renderExercises();
          }
        } else if (action === 'add-set') {
          const sets = exercise.sets || [];
          const lastSet = sets[sets.length - 1];
          const newSet = {
            id: 's_' + Date.now(),
            type: 'working',
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false
          };
          if (!exercise.sets) exercise.sets = [];
          exercise.sets.push(newSet);
          saveCurrentWorkoutDebounced();
          renderExercises();
        } else if (action === 'copy-last-set') {
          const sets = exercise.sets || [];
          if (sets.length === 0) {
            exercise.sets.push({ id: 's_' + Date.now(), type: 'working', weight: '', reps: '', completed: false });
          } else {
            const last = sets[sets.length - 1];
            exercise.sets.push({
              id: 's_' + Date.now(),
              type: last.type || 'working',
              weight: last.weight,
              reps: last.reps,
              completed: false
            });
          }
          saveCurrentWorkoutDebounced();
          renderExercises();
          showToast('Set duplicated');
        } else if (action === 'delete-set' && setIndex !== null) {
          exercise.sets.splice(setIndex, 1);
          saveCurrentWorkoutDebounced();
          renderExercises();
        } else if (action === 'toggle-done' && setIndex !== null) {
          const targetSet = exercise.sets[setIndex];
          targetSet.completed = !targetSet.completed;

          if (targetSet.completed) {
            // Start gym rest timer automatically
            if (window.RestTimer) {
              const restSec = state.settings.defaultRestSeconds || 60;
              window.RestTimer.start(restSec);
            }
          }
          saveCurrentWorkoutDebounced();
          renderExercises();
        } else if (action === 'timer') {
          if (window.RestTimer) {
            const restSec = state.settings.defaultRestSeconds || 60;
            window.RestTimer.start(restSec);
          }
        }
      });
    });

    // Real-time Input Handlers for sets
    card.querySelectorAll('.set-row').forEach(row => {
      const setIdx = parseInt(row.dataset.setIndex, 10);
      const targetSet = exercise.sets[setIdx];
      if (!targetSet) return;

      const weightInput = row.querySelector('.set-weight-input');
      const repsInput = row.querySelector('.set-reps-input');
      const typeSelect = row.querySelector('.set-type-select');

      if (weightInput) {
        weightInput.addEventListener('input', (e) => {
          targetSet.weight = e.target.value;
          saveCurrentWorkoutDebounced();
        });
      }

      if (repsInput) {
        repsInput.addEventListener('input', (e) => {
          targetSet.reps = e.target.value;
          saveCurrentWorkoutDebounced();
        });
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
          targetSet.type = e.target.value;
          saveCurrentWorkoutDebounced();
        });
      }
    });

    // Exercise Notes input
    const noteInput = card.querySelector('[data-field="exercise-notes"]');
    if (noteInput) {
      noteInput.addEventListener('input', (e) => {
        exercise.notes = e.target.value;
        saveCurrentWorkoutDebounced();
      });
    }
  }

  // =========================================================================
  // Cardio Training Rendering
  // =========================================================================
  function renderCardio() {
    const container = DOM.cardioListContainer;
    container.innerHTML = '';

    const cardioSessions = state.currentWorkout.cardio || [];

    if (cardioSessions.length === 0) {
      DOM.cardioEmptyState.classList.remove('hidden');
      return;
    } else {
      DOM.cardioEmptyState.classList.add('hidden');
    }

    const distUnit = state.settings.distanceUnit || 'km';
    const presets = StorageManager.getCardioPresets();

    cardioSessions.forEach((session, cIndex) => {
      const card = document.createElement('div');
      card.className = 'cardio-card';
      card.dataset.index = cIndex;

      // Calculate pace / speed
      const duration = parseFloat(session.duration) || 0;
      const distance = parseFloat(session.distance) || 0;
      let paceSpeedText = '';

      if (duration > 0 && distance > 0) {
        const isCycling = (session.type || '').toLowerCase().includes('cycl') || (session.type || '').toLowerCase().includes('bike');
        if (isCycling) {
          const speed = (distance / (duration / 60)).toFixed(1);
          paceSpeedText = `Speed: ${speed} ${distUnit}/h`;
        } else {
          const paceMinutes = duration / distance;
          const pMin = Math.floor(paceMinutes);
          const pSec = Math.round((paceMinutes - pMin) * 60);
          paceSpeedText = `Pace: ${pMin}:${String(pSec).padStart(2, '0')} /${distUnit}`;
        }
      }

      // Presets options
      let presetOpts = '';
      presets.forEach(p => {
        presetOpts += `<option value="${escapeHtml(p)}" ${session.type === p ? 'selected' : ''}>${escapeHtml(p)}</option>`;
      });

      card.innerHTML = `
        <div class="cardio-header-row">
          <select class="cardio-type-select" data-field="type">
            ${presetOpts}
          </select>
          <button type="button" class="btn-card-action btn-delete" data-action="delete-cardio" title="Remove Cardio Session">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>

        <div class="cardio-metrics-grid">
          <div class="cardio-field-wrap">
            <span class="cardio-field-label">Duration (Min)</span>
            <input type="number" step="1" class="cardio-input" data-field="duration" value="${session.duration || ''}" placeholder="0">
          </div>

          <div class="cardio-field-wrap">
            <span class="cardio-field-label">Distance (${distUnit})</span>
            <input type="number" step="0.05" class="cardio-input" data-field="distance" value="${session.distance || ''}" placeholder="0.0">
          </div>

          <div class="cardio-field-wrap">
            <span class="cardio-field-label">Calories (kcal)</span>
            <input type="number" step="5" class="cardio-input" data-field="calories" value="${session.calories || ''}" placeholder="0">
          </div>

          <div class="cardio-field-wrap">
            <span class="cardio-field-label">Intensity</span>
            <select class="cardio-input" data-field="intensity" style="font-size: 0.85rem;">
              <option value="Low" ${session.intensity === 'Low' ? 'selected' : ''}>Low</option>
              <option value="Moderate" ${session.intensity === 'Moderate' || !session.intensity ? 'selected' : ''}>Moderate</option>
              <option value="High" ${session.intensity === 'High' ? 'selected' : ''}>High</option>
              <option value="Max Effort" ${session.intensity === 'Max Effort' ? 'selected' : ''}>Max Effort</option>
            </select>
          </div>
        </div>

        <div class="cardio-footer-row">
          <div>
            ${paceSpeedText ? `<span class="pace-pill">${escapeHtml(paceSpeedText)}</span>` : '<span style="font-size: 0.75rem; color: var(--text-muted);">Enter duration & distance for pace</span>'}
          </div>
          <input type="text" class="exercise-note-input" data-field="notes" value="${escapeHtml(session.notes || '')}" placeholder="Notes (heart rate, incline, route)..." style="flex: 1; max-width: 320px;">
        </div>
      `;

      bindCardioEvents(card, cIndex);
      container.appendChild(card);
    });
  }

  function bindCardioEvents(card, cIndex) {
    const session = state.currentWorkout.cardio[cIndex];

    const delBtn = card.querySelector('[data-action="delete-cardio"]');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        state.currentWorkout.cardio.splice(cIndex, 1);
        saveCurrentWorkoutDebounced();
        renderCardio();
        showToast('Cardio session removed');
      });
    }

    card.querySelectorAll('[data-field]').forEach(input => {
      const field = input.dataset.field;
      const eventName = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';

      input.addEventListener(eventName, (e) => {
        session[field] = e.target.value;

        // Auto estimate calories if duration entered and calories empty
        if (field === 'duration' && !session.calories) {
          const mins = parseFloat(e.target.value) || 0;
          if (mins > 0) {
            // Rough 9 kcal per minute standard for moderate cardio
            session.calories = Math.round(mins * 9.5);
            const calInput = card.querySelector('[data-field="calories"]');
            if (calInput) calInput.value = session.calories;
          }
        }

        saveCurrentWorkoutDebounced();
        if (field === 'duration' || field === 'distance' || field === 'type') {
          // Re-render to update calculated pace badge smoothly
          clearTimeout(state.cardioPaceTimer);
          state.cardioPaceTimer = setTimeout(() => renderCardio(), 600);
        }
      });
    });
  }

  // =========================================================================
  // Recovery: Energy Stars
  // =========================================================================
  function renderEnergyStars(level) {
    DOM.energyStarsSelector.querySelectorAll('.star-btn').forEach(btn => {
      const val = parseInt(btn.dataset.val, 10);
      if (val <= level) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // Exercise Picker Modal
  // =========================================================================
  function openExercisePickerModal() {
    DOM.modalExercisePicker.classList.add('active');
    DOM.exerciseSearchInput.value = '';
    state.searchQuery = '';
    state.selectedMuscleFilter = 'ALL';

    DOM.muscleFilterChips.querySelectorAll('.filter-chip').forEach(c => {
      if (c.dataset.muscle === 'ALL') c.classList.add('active');
      else c.classList.remove('active');
    });

    renderPickerList();
    setTimeout(() => DOM.exerciseSearchInput.focus(), 100);
  }

  function closeExercisePickerModal() {
    DOM.modalExercisePicker.classList.remove('active');
  }

  function renderPickerList() {
    const listEl = DOM.modalExerciseList;
    listEl.innerHTML = '';

    const allExercises = StorageManager.getExerciseLibrary();
    const q = state.searchQuery.toLowerCase().trim();
    const muscle = state.selectedMuscleFilter;

    const filtered = allExercises.filter(ex => {
      const matchesSearch = !q || ex.name.toLowerCase().includes(q) || ex.muscle.toLowerCase().includes(q);
      const matchesMuscle = muscle === 'ALL' || ex.muscle.toLowerCase() === muscle.toLowerCase();
      return matchesSearch && matchesMuscle;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">No exercises matched. Create a custom one below!</div>`;
      return;
    }

    filtered.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'exercise-pick-item';
      item.innerHTML = `
        <div>
          <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(ex.name)}</div>
          <span class="muscle-badge" style="font-size: 0.65rem;">${escapeHtml(ex.muscle)}</span>
        </div>
        <button type="button" class="btn-primary-add" style="padding: 4px 10px; font-size: 0.78rem;">
          + Add
        </button>
      `;

      item.addEventListener('click', () => {
        addExerciseToWorkout(ex.name, ex.muscle);
        closeExercisePickerModal();
      });

      listEl.appendChild(item);
    });
  }

  function addExerciseToWorkout(name, muscle) {
    if (!state.currentWorkout.exercises) {
      state.currentWorkout.exercises = [];
    }

    // Look up previous sets for this exercise to pre-populate smart working sets
    const prev = StorageManager.getPreviousPerformance(name, state.selectedDate);
    let initialSets = [];

    if (prev && prev.rawSets && prev.rawSets.length > 0) {
      // Replicate previous sets structure with uncompleted status
      initialSets = prev.rawSets.map((s, idx) => ({
        id: 's_' + Date.now() + '_' + idx,
        type: s.type || 'working',
        weight: s.weight,
        reps: s.reps,
        completed: false
      }));
    } else {
      // Default 3 standard sets
      initialSets = [
        { id: 's_' + Date.now() + '_1', type: 'warmup', weight: '', reps: '', completed: false },
        { id: 's_' + Date.now() + '_2', type: 'working', weight: '', reps: '', completed: false },
        { id: 's_' + Date.now() + '_3', type: 'working', weight: '', reps: '', completed: false }
      ];
    }

    const newEx = {
      id: 'ex_' + Date.now(),
      name: name,
      targetMuscle: muscle || 'Other',
      notes: '',
      sets: initialSets
    };

    state.currentWorkout.exercises.push(newEx);
    saveCurrentWorkoutDebounced();
    renderExercises();
    showToast(`Added "${name}"`);
  }

  // =========================================================================
  // Export Today's Workout (JSON)
  // =========================================================================
  function openExportDayModal() {
    const dateStr = state.selectedDate;
    const isToday = (dateStr === getTodayYMD());

    if (DOM.exportModalSubtitle) {
      DOM.exportModalSubtitle.textContent = isToday
        ? `Today's Workout (${formatDateHuman(dateStr)})`
        : `Workout for ${formatDateHuman(dateStr)}`;
    }

    const jsonStr = StorageManager.exportDayWorkoutJSON(dateStr);
    if (DOM.exportDayJsonPreview) {
      DOM.exportDayJsonPreview.textContent = jsonStr;
    }

    if (DOM.modalExportDay) {
      DOM.modalExportDay.classList.add('active');
    }
  }

  function closeExportDayModal() {
    if (DOM.modalExportDay) {
      DOM.modalExportDay.classList.remove('active');
    }
    if (DOM.copyJsonBtnText) {
      DOM.copyJsonBtnText.textContent = 'Copy to Clipboard';
    }
  }

  function downloadDayWorkoutJSON() {
    const dateStr = state.selectedDate;
    const jsonStr = StorageManager.exportDayWorkoutJSON(dateStr);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpulse_workout_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Workout JSON downloaded! 📁');
  }

  async function copyDayWorkoutJSON() {
    const dateStr = state.selectedDate;
    const jsonStr = StorageManager.exportDayWorkoutJSON(dateStr);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      } else {
        throw new Error('Clipboard API not available');
      }
      if (DOM.copyJsonBtnText) {
        DOM.copyJsonBtnText.textContent = 'Copied! ✓';
      }
      showToast('JSON copied to clipboard! 📋');
      setTimeout(() => {
        if (DOM.copyJsonBtnText) {
          DOM.copyJsonBtnText.textContent = 'Copy to Clipboard';
        }
      }, 2500);
    } catch (e) {
      // Fallback selection
      if (DOM.exportDayJsonPreview) {
        const range = document.createRange();
        range.selectNodeContents(DOM.exportDayJsonPreview);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        showToast('JSON selected - press Ctrl+C to copy');
      }
    }
  }

  // =========================================================================
  // Calendar & History View
  // =========================================================================
  function renderCalendar() {
    const year = state.calYear;
    const month = state.calMonth;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    DOM.calMonthTitle.textContent = `${monthNames[month]} ${year}`;

    const grid = DOM.calendarDaysGrid;
    grid.innerHTML = '';

    // Day headers (Sun - Sat)
    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayHeaders.forEach(dh => {
      const h = document.createElement('div');
      h.className = 'calendar-day-header';
      h.textContent = dh;
      grid.appendChild(h);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const allWorkouts = StorageManager.getAllWorkouts();
    const todayStr = getTodayYMD();

    // Prev month padding cells
    for (let i = firstDay - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.textContent = daysInPrevMonth - i;
      grid.appendChild(cell);
    }

    // Current month cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const workout = allWorkouts[cellDateStr];

      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      if (cellDateStr === todayStr) cell.classList.add('is-today');
      if (cellDateStr === state.selectedDate) cell.classList.add('is-selected');

      const dayNumber = document.createElement('span');
      dayNumber.textContent = day;
      cell.appendChild(dayNumber);

      // Indicator dots for activities
      if (workout) {
        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'cal-dots-wrap';

        if (workout.isRestDay) {
          const dot = document.createElement('span');
          dot.className = 'cal-dot rest';
          dotsWrap.appendChild(dot);
        } else {
          if (workout.exercises && workout.exercises.length > 0) {
            const dot = document.createElement('span');
            dot.className = 'cal-dot strength';
            dotsWrap.appendChild(dot);
          }
          if (workout.cardio && workout.cardio.length > 0) {
            const dot = document.createElement('span');
            dot.className = 'cal-dot cardio';
            dotsWrap.appendChild(dot);
          }
        }
        cell.appendChild(dotsWrap);
      }

      cell.addEventListener('click', () => {
        loadDayWorkout(cellDateStr);
        switchTab('tab-log');
      });

      grid.appendChild(cell);
    }
  }

  function renderHistoryTimeline() {
    const container = DOM.historyTimelineContainer;
    container.innerHTML = '';

    const allWorkouts = StorageManager.getAllWorkouts();
    const activeDates = StorageManager.getAllDatesWithData().sort().reverse();

    if (activeDates.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No workouts recorded yet. Start logging on the Daily Log tab!</div>`;
      return;
    }

    activeDates.forEach(dateStr => {
      const day = allWorkouts[dateStr];
      if (!day) return;

      const card = document.createElement('div');
      card.className = 'history-card';

      let routineName = day.routineName || (day.isRestDay ? 'Rest & Recovery Day' : 'Workout');
      const exCount = (day.exercises || []).length;
      let totalSets = 0;
      (day.exercises || []).forEach(e => {
        if (e.sets) totalSets += e.sets.length;
      });

      let cardioMins = 0;
      (day.cardio || []).forEach(c => {
        cardioMins += parseFloat(c.duration) || 0;
      });

      card.innerHTML = `
        <div class="history-card-top">
          <span class="history-date">${formatDateHuman(dateStr)}</span>
          <span class="history-routine">${escapeHtml(routineName)}</span>
        </div>
        <div class="history-card-details">
          ${day.isRestDay ? '<span style="color: #60a5fa;">🧘 Rest Day</span>' : ''}
          ${exCount > 0 ? `<span>🏋️ ${exCount} exercises (${totalSets} sets)</span>` : ''}
          ${cardioMins > 0 ? `<span>🏃 ${Math.round(cardioMins)} min cardio</span>` : ''}
          ${day.energyLevel ? `<span>⚡ Level ${day.energyLevel}/5</span>` : ''}
        </div>
      `;

      card.addEventListener('click', () => {
        loadDayWorkout(dateStr);
        switchTab('tab-log');
      });

      container.appendChild(card);
    });
  }

  // =========================================================================
  // Stats & Progress View
  // =========================================================================
  function renderStatsView() {
    const stats = StorageManager.getGlobalStats();
    const weightUnit = state.settings.weightUnit || 'kg';

    DOM.statsStreakVal.textContent = `${stats.currentStreak} ${stats.currentStreak === 1 ? 'Day' : 'Days'}`;
    DOM.statsWorkoutsVal.textContent = stats.totalWorkouts;
    DOM.statsSetsVal.textContent = `${stats.totalCompletedSets} / ${stats.totalSets}`;
    DOM.statsVolumeVal.innerHTML = `${stats.totalWeightVolume.toLocaleString()} <span style="font-size: 1rem;">${weightUnit}</span>`;
    DOM.statsCardioTimeVal.textContent = `${(stats.totalCardioMinutes / 60).toFixed(1)} hrs`;
    DOM.statsCaloriesVal.textContent = `${stats.totalCardioCalories.toLocaleString()} kcal`;

    // Render PRs
    const prContainer = DOM.personalRecordsContainer;
    prContainer.innerHTML = '';

    const records = StorageManager.getExerciseRecords();
    const exNames = Object.keys(records);

    if (exNames.length === 0) {
      prContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">Log your weighted strength exercises to see your Personal Records!</div>`;
      return;
    }

    exNames.sort().forEach(name => {
      const rec = records[name];
      const card = document.createElement('div');
      card.className = 'pr-card';
      card.innerHTML = `
        <div>
          <div class="pr-ex-name">${escapeHtml(name)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Recorded on ${formatDateHuman(rec.date)}</div>
        </div>
        <div style="text-align: right;">
          <div class="pr-best-val">${rec.maxWeight} ${weightUnit}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${rec.repsAtMax} reps</div>
        </div>
      `;
      prContainer.appendChild(card);
    });
  }

  // =========================================================================
  // Settings Tab Sync
  // =========================================================================
  function syncSettingsUI() {
    // Weight
    DOM.controlWeightUnit.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.unit === state.settings.weightUnit);
    });

    // Distance
    DOM.controlDistanceUnit.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.unit === state.settings.distanceUnit);
    });

    // Theme
    DOM.controlTheme.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeVal === state.settings.theme);
    });

    // Rest Timer
    if (DOM.controlRestSeconds) {
      DOM.controlRestSeconds.querySelectorAll('.segmented-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.rest, 10) === (state.settings.defaultRestSeconds || 60));
      });
    }

    // Sound
    DOM.settingSoundToggle.checked = !!state.settings.soundEnabled;
  }

  // =========================================================================
  // Event Bindings
  // =========================================================================
  function bindEvents() {
    // Brand Logo click returns to today
    DOM.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadDayWorkout(getTodayYMD());
      switchTab('tab-log');
    });

    // Quick Theme Toggle in Header
    DOM.btnQuickTheme.addEventListener('click', toggleTheme);

    // Tab Navigation
    DOM.mainNav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
      });
    });

    // Date Navigation
    DOM.btnPrevDay.addEventListener('click', () => {
      shiftDate(-1);
    });

    DOM.btnNextDay.addEventListener('click', () => {
      shiftDate(1);
    });

    DOM.btnGoToday.addEventListener('click', () => {
      loadDayWorkout(getTodayYMD());
    });

    DOM.btnDateTrigger.addEventListener('click', () => {
      if (typeof DOM.datePickerInput.showPicker === 'function') {
        DOM.datePickerInput.showPicker();
      } else {
        DOM.datePickerInput.focus();
      }
    });

    DOM.datePickerInput.addEventListener('change', (e) => {
      if (e.target.value) {
        loadDayWorkout(e.target.value);
      }
    });

    // Routine Name Input
    DOM.routineNameInput.addEventListener('input', (e) => {
      state.currentWorkout.routineName = e.target.value;
      saveCurrentWorkoutDebounced();
    });

    // Routine Preset Quick Fill Chips
    DOM.routinePresetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const rName = chip.dataset.routine;
        DOM.routineNameInput.value = rName;
        state.currentWorkout.routineName = rName;
        saveCurrentWorkoutDebounced();
        showToast(`Set routine: ${rName}`);
      });
    });

    // Rest Day Toggle
    DOM.restDayCheckbox.addEventListener('change', (e) => {
      const isRest = e.target.checked;
      state.currentWorkout.isRestDay = isRest;
      if (isRest) {
        DOM.restDayBanner.classList.remove('hidden');
        DOM.workoutContentSections.classList.add('hidden');
      } else {
        DOM.restDayBanner.classList.add('hidden');
        DOM.workoutContentSections.classList.remove('hidden');
      }
      saveCurrentWorkoutDebounced();
    });

    DOM.btnUnmarkRest.addEventListener('click', () => {
      DOM.restDayCheckbox.checked = false;
      state.currentWorkout.isRestDay = false;
      DOM.restDayBanner.classList.add('hidden');
      DOM.workoutContentSections.classList.remove('hidden');
      saveCurrentWorkoutDebounced();
    });

    // Add Exercise Buttons
    DOM.btnOpenExercisePicker.addEventListener('click', openExercisePickerModal);
    DOM.btnEmptyAddExercise.addEventListener('click', openExercisePickerModal);

    // Modal Close
    DOM.btnClosePickerModal.addEventListener('click', closeExercisePickerModal);
    DOM.modalExercisePicker.addEventListener('click', (e) => {
      if (e.target === DOM.modalExercisePicker) closeExercisePickerModal();
    });

    // Modal Exercise Search & Filter
    DOM.exerciseSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderPickerList();
    });

    DOM.muscleFilterChips.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.muscleFilterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedMuscleFilter = chip.dataset.muscle;
        renderPickerList();
      });
    });

    // Custom Exercise Add
    DOM.btnSaveCustomExercise.addEventListener('click', () => {
      const name = DOM.customExerciseNameInput.value.trim();
      const muscle = DOM.customExerciseMuscleSelect.value;
      if (!name) {
        showToast('Please enter an exercise name');
        return;
      }
      StorageManager.addCustomExercise(name, muscle);
      addExerciseToWorkout(name, muscle);
      DOM.customExerciseNameInput.value = '';
      closeExercisePickerModal();
    });

    // Cardio Add Buttons
    function addCardioHandler() {
      if (!state.currentWorkout.cardio) {
        state.currentWorkout.cardio = [];
      }
      const newCardio = {
        id: 'car_' + Date.now(),
        type: 'Outdoor Running',
        duration: 20,
        distance: '',
        calories: '',
        intensity: 'Moderate',
        notes: ''
      };
      state.currentWorkout.cardio.push(newCardio);
      saveCurrentWorkoutDebounced();
      renderCardio();
      showToast('Cardio session added');
    }

    DOM.btnAddCardioSession.addEventListener('click', addCardioHandler);
    DOM.btnEmptyAddCardio.addEventListener('click', addCardioHandler);

    // Energy Stars
    DOM.energyStarsSelector.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        state.currentWorkout.energyLevel = val;
        renderEnergyStars(val);
        saveCurrentWorkoutDebounced();
      });
    });

    // Bodyweight & Notes Inputs
    DOM.dailyBodyweightInput.addEventListener('input', (e) => {
      state.currentWorkout.bodyWeight = e.target.value;
      saveCurrentWorkoutDebounced();
    });

    DOM.dailyNotesTextarea.addEventListener('input', (e) => {
      state.currentWorkout.generalNotes = e.target.value;
      saveCurrentWorkoutDebounced();
    });

    // Calendar Month Navigation
    DOM.calPrevMonth.addEventListener('click', () => {
      state.calMonth--;
      if (state.calMonth < 0) {
        state.calMonth = 11;
        state.calYear--;
      }
      renderCalendar();
    });

    DOM.calNextMonth.addEventListener('click', () => {
      state.calMonth++;
      if (state.calMonth > 11) {
        state.calMonth = 0;
        state.calYear++;
      }
      renderCalendar();
    });

    // Settings Controls
    DOM.controlWeightUnit.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const unit = btn.dataset.unit;
        state.settings.weightUnit = unit;
        StorageManager.saveSettings({ weightUnit: unit });
        syncSettingsUI();
        updateUnitLabels();
        renderExercises();
        showToast(`Weight unit set to ${unit.toUpperCase()}`);
      });
    });

    DOM.controlDistanceUnit.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const unit = btn.dataset.unit;
        state.settings.distanceUnit = unit;
        StorageManager.saveSettings({ distanceUnit: unit });
        syncSettingsUI();
        renderCardio();
        showToast(`Distance unit set to ${unit.toUpperCase()}`);
      });
    });

    DOM.controlTheme.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const th = btn.dataset.themeVal;
        applyTheme(th);
        syncSettingsUI();
      });
    });

    if (DOM.controlRestSeconds) {
      DOM.controlRestSeconds.querySelectorAll('.segmented-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const rest = parseInt(btn.dataset.rest, 10);
          state.settings.defaultRestSeconds = rest;
          StorageManager.saveSettings({ defaultRestSeconds: rest });
          syncSettingsUI();
          showToast(`Rest timer set to ${rest}s ⏱️`);
        });
      });
    }

    DOM.settingSoundToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      state.settings.soundEnabled = enabled;
      state.settings.vibrateEnabled = enabled;
      StorageManager.saveSettings({ soundEnabled: enabled, vibrateEnabled: enabled });
      showToast(`Audio & vibration ${enabled ? 'enabled' : 'disabled'}`);
    });

    // Backup Export
    DOM.btnExportBackup.addEventListener('click', () => {
      const jsonStr = StorageManager.exportBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitpulse_backup_${getTodayYMD()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup JSON exported! 📁');
    });

    // Backup Import
    DOM.btnImportTrigger.addEventListener('click', () => {
      DOM.fileImportInput.click();
    });

    DOM.fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const res = StorageManager.importBackupJSON(event.target.result);
        if (res.success) {
          state.settings = StorageManager.getSettings();
          applyTheme(state.settings.theme);
          updateUnitLabels();
          loadDayWorkout(state.selectedDate);
          showToast(`Imported ${res.count} workout records! 🎉`);
        } else {
          alert('Failed to import backup: ' + res.error);
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset file input
    });

    // Sample Data & Clear Data
    DOM.btnLoadSampleData.addEventListener('click', () => {
      if (confirm('Load sample workout routine? (This will add demo push and pull workouts)')) {
        StorageManager.populateSampleDataIfEmpty(true);
        loadDayWorkout(state.selectedDate);
        renderCalendar();
        showToast('Sample workouts loaded! 🏋️');
      }
    });

    DOM.btnClearAllData.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete ALL workout history and reset? This cannot be undone!')) {
        localStorage.clear();
        state.settings = StorageManager.getSettings();
        loadDayWorkout(getTodayYMD());
        renderCalendar();
        showToast('All local workout data cleared.');
      }
    });

    // Export Day Modal Event Listeners
    if (DOM.btnExportDay) {
      DOM.btnExportDay.addEventListener('click', openExportDayModal);
    }
    if (DOM.btnHeaderExportDay) {
      DOM.btnHeaderExportDay.addEventListener('click', openExportDayModal);
    }
    if (DOM.btnCloseExportModal) {
      DOM.btnCloseExportModal.addEventListener('click', closeExportDayModal);
    }
    if (DOM.modalExportDay) {
      DOM.modalExportDay.addEventListener('click', (e) => {
        if (e.target === DOM.modalExportDay) closeExportDayModal();
      });
    }
    if (DOM.btnDownloadDayJson) {
      DOM.btnDownloadDayJson.addEventListener('click', downloadDayWorkoutJSON);
    }
    if (DOM.btnCopyDayJson) {
      DOM.btnCopyDayJson.addEventListener('click', copyDayWorkoutJSON);
    }
  }

  function shiftDate(daysDelta) {
    const parts = state.selectedDate.split('-');
    const cur = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    cur.setDate(cur.getDate() + daysDelta);

    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    loadDayWorkout(`${y}-${m}-${d}`);
  }

  // =========================================================================
  // Toast Helper
  // =========================================================================
  let toastTimer = null;
  function showToast(message, duration = 2500) {
    DOM.appToast.textContent = message;
    DOM.appToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      DOM.appToast.classList.remove('show');
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
