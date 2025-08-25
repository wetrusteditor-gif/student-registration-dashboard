// ===== CONFIG (your sheet IDs + ISO date ranges) =====
const appConfig = {
  classes: {
    grade8: { name: "Grade 8", dates: ["2025-12-28","2026-01-04"], sheetId: "1y7C5PhSipW1_MoMcR64AVmOyMqG-GyYtrj0CM8KOBwk", active: true },
    grade7: { name: "Grade 7", dates: ["2025-10-23","2025-10-26"], sheetId: "1Mjhnpudyy-F6fX4g0fpm6jnFlzoWir4Kl9fQZxPirjE", active: true },
    grade6: { name: "Grade 6", dates: ["2025-09-26","2025-09-28"], sheetId: "1YOYIWBoMGcbPEXzK_kY0goS0wn_6gqXHDdGY8Sl6Nr0", active: true },
    grade5: { name: "Grade 5", dates: ["2025-09-12","2025-09-14"], sheetId: "1Pjep3A_jLcKPNvLvJNfHxUQK4_ytxGorw6yVjsU8eJw", active: true },
    grade4: { name: "Grade 4", dates: ["2025-12-12","2025-12-14"], sheetId: "1yI0J2L8A4KqXAXECsvz22pN7dPBfSoNVkc7tn2OrUlQ", active: true },
    grade3: { name: "Grade 3", dates: ["2025-11-21","2025-11-23"], sheetId: "1IoPOwJHK3ogI8uMKFp3FCihRDoz0iXeyhrr5HJ3Zw4Y", active: true }
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
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] ?? "");
    return obj;
  });
}

// ===== Header mapping helper =====
function pick(obj, ...needles) {
  const keys = Object.keys(obj);
  for (const n of needles) {
    const k = keys.find(k => k.toLowerCase().includes(n.toLowerCase()));
    if (k) return obj[k];
  }
  return "";
}

// ===== Format timestamp safely =====
function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts.replace(" ", "T")); // Safari safe
  if (isNaN(d)) return ts;
  return new Intl.DateTimeFormat(navigator.language, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  }).format(d);
}

// ===== Badges =====
function getModeBadge(val) {
  const v = (val || "").toLowerCase();
  if (v.includes("online") || v.includes("ஆன்லைன்"))  return '<span class="mode-online">Online / ஆன்லைன்</span>';
  if (v.includes("direct") || v.includes("நேரடி")) return '<span class="mode-direct">Direct / நேரடி</span>';
  if (v.includes("hybrid") || v.includes("கலப்பு"))   return '<span class="mode-hybrid">Hybrid / கலப்பு</span>';
  return '<span class="mode-unknown">Not Specified / குறிப்பிடப்படவில்லை</span>';
}
function getFeesBadge(val) {
  const v = (val || "").toLowerCase();
  const paid = v.includes("yes") || v.includes("ஆம்");
  return paid ? '<span class="status-paid">Paid / செலுத்தப்பட்டது</span>'
              : '<span class="status-unpaid">Pending / நிலுவையில்</span>';
}
function getTypeBadge(val) {
  const v = (val || "").toLowerCase();
  const isStudent = v.includes("student") || v.includes("மாணவர்");
  return isStudent ? '<span class="student-badge">Student / மாணவர்</span>'
                   : '<span class="auditor-badge">Auditor / ஆய்வாளர்</span>';
}

// ===== Last updated =====
function updateLastUpdated() {
  const now = new Date();
  lastUpdated.textContent = "Last Updated: " + new Intl.DateTimeFormat(navigator.language, {
    weekday: "long", year: "numeric", month: "long", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short"
  }).format(now);
}

// ===== Loading UI =====
function showLoading(on = true) {
  if (on) overlay.classList.remove("hidden");
  else overlay.classList.add("hidden");
  refreshBtn.disabled = on;
  refreshBtn.innerHTML = on ? '<div class="btnspinner"></div> Refreshing…' : '🔄 Refresh';
}

// ===== Load selected grade from Google Sheets =====
async function loadGradeData(gradeKey) {
  const info = appConfig.classes[gradeKey];
  if (!info?.sheetId) return;

  showLoading(true);
  try {
    const url = `https://docs.google.com/spreadsheets/d/${info.sheetId}/gviz/tq?tqx=out:csv`;
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

    // Normalize fields (robust to header variations)
    const data = rows.map(r => ({
      timestamp: pick(r, "timestamp"),
      type:      pick(r, "student or auditor", "நீங்கள் மாணவரா அல்லது ஆய்வாளரா"),
      name:      pick(r, "name", "பெயர்"),
      mode:      pick(r, "mode of attendance", "பங்கேற்பு முறை"),
      fees:      pick(r, "fees paid", "கட்டணம் செலுத்தப்பட்டதா")
    }));

    // Summary
    const total    = data.length;
    const paid     = data.filter(x => (x.fees||"").toLowerCase().includes("yes") || (x.fees||"").includes("ஆம்")).length;
    const students = data.filter(x => (x.type||"").toLowerCase().includes("student") || (x.type||"").includes("மாணவர்")).length;
    const unpaid   = total - paid;
    const auditors = total - students;

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("paidCount").textContent     = paid;
    document.getElementById("unpaidCount").textContent   = unpaid;
    document.getElementById("studentCount").textContent  = students;
    document.getElementById("auditorCount").textContent  = auditors;
    summaryEl.style.display = "block";

    // Table (desktop layout on all screens; horizontal scroll on small)
    tableBody.innerHTML = data.map(r => `
      <tr>
        <td>${formatTimestamp(r.timestamp)}</td>
        <td>${getTypeBadge(r.type)}</td>
        <td>${r.name || ""}</td>
        <td>${getModeBadge(r.mode)}</td>
        <td>${getFeesBadge(r.fees)}</td>
      </tr>
    `).join("");

    updateLastUpdated();
  } catch (e) {
    console.error(e);
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
  if (key) await loadGradeData(key);
});
gradeSelect.addEventListener("change", async e => {
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
setInterval(async () => {
  const key = gradeSelect.value;
  if (key) await loadGradeData(key);
}, appConfig.settings.autoRefreshInterval);

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  populateClassDropdown();
});
