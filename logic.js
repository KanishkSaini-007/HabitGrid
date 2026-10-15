(function (root) {
  const key = (d) => {
      d = new Date(d);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    parse = (k) => new Date(k + "T12:00:00"),
    shift = (d, n) => {
      d = new Date(d);
      d.setDate(d.getDate() + n);
      return d;
    };
  function dates(year) {
    const start = new Date(year, 0, 1, 12),
      end = new Date(year + 1, 0, 1, 12),
      out = [];
    for (let d = start; d < end; d = shift(d, 1)) out.push(key(d));
    return out;
  }
  function validKey(k) {
    return (
      typeof k === "string" &&
      k >= "1900-01-01" &&
      /^\d{4}-\d{2}-\d{2}$/.test(k) &&
      !isNaN(parse(k)) &&
      key(parse(k)) === k
    );
  }
  function stats(h, now = new Date(), year = now.getFullYear()) {
    const today = key(now),
      checks = new Set(h.checks.filter((k) => k >= h.created && k <= today));
    let d = checks.has(today) ? parse(today) : shift(parse(today), -1),
      streak = 0;
    while (checks.has(key(d))) {
      streak++;
      d = shift(d, -1);
    }
    const eligible = dates(year).filter((k) => k >= h.created && k <= today),
      done = eligible.filter((k) => checks.has(k)).length;
    return {
      streak,
      done,
      eligible: eligible.length,
      percent: eligible.length ? Math.round((done / eligible.length) * 100) : 0,
    };
  }
  function level(done, total) {
    if (!done || !total) return 0;
    return Math.min(4, Math.ceil((done / total) * 4));
  }
  function validate(data, today = key(new Date())) {
    if (!data || !Array.isArray(data.habits) || data.habits.length > 30)
      throw Error("Choose a HabitGrid export with at most 30 habits.");
    const ids = new Set();
    return data.habits.map((h) => {
      if (
        !h ||
        typeof h.id !== "string" ||
        ids.has(h.id) ||
        typeof h.name !== "string" ||
        !h.name.trim() ||
        h.name.length > 50 ||
        typeof h.description !== "string" ||
        h.description.length > 100 ||
        !validKey(h.created) ||
        h.created > today ||
        !Array.isArray(h.checks) ||
        h.checks.length > 10000 ||
        h.checks.some((k) => !validKey(k) || k < h.created || k > today)
      )
        throw Error("This export has invalid habits, dates or check-ins.");
      ids.add(h.id);
      return { ...h, checks: [...new Set(h.checks)] };
    });
  }
  const api = { key, parse, shift, dates, validKey, stats, level, validate };
  if (typeof module !== "undefined") module.exports = api;
  else root.HabitLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
