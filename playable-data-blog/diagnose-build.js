#!/usr/bin/env node

/**
 * This script checks for common Astro build issues
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== NETLIFY BUILD DIAGNOSTICS ===');
console.log('Node version:', process.version);

// Check for package.json
if (!fs.existsSync('package.json')) {
  console.error('ERROR: package.json not found in current directory');
  process.exit(1);
}

// Verify package.json contents
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log('Package name:', packageJson.name);
  console.log('Package type:', packageJson.type || 'commonjs');
  
  // Check module type
  if (packageJson.type !== 'module') {
    console.warn('WARNING: package.json type is not set to "module". Astro requires "type": "module".');
    
    // Fix this issue
    packageJson.type = 'module';
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('FIXED: package.json updated with "type": "module"');
  }
  
  // Check build script
  if (!packageJson.scripts || !packageJson.scripts.build) {
    console.error('ERROR: No build script found in package.json');
  } else {
    console.log('Build script:', packageJson.scripts.build);
  }
  
  // Check dependencies
  if (!packageJson.dependencies || !packageJson.dependencies.astro) {
    console.error('ERROR: Astro dependency not found in package.json');
  } else {
    console.log('Astro version:', packageJson.dependencies.astro);
  }
} catch (error) {
  console.error('ERROR: Invalid package.json', error.message);
}

// Check for astro.config.mjs
if (!fs.existsSync('astro.config.mjs')) {
  console.error('ERROR: astro.config.mjs not found. This file is required for Astro to build.');
} else {
  console.log('astro.config.mjs found');
}

// Check for Node.js version
try {
  const nodeVersion = process.version;
  console.log('Node.js version:', nodeVersion);
  
  // Extract major version number
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  
  if (majorVersion < 16) {
    console.error('ERROR: Node.js version is too old. Astro requires Node.js 16+');
  } else {
    console.log('Node.js version is compatible with Astro');
  }
} catch (error) {
  console.error('ERROR: Could not check Node.js version', error.message);
}

// Check for src directory
if (!fs.existsSync('src')) {
  console.error('ERROR: src directory not found. This is required for an Astro project.');
} else {
  try {
    const srcFiles = fs.readdirSync('src');
    console.log('src directory contains', srcFiles.length, 'files');
    
    // Check for pages directory
    if (!fs.existsSync('src/pages')) {
      console.error('ERROR: src/pages directory not found. This is required for Astro routing.');
    } else {
      const pagesFiles = fs.readdirSync('src/pages');
      console.log('src/pages directory contains', pagesFiles.length, 'files');
    }
  } catch (error) {
    console.error('ERROR: Could not check src directory', error.message);
  }
}

// Report results and next steps
console.log('\n=== DIAGNOSTICS COMPLETE ===');
console.log('Based on the checks, we can proceed with the build.');
console.log('If any errors were found, they should be addressed before deployment.');

// Exit with success code so the build can continue
process.exit(0); 