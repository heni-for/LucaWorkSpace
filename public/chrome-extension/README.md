# LUCA Course Importer - Chrome Extension

Import courses from Coursera, Udemy, YouTube, Moodle, and more directly into LUCA Education Assistant.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `public/chrome-extension` folder from this project
5. The extension icon should appear in your Chrome toolbar

## Configuration

1. Click the extension icon 🎓
2. Set your LUCA API URL (default: `http://localhost:9002`)
3. Click "Save Settings"

## Usage

1. Open any course page:
   - **Coursera**: Any course page
   - **Udemy**: Course landing or curriculum page
   - **YouTube**: Video or playlist page
   - **Moodle**: Course page
   - **edX**: Course page
   - **Khan Academy**: Topic or course page

2. Click the LUCA extension icon 🎓

3. Review the detected course:
   - Course title
   - Platform
   - Number of chapters detected

4. Click "📥 Import Course to LUCA"

5. The course will be automatically added to your LUCA Education page!

## Supported Platforms

- ✅ Coursera
- ✅ Udemy
- ✅ YouTube (videos & playlists)
- ✅ Moodle
- ✅ edX
- ✅ Khan Academy
- ✅ Generic websites (basic detection)

## Features

- Automatic course detection
- Chapter/section extraction
- One-click import to LUCA
- Progress tracking integration
- Full web research and analysis

## Troubleshooting

- **Not detecting course?** Make sure you're on the actual course page, not a category or search page
- **Import failed?** Check that your LUCA web app is running and the API URL is correct
- **No chapters found?** Some course platforms may require scrolling or expanding sections first

## Development

The extension files:
- `manifest.json` - Extension configuration
- `content.js` - Scrapes course data from pages
- `background.js` - Handles API communication
- `popup.html/js` - Extension popup UI

