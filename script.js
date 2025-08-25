// Sample data for fallback
let sampleData = {
    grade8: [
        {
            timestamp: "2024-12-20 10:30:00",
            type: "Student",
            name: "Arjun Kumar",
            modeOfAttendance: "Online",
            feesPaid: "Yes"
        },
        {
            timestamp: "2024-12-20 11:15:00",
            type: "Auditor",
            name: "Priya Sharma",
            modeOfAttendance: "Offline",
            feesPaid: "No"
        },
        {
            timestamp: "2024-12-20 14:45:00",
            type: "Student",
            name: "Ravi Patel",
            modeOfAttendance: "Hybrid",
            feesPaid: "Yes"
        }
    ],
    grade7: [
        {
            timestamp: "2024-10-15 09:20:00",
            type: "Student",
            name: "Meera Singh",
            modeOfAttendance: "Online",
            feesPaid: "Yes"
        },
        {
            timestamp: "2024-10-15 13:30:00",
            type: "Student",
            name: "Karthik Raja",
            modeOfAttendance: "Offline",
            feesPaid: "No"
        }
    ]
};

// Store last loaded data to detect changes
let lastLoadedData = null;

// Populate grade dropdown
const grades = Object.keys(sampleData);
const gradeSelect = document.getElementById('gradeSelect');
grades.forEach(grade => {
    const option = document.createElement('option');
    option.value = grade;
    option.textContent = grade.charAt(0).toUpperCase() + grade.slice(1);
    gradeSelect.appendChild(option);
});

// Refresh button
const refreshBtn = document.getElementById('refreshBtn');
refreshBtn.addEventListener('click', () => {
    const selectedGrade = gradeSelect.value;
    if (selectedGrade) {
        loadGradeData(selectedGrade);
    }
});

// Load data for a grade
function loadGradeData(grade) {
    const data = sampleData[grade] || [];
    const tableBody = document.getElementById('tableBody');
    const summary = document.getElementById('summary');
    const lastUpdatedDiv = document.getElementById('lastUpdated');

    if (JSON.stringify(data) === JSON.stringify(lastLoadedData)) {
        return;
    }

    lastLoadedData = JSON.parse(JSON.stringify(data));

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="no-data">No registration data for this grade</td></tr>`;
        summary.style.display = 'none';
        return;
    }

    // Calculate summary
    let total = data.length;
    let paid = data.filter(r => r.feesPaid === "Yes").length;
    let unpaid = total - paid;
    let students = data.filter(r => r.type === "Student").length;
    let auditors = total - students;

    document.getElementById('totalStudents').textContent = total;
    document.getElementById('paidCount').textContent = paid;
    document.getElementById('unpaidCount').textContent = unpaid;
    document.getElementById('studentCount').textContent = students;
    document.getElementById('auditorCount').textContent = auditors;
    summary.style.display = 'block';

    // Populate table
    tableBody.innerHTML = data.map(r => {
        const feesBadge = r.feesPaid === "Yes"
            ? '<span class="status-paid">Paid</span>'
            : '<span class="status-unpaid">Pending</span>';

        const typeBadge = r.type === "Student"
            ? '<span class="student-badge">Student</span>'
            : '<span class="auditor-badge">Auditor</span>';

        const modeBadge = getModeBadge(r.modeOfAttendance);

        return `<tr>
            <td>${formatTimestamp(r.timestamp)}</td>
            <td>${typeBadge}</td>
            <td>${r.name}</td>
            <td>${modeBadge}</td>
            <td>${feesBadge}</td>
        </tr>`;
    }).join('');

    // Update last updated timestamp
    const now = new Date();
    lastUpdatedDiv.textContent = `Last Updated: ${now.toLocaleString(undefined, {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    })}`;
}

// Mode badge helper
function getModeBadge(mode) {
    switch (mode.toLowerCase()) {
        case 'Online': return '<span class="mode-online">Online</span>';
        case 'Direct': return '<span class="mode-direct">Direct</span>';
        default: return '<span class="mode-unknown">Not Specified</span>';
    }
}

// Event listener for dropdown
gradeSelect.addEventListener('change', () => {
    const grade = gradeSelect.value;
    if (grade) loadGradeData(grade);
    else {
        document.getElementById('summary').style.display = 'none';
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="5" class="no-data">Please select a grade</td></tr>`;
    }
});

// Optional: auto-refresh every 5 mins (only updates if data changes)
setInterval(() => {
    const grade = gradeSelect.value;
    if (grade) loadGradeData(grade);
}, 300000);

// Format timestamp
function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    });
}
