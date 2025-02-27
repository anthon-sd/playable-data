# Astro Example Implementation

This example shows how to use the Stats Toolkit Theme in an Astro project.

## Basic Page Structure

```astro
---
// src/pages/index.astro
import BaseCalculator from '../components/BaseCalculator.astro';
import ResultsDisplay from '../components/ResultsDisplay.astro';
import AccordionSection from '../components/AccordionSection.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

// Example data
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Documentation', href: 'https://docs.example.com', external: true }
];

const results = [
  { label: 'Sample Size', value: 1250 },
  { label: 'Confidence', value: '95%' },
  { label: 'P-Value', value: 0.032 },
  { label: 'Effect Size', value: 0.45 }
];

const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' }
];
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Statistical Calculator</title>
    <link rel="stylesheet" href="/theme/stats-toolkit-theme.css" />
  </head>
  <body>
    <Header 
      title="Statistical Calculator" 
      navLinks={navLinks} 
    />

    <main class="container-custom py-8 space-y-8">
      <AccordionSection 
        title="About This Tool" 
        iconName="info" 
        id="about-section"
        defaultOpen={true}
      >
        <p>This statistical calculator helps you analyze your data and make informed decisions.</p>
        <p class="mt-4">Use the calculators below to get started with your analysis.</p>
      </AccordionSection>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BaseCalculator 
          title="Sample Size Calculator" 
          description="Calculate the required sample size for your experiment"
          iconName="calculator"
        >
          <div class="space-y-4">
            <div>
              <label class="label-base" for="baseline">Baseline Rate (%)</label>
              <input type="number" id="baseline" class="input-base" placeholder="e.g., 10" />
            </div>
            
            <div>
              <label class="label-base" for="uplift">Expected Uplift (%)</label>
              <input type="number" id="uplift" class="input-base" placeholder="e.g., 5" />
            </div>
            
            <button class="btn btn-primary w-full mt-4">Calculate</button>
          </div>
        </BaseCalculator>

        <BaseCalculator 
          title="Statistical Significance" 
          description="Determine if your results are statistically significant"
          iconName="chart"
        >
          <div class="space-y-4">
            <div>
              <label class="label-base" for="control-size">Control Group Size</label>
              <input type="number" id="control-size" class="input-base" placeholder="e.g., 1000" />
            </div>
            
            <div>
              <label class="label-base" for="control-conv">Control Conversions</label>
              <input type="number" id="control-conv" class="input-base" placeholder="e.g., 100" />
            </div>
            
            <div>
              <label class="label-base" for="test-size">Test Group Size</label>
              <input type="number" id="test-size" class="input-base" placeholder="e.g., 1000" />
            </div>
            
            <div>
              <label class="label-base" for="test-conv">Test Conversions</label>
              <input type="number" id="test-conv" class="input-base" placeholder="e.g., 120" />
            </div>
            
            <button class="btn btn-primary w-full mt-4">Calculate</button>
          </div>
        </BaseCalculator>
      </div>

      <ResultsDisplay 
        title="Calculation Results" 
        results={results}
        showDownload={true}
      />
    </main>

    <Footer 
      companyName="Your Company" 
      links={footerLinks}
    />

    <script>
      // Example client-side functionality
      document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', () => {
          // In a real app, you would calculate results here
          console.log('Calculation button clicked');
        });
      });
    </script>
  </body>
</html>
```

## Using with Astro Layouts

For better organization, you can use Astro layouts:

```astro
---
// src/layouts/MainLayout.astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

const { title } = Astro.props;

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Documentation', href: 'https://docs.example.com', external: true }
];

const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' }
];
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} - Statistical Calculator</title>
    <link rel="stylesheet" href="/theme/stats-toolkit-theme.css" />
  </head>
  <body>
    <Header 
      title="Statistical Calculator" 
      navLinks={navLinks} 
    />

    <main class="container-custom py-8 space-y-8">
      <slot />
    </main>

    <Footer 
      companyName="Your Company" 
      links={footerLinks}
    />
  </body>
</html>
```

Then in your page:

```astro
---
// src/pages/index.astro
import MainLayout from '../layouts/MainLayout.astro';
import BaseCalculator from '../components/BaseCalculator.astro';
import ResultsDisplay from '../components/ResultsDisplay.astro';
import AccordionSection from '../components/AccordionSection.astro';

// Example data
const results = [
  { label: 'Sample Size', value: 1250 },
  { label: 'Confidence', value: '95%' },
  { label: 'P-Value', value: 0.032 },
  { label: 'Effect Size', value: 0.45 }
];
---

<MainLayout title="Home">
  <AccordionSection 
    title="About This Tool" 
    iconName="info" 
    id="about-section"
    defaultOpen={true}
  >
    <p>This statistical calculator helps you analyze your data and make informed decisions.</p>
    <p class="mt-4">Use the calculators below to get started with your analysis.</p>
  </AccordionSection>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <BaseCalculator 
      title="Sample Size Calculator" 
      description="Calculate the required sample size for your experiment"
      iconName="calculator"
    >
      <!-- Calculator content -->
    </BaseCalculator>

    <BaseCalculator 
      title="Statistical Significance" 
      description="Determine if your results are statistically significant"
      iconName="chart"
    >
      <!-- Calculator content -->
    </BaseCalculator>
  </div>

  <ResultsDisplay 
    title="Calculation Results" 
    results={results}
    showDownload={true}
  />
</MainLayout>
```