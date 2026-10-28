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

// Business hours status (open 24 hours Monday - Saturday, closes Saturday 4:00 PM, Eldoret/Nairobi time, UTC+3)
(function () {
  const dots = document.querySelectorAll(".status-dot");
  const texts = document.querySelectorAll(".status-text");
  const details = document.querySelectorAll(".status-detail");
  if (!dots.length) return;

  const EAT_OFFSET_MIN = 3 * 60;
  const SAT_CLOSE_MIN = 16 * 60; // Saturday 4:00 PM

  function nowInEAT() {
    // Shift the current UTC time by the EAT offset so getUTC*() reads as EAT wall-clock time
    return new Date(Date.now() + EAT_OFFSET_MIN * 60000);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function formatDuration(totalSeconds) {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
    return `${m}m ${pad(s)}s`;
  }

  function setStatus(state, label, message) {
    dots.forEach((d) => (d.className = "status-dot " + state));
    texts.forEach((t) => (t.textContent = label));
    details.forEach((d) => (d.textContent = message));
  }

  function update() {
    const eat = nowInEAT();
    const day = eat.getUTCDay(); // 0 = Sunday ... 6 = Saturday
    const secondsToday = eat.getUTCHours() * 3600 + eat.getUTCMinutes() * 60 + eat.getUTCSeconds();

    // Open all day Monday-Friday, and on Saturday until 4:00 PM
    const isOpenNow = (day >= 1 && day <= 5) || (day === 6 && secondsToday < SAT_CLOSE_MIN * 60);

    if (isOpenNow) {
      const secondsUntilClose = (6 - day) * 86400 + SAT_CLOSE_MIN * 60 - secondsToday;
      setStatus("open", "Open now", `Open 24 hours — closes Saturday at 4:00 PM, in ${formatDuration(secondsUntilClose)}`);
    } else {
      // Closed from Saturday 4:00 PM until Monday 12:00 AM
      const secondsUntilMidnight = 86400 - secondsToday;
      const secondsUntilOpen = day === 6 ? secondsUntilMidnight + 86400 : secondsUntilMidnight;
      setStatus("closed", "Closed", `Reopens Monday at 12:00 AM — in ${formatDuration(secondsUntilOpen)}`);
    }
  }

  update();
  setInterval(update, 1000);
})();
