# Playable Data Blog

A modern, serverless blog platform built with Astro and Supabase, designed for gaming analytics content.

## Features

- **Serverless Architecture**: Built with Astro and deployed on Netlify
- **Content Management**: Admin dashboard for creating and managing blog posts
- **Cloud Storage**: Content stored in Supabase for scalability and reliability
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **SEO Optimized**: Built-in SEO features for better discoverability
- **Markdown Support**: Write content in Markdown with rich text editor

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