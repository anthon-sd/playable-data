#!/usr/bin/env node

/**
 * This script copies critical files to the Netlify build directory
 * to ensure they're found during the build process
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = __dirname;
const BUILD_BASE = process.env.NETLIFY_BUILD_BASE || '/opt/build/repo';
const TARGET_DIR = BUILD_BASE;

console.log('=== COPYING FILES TO BUILD DIRECTORY ===');
console.log('Source directory:', SOURCE_DIR);
console.log('Target directory:', TARGET_DIR);

// Files to copy
const filesToCopy = [
  'package.json',
  'package-lock.json',
  '.nvmrc',
  '.node-version',
  'astro.config.mjs',
  'tailwind.config.mjs',
  'tsconfig.json',
  'netlify.toml',
  'netlify-bootstrap.js',
  'memory-monitor.js'
];

// Copy each file
filesToCopy.forEach(file => {
  const sourcePath = path.join(SOURCE_DIR, file);
  const targetPath = path.join(TARGET_DIR, file);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied ${file}`);
    } else {
      console.log(`⚠️ File not found: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error copying ${file}:`, error.message);
  }
});

// Copy directories
const directoriesToCopy = [
  'src',
  'public'
];

function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Get all items in source directory
  const items = fs.readdirSync(source);
  
  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectory(sourcePath, targetPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Copy each directory
directoriesToCopy.forEach(dir => {
  const sourceDir = path.join(SOURCE_DIR, dir);
  const targetDir = path.join(TARGET_DIR, dir);
  
  try {
    if (fs.existsSync(sourceDir)) {
      copyDirectory(sourceDir, targetDir);
      console.log(`✅ Copied directory ${dir}`);
    } else {
      console.log(`⚠️ Directory not found: ${dir}`);
    }
  } catch (error) {
    console.error(`❌ Error copying directory ${dir}:`, error.message);
  }
});

console.log('=== COPY COMPLETE ==='); 