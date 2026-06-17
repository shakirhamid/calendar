(function () {
  const storage = window.StudyPlannerStorage;
  const ui = window.StudyPlannerUI;
  let pomodoroTimer = null;

  function initAnalyticsPage(context) {
    const { state, els } = context;

    if (els.calendarPrev) {
      els.calendarPrev.addEventListener("click", () => {
        state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1);
        ui.renderCalendar(state, els);
      });
    }

    if (els.calendarNext) {
      els.calendarNext.addEventListener("click", () => {
        state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1);
        ui.renderCalendar(state, els);
      });
    }

    if (els.pomodoroSessionSelect) {
      els.pomodoroSessionSelect.addEventListener("change", (event) => {
        state.pomodoro.selectedSessionId = event.target.value;
        resetPomodoro(context, false);
      });
    }

    const startButton = document.getElementById("pomodoro-start");
    const pauseButton = document.getElementById("pomodoro-pause");
    const resetButton = document.getElementById("pomodoro-reset");

    if (startButton) {
      startButton.addEventListener("click", () => startPomodoro(context));
    }

    if (pauseButton) {
      pauseButton.addEventListener("click", () => pausePomodoro(context));
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => resetPomodoro(context, true));
    }

    renderAnalyticsPage(context);
  }

  function renderAnalyticsPage(context) {
    const { state, els } = context;
    const totalHours = storage.sumHours(state.sessions);
    const completed = state.sessions.filter((item) => item.completed).length;
    const progress = state.sessions.length ? Math.round((completed / state.sessions.length) * 100) : 0;
    const streak = storage.calculateStudyStreak(state.sessions);
    const upcoming = state.sessions.filter((item) => !item.completed && item.date >= storage.todayOffset(0)).length;

    if (els.totalHours) els.totalHours.textContent = `${storage.formatHours(totalHours)} hrs`;
    if (els.completedCount) els.completedCount.textContent = String(completed);
    if (els.streakCount) els.streakCount.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
    if (els.upcomingCount) els.upcomingCount.textContent = String(upcoming);
    if (els.progressRing) els.progressRing.style.setProperty("--progress", progress);
    if (els.progressValue) els.progressValue.textContent = `${progress}%`;
    if (els.progressCaption) {
      els.progressCaption.textContent = state.sessions.length
        ? `You have completed ${completed} out of ${state.sessions.length} sessions.`
        : "Add study sessions to view your completion rate.";
    }

    ui.renderSubjectBars(state, els, totalHours);
    ui.renderCalendar(state, els);
    ui.renderPomodoro(state, els);
  }

  function startPomodoro(context) {
    const { state, els } = context;
    if (!state.pomodoro.selectedSessionId) {
      ui.showToast(els, "Select a session before starting the timer.");
      return;
    }
    if (state.pomodoro.running) return;

    state.pomodoro.running = true;
    pomodoroTimer = window.setInterval(() => {
      state.pomodoro.remainingSeconds -= 1;
      if (state.pomodoro.remainingSeconds <= 0) {
        pausePomodoro(context);
        state.pomodoro.remainingSeconds = 0;
        ui.showToast(els, "Pomodoro session completed.");
      }
      ui.renderPomodoro(state, els);
    }, 1000);

    ui.renderPomodoro(state, els);
  }

  function pausePomodoro(context) {
    const { state, els } = context;
    state.pomodoro.running = false;
    if (pomodoroTimer) {
      window.clearInterval(pomodoroTimer);
      pomodoroTimer = null;
    }
    ui.renderPomodoro(state, els);
  }

  function resetPomodoro(context, showFeedback) {
    const { state, els } = context;
    pausePomodoro(context);
    state.pomodoro.totalSeconds = 25 * 60;
    state.pomodoro.remainingSeconds = 25 * 60;
    ui.renderPomodoro(state, els);
    if (showFeedback) ui.showToast(els, "Pomodoro timer reset.");
  }

  window.StudyPlannerAnalytics = {
    initAnalyticsPage,
    renderAnalyticsPage
  };
})();
