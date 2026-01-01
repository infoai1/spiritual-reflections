/**
 * Process PDF books and extract text for the knowledge base
 * Run with: node scripts/process-pdf.js path/to/book.pdf
 *
 * Note: Requires pdf-parse package: npm install pdf-parse
 */

const fs = require('fs');
const path = require('path');

async function processPDF(pdfPath) {
  // Dynamic import for pdf-parse (may need to be installed)
  let pdfParse;
  try {
    pdfParse = require('pdf-parse');
  } catch (e) {
    console.log('Installing pdf-parse...');
    require('child_process').execSync('npm install pdf-parse', { stdio: 'inherit' });
    pdfParse = require('pdf-parse');
  }

  const fileName = path.basename(pdfPath, '.pdf');
  const dataBuffer = fs.readFileSync(pdfPath);

  console.log(`Processing: ${pdfPath}\n`);

  try {
    const data = await pdfParse(dataBuffer);

    console.log(`Title: ${data.info?.Title || fileName}`);
    console.log(`Pages: ${data.numpages}`);
    console.log(`Text length: ${data.text.length} characters\n`);

    // Split into chunks (paragraphs)
    const chunks = splitIntoChunks(data.text, 1000);

    const bookData = {
      id: fileName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: data.info?.Title || fileName,
      author: data.info?.Author || 'Maulana Wahiduddin Khan',
      pages: data.numpages,
      chunks: chunks.map((chunk, index) => ({
        id: `${fileName}-chunk-${index}`,
        content: chunk,
        themes: extractThemes(chunk),
      })),
    };

    // Save to knowledge/books directory
    const outputPath = path.join(__dirname, '..', 'knowledge', 'books', `${bookData.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(bookData, null, 2));

    console.log(`Saved ${chunks.length} chunks to ${outputPath}`);

    return bookData;
  } catch (error) {
    console.error('Error processing PDF:', error.message);
    process.exit(1);
  }
}

function splitIntoChunks(text, maxChunkSize = 1000) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 50);

  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if (currentChunk.length + para.length < maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = para;
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  return chunks;
}

function extractThemes(text) {
  const themes = [];
  const lowerText = text.toLowerCase();

  const themeKeywords = {
    gratitude: ['gratitude', 'shukr', 'thankful', 'grateful', 'blessing'],
    contemplation: ['contemplat', 'tafakkur', 'reflect', 'ponder', 'think'],
    hereafter: ['hereafter', 'akhirat', 'afterlife', 'judgment', 'eternal'],
    peace: ['peace', 'salam', 'tranquil', 'serene', 'calm'],
    nature: ['nature', 'creation', 'universe', 'earth', 'sky'],
    patience: ['patience', 'sabr', 'persever', 'endur'],
    faith: ['faith', 'iman', 'belief', 'trust', 'god'],
    wisdom: ['wisdom', 'hikmah', 'knowledge', 'understand'],
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      themes.push(theme);
    }
  }

  return themes;
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node scripts/process-pdf.js <path-to-pdf>');
  console.log('');
  console.log('Example: node scripts/process-pdf.js ~/Downloads/Leading-a-Spiritual-Life.pdf');
  console.log('');
  console.log('The script will:');
  console.log('1. Extract text from the PDF');
  console.log('2. Split into searchable chunks');
  console.log('3. Save to knowledge/books/ directory');
  process.exit(0);
}

processPDF(args[0]);
