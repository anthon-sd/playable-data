#!/usr/bin/env node

/**
 * Memory Monitor for Netlify Build
 * 
 * This simple script checks memory conditions before proceeding with a build.
 * It can be run as a pre-build step to ensure enough memory is available.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const MIN_MEMORY_REQUIRED_MB = 1536; // Minimum required free memory in MB
const MEMORY_REPORT_FILE = './memory-report.txt';

console.log('=== MEMORY MONITOR FOR NETLIFY BUILD ===');
console.log('Node version:', process.version);

// Write memory report
const writeReport = (content) => {
  fs.appendFileSync(MEMORY_REPORT_FILE, content + '\n');
};

// Initialize report file
fs.writeFileSync(MEMORY_REPORT_FILE, `Memory Report - ${new Date().toISOString()}\n\n`);

// Report Node.js memory usage
const nodeMemory = process.memoryUsage();
console.log('Node.js Memory Usage:');
console.log(`RSS: ${Math.round(nodeMemory.rss / 1024 / 1024)} MB`);
console.log(`Heap Total: ${Math.round(nodeMemory.heapTotal / 1024 / 1024)} MB`);
console.log(`Heap Used: ${Math.round(nodeMemory.heapUsed / 1024 / 1024)} MB`);
console.log(`External: ${Math.round(nodeMemory.external / 1024 / 1024)} MB`);

writeReport('NODE.JS MEMORY USAGE:');
writeReport(`RSS: ${Math.round(nodeMemory.rss / 1024 / 1024)} MB`);
writeReport(`Heap Total: ${Math.round(nodeMemory.heapTotal / 1024 / 1024)} MB`);
writeReport(`Heap Used: ${Math.round(nodeMemory.heapUsed / 1024 / 1024)} MB`);
writeReport(`External: ${Math.round(nodeMemory.external / 1024 / 1024)} MB\n`);

// Attempt to get system memory info
try {
  console.log('\nSystem Memory Info:');
  let systemMemory;
  let freeMemoryMB = 0;
  
  try {
    // Linux
    systemMemory = execSync('free -m').toString();
    console.log(systemMemory);
    writeReport('SYSTEM MEMORY INFO (Linux):');
    writeReport(systemMemory);
    
    // Extract free memory value
    const match = systemMemory.match(/Mem:\s+\d+\s+\d+\s+(\d+)/);
    if (match && match[1]) {
      freeMemoryMB = parseInt(match[1], 10);
    }
  } catch (e) {
    try {
      // MacOS
      systemMemory = execSync('vm_stat && top -l 1 -n 0 | grep PhysMem').toString();
      console.log(systemMemory);
      writeReport('SYSTEM MEMORY INFO (MacOS):');
      writeReport(systemMemory);
      
      // Rough estimate for MacOS
      const pageSize = 4096; // Default page size in bytes
      const match = systemMemory.match(/Pages free:\s+(\d+)/);
      if (match && match[1]) {
        const freePages = parseInt(match[1], 10);
        freeMemoryMB = Math.round((freePages * pageSize) / 1024 / 1024);
      }
    } catch (e2) {
      try {
        // Windows
        systemMemory = execSync('wmic OS get FreePhysicalMemory /Value').toString();
        console.log(systemMemory);
        writeReport('SYSTEM MEMORY INFO (Windows):');
        writeReport(systemMemory);
        
        // Extract free memory for Windows
        const match = systemMemory.match(/FreePhysicalMemory=(\d+)/);
        if (match && match[1]) {
          freeMemoryMB = Math.round(parseInt(match[1], 10) / 1024);
        }
      } catch (e3) {
        console.error('Could not determine system memory');
        writeReport('Could not determine system memory');
      }
    }
  }
  
  // Report free memory
  console.log(`\nDetected free memory: ${freeMemoryMB} MB`);
  writeReport(`\nDetected free memory: ${freeMemoryMB} MB`);
  
  // Check if we have enough memory
  if (freeMemoryMB > 0) {
    if (freeMemoryMB < MIN_MEMORY_REQUIRED_MB) {
      console.error(`WARNING: Only ${freeMemoryMB} MB free memory available. ${MIN_MEMORY_REQUIRED_MB} MB recommended.`);
      writeReport(`WARNING: Only ${freeMemoryMB} MB free memory available. ${MIN_MEMORY_REQUIRED_MB} MB recommended.`);
      
      // Apply memory reduction techniques
      console.log('\nApplying emergency memory reduction techniques:');
      writeReport('\nApplying emergency memory reduction techniques:');
      
      // Set NODE_OPTIONS for reduced memory usage
      process.env.NODE_OPTIONS = '--max-old-space-size=1536 --no-warnings --no-deprecation';
      console.log('1. Set Node.js memory limit to 1536 MB');
      writeReport('1. Set Node.js memory limit to 1536 MB');
      
      // Enable memory-constrained mode
      process.env.ASTRO_MEMORY_LIMIT = 'true';
      process.env.VITE_MEMORY_LIMIT = 'true';
      console.log('2. Enabled memory-constrained build mode');
      writeReport('2. Enabled memory-constrained build mode');
      
      console.log('3. Consider reducing build complexity (disable minification, sourcemaps)');
      writeReport('3. Consider reducing build complexity (disable minification, sourcemaps)');
    } else {
      console.log(`Memory check passed: ${freeMemoryMB} MB available (${MIN_MEMORY_REQUIRED_MB} MB required)`);
      writeReport(`Memory check passed: ${freeMemoryMB} MB available (${MIN_MEMORY_REQUIRED_MB} MB required)`);
    }
  } else {
    console.warn('Could not determine free memory amount. Proceeding with caution.');
    writeReport('Could not determine free memory amount. Proceeding with caution.');
    
    // Set safe limits anyway
    process.env.NODE_OPTIONS = '--max-old-space-size=1536 --no-warnings --no-deprecation';
    process.env.ASTRO_MEMORY_LIMIT = 'true';
    process.env.VITE_MEMORY_LIMIT = 'true';
  }
} catch (error) {
  console.error('Error checking system memory:', error.message);
  writeReport(`Error checking system memory: ${error.message}`);
}

// Check disk space
try {
  console.log('\nDisk Space Info:');
  const diskSpace = execSync('df -h').toString();
  console.log(diskSpace);
  writeReport('\nDISK SPACE INFO:');
  writeReport(diskSpace);
} catch (e) {
  console.log('Could not check disk space');
  writeReport('Could not check disk space');
}

console.log('\nMemory report written to:', MEMORY_REPORT_FILE);
console.log('=== MEMORY MONITOR COMPLETE ===\n');

// Exit with success so the build can continue
process.exit(0); 