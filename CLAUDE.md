# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "The Profit Platform" - a digital marketing agency website (theprofitplatform.com.au) consisting of static HTML pages with embedded CSS and JavaScript. The project is structured as a collection of standalone HTML files rather than a traditional web application framework.

## Architecture

- **Static HTML Site**: Each page is a self-contained HTML file with embedded styles and scripts
- **CSS Framework**: Custom CSS design system using CSS variables (--pp-* prefix) for consistent theming
- **Responsive Design**: Mobile-first approach with extensive mobile navigation and responsive components
- **Testing**: Playwright-based end-to-end testing for UI consistency across pages

## Key Files Structure

```
Website raw files/
├── homepage.html              # Main landing page
├── services.html              # Services overview
├── pricing.html               # Pricing page
├── contact.html               # Contact form
├── blog-template.html         # Blog post template
├── seo-landing.html           # SEO-focused landing page
├── google-ads-landing.html    # Google Ads landing page
├── profit-platform-styles.css # Main CSS file (standalone)
├── styles.css                 # Alternative/backup CSS
└── test-header-footer.js      # Playwright test suite
```

## Development Commands

### Testing
```bash
# Run header/footer consistency tests across all pages
node test-header-footer.js

# Run simplified tests
node test-header-footer-simple.js

# Install testing dependencies
npm install
```

### Local Development
- No build process required - files can be opened directly in browser
- Use live server extension or similar for local development
- Test responsive design at mobile breakpoints (768px and below)

## Design System

The site uses a custom CSS design system with:
- **Color Variables**: `--pp-primary`, `--pp-gray-*` series, etc.
- **Component Classes**: `.container`, `.nav-dropdown`, `.mobile-nav`, `.footer-stats`
- **Responsive Breakpoints**: Mobile-first design with desktop enhancements
- **Animations**: CSS transitions and hover effects throughout

## Page Architecture Pattern

Each HTML page follows this structure:
1. **Header**: Navigation with desktop/mobile variants, scroll progress bar
2. **Main Content**: Page-specific sections with consistent styling
3. **Footer**: Stats, social links, trust badges, and standard links
4. **Embedded Styles**: Complete CSS embedded in `<style>` tags
5. **Embedded Scripts**: JavaScript for interactions (mobile nav, animations)

## Testing Strategy

The Playwright test suite (`test-header-footer.js`) validates:
- Scroll progress bar presence
- Enhanced header structure consistency
- Services dropdown functionality
- Active navigation states
- Mobile navigation overlay/menu/toggle
- Footer components (stats, social, trust badges)
- Mobile navigation functionality
- Page load performance (< 5 seconds)

## Important Notes

- All styles are embedded within individual HTML files for portability
- Mobile navigation uses overlay pattern with hamburger toggle
- Each page maintains consistent header/footer structure
- Website targets Australian digital marketing market
- No server-side functionality - purely static frontend
- USE ALL AGENTS WHEN MAKING CHANGES TO THE WEBSITE