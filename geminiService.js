import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const MODEL_NAME = 'gemini-2.5-flash';
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const HEADER = `ROLE:
You are a senior equity research analyst tasked with producing a professional daily portfolio intelligence newsletter.`;

const RESEARCH_DIRECTIVES = `
OBJECTIVE

Produce a concise, analytical, forward-looking newsletter covering the provided stocks.
Focus on business fundamentals, strategy, and macro implications — not just price action.
Do NOT provide financial advice.

Sources: Include a minimum of 3 credible public sources per stock.
Use short in-text sources for every factual claim (e.g., (Reuters, 2026)).
Provide a full reference list at the end of the newsletter with complete publication details.

RESEARCH DIRECTIONS

For each stock, analyze:
- Financial Changes (revenue, margins, cash flow, debt, liquidity, credit ratings)
- Earnings Activity (latest earnings, guidance changes, analyst expectations)
- Strategic Developments (M&A, partnerships, product launches, expansions)
- Competitive Position (market share, industry disruption, competitor moves)
- Regulatory & Legal Developments (lawsuits, approvals, compliance issues)
- Capital Allocation (buybacks, dividends, debt/equity issuance)
- Macro & Industry Exposure (interest rates, commodity/currency exposure, sector trends)
- Risk Signals (declining demand, margin pressure, customer concentration)

Focus on: CAUSE → BUSINESS IMPACT → FUTURE SIGNAL

OUTPUT FORMAT

Use proper markdown formatting with headers, spacing, and structure.

**MARKET CONTEXT**

- 3–5 bullets summarizing macro environment
- Include inline short sources

**STOCK-BY-STOCK ANALYSIS**

**Company Name (TICKER)**
- **Key Developments**: [analysis with sources]
- **Financial Signals**: [analysis with sources]
- **Strategic Moves**: [analysis with sources]
- **Business Risks**: [analysis with sources]
- **Forward Watch**: [analysis with sources]

**PORTFOLIO-LEVEL INSIGHTS**

**Structural Strengths**
- [analysis with sources]

**Structural Risks**
- [analysis with sources]

**Thematic Exposure**
- [analysis with sources]

**Emerging Signals**
- [analysis with sources]

**REFERENCES**

1. [Source 1]: Full publication details, title, date, URL
2. [Source 2]: Full publication details, title, date, URL
3. [Source 3]: Full publication details, title, date, URL

STYLE GUIDELINES
- Tone: Institutional, neutral, analytical
- Length: ~150–300 words per stock
- Avoid fluff, marketing language, or opinions
- Use precise, information-dense sentences
- No emojis, no casual phrasing
- Use **bold** for section headers and important terms
- Add blank lines between major sections for readability
- Use bullet points and numbered lists appropriately

OUTPUT QUALITY CHECK (MANDATORY)
- Ensure every factual claim has an inline short source
- Ensure every source appears in the reference list
- Ensure no duplicated or low-quality sources
- Ensure forward-looking insight is present
- Ensure proper markdown formatting with **bold** headers

GOAL
Deliver a ready-to-send institutional newsletter that:
- Synthesizes information, not just reports it
- Highlights non-obvious implications
- Helps understand what matters next
- Has professional formatting and clear structure
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
