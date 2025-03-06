# Project Cleanup Recommendations

Based on the structural issues identified by the software engineer, here are recommendations to clean up the project and improve its structure.

## Files to Remove

These files were added as workarounds and are no longer needed with a simpler build approach:

```
memory-monitor.js
netlify-bootstrap.js
netlify-bootstrap.cjs
netlify-debug.js
copy-package.js
copy-to-build-dir.js
diagnose-build.js
fallback-build.js
prepare-netlify-build.js
```

## Directory Structure Improvement

The current nested directory structure (`playable-data/playable-data-blog`) is causing path resolution issues. Consider one of these approaches:

1. **Recommended**: Move all content from the `playable-data-blog` directory up one level to the `playable-data` directory, making it the root of your repository.

2. Alternatively: Ensure your Netlify site configuration is pointing to the correct base directory.

## Security Concerns to Address

While specific details weren't provided, common security issues to check include:

1. **API Keys and Secrets**: Ensure these are stored as environment variables, not in the code.
   - Check for hardcoded credentials in any files, especially those related to Supabase.
   - Move any secrets to Netlify environment variables.

2. **Content Security Policy**: Ensure proper headers are set (already added to netlify.toml).

3. **Input Validation**: If there are any forms or user inputs, ensure they're properly validated.

## Next Steps for Clean Architecture

1. **Migrate to a Headless CMS**: As discussed, replace Supabase with a headless CMS like Contentful, Sanity, or Strapi for content management.

2. **Simplify Build Process**: The build process has been updated to use standard Astro commands without the complex wrapper scripts.

3. **Remove Unnecessary Dependencies**: Review package.json for dependencies that might not be needed.

4. **Update Documentation**: Ensure README.md reflects the current project structure and setup instructions.

## Testing the New Setup

After making these changes:

1. Test locally with `npm run build` to ensure the site builds correctly.
2. Deploy to Netlify to verify the simplified configuration works in production.

These changes should result in a much more maintainable and reliable codebase. 