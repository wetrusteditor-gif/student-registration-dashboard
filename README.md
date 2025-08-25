Student Registration Dashboard

A responsive web dashboard to view student/auditor registrations for HUE seminars.
It fetches live data directly from Google Sheets and displays it with:

📊 Summary cards (total, paid, unpaid, students, auditors)

📅 Localized timestamps (weekday + time zone)

📱 Mobile-friendly layout (table → card view on phones)

🔄 Manual refresh & auto-refresh (every 5 minutes)

🌐 Works with any published Google Sheet in CSV mode

🚀 Features

Dropdown with seminar grades & dates

Live fetch from Google Sheets CSV export

Responsive summary statistics

Styled badges for paid/unpaid, student/auditor, mode (online/offline/hybrid)

Loading overlay while data fetches

Auto-updates every 5 minutes

📂 Project Structure
student-dashboard/
│
├── index.html    # Main UI
├── script.js     # Logic (fetch, render, refresh, auto-refresh)
├── style.css     # Styling (desktop + mobile responsive)
└── README.md     # Project documentation

⚙️ Setup

Google Sheet Setup

Open your Google Form’s response sheet.

Click File → Share → Publish to web.

Or ensure Anyone with the link → Viewer.

Copy the Sheet ID from the URL:

https://docs.google.com/spreadsheets/d/THIS_IS_THE_SHEET_ID/edit#gid=0


Add the sheet ID in script.js under appConfig.classes.

Local Preview

Open index.html in your browser.

Select a grade → it will fetch live data from the sheet.

Deploy (Recommended: GitHub Pages / Netlify / Vercel)

Upload the three files (index.html, style.css, script.js).

Ensure sheet access is public.

Open your deployed URL and test.

📱 Mobile View

On tablets → table scrolls horizontally if wide.

On phones → table turns into card-style layout with per-cell labels.

Controls and summary auto-stack for smaller screens.

🔄 Refresh Logic

Manual: Press Refresh button.

Auto: Every 5 minutes (configurable in script.js → appConfig.settings.autoRefreshInterval).

🛠 Customization

🎨 Update style.css to change colors or layout.

📝 Update appConfig in script.js to add/remove seminar grades.

🕒 Adjust auto-refresh interval or disable it entirely.

✅ Requirements

Modern browser (Chrome, Edge, Firefox, Safari).

Google Sheet must be public or published.

📸 Demo Screenshot (optional)

Add a screenshot here once deployed.

Would you like me to also include example Google Sheet column headers in the README so anyone setting it up knows exactly what headers (Timestamp, Student/Auditor, Name, Mode, Fees) are expected?

You said:
yes
ChatGPT said:

Perfect 👍 Here’s the updated README.md with example Google Sheet headers so anyone can configure it easily:

Student Registration Dashboard

A responsive web dashboard to view student/auditor registrations for HUE seminars.
It fetches live data directly from Google Sheets and displays it with:

📊 Summary cards (total, paid, unpaid, students, auditors)

📅 Localized timestamps (weekday + time zone)

📱 Mobile-friendly layout (table → card view on phones)

🔄 Manual refresh & auto-refresh (every 5 minutes)

🌐 Works with any published Google Sheet in CSV mode

🚀 Features

Dropdown with seminar grades & dates

Live fetch from Google Sheets CSV export

Responsive summary statistics

Styled badges for paid/unpaid, student/auditor, mode (online/offline/hybrid)

Loading overlay while data fetches

Auto-updates every 5 minutes

📂 Project Structure
student-dashboard/
│
├── index.html    # Main UI
├── script.js     # Logic (fetch, render, refresh, auto-refresh)
├── style.css     # Styling (desktop + mobile responsive)
└── README.md     # Project documentation

⚙️ Setup
1. Google Sheet Setup

Open your Google Form’s response sheet (or create your own Google Sheet).

Ensure it has the following headers (row 1):

Timestamp	Student/Auditor / நீங்கள் மாணவரா அல்லது ஆய்வாளரா?	Name / பெயர்	Mode of Attendance / பங்கேற்பு முறை	Fees Paid / கட்டணம் செலுத்தப்பட்டதா?

✅ Example rows:

Timestamp	Student/Auditor	Name	Mode of Attendance	Fees Paid
2025-08-20 10:30:00	Student	Arjun Kumar	Online	Yes
2025-08-20 11:15:00	Auditor	Priya Sharma	Offline	No
2025-08-20 14:45:00	Student	Ravi Patel	Hybrid	Yes

⚠️ Header text can be in English or Tamil (the app auto-detects both).

Make the sheet publicly viewable:

File → Share → Publish to web

OR Share → Anyone with the link → Viewer

Copy the Sheet ID from the URL:

https://docs.google.com/spreadsheets/d/THIS_IS_THE_SHEET_ID/edit#gid=0


Add the sheet ID in script.js under appConfig.classes.

2. Local Preview

Open index.html in your browser.

Select a grade → it will fetch live data from the sheet.

3. Deploy (Recommended: GitHub Pages / Netlify / Vercel)

Upload the three files (index.html, style.css, script.js).

Ensure your sheet is public.

Open your deployed URL and test.

📱 Mobile View

On tablets → table scrolls horizontally if wide.

On phones → table turns into card-style layout with per-cell labels.

Controls and summary auto-stack for smaller screens.

🔄 Refresh Logic

Manual: Press Refresh button.

Auto: Every 5 minutes (configurable in script.js → appConfig.settings.autoRefreshInterval`).

🛠 Customization

🎨 Update style.css to change colors or layout.

📝 Update appConfig in script.js to add/remove seminar grades.

🕒 Adjust auto-refresh interval or disable it entirely.

✅ Requirements

Modern browser (Chrome, Edge, Firefox, Safari).

Google Sheet must be public or published.

📸 Demo Screenshot (optional)

Add a screenshot here once deployed.
