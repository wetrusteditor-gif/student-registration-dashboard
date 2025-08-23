let classesData = [];
let currentTableData = [];
let selectedCols = ["Timestamp", "Are you student or Auditor ? / நீங்கள் மாணவரா அல்லது ஆய்வாளரா?", "Name / பெயர்", "Fees Paid / கட்டணம் செலுத்தப்பட்டதா?"];

// Load classes.json
async function loadClasses() {
  const res = await fetch("classes.json");
  classesData = await res.json();
  let dropdown = document.getElementById("class-dropdown");
  dropdown.innerHTML = "";
  classesData.forEach((c, i) => {
    let opt = document.createElement("option");
    opt.value = i;
    opt.text = `${c.Grade} (${c.Dates})`;
    dropdown.appendChild(opt);
  });
  loadClassData();
}

// Load class data from CSV
async function loadClassData() {
  let idx = document.getElementById("class-dropdown").value;
  if (!classesData[idx]) return;
  let csvUrl = classesData[idx].CSVLink;

  const res = await fetch(csvUrl);
  const text = await res.text();
  const rows = text.split("\n").map(r => r.split(","));
  
  let header = rows[0];
  let indices = selectedCols.map(c => header.indexOf(c));
  currentTableData = rows.slice(1).map(r => indices.map(i => r[i] || ""));

  renderTable();
  renderSummary();
}

// Render table
function renderTable() {
  let thead = document.querySelector("#data-table thead");
  let tbody = document.querySelector("#data-table tbody");
  thead.innerHTML = "<tr>" + selectedCols.map(c => `<th>${c}</th>`).join("") + "</tr>";
  tbody.innerHTML = currentTableData.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>").join("");
}

// Render summary
function renderSummary() {
  let total = currentTableData.length;
  let paid = currentTableData.filter(r => r[3] === "Yes").length;
  let notPaid = total - paid;
  document.getElementById("summary").innerHTML = `Total: ${total}, Fees Paid: ${paid}, Not Paid: ${notPaid}`;
}

// Filtering
function filterTable() {
  let search = document.getElementById("search-box").value.toLowerCase();
  let feeFilter = document.getElementById("fee-filter").value;
  let tbody = document.querySelector("#data-table tbody");

  let filtered = currentTableData.filter(r => {
    let name = r[2].toLowerCase();
    let fee = r[3];
    let matchSearch = !search || name.includes(search);
    let matchFee = feeFilter === "all" || fee === feeFilter;
    return matchSearch && matchFee;
  });

  tbody.innerHTML = filtered.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>").join("");
}

// Refresh button
function refreshData() {
  loadClassData();
}

// Export CSV/Excel
function exportData(type) {
  let seminarName = document.getElementById("class-dropdown").selectedOptions[0]?.text || "Seminar";
  let safeName = seminarName.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  let rows = [selectedCols].concat(currentTableData);
  let csv = rows.map(r => r.join(",")).join("\n");
  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = safeName + (type === "csv" ? ".csv" : ".xlsx");
  a.click();
}

// Print PDF
function printTable() {
  let seminarName = document.getElementById("class-dropdown").selectedOptions[0]?.text || "Seminar";
  let newWin = window.open("");
  newWin.document.write(`<h2>Student Registration Report</h2>`);
  newWin.document.write(`<h3>${seminarName}</h3>`);
  newWin.document.write("<p>Generated on: " + new Date().toLocaleString() + "</p>");
  newWin.document.write("<table border='1' style='border-collapse:collapse; width:100%;'>");
  newWin.document.write("<tr>" + selectedCols.map(c => `<th>${c}</th>`).join("") + "</tr>");
  currentTableData.forEach(r => {
    newWin.document.write("<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>");
  });
  newWin.document.write("</table>");
  newWin.document.close();
  newWin.print();
}

// Auto refresh every 10 mins
setInterval(refreshData, 600000);

// Init
window.onload = loadClasses;
