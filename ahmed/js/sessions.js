(function () {
  const storage = window.StudyPlannerStorage;
  const ui = window.StudyPlannerUI;

  function initSessionsPage(context) {
    const { state, els } = context;

    if (els.searchInput) {
      els.searchInput.addEventListener("input", (event) => {
        state.query = storage.safeText(event.target.value).toLowerCase();
        renderSessionsPage(context);
      });
    }

    if (els.sortSelect) {
      els.sortSelect.addEventListener("change", (event) => {
        state.sortBy = event.target.value;
        storage.persistViewPreferences(state);
        renderSessionsPage(context);
      });
    }

    if (els.statusFilter) {
      els.statusFilter.addEventListener("change", (event) => {
        state.statusFilter = event.target.value;
        storage.persistViewPreferences(state);
        renderSessionsPage(context);
      });
    }

    if (els.openSheetButton) {
      els.openSheetButton.addEventListener("click", () => openSheet(context));
    }

    if (els.closeSheetButton) {
      els.closeSheetButton.addEventListener("click", () => closeSheet(context));
    }

    if (els.closeSheetButtonSecondary) {
      els.closeSheetButtonSecondary.addEventListener("click", () => closeSheet(context));
    }

    if (els.sheetBackdrop) {
      els.sheetBackdrop.addEventListener("click", () => closeSheet(context));
    }

    if (els.form) {
      els.form.addEventListener("submit", (event) => handleSessionSubmit(context, event));
      setDefaultDate();
    }

    renderSessionsPage(context);
  }

  function renderSessionsPage(context) {
    const { state, els } = context;

    ui.syncViewControls(state, els);
    ui.renderFocusCard(state, els);
    const filtered = getFilteredSessions(state);

    ui.renderSessionsSummary(state, els, filtered);

    if (!els.sessionsList) return;

    if (!filtered.length) {
      els.sessionsList.innerHTML = ui.emptySessionsMarkup();
      return;
    }

    els.sessionsList.innerHTML = filtered.map(ui.createSessionMarkup).join("");
    attachSessionCardEvents(context);
  }

  function handleSessionSubmit(context, event) {
    const { state, els } = context;
    event.preventDefault();

    const data = new FormData(els.form);
    const session = storage.normalizeSession({
      id: storage.safeText(data.get("editSessionId")) || storage.createId(),
      subject: storage.safeText(data.get("subject")),
      task: storage.safeText(data.get("task")),
      hours: storage.clampNumber(data.get("hours"), 0.5, 12),
      date: storage.safeText(data.get("date")),
      priority: storage.validPriority(data.get("priority")) ? data.get("priority") : "medium",
      completed: data.get("completed") === "true",
      notes: storage.safeText(data.get("notes"))
    });

    if (!session.subject || !session.task || !session.date) {
      ui.showToast(els, "Please complete the required fields before saving.");
      return;
    }

    const wasEditing = Boolean(state.editingSessionId);
    if (wasEditing) {
      state.sessions = state.sessions.map((item) => item.id === state.editingSessionId ? session : item);
    } else {
      state.sessions.unshift(session);
    }

    storage.persistSessions(state.sessions);
    closeSheet(context);
    renderSessionsPage(context);
    ui.showToast(els, wasEditing ? "Study session updated successfully." : "Study session added successfully.");
  }

  function attachSessionCardEvents(context) {
    const { state } = context;

    document.querySelectorAll('[data-action="delete"]').forEach((button) => {
      button.addEventListener("click", () => deleteSession(context, button.dataset.id));
    });

    document.querySelectorAll('[data-action="toggle"]').forEach((button) => {
      button.addEventListener("click", () => toggleSession(context, button.dataset.id));
    });

    document.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener("click", () => editSession(context, button.dataset.id));
    });

    document.querySelectorAll('[data-action="focus"]').forEach((button) => {
      button.addEventListener("click", () => {
        state.pomodoro.selectedSessionId = button.dataset.id;
        sessionStorage.setItem("studyPlannerPomodoroTarget", state.pomodoro.selectedSessionId);
        window.location.href = "./analytics.html";
      });
    });

    document.querySelectorAll(".swipe-card").forEach(attachSwipe);
  }

  function attachSwipe(card) {
    const drag = { startX: 0, deltaX: 0 };

    card.onpointerdown = (event) => {
      if (event.target.closest("button")) return;
      drag.startX = event.clientX;
      drag.deltaX = 0;
      card.classList.add("dragging");
      card.setPointerCapture(event.pointerId);
    };

    card.onpointermove = (event) => {
      if (!card.classList.contains("dragging")) return;
      drag.deltaX = Math.min(0, Math.max(event.clientX - drag.startX, -92));
      card.style.transform = `translateX(${drag.deltaX}px)`;
    };

    card.onpointerup = (event) => {
      if (card.hasPointerCapture(event.pointerId)) {
        card.releasePointerCapture(event.pointerId);
      }
      card.classList.remove("dragging");
      card.style.transform = drag.deltaX <= -46 ? "translateX(-92px)" : "translateX(0)";
    };

    card.onpointercancel = () => {
      card.classList.remove("dragging");
      card.style.transform = "translateX(0)";
    };
  }

  function editSession(context, id) {
    const { state, els } = context;
    const session = state.sessions.find((item) => item.id === id);
    if (!session || !els.form) return;

    state.editingSessionId = id;
    els.editSessionId.value = id;
    els.sheetTitle.textContent = "Edit session";
    els.sheetSubtitle.textContent = "Update this session and keep your schedule in sync.";
    document.getElementById("subject").value = session.subject;
    document.getElementById("task").value = session.task;
    document.getElementById("hours").value = session.hours;
    document.getElementById("date").value = session.date;
    document.getElementById("priority").value = session.priority;
    document.getElementById("completed").value = String(session.completed);
    document.getElementById("notes").value = session.notes;
    openSheet(context);
  }

  function deleteSession(context, id) {
    const { state, els } = context;
    state.sessions = state.sessions.filter((session) => session.id !== id);
    storage.persistSessions(state.sessions);
    renderSessionsPage(context);
    ui.showToast(els, "Study session deleted.");
  }

  function toggleSession(context, id) {
    const { state } = context;
    state.sessions = state.sessions.map((session) => session.id === id ? { ...session, completed: !session.completed } : session);
    storage.persistSessions(state.sessions);
    renderSessionsPage(context);
  }

  function openSheet(context) {
    const { els } = context;
    if (!els.sheet || !els.sheetBackdrop) return;
    els.sheet.classList.add("open");
    els.sheetBackdrop.classList.add("open");
    els.sheet.setAttribute("aria-hidden", "false");
  }

  function closeSheet(context) {
    const { state, els } = context;
    if (!els.sheet || !els.sheetBackdrop || !els.form) return;
    els.sheet.classList.remove("open");
    els.sheetBackdrop.classList.remove("open");
    els.sheet.setAttribute("aria-hidden", "true");
    els.form.reset();
    state.editingSessionId = null;
    if (els.editSessionId) els.editSessionId.value = "";
    if (els.sheetTitle) els.sheetTitle.textContent = "Add a new session";
    if (els.sheetSubtitle) els.sheetSubtitle.textContent = "Enter your study session details to update the planner instantly.";
    setDefaultDate();
    document.getElementById("priority").value = "medium";
    document.getElementById("completed").value = "false";
  }

  function getFilteredSessions(state) {
    return storage.sortSessions(
      state.sessions.filter((session) => {
        const content = `${session.subject} ${session.task} ${session.notes}`.toLowerCase();
        return (!state.query || content.includes(state.query)) && storage.matchesSessionFilter(session, state.statusFilter);
      }),
      state.sortBy
    );
  }

  function setDefaultDate() {
    const input = document.getElementById("date");
    if (input) input.value = storage.todayOffset(0);
  }

  window.StudyPlannerSessions = {
    initSessionsPage,
    renderSessionsPage
  };
})();
