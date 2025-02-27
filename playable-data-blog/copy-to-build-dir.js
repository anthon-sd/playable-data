#!/usr/bin/env node

/**
 * This script copies critical files to the Netlify build directory
 * to ensure they're found during the build process
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Detect Netlify environment
const isNetlify = process.env.NETLIFY === 'true';
const buildDir = process.env.NETLIFY_BUILD_BASE || '/opt/build/repo';

console.log('=== NETLIFY BUILD DIRECTORY SETUP ===');
console.log('Current directory:', process.cwd());
console.log('Is Netlify environment:', isNetlify);
console.log('Build directory:', buildDir);

// Function to ensure a directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// List of critical files to copy
const criticalFiles = [
  'package.json',
  'package-lock.json',
  'astro.config.mjs',
  'tsconfig.json',
  'tailwind.config.mjs',
  'vite.config.js',
  '.npmrc',
  'diagnose-build.js',
  'fallback-build.js',
  'prepare-netlify-build.js'
];

// List of critical directories to copy
const criticalDirs = [
  'src',
  'public'
];

// Only do this in Netlify environment and if we need to
if (isNetlify && buildDir !== process.cwd()) {
  console.log('Setting up build directory...');
  
  // Copy critical files
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const targetPath = path.join(buildDir, file);
      console.log(`Copying ${file} to ${targetPath}`);
      fs.copyFileSync(file, targetPath);
    } else {
      console.log(`Warning: ${file} not found`);
    }
  });
  
  // Copy critical directories
  criticalDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const targetDir = path.join(buildDir, dir);
      console.log(`Copying directory ${dir} to ${targetDir}`);
      ensureDirExists(targetDir);
      
      // Simple copy for directories
      try {
        execSync(`cp -r ${dir}/* ${targetDir}/`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`Error copying directory ${dir}:`, error.message);
      }
    } else {
      console.log(`Warning: Directory ${dir} not found`);
    }
  });
  
  // Print contents of build directory
  console.log('Build directory contents:');
  try {
    const files = fs.readdirSync(buildDir);
    console.log(files.join('\n'));
  } catch (error) {
    console.error('Error listing build directory:', error.message);
  }
} else {
  console.log('Skipping build directory setup - already in correct directory or not on Netlify');
}

console.log('=== BUILD DIRECTORY SETUP COMPLETE ==='); 