// Homepage JavaScript - Optimized and Modularized

// Header functionality
function initializeHeader() {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');

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

    // Mobile menu functions
    function openMobileNav() {
        menuToggle.classList.add('active');
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

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

// Enhanced FAQ functionality
function initializeEnhancedFAQ() {
    let allFaqs = [];
    let filteredFaqs = [];
    let visibleFaqs = 8;
    
    // Initialize FAQ data structure
    function initializeFAQs() {
        allFaqs = Array.from(document.querySelectorAll('.faq-item'));
        filteredFaqs = allFaqs;
        updateFAQVisibility();
    }

    // Search functionality
    function initializeSearch() {
        const searchInput = document.getElementById('faqSearch');
        if (!searchInput) return;

        let debounceTimer;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = this.value.toLowerCase().trim();
                
                if (searchTerm === '') {
                    filteredFaqs = allFaqs;
                } else {
                    filteredFaqs = allFaqs.filter(faq => {
                        const question = faq.querySelector('.faq-question').textContent.toLowerCase();
                        const answer = faq.querySelector('.faq-answer').textContent.toLowerCase();
                        return question.includes(searchTerm) || answer.includes(searchTerm);
                    });
                }
                
                visibleFaqs = Math.min(8, filteredFaqs.length);
                updateFAQVisibility();
                
                // Show search results count
                updateSearchResults();
            }, 300);
        });
    }

    // Filter functionality
    function initializeFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                
                if (filter === 'all') {
                    filteredFaqs = allFaqs;
                } else {
                    filteredFaqs = allFaqs.filter(faq => faq.dataset.category === filter);
                }
                
                visibleFaqs = Math.min(8, filteredFaqs.length);
                updateFAQVisibility();
                updateSearchResults();
            });
        });
    }

    // Update FAQ visibility and show more button
    function updateFAQVisibility() {
        // Hide all FAQs first
        allFaqs.forEach(faq => {
            faq.style.display = 'none';
            faq.classList.remove('animate-in');
        });
        
        // Show filtered and visible FAQs
        filteredFaqs.slice(0, visibleFaqs).forEach((faq, index) => {
            faq.style.display = 'block';
            setTimeout(() => {
                faq.classList.add('animate-in');
            }, index * 100);
        });
        
        // Update show more button
        const showMoreBtn = document.getElementById('showMoreFaqs');
        if (showMoreBtn) {
            if (visibleFaqs < filteredFaqs.length) {
                showMoreBtn.style.display = 'inline-flex';
                showMoreBtn.textContent = `Show ${Math.min(6, filteredFaqs.length - visibleFaqs)} More FAQs`;
            } else {
                showMoreBtn.style.display = 'none';
            }
        }
    }

    // Update search results counter
    function updateSearchResults() {
        const resultsCounter = document.getElementById('faqResultsCounter');
        if (resultsCounter) {
            const count = filteredFaqs.length;
            if (count === allFaqs.length) {
                resultsCounter.textContent = '';
            } else {
                resultsCounter.textContent = `Showing ${count} result${count !== 1 ? 's' : ''}`;
            }
        }
    }

    // FAQ accordion functionality
    function initializeAccordion() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                const icon = this.querySelector('.faq-icon');
                
                // Toggle current item
                const isActive = this.classList.contains('active');
                
                // Close other items first
                document.querySelectorAll('.faq-question').forEach(otherQuestion => {
                    if (otherQuestion !== this) {
                        otherQuestion.classList.remove('active');
                        otherQuestion.nextElementSibling.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    this.classList.remove('active');
                    answer.classList.remove('active');
                } else {
                    this.classList.add('active');
                    answer.classList.add('active');
                    
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
        
        showMoreBtn.addEventListener('click', function() {
            const remainingFaqs = filteredFaqs.length - visibleFaqs;
            visibleFaqs += Math.min(6, remainingFaqs); // Show 6 more or all remaining
            
            updateFAQVisibility();
            
            // Smooth scroll to first newly visible FAQ
            const firstNewFaq = filteredFaqs[visibleFaqs - Math.min(6, remainingFaqs)];
            if (firstNewFaq) {
                setTimeout(() => {
                    firstNewFaq.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 100);
            }
        });
    }

    // Initialize all FAQ functionality
    initializeFAQs();
    initializeSearch();
    initializeFilters();
    initializeAccordion();
    initializeShowMore();
}

// Scroll progress bar
function initializeScrollProgress() {
    const progressBar = document.querySelector('.progress-bar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;
        
        if (progressBar) {
            progressBar.style.width = scrollProgress + '%';
        }
    });
}

// Initialize all homepage functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
    initializeEnhancedFAQ();
    initializeScrollProgress();
});

// Performance optimization - Lazy load non-critical features
window.addEventListener('load', function() {
    // Lazy load exit intent after page load
    import('./exit-intent.js').then(module => {
        module.initializeExitIntent();
    }).catch(error => {
        console.warn('Exit intent module failed to load:', error);
    });
});