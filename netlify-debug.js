import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get information about the system
function getSystemInfo() {
  console.log('=== NETLIFY DEBUG INFO ===');
  console.log('Date:', new Date().toISOString());
  
  try {
    console.log('\n=== NODE INFO ===');
    console.log('Node Version:', process.version);
    console.log('Node Executable:', process.execPath);
    console.log('Platform:', process.platform);
    console.log('Architecture:', process.arch);
    
    console.log('\n=== MEMORY INFO ===');
    const mem = process.memoryUsage();
    console.log('RSS:', Math.round(mem.rss / 1024 / 1024), 'MB');
    console.log('Heap Total:', Math.round(mem.heapTotal / 1024 / 1024), 'MB');
    console.log('Heap Used:', Math.round(mem.heapUsed / 1024 / 1024), 'MB');
    console.log('External:', Math.round(mem.external / 1024 / 1024), 'MB');
    
    console.log('\n=== ENVIRONMENT ===');
    console.log('NODE_OPTIONS:', process.env.NODE_OPTIONS || 'not set');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
    
    // Check for Netlify-specific environment variables
    const netlifyVars = Object.keys(process.env)
      .filter(key => key.startsWith('NETLIFY'))
      .reduce((obj, key) => {
        obj[key] = process.env[key];
        return obj;
      }, {});
    
    console.log('\n=== NETLIFY ENVIRONMENT ===');
    console.log(JSON.stringify(netlifyVars, null, 2));
    
    console.log('\n=== REPOSITORY INFO ===');
    try {
      const gitInfo = execSync('git remote -v && git branch --show-current').toString();
      console.log(gitInfo);
    } catch (e) {
      console.log('Git information not available');
    }
    
    console.log('\n=== DIRECTORY STRUCTURE ===');
    console.log('Current Working Directory:', process.cwd());
    checkDir(process.cwd());
    
    console.log('\n=== PACKAGE.JSON ===');
    try {
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        console.log('Name:', pkg.name);
        console.log('Version:', pkg.version);
        console.log('Type:', pkg.type || 'commonjs');
        console.log('Scripts:');
        for (const [name, script] of Object.entries(pkg.scripts || {})) {
          console.log(`  ${name}: ${script}`);
        }
        console.log('Dependencies Count:', Object.keys(pkg.dependencies || {}).length);
        console.log('DevDependencies Count:', Object.keys(pkg.devDependencies || {}).length);
      } else {
        console.log('package.json not found');
      }
    } catch (e) {
      console.log('Error reading package.json:', e.message);
    }
    
  } catch (error) {
    console.error('Error gathering debug info:', error);
  }
  
  console.log('\n=== DEBUG INFO COMPLETE ===');
}

// Check a directory and list files
function checkDir(dirPath, level = 0, maxLevel = 2) {
  if (level > maxLevel) return; // Limit recursion
  
  try {
    const items = fs.readdirSync(dirPath);
    console.log(`${' '.repeat(level * 2)}📁 ${path.basename(dirPath)} (${items.length} items)`);
    
    // List all items in the directory
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        checkDir(itemPath, level + 1, maxLevel);
      } else {
        console.log(`${' '.repeat((level + 1) * 2)}📄 ${item} (${Math.round(stats.size / 1024)} KB)`);
      }
    }
  } catch (e) {
    console.log(`${' '.repeat(level * 2)}❌ Error reading directory ${dirPath}: ${e.message}`);
  }
}

// Run the diagnostics
getSystemInfo(); 