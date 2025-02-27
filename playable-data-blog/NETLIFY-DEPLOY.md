# Netlify Deployment Instructions

## Critical Settings in Netlify UI

When setting up this project in Netlify, ensure these UI settings match exactly:

1. **Base directory**: `playable-data-blog`
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`

## Why This Matters

Netlify prioritizes UI settings over what's in the `netlify.toml` file. If there's a mismatch, the build will fail.

## Troubleshooting Build Failures

### Package.json Not Found

If you see the error: `npm error enoent Could not read package.json`, this means Netlify can't find the package.json file. The most common cause is that the base directory is not correctly set.

#### Steps to Fix:

1. Go to your Netlify site settings
2. Navigate to Build & deploy → Continuous Deployment → Build settings
3. Verify the base directory is set to `playable-data-blog`
4. Save your changes and trigger a new deploy

### Ruby Version Error

If you see an error about Ruby version syntax or installation, this is related to how Netlify handles Ruby in the build environment.

#### Steps to Fix:

We've addressed this by:
1. Specifying a valid Ruby version (2.7.2) in the netlify.toml file
2. Adding a `.ruby-version` file with the same valid version
3. Setting `NETLIFY_EXPERIMENTAL_BUILD_NODEJS_ONLY = "true"` in the environment configuration to prioritize Node.js

If you continue seeing Ruby-related errors, check if there are any Ruby configuration files (like `Gemfile`) in your repository and remove them.

### Python and Node.js Version Mismatch

If you encounter errors related to Python and Node.js version mismatches, this is due to Netlify trying to use both Python and Node.js in the build process.

#### Steps to Fix:

We've addressed this by:
1. Setting an explicit Python version (3.8.0) in the netlify.toml file
2. Creating a `.python-version` file with a specific version (3.8.0)
3. Adding an empty `requirements.txt` file to indicate no Python dependencies
4. Explicitly setting Node.js version in multiple places (18.18.0)
5. Updating the bootstrap script to set compatible environment variables

If you continue to see Python-related errors, consider:
1. Checking if any of your dependencies require specific Python versions
2. Removing any Python-related files from your repository
3. Contacting Netlify support if you believe this is a platform issue

### Python Version Format Error

If you see an error like `definition not found: python-3.8.0` during Python installation, this means there's an issue with the Python version format in the runtime files.

#### Steps to Fix:

This has been addressed by:
1. Ensuring `runtime.txt` contains just the version number (`3.8.0`) without any prefix
2. Setting `PYTHON_VERSION = "3.8"` in netlify.toml (using major.minor format)
3. Adding `MISE_PYTHON_DISABLE_AUTO = "true"` to prevent automatic version resolution
4. Updating the bootstrap script to create all version files with the correct formats

Netlify's version manager (mise) expects Python versions in a specific format. Using just the version number without prefixes works best.

### NPM Warnings Breaking Builds

If you see errors related to npm warnings like "npm warn deprecated [package]" causing your build to fail, this is because Netlify's build environment is treating warnings as errors.

#### Steps to Fix:

We've addressed this by:
1. Setting `CI = "false"` in the netlify.toml environment variables
2. Adding `--no-warnings` flag to npm commands in the build process
3. Setting `npm_config_loglevel = "error"` to only show errors, not warnings
4. Modifying the bootstrap script to use these same flags for all npm operations

These changes ensure that npm warnings (like deprecated package notices) don't cause the build to fail.

If you're getting a specific package deprecation warning, you may want to update the dependency tree, but this approach allows the build to complete in the meantime.

### ES Module vs CommonJS Error

If you see an error like "ReferenceError: require is not defined in ES module scope", this indicates a conflict between ES modules and CommonJS in the build environment.

#### Steps to Fix:

We've addressed this by:
1. Creating a CommonJS wrapper script (`netlify-bootstrap.cjs`) that dynamically creates and runs an ES module version
2. Using the `.cjs` extension to force Node.js to treat it as CommonJS
3. Ensuring all imports in the dynamically generated ES module use ES module syntax
4. Updating the build command in `netlify.toml` to use the wrapper script

This approach works because:
- The wrapper script uses CommonJS syntax (`require()`) which is compatible with scripts run directly
- It creates a temporary ES module script that uses proper ES module syntax (`import`)
- The wrapper script executes the ES module script and handles any errors

## How Our Setup Works

Our solution works by:

1. Setting the correct base directory so Netlify knows where your project lives
2. Using the `package.json` build script to run our bootstrap script
3. The bootstrap script ensures all necessary files are in the right places
4. If the main build fails, a fallback site is generated
5. Multiple configuration files ensure Netlify correctly identifies this as a Node.js project
6. Explicit version files for Node.js, Ruby, and Python prevent environment detection issues
7. Proper format for each version specification prevents cross-language confusion

Remember: Any changes to build settings should be made in both the Netlify UI and the `netlify.toml` file to avoid confusion. 