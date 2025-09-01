# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an optimized version of "The Profit Platform" homepage - a performance-focused digital marketing agency website. This is a static HTML website with modern UI/UX enhancements, comprehensive testing suite, and significant performance optimizations over the original version.

## Architecture

- **Optimized Static HTML**: Single-page application with external CSS/JS for better caching and performance
- **Modern CSS**: Custom design system using CSS variables (--pp-* prefix) with glassmorphism effects and animations
- **Vanilla JavaScript**: Performance-optimized ES6+ with smooth animations and progressive enhancement
- **Service Worker**: Caching strategy for improved performance
- **Comprehensive Testing**: Jest + Playwright test suite covering UI, performance, accessibility, and visual regression

## Development Commands

### Testing
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Run specific test types
npm run test:visual      # Visual regression tests
npm run test:performance # Performance benchmarks
npm run test:mobile      # Mobile-specific tests
npm run test:accessibility # A11y compliance tests

# Generate test coverage
npm run test:coverage
```

### Development Server
```bash
# Start local development server on port 3000
npm run serve

# Development mode (server + watch tests)
npm run dev
```

### Performance Analysis
```bash
# Run Lighthouse audit
npm run lighthouse

# Complete validation (tests + lighthouse)
npm run validate
```

## Key Files Structure

```
optimized-homepage/
├── index.html                 # Main optimized HTML file
├── script.js                  # Main JavaScript functionality
├── styles.css                 # Complete CSS design system
├── sw.js                      # Service Worker for caching
├── manifest.json              # Web App Manifest
├── test-*.js                  # Test suite files
├── analyze-*.js               # Analysis and debugging scripts
└── quality-assessment-report.json # Performance metrics
```

## Performance Architecture

### Optimization Features
- **Critical CSS**: Above-the-fold styles inlined, rest loaded asynchronously
- **Lazy Loading**: Images and non-critical resources loaded on demand  
- **Service Worker Caching**: Aggressive caching for static assets
- **Resource Hints**: Preconnect and preload for external resources
- **Async JavaScript**: Non-blocking script loading with error handling

### Expected Metrics
- Lighthouse Performance: 85-95
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Page Size: ~45KB (vs 280KB original)

## Testing Architecture

The test suite uses **Jest + Playwright** with multiple test categories:

### Test Types
- **UI/UX Tests** (`test-enhanced-website.js`): Button interactions, glassmorphism effects, animations
- **Performance Tests** (`test-performance.js`): Load times, resource sizes, Core Web Vitals
- **Accessibility Tests** (`test-accessibility.js`): WCAG compliance, screen reader support
- **Navigation Tests** (`test-nav-*.js`): Mobile/desktop navigation, dropdowns, responsiveness
- **Visual Tests**: Screenshot comparison and regression testing

### Test Configuration
- **Jest Preset**: `jest-playwright-preset`
- **Coverage Threshold**: 80% branches/functions/lines/statements
- **Test Pattern**: `test-*.js` and `*.test.js` files
- **Setup**: `test-setup.js` configures global test environment

## Design System

### CSS Variables Architecture
```css
--pp-primary: #2c86f9;           # Primary brand color
--pp-gray-*: #f8fafc to #0f172a; # Gray scale system
--pp-radius: 16px;               # Border radius system
--pp-shadow-glass: ...;          # Glassmorphism shadows
--pp-transition: ...;            # Smooth animations
```

### Component Classes
- `.container`: Layout container with responsive behavior
- `.btn`: Enhanced button system with glassmorphism
- `.nav-dropdown`: Desktop navigation dropdowns
- `.mobile-nav`: Mobile navigation overlay system
- `.hero-*`: Hero section components with animations
- `.stats-*`: Animated counter components

## Browser Support

- Chrome 60+
- Firefox 60+ 
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)

## Important Notes

- All styles use embedded CSS with external fallback
- JavaScript is progressively enhanced - site works without JS
- Images use WebP format with fallbacks
- Mobile navigation uses overlay pattern
- All animations respect `prefers-reduced-motion`
- Service Worker requires HTTPS in production
- Website targets Australian digital marketing market (Sydney-focused)