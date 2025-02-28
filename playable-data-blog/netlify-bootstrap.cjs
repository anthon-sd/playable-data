#!/usr/bin/env node

// Enhanced bootstrap script that attempts to properly build the site
// but falls back to creating minimal files if the build fails

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== ENHANCED NETLIFY BOOTSTRAP ===');
console.log('Node version:', process.version);

// Get the current working directory
const currentDir = process.cwd();
console.log('Current directory:', currentDir);

// Determine critical paths
const REPO_DIR = '/opt/build/repo';
const BASE_DIR = 'playable-data-blog'; // This is set in the Netlify UI
const BUILD_DIR = path.join(REPO_DIR, BASE_DIR);
const DIST_DIR = path.join(BUILD_DIR, 'dist');

console.log('Repository directory:', REPO_DIR);
console.log('Base directory:', BASE_DIR);
console.log('Build directory:', BUILD_DIR);
console.log('Dist directory:', DIST_DIR);

// List contents of the build directory
try {
  console.log('Contents of BUILD_DIR:');
  console.log(fs.readdirSync(BUILD_DIR).join('\n'));
} catch (error) {
  console.error('Error listing BUILD_DIR:', error.message);
}

// Helper function for creating fallback content
function createFallbackContent() {
  console.log('Creating fallback content...');

  // Ensure the dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.log(`Creating dist directory at ${DIST_DIR}`);
    fs.mkdirSync(DIST_DIR, { recursive: true });
    console.log(`Dist directory created successfully`);
  }
  
  // Create a simple index.html file to ensure the site deploys
  const indexHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Playable Data</title>\n  <style>\n    body { \n      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;\n      max-width: 800px; \n      margin: 0 auto; \n      padding: 2rem; \n      line-height: 1.6;\n    }\n    .message { \n      background: #f0f9ff; \n      border-left: 4px solid #0ea5e9; \n      padding: 1rem; \n      margin: 1.5rem 0; \n    }\n    .error { \n      background: #fef2f2; \n      border-left: 4px solid #ef4444; \n      padding: 1rem; \n      margin: 1.5rem 0; \n    }\n  </style>\n</head>\n<body>\n  <h1>Playable Data</h1>\n  <div class="message">\n    <p><strong>Simple Page:</strong> This is a minimal fallback page created by the bootstrap script.</p>\n    <p>The actual site build failed, so this page is being shown instead.</p>\n    <p>Build timestamp: ' + new Date().toISOString() + '</p>\n  </div>\n  <div class="error">\n    <p><strong>Note to site owners:</strong> Please check the Netlify build logs for errors.</p>\n  </div>\n</body>\n</html>';
  
  // Write the file, ensuring it exists
  const indexPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(indexPath, indexHtml);
  console.log(`Created index.html at ${indexPath}`);
  
  // Create a simple 404 page too
  const notFoundHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Not Found - Playable Data</title>\n  <style>\n    body { \n      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;\n      max-width: 800px; \n      margin: 0 auto; \n      padding: 2rem; \n      line-height: 1.6;\n      text-align: center;\n    }\n    .error { \n      background: #fef2f2; \n      border-left: 4px solid #ef4444; \n      padding: 1rem; \n      margin: 1.5rem 0; \n      text-align: left;\n    }\n  </style>\n</head>\n<body>\n  <h1>404 - Page Not Found</h1>\n  <div class="error">\n    <p>The page you\'re looking for could not be found.</p>\n    <p>Build timestamp: ' + new Date().toISOString() + '</p>\n  </div>\n  <p>Return to <a href="/">home page</a>.</p>\n</body>\n</html>';
  
  const notFoundPath = path.join(DIST_DIR, '404.html');
  fs.writeFileSync(notFoundPath, notFoundHtml);
  console.log(`Created 404.html at ${notFoundPath}`);
  
  // Create a simple CSS file to add another asset
  const simpleCss = 'body { font-family: sans-serif; }';
  const cssPath = path.join(DIST_DIR, 'styles.css');
  fs.writeFileSync(cssPath, simpleCss);
  console.log(`Created styles.css at ${cssPath}`);
}

// Helper function to debug project structure
function debugProjectStructure() {
  console.log('===== DEBUGGING PROJECT STRUCTURE =====');
  
  // Check package.json
  console.log('Checking package.json...');
  if (fs.existsSync(path.join(BUILD_DIR, 'package.json'))) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'package.json'), 'utf8'));
      console.log('Package name:', packageJson.name);
      console.log('Build script:', packageJson.scripts?.build || 'Not defined');
      console.log('Dependencies count:', Object.keys(packageJson.dependencies || {}).length);
      
      // Check for common build frameworks
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.astro) console.log('Framework detected: Astro');
      if (deps.next) console.log('Framework detected: Next.js');
      if (deps.gatsby) console.log('Framework detected: Gatsby');
      if (deps.react) console.log('Framework detected: React');
      if (deps.vue) console.log('Framework detected: Vue');
      if (deps.angular) console.log('Framework detected: Angular');
    } catch (e) {
      console.error('Error parsing package.json:', e.message);
    }
  } else {
    console.log('package.json not found in project directory');
  }
  
  // Check for common configuration files
  const configFiles = [
    'astro.config.mjs',
    'astro.config.js',
    'next.config.js',
    'gatsby-config.js',
    'vite.config.js',
    'webpack.config.js',
    'angular.json',
    'tsconfig.json'
  ];
  
  console.log('Checking for configuration files...');
  configFiles.forEach(file => {
    if (fs.existsSync(path.join(BUILD_DIR, file))) {
      console.log(`Found: ${file}`);
    }
  });
  
  // Check for source directories
  const sourceDirs = ['src', 'components', 'pages', 'public', 'static', 'assets'];
  console.log('Checking for source directories...');
  sourceDirs.forEach(dir => {
    if (fs.existsSync(path.join(BUILD_DIR, dir))) {
      console.log(`Found: ${dir}/ directory`);
      try {
        const files = fs.readdirSync(path.join(BUILD_DIR, dir));
        console.log(`  Contains ${files.length} files/directories`);
      } catch (e) {
        console.error(`  Error reading directory:`, e.message);
      }
    }
  });
  
  console.log('===== END PROJECT STRUCTURE DEBUG =====');
}

// MAIN EXECUTION
try {
  // Step 1: Ensure we're in the correct directory
  process.chdir(BUILD_DIR);
  console.log(`Changed directory to: ${process.cwd()}`);
  
  // Debug project structure to understand what we're working with
  debugProjectStructure();
  
  // Step 2: Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('package.json not found in build directory');
    throw new Error('package.json not found');
  }
  
  // Step 3: Install dependencies
  console.log('Installing dependencies...');
  try {
    execSync('npm install --legacy-peer-deps --no-warnings', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: 'false',
        npm_config_loglevel: 'error'
      }
    });
    console.log('Dependencies installed successfully');
  } catch (installError) {
    console.error('Error installing dependencies:', installError.message);
    throw new Error('Failed to install dependencies');
  }
  
  // Step 4: Run the build
  console.log('Running build...');
  try {
    execSync('npm run build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: 'false',
        npm_config_loglevel: 'error'
      }
    });
    console.log('Build completed successfully');
  } catch (buildError) {
    console.error('Error running build:', buildError.message);
    throw new Error('Build command failed');
  }
  
  // Step 5: Verify build output
  if (fs.existsSync(DIST_DIR)) {
    console.log('Dist directory exists, checking contents...');
    const distContents = fs.readdirSync(DIST_DIR);
    console.log('Dist directory contents:', distContents.join(', '));
    
    if (distContents.length < 5) {
      console.warn(`WARNING: Only ${distContents.length} files found in dist directory. This may indicate a build problem.`);
      
      // Check for key files
      if (!distContents.includes('index.html')) {
        console.error('index.html not found in dist directory');
        
        // Check if build output might be in a different location
        console.log('Checking for build output in alternate locations...');
        
        // Common locations for build output
        const possibleBuildDirs = [
          path.join(BUILD_DIR, 'build'),
          path.join(BUILD_DIR, 'public'),
          path.join(BUILD_DIR, '_site'),
          path.join(BUILD_DIR, 'out'),
          path.join(REPO_DIR, 'dist')
        ];
        
        let foundAlternativeBuildDir = false;
        
        for (const dir of possibleBuildDirs) {
          if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
            console.log(`Found potential build output at ${dir}`);
            foundAlternativeBuildDir = true;
            
            // Copy all contents to the expected dist directory
            try {
              // Ensure the expected dist directory exists
              if (!fs.existsSync(DIST_DIR)) {
                fs.mkdirSync(DIST_DIR, { recursive: true });
              }
              
              // Copy all files
              console.log(`Copying files from ${dir} to ${DIST_DIR}...`);
              execSync(`cp -r ${dir}/* ${DIST_DIR}/`, { stdio: 'inherit' });
              console.log('Files copied successfully');
              
              // Verify the copy worked
              const newDistContents = fs.readdirSync(DIST_DIR);
              console.log(`Directory now contains ${newDistContents.length} files:`, newDistContents.join(', '));
              
              if (newDistContents.includes('index.html')) {
                console.log('Successfully found and copied build output from alternate location');
                break;
              }
            } catch (copyError) {
              console.error(`Error copying from ${dir}:`, copyError.message);
            }
          }
        }
        
        if (!foundAlternativeBuildDir) {
          throw new Error('Critical file index.html missing from build output and no alternate build location found');
        }
      }
    }
    
    console.log(`Build successful with ${distContents.length} files.`);
  } else {
    console.error('Dist directory not found after build');
    throw new Error('Build did not create dist directory');
  }
  
  // Success! The build worked and files are in place
  console.log('Bootstrap completed successfully with full build!');
  process.exit(0);
  
} catch (error) {
  console.error('===== BUILD FAILED - CREATING FALLBACK CONTENT =====');
  console.error('Error:', error.message);
  
  // Create fallback content so the site at least deploys with something
  createFallbackContent();
  
  // Exit with code 0 so Netlify deploys the fallback content
  console.log('Fallback content created. Exiting with success code to allow deployment.');
  process.exit(0);
} 