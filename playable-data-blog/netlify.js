#!/usr/bin/env node

// This is a special helper script to debug and fix Netlify build issues
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log environment details
console.log('=== NETLIFY BUILD HELPER ===');
console.log('Current directory:', process.cwd());
console.log('Directory contents:');
try {
  const files = fs.readdirSync('.');
  console.log(files.join('\n'));
} catch (error) {
  console.error('Error listing directory:', error);
}

// Create package.json if it doesn't exist in the build directory
if (!fs.existsSync('./package.json')) {
  console.log('package.json not found in current directory. Creating it...');
  
  // Define the contents of package.json
  const packageJson = {
    "name": "game-analytics-content-platform",
    "type": "commonjs",
    "version": "0.0.1",
    "private": true,
    "scripts": {
      "dev": "astro dev",
      "start": "astro dev",
      "build": "astro build",
      "preview": "astro preview",
      "astro": "astro",
      "postinstall": "echo 'Postinstall completed successfully'"
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
  
  // Write the package.json file
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  console.log('Created package.json file');
} else {
  console.log('package.json found in current directory');
}

// Run npm commands
try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

console.log('=== BUILD HELPER COMPLETED ==='); 