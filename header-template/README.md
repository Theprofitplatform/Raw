# Header Template - The Profit Platform

## Overview
This is a reusable header template extracted from The Profit Platform homepage. It provides a complete navigation solution with responsive design, mobile menu functionality, and accessibility features.

## Features

### ✅ Core Functionality
- Responsive navigation with desktop and mobile layouts
- Mobile hamburger menu with smooth animations
- Scroll progress indicator
- Header state changes on scroll
- Smooth scrolling to page sections
- Phone number click-to-call functionality

### ✅ Accessibility
- ARIA labels and roles for screen readers
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management for mobile menu
- Semantic HTML structure
- High contrast ratios

### ✅ Performance
- Optimized CSS with minimal specificity
- Efficient JavaScript with throttled scroll events
- Mobile-first responsive design
- Modern CSS features (Grid, Flexbox, CSS variables)

## File Structure

```
header-template/
├── components/
│   └── header.html           # Main HTML template
├── styles/
│   └── header.css           # Complete header styles
├── js/
│   └── header.js            # Header functionality
├── examples/
│   └── integration-example.html  # Integration demo
└── README.md                # This file
```

## Quick Start

### 1. Copy Template Files
Copy the `header-template` folder to your project directory.

### 2. Include Required Dependencies
Add FontAwesome for icons:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

### 3. Include Header Styles
```html
<link rel="stylesheet" href="header-template/styles/header.css">
```

### 4. Integration Methods

#### Method A: Server-Side Include (Recommended)
```php
<!-- PHP -->
<?php include 'header-template/components/header.html'; ?>

<!-- Apache SSI -->
<!--#include file="header-template/components/header.html" -->
```

#### Method B: JavaScript Dynamic Loading
```html
<div id="header-container"></div>

<script>
fetch('header-template/components/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;
        
        // Load header JavaScript
        const script = document.createElement('script');
        script.src = 'header-template/js/header.js';
        document.head.appendChild(script);
    });
</script>
```

#### Method C: Manual Copy-Paste
Copy the contents of `header.html` directly into your page and include the CSS/JS files.

### 5. Initialize JavaScript
```html
<script src="header-template/js/header.js"></script>
```

## Customization

### Navigation Links
Edit the navigation links in `components/header.html`:
```html
<li class="nav-item" role="none">
    <a href="/your-page" class="nav-link" role="menuitem">
        <i class="fas fa-your-icon nav-icon" aria-hidden="true"></i>
        <span>Your Page</span>
    </a>
</li>
```

### Phone Number
Update the phone number in both desktop and mobile sections:
```html
<a href="tel:+61-2-XXXX-XXXX" class="phone-number" aria-label="Call us at (02) XXXX XXXX">
    <span>(02) XXXX XXXX</span>
</a>
```

### Logo
Replace the logo image path and alt text:
```html
<img src="images/logo.png" alt="Your Company Logo" class="logo-img" width="220" height="64">
```

### Colors and Styling
Modify CSS variables in `styles/header.css`:
```css
:root {
    --primary-color: #2196F3;
    --primary-hover: #1976D2;
    --text-color: #333333;
    --header-bg: #ffffff;
    /* ... more variables */
}
```

## CSS Classes Reference

### Header Structure
- `.site-header` - Main header container
- `.container` - Content wrapper with max-width
- `.nav-links` - Desktop navigation list
- `.nav-item` - Individual nav items
- `.nav-link` - Navigation link styling

### Mobile Menu
- `.mobile-nav` - Mobile navigation container
- `.mobile-nav-overlay` - Dark overlay background
- `.menu-toggle` - Hamburger menu button
- `.mobile-nav.active` - Active state class

### States
- `.scrolled` - Applied to header when page is scrolled
- `.active` - Applied to current page navigation links

## JavaScript API

### HeaderController Class
The header functionality is wrapped in a `HeaderController` class:

```javascript
// Manual initialization
const header = new HeaderController();

// Available methods
header.openMobileMenu();
header.closeMobileMenu();
header.toggleMobileMenu();
header.updateScrollProgress();
```

### Events
The header responds to these events:
- Click events on menu toggles and navigation links
- Scroll events for progress bar and header state
- Keyboard events for accessibility
- Resize events for responsive behavior

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)

## Testing

### Manual Testing Checklist
- [ ] Desktop navigation works correctly
- [ ] Mobile menu opens/closes properly
- [ ] Scroll progress bar updates
- [ ] Header styling changes on scroll
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Phone number links are clickable
- [ ] Logo link works
- [ ] Responsive design on different screen sizes
- [ ] Accessibility with screen readers

### Automated Testing
Run the integration example:
1. Open `examples/integration-example.html` in a browser
2. Test all functionality listed in the checklist
3. Check browser console for any errors

## WordPress Integration

For WordPress with Kadence Theme:

### 1. Upload Template
Upload the `header-template` folder to your active theme directory:
```
/wp-content/themes/kadence-child/header-template/
```

### 2. Enqueue Styles and Scripts
Add to your theme's `functions.php`:
```php
function enqueue_custom_header_assets() {
    wp_enqueue_style('custom-header', get_stylesheet_directory_uri() . '/header-template/styles/header.css');
    wp_enqueue_script('custom-header', get_stylesheet_directory_uri() . '/header-template/js/header.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'enqueue_custom_header_assets');
```

### 3. Include in Template
Create a custom header template or modify existing:
```php
<?php include get_stylesheet_directory() . '/header-template/components/header.html'; ?>
```

## Performance Considerations

### CSS Optimization
- Uses CSS Grid and Flexbox for efficient layouts
- CSS variables for consistent theming
- Minimal specificity to avoid conflicts
- Mobile-first responsive design

### JavaScript Optimization
- Throttled scroll events for smooth performance
- Event delegation where appropriate
- Minimal DOM queries with caching
- Conditional loading based on element presence

## Common Issues

### Issue: Mobile menu not working
**Solution**: Ensure header.js is loaded after the HTML is inserted into the DOM.

### Issue: Icons not displaying
**Solution**: Make sure FontAwesome CSS is loaded before the header styles.

### Issue: Scroll progress not working
**Solution**: Check that the `.progress-bar` element exists in the HTML.

### Issue: Header overlapping content
**Solution**: Add `margin-top` equal to header height to your main content area.

## Support

For issues or customization help:
1. Check the integration example for reference
2. Verify all files are properly linked
3. Check browser console for JavaScript errors
4. Test on multiple browsers and devices