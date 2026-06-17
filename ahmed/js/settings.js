(function () {
  const storage = window.StudyPlannerStorage;
  const ui = window.StudyPlannerUI;

  function initSettingsPage(context) {
    const { els } = context;

    if (els.themeToggle) {
      els.themeToggle.addEventListener("click", () => toggleTheme(context));
    }

    if (els.resetButton) {
      els.resetButton.addEventListener("click", () => resetAllData(context));
    }

    if (els.exportButton) {
      els.exportButton.addEventListener("click", () => exportData(context));
    }

    if (els.importButton && els.importFileInput) {
      els.importButton.addEventListener("click", () => els.importFileInput.click());
      els.importFileInput.addEventListener("change", (event) => importData(context, event));
    }
  }

  function toggleTheme(context) {
    const { state, els } = context;
    state.theme = state.theme === "dark" ? "light" : "dark";
    ui.applyTheme(state.theme, els);
    storage.persistTheme(state.theme);
    ui.showToast(els, ui.capitalizeThemeLabel(state.theme));
  }

  function resetAllData(context) {
    const { state, els } = context;
    if (!window.confirm("Are you sure you want to delete all saved sessions and data?")) return;

    state.sessions = [];
    state.query = "";
    state.editingSessionId = null;
    storage.persistSessions(state.sessions);
    storage.persistViewPreferences(state);
    ui.showToast(els, "All data has been reset and deleted.");
  }

  function exportData(context) {
    const { state, els } = context;
    const payload = {
      theme: state.theme,
      view: { sortBy: state.sortBy, statusFilter: state.statusFilter },
      sessions: state.sessions
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `study-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    ui.showToast(els, "Backup exported successfully.");
  }

  function importData(context, event) {
    const { state, els } = context;
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        if (!Array.isArray(parsed.sessions)) throw new Error("Invalid data");

        state.sessions = parsed.sessions.map(storage.normalizeSession).filter(Boolean);
        storage.persistSessions(state.sessions);

        if (parsed.theme === "light" || parsed.theme === "dark") {
          state.theme = parsed.theme;
          ui.applyTheme(state.theme, els);
          storage.persistTheme(state.theme);
        }

        if (parsed.view) {
          state.sortBy = parsed.view.sortBy || state.sortBy;
          state.statusFilter = parsed.view.statusFilter || state.statusFilter;
          storage.persistViewPreferences(state);
        }

        ui.showToast(els, "Backup imported successfully.");
      } catch (error) {
        ui.showToast(els, "The selected file is not a valid backup.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  window.StudyPlannerSettings = {
    initSettingsPage
  };
})();
