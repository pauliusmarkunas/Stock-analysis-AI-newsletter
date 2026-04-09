import cron from 'node-cron';
import { config, validateConfig } from './config.js';
import { generateNewsletter, wrapNewsletterInHTML } from './geminiService.js';
import { sendNewsletterEmail, verifyEmailConnection } from './emailService.js';

/**
 * Main function to generate and send the newsletter
 */
async function runNewsletter({ exitOnError = false } = {}) {
  const timestamp = new Date().toLocaleString();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📰 Starting Newsletter Generation: ${timestamp}`);
  console.log(`${'='.repeat(60)}`);

  try {
    // Step 1: Generate newsletter using Gemini
    console.log('\n📝 Analyzing stocks:', config.portfolio.stocks.join(', '));
    console.log('⏳ Generating newsletter with Gemini AI...');
    const newsletter = await generateNewsletter(config.portfolio.stocks);
    console.log('✅ Newsletter generated successfully!');

    // Step 2: Wrap in HTML
    console.log('🎨 Wrapping newsletter in HTML format...');
    const htmlContent = wrapNewsletterInHTML(newsletter);
    console.log('✅ HTML formatting complete!');

    // Step 3: Send email
    console.log(`📧 Sending email to ${config.email.to}...`);
    await sendNewsletterEmail(htmlContent);

    console.log(`\n✨ Newsletter cycle completed successfully!`);
    console.log(`${'='.repeat(60)}\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Newsletter generation failed: ${error.message}`);
    console.error(`${'='.repeat(60)}\n`);
    if (exitOnError) {
      throw error;
    }
    return false;
  }
}

/**
 * Starts the scheduled newsletter automation
 */
async function startScheduler() {
  console.log('\n🚀 Daily Portfolio Intelligence Newsletter Automation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Validate configuration
  validateConfig();
  console.log('✅ Configuration validated');

  // Verify email connection
  console.log('\n🔌 Verifying email connection...');
  try {
    await verifyEmailConnection();
  } catch (error) {
    console.error('\n❌ Cannot proceed without valid email configuration.');
    process.exit(1);
  }

  // Schedule the task
  console.log(`\n⏰ Scheduler configured to run: ${config.scheduler.cronSchedule} (cron format)`);
  console.log('   Explanation: Every day at 6:00 AM (including weekends)');

  // Run immediately in development for testing
  const runImmediately = process.argv.includes('--now');
  const runOnce = process.argv.includes('--once') || process.argv.includes('--run-once');

  if (runImmediately) {
    console.log('\n⚡ Running newsletter immediately due to --now flag...');
    await runNewsletter();
  }

  if (runOnce) {
    console.log('\n⚡ Running newsletter once and exiting due to --once flag...');
    await runNewsletter({ exitOnError: true });
    return;
  }

  // Schedule the recurring task
  const task = cron.schedule(config.scheduler.cronSchedule, async () => {
    await runNewsletter();
  });

  console.log('\n✅ Newsletter scheduler is now running...');
  console.log('Press Ctrl+C to stop the scheduler.\n');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n📴 Shutting down scheduler...');
    task.stop();
    console.log('✅ Scheduler stopped.');
    process.exit(0);
  });
}

// Start the automation
startScheduler().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
