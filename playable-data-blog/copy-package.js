#!/usr/bin/env node

/**
 * This script ensures package.json is copied to the Netlify build directory
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the source and target locations
const sourcePath = path.join(__dirname, 'package.json');
const targetDir = process.env.NETLIFY_BUILD_BASE || '/opt/build/repo';
const targetPath = path.join(targetDir, 'package.json');

console.log('=== PACKAGE.JSON COPY UTILITY ===');
console.log('Current directory:', __dirname);
console.log('Source package.json path:', sourcePath);
console.log('Target directory:', targetDir);
console.log('Target package.json path:', targetPath);

// Check if source package.json exists
if (fs.existsSync(sourcePath)) {
  console.log('Source package.json exists, reading file...');
  
  try {
    // Read the source package.json
    const packageData = fs.readFileSync(sourcePath, 'utf8');
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      console.log(`Target directory ${targetDir} doesn't exist, creating it...`);
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Write to target location
    fs.writeFileSync(targetPath, packageData);
    console.log('Successfully copied package.json to target location');
    
    // Verify the file was written correctly
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      console.log(`Target file exists with size: ${stats.size} bytes`);
    } else {
      console.error('Target file was not created successfully');
    }
  } catch (error) {
    console.error('Error during file copy operation:', error);
  }
} else {
  console.error('Source package.json does not exist!');
}

console.log('=== PACKAGE.JSON COPY COMPLETED ==='); 