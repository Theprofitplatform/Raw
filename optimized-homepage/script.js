// Enhanced Premium Navigation JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize premium navigation effects
    initializePremiumNavigation();
    initializeMobileNavigation();
    initializeScrollEffects();
    initializeContactForm();
    initializeFAQ();
    initializeAnimations();
});

// Premium Navigation Initialization
function initializePremiumNavigation() {
    const nav = document.getElementById('header');
    const dropdownTriggers = document.querySelectorAll('.premium-dropdown .nav-item');
    const progressIndicator = document.querySelector('.progress-indicator');
    
    // Dropdown hover effects
    dropdownTriggers.forEach(trigger => {
        const dropdown = trigger.closest('.premium-dropdown');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        let hoverTimer;
        
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            menu.style.display = 'block';
            setTimeout(() => {
                menu.classList.add('show');
                trigger.setAttribute('aria-expanded', 'true');
            }, 10);
        });
        
        dropdown.addEventListener('mouseleave', () => {
            hoverTimer = setTimeout(() => {
                menu.classList.remove('show');
                trigger.setAttribute('aria-expanded', 'false');
                setTimeout(() => {
                    menu.style.display = 'none';
                }, 300);
            }, 100);
        });
    });
    
    // Progress indicator and scroll effects
    function updateProgressAndNavigation() {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / documentHeight) * 100;
        
        // Update progress indicator
        if (progressIndicator) {
            progressIndicator.style.width = Math.min(scrollPercent, 100) + '%';
        }
        
        // Add scrolled class for transparency effects
        if (scrollTop > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    
    // Throttled scroll listener for performance
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateProgressAndNavigation);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', () => {
        requestTick();
        ticking = false;
    });
    
    // Initial call
    updateProgressAndNavigation();
}

// Mobile Navigation
function initializeMobileNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    
    if (!menuToggle || !mobileNav) return;
    
    function openMobileNav() {
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
        document.body.classList.add('mobile-nav-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        mobileNav.setAttribute('aria-hidden', 'false');
    }
    
    function closeMobileNav() {
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('mobile-nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
    }
    
    menuToggle.addEventListener('click', openMobileNav);
    mobileNavClose?.addEventListener('click', closeMobileNav);
    mobileNavOverlay?.addEventListener('click', closeMobileNav);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMobileNav();
        }
    });
}

// Scroll-based animations and effects
function initializeScrollEffects() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Handle counter animations
                if (entry.target.hasAttribute('data-result')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe all animation elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Floating stats animation
    document.querySelectorAll('.floating-stats').forEach(stat => {
        observer.observe(stat);
    });
}

// Counter animation for statistics
function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-result'));
    const counter = element.querySelector('.result-number');
    
    if (!counter || isNaN(target)) return;
    
    let current = 0;
    const increment = target / 60; // 60 frames for smooth animation
    const isNegative = target < 0;
    const suffix = counter.textContent.replace(/[\d.-]/g, '');
    
    const timer = setInterval(() => {
        current += increment;
        
        if ((isNegative && current <= target) || (!isNegative && current >= target)) {
            current = target;
            clearInterval(timer);
        }
        
        let displayValue = isNegative ? 
            Math.floor(current).toString() : 
            Math.ceil(current).toString();
            
        counter.textContent = displayValue + suffix;
    }, 16); // ~60fps
}

// Contact form handling
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const errorElement = document.getElementById(`${field.name}-error`);
            
            if (!field.value.trim()) {
                isValid = false;
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                }
                field.setAttribute('aria-invalid', 'true');
            } else {
                if (errorElement) {
                    errorElement.textContent = '';
                }
                field.setAttribute('aria-invalid', 'false');
            }
        });
        
        // Email validation
        const emailField = form.querySelector('#email');
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailField.value && !emailRegex.test(emailField.value)) {
            isValid = false;
            if (emailError) {
                emailError.textContent = 'Please enter a valid email address';
            }
            emailField.setAttribute('aria-invalid', 'true');
        }
        
        if (isValid) {
            // In a real implementation, you would send the form data to a server
            const formStatus = document.getElementById('formStatus');
            if (formStatus) {
                formStatus.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        Thanks! We'll be in touch within 24 hours with your free marketing audit.
                    </div>
                `;
            }
            
            // Reset form
            form.reset();
        }
    });
}

// FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSearch = document.getElementById('faqSearch');
    const faqFilters = document.querySelectorAll('.faq-filter');
    const showMoreBtn = document.getElementById('showMoreFaqs');
    
    // FAQ accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            
            if (isOpen) {
                answer.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
                question.setAttribute('aria-expanded', 'false');
            } else {
                answer.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
    
    // FAQ search
    if (faqSearch) {
        faqSearch.addEventListener('input', filterFAQs);
    }
    
    // FAQ filters
    faqFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            faqFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            filterFAQs();
        });
    });
    
    function filterFAQs() {
        const searchTerm = faqSearch?.value.toLowerCase() || '';
        const activeFilter = document.querySelector('.faq-filter.active')?.getAttribute('data-category') || 'all';
        let visibleCount = 0;
        
        faqItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const text = item.textContent.toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || category === activeFilter;
            
            if (matchesSearch && matchesFilter) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update search count
        const searchCount = document.getElementById('searchCount');
        if (searchCount) {
            searchCount.textContent = `${visibleCount} question${visibleCount !== 1 ? 's' : ''}`;
        }
    }
}

// General animations and effects
function initializeAnimations() {
    // Pricing toggle
    const pricingToggle = document.getElementById('pricingToggle');
    if (pricingToggle) {
        pricingToggle.addEventListener('click', () => {
            pricingToggle.classList.toggle('annual');
            // Update pricing display logic would go here
        });
    }
    
    // Exit intent popup
    let exitIntentShown = false;
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !exitIntentShown) {
            exitIntentShown = true;
            const exitPopup = document.getElementById('exitPopup');
            if (exitPopup) {
                exitPopup.classList.add('show');
            }
        }
    });
    
    // Close exit popup
    const exitClose = document.getElementById('exitClose');
    const exitDecline = document.getElementById('exitDecline');
    const exitPopup = document.getElementById('exitPopup');
    
    [exitClose, exitDecline].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (exitPopup) {
                    exitPopup.classList.remove('show');
                }
            });
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Performance optimization: Preload critical resources
function preloadCriticalResources() {
    // Preload critical images that might be needed
    const criticalImages = [
        'images/logo.png',
        // Add other critical images here
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Initialize preloading
preloadCriticalResources();

