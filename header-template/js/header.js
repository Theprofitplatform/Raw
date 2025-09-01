/**
 * Header Template JavaScript
 * The Profit Platform - Header Component Functionality
 */

class HeaderController {
    constructor() {
        this.header = document.getElementById('header');
        this.menuToggle = document.getElementById('menuToggle');
        this.mobileNav = document.getElementById('mobileNav');
        this.mobileNavOverlay = document.getElementById('mobileNavOverlay');
        this.mobileNavClose = document.getElementById('mobileNavClose');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
        this.scrollProgress = document.querySelector('.progress-bar');
        
        this.isMenuOpen = false;
        this.scrollThreshold = 100;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateScrollProgress();
        this.highlightActiveNav();
    }

    bindEvents() {
        // Mobile menu toggle
        this.menuToggle?.addEventListener('click', () => this.toggleMobileMenu());
        this.mobileNavClose?.addEventListener('click', () => this.closeMobileMenu());
        this.mobileNavOverlay?.addEventListener('click', () => this.closeMobileMenu());

        // Scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.updateScrollProgress();
            this.updateHeaderState();
        }, 16));

        // Navigation clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        this.mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleMobileNavClick(e));
        });

        // Keyboard navigation
        this.menuToggle?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        });

        // ESC key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Resize event to close mobile menu on desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.mobileNav?.classList.add('active');
        this.mobileNavOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update ARIA attributes
        this.menuToggle?.setAttribute('aria-expanded', 'true');
        this.mobileNav?.setAttribute('aria-hidden', 'false');
        this.mobileNavOverlay?.setAttribute('aria-hidden', 'false');
        
        // Focus management
        setTimeout(() => {
            const firstLink = this.mobileNav?.querySelector('.mobile-nav-links a');
            firstLink?.focus();
        }, 100);
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileNav?.classList.remove('active');
        this.mobileNavOverlay?.classList.remove('active');
        document.body.style.overflow = '';
        
        // Update ARIA attributes
        this.menuToggle?.setAttribute('aria-expanded', 'false');
        this.mobileNav?.setAttribute('aria-hidden', 'true');
        this.mobileNavOverlay?.setAttribute('aria-hidden', 'true');
        
        // Return focus to menu toggle
        this.menuToggle?.focus();
    }

    handleNavClick(e) {
        const href = e.currentTarget.getAttribute('href');
        
        // Handle internal links with smooth scrolling
        if (href && href.startsWith('#')) {
            e.preventDefault();
            this.smoothScrollToSection(href);
        }
        
        // Update active state
        this.updateActiveNavItem(e.currentTarget);
    }

    handleMobileNavClick(e) {
        const href = e.currentTarget.getAttribute('href');
        
        // Close mobile menu
        this.closeMobileMenu();
        
        // Handle internal links with smooth scrolling
        if (href && href.startsWith('#')) {
            e.preventDefault();
            this.smoothScrollToSection(href);
        }
    }

    smoothScrollToSection(href) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = this.header?.offsetHeight || 80;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateActiveNavItem(clickedLink) {
        // Remove active class from all nav links
        this.navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        clickedLink.classList.add('active');
    }

    highlightActiveNav() {
        const currentPath = window.location.pathname;
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                link.classList.add('active');
            }
        });
    }

    updateScrollProgress() {
        if (!this.scrollProgress) return;
        
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        this.scrollProgress.style.width = `${Math.min(scrollPercent, 100)}%`;
    }

    updateHeaderState() {
        if (!this.header) return;
        
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > this.scrollThreshold) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }

    // Utility: Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if header elements exist
    if (document.getElementById('header')) {
        window.headerController = new HeaderController();
    }
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderController;
}