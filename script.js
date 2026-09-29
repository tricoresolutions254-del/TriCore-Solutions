// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Business hours status (Mon-Sat, 8:30 AM - 5:30 PM, Eldoret/Nairobi time, UTC+3)
(function () {
  const dots = document.querySelectorAll(".status-dot");
  const texts = document.querySelectorAll(".status-text");
  const details = document.querySelectorAll(".status-detail");
  if (!dots.length) return;

  const EAT_OFFSET_MIN = 3 * 60;
  const OPEN_MIN = 8 * 60 + 30;   // 8:30 AM
  const CLOSE_MIN = 17 * 60 + 30; // 5:30 PM
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function nowInEAT() {
    // Shift the current UTC time by the EAT offset so getUTC*() reads as EAT wall-clock time
    return new Date(Date.now() + EAT_OFFSET_MIN * 60000);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return h > 0 ? `${h}h ${pad(m)}m ${pad(s)}s` : `${m}m ${pad(s)}s`;
  }

  function formatClock(minutesSinceMidnight) {
    let h = Math.floor(minutesSinceMidnight / 60);
    const m = minutesSinceMidnight % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return `${h}:${pad(m)} ${ampm}`;
  }

  function update() {
    const eat = nowInEAT();
    const day = eat.getUTCDay(); // 0 = Sunday
    const minutes = eat.getUTCHours() * 60 + eat.getUTCMinutes();
    const seconds = eat.getUTCSeconds();
    const minutesExact = minutes + seconds / 60;

    const isOpenDay = day >= 1 && day <= 6;
    const isOpenNow = isOpenDay && minutesExact >= OPEN_MIN && minutesExact < CLOSE_MIN;

    if (isOpenNow) {
      dots.forEach((d) => (d.className = "status-dot open"));
      texts.forEach((t) => (t.textContent = "Open now"));
      const remaining = Math.round((CLOSE_MIN - minutesExact) * 60);
      const msg = `Closes today at ${formatClock(CLOSE_MIN)} — in ${formatDuration(remaining)}`;
      details.forEach((d) => (d.textContent = msg));
    } else {
      dots.forEach((d) => (d.className = "status-dot closed"));
      texts.forEach((t) => (t.textContent = "Closed"));

      // Find the next open day/time
      let daysAhead = 0;
      let targetDay = day;
      let opensToday = isOpenDay && minutesExact < OPEN_MIN;

      if (!opensToday) {
        do {
          daysAhead++;
          targetDay = (day + daysAhead) % 7;
        } while (!(targetDay >= 1 && targetDay <= 6));
      }

      if (opensToday) {
        const remaining = Math.round((OPEN_MIN - minutesExact) * 60);
        const msg = `Opens today at ${formatClock(OPEN_MIN)} — in ${formatDuration(remaining)}`;
        details.forEach((d) => (d.textContent = msg));
      } else {
        const label = daysAhead === 1 ? "tomorrow" : DAY_NAMES[targetDay];
        const secondsUntilMidnightToday = Math.round((1440 - minutesExact) * 60);
        const fullDaysBetween = daysAhead - 1;
        const secondsUntilOpen = secondsUntilMidnightToday + fullDaysBetween * 86400 + OPEN_MIN * 60;
        const msg = `Opens ${label} at ${formatClock(OPEN_MIN)} — in ${formatDuration(secondsUntilOpen)}`;
        details.forEach((d) => (d.textContent = msg));
      }
    }
  }

  update();
  setInterval(update, 1000);
})();
