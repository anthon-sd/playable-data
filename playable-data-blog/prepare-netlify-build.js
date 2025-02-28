#!/usr/bin/env node

/**
 * This script prepares the environment for Netlify build
 * It runs before the main build to ensure everything is set up properly
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('=== NETLIFY BUILD PREPARATION ===');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('NPM version:', execSync('npm -v').toString().trim());

// Make all scripts executable
const scriptsToMakeExecutable = [
  'diagnose-build.js',
  'fallback-build.js',
  'netlify.js'
];

scriptsToMakeExecutable.forEach(script => {
  try {
    if (fs.existsSync(script)) {
      console.log(`Making ${script} executable...`);
      execSync(`chmod +x ${script}`);
    } else {
      console.log(`Script ${script} not found`);
    }
  } catch (error) {
    console.error(`Error making ${script} executable:`, error.message);
  }
});

// Ensure package.json is in the correct state
try {
  console.log('Checking package.json...');
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    let updated = false;
    
    // Ensure type is set to "module"
    if (packageJson.type !== 'module') {
      packageJson.type = 'module';
      updated = true;
      console.log('Updated package.json type to "module"');
    }
    
    // Ensure build script is set to use the CJS bootstrap file
    if (packageJson.scripts?.build !== 'node netlify-bootstrap.cjs') {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.build = 'node netlify-bootstrap.cjs';
      updated = true;
      console.log('Updated build script to use netlify-bootstrap.cjs');
    }
    
    if (updated) {
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('Saved updated package.json');
    } else {
      console.log('package.json is already in the correct state');
    }
  } else {
    console.error('package.json not found!');
  }
} catch (error) {
  console.error('Error updating package.json:', error.message);
}

console.log('=== PREPARATION COMPLETE ==='); 