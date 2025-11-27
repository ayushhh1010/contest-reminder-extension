# Contest Reminder

Automatically create Google Calendar reminders when registering for contests on **Codeforces** or **LeetCode**.

## Features

- 🎯 Auto-detects contest registration on Codeforces and LeetCode
- 📅 Creates Google Calendar events with reminders
- 🔔 Toast notifications on successful registration
- 🚀 **Serverless** - No backend required!
- 🔒 Secure - Each user authenticates with their own Google account
- 🆓 Completely free to use

## Architecture

This extension is **completely serverless**:
- Uses Chrome Identity API for OAuth authentication
- Makes direct API calls to Google Calendar
- No backend server needed
- Each user's data stays in their own Google Calendar

## Installation

### For Users

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `contest-reminder-extension` folder
6. Done! The extension is now active

### First Time Use

1. Go to any LeetCode or Codeforces contest page
2. Click "Register" on a contest
3. You'll be prompted to sign in with your Google account
4. Grant calendar permissions
5. Future registrations will automatically create calendar events!

## Usage

1. Navigate to a contest page on LeetCode or Codeforces
2. Click the "Register" button
3. A toast notification will confirm the reminder was set
4. Check your Google Calendar for the event!

## Distribution

See [DISTRIBUTION.md](contest-reminder-extension/DISTRIBUTION.md) for instructions on:
- Sharing the extension with others
- Publishing to Chrome Web Store
- Privacy policy template

## Project Structure

```
contest-reminder-backend/
├── contest-reminder-extension/  # Chrome extension (serverless)
│   ├── manifest.json           # Extension configuration
│   ├── background.js           # OAuth & Calendar API
│   ├── content.js              # Page interaction
│   └── DISTRIBUTION.md         # Publishing guide
├── controllers/                # (Legacy - not needed for serverless)
├── routes/                     # (Legacy - not needed for serverless)
└── README.md
```

## Tech Stack

- **Extension**: Chrome Extension Manifest V3
- **Authentication**: Chrome Identity API
- **API**: Google Calendar API v3
- **Performance**: MutationObserver for efficient DOM monitoring

## Privacy

- ✅ No data collection
- ✅ No external servers
- ✅ All data stays in your Google Calendar
- ✅ Open source - verify the code yourself

## License

MIT

