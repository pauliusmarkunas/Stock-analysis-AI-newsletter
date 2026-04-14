import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const MODEL_NAME = 'gemini-2.5-flash';
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const HEADER = `ROLE:
You are a senior equity research analyst tasked with producing a professional daily portfolio intelligence newsletter.`;

const RESEARCH_DIRECTIVES = `
OBJECTIVE

Produce a concise, analytical, forward-looking newsletter for the provided stocks.
Focus on business fundamentals, strategy, and macro implications — not price action.
Do NOT provide financial advice.

Use only high-confidence, widely reported information. Prefer major financial outlets (e.g., Reuters, Bloomberg, FT).

INPUT EXPECTATION

Stocks will be provided with pre-collected data (news summaries, earnings highlights, key metrics).
Base analysis strictly on this input. Do not invent or assume missing facts.

ANALYSIS FRAMEWORK (PER STOCK)

Focus on CAUSE → BUSINESS IMPACT → FUTURE SIGNAL

Cover:

Financial changes (revenue, margins, cash flow, debt)
Earnings and guidance signals
Strategic developments (products, partnerships, expansion)
Competitive positioning
Regulatory or legal developments (if relevant)
Capital allocation (if relevant)
Macro/industry exposure
Key risks

OUTPUT FORMAT

Use clean markdown with clear structure.

MARKET CONTEXT

3–5 concise bullets summarizing macro environment

STOCK ANALYSIS

Company Name (TICKER)

Key Developments
Financial Signals
Strategic Moves
Business Risks
Forward Watch

Each section:

Use bullet points
Be concise and analytical (no fluff)
Focus on implications, not description

PORTFOLIO-LEVEL INSIGHTS

Structural Strengths

Key durable advantages across holdings

Structural Risks

Shared vulnerabilities

Thematic Exposure

Common macro or sector themes

Emerging Signals

Early indicators worth monitoring

STYLE GUIDELINES

Tone: Institutional, neutral, analytical
Use precise, information-dense sentences
Avoid repetition and generic statements
No emojis, no casual phrasing
Use bold headers
Add spacing for readability

QUALITY CHECK

Ensure insights are forward-looking
Avoid unsupported or speculative claims
Prioritize clarity over length
Keep analysis tight and high-signal
`;

function buildPrompt(stocks) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `${HEADER}

DATE: ${today}

STOCK LIST: ${stocks.join(', ')}

${RESEARCH_DIRECTIVES}`;
}

function isValidHtml(html) {
  return /<\s*\w.*?>/.test(html.trim());
}

/**
 * Converts basic markdown to HTML for email formatting
 * @param {string} markdown - Markdown text
 * @returns {string} HTML formatted text
 */
function markdownToHtml(markdown) {
  let html = markdown;

  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bullet points to proper HTML lists
  const lines = html.split('\n');
  let inList = false;
  let result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      const content = line.trim().substring(2);
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  html = result.join('\n');

  // Convert numbered lists
  html = html.replace(/^\d+\.\s+(.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>');

  // Convert line breaks to paragraphs for better spacing
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph tags if not already wrapped
  if (!html.includes('<p>') && !html.includes('<ul>') && !html.includes('<ol>') && !html.includes('<h')) {
    html = '<p>' + html + '</p>';
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');

  return html;
}

/**
 * Generates an investment research newsletter using Google Gemini AI
 * @param {string[]} stocks - Array of stock tickers to analyze
 * @returns {Promise<string>} Newsletter content (may be plain text or HTML)
 */
function formatGeminiError(error) {
  const message = String(error?.message || error);
  if (/quota|rate limit|too many requests/i.test(message)) {
    return new Error(
      'Gemini quota/rate limit error: your current API plan has no available free-tier quota for gemini-2.5-flash. Enable billing or use a supported model with available quota.'
    );
  }
  return new Error(message);
}

export async function generateNewsletter(stocks) {
  try {
    const prompt = buildPrompt(stocks);
    const result = await model.generateContent([prompt]);
    const newsletter = result.response.text();

    if (!newsletter || newsletter.trim().length === 0) {
      throw new Error('Generated content is empty or invalid');
    }

    return newsletter;
  } catch (error) {
    const formattedError = formatGeminiError(error);
    console.error('❌ Error generating newsletter:', formattedError.message);
    throw formattedError;
  }
}

/**
 * Wraps the newsletter in a complete HTML email structure.
 * If the content already appears to be a full HTML document, it is returned unchanged.
 * @param {string} newsletter - The newsletter content (markdown or plain text)
 * @returns {string} Complete HTML email
 */
export function wrapNewsletterInHTML(newsletter) {
  const content = newsletter.trim();
  if (/^<!doctype html>/i.test(content) || /<html[\s>]/i.test(content)) {
    return content;
  }

  // Convert markdown to HTML
  const formattedContent = markdownToHtml(content);

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Portfolio Intelligence Newsletter</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
        }
        .header {
            border-bottom: 3px solid #0066cc;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #0066cc;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
        }
        h1, h2, h3 {
            color: #0066cc;
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        h1 { font-size: 22px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        ul, ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        p {
            margin: 15px 0;
            line-height: 1.6;
        }
        strong {
            font-weight: 600;
            color: #0066cc;
        }
        .section {
            margin-bottom: 25px;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #0066cc;
            border-radius: 4px;
        }
        .reference-list {
            background-color: #f0f0f0;
            padding: 20px;
            margin-top: 25px;
            border-left: 4px solid #999;
            border-radius: 4px;
            font-size: 14px;
        }
        .disclaimer {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 25px 0;
            font-size: 12px;
            color: #856404;
            border-radius: 4px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .content-body {
            line-height: 1.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Daily Portfolio Intelligence Newsletter</h1>
            <p>${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
        </div>

        <div class="disclaimer">
            <strong>⚠️ Disclaimer:</strong> This newsletter is generated using artificial intelligence and should not be considered as professional financial advice. Always conduct your own due diligence and consult with a qualified financial advisor before making investment decisions.
        </div>

        <div class="content-body">
            ${formattedContent}
        </div>

        <div class="footer">
            <p>📧 This is an automated daily market analysis newsletter.</p>
            <p>&copy; ${year} Daily Portfolio Intelligence. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}
