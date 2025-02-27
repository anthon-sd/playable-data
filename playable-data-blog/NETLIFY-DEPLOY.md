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

If you see an error about Ruby version syntax, this is due to Netlify incorrectly detecting the project as a Ruby application instead of a Node.js application.

#### Steps to Fix:

We've addressed this by:
1. Explicitly telling Netlify this is a Node.js project in the netlify.toml file
2. Adding runtime specification files: `.nvmrc`, `.ruby-version`, and `runtime.txt`
3. Setting `NETLIFY_EXPERIMENTAL_BUILD_NODEJS_ONLY = "true"` in the environment configuration

If you continue seeing Ruby-related errors, check if there are any Ruby configuration files (like `Gemfile` or `.ruby-version` with syntax errors) in your repository and remove them.

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