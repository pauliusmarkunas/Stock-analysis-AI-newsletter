import dotenv from 'dotenv';

dotenv.config();

const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
  },
  scheduler: {
    cronSchedule: process.env.CRON_SCHEDULE || '0 6 * * *', // Default: 6 AM daily
  },
  portfolio: {
    stocks: (process.env.STOCKS_TO_ANALYZE || 'CRWD,MSFT,AMD,BWX,SPY').split(','),
  },
};

// Validation
const validateConfig = () => {
  const required = [
    'GEMINI_API_KEY',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please update your .env file with all required values.');
    process.exit(1);
  }
};

export { config, validateConfig };
