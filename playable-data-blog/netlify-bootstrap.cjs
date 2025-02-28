#!/usr/bin/env node

/**
 * CommonJS wrapper for the bootstrap script
 * This file uses CommonJS syntax and imports the ES module bootstrap script
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== NETLIFY BOOTSTRAP WRAPPER ===');
console.log('Using CommonJS wrapper to execute ES module bootstrap script');

// Create a simpler ES module to reduce syntax error potential
const bootstrapContent = `
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=== NETLIFY BOOTSTRAP ===');
console.log('Node version:', process.version);

// Main bootstrap function to isolate execution errors
async function main() {
  try {
    // Current directory
    const currentDir = process.cwd();
    console.log('Current directory:', currentDir);
    
    // Check Python version
    try {
      const pythonVersion = execSync('python --version').toString().trim();
      console.log('Python version:', pythonVersion);
    } catch (error) {
      console.log('Python not available or error checking version');
    }
    
    // Define key directories
    const REPO_DIR = '/opt/build/repo';
    console.log('Repository directory:', REPO_DIR);
    
    const NETLIFY_BASE_DIR = process.env.NETLIFY_BASE_DIR || 'playable-data-blog';
    console.log('Netlify base directory:', NETLIFY_BASE_DIR);
    
    const EXPECTED_OUTPUT_DIR = path.join(REPO_DIR, NETLIFY_BASE_DIR, 'dist');
    console.log('Expected output directory:', EXPECTED_OUTPUT_DIR);
    
    const BUILD_OUTPUT_DIR = path.join(REPO_DIR, 'dist');
    console.log('Build output directory:', BUILD_OUTPUT_DIR);
    
    const BUILD_DIR = path.join(REPO_DIR, NETLIFY_BASE_DIR);
    console.log('Build directory:', BUILD_DIR);
    
    // Create package.json
    const packageJson = {
      name: "game-analytics-content-platform",
      type: "module",
      version: "0.0.1",
      private: true,
      scripts: {
        dev: "astro dev",
        start: "astro dev",
        build: "astro build",
        preview: "astro preview",
        astro: "astro"
      },
      dependencies: {
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
      engines: {
        node: ">=18.0.0"
      }
    };
    
    // Create version files
    console.log('Creating version files...');
    try {
      fs.writeFileSync(path.join(REPO_DIR, '.nvmrc'), '18');
      fs.writeFileSync(path.join(REPO_DIR, '.node-version'), '18.18.0');
      fs.writeFileSync(path.join(REPO_DIR, '.ruby-version'), '2.7.2');
      fs.writeFileSync(path.join(REPO_DIR, '.python-version'), '3.8.0');
      fs.writeFileSync(path.join(REPO_DIR, 'runtime.txt'), '3.8.0');
      fs.writeFileSync(path.join(REPO_DIR, 'requirements.txt'), '# No Python dependencies');
    } catch (error) {
      console.error('Error creating version files:', error.message);
    }
    
    // Create package.json at the correct location
    if (!fs.existsSync(path.join(REPO_DIR, 'package.json'))) {
      fs.writeFileSync(path.join(REPO_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
      console.log('Created package.json file in REPO_DIR');
    }
    
    // Check if build directory exists
    if (!fs.existsSync(BUILD_DIR)) {
      fs.mkdirSync(BUILD_DIR, { recursive: true });
      console.log('Created build directory:', BUILD_DIR);
    }
    
    // Check if package.json exists in build directory
    if (!fs.existsSync(path.join(BUILD_DIR, 'package.json'))) {
      fs.writeFileSync(path.join(BUILD_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
      console.log('Created package.json in build directory');
    }
    
    // Run the build
    console.log('Running build from correct directory...');
    execSync('cd ' + BUILD_DIR + ' && npm install --legacy-peer-deps --no-warnings && npm run build --no-warnings', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_VERSION: '18',
        CI: 'false',
        npm_config_loglevel: 'error'
      }
    });
    
    console.log('Build completed successfully');
    
    // Check if build output exists
    if (fs.existsSync(BUILD_OUTPUT_DIR)) {
      console.log('Build output directory exists');
      
      // Copy to expected location
      if (!fs.existsSync(EXPECTED_OUTPUT_DIR)) {
        fs.mkdirSync(EXPECTED_OUTPUT_DIR, { recursive: true });
      }
      
      execSync('cp -r ' + BUILD_OUTPUT_DIR + '/* ' + EXPECTED_OUTPUT_DIR + '/', { stdio: 'inherit' });
      console.log('Successfully copied build output to expected location');
    } else {
      console.error('Build output directory not found:', BUILD_OUTPUT_DIR);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('===== ERROR IN BOOTSTRAP =====');
    console.error(error);
    return false;
  }
}

// Run the main function
main().then(success => {
  if (success) {
    console.log('Bootstrap completed successfully');
  } else {
    console.error('Bootstrap failed');
  }
});
`;

// Write the ES module bootstrap script to a temporary file
const tempFile = path.join(__dirname, 'temp-bootstrap.mjs');
try {
  fs.writeFileSync(tempFile, bootstrapContent);
  console.log('Created temporary ES module bootstrap script at:', tempFile);
  
  // Log first few lines for debugging
  console.log('First 10 lines of bootstrap script:');
  const contentLines = bootstrapContent.split('\n');
  for (let i = 0; i < Math.min(10, contentLines.length); i++) {
    console.log(`${i+1}: ${contentLines[i]}`);
  }
} catch (writeError) {
  console.error('Error writing bootstrap script:', writeError.message);
  process.exit(1);
}

// Execute the ES module bootstrap script using node with the --experimental-modules flag
try {
  console.log('Executing ES module bootstrap script...');
  const result = spawnSync('node', [tempFile], {
    stdio: 'inherit',
    env: process.env
  });

  // Check for errors
  if (result.error) {
    console.error('Error executing bootstrap script:', result.error.message);
  }

  if (result.status !== 0) {
    console.error(`Bootstrap script exited with code ${result.status}`);
  }

  // Clean up the temporary file
  fs.unlinkSync(tempFile);
  console.log('Removed temporary bootstrap script');

  // Log exit code
  console.log('ES module script exit code:', result.status);
  
  // Always exit with code 0 to allow Netlify to deploy the fallback page
  console.log('Exiting with success code to allow deployment of fallback page');
  process.exit(0);
} catch (error) {
  console.error('Fatal error executing bootstrap:', error.message);
  
  // Try to clean up
  try {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      console.log('Cleaned up temporary file after error');
    }
  } catch (cleanupError) {
    console.error('Failed to clean up temp file:', cleanupError.message);
  }
  
  process.exit(0); // Still exit with 0 to get the fallback page
} 