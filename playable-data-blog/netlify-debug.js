// CommonJS version for compatibility
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== NETLIFY DEPLOYMENT DEBUG INFO ===');
console.log('Current working directory:', process.cwd());
console.log('\nEnvironment detection:');
console.log('NETLIFY:', process.env.NETLIFY);
console.log('NETLIFY_LOCAL:', process.env.NETLIFY_LOCAL);
console.log('CONTEXT:', process.env.CONTEXT);
console.log('NODE_VERSION:', process.env.NODE_VERSION);

console.log('\nDirectory contents:');
try {
  const files = fs.readdirSync('.');
  console.log(files.join('\n'));
} catch (err) {
  console.error('Error reading directory:', err);
}

console.log('\nPackage.json contents (if exists):');
try {
  if (fs.existsSync('./package.json')) {
    const packageJson = fs.readFileSync('./package.json', 'utf8');
    console.log(packageJson);
  } else {
    console.log('package.json does not exist in current directory');
    
    // Try to find package.json in parent directories
    console.log('\nSearching for package.json in parent directories:');
    let currentDir = process.cwd();
    let found = false;
    
    for (let i = 0; i < 5; i++) { // Look up to 5 levels up
      currentDir = path.dirname(currentDir);
      console.log(`Checking ${currentDir}`);
      
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        console.log(`Found package.json in ${currentDir}`);
        const packageContent = fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8');
        console.log(packageContent);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log('Could not find package.json in any parent directory up to 5 levels');
    }
  }
} catch (err) {
  console.error('Error reading package.json:', err);
}

console.log('\n=== END DEBUG INFO ==='); 