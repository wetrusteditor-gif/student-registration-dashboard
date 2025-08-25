// ===== CONFIG (your sheet IDs + ISO date ranges) =====
const appConfig = {
  classes: {
    grade8: {
      name: "Grade 8",
      dates: ["2025-12-28", "2026-01-04"],
      sheetId: "1y7C5PhSipW1_MoMcR64AVmOyMqG-GyYtrj0CM8KOBwk",
      active: true
    },
    grade7: {
      name: "Grade 7",
      dates: ["2025-10-23", "2025-10-26"],
      sheetId: "1Mjhnpudyy-F6fX4g0fpm6jnFlzoWir4Kl9fQZxPirjE",
      active: true
    },
    grade6: {
      name: "Grade 6",
      dates: ["2025-09-26", "2025-09-28"],
      sheetId: "1YOYIWBoMGcbPEXzK_kY0goS0wn_6gqXHDdGY8Sl6Nr0",
      active: true
    },
    grade5: {
      name: "Grade 5",
      dates: ["2025-09-12", "2025-09-14"],
      sheetId: "1Pjep3A_jLcKPNvLvJNfHxUQK4_ytxGorw6yVjsU8eJw",
      active: true
    },
    grade4: {
      name: "Grade 4",
      dates: ["2025-12-12", "2025-12-14"],
      sheetId: "1yI0J2L8A4KqXAXECsvz22pN7dPBfSoNVkc7tn2OrUlQ",
      active: true
    },
    grade3: {
      name: "Grade 3",
      dates: ["2025-11-21", "2025-11-23"],
      sheetId: "1IoPOwJHK3ogI8uMKFp3FCihRDoz0iXeyhrr5HJ3Zw4Y",
      active: true
    }
  },
  settings: { autoRefreshInterval: 300000 } // 5 minutes
};

// ===== DOM =====
const gradeSelect = document.getElementById("gradeSelect");
const tableBody   = document.getElementById("tableBody");
const summaryEl   = document.getElementById("summary");
const lastUpdated = document.getElementById("lastUpdated");
const refreshBtn  = document.getElementById("refreshBtn");
const overlay     = document.getElementById("loadingOverlay");

// ===== Seminar dates with weekday + TZ =====
function formatSeminarDates([startISO, endISO]) {
  const start = new Date(startISO);
  const end   = new Date(endISO);
  const full  = { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZoneName: "short" };
  const shortD= { weekday: "long", day: "2-digit" };
  const sameYear  = start.getFullYear() === end.getFullYear();
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameYear && sameMonth) {
    return `${new Intl.DateTimeFormat(navigator.language, shortD).format(start)} – ${new Intl.DateTimeFormat(navigator.language, full).format(end)}`;
  }
  return `${new Intl.DateTimeFormat(navigator.language, full).format(start)} – ${new Intl.DateTimeFormat(navigator.language, full).format(end)}`;
}

// ===== Populate dropdown =====
function populateClassDropdown() {
  while (gradeSelect.children.length > 1) gradeSelect.removeChild(gradeSelect.lastChild);
  Object.entries(appConfig.classes).forEach(([key, c]) => {
    if (!c.active) return;
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${c.name} (${formatSeminarDates(c.dates)})`;
    gradeSelect.appendChild(opt);
  });
}

// ===== Robust CSV parser =====
function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const nx = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && nx === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cur += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (cur.length || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
      } else { cur += ch; }
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
function csvToObjects(csvText) {
  const rows = parseCSV(csvText).filter(r => r.some(c => c && c.trim() !== ""));
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim(
