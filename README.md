# HabitGrid

### Small things. Often.
A private habit tracker that turns everyday actions into a visible record. A yearly contribution grid, simple daily check-ins, and a little evidence of progress.

## Preview
![HabitGrid desktop with fictional sample data](docs/desktop.svg)
<details><summary>Mobile screenshot</summary>

![HabitGrid mobile with fictional sample data](docs/mobile.svg)
</details>

The images are actual browser screenshots, embedded as JPEG pixels inside SVG wrappers. They are not UI mockups.

## Features
- Create up to 30 daily habits, each with an optional reminder.
- Check in today or revisit a past date. Future check-ins are disabled.
- View all habits together or filter the yearly contribution grid to one habit.
- Per-habit current streak, check-in count and completion percentage.
- Browse every year from your earliest habit to the current year.
- Import and export JSON backups, with validation before replacement.
- Device-local persistence, confirmation before destructive actions, and optional fictional sample data.
- Keyboard-friendly controls, a native dialog, reduced-motion support and responsive layouts.

## Run locally
Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
```
No account, installation, build step, framework, API key, web font or external dependency is required.

## How the numbers work
**Streak:** consecutive local-calendar days with a check-in. If today is not checked yet, yesterday's streak stays intact until the day ends. A missed earlier day breaks it.

**Completion:** check-in days divided by eligible days in the selected year. Eligibility begins on the habit's creation date and ends today. Days before a habit existed, future days and duplicate check-ins do not inflate the calculation. All habits are daily habits; there is no weekday-only schedule.

**Grid:** each square represents one day. In the all-habits view, its green intensity reflects the share of eligible habits checked that day. In the single-habit view, a completed day is fully green. Select a square to open its daily checklist. On phones the year grid is a deliberately scrollable overview; the date picker and large check-in buttons keep the main workflow within the screen width. The grid initially centers near the selected day on small screens.

## Tests
```sh
node tests.js
```
Eleven dependency-free tests check leap years, ordinary years, year boundaries, date validation, streak continuity, duplicate check-ins, completion denominators, future-year zero handling, grid intensity, future-date rejection and duplicate-identity rejection. Browser checks cover habit creation, check-in toggling, reload persistence, sample loading, JavaScript errors and 390px / 320px page overflow.

## Project map
```
index.html       Semantic interface and habit dialog
style.css        Ink / emerald visual system and responsive layouts
logic.js         Pure dates, statistics, grid levels and import validation
app.js           UI events, check-ins, storage, export and import
tests.js         Node assertion tests
docs/            Real desktop and mobile screenshots
```

## Data and privacy
Everything stays in this browser's local storage. No analytics, server, sign-in or synchronization. Export periodically: clearing site data, private browsing or changing browsers can remove your progress. Imports replace the current collection only after confirmation; invalid imports leave it unchanged. Import files are limited to 2 MB and 30 habits. Check-in dates before 1900, invalid dates and future dates are rejected. The app reloads when it notices the local day has changed. On systems that deny browser storage, changes work for the current page and a warning asks you to export before leaving.

This is a small daily-practice tool, not a medical, clinical or accountability service.

## Hosting
Publish the repository root on any static host. GitHub Pages is configured with `main` and `/ (root)`.

Built with plain HTML, CSS and JavaScript.
