(function () {
  const storage = window.StudyPlannerStorage;

  function collectElements() {
    return {
      toast: document.getElementById("toast"),
      themeToggle: document.getElementById("theme-toggle"),
      themeLabel: document.getElementById("theme-label"),
      resetButton: document.getElementById("reset-button"),
      exportButton: document.getElementById("export-button"),
      importButton: document.getElementById("import-button"),
      importFileInput: document.getElementById("import-file-input"),
      searchInput: document.getElementById("search-input"),
      sortSelect: document.getElementById("sort-select"),
      statusFilter: document.getElementById("status-filter"),
      openSheetButton: document.getElementById("open-sheet-button"),
      closeSheetButton: document.getElementById("close-sheet-button"),
      closeSheetButtonSecondary: document.getElementById("close-sheet-button-secondary"),
      sheetBackdrop: document.getElementById("sheet-backdrop"),
      sheet: document.getElementById("session-sheet"),
      sheetTitle: document.getElementById("sheet-title"),
      sheetSubtitle: document.getElementById("sheet-subtitle"),
      form: document.getElementById("session-form"),
      editSessionId: document.getElementById("edit-session-id"),
      sessionsList: document.getElementById("sessions-list"),
      resultsCount: document.getElementById("results-count"),
      miniTotalSessions: document.getElementById("mini-total-sessions"),
      miniTotalHours: document.getElementById("mini-total-hours"),
      focusText: document.getElementById("focus-text"),
      focusMeta: document.getElementById("focus-meta"),
      totalHours: document.getElementById("total-hours"),
      completedCount: document.getElementById("completed-count"),
      streakCount: document.getElementById("streak-count"),
      upcomingCount: document.getElementById("upcoming-count"),
      progressRing: document.getElementById("progress-ring"),
      progressValue: document.getElementById("progress-value"),
      progressCaption: document.getElementById("progress-caption"),
      subjectBars: document.getElementById("subject-bars"),
      calendarLabel: document.getElementById("calendar-label"),
      calendarGrid: document.getElementById("calendar-grid"),
      calendarPrev: document.getElementById("calendar-prev"),
      calendarNext: document.getElementById("calendar-next"),
      pomodoroSessionSelect: document.getElementById("pomodoro-session-select"),
      pomodoroDisplay: document.getElementById("pomodoro-display"),
      pomodoroStatus: document.getElementById("pomodoro-status"),
      pomodoroPhase: document.getElementById("pomodoro-phase"),
      pomodoroTarget: document.getElementById("pomodoro-target")
    };
  }

  function applyTheme(theme, els) {
    document.body.setAttribute("data-theme", theme);
    if (els.themeToggle) els.themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    if (els.themeLabel) els.themeLabel.textContent = theme === "dark" ? "Dark mode is active." : "Light mode is active.";
  }

  function syncViewControls(state, els) {
    if (els.sortSelect) els.sortSelect.value = state.sortBy;
    if (els.statusFilter) els.statusFilter.value = state.statusFilter;
  }

  function showToast(els, message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function renderFocusCard(state, els) {
    if (!els.focusText || !els.focusMeta) return;
    const pending = state.sessions
      .filter((session) => !session.completed)
      .sort((a, b) => storage.compareByDate(a, b) || storage.compareByPriority(a, b));
    const focus = pending[0];

    if (!focus) {
      els.focusText.textContent = "Everything is completed. Add a new session to keep your momentum going.";
      els.focusMeta.innerHTML = '<span class="meta-chip">All caught up</span>';
      return;
    }

    const today = storage.todayOffset(0);
    const dueState = focus.date === today ? "Due today" : storage.isPastDate(focus.date, today) ? "Overdue" : "Upcoming";
    els.focusText.textContent = `${focus.subject}: ${focus.task}`;
    els.focusMeta.innerHTML = `
      <span class="meta-chip">${storage.priorityLabel(focus.priority)} priority</span>
      <span class="meta-chip">${storage.formatHours(focus.hours)} hrs</span>
      <span class="meta-chip">${dueState}</span>
    `;
  }

  function createSessionMarkup(session) {
    return `
      <article class="session-item">
        <div class="delete-layer">
          <button class="delete-button" type="button" data-action="delete" data-id="${session.id}">Delete</button>
        </div>
        <div class="swipe-card">
          <div class="subject-row">
            <div>
              <h3>${storage.escapeHtml(session.subject)}</h3>
              <p>${storage.escapeHtml(session.task)}</p>
            </div>
            <span class="priority-pill priority-${session.priority}">${storage.priorityLabel(session.priority)}</span>
          </div>
          <div class="session-meta">
            <span class="meta-chip">${storage.formatHours(session.hours)} hrs</span>
            <span class="meta-chip">${storage.formatDate(session.date)}</span>
            ${session.notes ? `<span class="meta-chip">${storage.escapeHtml(storage.shorten(session.notes, 28))}</span>` : ""}
          </div>
          <div class="session-footer">
            <div class="progress-line"><span style="width:${session.completed ? 100 : 35}%"></span></div>
            <span class="done-tag">${session.completed ? "Completed" : "In progress"}</span>
          </div>
          <button class="done-toggle ${session.completed ? "" : "pending"}" type="button" data-action="toggle" data-id="${session.id}">
            ${session.completed ? "Mark as in progress" : "Mark as completed"}
          </button>
          <div class="inline-actions">
            <button class="inline-button" type="button" data-action="edit" data-id="${session.id}">Edit</button>
            <button class="inline-button" type="button" data-action="focus" data-id="${session.id}">Focus</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderSessionsSummary(state, els, filtered) {
    if (els.resultsCount) {
      els.resultsCount.textContent = `${filtered.length} results`;
    }
    if (els.miniTotalSessions) {
      els.miniTotalSessions.textContent = String(state.sessions.length);
    }
    if (els.miniTotalHours) {
      els.miniTotalHours.textContent = storage.formatHours(storage.sumHours(state.sessions));
    }
  }

  function renderSubjectBars(state, els, totalHours) {
    if (!els.subjectBars) return;

    if (!state.sessions.length) {
      els.subjectBars.innerHTML = '<div class="settings-row"><div><strong>No data yet</strong><p>Add at least one session to see the hour distribution by subject.</p></div><span class="settings-indicator"></span></div>';
      return;
    }

    const subjectHours = state.sessions.reduce((acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + Number(session.hours || 0);
      return acc;
    }, {});

    els.subjectBars.innerHTML = Object.entries(subjectHours)
      .sort((a, b) => b[1] - a[1])
      .map(([subject, hours]) => {
        const width = totalHours ? Math.max(10, Math.round((hours / totalHours) * 100)) : 0;
        return `<div class="bar-row"><strong>${storage.escapeHtml(subject)}</strong><div class="bar-track"><span class="bar-fill" style="width:${width}%"></span></div><span>${storage.formatHours(hours)}h</span></div>`;
      })
      .join("");
  }

  function renderCalendar(state, els) {
    if (!els.calendarGrid || !els.calendarLabel) return;

    const monthDate = state.calendarDate;
    els.calendarLabel.textContent = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(monthDate);
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const counts = storage.countSessionsByDate(state.sessions);
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const cells = labels.map((day) => `<div class="calendar-day">${day}</div>`);

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push('<div class="calendar-cell muted"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const count = counts[dateKey] || 0;
      const todayClass = dateKey === storage.todayOffset(0) ? " today" : "";
      cells.push(`<div class="calendar-cell${todayClass}"><strong>${day}</strong><span class="calendar-count">${count ? `${count} session${count > 1 ? "s" : ""}` : ""}</span></div>`);
    }

    els.calendarGrid.innerHTML = cells.join("");
  }

  function renderPomodoro(state, els) {
    if (!els.pomodoroDisplay) return;

    const storedTarget = sessionStorage.getItem("studyPlannerPomodoroTarget");
    if (storedTarget && !state.pomodoro.selectedSessionId) {
      state.pomodoro.selectedSessionId = storedTarget;
      sessionStorage.removeItem("studyPlannerPomodoroTarget");
    }

    const selected = state.sessions.find((session) => session.id === state.pomodoro.selectedSessionId);
    if (els.pomodoroSessionSelect) {
      els.pomodoroSessionSelect.innerHTML = [
        '<option value="">Select a session to focus on</option>',
        ...state.sessions.map((session) => `<option value="${session.id}" ${session.id === state.pomodoro.selectedSessionId ? "selected" : ""}>${storage.escapeHtml(session.subject)} - ${storage.escapeHtml(storage.shorten(session.task, 28))}</option>`)
      ].join("");
    }

    els.pomodoroDisplay.textContent = storage.formatTimer(state.pomodoro.remainingSeconds);
    if (els.pomodoroPhase) els.pomodoroPhase.textContent = "Focus";
    if (els.pomodoroTarget) els.pomodoroTarget.textContent = `${Math.round(state.pomodoro.totalSeconds / 60)} min cycle`;
    if (els.pomodoroStatus) {
      els.pomodoroStatus.textContent = selected
        ? `${state.pomodoro.running ? "Focusing on" : "Selected"} ${selected.subject}: ${selected.task}`
        : "Ready to start a focused study sprint.";
    }
  }

  function emptySessionsMarkup() {
    return '<div class="empty-state"><div class="card"><strong>No matching sessions found</strong><p>Try a different filter or add a new study session.</p></div></div>';
  }

  function capitalizeThemeLabel(theme) {
    return `${storage.capitalize(theme)} mode enabled.`;
  }

  window.StudyPlannerUI = {
    collectElements,
    applyTheme,
    syncViewControls,
    showToast,
    renderFocusCard,
    createSessionMarkup,
    renderSessionsSummary,
    renderSubjectBars,
    renderCalendar,
    renderPomodoro,
    emptySessionsMarkup,
    capitalizeThemeLabel
  };
})();
