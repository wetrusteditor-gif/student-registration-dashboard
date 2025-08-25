// ===== CONFIG (uses your sheet IDs; dates are ISO arrays for reliable formatting) =====
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
  settings: {
    autoRefreshInterval: 300000 // 5 minutes
  }
};

// ===== DOM ELEMENTS =====
const gradeSelect = document.getElementById("gradeSelect");
const tableBody   = document.getElementById("tableBody");
const summaryEl   = document.getElementById("summary");
const lastUpdated = document.getElementById("lastUpdated");
const refreshBtn  = document.getElementById("refreshBtn");
const overlay     = document.getElementById("loadingOverlay");

// ===== UTIL: Format seminar dates with weekday + timezone =====
function formatSeminarDates([startISO, endISO]) {
  const startDate = new Date(startISO);
  const endDate   = new Date(endISO);

  const full = { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZoneName: "short" };
  const shortWDay = { weekday: "long", day: "2-digit" };

  const sameYear  = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = startDate.getMonth() === endDate.getMonth();

  if (sameYear && sameMonth) {
    return `${new Intl.DateTimeFormat(navigator.language, shortWDay).format(startDate)} – ${new Intl.DateTimeFormat(navigator.language, full).format(endDate)}`;
  }
  return `${new Intl.DateTimeFormat(navigator.language, full).format(startDate)} – ${new Intl.DateTimeFormat(navigator.language, full).format(endDate)}`;
}

// ===== Populate dropdown =====
function populateClassDropdown() {
  // Clear old options except the first
  while (gradeSelect.children.length > 1) gradeSelect.removeChild(gradeSelect.lastChild);

  Object.entries(appConfig.classes).forEach(([key, c]) => {
    if (!c.active) return;
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${c.name} (${formatSeminarDates(c.dates)})`;
    gradeSelect.appendChild(opt);
  });
}

// ===== CSV parser (handles quoted fields & commas) =====
function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { // Escaped quote
        cur += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cur += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cur);
        cur = "";
      } else if (char === "\n" || char === "\r") {
        if (cur.length > 0 || row.length) {
          row.push(cur);
          rows.push(row);
          row = [];
          cur = "";
        }
        // if CRLF, skip the LF because next loop will handle
      } else {
        cur += char;
      }
    }
  }
  if (cur.length > 0 || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function csvToObjects(csvText) {
  const rows = parseCSV(csvText).filter(r => r.some(cell => cell && cell.trim() !== ""));
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] ?? "");
    return obj;
  });
}

// ===== Find header by (partial) name helper =====
function pick(obj, ...matches) {
  // matches: array of strings to search in header names
  const keys = Object.keys(obj);
  for (const m of matches) {
    const k = keys.find(k => k.toLowerCase().includes(m.toLowerCase()));
    if (k) return obj[k];
  }
  return "";
}

// ===== Format timestamp safely (space -> 'T' for Safari) =====
function formatTimestamp(ts) {
  if (!ts) return "";
  const date = new Date(ts.replace(" ", "T"));
  if (isNaN(date.getTime())) return ts; // fallback raw
  return new Intl.DateTimeFormat(navigator.language, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

// ===== Mode badge =====
function getModeBadge(mode) {
  const m = (mode || "").toLowerCase();
  if (m.includes("online") || m.includes("ஆன்லைன்"))  return '<span class="mode-online">Online / ஆன்லைன்</span>';
  if (m.includes("offline") || m.includes("ஆஃப்லைன்")) return '<span class="mode-offline">Offline / ஆஃப்லைன்</span>';
  if (m.includes("hybrid") || m.includes("கலப்பு"))   return '<span class="mode-hybrid">Hybrid / கலப்பு</span>';
  return '<span class="mode-unknown">Not Specified / குறிப்பிடப்படவில்லை</span>';
}

// ===== Fees badge =====
function getFeesBadge(val) {
  const v = (val || "").toLowerCase();
  const paid = v.includes("yes") || v.includes("ஆம்");
  return paid
    ? '<span class="status-paid">Paid / செலுத்தப்பட்டது</span>'
    : '<span class="status-unpaid">Pending / நிலுவையில்</span>';
}

// ===== Type badge =====
function getTypeBadge(val) {
  const v = (val || "").toLowerCase();
  const isStudent = v.includes("student") || v.includes("மாணவர்");
  return isStudent
    ? '<span class="student-badge">Student / மாணவர்</span>'
    : '<span class="auditor-badge">Auditor / ஆய்வாளர்</span>';
}

// ===== Update "Last Updated" label =====
function updateLastUpdated() {
  const now = new Date();
  lastUpdated.textContent = "Last Updated: " + new Intl.DateTimeFormat(navigator.language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  }).format(now);
}

// ===== Loading UI helpers =====
function showLoading(on=true) {
  if (on) overlay.classList.remove("hidden");
  else overlay.classList.add("hidden");
  refreshBtn.disabled = on;
  refreshBtn.innerHTML = on ? '<div class="btnspinner"></div> Refreshing…' : '🔄 Refresh';
}

// ===== Core: Load a class from Google Sheets CSV =====
async function loadGradeData(gradeKey) {
  const classInfo = appConfig.classes[gradeKey];
  if (!classInfo || !classInfo.sheetId) return;

  showLoading(true);

  try {
    const url = `https://docs.google.com/spreadsheets/d/${classInfo.sheetId}/gviz/tq?tqx=out:csv`;
    const res = await fetch(url, { cache: "no-store" });
    const csv = await res.text();
    const rows = csvToObjects(csv);

    if (!rows.length) {
      tableBody.innerHTML = `
        <tr><td colspan="5" class="no-data">
          No registration data found for this grade<br/>இந்த வகுப்பிற்கு பதிவு தரவு கிடைக்கவில்லை
        </td></tr>`;
      summaryEl.style.display = "none";
      showLoading(false);
      return;
    }

    // Map columns (robust to minor header changes)
    const normalized = rows.map(r => ({
      timestamp: pick(r, "timestamp"),
      type:      pick(r, "student or auditor", "மாணவரா அல்லது ஆய்வாளரா"),
      name:      pick(r, "name", "பெயர்"),
      mode:      pick(r, "mode of attendance", "பங்கேற்பு முறை"),
      fees:      pick(r, "fees paid", "கட்டணம் செலுத்தப்பட்டதா")
    }));

    // Summary
    const total   = normalized.length;
    const paid    = normalized.filter(x => (x.fees||"").toLowerCase().includes("yes") || (x.fees||"").includes("ஆம்")).length;
    const unpaid  = total - paid;
    const students= normalized.filter(x => (x.type||"").toLowerCase().includes("student") || (x.type||"").includes("மாணவர்")).length;
    const auditors= total - students;

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("paidCount").textContent     = paid;
    document.getElementById("unpaidCount").textContent   = unpaid;
    document.getElementById("studentCount").textContent  = students;
    document.getElementById("auditorCount").textContent  = auditors;
    summaryEl.style.display = "block";

    // Table
    tableBody.innerHTML = normalized.map(r => `
      <tr>
        <td>${formatTimestamp(r.timestamp)}</td>
        <td>${getTypeBadge(r.type)}</td>
        <td>${r.name || ""}</td>
        <td>${getModeBadge(r.mode)}</td>
        <td>${getFeesBadge(r.fees)}</td>
      </tr>
    `).join("");

    updateLastUpdated();
  } catch (err) {
    console.error("Error loading sheet:", err);
    tableBody.innerHTML = `
      <tr><td colspan="5" class="no-data">
        Error loading data. Please try again later.<br/>தரவை ஏற்றுவதில் பிழை. பின்னர் முயற்சிக்கவும்.
      </td></tr>`;
    summaryEl.style.display = "none";
  } finally {
    showLoading(false);
  }
}

// ===== Events =====
refreshBtn.addEventListener("click", async () => {
  const key = gradeSelect.value;
  if (!key) return;
  await loadGradeData(key);
});

gradeSelect.addEventListener("change", async (e) => {
  const key = e.target.value;
  if (!key) {
    summaryEl.style.display = "none";
    tableBody.innerHTML = `
      <tr><td colspan="5" class="no-data">
        Please select a grade to view registration data<br/>
        பதிவு தரவைப் பார்க்க ஒரு வகுப்பைத் தேர்ந்தெடுக்கவும்
      </td></tr>`;
    return;
  }
  await loadGradeData(key);
});

// Auto-refresh (uses settings)
setInterval(async () => {
  const key = gradeSelect.value;
  if (key) await loadGradeData(key);
}, appConfig.settings.autoRefreshInterval);

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  populateClassDropdown();
});
