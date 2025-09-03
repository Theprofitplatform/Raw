// Enhanced Scroll Progress Bar with Smooth Animation
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        // Smooth animation with requestAnimationFrame
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        const targetWidth = scrollPercent;
        const diff = targetWidth - currentWidth;
        
        if (Math.abs(diff) > 0.1) {
            progressBar.style.width = (currentWidth + diff * 0.1) + '%';
        } else {
            progressBar.style.width = targetWidth + '%';
        }
    }
}

// Throttled scroll listener for better performance
let ticking = false;
function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateScrollProgress);
        ticking = true;
        setTimeout(() => { ticking = false; }, 16); // ~60fps
    }
}

window.addEventListener('scroll', requestTick, { passive: true });

// Floating CTA visibility
window.addEventListener('scroll', () => {
    const floatingCta = document.getElementById('floatingCta');
    if (window.scrollY > 500) {
        floatingCta.classList.add('visible');
    } else {
        floatingCta.classList.remove('visible');
    }
});

// Enhanced Animated Counters with Easing
function animateCounter(element, target, suffix = '') {
    let current = 0;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    // Easing function for smooth animation
    const easeOutCubic = (t) => {
        return 1 - Math.pow(1 - t, 3);
    };
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        current = target * easedProgress;
        
        if (target % 1 === 0) {
            element.textContent = Math.floor(current) + suffix;
        } else {
            element.textContent = current.toFixed(1) + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Enhanced Button Interactions with Hero-specific Effects
function initializeButtonEffects() {
    document.querySelectorAll('.btn').forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = this.classList.contains('btn-primary') ? 
                'translateY(-3px) scale(1.02)' : 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Initialize all enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeButtonEffects();
    
    // Initialize mobile menu if it exists
    initializeMobileMenu();
    
    // Initialize form enhancements
    initializeFormEnhancements();
    
    // Initialize scroll-based header effects
    initializeHeaderEffects();
    
    // Initialize pricing toggle
    initializePricingToggle();
});

// Enhanced Mobile Menu with Better Error Handling
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    
    console.log('Mobile Menu Elements:', { menuToggle, mobileNav, mobileNavOverlay, mobileNavClose });
    
    if (menuToggle && mobileNav) {
        // Enhanced touch feedback
        menuToggle.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        menuToggle.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        // Add click handler for debugging
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu toggle clicked');
            openMobileNav();
        });
        
        // Test if menu toggle is properly sized and positioned
        const rect = menuToggle.getBoundingClientRect();
        console.log('Menu toggle position and size:', rect);
    }
}

// Enhanced Services Dropdown Functionality
function initializeServicesDropdown() {
    const servicesDropdown = document.querySelector('.nav-dropdown');
    const servicesLink = servicesDropdown?.querySelector('a[aria-controls="services-dropdown"]');
    const dropdownMenu = document.getElementById('services-dropdown');
    
    if (servicesDropdown && servicesLink && dropdownMenu) {
        console.log('Services dropdown elements found');
        
        let hoverTimeout;
        
        // Show dropdown on hover
        servicesDropdown.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            servicesLink.setAttribute('aria-expanded', 'true');
            dropdownMenu.setAttribute('aria-hidden', 'false');
            this.classList.add('active');
        });
        
        // Hide dropdown when leaving
        servicesDropdown.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                servicesLink.setAttribute('aria-expanded', 'false');
                dropdownMenu.setAttribute('aria-hidden', 'true');
                this.classList.remove('active');
            }, 100); // Small delay to prevent flicker
        });
        
        // Keyboard navigation
        servicesLink.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isOpen = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isOpen);
                dropdownMenu.setAttribute('aria-hidden', isOpen);
                servicesDropdown.classList.toggle('active');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!servicesDropdown.contains(e.target)) {
                servicesLink.setAttribute('aria-expanded', 'false');
                dropdownMenu.setAttribute('aria-hidden', 'true');
                servicesDropdown.classList.remove('active');
            }
        });
        
        // Focus management for dropdown items
        const dropdownItems = dropdownMenu.querySelectorAll('a');
        dropdownItems.forEach((item, index) => {
            item.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextItem = dropdownItems[index + 1] || dropdownItems[0];
                    nextItem.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevItem = dropdownItems[index - 1] || dropdownItems[dropdownItems.length - 1];
                    prevItem.focus();
                } else if (e.key === 'Escape') {
                    servicesLink.focus();
                    servicesLink.setAttribute('aria-expanded', 'false');
                    dropdownMenu.setAttribute('aria-hidden', 'true');
                    servicesDropdown.classList.remove('active');
                }
            });
        });
    } else {
        console.log('Services dropdown elements not found:', { servicesDropdown, servicesLink, dropdownMenu });
    }
}

// Enhanced Mobile Navigation Functions
function openMobileNav() {
    console.log('Opening mobile nav');
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    
    if (menuToggle) menuToggle.classList.add('active');
    if (mobileNav) mobileNav.classList.add('active');
    if (mobileNavOverlay) mobileNavOverlay.classList.add('active');
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

function closeMobileNav() {
    console.log('Closing mobile nav');
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    
    if (menuToggle) menuToggle.classList.remove('active');
    if (mobileNav) mobileNav.classList.remove('active');
    if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

// Enhanced Form Experience
function initializeFormEnhancements() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Enhanced focus states
            input.addEventListener('focus', function() {
                this.closest('.form-group')?.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.closest('.form-group')?.classList.remove('focused');
                if (this.value) {
                    this.closest('.form-group')?.classList.add('filled');
                } else {
                    this.closest('.form-group')?.classList.remove('filled');
                }
            });
            
            // Real-time validation feedback
            input.addEventListener('input', function() {
                const isValid = this.checkValidity();
                const formGroup = this.closest('.form-group');
                
                if (formGroup) {
                    if (this.value && !isValid) {
                        formGroup.classList.add('error');
                        formGroup.classList.remove('success');
                    } else if (this.value && isValid) {
                        formGroup.classList.remove('error');
                        formGroup.classList.add('success');
                    } else {
                        formGroup.classList.remove('error', 'success');
                    }
                }
            });
        });
    });
}

// Enhanced Header Scroll Effects
function initializeHeaderEffects() {
    const header = document.getElementById('header');
    let lastScrollTop = 0;
    
    if (header) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove scrolled class
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show header on scroll (optional - uncomment to enable)
            /* 
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            */
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    }
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate counters
            if (entry.target.classList.contains('result-card')) {
                const numberEl = entry.target.querySelector('.result-number');
                const target = parseFloat(entry.target.dataset.result);
                
                if (target === 74) {
                    animateCounter(numberEl, target, '%');
                } else if (target === 3.2) {
                    animateCounter(numberEl, target, 'x');
                } else if (target === 41) {
                    animateCounter(numberEl, target, '-%');
                }
            }
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Interactive Process Timeline
const processSteps = document.querySelectorAll('.process-step');
const timelineProgress = document.getElementById('timelineProgress');

processSteps.forEach((step, index) => {
    step.addEventListener('click', () => {
        // Remove active class from all steps
        processSteps.forEach(s => s.classList.remove('active', 'completed'));
        
        // Add active class to clicked step
        step.classList.add('active');
        
        // Add completed class to previous steps
        for (let i = 0; i < index; i++) {
            processSteps[i].classList.add('completed');
        }
        
        // Update timeline progress
        const progressPercent = ((index + 1) / processSteps.length) * 100;
        timelineProgress.style.width = progressPercent + '%';
    });
});

// Auto-advance timeline every 3 seconds
let currentStep = 0;
setInterval(() => {
    if (currentStep < processSteps.length - 1) {
        currentStep++;
    } else {
        currentStep = 0;
    }
    
    processSteps.forEach(s => s.classList.remove('active', 'completed'));
    processSteps[currentStep].classList.add('active');
    
    for (let i = 0; i < currentStep; i++) {
        processSteps[i].classList.add('completed');
    }
    
    const progressPercent = ((currentStep + 1) / processSteps.length) * 100;
    timelineProgress.style.width = progressPercent + '%';
}, 3000);

// Enhanced FAQ functionality
let visibleFaqs = 6; // Show only first 6 FAQs initially
let allFaqs = [];
let filteredFaqs = [];

function initializeFAQs() {
    allFaqs = Array.from(document.querySelectorAll('.faq-item'));
    filteredFaqs = [...allFaqs];
    
    // Hide FAQs beyond the initial visible count
    updateFAQVisibility();
    updateSearchCount();
}

function updateFAQVisibility() {
    allFaqs.forEach((faq, index) => {
        const shouldShow = filteredFaqs.includes(faq) && index < visibleFaqs;
        faq.style.display = shouldShow ? 'block' : 'none';
        
        if (!shouldShow) {
            // Close expanded FAQs when hiding
            const question = faq.querySelector('.faq-question');
            const answer = faq.querySelector('.faq-answer');
            question.classList.remove('active');
            answer.classList.remove('active');
        }
    });

    // Update "Show More" button
    const showMoreBtn = document.getElementById('showMoreFaqs');
    const hiddenCount = filteredFaqs.length - Math.min(visibleFaqs, filteredFaqs.length);
    
    if (hiddenCount > 0) {
        showMoreBtn.style.display = 'block';
        showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> Show ${hiddenCount} More Questions`;
    } else {
        showMoreBtn.style.display = 'none';
    }
}

function updateSearchCount() {
    const countEl = document.getElementById('searchCount');
    const visibleCount = Math.min(visibleFaqs, filteredFaqs.length);
    const totalCount = allFaqs.length;
    
    if (filteredFaqs.length < totalCount) {
        countEl.textContent = `${filteredFaqs.length} of ${totalCount} questions`;
    } else {
        countEl.textContent = `${totalCount} questions`;
    }
}

// FAQ Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('faqSearch');
    
    if (!searchInput) {
        console.log('FAQ search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredFaqs = [...allFaqs];
        } else {
            filteredFaqs = allFaqs.filter(faq => {
                try {
                    const question = faq.querySelector('.faq-question')?.textContent?.toLowerCase() || '';
                    const answer = faq.querySelector('.faq-answer')?.textContent?.toLowerCase() || '';
                    return question.includes(searchTerm) || answer.includes(searchTerm);
                } catch (error) {
                    console.error('Error filtering FAQ:', error);
                    return false;
                }
            });
        }
        
        // Reset visible count when searching
        visibleFaqs = searchTerm === '' ? 6 : Math.max(6, filteredFaqs.length);
        updateFAQVisibility();
        updateSearchCount();
    });
    
    console.log('FAQ search functionality initialized');
}

// FAQ Category filtering
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.faq-filter');
    
    if (filterButtons.length === 0) {
        console.log('FAQ filter buttons not found');
        return;
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            try {
                // Update active filter
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.dataset.category;
                
                if (category === 'all') {
                    filteredFaqs = [...allFaqs];
                } else {
                    filteredFaqs = allFaqs.filter(faq => 
                        faq.dataset.category === category
                    );
                }
                
                // Reset search
                const searchInput = document.getElementById('faqSearch');
                if (searchInput) searchInput.value = '';
                
                // Show more FAQs when filtering to specific category
                visibleFaqs = category === 'all' ? 6 : Math.max(6, filteredFaqs.length);
                updateFAQVisibility();
                updateSearchCount();
            } catch (error) {
                console.error('Error filtering FAQs:', error);
            }
        });
    });
    
    console.log('FAQ filter functionality initialized');
}

// FAQ accordion functionality
function initializeAccordion() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.faq-toggle') || this.querySelector('.faq-icon');
            
            // Toggle current item
            const isActive = this.classList.contains('active');
            
            // Close other items first
            document.querySelectorAll('.faq-question').forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    otherQuestion.classList.remove('active');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    if (otherAnswer) otherAnswer.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                this.classList.remove('active');
                if (answer) answer.classList.remove('active');
            } else {
                this.classList.add('active');
                if (answer) answer.classList.add('active');
                
                // Smooth scroll to question
                setTimeout(() => {
                    this.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }, 300);
            }
        });
    });
}

// Show More functionality
function initializeShowMore() {
    const showMoreBtn = document.getElementById('showMoreFaqs');
    
    if (!showMoreBtn) {
        console.log('FAQ show more button not found');
        return;
    }
    
    showMoreBtn.addEventListener('click', function() {
        try {
            const remainingFaqs = filteredFaqs.length - visibleFaqs;
            const newlyVisible = Math.min(6, remainingFaqs);
            visibleFaqs += newlyVisible;
            
            updateFAQVisibility();
            
            // Smooth scroll to first newly visible FAQ
            const scrollIndex = visibleFaqs - newlyVisible;
            const firstNewFaq = filteredFaqs[scrollIndex];
            if (firstNewFaq) {
                setTimeout(() => {
                    firstNewFaq.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 100);
            }
        } catch (error) {
            console.error('Error showing more FAQs:', error);
        }
    });
    
    console.log('FAQ show more functionality initialized');
}

// Initialize all FAQ functionality
function initializeEnhancedFAQ() {
    console.log('Initializing FAQ functionality...');
    
    try {
        // Check if FAQ elements exist
        const faqSection = document.querySelector('.faq');
        if (!faqSection) {
            console.log('FAQ section not found, skipping initialization');
            return;
        }
        
        initializeFAQs();
        initializeSearch();
        initializeFilters();
        initializeAccordion();
        initializeShowMore();
        
        console.log('FAQ initialization completed successfully');
    } catch (error) {
        console.error('Error initializing FAQ:', error);
        // Fallback: at least initialize basic accordion
        initializeBasicAccordion();
    }
}

// Fallback basic accordion functionality
function initializeBasicAccordion() {
    console.log('Initializing basic FAQ accordion...');
    
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.faq-toggle') || this.querySelector('.faq-icon');
            const isActive = this.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-question').forEach(q => {
                if (q !== this) {
                    q.classList.remove('active');
                    const a = q.nextElementSibling;
                    if (a) a.classList.remove('active');
                    const i = q.querySelector('.faq-toggle') || q.querySelector('.faq-icon');
                    if (i) i.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ
            if (isActive) {
                this.classList.remove('active');
                if (answer) answer.classList.remove('active');
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                this.classList.add('active');
                if (answer) answer.classList.add('active');
                if (icon) icon.style.transform = 'rotate(45deg)';
            }
        });
    });
}

// Comprehensive Header and Navigation Initialization
function initializeHeader() {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    
    console.log('Header initialization - Elements found:', { 
        header: !!header, 
        menuToggle: !!menuToggle, 
        mobileNav: !!mobileNav, 
        mobileNavOverlay: !!mobileNavOverlay, 
        mobileNavClose: !!mobileNavClose 
    });

    // Enhanced header scroll effect with active navigation
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update active navigation links based on scroll position
        updateActiveNavLink();
    });

    // Smooth scrolling for navigation links
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile nav if open
                    closeMobileNav();
                }
            });
        });
    }

    // Update active navigation link
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
        const headerHeight = document.getElementById('header').offsetHeight;
        
        let activeSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                activeSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Using global mobile menu functions defined above

    // Event listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', openMobileNav);
    }

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileNav);
    }

    // Close mobile nav when clicking on links
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });

    // Close mobile nav on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMobileNav();
        }
    });

    // Prevent body scroll when mobile nav is open
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
            closeMobileNav();
        }
    });

    // Initialize enhanced navigation features
    document.addEventListener('DOMContentLoaded', () => {
        setupSmoothScrolling();
        updateActiveNavLink();
        initCTAAnimations();
        initFooterAnimations();
    });

    // Enhanced CTA Section Animations
    function initCTAAnimations() {
        const ctaStats = document.querySelectorAll('.cta-stat-number');
        
        // Animate stats when CTA section comes into view
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    ctaStats.forEach((stat, index) => {
                        setTimeout(() => {
                            stat.style.animation = 'ctaCountUp 1s ease-out forwards';
                            stat.style.transform = 'scale(1.1)';
                            setTimeout(() => {
                                stat.style.transform = 'scale(1)';
                            }, 200);
                        }, index * 200);
                    });
                }
            });
        }, { threshold: 0.5 });

        const ctaSection = document.querySelector('.cta');
        if (ctaSection) {
            ctaObserver.observe(ctaSection);
        }

        // Add hover effects to CTA buttons
        document.querySelectorAll('.cta .btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.02)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Enhanced Footer Animations
    function initFooterAnimations() {
        // Animate footer columns on scroll
        const footerColumns = document.querySelectorAll('.footer-column');
        
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'footerFadeIn 0.8s ease-out forwards';
                }
            });
        }, { threshold: 0.3 });

        footerColumns.forEach(column => {
            footerObserver.observe(column);
        });

        // Add pulse effect to social icons
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.animation = 'socialPulse 0.5s ease-out';
            });
            
            icon.addEventListener('animationend', function() {
                this.style.animation = '';
            });
        });
    }

    // Add new keyframes for animations
    const ctaStyles = `
        @keyframes ctaCountUp {
            from { opacity: 0.5; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes socialPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = ctaStyles;
    document.head.appendChild(styleSheet);

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Exit Intent Popup Functionality
function initializeExitIntent() {
    let exitPopupShown = false;
    const exitPopup = document.getElementById('exitPopup');
    const exitClose = document.getElementById('exitClose');
    const exitDecline = document.getElementById('exitDecline');

    // Show popup when mouse leaves viewport at top
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !exitPopupShown && !localStorage.getItem('exitPopupShown')) {
            showExitPopup();
        }
    });

    // Show popup after 60 seconds if not already shown
    setTimeout(() => {
        if (!exitPopupShown && !localStorage.getItem('exitPopupShown')) {
            showExitPopup();
        }
    }, 60000);

    // Show popup function
    function showExitPopup() {
        if (exitPopupShown) return;

        exitPopupShown = true;
        exitPopup.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Track that popup was shown
        localStorage.setItem('exitPopupShown', 'true');

        // Auto-hide after 30 seconds
        setTimeout(() => {
            hideExitPopup();
        }, 30000);
    }

    // Hide popup function
    function hideExitPopup() {
        exitPopup.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Close button events
    if (exitClose) {
        exitClose.addEventListener('click', hideExitPopup);
    }

    if (exitDecline) {
        exitDecline.addEventListener('click', hideExitPopup);
    }

    // Close on overlay click
    document.querySelector('.exit-popup-overlay').addEventListener('click', hideExitPopup);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && exitPopup.classList.contains('show')) {
            hideExitPopup();
        }
    });

    // Reset popup availability after 24 hours
    if (localStorage.getItem('exitPopupShown')) {
        setTimeout(() => {
            localStorage.removeItem('exitPopupShown');
        }, 24 * 60 * 60 * 1000); // 24 hours
    }
}

// Enhanced Hero Section Micro-interactions
function initializeHeroInteractions() {
    // Add smooth entrance animations for trust elements
    const trustStats = document.querySelectorAll('.trust-stat');
    const trustBadges = document.querySelectorAll('.trust-badge');
    
    // Staggered animation for trust stats
    trustStats.forEach((stat, index) => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        setTimeout(() => {
            stat.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            stat.style.opacity = '1';
            stat.style.transform = 'translateY(0)';
        }, 800 + (index * 150));
    });
    
    // Staggered animation for trust badges
    trustBadges.forEach((badge, index) => {
        badge.style.opacity = '0';
        badge.style.transform = 'scale(0.8)';
        setTimeout(() => {
            badge.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            badge.style.opacity = '1';
            badge.style.transform = 'scale(1)';
        }, 1200 + (index * 100));
    });
    
    // Enhanced CTA button interactions
    const heroButtons = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary');
    heroButtons.forEach(button => {
        // Add magnetic effect on mouse move
        button.addEventListener('mousemove', function(e) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = Math.max(rect.width, rect.height) / 2;
            const strength = Math.min(distance / maxDistance, 1);
            
            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) translateY(-2px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        // Add success feedback for primary CTA
        if (button.classList.contains('btn-hero-primary')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // Add success animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                    // Proceed with original action
                    const href = this.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }, 150);
            });
        }
    });
    
    // Add floating animation for trust stats on scroll
    let ticking = false;
    function updateTrustAnimations() {
        if (ticking || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const scrollY = window.scrollY;
        trustStats.forEach((stat, index) => {
            const offset = Math.sin(scrollY * 0.01 + index) * 2;
            stat.style.transform = `translateY(${offset}px)`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateTrustAnimations);
            ticking = true;
        }
    });
}

// Enhanced Hero Micro-interactions
function initializeHeroMicroInteractions() {
    const heroTitle = document.querySelector('.hero-title');
    const heroCTA = document.querySelectorAll('.hero-cta .btn');
    const trustStats = document.querySelectorAll('.trust-stat');
    
    // Enhanced CTA button interactions
    heroCTA.forEach((btn, index) => {
        // Add magnetic effect on mouse move
        btn.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translateY(-2px) translateX(${x * 0.08}px) translateY(${y * 0.08}px) scale(1.02)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
    
    // Trust stats hover effects with stagger
    trustStats.forEach((stat, index) => {
        stat.addEventListener('mouseenter', () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            // Create subtle scale effect for nearby elements
            trustStats.forEach((otherStat, otherIndex) => {
                if (otherIndex !== index) {
                    otherStat.style.transform = 'scale(0.98)';
                    otherStat.style.opacity = '0.8';
                }
            });
        });
        
        stat.addEventListener('mouseleave', () => {
            trustStats.forEach(otherStat => {
                otherStat.style.transform = '';
                otherStat.style.opacity = '';
            });
        });
    });
}

// Enhanced scroll-triggered animations
function initializeEnhancedAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Add sequential animation delay for grouped elements
                const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
                const index = Array.from(siblings).indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.1}s`;
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

// Parallax effect for floating shapes (only if motion is allowed)
function initializeParallaxEffects() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const shapes = document.querySelectorAll('.floating-shape');
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            const speed = 0.15 + (index * 0.05);
            const yPos = -(scrolled * speed);
            const rotation = scrolled * 0.03;
            shape.style.transform = `translate3d(0, ${yPos}px, 0) rotate(${rotation}deg)`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
}

// Initialize Pricing Toggle Functionality
function initializePricingToggle() {
    const pricingToggle = document.getElementById('pricingToggle');
    const priceElements = document.querySelectorAll('.price');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    let isAnnual = false;

    console.log('Pricing toggle elements:', { pricingToggle, priceElements: priceElements.length, toggleLabels: toggleLabels.length });

    if (pricingToggle && priceElements.length > 0) {
        pricingToggle.addEventListener('click', () => {
            isAnnual = !isAnnual;
            pricingToggle.classList.toggle('active');
            
            // Update toggle label active states
            toggleLabels.forEach((label, index) => {
                if (index === 0) { // Monthly label
                    label.classList.toggle('active', !isAnnual);
                } else { // Annual label
                    label.classList.toggle('active', isAnnual);
                }
            });
            
            // Add smooth transition effect to prices
            priceElements.forEach(priceEl => {
                priceEl.style.transition = 'opacity 0.3s ease';
                priceEl.style.opacity = '0.5';
                
                setTimeout(() => {
                    const monthlyPrice = priceEl.getAttribute('data-monthly');
                    const annualPrice = priceEl.getAttribute('data-annual');
                    
                    if (monthlyPrice && annualPrice) {
                        const price = isAnnual ? annualPrice : monthlyPrice;
                        priceEl.textContent = `$${parseInt(price).toLocaleString()}`;
                    }
                    
                    priceEl.style.opacity = '1';
                }, 150);
            });
            
            console.log('Pricing toggle:', isAnnual ? 'Annual (Save 20%)' : 'Monthly');
        });
        
        // Set initial state - Monthly should be active by default
        if (toggleLabels.length > 0) {
            toggleLabels[0].classList.add('active'); // Monthly label active by default
        }
        
        console.log('Pricing toggle initialized successfully');
    } else {
        console.log('Pricing toggle elements not found');
    }
}

// Call initialization after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Starting comprehensive initialization');
    initializeHeader();
    initializeMobileMenu(); // Ensure mobile menu is properly initialized
    initializeServicesDropdown(); // Initialize services dropdown functionality
    initializeEnhancedFAQ();
    initializeExitIntent();
    initializeHeroInteractions();
    initializeHeroMicroInteractions();
    initializeEnhancedAnimations();
    initializeParallaxEffects();
});