const $ = (id) => document.getElementById(id),
  L = HabitLogic,
  KEY = "habitgrid-v1",
  today = L.key(new Date());
let habits = [];
try {
  habits = L.validate(JSON.parse(localStorage.getItem(KEY) || '{"habits":[]}'));
} catch {}
let selected = today,
  year = new Date().getFullYear(),
  filter = "all";
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, habits }));
  } catch {
    $("status").textContent =
      "Storage is unavailable. Export a copy before leaving this page.";
  }
}
function el(tag, text, className) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (className) n.className = className;
  return n;
}
function toggle(id, date) {
  const h = habits.find((h) => h.id === id);
  if (!h || date > today || date < h.created) return;
  h.checks = h.checks.includes(date)
    ? h.checks.filter((k) => k !== date)
    : [...h.checks, date];
  save();
  render();
  $("status").textContent =
    (h.checks.includes(date) ? "Checked in: " : "Check-in removed: ") +
    h.name +
    " · " +
    date;
}
function render() {
  const yearChecks = habits.reduce(
    (sum, h) => sum + L.stats(h, new Date(), year).done,
    0,
  );
  $("total").textContent = yearChecks;
  $("year-total-label").textContent = "check-ins in " + year;
  $("active").textContent = habits.length;
  $("filter").replaceChildren(
    new Option("All habits", "all"),
    ...habits.map((h) => new Option(h.name, h.id)),
  );
  $("filter").value = filter;
  if (!$("filter").value) {
    filter = "all";
    $("filter").value = "all";
  }
  const years = new Set([
    new Date().getFullYear(),
    ...habits.map((h) => Number(h.created.slice(0, 4))),
  ]);
  const min = Math.min(...years);
  $("year").replaceChildren(
    ...Array.from(
      { length: new Date().getFullYear() - min + 1 },
      (_, i) =>
        new Option(new Date().getFullYear() - i, new Date().getFullYear() - i),
    ),
  );
  $("year").value = year;
  renderGrid();
  renderChecklist();
  renderHabits();
}
function renderGrid() {
  const view =
    filter === "all" ? habits : habits.filter((h) => h.id === filter);
  $("months").replaceChildren(
    ...[
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].map((m) => el("span", m)),
  );
  $("grid").replaceChildren();
  const dates = L.dates(year),
    offset = L.parse(dates[0]).getDay();
  for (let i = 0; i < offset; i++)
    $("grid").append(el("span", undefined, "cell outside"));
  dates.forEach((date) => {
    const eligible = view.filter((h) => h.created <= date),
      done = eligible.filter((h) => h.checks.includes(date)).length,
      b = el("button", undefined, "cell");
    b.dataset.level = L.level(done, eligible.length);
    b.title = `${date}: ${done} / ${eligible.length} habits`;
    b.setAttribute("aria-label", b.title);
    b.classList.toggle("chosen", date === selected);
    b.disabled = date > today;
    b.onclick = () => {
      selected = date;
      $("date").value = date;
      renderChecklist();
      document
        .querySelectorAll(".chosen")
        .forEach((n) => n.classList.remove("chosen"));
      b.classList.add("chosen");
      $("grid-caption").textContent = b.title;
    };
    $("grid").append(b);
  });
  $("grid-caption").textContent =
    "Select a square to open that date. On mobile, swipe to explore the year.";
  centerGrid();
}
function renderChecklist() {
  $("date").value = selected;
  $("date").max = today;
  $("date-title").textContent =
    selected === today
      ? "Today's check-in"
      : L.parse(selected).toLocaleDateString([], {
          month: "long",
          day: "numeric",
        });
  const eligible = habits.filter((h) => h.created <= selected),
    done = eligible.filter((h) => h.checks.includes(selected)).length;
  $("daily-count").textContent = `${done} / ${eligible.length}`;
  $("next").disabled = selected >= today;
  $("checklist").replaceChildren();
  if (!eligible.length) {
    const n = el("div", undefined, "empty");
    n.append(
      el(
        "strong",
        habits.length
          ? "Nothing scheduled yet."
          : "Begin with one small thing.",
      ),
      el(
        "span",
        habits.length
          ? "These habits started after this date."
          : "Add a habit, then mark your first day. No streak pressure.",
      ),
    );
    $("checklist").append(n);
    return;
  }
  eligible.forEach((h) => {
    const row = el("div", undefined, "check-row"),
      b = el(
        "button",
        h.checks.includes(selected) ? "✓" : "+",
        h.checks.includes(selected) ? "checked" : "",
      );
    b.setAttribute("aria-label", `Check in ${h.name}`);
    b.setAttribute("aria-pressed", h.checks.includes(selected));
    b.onclick = () => toggle(h.id, selected);
    const text = el("div");
    text.append(
      el("strong", h.name),
      el("small", h.description || "A small promise to yourself."),
    );
    row.append(b, text);
    $("checklist").append(row);
  });
}
function bestStreak(h) {
  let best = 0,
    run = 0,
    prev = null;
  [...new Set(h.checks)].sort().forEach((k) => {
    run = prev && L.key(L.shift(L.parse(prev), 1)) === k ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  });
  return best;
}
function renderHabits() {
  $("habits").replaceChildren();
  if (!habits.length) {
    const n = el("div", undefined, "empty");
    n.append(
      el("strong", "A blank grid is possibility."),
      el("span", "Start your own habit or explore the fictional sample below."),
    );
    $("habits").append(n);
    return;
  }
  habits.forEach((h) => {
    const s = L.stats(h, new Date(), year),
      card = el("article", undefined, "habit"),
      top = el("div", undefined, "habit-top"),
      text = el("div");
    text.append(
      el("strong", h.name),
      el("p", h.description || "Daily practice"),
    );
    const del = el("button", "×", "delete");
    del.setAttribute("aria-label", `Delete ${h.name}`);
    del.onclick = () => {
      if (
        confirm(
          `Delete ${h.name} and all its check-ins? This cannot be undone.`,
        )
      ) {
        habits = habits.filter((x) => x.id !== h.id);
        save();
        render();
        $("status").textContent = "Habit deleted.";
      }
    };
    top.append(text, del);
    const metrics = el("div", undefined, "habit-metrics");
    [
      [s.streak, "day streak"],
      [bestStreak(h), "best streak"],
      [s.percent + "%", "completion"],
      [s.done, "check-ins"],
    ].forEach(([v, label]) => {
      const span = el("span");
      span.append(el("b", v), el("span", label));
      metrics.append(span);
    });
    const progress = el("div", undefined, "habit-progress"),
      fill = el("i");
    fill.style.width = s.percent + "%";
    progress.append(fill);
    card.append(top, metrics, progress);
    $("habits").append(card);
  });
}
$("new").onclick = () => {
  $("dialog").showModal();
  $("name").focus();
};
$("close").onclick = () => $("dialog").close();
$("habit-form").onsubmit = (e) => {
  e.preventDefault();
  if (habits.length >= 30) {
    $("status").textContent = "The limit is 30 habits. Keep it manageable.";
    $("dialog").close();
    return;
  }
  const name = $("name").value.trim();
  if (!name) {
    $("name").setCustomValidity("Give your habit a name.");
    $("name").reportValidity();
    return;
  }
  habits.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    description: $("description").value.trim(),
    created: today,
    checks: [],
  });
  save();
  selected = today;
  year = new Date().getFullYear();
  render();
  $("habit-form").reset();
  $("dialog").close();
  $("status").textContent = "A new habit, a fresh start.";
};
$("name").oninput = () => $("name").setCustomValidity("");
$("filter").onchange = () => {
  filter = $("filter").value;
  renderGrid();
};
$("year").onchange = () => {
  year = Number($("year").value);
  render();
};
$("date").onchange = () => {
  if (!L.validKey($("date").value) || $("date").value > today) {
    $("date").value = selected;
    return;
  }
  selected = $("date").value;
  renderChecklist();
  renderGrid();
};
$("previous").onclick = () => {
  selected = L.key(L.shift(L.parse(selected), -1));
  renderChecklist();
  renderGrid();
};
$("next").onclick = () => {
  if (selected < today) {
    selected = L.key(L.shift(L.parse(selected), 1));
    renderChecklist();
    renderGrid();
  }
};
$("today").onclick = () => {
  selected = today;
  renderChecklist();
  renderGrid();
};
$("sample").onclick = () => {
  if (
    habits.length &&
    !confirm(
      "Replace all current habits with fictional sample habits? Export your data first.",
    )
  )
    return;
  const created = L.key(L.shift(new Date(), -90));
  habits = ["Read a few pages", "Move for 20 minutes", "Write a little"].map(
    (name, i) => ({
      id: "sample-" + i,
      name,
      description: [
        "A little reading, a wider world.",
        "Step outside. Find a new route.",
        "Catch one thought before it disappears.",
      ][i],
      created,
      checks: Array.from({ length: 91 }, (_, n) =>
        L.key(L.shift(L.parse(created), n)),
      ).filter((d, n) => (n + i * 2) % 7 !== 0 && (n + i) % 5 !== 0),
    }),
  );
  selected = today;
  year = new Date().getFullYear();
  save();
  render();
  $("status").textContent =
    "Fictional sample habits loaded. Delete them or import your own data to start fresh.";
};
$("export").onclick = () => {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 1, habits }, null, 2)], {
        type: "application/json",
      }),
    ),
    a = el("a");
  a.href = url;
  a.download = "habitgrid-" + today + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $("status").textContent = "Data exported. Keep this file somewhere safe.";
};
$("import").onchange = async () => {
  const file = $("import").files[0];
  try {
    if (!file) return;
    if (file.size > 2000000) throw Error("Choose an export smaller than 2 MB.");
    const next = L.validate(JSON.parse(await file.text()));
    if (
      habits.length &&
      !confirm("Replace all habits with this imported file?")
    )
      return;
    habits = next;
    year = new Date().getFullYear();
    selected = today;
    save();
    render();
    $("status").textContent = "Habits imported.";
  } catch (e) {
    $("status").textContent = e.message || "Could not read that file.";
  } finally {
    $("import").value = "";
  }
};
render();
function centerGrid() {
  const scroll = document.querySelector(".grid-scroll");
  if (innerWidth < 760) {
    const target = selected.startsWith(year + "-") ? selected : `${year}-12-31`,
      days = L.dates(year),
      index = days.indexOf(target);
    scroll.scrollLeft = Math.max(0, (Math.floor(index / 7) - 8) * 16);
  }
}
window.addEventListener("resize", centerGrid);
centerGrid();
setInterval(() => {
  const now = L.key(new Date());
  if (now !== today) {
    location.reload();
  }
}, 60000);

document.querySelector(".import-button").onkeydown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    $("import").click();
  }
};
