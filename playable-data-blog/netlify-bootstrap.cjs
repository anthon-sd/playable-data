#!/usr/bin/env node

// Super simple bootstrap script that ensures the dist directory exists
// This is a minimal version that should work reliably

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== SIMPLIFIED NETLIFY BOOTSTRAP ===');
console.log('Node version:', process.version);

// Get the current working directory
const currentDir = process.cwd();
console.log('Current directory:', currentDir);

// Show all environment variables for debugging
console.log('Environment variables:');
console.log(JSON.stringify(process.env, null, 2));

// Determine critical paths
const REPO_DIR = '/opt/build/repo';
const BASE_DIR = 'playable-data-blog'; // This is set in the Netlify UI
const BUILD_DIR = path.join(REPO_DIR, BASE_DIR);
const DIST_DIR = path.join(BUILD_DIR, 'dist');

console.log('Repository directory:', REPO_DIR);
console.log('Base directory:', BASE_DIR);
console.log('Build directory:', BUILD_DIR);
console.log('Dist directory:', DIST_DIR);

// List contents of the build directory
try {
  console.log('Contents of REPO_DIR:');
  console.log(fs.readdirSync(REPO_DIR).join('\n'));
} catch (error) {
  console.error('Error listing REPO_DIR:', error.message);
}

// CRITICAL: Ensure the dist directory exists
try {
  // Ensure the dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.log(`Creating dist directory at ${DIST_DIR}`);
    fs.mkdirSync(DIST_DIR, { recursive: true });
    console.log(`Dist directory created successfully`);
  } else {
    console.log(`Dist directory already exists at ${DIST_DIR}`);
  }
  
  // List the contents of the dist directory if it exists
  if (fs.existsSync(DIST_DIR)) {
    console.log(`Contents of dist directory:`);
    console.log(fs.readdirSync(DIST_DIR).join('\n'));
  }
  
  // Create a simple index.html file to ensure the site deploys
  const indexHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Playable Data</title>\n  <style>\n    body { \n      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;\n      max-width: 800px; \n      margin: 0 auto; \n      padding: 2rem; \n      line-height: 1.6;\n    }\n    .message { \n      background: #f0f9ff; \n      border-left: 4px solid #0ea5e9; \n      padding: 1rem; \n      margin: 1.5rem 0; \n    }\n  </style>\n</head>\n<body>\n  <h1>Playable Data</h1>\n  <div class="message">\n    <p><strong>Simple Page:</strong> This is a minimal page created by the bootstrap script.</p>\n    <p>Build timestamp: ' + new Date().toISOString() + '</p>\n  </div>\n  <p>The site is currently being developed. Please check back later for updates.</p>\n</body>\n</html>';
  
  // Write the file, ensuring it exists
  const indexPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(indexPath, indexHtml);
  console.log(`Created index.html at ${indexPath}`);
  
  // Create a simple 404 page too
  const notFoundHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Not Found - Playable Data</title>\n  <style>\n    body { \n      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;\n      max-width: 800px; \n      margin: 0 auto; \n      padding: 2rem; \n      line-height: 1.6;\n      text-align: center;\n    }\n    .error { \n      background: #fef2f2; \n      border-left: 4px solid #ef4444; \n      padding: 1rem; \n      margin: 1.5rem 0; \n      text-align: left;\n    }\n  </style>\n</head>\n<body>\n  <h1>404 - Page Not Found</h1>\n  <div class="error">\n    <p>The page you\'re looking for could not be found.</p>\n    <p>Build timestamp: ' + new Date().toISOString() + '</p>\n  </div>\n  <p>Return to <a href="/">home page</a>.</p>\n</body>\n</html>';
  
  const notFoundPath = path.join(DIST_DIR, '404.html');
  fs.writeFileSync(notFoundPath, notFoundHtml);
  console.log(`Created 404.html at ${notFoundPath}`);
  
  console.log('Bootstrap completed successfully! The dist directory exists and contains files.');
  process.exit(0);
} catch (error) {
  console.error('Error during bootstrap:', error);
  process.exit(1);
} 