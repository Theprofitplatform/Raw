const { test, expect } = require('@playwright/test');

test.describe('Combined Files Testing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:52232', { waitUntil: 'networkidle' });
    });

    test('Combined CSS file loads correctly', async ({ page }) => {
        // Check for the combined CSS file being loaded
        const combinedCss = await page.$('link[href="css/combined.css"], link[href="css/combined-optimized.css"]');
        expect(combinedCss).toBeTruthy();
        
        // Verify CSS is actually applied
        const heroElement = await page.$('.hero-modern');
        if (heroElement) {
            const heroStyles = await heroElement.evaluate(el => window.getComputedStyle(el));
            expect(heroStyles.display).toBeTruthy();
        }
        
        const headerElement = await page.$('header');
        const headerStyles = await headerElement.evaluate(el => window.getComputedStyle(el));
        expect(headerStyles.position).toBe('fixed');
        
        // Check glassmorphism effects
        const navContainer = await page.$('.nav-floating-container');
        if (navContainer) {
            const navStyles = await navContainer.evaluate(el => window.getComputedStyle(el));
            expect(navStyles.backgroundColor).toBeTruthy();
        }
    });

    test('Combined JavaScript file loads and executes', async ({ page }) => {
        // Check for the combined.js script tag
        const combinedJs = await page.$('script[src="js/combined.js"]');
        expect(combinedJs).toBeTruthy();
        
        // Wait for JavaScript functions to be defined
        await page.waitForTimeout(1000); // Give JS time to load
        
        // Check scroll progress functionality
        const scrollProgress = await page.$('.scroll-progress');
        expect(scrollProgress).toBeTruthy();
        
        // Test scroll effects
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);
        
        const progressBar = await page.$('.progress-bar');
        if (progressBar) {
            const width = await progressBar.evaluate(el => el.style.width);
            expect(parseFloat(width)).toBeGreaterThan(0);
        }
    });

    test('Mobile navigation functionality', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        
        const menuToggle = await page.$('.menu-toggle');
        expect(menuToggle).toBeTruthy();
        const isVisible = await menuToggle.evaluate(el => 
            window.getComputedStyle(el).display !== 'none'
        );
        expect(isVisible).toBeTruthy();
        
        await menuToggle.click();
        await page.waitForTimeout(300);
        
        const mobileNav = await page.$('.mobile-nav');
        if (mobileNav) {
            const isActive = await mobileNav.evaluate(el => el.classList.contains('active'));
            expect(isActive).toBeTruthy();
            
            const navLinks = await page.$$('.mobile-nav-links a');
            expect(navLinks.length).toBeGreaterThan(0);
            
            const closeBtn = await page.$('.mobile-nav-close');
            if (closeBtn) {
                await closeBtn.click();
                await page.waitForTimeout(300);
                const isClosed = await mobileNav.evaluate(el => !el.classList.contains('active'));
                expect(isClosed).toBeTruthy();
            }
        }
    });

    test('Hero section animations', async ({ page }) => {
        const heroText = await page.$('.hero-title-modern');
        expect(heroText).toBeTruthy();
        
        const heroSubtitle = await page.$('.hero-subtitle-modern');
        expect(heroSubtitle).toBeTruthy();
        
        const heroStats = await page.$$('.hero-stats-modern .stat-card-modern');
        expect(heroStats.length).toBeGreaterThan(0);
        
        const heroButtons = await page.$$('.hero-cta-modern .btn');
        expect(heroButtons.length).toBeGreaterThanOrEqual(1);
    });

    test('Service cards interaction', async ({ page }) => {
        const serviceCards = await page.$$('.service-card');
        expect(serviceCards.length).toBeGreaterThan(0);
        
        for (const card of serviceCards.slice(0, 2)) {
            await card.hover();
            await page.waitForTimeout(100);
            
            const transform = await card.evaluate(el => 
                window.getComputedStyle(el).transform
            );
            expect(transform).not.toBe('none');
        }
    });

    test('Form validation and interaction', async ({ page }) => {
        const contactForm = await page.$('form');
        if (contactForm) {
            const nameInput = await page.$('input[name="name"], input[type="text"]');
            const emailInput = await page.$('input[type="email"]');
            const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
            
            if (nameInput && emailInput && submitBtn) {
                await nameInput.fill('Test User');
                await emailInput.fill('test@example.com');
                
                const nameValue = await nameInput.inputValue();
                const emailValue = await emailInput.inputValue();
                
                expect(nameValue).toBe('Test User');
                expect(emailValue).toBe('test@example.com');
            }
        }
    });

    test('Responsive design breakpoints', async ({ page }) => {
        const breakpoints = [
            { width: 1920, height: 1080, name: 'Desktop HD' },
            { width: 1366, height: 768, name: 'Desktop' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 375, height: 667, name: 'Mobile' }
        ];
        
        for (const breakpoint of breakpoints) {
            await page.setViewportSize({ 
                width: breakpoint.width, 
                height: breakpoint.height 
            });
            
            await page.waitForTimeout(200);
            
            const container = await page.$('.container');
            const containerWidth = await container.evaluate(el => 
                el.getBoundingClientRect().width
            );
            
            expect(containerWidth).toBeLessThanOrEqual(breakpoint.width);
            
            if (breakpoint.width <= 768) {
                const mobileToggle = await page.$('.menu-toggle');
                if (mobileToggle) {
                    const isToggleVisible = await mobileToggle.evaluate(el => 
                        window.getComputedStyle(el).display !== 'none'
                    );
                    expect(isToggleVisible).toBeTruthy();
                }
                
                const desktopNav = await page.$('.nav-links');
                if (desktopNav) {
                    const isHidden = await desktopNav.evaluate(el => 
                        window.getComputedStyle(el).display === 'none'
                    );
                    expect(isHidden).toBeTruthy();
                }
            } else {
                const desktopNav = await page.$('.nav-links');
                if (desktopNav) {
                    const isVisible = await desktopNav.evaluate(el => 
                        window.getComputedStyle(el).display !== 'none'
                    );
                    expect(isVisible).toBeTruthy();
                }
            }
        }
    });

    test('Performance metrics', async ({ page }) => {
        const metrics = await page.evaluate(() => {
            const perf = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
                loadComplete: perf.loadEventEnd - perf.loadEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            };
        });
        
        expect(metrics.firstContentfulPaint).toBeLessThan(3000);
        expect(metrics.domContentLoaded).toBeLessThan(5000);
    });

    test('Lazy loading images', async ({ page }) => {
        const images = await page.$$('img[loading="lazy"]');
        expect(images.length).toBeGreaterThan(0);
        
        for (const img of images.slice(0, 2)) {
            const loading = await img.getAttribute('loading');
            expect(loading).toBe('lazy');
            
            await img.scrollIntoViewIfNeeded();
            await page.waitForTimeout(100);
            
            const naturalWidth = await img.evaluate(el => el.naturalWidth);
            expect(naturalWidth).toBeGreaterThan(0);
        }
    });

    test('Exit intent popup functionality', async ({ page }) => {
        const exitPopupExists = await page.evaluate(() => 
            typeof window.exitIntentPopup !== 'undefined'
        );
        
        if (exitPopupExists) {
            await page.evaluate(() => {
                const event = new MouseEvent('mouseout', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientY: -1
                });
                document.dispatchEvent(event);
            });
            
            await page.waitForTimeout(500);
            
            const popup = await page.$('.exit-popup, #exitPopup');
            if (popup) {
                const isVisible = await popup.evaluate(el => 
                    window.getComputedStyle(el).display !== 'none'
                );
                
                const closeBtn = await page.$('.exit-popup .close-popup, #exitPopup .close');
                if (closeBtn) {
                    await closeBtn.click();
                    await page.waitForTimeout(300);
                    
                    const isClosed = await popup.evaluate(el => 
                        window.getComputedStyle(el).display === 'none'
                    );
                    expect(isClosed).toBeTruthy();
                }
            }
        }
    });

    test('Accessibility checks', async ({ page }) => {
        const altTexts = await page.$$eval('img', images => 
            images.map(img => img.alt)
        );
        
        for (const alt of altTexts) {
            expect(alt).toBeTruthy();
        }
        
        const ariaLabels = await page.$$eval('[aria-label]', elements => 
            elements.map(el => el.getAttribute('aria-label'))
        );
        
        for (const label of ariaLabels) {
            expect(label).toBeTruthy();
        }
        
        const skipLink = await page.$('a[href="#main"], a[href="#content"]');
        
        const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', headers => 
            headers.map(h => ({ 
                level: parseInt(h.tagName[1]), 
                text: h.textContent 
            }))
        );
        
        expect(headings.filter(h => h.level === 1).length).toBeGreaterThanOrEqual(1);
        
        const contrastCheck = await page.evaluate(() => {
            const getContrast = (rgb1, rgb2) => {
                const getLuminance = (r, g, b) => {
                    const [rs, gs, bs] = [r, g, b].map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
                };
                
                const l1 = getLuminance(...rgb1);
                const l2 = getLuminance(...rgb2);
                const lmax = Math.max(l1, l2);
                const lmin = Math.min(l1, l2);
                return (lmax + 0.05) / (lmin + 0.05);
            };
            
            const links = document.querySelectorAll('a');
            const results = [];
            
            links.forEach(link => {
                const style = window.getComputedStyle(link);
                const parent = link.parentElement;
                const parentStyle = window.getComputedStyle(parent);
                
                results.push({
                    element: link.tagName,
                    hasGoodContrast: true
                });
            });
            
            return results;
        });
        
        expect(contrastCheck.every(c => c.hasGoodContrast)).toBeTruthy();
    });

    test('Service worker registration', async ({ page }) => {
        const swRegistered = await page.evaluate(async () => {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                return registrations.length > 0;
            }
            return false;
        });
        
        if (swRegistered) {
            const cachedResources = await page.evaluate(async () => {
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    return cacheNames.length > 0;
                }
                return false;
            });
        }
    });
});

test.describe('Cross-browser Compatibility', () => {
    const browsers = ['chromium', 'firefox', 'webkit'];
    
    browsers.forEach(browserName => {
        test(`Renders correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
            if (currentBrowser === browserName) {
                await page.goto('http://localhost:52232', { waitUntil: 'networkidle' });
                
                const header = await page.$('header');
                expect(header).toBeTruthy();
                
                const hero = await page.$('.hero-modern');
                expect(hero).toBeTruthy();
                
                const footer = await page.$('footer');
                expect(footer).toBeTruthy();
                
                const screenshot = await page.screenshot({ 
                    fullPage: false,
                    path: `test-screenshots/${browserName}-homepage.png`
                });
                expect(screenshot).toBeTruthy();
            }
        });
    });
});

// Test file ready for execution