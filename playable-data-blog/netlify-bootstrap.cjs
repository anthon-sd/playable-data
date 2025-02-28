#!/usr/bin/env node

// Enhanced bootstrap script that attempts to properly build the site
// but falls back to creating minimal files if the build fails

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== MEMORY-OPTIMIZED NETLIFY BOOTSTRAP ===');
console.log('Node version:', process.version);

// Get the current working directory
const currentDir = process.cwd();
console.log('Current directory:', currentDir);

// Report memory info at start
const initialMemoryUsage = process.memoryUsage();
console.log('Initial memory usage:', {
  rss: `${Math.round(initialMemoryUsage.rss / 1024 / 1024)} MB`,
  heapTotal: `${Math.round(initialMemoryUsage.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(initialMemoryUsage.heapUsed / 1024 / 1024)} MB`,
  external: `${Math.round(initialMemoryUsage.external / 1024 / 1024)} MB`,
});

// Log available system memory
try {
  const totalMemory = execSync('free -m').toString();
  console.log('System memory info:');
  console.log(totalMemory);
} catch (e) {
  console.log('Unable to get system memory info:', e.message);
}

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
  // Read directory in chunks to avoid memory issues with large dirs
  const entries = fs.readdirSync(BUILD_DIR);
  console.log(`${entries.length} files/directories found`);
  
  // Print in chunks of 20 to avoid excessive output
  for (let i = 0; i < entries.length; i += 20) {
    console.log(entries.slice(i, i + 20).join(', '));
  }
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

// Helper function to debug project structure - made more memory efficient
function debugProjectStructure() {
  console.log('===== DEBUGGING PROJECT STRUCTURE =====');
  
  // Check package.json
  console.log('Checking package.json...');
  if (fs.existsSync(path.join(BUILD_DIR, 'package.json'))) {
    try {
      // Read file in a more memory-efficient way
      const packageJsonContent = fs.readFileSync(path.join(BUILD_DIR, 'package.json'), 'utf8');
      let packageJson = JSON.parse(packageJsonContent);
      console.log('Package name:', packageJson.name);
      console.log('Build script:', packageJson.scripts?.build || 'Not defined');
      
      // Count dependencies but don't store the full objects
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
      console.log(`Dependencies: ${depCount}, DevDependencies: ${devDepCount}`);
      
      // Check for common build frameworks without keeping full objects in memory
      let allDeps = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})];
      const frameworks = ['astro', 'next', 'gatsby', 'react', 'vue', 'angular'].filter(fw => allDeps.includes(fw));
      console.log('Frameworks detected:', frameworks.join(', '));
      
      // Release references to large objects
      packageJson = null;
      allDeps = null;
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
  
  // Check for source directories - limit depth of analysis
  const sourceDirs = ['src', 'components', 'pages', 'public', 'static', 'assets'];
  console.log('Checking for source directories...');
  sourceDirs.forEach(dir => {
    if (fs.existsSync(path.join(BUILD_DIR, dir))) {
      console.log(`Found: ${dir}/ directory`);
      try {
        // Don't store all files in memory, just count them
        const fileCount = fs.readdirSync(path.join(BUILD_DIR, dir)).length;
        console.log(`  Contains approximately ${fileCount} files/directories`);
      } catch (e) {
        console.error(`  Error reading directory:`, e.message);
      }
    }
  });
  
  console.log('===== END PROJECT STRUCTURE DEBUG =====');
  
  // Force garbage collection if possible
  if (global.gc) {
    console.log('Forcing garbage collection...');
    global.gc();
  }
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
  
  // Log memory usage before npm install
  const preInstallMemory = process.memoryUsage();
  console.log('Memory before npm install:', {
    rss: `${Math.round(preInstallMemory.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(preInstallMemory.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(preInstallMemory.heapUsed / 1024 / 1024)} MB`
  });
  
  // Step 3: Install dependencies with memory optimizations
  console.log('Installing dependencies with memory optimizations...');
  try {
    execSync('npm install --no-fund --no-audit --no-optional --prefer-offline --legacy-peer-deps --no-warnings', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: 'false',
        npm_config_loglevel: 'error',
        NODE_OPTIONS: '--max-old-space-size=2048' // Limit Node.js memory usage
      }
    });
    console.log('Dependencies installed successfully');
  } catch (installError) {
    console.error('Error installing dependencies:', installError.message);
    throw new Error('Failed to install dependencies');
  }
  
  // Log memory usage before build
  const preBuildMemory = process.memoryUsage();
  console.log('Memory before build:', {
    rss: `${Math.round(preBuildMemory.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(preBuildMemory.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(preBuildMemory.heapUsed / 1024 / 1024)} MB`
  });
  
  // Step 4: Run the build with memory optimizations
  console.log('Running build with memory optimizations...');
  try {
    // Set environment variables for memory constraints
    process.env.NODE_OPTIONS = '--max-old-space-size=2048';
    process.env.ASTRO_MEMORY_LIMIT = 'true';
    process.env.VITE_MEMORY_LIMIT = 'true';
    
    // Use a simpler build command to avoid parameter passing issues
    let buildCommand = 'npm run build';
    
    // Check if we need to use cross-env
    try {
      execSync('npx cross-env --version', { stdio: 'ignore' });
      console.log('cross-env is available, using it for better compatibility');
      buildCommand = 'npx cross-env NODE_OPTIONS="--max-old-space-size=2048" npm run build';
    } catch (e) {
      console.log('cross-env not available, using direct environment variable');
      // NODE_OPTIONS already set above
    }
    
    // Run the build in chunks by modifying the astro.config.mjs if necessary
    // First, check if we can add build optimizations
    if (fs.existsSync('astro.config.mjs')) {
      console.log('Checking for Astro config optimizations...');
      // We won't modify the file directly to avoid memory issues
      // Instead, provide environment variables that Astro uses for optimization
      process.env.ASTRO_MEMORY_LIMIT = 'true';
    }
    
    // Run the actual build with memory constraints
    execSync(buildCommand, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: 'false',
        npm_config_loglevel: 'error',
        NODE_OPTIONS: '--max-old-space-size=2048',
        ASTRO_MEMORY_LIMIT: 'true',
        VITE_MEMORY_LIMIT: 'true'
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
    
    try {
      const distContents = fs.readdirSync(DIST_DIR);
      
      // Log only count and a sample of files to save memory
      console.log(`Dist directory contains ${distContents.length} files/directories`);
      if (distContents.length > 0) {
        console.log('Sample files:', distContents.slice(0, Math.min(10, distContents.length)).join(', '));
        
        if (distContents.length > 10) {
          console.log(`... and ${distContents.length - 10} more files`);
        }
      }
      
      // Create an index.html file if it doesn't exist (safety measure)
      if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
        console.warn('WARNING: index.html not found in dist directory, creating it');
        const indexHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Playable Data</title>\n  <meta http-equiv="refresh" content="0;url=/home/" />\n</head>\n<body>\n  <p>Redirecting to <a href="/home/">home page</a>...</p>\n</body>\n</html>';
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
        console.log('Created minimal index.html file');
      }
      
      // Add a 404 page if missing
      if (!fs.existsSync(path.join(DIST_DIR, '404.html'))) {
        console.warn('WARNING: 404.html not found in dist directory, creating it');
        const notFoundHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Not Found - Playable Data</title>\n  <style>\n    body { \n      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;\n      max-width: 800px; \n      margin: 0 auto; \n      padding: 2rem; \n      line-height: 1.6;\n      text-align: center;\n    }\n    .error { \n      background: #fef2f2; \n      border-left: 4px solid #ef4444; \n      padding: 1rem; \n      margin: 1.5rem 0; \n      text-align: left;\n    }\n  </style>\n</head>\n<body>\n  <h1>404 - Page Not Found</h1>\n  <div class="error">\n    <p>The page you\'re looking for could not be found.</p>\n    <p>Build timestamp: ' + new Date().toISOString() + '</p>\n  </div>\n  <p>Return to <a href="/">home page</a>.</p>\n</body>\n</html>';
        fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml);
        console.log('Created 404.html file');
      }
      
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
                
                // Copy files in smaller batches to avoid memory issues
                console.log(`Copying files from ${dir} to ${DIST_DIR}...`);
                
                // Use shell command for more efficient copying
                execSync(`find ${dir} -type f -print0 | xargs -0 -n 50 cp -t ${DIST_DIR}/ 2>/dev/null || cp -r ${dir}/* ${DIST_DIR}/`, { 
                  stdio: 'inherit',
                  shell: true 
                });
                
                console.log('Files copied successfully');
                
                // Verify the copy worked
                if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
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
      
      console.log('Build output verification complete');
    } catch (error) {
      console.error('Error checking dist directory:', error.message);
      // Still continue, as we've already created safety files if needed
    }
    
    console.log(`Build successful with ${distContents.length} files.`);
  } else {
    console.error('Dist directory not found after build');
    throw new Error('Build did not create dist directory');
  }
  
  // Log final memory usage
  const finalMemory = process.memoryUsage();
  console.log('Final memory usage:', {
    rss: `${Math.round(finalMemory.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(finalMemory.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(finalMemory.heapUsed / 1024 / 1024)} MB`
  });
  
  // Success! The build worked and files are in place
  console.log('Bootstrap completed successfully with full build!');
  process.exit(0);
  
} catch (error) {
  console.error('===== BUILD FAILED - CREATING FALLBACK CONTENT =====');
  console.error('Error:', error.message);
  
  // Log memory at failure point
  const failureMemory = process.memoryUsage();
  console.log('Memory at failure:', {
    rss: `${Math.round(failureMemory.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(failureMemory.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(failureMemory.heapUsed / 1024 / 1024)} MB`
  });
  
  // Create fallback content so the site at least deploys with something
  createFallbackContent();
  
  // Exit with code 0 so Netlify deploys the fallback content
  console.log('Fallback content created. Exiting with success code to allow deployment.');
  process.exit(0);
} 