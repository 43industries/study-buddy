(() => {
  const STORAGE_KEY = "studyBuddy.v1";
  const RING_R = 26;
  const CIRC = 2 * Math.PI * RING_R;

  const quotes = [
    "Small steps every day beat perfect plans on paper.",
    "Focus on progress, not perfection.",
    "Your future self will thank you for showing up today.",
    "One assignment at a time — you've got this.",
    "Consistency beats intensity when exams stack up.",
    "Review beats cramming — even 15 minutes counts.",
    "Sleep is part of the syllabus.",
    "Collaboration multiplies what you can learn alone.",
  ];

  function defaultState() {
    return {
      profile: { name: "Sarah", major: "Psychology Major", week: 8 },
      streak: 0,
      lastStreakDate: null,
      timetable: [],
      assignments: [],
      reminders: [],
      stats: { weekId: "", sessionsThisWeek: 0 },
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed, profile: { ...defaultState().profile, ...parsed.profile }, stats: { ...defaultState().stats, ...parsed.stats } };
    } catch {
      return defaultState();
    }
  }

  let state = loadState();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function weekId() {
    const d = new Date();
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  function updateStreak() {
    const t = todayStr();
    const y = yesterdayStr();
    if (state.lastStreakDate === t) return;
    if (state.lastStreakDate === y) state.streak += 1;
    else state.streak = 1;
    state.lastStreakDate = t;
    save();
  }

  function ensureWeekStats() {
    const w = weekId();
    if (state.stats.weekId !== w) {
      state.stats.weekId = w;
      state.stats.sessionsThisWeek = 0;
      save();
    }
  }

  function id() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
  }

  const colors = ["var(--primary)", "var(--secondary)", "var(--success)"];

  /** @param {string} view */
  function showView(view) {
    document.querySelectorAll(".view").forEach((el) => {
      const isActive = el.dataset.view === view;
      el.classList.toggle("view--active", isActive);
      el.hidden = !isActive;
    });
    document.querySelectorAll(".bottom-nav .nav-item").forEach((btn) => {
      const active = btn.dataset.view === view;
      btn.classList.toggle("active", active);
      if (active) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    const fab = document.getElementById("fab");
    if (fab) fab.hidden = view === "focus" || view === "stats";
  }

  function greeting() {
    const h = new Date().getHours();
    const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const name = state.profile.name || "there";
    return `👋 ${g}, ${name}!`;
  }

  function dailyQuote() {
    const day = Math.floor(Date.now() / 86400000);
    return quotes[day % quotes.length];
  }

  function daysUntil(dueIso) {
    const due = new Date(dueIso + "T12:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.round((due - now) / 86400000);
  }

  function renderHome() {
    const g = document.getElementById("greeting");
    const pl = document.getElementById("profile-line");
    const streakEl = document.getElementById("streak-num");
    const quoteEl = document.getElementById("daily-quote");
    const briefing = document.getElementById("briefing-text");
    const priorityCard = document.getElementById("priority-card");
    const priorityText = document.getElementById("priority-text");
    const homeSchedule = document.getElementById("home-schedule");
    const homeEmpty = document.getElementById("home-schedule-empty");
    const rings = document.getElementById("progress-rings");
    const assignEmpty = document.getElementById("assignments-empty");
    const reminderList = document.getElementById("reminder-list");

    if (g) g.textContent = greeting();
    if (pl) pl.textContent = `${state.profile.major} · Week ${state.profile.week}`;
    if (streakEl) streakEl.textContent = String(state.streak);
    if (quoteEl) quoteEl.textContent = dailyQuote();

    const open = state.assignments.filter((a) => a.progress < 100);
    const dueSoon = open.filter((a) => {
      const d = daysUntil(a.due);
      return d >= 0 && d <= 7;
    });
    if (priorityCard && priorityText) {
      if (dueSoon.length >= 2) {
        priorityCard.hidden = false;
        priorityText.textContent = `${dueSoon.length} assignments due soon · stay on top of the week`;
      } else {
        priorityCard.hidden = true;
      }
    }

    const nextAssign = open
      .map((a) => ({ ...a, d: daysUntil(a.due) }))
      .filter((a) => a.d >= 0)
      .sort((a, b) => a.d - b.d)[0];
    const dow = new Date().getDay();
    const dayIndex = dow === 0 ? 6 : dow - 1;
    const todaySlots = state.timetable
      .filter((s) => s.day === dayIndex)
      .sort((a, b) => a.start.localeCompare(b.start));
    const studySession = todaySlots.find((s) => /study/i.test(s.title));

    if (briefing) {
      const parts = [];
      if (open.length) parts.push(`You have ${open.length} open assignment${open.length === 1 ? "" : "s"} this week.`);
      else parts.push("No open assignments — nice.");
      if (studySession) parts.push(`Study block: ${studySession.title}.`);
      if (nextAssign) parts.push(`Next due: ${nextAssign.title} (${nextAssign.d === 0 ? "today" : nextAssign.d === 1 ? "tomorrow" : `in ${nextAssign.d} days`}).`);
      briefing.textContent = parts.join(" ");
    }

    if (homeSchedule) {
      homeSchedule.innerHTML = "";
      if (!todaySlots.length) {
        homeEmpty.hidden = false;
      } else {
        homeEmpty.hidden = true;
        todaySlots.forEach((s, i) => {
          const li = document.createElement("li");
          li.className = "schedule-card";
          const bar = colors[i % colors.length];
          li.innerHTML = `
            <span class="schedule-bar" style="--bar: ${bar}"></span>
            <div class="schedule-body">
              <p class="muted tiny">${formatTime(s.start)} – ${formatTime(s.end)}</p>
              <p class="schedule-title">${escapeHtml(s.title)}</p>
              <p class="muted tiny">${escapeHtml(s.place || "—")}</p>
            </div>
            <span class="badge muted">${durationLabel(s.start, s.end)}</span>`;
          homeSchedule.appendChild(li);
        });
      }
    }

    if (rings) {
      rings.innerHTML = "";
      const show = state.assignments.slice(0, 3);
      if (!show.length) assignEmpty.hidden = false;
      else {
        assignEmpty.hidden = true;
        show.forEach((a, i) => {
          const p = a.progress / 100;
          const c = colors[i % colors.length];
          const wrap = document.createElement("div");
          wrap.className = "ring-wrap";
          wrap.innerHTML = `
            <svg class="ring" viewBox="0 0 64 64" aria-hidden="true">
              <circle class="ring-bg" cx="32" cy="32" r="${RING_R}" />
              <circle class="ring-fill" cx="32" cy="32" r="${RING_R}" style="--p: ${p}; --c: ${c}" />
            </svg>
            <span class="ring-pct" style="color: ${c}">${a.progress}%</span>
            <p class="ring-label">${escapeHtml(a.title)}</p>`;
          rings.appendChild(wrap);
        });
      }
    }

    if (reminderList) {
      reminderList.innerHTML = "";
      const auto = open
        .filter((a) => {
          const d = daysUntil(a.due);
          return d >= 0 && d <= 2;
        })
        .map((a) => ({ id: `a-${a.id}`, text: `Due ${a.due}: ${a.title}`, auto: true }));
      const manual = state.reminders.map((r) => ({ ...r, auto: false }));
      [...auto, ...manual].forEach((r) => {
        const li = document.createElement("li");
        li.className = "reminder-item";
        li.innerHTML = `<span>${escapeHtml(r.text)}</span>${r.auto ? "" : `<button type="button" class="btn-icon" data-rid="${r.id}" aria-label="Remove">×</button>`}`;
        reminderList.appendChild(li);
      });
      reminderList.querySelectorAll("[data-rid]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.reminders = state.reminders.filter((x) => x.id !== btn.dataset.rid);
          save();
          renderHome();
        });
      });
    }
  }

  function formatTime(t) {
    const [h, m] = t.split(":").map(Number);
    const am = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${am}`;
  }

  function durationLabel(start, end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let mins = eh * 60 + em - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m ? `${h}h ${m}m` : `${h} hrs`;
    }
    return `${mins} min`;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderSchedule() {
    const list = document.getElementById("slot-list");
    if (!list) return;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    list.innerHTML = "";
    const sorted = [...state.timetable].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
    sorted.forEach((s) => {
      const li = document.createElement("li");
      li.className = "slot-item";
      li.innerHTML = `
        <div>
          <p class="slot-title">${escapeHtml(s.title)}</p>
          <p class="muted small">${days[s.day]} · ${formatTime(s.start)} – ${formatTime(s.end)} · ${escapeHtml(s.place || "")}</p>
        </div>
        <button type="button" class="btn-icon" data-sid="${s.id}" aria-label="Remove">×</button>`;
      list.appendChild(li);
    });
    list.querySelectorAll("[data-sid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.timetable = state.timetable.filter((x) => x.id !== btn.dataset.sid);
        save();
        renderSchedule();
        renderHome();
      });
    });
  }

  function renderAssignments() {
    const list = document.getElementById("assignment-list");
    if (!list) return;
    list.innerHTML = "";
    const sorted = [...state.assignments].sort((a, b) => a.due.localeCompare(b.due));
    sorted.forEach((a) => {
      const li = document.createElement("li");
      li.className = "assignment-item";
      const d = daysUntil(a.due);
      const dueLabel = d < 0 ? "Overdue" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`;
      li.innerHTML = `
        <div class="assignment-main">
          <p class="assignment-title">${escapeHtml(a.title)}</p>
          <p class="muted small">${escapeHtml(a.course || "")} · ${a.due} · ${dueLabel}</p>
          <label class="progress-inline">
            <span class="muted tiny">Progress</span>
            <input type="range" min="0" max="100" value="${a.progress}" data-aid="${a.id}" />
            <span class="tiny pct">${a.progress}%</span>
          </label>
        </div>
        <button type="button" class="btn-icon" data-aid="${a.id}" aria-label="Delete">×</button>`;
      list.appendChild(li);
    });
    list.querySelectorAll('input[type="range"]').forEach((input) => {
      input.addEventListener("input", () => {
        const a = state.assignments.find((x) => x.id === input.dataset.aid);
        if (a) {
          a.progress = Number(input.value);
          input.closest(".assignment-item").querySelector(".pct").textContent = `${a.progress}%`;
          save();
          renderHome();
          renderStats();
        }
      });
    });
    list.querySelectorAll("button[data-aid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.assignments = state.assignments.filter((x) => x.id !== btn.dataset.aid);
        save();
        renderAssignments();
        renderHome();
        renderStats();
      });
    });
  }

  function renderStats() {
    ensureWeekStats();
    const open = state.assignments.filter((a) => a.progress < 100).length;
    document.getElementById("metric-sessions").textContent = String(state.stats.sessionsThisWeek);
    document.getElementById("metric-assignments").textContent = String(open);
    document.getElementById("metric-streak").textContent = String(state.streak);
  }

  /** Pomodoro */
  const WORK = 25 * 60;
  const BRK = 5 * 60;
  let timerId = null;
  let remaining = WORK;
  let phase = "idle";

  function formatPomodoro(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function updatePomodoroUI() {
    const disp = document.getElementById("pomodoro-display");
    const ph = document.getElementById("pomodoro-phase");
    const st = document.getElementById("pomodoro-stats");
    if (disp) disp.textContent = formatPomodoro(remaining);
    if (ph) {
      if (phase === "idle") ph.textContent = "Ready";
      else if (phase === "work") ph.textContent = "Focus";
      else ph.textContent = "Break";
    }
    if (st) st.textContent = `Sessions this week: ${state.stats.sessionsThisWeek}`;
  }

  function tick() {
    if (remaining <= 0) {
      if (phase === "work") {
        state.stats.sessionsThisWeek += 1;
        save();
        renderStats();
        renderHome();
        phase = "break";
        remaining = BRK;
      } else {
        phase = "work";
        remaining = WORK;
      }
      updatePomodoroUI();
      return;
    }
    remaining -= 1;
    updatePomodoroUI();
  }

  function bindPomodoro() {
    const start = document.getElementById("pom-start");
    const pause = document.getElementById("pom-pause");
    const reset = document.getElementById("pom-reset");
    ensureWeekStats();
    remaining = WORK;
    phase = "idle";
    updatePomodoroUI();

    start?.addEventListener("click", () => {
      if (timerId) return;
      if (phase === "idle") {
        phase = "work";
        remaining = WORK;
      }
      timerId = setInterval(tick, 1000);
      start.disabled = true;
      if (pause) pause.disabled = false;
      updatePomodoroUI();
    });

    pause?.addEventListener("click", () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      if (start) start.disabled = false;
      pause.disabled = true;
    });

    reset?.addEventListener("click", () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      phase = "idle";
      remaining = WORK;
      if (start) start.disabled = false;
      if (pause) pause.disabled = true;
      updatePomodoroUI();
    });
  }

  function updateClock() {
    const el = document.getElementById("clock");
    if (!el) return;
    const d = new Date();
    el.textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  /** Init */
  updateStreak();
  ensureWeekStats();
  renderHome();
  renderSchedule();
  renderAssignments();
  renderStats();
  bindPomodoro();
  updateClock();
  setInterval(updateClock, 30000);

  document.querySelectorAll(".bottom-nav .nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => showView(el.dataset.go));
  });

  document.getElementById("form-slot")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.timetable.push({
      id: id(),
      day: Number(fd.get("day")),
      start: fd.get("start"),
      end: fd.get("end"),
      title: String(fd.get("title")).trim(),
      place: String(fd.get("place") || "").trim(),
    });
    save();
    e.target.reset();
    renderSchedule();
    renderHome();
  });

  document.getElementById("form-assignment")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.assignments.push({
      id: id(),
      title: String(fd.get("title")).trim(),
      course: String(fd.get("course") || "").trim(),
      due: fd.get("due"),
      progress: Number(fd.get("progress") || 0),
    });
    save();
    e.target.querySelector('input[name="progress"]').value = "0";
    e.target.reset();
    renderAssignments();
    renderHome();
    renderStats();
  });

  document.getElementById("form-reminder")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const text = String(fd.get("text") || "").trim();
    if (!text) return;
    state.reminders.push({ id: id(), text });
    save();
    e.target.reset();
    renderHome();
  });

  document.getElementById("fab")?.addEventListener("click", () => {
    showView("assignments");
    document.querySelector('#form-assignment input[name="title"]')?.focus();
  });

  document.querySelectorAll(".qa-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }],
        { duration: 180, easing: "ease-out" }
      );
    });
  });
})();
