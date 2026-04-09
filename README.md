# 📊 Daily Portfolio Intelligence Newsletter Automation

A Node.js application that automatically generates and sends daily investment research newsletters powered by Google's Gemini 2.0 Flash AI model.

## 🎯 Features

- **Automated Daily Execution**: Runs every day at 6:00 AM (customizable cron schedule)
- **AI-Powered Analysis**: Uses Google Gemini 2.0 Flash to generate professional investment research
- **Multi-Stock Analysis**: Analyzes financial changes, earnings activity, strategic developments, competitive positioning, regulatory issues, and market trends
- **Institutional-Grade Output**: Produces formatted newsletters with inline sources and reference lists
- **Email Delivery**: Sends HTML-formatted emails with professional styling
- **Error Handling**: Robust error handling and logging for production use
- **Customizable Portfolio**: Easy configuration for analyzing different stocks

## 📋 Prerequisites

Before getting started, you'll need:

1. **Node.js**: Version 16 or higher
2. **Google Gemini API Key**: Get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Gmail Account**: With App Password enabled (not your regular password)
4. **Text Editor**: VS Code or any code editor

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@google/generative-ai` - Google Gemini API client
- `node-cron` - Job scheduling
- `nodemailer` - Email sending
- `dotenv` - Environment configuration

### 2. Configure Environment Variables

Copy and rename `.env.example` to `.env`, then fill in your credentials:

```bash
# .env file
GEMINI_API_KEY=your_api_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=your_email@gmail.com
EMAIL_TO=paulius464@gmail.com
CRON_SCHEDULE=0 6 * * *
STOCKS_TO_ANALYZE=CRWD,MSFT,AMD,BWX,SPY
```

### 3. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste it in your `.env` file

### 4. Set Up Gmail App Password

⚠️ **Important**: You cannot use your regular Gmail password. Follow these steps:

1. Enable 2-Step Verification on your Google Account
2. Go to [Google Account Security](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer" (or your device)
4. Generate an App Password (16 characters)
5. Copy the App Password into `EMAIL_PASSWORD` in your `.env` file

### 5. Run the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

**Test immediately** (don't wait for scheduled time):
```bash
npm start -- --now
```

## 📧 Email Configuration

The application sends emails via Gmail's SMTP server:
- **Host**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Authentication**: Your email + App Password

### Email Format

The newsletter arrives as an HTML email with:
- Professional header with date
- Stock-by-stock analysis
- Inline sources for key facts
- Comprehensive reference list
- AI-generated disclaimer
- Professional styling

## 🔄 How It Works

### Step 1: Trigger (Scheduling)
Uses `node-cron` to execute at specified time (default: 6:00 AM daily)

### Step 2: AI Analysis (Gemini)
Sends a detailed prompt to Google Gemini 2.0 Flash that analyzes:
- Financial changes and performance
- Earnings activity and dates
- Strategic developments
- Competitive positioning
- Regulatory issues
- Capital allocation strategies
- Macro and industry trends
- Risk factors

### Step 3: Email Delivery
Wraps the AI-generated content in professional HTML and sends via Gmail

## 📁 Project Structure

```
stock-analysis/
├── index.js                 # Main scheduler & orchestrator
├── config.js               # Configuration loader & validator
├── geminiService.js        # Gemini API integration
├── emailService.js         # Email sending logic
├── .env                    # Secret credentials (not in git)
├── .env.example            # Configuration template
├── .gitignore              # Git ignore patterns
├── package.json            # Dependencies
└── README.md               # This file
```

## ⚙️ Configuration Options

### Cron Schedule Format

The `CRON_SCHEDULE` uses cron syntax:

```
  ┌───────────── minute (0 - 59)
  │ ┌───────────── hour (0 - 23)
  │ │ ┌───────────── day of month (1 - 31)
  │ │ │ ┌───────────── month (1 - 12)
  │ │ │ │ ┌───────────── day of week (0 - 6) (0 = Sunday)
  │ │ │ │ │
  │ │ │ │ │
  * * * * *
```

**Common Examples**:
- `0 6 * * *` - Every day at 6:00 AM (default)
- `0 6 * * 1-5` - Weekdays only at 6:00 AM
- `0 6 * * 0,6` - Weekends only at 6:00 AM
- `0 6,14 * * *` - 6:00 AM and 2:00 PM daily
- `*/15 * * * *` - Every 15 minutes

### Stocks Configuration

Edit the `STOCKS_TO_ANALYZE` environment variable as a comma-separated list:

```bash
STOCKS_TO_ANALYZE=CRWD,MSFT,AMD,BWX,SPY,AAPL,GOOGL
```

## 🐛 Troubleshooting

### Email Not Sending

**Error**: "Invalid login" or "Authentication failed"
- **Solution**: Use an App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled on your Google Account

**Error**: "Connection timeout"
- **Solution**: Check your firewall settings
- Try using port 465 instead of 587 (change in `.env`)

### Gemini API Issues

**Error**: "Invalid API key"
- **Solution**: Double-check your API key in `.env`
- Regenerate a new key at [Google AI Studio](https://aistudio.google.com/app/apikey)

**Error**: "Rate limit exceeded"
- **Solution**: Gemini Free tier has rate limits
- Consider upgrading to a paid plan for production use

### Newsletter Not Generating

**Error**: Missing environment variables
- **Solution**: Run `npm start` to see which variables are missing
- Update your `.env` file with all required values

### Scheduler Not Running

**Error**: No newsletter sent at scheduled time
- **Solution**: Ensure the application is still running (not closed)
- Check the terminal window for error messages
- Verify the cron schedule format is correct

## 📝 Logs and Monitoring

The application provides detailed console output:

```
🚀 Daily Portfolio Intelligence Newsletter Automation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Configuration validated
🔌 Verifying email connection...
✅ Email configuration verified successfully!

⏰ Scheduler configured to run: 0 6 * * * (cron format)
   Explanation: Every day at 6:00 AM (including weekends)

✅ Newsletter scheduler is now running...
Press Ctrl+C to stop the scheduler.
```

## 🔒 Security Notes

- **Never commit `.env` file** to version control (it contains secrets)
- **Use environment variables** in production deployment
- **App passwords** are more secure than regular passwords
- **Keep API keys confidential** - don't share them publicly

## 🚢 Deployment

### Heroku

1. Create a Heroku account
2. Install Heroku CLI
3. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set GEMINI_API_KEY=your_key
   heroku config:set EMAIL_USER=your_email@gmail.com
   # ... set other environment variables
   git push heroku main
   ```

### Cloud Platforms

Similar deployment to:
- **AWS Lambda** (with CloudWatch Events)
- **Google Cloud Functions**
- **Azure Functions**
- **Railway**
- **Render**

Refer to the specific platform's Node.js documentation.

## 📚 Technologies Used

- **Google Gemini 2.0 Flash**: AI analysis and newsletter generation
- **Node.js**: JavaScript runtime
- **node-cron**: Scheduling library
- **nodemailer**: Email sending
- **dotenv**: Environment configuration

## 📄 License

ISC - See LICENSE file for details

## 💡 Tips

1. **Test Mode**: Run with `npm start -- --now` to test without waiting for scheduled time
2. **Custom Prompts**: Edit the prompt in `geminiService.js` to change analysis focus
3. **Email Templates**: Modify HTML styling in `wrapNewsletterInHTML()` function
4. **Stock Lists**: Change `STOCKS_TO_ANALYZE` to focus on different portfolios
5. **Timing**: Adjust `CRON_SCHEDULE` for different timezones/preferences

## 🧭 GitHub Actions Scheduled Run

You can run the newsletter automatically using GitHub Actions instead of a local server.

1. Add repository secrets in GitHub: `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `EMAIL_TO`, and optionally `STOCKS_TO_ANALYZE`.
2. The workflow file is at `.github/workflows/daily-newsletter.yml`.
3. GitHub will trigger the workflow at `0 6 * * *` UTC each day.
4. Use `workflow_dispatch` to run it manually from the Actions tab.

> Note: GitHub cron schedules run in UTC. Adjust the workflow cron expression if you need a local timezone.

## 📞 Support

For issues with:
- **Gemini API**: Visit [Google AI Support](https://support.google.com/ai-studio)
- **Gmail/App Passwords**: Visit [Google Account Help](https://support.google.com/accounts)
- **Node.js**: Visit [Node.js Documentation](https://nodejs.org/docs/)

## 🎉 Next Steps

1. Install dependencies: `npm install`
2. Configure `.env` file with your credentials
3. Run the application: `npm start -- --now`
4. Check your email for the first newsletter
5. Adjust settings as needed and let it run on schedule

Happy investing! 📈
