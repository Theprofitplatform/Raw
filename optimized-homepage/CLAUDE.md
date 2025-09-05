# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"The Profit Platform" - A performance-optimized static website for a Sydney-based digital marketing agency (theprofitplatform.com.au). Pure HTML/CSS/JS implementation with no build process required.

## Architecture

- **Static Site**: No framework or build process - direct HTML/CSS/JS files
- **File Organization**: External CSS in `/css/`, JavaScript in `/js/`, assets in `/assets/`
- **Service Worker**: Aggressive caching strategy in `sw.js` (requires HTTPS in production)
- **CSS Design System**: Variables prefixed with `--pp-*`, glassmorphism effects, responsive breakpoints
- **Progressive Enhancement**: Site works without JavaScript, enhanced features when JS available

## Development Commands

### Local Development
```bash
# Start local server (required for Service Worker)
python -m http.server 3000

# Alternative servers
npx serve .
# or use VS Code Live Server extension

# Access site at http://localhost:3000/
```

### Testing
```bash
# Run Playwright tests (requires npm install first)
npx playwright test

# Run specific test file
npx playwright test test-mobile-nav-complete.js

# Debug tests with headed browser
npx playwright test --headed

# Generate HTML report
npx playwright test --reporter=html

# Manual testing approach:
# 1. Performance: Chrome DevTools > Lighthouse (targets: Performance 85-95, SEO 95+, Accessibility 90+)
# 2. Cross-browser: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
# 3. Mobile: Test at 768px breakpoint and below
```

## Key Files Structure

```
/
├── index.html              # Main homepage (single entry point)
├── sw.js                   # Service Worker (root scope required)
├── /css/
│   ├── style.css          # Main styles (104KB)
│   ├── homepage.css       # Homepage-specific styles (12KB)
│   └── critical.css       # Critical above-fold styles (2KB)
├── /js/
│   ├── main.js            # Core functionality (45KB)
│   ├── homepage.js        # Homepage interactions (15KB)
│   └── exit-intent.js     # Exit intent popup (2KB)
├── /assets/
│   └── manifest.json      # PWA manifest
├── /blog/                  # Blog post pages
├── /images/                # Image assets
└── /.claude/agents/        # SEO copywriter agent configuration
```

## Code Style & Conventions

- **HTML**: Semantic tags, accessible labels, kebab-case classes (e.g., `hero-stats`)
- **CSS**: 4-space indentation, `--pp-*` variables, component styles grouped
- **JavaScript**: ES6+, named functions, requestAnimationFrame for animations, passive event listeners
- **File Naming**: kebab-case for all files (e.g., `exit-intent.js`)
- **Commits**: Conventional format (e.g., `feat: add hero animation`, `fix: correct SW cache`)

## Service Worker Configuration

### Cache Strategy
- **Static Cache**: `profit-platform-static-v3` - Core assets (CSS, JS, manifest)
- **Dynamic Cache**: `profit-platform-dynamic-v2` - HTML pages
- **External Resources**: Cache-first for Google Fonts, CDN resources
- **Update Process**: Bump cache version numbers in `sw.js` when deploying updates

### Critical Paths in `sw.js`:
```javascript
const urlsToCache = [
    '/',
    '/css/style.css',
    '/css/homepage.css', 
    '/css/critical.css',
    '/js/main.js',
    // External dependencies
    'https://fonts.googleapis.com/...',
    'https://cdnjs.cloudflare.com/...',
];
```

## Performance Targets

- **Lighthouse Scores**: Performance 85-95, SEO 95+, Accessibility 90+
- **Core Web Vitals**: FCP <1.5s, TTI <3s, CLS <0.1
- **Page Weight**: ~45KB compressed (vs 280KB original)
- **Cache Hit Rate**: >90% for returning visitors

## SEO Agent Integration

The repository includes an SEO copywriter agent (`.claude/agents/seo-copywriter.md`) for content optimization. Use it for:
- Meta descriptions (150-160 chars)
- Title tags (50-60 chars)
- H1-H6 hierarchy optimization
- Australian market localization (Sydney-focused)
- Keyword density optimization (1-2%)

## Important Implementation Notes

1. **No Build Process**: Direct file editing, no compilation required
2. **Service Worker Scope**: Must be served from root (`/sw.js`) for proper scope
3. **HTTPS Required**: Service Worker requires HTTPS in production
4. **Mobile Navigation**: Overlay pattern with hamburger menu toggle
5. **Australian Market**: Use Australian spelling, Sydney-focused content
6. **Progressive Enhancement**: Core functionality without JS, enhanced with JS
7. **External Dependencies**: Google Fonts, Font Awesome, Animate.css via CDN

## Available Test Files

- `test-mobile-nav-complete.js` - Mobile navigation functionality
- `test-mobile-success-section.js` - Success section mobile view
- `test-trust-signals-layout.js` - Trust signals layout validation
- `test-nav-alignment.js` - Navigation alignment checks
- `test-homepage-changes.js` - Homepage change detection
- `test-combined-files.js` - Combined file integrity tests