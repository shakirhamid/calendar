(function () {
  const STORAGE_KEY = "studyPlannerSessionsV1";
  const THEME_KEY = "studyPlannerThemeV1";
  const VIEW_KEY = "studyPlannerViewV1";

  function loadAppState(page) {
    const state = {
      page,
      sessions: loadSessions(),
      theme: loadTheme(),
      query: "",
      sortBy: "date-asc",
      statusFilter: "all",
      editingSessionId: null,
      calendarDate: startOfMonth(new Date()),
      pomodoro: {
        selectedSessionId: "",
        totalSeconds: 25 * 60,
        remainingSeconds: 25 * 60,
        running: false
      }
    };

    loadViewPreferences(state);
    return state;
  }

  function persistSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  function persistTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  function persistViewPreferences(state) {
    localStorage.setItem(VIEW_KEY, JSON.stringify({
      sortBy: state.sortBy,
      statusFilter: state.statusFilter
    }));
  }

  function normalizeSession(session) {
    if (!session || typeof session !== "object") return null;

    return {
      id: session.id || createId(),
      subject: safeText(session.subject),
      task: safeText(session.task),
      hours: clampNumber(session.hours, 0.5, 12),
      date: safeText(session.date) || todayOffset(0),
      priority: validPriority(session.priority) ? session.priority : "medium",
      completed: Boolean(session.completed),
      notes: safeText(session.notes)
    };
  }

  function validPriority(value) {
    return ["high", "medium", "low"].includes(value);
  }

  function validSort(value) {
    return ["date-asc", "date-desc", "hours-desc", "priority-desc"].includes(value);
  }

  function validFilter(value) {
    return ["all", "pending", "completed", "today"].includes(value);
  }

  function matchesSessionFilter(session, filter) {
    if (filter === "pending") return !session.completed;
    if (filter === "completed") return session.completed;
    if (filter === "today") return session.date === todayOffset(0);
    return true;
  }

  function compareByDate(a, b) {
    return safeDateValue(a.date) - safeDateValue(b.date);
  }

  function compareByPriority(a, b) {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  }

  function sortSessions(items, mode) {
    const copy = items.slice();
    if (mode === "date-desc") return copy.sort((a, b) => compareByDate(b, a));
    if (mode === "hours-desc") return copy.sort((a, b) => Number(b.hours) - Number(a.hours) || compareByDate(a, b));
    if (mode === "priority-desc") return copy.sort((a, b) => compareByPriority(a, b) || compareByDate(a, b));
    return copy.sort(compareByDate);
  }

  function countSessionsByDate(items) {
    return items.reduce((acc, item) => {
      if (item.date) acc[item.date] = (acc[item.date] || 0) + 1;
      return acc;
    }, {});
  }

  function calculateStudyStreak(sessions) {
    const completedSet = new Set(sessions.filter((session) => session.completed).map((session) => session.date));
    let streak = 0;
    let cursor = new Date(`${todayOffset(0)}T00:00:00`);
    if (!completedSet.has(todayOffset(0))) cursor.setDate(cursor.getDate() - 1);

    while (completedSet.has(formatIsoDate(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  function sumHours(items) {
    return items.reduce((total, item) => total + Number(item.hours || 0), 0);
  }

  function clampNumber(value, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.min(max, Math.max(min, numeric));
  }

  function safeDateValue(value) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
  }

  function formatHours(hours) {
    const rounded = Math.round(Number(hours) * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value || "No date";
    return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function formatTimer(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function priorityLabel(priority) {
    return priority === "high" ? "High" : priority === "low" ? "Low" : "Medium";
  }

  function shorten(text, maxLength) {
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
  }

  function safeText(value) {
    return String(value || "").trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  }

  function todayOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatIsoDate(date);
  }

  function formatIsoDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function isPastDate(value, today) {
    return safeText(value) < safeText(today);
  }

  function createId() {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function loadSessions() {
    const defaults = [
      {
        id: createId(),
        subject: "Mathematics",
        task: "Review integration and solve 10 problems",
        hours: 2,
        date: todayOffset(1),
        priority: "high",
        completed: false,
        notes: "Focus on repeated mistakes from the last assignment."
      },
      {
        id: createId(),
        subject: "English",
        task: "Write a summary for unit five",
        hours: 1.5,
        date: todayOffset(2),
        priority: "medium",
        completed: true,
        notes: "Review vocabulary before writing."
      }
    ];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
      }

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(normalizeSession).filter(Boolean) : defaults;
    } catch (error) {
      return defaults;
    }
  }

  function loadTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "dark" ? "dark" : "light";
  }

  function loadViewPreferences(state) {
    try {
      const stored = localStorage.getItem(VIEW_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      state.sortBy = validSort(parsed.sortBy) ? parsed.sortBy : state.sortBy;
      state.statusFilter = validFilter(parsed.statusFilter) ? parsed.statusFilter : state.statusFilter;
    } catch (error) {
      return;
    }
  }

  window.StudyPlannerStorage = {
    loadAppState,
    persistSessions,
    persistTheme,
    persistViewPreferences,
    normalizeSession,
    validPriority,
    validSort,
    validFilter,
    matchesSessionFilter,
    compareByDate,
    compareByPriority,
    sortSessions,
    countSessionsByDate,
    calculateStudyStreak,
    sumHours,
    clampNumber,
    safeDateValue,
    formatHours,
    formatDate,
    formatTimer,
    priorityLabel,
    shorten,
    safeText,
    escapeHtml,
    capitalize,
    todayOffset,
    formatIsoDate,
    startOfMonth,
    isPastDate,
    createId
  };
})();
