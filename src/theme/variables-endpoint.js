/**
 * Endpoint to expose theme variables as JSON
 * This file is used by the Astro integration to create a route
 * that returns the theme variables as JSON
 */

export function get() {
  return {
    body: JSON.stringify({
      colors: {
        primary: '#004f80',
        primaryLight: '#7191b7',
        primaryDark: '#0d2d52',
        secondary: '#7191b7',
        secondaryLight: '#bcc9de',
        secondaryDark: '#5f6582',
        accent: '#4ac7e9',
        accentLight: '#8dc8d9',
        accentMedium: '#77d0ed',
        accentLighter: '#dcf1f9',
        highlight: '#ffaa0c',
        success: '#67cc34',
        error: '#e8506e',
        dark1: '#0d2d52',
        dark2: '#5f6582',
        gray1: '#d8d8df',
        tint20: '#d9dfec',
        tint50: '#bcc9de'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      },
      radius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      transitions: {
        fast: '150ms ease-in-out',
        normal: '250ms ease-in-out',
        slow: '350ms ease-in-out'
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}