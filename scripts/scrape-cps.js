/**
 * Scrape articles from CPS Global website
 * Run with: node scripts/scrape-cps.js
 */

const fs = require('fs');
const path = require('path');

// URLs to scrape from CPS Global
const ARTICLE_PAGES = [
  'https://cpsglobal.org/life',
  'https://cpsglobal.org/content/spiritual-and-intellectual-development',
];

async function fetchAndParse(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Simple extraction - in production, use a proper HTML parser
    const articles = [];

    // Extract text content between common patterns
    const textMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/gi) || [];

    textMatch.forEach((article, index) => {
      // Remove HTML tags
      const text = article
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (text.length > 100) {
        articles.push({
          id: `cps-${Date.now()}-${index}`,
          source: url,
          content: text.substring(0, 2000), // First 2000 chars
          themes: extractThemes(text),
        });
      }
    });

    return articles;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return [];
  }
}

function extractThemes(text) {
  const themes = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes('gratitude') || lowerText.includes('shukr')) themes.push('gratitude');
  if (lowerText.includes('contemplat') || lowerText.includes('tafakkur')) themes.push('contemplation');
  if (lowerText.includes('hereafter') || lowerText.includes('akhirat')) themes.push('hereafter');
  if (lowerText.includes('peace') || lowerText.includes('salam')) themes.push('peace');
  if (lowerText.includes('nature') || lowerText.includes('creation')) themes.push('nature');
  if (lowerText.includes('patience') || lowerText.includes('sabr')) themes.push('patience');

  return themes;
}

async function main() {
  console.log('Scraping CPS Global articles...\n');

  let allArticles = [];

  for (const url of ARTICLE_PAGES) {
    console.log(`Fetching: ${url}`);
    const articles = await fetchAndParse(url);
    allArticles = allArticles.concat(articles);
    console.log(`  Found ${articles.length} article(s)\n`);
  }

  // Save to knowledge directory
  const outputPath = path.join(__dirname, '..', 'knowledge', 'articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(allArticles, null, 2));

  console.log(`\nSaved ${allArticles.length} articles to ${outputPath}`);
  console.log('\nNote: For better results, consider manually adding article content');
  console.log('or using a proper web scraping library like Cheerio or Puppeteer.');
}

main();
