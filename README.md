# Student Registration Dashboard

A bilingual (English/Tamil) web dashboard for managing student registrations across different grade seminars.

## Features

- **Bilingual Support**: All interface elements in English and Tamil
- **Grade Management**: Easy dropdown selection for different grades
- **Real-time Data**: Auto-refreshes every 5 minutes
- **Summary Statistics**: Shows total registrations, fees status, student/auditor counts
- **Mode of Attendance**: Tracks Online, Offline, and Hybrid attendance
- **Responsive Design**: Works on desktop and mobile devices
- **JSON Configuration**: Easy class management without code changes

## Files Structure

```
├── index.html          # Main dashboard file
├── classes.json        # Configuration for grades/classes
├── data.json          # Sample/actual student data
└── README.md          # This file
```

## Setup Instructions

### 1. GitHub Pages Deployment

1. Create a new repository on GitHub
2. Upload all files (`index.html`, `classes.json`, `data.json`, `README.md`)
3. Go to repository Settings → Pages
4. Select "Deploy from a branch" → "main branch"
5. Your dashboard will be live at: `https://yourusername.github.io/repository-name`

### 2. Adding/Removing Classes

Edit `classes.json` to manage your seminars:

**To Add a New Class:**
```json
"grade9": {
  "name": "Grade 9",
  "dates": "15 to 18 March 2026",
  "sheetId": "your_google_sheet_id_here",
  "active": true
}
```

**To Hide a Class:**
```json
"grade8": {
  "name": "Grade 8", 
  "dates": "28 December 2025 to 04 January 2026",
  "sheetId": "1y7C5PhSipW1_MoMcR64AVmOyMqG-GyYtrj0CM8KOBwk",
  "active": false
}
```

**To Remove a Class Completely:**
Delete the entire entry from `classes.json`

### 3. Connecting Real Google Sheets Data

#### Option 1: Public Sheets (Easiest)
1. Make your Google Sheets public (View only)
2. Replace sample data in `data.json` with real data
3. Use Google Sheets API or Google Apps Script for automatic updates

#### Option 2: Google Apps Script (Recommended)
1. Create a Google Apps Script project
2. Write a script to read your private sheets
3. Deploy as web app
4. Modify dashboard to fetch from your script URL

#### Option 3: CSV Export
1. Export each sheet as CSV
2. Upload CSV files to repository
3. Modify dashboard to read CSV files using Papa Parse

## Data Format

Each student record should include:

```json
{
  "timestamp": "2024-12-20 10:30:00",
  "type": "Student / மாணவர்",
  "name": "Student Name / மாணவர் பெயர்",
  "modeOfAttendance": "Online / ஆன்லைன்",
  "feesPaid": "Yes / ஆம்"
}
```

### Supported Values:

**Type / மாணவர் வகை:**
- "Student / மாணவர்"
- "Auditor / ஆய்வாளர்"

**Mode of Attendance / பங்கேற்பு முறை:**
- "Online / ஆன்லைன்"
- "Offline / ஆஃப்லைன்"  
- "Hybrid / கலப்பு"

**Fees Status / கட்டணம் நிலை:**
- "Yes / ஆம்" (Paid)
- "No / இல்லை" (Pending)

## Customization

### Colors
Modify CSS variables in `index.html` to change the color scheme.

### Languages
Add more language support by extending the bilingual text patterns in JavaScript.

### Refresh Interval
Change auto-refresh timing in `classes.json` under settings:
```json
"settings": {
  "autoRefreshInterval": 300000
}
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
1. Check existing issues in GitHub
2. Create a new issue with detailed description
3. Include screenshots if applicable

---

**Note**: Remember to keep your Google Sheets data secure and never commit sensitive information to public repositories.
