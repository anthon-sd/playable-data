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