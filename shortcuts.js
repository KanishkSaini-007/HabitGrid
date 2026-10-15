// Keyboard shortcuts for HabitGrid.
// T = jump to today, [ = previous day, ] = next day.
// They drive the existing date input, so app.js handles validation.
(function () {
  const input = document.getElementById("date");
  if (!input) return;
  function shift(days) {
    const base = input.value ? new Date(input.value + "T00:00:00") : new Date();
    base.setDate(base.getDate() + days);
    const p = (n) => String(n).padStart(2, "0");
    go(base.getFullYear() + "-" + p(base.getMonth() + 1) + "-" + p(base.getDate()));
  }
  function go(key) {
    input.value = key;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  document.addEventListener("keydown", function (e) {
    const t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === "t" || e.key === "T") {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      go(d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()));
    } else if (e.key === "[") shift(-1);
    else if (e.key === "]") shift(1);
    else return;
    e.preventDefault();
  });
})();
