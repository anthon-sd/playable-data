# Playable Data Blog

A modern, content-focused platform built with Astro, designed for gaming analytics content.

## Features

- **Static Site Generation**: Built with Astro for optimal performance
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **SEO Optimized**: Built-in SEO features for better discoverability
- **Markdown Support**: Write content in Markdown with MDX integration

## Deployment on Netlify

### Simplified Deployment

The project has been simplified for reliable deployment on Netlify:

1. **Standard Build Process**
   - Uses Astro's built-in build system
   - Generates static HTML for maximum performance
   - No complex build scripts or workarounds needed

2. **Clean Configuration**
   - Simplified `netlify.toml` with standard settings
   - Proper security headers configured
   - Sensible cache policies for static assets

### Netlify Configuration

- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`
- **Node version**: 16 or higher

## Recommended Improvements

### Migrate to a Headless CMS

For more efficient content management, consider migrating from Supabase to a headless CMS:

- **Options to Consider**:
  - **Contentful**: Powerful, well-established, great API
  - **Sanity.io**: Highly customizable, developer-friendly
  - **Strapi**: Open-source, self-hostable
  - **Prismic**: Good for structured content
  - **Netlify CMS**: Integrates directly with your Git repository

- **Benefits for Your Use Case**:
  - Purpose-built for managing written content
  - Built-in support for media management (including podcasts)
  - User-friendly editorial interfaces
  - Simplified deployment with API-based content fetching

### Fix Directory Structure

The current nested repository structure causes path resolution issues. Consider one of these approaches:

1. **Recommended**: Move all content from the `playable-data-blog` directory up one level to the `playable-data` directory, making it the root of your repository.

2. Alternatively: Ensure your Netlify site configuration is pointing to the correct base directory.

## Development

To run the project locally:

```bash
npm install
npm run dev
```

## Project Structure

```
/
├── public/            # Static assets
├── src/
│   ├── components/    # UI components
│   ├── layouts/       # Page layouts
│   ├── pages/         # Page components and routes
│   ├── styles/        # Global styles
│   └── utils/         # Utility functions
└── astro.config.mjs   # Astro configuration
```

## Required Node Version

Node 16 or higher is required for this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.