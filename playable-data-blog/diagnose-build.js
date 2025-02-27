#!/usr/bin/env node

/**
 * This script checks for common Astro build issues
 */
import fs from 'fs';
import path from 'path';

console.log('=== ASTRO BUILD DIAGNOSTICS ===');

// Check for critical files
const criticalFiles = [
  'package.json',
  'astro.config.mjs',
  'tsconfig.json',
  'tailwind.config.mjs'
];

console.log('Checking for critical files:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
    
    // Check package.json specifically
    if (file === 'package.json') {
      try {
        const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`   - name: ${pkg.name}`);
        console.log(`   - type: ${pkg.type}`);
        console.log(`   - astro version: ${pkg.dependencies?.astro || 'not found'}`);
        
        // Verify Astro build script exists
        if (pkg.scripts && pkg.scripts.build && pkg.scripts.build.includes('astro build')) {
          console.log('   - build script: ✅ found');
        } else {
          console.log('   - build script: ❌ missing or incorrect');
        }
      } catch (e) {
        console.error(`   Error parsing package.json: ${e.message}`);
      }
    }
    
    // Check astro.config.mjs specifically
    if (file === 'astro.config.mjs') {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('defineConfig')) {
          console.log('   - defineConfig: ✅ found');
        } else {
          console.log('   - defineConfig: ❌ missing');
        }
        
        if (content.includes('integrations')) {
          console.log('   - integrations: ✅ found');
        } else {
          console.log('   - integrations: ❌ missing');
        }
      } catch (e) {
        console.error(`   Error reading astro.config.mjs: ${e.message}`);
      }
    }
  } else {
    console.log(`❌ ${file} is missing`);
  }
});

// Check src directory structure
console.log('\nChecking src directory structure:');
if (fs.existsSync('src')) {
  console.log('✅ src directory exists');
  
  // Check key directories
  const srcDirs = ['pages', 'layouts', 'components'];
  srcDirs.forEach(dir => {
    const dirPath = path.join('src', dir);
    if (fs.existsSync(dirPath)) {
      console.log(`   - ${dir}: ✅ found`);
      
      // Check if directories have content
      try {
        const files = fs.readdirSync(dirPath);
        console.log(`     (${files.length} files found)`);
      } catch (e) {
        console.error(`     Error reading directory: ${e.message}`);
      }
    } else {
      console.log(`   - ${dir}: ❌ missing`);
    }
  });
} else {
  console.log('❌ src directory is missing');
}

// Check for common build issues
console.log('\nChecking for common build issues:');

// Check for ESM/CommonJS compatibility
const type = fs.existsSync('package.json') 
  ? JSON.parse(fs.readFileSync('package.json', 'utf8')).type 
  : undefined;

console.log(`Module type: ${type || 'not specified'}`);
if (type === 'module') {
  console.log('✅ Using ESM modules - correct for Astro');
} else if (type === 'commonjs') {
  console.log('❌ Using CommonJS modules - may cause issues with Astro');
} else {
  console.log('⚠️ No module type specified - defaults to CommonJS');
}

console.log('\n=== DIAGNOSTICS COMPLETE ==='); 