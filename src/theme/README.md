# Stats Toolkit Theme for Astro

This theme file provides a comprehensive set of styles extracted from the A/B Testing Toolkit project, adapted for use with Astro projects.

## Features

- Professional color palette with primary, secondary, and accent colors
- Typography system using Poppins font
- Responsive layout utilities
- Component styles for cards, forms, buttons, and more
- Animation classes
- Utility classes for common styling needs

## Usage in Astro

### 1. Installation

Place the `stats-toolkit-theme.css` file in your Astro project, typically in a `styles` or `theme` directory.

### 2. Import in Astro

Import the theme in your Astro project by adding it to your main layout or specific pages:

```astro
---
// src/layouts/MainLayout.astro
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Astro Project</title>
    <link rel="stylesheet" href="/theme/stats-toolkit-theme.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 3. Using Components

The theme provides styles for common components. Here are examples of how to use them:

#### Card Component

```astro
<div class="card">
  <h2 class="text-xl font-bold mb-4">Card Title</h2>
  <p>Card content goes here.</p>
</div>
```

#### Button Styles

```astro
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-accent">Accent Button</button>
<button class="btn btn-outline">Outline Button</button>
```

#### Form Elements

```astro
<label class="label-base" for="name">Name</label>
<input type="text" id="name" class="input-base" />

<label class="label-base" for="options">Select Option</label>
<select id="options" class="select-base">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Accordion

```astro
<div class="accordion">
  <button class="accordion-header" id="accordion-trigger" 
          aria-expanded="false" aria-controls="accordion-content">
    <span class="text-xl font-bold">Accordion Title</span>
    <span class="accordion-icon">+</span>
  </button>
  <div id="accordion-content" class="accordion-content" 
       aria-labelledby="accordion-trigger" hidden>
    <div class="p-6">
      Accordion content goes here.
    </div>
  </div>
</div>

<script>
  // Add this script to make accordions work
  document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', !expanded);
      
      const content = document.getElementById(button.getAttribute('aria-controls'));
      content.hidden = expanded;
      
      // Toggle icon (optional)
      const icon = button.querySelector('.accordion-icon');
      if (icon) icon.textContent = expanded ? '+' : '-';
    });
  });
</script>
```

#### Results Display

```astro
<div class="results-container">
  <h3 class="text-lg font-semibold text-blue-900 mb-4">Results</h3>
  <div class="results-grid">
    <div class="result-item">
      <p class="result-label">Value 1</p>
      <p class="result-value">42</p>
    </div>
    <div class="result-item">
      <p class="result-label">Value 2</p>
      <p class="result-value">78%</p>
    </div>
  </div>
</div>
```

### 4. Layout Structure

Here's a typical layout structure using the theme:

```astro
---
// src/pages/index.astro
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout>
  <header class="header">
    <div class="container-custom">
      <div class="flex items-center justify-between py-6">
        <h1 class="text-2xl font-bold text-white">Your Project Name</h1>
        <nav class="hidden md:flex items-center gap-4">
          <a href="#" class="text-white hover:text-blue-100">Home</a>
          <a href="#" class="text-white hover:text-blue-100">About</a>
          <a href="#" class="text-white hover:text-blue-100">Contact</a>
        </nav>
      </div>
    </div>
  </header>

  <main class="container-custom py-8 space-y-8">
    <section class="card">
      <h2 class="text-xl font-bold mb-6">Section Title</h2>
      <p>Your content here...</p>
    </section>
  </main>

  <footer class="footer">
    <div class="container-custom text-center">
      <p class="text-gray-600">© 2025 Your Company. All rights reserved.</p>
    </div>
  </footer>
</MainLayout>
```

## Customization

You can customize the theme by modifying the CSS variables at the top of the file:

```css
:root {
  --primary: #004f80;
  --secondary: #7191b7;
  /* Change other variables as needed */
}
```

## Integration with Astro Components

For more complex components, you can create Astro components that use these styles:

```astro
---
// src/components/Calculator.astro
const { title, description } = Astro.props;
---

<div class="card">
  <div class="flex items-center gap-2 mb-6">
    <div class="text-primary">
      <!-- Icon can go here -->
    </div>
    <div>
      <h2 class="text-xl font-bold">{title}</h2>
      {description && <p class="text-gray-600 text-sm mt-1">{description}</p>}
    </div>
  </div>

  <div class="space-y-4">
    <slot />
  </div>
</div>
```

Then use it in your pages:

```astro
---
import Calculator from '../components/Calculator.astro';
---

<Calculator title="Sample Calculator" description="Calculate something useful">
  <!-- Calculator content -->
</Calculator>
```