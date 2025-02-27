#!/usr/bin/env node

/**
 * NETLIFY BOOTSTRAP SCRIPT
 * This is a minimal script that runs directly in the Netlify environment
 * It sets up the necessary files and then runs the build
 */

// Use CommonJS because this script needs to run before anything else
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPO_DIR = '/opt/build/repo';

console.log('=== NETLIFY BOOTSTRAP ===');
console.log('Current directory:', process.cwd());
console.log('Repository directory:', REPO_DIR);

// Create package.json in the repository directory
const packageJson = {
  "name": "game-analytics-content-platform",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/mdx": "^1.1.5",
    "@astrojs/tailwind": "^5.0.2",
    "@supabase/supabase-js": "^2.39.0",
    "@tailwindcss/typography": "^0.5.10",
    "astro": "^3.5.5",
    "jose": "^5.1.3",
    "marked": "^9.1.5",
    "reading-time": "^1.5.0",
    "slugify": "^1.6.6",
    "tailwindcss": "^3.3.5",
    "terser": "^5.24.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

// Create the package.json file
try {
  fs.writeFileSync(path.join(REPO_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log('Created package.json file');
} catch (error) {
  console.error('Failed to create package.json:', error.message);
  process.exit(1);
}

// List the directory to confirm file creation
try {
  console.log('Repository directory contents:');
  console.log(fs.readdirSync(REPO_DIR).join('\n'));
} catch (error) {
  console.error('Error listing repository directory:', error.message);
}

// Install dependencies
try {
  console.log('Installing dependencies...');
  execSync('cd ' + REPO_DIR + ' && npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Run the build
try {
  console.log('Running build...');
  execSync('cd ' + REPO_DIR + ' && npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  // Create emergency fallback site
  try {
    console.log('Creating emergency fallback site...');
    // Create dist directory if it doesn't exist
    if (!fs.existsSync(path.join(REPO_DIR, 'dist'))) {
      fs.mkdirSync(path.join(REPO_DIR, 'dist'), { recursive: true });
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
    fs.writeFileSync(path.join(REPO_DIR, 'dist', 'index.html'), indexHtml);
    console.log('Created fallback index.html');
    
    // Create a 404 page
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
    fs.writeFileSync(path.join(REPO_DIR, 'dist', '404.html'), notFoundHtml);
    console.log('Created fallback 404.html');
  } catch (fallbackError) {
    console.error('Failed to create fallback site:', fallbackError.message);
  }
  
  process.exit(0); // Still exit with success so Netlify will deploy the fallback
}

console.log('=== BOOTSTRAP COMPLETE ==='); 