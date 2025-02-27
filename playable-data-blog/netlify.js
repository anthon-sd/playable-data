#!/usr/bin/env node

// This is a special helper script to debug and fix Netlify build issues
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detect Netlify environment
const isNetlify = process.env.NETLIFY === 'true';
const buildDir = process.env.NETLIFY_BUILD_BASE || '/opt/build/repo';

// Log environment details
console.log('=== NETLIFY BUILD HELPER ===');
console.log('Current directory:', process.cwd());
console.log('Is Netlify environment:', isNetlify);
console.log('Build directory:', buildDir);
console.log('Directory contents:');
try {
  const files = readdirSync('.');
  console.log(files.join('\n'));
} catch (error) {
  console.error('Error listing directory:', error);
}

// Create package.json if it doesn't exist in the build directory
if (isNetlify) {
  const packageJsonPath = join(buildDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.log(`package.json not found at ${packageJsonPath}. Creating it...`);
    
    // Define the contents of package.json - note type is module for Astro
    const packageJson = {
      "name": "game-analytics-content-platform",
      "type": "module",
      "version": "0.0.1",
      "private": true,
      "scripts": {
        "dev": "astro dev",
        "start": "astro dev",
        "prebuild": "node prepare-netlify-build.js",
        "build": "node diagnose-build.js && astro build || node fallback-build.js",
        "preview": "astro preview",
        "astro": "astro",
        "debug": "node netlify-debug.js",
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
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Created package.json at ${packageJsonPath}`);
  } else {
    console.log(`package.json found at ${packageJsonPath}`);
  }
}

// Run npm commands
try {
  console.log('Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

console.log('=== BUILD HELPER COMPLETED ==='); 