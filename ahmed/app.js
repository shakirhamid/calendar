(function () {
  const page = document.body.dataset.page || "website";

  if (page === "website") {
    if (window.StudyPlannerWebsite && typeof window.StudyPlannerWebsite.initWebsitePage === "function") {
      window.StudyPlannerWebsite.initWebsitePage();
    }
    return;
  }

  if (!window.StudyPlannerStorage || !window.StudyPlannerUI) {
    console.error("Study Planner failed to initialize: shared scripts did not load correctly.");
    return;
  }

  const state = window.StudyPlannerStorage.loadAppState(page);
  const els = window.StudyPlannerUI.collectElements();
  const context = { state, els };

   window.StudyPlannerContext = context;

  window.StudyPlannerUI.applyTheme(state.theme, els);

  if (page === "sessions" && window.StudyPlannerSessions) {
    window.StudyPlannerSessions.initSessionsPage(context);
  }

  if (page === "analytics" && window.StudyPlannerAnalytics) {
    window.StudyPlannerAnalytics.initAnalyticsPage(context);
  }

  if (page === "settings" && window.StudyPlannerSettings) {
    window.StudyPlannerSettings.initSettingsPage(context);
  }
})();
