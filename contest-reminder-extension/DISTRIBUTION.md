# Contest Reminder Extension - Distribution Guide

## Overview
This extension is now **serverless** - it works completely standalone without requiring a backend server. Each user authenticates with their own Google account.

## For Users: Installation

### Option 1: Load Unpacked (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `contest-reminder-extension` folder
6. The extension is now installed!

### Option 2: Chrome Web Store (Recommended)
*Coming soon - requires $5 one-time developer fee to publish*

## First Time Setup

1. After installing the extension, go to any LeetCode or Codeforces contest page
2. Click "Register" on a contest
3. You'll be prompted to sign in with your Google account
4. Grant calendar permissions
5. Done! Future registrations will automatically create calendar events

## For Developers: Publishing to Chrome Web Store

### Prerequisites
- Google account
- $5 one-time developer registration fee
- Extension packaged as .zip file

### Steps

1. **Prepare the Extension**
   ```bash
   cd contest-reminder-extension
   # Remove any development files
   rm -rf .git .DS_Store
   # Create zip file
   zip -r contest-reminder.zip .
   ```

2. **Create Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay $5 registration fee (one-time)

3. **Upload Extension**
   - Click "New Item"
   - Upload `contest-reminder.zip`
   - Fill in store listing details:
     - Name: Contest Reminder
     - Description: Automatically create Google Calendar reminders for Codeforces and LeetCode contests
     - Category: Productivity
     - Screenshots: (capture extension in action)
   
4. **Privacy & Permissions**
   - Explain why you need calendar permissions
   - Add privacy policy (template below)

5. **Submit for Review**
   - Review typically takes 1-3 business days
   - Once approved, extension is live!

## Privacy Policy Template

```
Contest Reminder Extension Privacy Policy

This extension requires access to your Google Calendar to create event reminders when you register for programming contests.

Data Collection:
- We do NOT collect, store, or transmit any personal data
- All authentication happens directly between you and Google
- Calendar events are created locally in your own Google Calendar

Permissions Used:
- identity: To authenticate with your Google account
- calendar.events: To create calendar events
- activeTab: To detect contest registration on Codeforces and LeetCode

Open Source:
This extension is open source. View the code at: [your-github-repo]

Contact: [your-email]
```

## Sharing the Extension

### Before Publishing
Users must:
1. Download the extension folder
2. Load it unpacked in Chrome
3. Each user authenticates with their own Google account

### After Publishing
Users can:
1. Install with one click from Chrome Web Store
2. Automatic updates when you release new versions

## Architecture

**Serverless Design:**
- No backend server required
- Extension uses Chrome Identity API for OAuth
- Direct API calls to Google Calendar
- Each user's data stays in their own Google account

**Benefits:**
- ✅ Completely free to run
- ✅ No server maintenance
- ✅ Better privacy (no central server)
- ✅ Works for unlimited users

## Support

For issues or questions:
- GitHub Issues: [your-repo-url]
- Email: [your-email]
