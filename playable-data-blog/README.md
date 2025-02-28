# Playable Data Blog

A modern, serverless blog platform built with Astro and Supabase, designed for gaming analytics content.

## Features

- **Serverless Architecture**: Built with Astro and deployed on Netlify
- **Content Management**: Admin dashboard for creating and managing blog posts
- **Cloud Storage**: Content stored in Supabase for scalability and reliability
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **SEO Optimized**: Built-in SEO features for better discoverability
- **Markdown Support**: Write content in Markdown with rich text editor

## Deployment Guide (Updated)

### Memory Optimization for Netlify Deployment

This repository includes several memory optimization techniques to ensure successful deployment on Netlify's limited memory environment.

#### Key Optimization Components

1. **Memory Monitor Script (`memory-monitor.js`)**
   - Runs before the build to check available system memory
   - Automatically adjusts build settings based on available memory
   - Creates detailed memory reports for diagnostics

2. **Ultra-Minimal Bootstrap Script (`netlify-bootstrap.cjs`)**
   - Replaces the standard build process with a memory-optimized version
   - Uses process spawning instead of direct execution for better memory control
   - Implements staged build attempts with progressively simpler approaches
   - Creates fallback content if all build approaches fail

3. **Optimized Astro Configuration**
   - Disables memory-intensive features (sourcemaps, minification)
   - Simplifies the build process for memory efficiency
   - Avoids dependency optimization to reduce memory pressure

### Repository Structure

This repository is a standalone project (not in a subdirectory). The main scripts are:
- `netlify-bootstrap.cjs` - Our custom build script for Netlify
- `memory-monitor.js` - Pre-build memory analysis
- `astro.config.mjs` - Optimized Astro configuration

### Deployment Instructions

1. **Local Testing**
   ```bash
   # Test the memory-optimized build locally
   npm run minimal-build
   
   # Test the Netlify deployment process locally
   node memory-monitor.js && node netlify-bootstrap.cjs
   ```

2. **Netlify Configuration**
   - Use Node.js 16.x for deployment
   - Set the publish directory to `dist`
   - Set the build command to `node memory-monitor.js && node netlify-bootstrap.cjs`
   - Add the following environment variables:
     - `NODE_OPTIONS`: `--max-old-space-size=2048 --no-warnings --max-http-header-size=16384`
     - `ASTRO_MEMORY_LIMIT`: `true`
     - `VITE_MEMORY_LIMIT`: `true`

### Troubleshooting

If deployment continues to fail with memory issues:

1. **Try the minimal build directly**
   - Change the Netlify build command to `npm run minimal-build`

2. **Disable non-essential integrations**
   - Temporarily comment out unused integrations in `astro.config.mjs`

3. **Check memory reports**
   - Review `memory-report.txt` from previous builds for insights

4. **Consider static export**
   - As a last resort, build locally and deploy the static output

## Development

To run the project locally:

```bash
npm install
npm run dev
```

## Required Node Version

Node 16 or higher is required for this project.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/playable-data-blog.git
cd playable-data-blog
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Deployment

The project is configured for deployment on Netlify:

1. Push your code to a GitHub repository
2. Connect the repository to Netlify
3. Set the build command to `npm run build`
4. Set the publish directory to `dist`
5. Add your environment variables in the Netlify dashboard

## Content Management

The admin dashboard is available at `/admin/` and provides the following features:

- Create, edit, and delete blog posts
- Upload and manage media files
- Synchronize content between database and storage
- Configure site settings

## Project Structure

```
/
├── public/            # Static assets
├── src/
│   ├── components/    # UI components
│   ├── content/       # Content collections (legacy)
│   ├── layouts/       # Page layouts
│   ├── pages/         # Page components and API routes
│   ├── styles/        # Global styles
│   ├── utils/         # Utility functions
│   └── db/            # Database utilities
├── supabase/
│   └── migrations/    # Database migrations
└── astro.config.mjs   # Astro configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Playable Data Content Platform

This repository contains the Astro-based content platform for Playable Data.

## Development

To run the project locally:

```bash
npm install
npm run dev
```

## Deployment on Netlify

The site is configured for deployment on Netlify with the following setup:

### Build Settings

- **Build command**: `node netlify-bootstrap.js`
- **Publish directory**: `dist`
- **Base directory**: `playable-data-blog`
- **Node version**: 18 or higher

### Important Note About Repository Structure

This project has the following repository structure:
```
playable-data/
└── playable-data-blog/  <-- This is the actual project directory
    ├── src/
    ├── public/
    ├── package.json
    └── etc...
```

For this reason, the `base` setting in `netlify.toml` is set to `playable-data-blog`. This tells Netlify that the actual project is in this subdirectory, not in the root of the repository.

### Troubleshooting Deployment Issues

If you encounter build failures on Netlify, check the following:

1. **Base Directory**: Ensure the `base` setting in `netlify.toml` matches the directory where your project is located
2. **Module Type**: Ensure `package.json` has `"type": "module"` (required for Astro)
3. **Script Permissions**: All scripts should be executable (`chmod +x *.js`)
4. **Build Command**: The build command in Netlify UI should match what's in `netlify.toml`
5. **Diagnostic Tools**: Run `node diagnose-build.js` locally to check for issues

### Fallback System

The project includes a fallback build system that creates a minimal static site if the main Astro build fails. This ensures that at least a basic site is deployed rather than having a completely failed build.

### Emergency Fix for a Failed Build

If the build is consistently failing, you can:

1. Update the build command in Netlify UI to `node fallback-build.js`
2. This will deploy a minimal placeholder site until you can resolve the underlying issues

## Project Structure

- `src/`: Source code for the Astro site
- `public/`: Static assets
- `diagnose-build.js`: Script to diagnose common build issues
- `fallback-build.js`: Emergency fallback build script
- `prepare-netlify-build.js`: Prepares the environment for Netlify builds
- `netlify-bootstrap.js`: Main bootstrap script for Netlify builds
- `netlify.toml`: Netlify configuration file

## Required Node Version

Node 18 or higher is required for this project.

## Deployment Guide

### Memory Optimization for Netlify Deployment

This repository includes several memory optimization techniques to ensure successful deployment on Netlify's limited memory environment.

#### Key Optimization Components

1. **Memory Monitor Script (`memory-monitor.js`)**
   - Runs before the build to check available system memory
   - Automatically adjusts build settings based on available memory
   - Creates detailed memory reports for diagnostics

2. **Ultra-Minimal Bootstrap Script (`netlify-bootstrap.cjs`)**
   - Replaces the standard build process with a memory-optimized version
   - Uses process spawning instead of direct execution for better memory control
   - Implements staged build attempts with progressively simpler approaches
   - Creates fallback content if all build approaches fail

3. **Optimized Astro Configuration**
   - Disables memory-intensive features (sourcemaps, minification)
   - Simplifies the build process for memory efficiency
   - Avoids dependency optimization to reduce memory pressure

### Deployment Instructions

1. **Local Testing**
   ```bash
   # Test the memory-optimized build locally
   npm run minimal-build
   
   # Test the Netlify deployment process locally
   npm run netlify
   ```

2. **Netlify Configuration**
   - Use Node.js 16.x or 18.x for deployment
   - Set the publish directory to `dist`
   - Set the build command to `npm run netlify`
   - Add the following environment variables:
     - `NODE_OPTIONS`: `--max-old-space-size=2048`
     - `ASTRO_MEMORY_LIMIT`: `true`
     - `VITE_MEMORY_LIMIT`: `true`

### Troubleshooting

If deployment continues to fail with memory issues:

1. **Try the minimal build directly**
   - Change the Netlify build command to `npm run minimal-build`

2. **Disable non-essential integrations**
   - Temporarily comment out unused integrations in `astro.config.mjs`

3. **Check memory reports**
   - Review `memory-report.txt` from previous builds for insights

4. **Consider static export**
   - As a last resort, build locally and deploy the static output