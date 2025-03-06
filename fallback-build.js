#!/usr/bin/env node

/**
 * EMERGENCY FALLBACK BUILD SCRIPT
 * This will create a minimal static site if the Astro build fails
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== EMERGENCY FALLBACK BUILD ===');
console.log('Normal build failed. Creating minimal static site...');

// Configure paths
const DIST_DIR = path.join(__dirname, 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Create a simple index.html file
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playable Data - Temporary Page</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { color: #2563eb; }
    .message { 
      background: #f3f4f6; 
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin: 2rem 0;
    }
    .footer { 
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.875rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>Playable Data</h1>
  
  <div class="message">
    <h2>We're working on updates</h2>
    <p>Our site is currently being updated with new content and features. Please check back soon!</p>
    <p>In the meantime, you can contact us at <a href="mailto:contact@playabledata.io">contact@playabledata.io</a>.</p>
  </div>
  
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Playable Data. All rights reserved.</p>
  </div>
</body>
</html>`;

// Write index.html to dist directory
fs.writeFileSync(path.join('dist', 'index.html'), indexHtml);

// Create a simple 404.html file
const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Playable Data</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    h1 { color: #2563eb; }
    .error-code {
      font-size: 6rem;
      font-weight: bold;
      color: #d1d5db;
      margin: 0;
    }
    .message { 
      background: #f3f4f6; 
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin: 2rem 0;
    }
    .home-link {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 0.25rem;
    }
    .footer { 
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.875rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <p class="error-code">404</p>
  <h1>Page Not Found</h1>
  
  <div class="message">
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" class="home-link">Go to Homepage</a>
  </div>
  
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Playable Data. All rights reserved.</p>
  </div>
</body>
</html>`;

// Write 404.html to dist directory
fs.writeFileSync(path.join('dist', '404.html'), notFoundHtml);

console.log('Created basic index.html and 404.html files');
console.log('=== FALLBACK BUILD COMPLETE ==='); 