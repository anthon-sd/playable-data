// Test script to verify author image parsing
import fs from 'fs';
import { parseMarkdown } from './src/utils/storage.js';

// Read the test article
const testArticle = fs.readFileSync('./test-article.md', 'utf8');

// Parse the markdown
console.log('Parsing test article:');
const result = parseMarkdown(testArticle);

// Log the parsed metadata
console.log('\nParsed metadata:');
console.log(JSON.stringify(result.metadata, null, 2));

// Specifically check author data
console.log('\nAuthor data:');
console.log(JSON.stringify(result.metadata.author, null, 2));

// Check if the author image is correctly parsed
if (result.metadata.author && result.metadata.author.image) {
  console.log('\nAuthor image successfully parsed:', result.metadata.author.image);
} else {
  console.log('\nAuthor image NOT found in parsed metadata!');
} 