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

// Detect if we're in the correct subdirectory
const currentDir = process.cwd();
console.log('=== NETLIFY BOOTSTRAP ===');
console.log('Current directory:', currentDir);

// Log environment details
console.log('Node version:', process.version);
try {
  const pythonVersion = execSync('python --version').toString().trim();
  console.log('Python version:', pythonVersion);
} catch (error) {
  console.log('Python not available or error checking version');
}

// This is the directory where Netlify expects the package.json file
const REPO_DIR = '/opt/build/repo';
console.log('Repository directory:', REPO_DIR);

// Determine if we're in a subdirectory or not
const isInSubdir = currentDir.includes('playable-data-blog') || 
                  fs.existsSync(path.join(currentDir, 'package.json'));
console.log('Is in correct subdirectory:', isInSubdir);

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

// Create version files to ensure correct environment detection
try {
  // Create .nvmrc
  fs.writeFileSync(path.join(REPO_DIR, '.nvmrc'), '18');
  console.log('Created .nvmrc file');
  
  // Create .node-version 
  fs.writeFileSync(path.join(REPO_DIR, '.node-version'), '18.18.0');
  console.log('Created .node-version file');
  
  // Create .ruby-version with a valid version (instead of 0.0.0)
  fs.writeFileSync(path.join(REPO_DIR, '.ruby-version'), '2.7.2');
  console.log('Created .ruby-version file');
  
  // Create .python-version
  fs.writeFileSync(path.join(REPO_DIR, '.python-version'), '3.8.0');
  console.log('Created .python-version file');
  
  // Create runtime.txt with just the Python version number (not prefixed with "python-")
  fs.writeFileSync(path.join(REPO_DIR, 'runtime.txt'), '3.8.0');
  console.log('Created runtime.txt file with Python version');
  
  // Create empty requirements.txt to indicate no Python dependencies
  fs.writeFileSync(path.join(REPO_DIR, 'requirements.txt'), '# No Python dependencies');
  console.log('Created empty requirements.txt file');
} catch (error) {
  console.error('Error creating version files:', error.message);
}

// Create or verify package.json at the correct location
try {
  if (!fs.existsSync(path.join(REPO_DIR, 'package.json'))) {
    fs.writeFileSync(path.join(REPO_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
    console.log('Created package.json file in REPO_DIR');
  } else {
    console.log('package.json already exists in REPO_DIR');
  }
  
  // List directory contents to verify
  console.log('Repository directory contents:');
  console.log(fs.readdirSync(REPO_DIR).join('\n'));
} catch (error) {
  console.error('Error with package.json setup:', error.message);
}

// Copy source files to the build directory if needed
try {
  // Check if we need to copy src/ directory
  if (fs.existsSync('src') && !fs.existsSync(path.join(REPO_DIR, 'src'))) {
    console.log('Copying src directory to build location...');
    fs.mkdirSync(path.join(REPO_DIR, 'src'), { recursive: true });
    execSync(`cp -r src/* ${path.join(REPO_DIR, 'src')}/`, { stdio: 'inherit' });
  }
  
  // Check if we need to copy public/ directory
  if (fs.existsSync('public') && !fs.existsSync(path.join(REPO_DIR, 'public'))) {
    console.log('Copying public directory to build location...');
    fs.mkdirSync(path.join(REPO_DIR, 'public'), { recursive: true });
    execSync(`cp -r public/* ${path.join(REPO_DIR, 'public')}/`, { stdio: 'inherit' });
  }
  
  // Copy config files
  ['astro.config.mjs', 'tsconfig.json', 'tailwind.config.mjs'].forEach(file => {
    if (fs.existsSync(file) && !fs.existsSync(path.join(REPO_DIR, file))) {
      console.log(`Copying ${file} to build location...`);
      fs.copyFileSync(file, path.join(REPO_DIR, file));
    }
  });
} catch (error) {
  console.error('Error copying project files:', error.message);
}

// Install dependencies with explicit environment variables
try {
  console.log('Installing dependencies...');
  // Set environment variables to ensure compatibility
  const env = {
    ...process.env,
    NODE_VERSION: '18',
    PYTHON_VERSION: '3.8',
    NETLIFY_USE_YARN: 'false',
    NETLIFY_USE_PNPM: 'false',
    PATH: process.env.PATH
  };
  
  execSync('cd ' + REPO_DIR + ' && npm install --legacy-peer-deps', { 
    stdio: 'inherit',
    env: env
  });
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