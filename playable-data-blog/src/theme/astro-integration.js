/**
 * Astro integration for Stats Toolkit Theme
 * 
 * This file provides an integration to easily add the Stats Toolkit Theme
 * to your Astro project.
 * 
 * Usage:
 * 
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config';
 * import statsToolkitTheme from './theme/astro-integration.js';
 * 
 * export default defineConfig({
 *   integrations: [statsToolkitTheme()]
 * });
 */

/**
 * @typedef {Object} StatsToolkitThemeOptions
 * @property {boolean} [global=true] Whether to include the theme globally
 * @property {Object} [colors] Custom color overrides
 */

/**
 * Stats Toolkit Theme integration for Astro
 * @param {StatsToolkitThemeOptions} options
 * @returns {import('astro').AstroIntegration}
 */
export default function statsToolkitTheme(options = {}) {
  const {
    global = true,
    colors = {}
  } = options;
  
  return {
    name: 'stats-toolkit-theme',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        // Add the theme to the project
        if (global) {
          // Add global CSS to the project
          updateConfig({
            vite: {
              css: {
                preprocessorOptions: {
                  scss: {
                    additionalData: `@import "./theme/stats-toolkit-theme.css";`
                  }
                }
              }
            }
          });
        }
        
        // Add a route to expose theme variables as JSON
        injectRoute({
          pattern: '/theme-variables',
          entrypoint: './theme/variables-endpoint.js'
        });
      }
    }
  };
}

/**
 * Helper function to generate CSS variables from a theme object
 * @param {Object} theme Theme object with color values
 * @returns {string} CSS variables
 */
export function generateThemeVariables(theme = {}) {
  const defaultTheme = {
    primary: '#004f80',
    'primary-light': '#7191b7',
    'primary-dark': '#0d2d52',
    secondary: '#7191b7',
    'secondary-light': '#bcc9de',
    'secondary-dark': '#5f6582',
    accent: '#4ac7e9',
    'accent-light': '#8dc8d9',
    'accent-medium': '#77d0ed',
    'accent-lighter': '#dcf1f9',
    highlight: '#ffaa0c',
    success: '#67cc34',
    error: '#e8506e',
    'dark-1': '#0d2d52',
    'dark-2': '#5f6582',
    'gray-1': '#d8d8df',
    'tint-20': '#d9dfec',
    'tint-50': '#bcc9de'
  };
  
  const mergedTheme = { ...defaultTheme, ...theme };
  
  let cssVars = ':root {\n';
  
  for (const [key, value] of Object.entries(mergedTheme)) {
    cssVars += `  --${key}: ${value};\n`;
  }
  
  cssVars += '}';
  
  return cssVars;
}