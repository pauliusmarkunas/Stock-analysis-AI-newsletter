# 🚀 Quick Setup Guide

## Step 1: Get Your Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

## Step 2: Set Up Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Generate and copy the 16-character password

## Step 3: Configure Your .env File

Edit `.env` and add:

```
GEMINI_API_KEY=paste_your_api_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=paste_your_app_password_here
EMAIL_FROM=your_email@gmail.com
EMAIL_TO=paulius464@gmail.com
CRON_SCHEDULE=0 6 * * *
STOCKS_TO_ANALYZE=CRWD,MSFT,AMD,BWX,SPY
```

## Step 4: Test It

Run this command to generate and send a newsletter immediately:

```bash
npm start -- --now
```

Check your email for the newsletter!

## Step 5: Let It Run

Once everything works, just keep the application running:

```bash
npm start
```

It will automatically run every day at 6:00 AM.

---

## 📋 What Each File Does

- **index.js** - Main scheduler that runs the daily task
- **config.js** - Loads and validates your environment variables
- **geminiService.js** - Connects to Google Gemini and generates newsletters
- **emailService.js** - Sends emails via Gmail
- **.env** - Your secret credentials (never share or commit this!)
- **.gitignore** - Prevents accidental database commits

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| Email won't send | Use an App Password, not regular Gmail password |
| API key invalid | Double-check the key is correct and not expired |
| Scheduler not running | Keep the terminal window open |
| Missing environment variables | Run `npm start` to see which ones are missing |

## 🎯 Customization

### Change Email Recipients
Edit `.env`:
```
EMAIL_TO=recipient@example.com
```

### Add More Stocks
Edit `.env`:
```
STOCKS_TO_ANALYZE=CRWD,MSFT,AMD,BWX,SPY,AAPL,GOOGL
```

### Change Schedule
Edit `.env` (cron format):
```
CRON_SCHEDULE=0 14 * * *   # 2:00 PM instead of 6:00 AM
CRON_SCHEDULE=0 6 * * 1-5  # Weekdays only
```

## 📞 Need Help?

Check the full README.md for detailed troubleshooting and deployment options.
