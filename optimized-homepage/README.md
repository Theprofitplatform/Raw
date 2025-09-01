# The Profit Platform Website

## Project Structure

This project follows a standard web development structure for better organization and maintainability:

```
/my-website
│
├── index.html              # Main homepage
├── about.html              # About us page  
├── contact.html            # Contact page
│
├── /css                    # Stylesheets
│   └── style.css          # Main CSS file
│
├── /js                     # JavaScript files
│   ├── main.js            # Main JavaScript functionality
│   └── sw.js              # Service Worker
│
├── /images                 # Image assets
│   ├── logo.png           # Company logo
│   └── *.png              # Other images
│
├── /fonts                  # Font files
│   └── custom-font.woff2  # Custom fonts (placeholder)
│
├── /assets                 # Additional assets
│   ├── manifest.json      # Web App Manifest
│   ├── downloads/         # Downloadable files
│   └── extra/             # Extra assets
│
├── /blog                   # Blog posts
│   ├── post-1.html        # Blog post 1
│   └── post-2.html        # Blog post 2
│
└── README.md              # This file
```

## Overview

"The Profit Platform" is a digital marketing agency website targeting the Australian market, specifically Sydney. The site features:

- Modern, responsive design
- Optimized performance with service worker caching  
- SEO-friendly structure
- Mobile-first approach
- Comprehensive testing suite

## Key Features

### Performance Optimizations
- External CSS/JS files for better caching
- Service Worker for offline functionality
- Lazy loading for images
- Critical CSS inlined for faster rendering
- Resource preloading for better UX

### Design Features
- Glassmorphism UI effects
- Smooth animations and transitions
- Responsive navigation with mobile overlay
- Progressive Web App capabilities

### SEO Features
- Structured data markup
- Open Graph and Twitter Card meta tags
- Local SEO optimization for Sydney
- Semantic HTML structure

## Development Commands

### Testing
```bash
# Run all tests
npm test

# Watch mode for development  
npm run test:watch

# Run specific test types
npm run test:visual
npm run test:performance
npm run test:accessibility
```

### Development
```bash
# Start local server
npm run serve

# Development mode (server + watch)
npm run dev

# Run Lighthouse audit
npm run lighthouse
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)

## File Organization Notes

- **HTML files**: Main pages in root directory
- **CSS**: All styles consolidated in `/css/style.css`
- **JavaScript**: Main functionality in `/js/main.js`
- **Images**: All images organized in `/images/` directory
- **Assets**: Web manifest and other assets in `/assets/`
- **Blog**: Blog posts as individual HTML files in `/blog/`

## Deployment

The site is designed as a static website and can be deployed to any web server or CDN. Ensure:

1. All file paths remain relative
2. Service Worker is served from root domain
3. HTTPS is enabled for Service Worker functionality
4. Proper MIME types configured for font files

## Performance Targets

- Lighthouse Performance Score: 85-95
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Total Page Size: ~45KB (compressed)

---

For more technical details, see the `CLAUDE.md` file in this directory.