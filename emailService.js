import nodemailer from 'nodemailer';
import { config } from './config.js';

/**
 * Creates an email transporter using Gmail
 * Note: For Gmail, use an App Password, not your regular password
 */
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // Use TLS for port 587
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

/**
 * Sends the newsletter email
 * @param {string} htmlContent - The HTML content of the newsletter
 * @returns {Promise<object>} Email send response
 */
export async function sendNewsletterEmail(htmlContent) {
  try {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const mailOptions = {
      from: config.email.from,
      to: config.email.to,
      subject: `📊 Daily Portfolio Intelligence Newsletter - ${today}`,
      html: htmlContent,
      text: 'This is an HTML email. Please use an HTML-compatible email client.',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Newsletter sent successfully!');
    console.log('   Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
}

/**
 * Verifies the transporter connection
 */
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error(
      '\nMake sure you are using an App Password (not your regular password) for Gmail.'
    );
    console.error('Learn more: https://support.google.com/accounts/answer/185833');
    throw error;
  }
}
