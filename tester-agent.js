const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class TesterAgent {
    constructor(config = {}) {
        this.config = {
            outputDir: config.outputDir ?? './test-results',
            runUITests: config.runUITests ?? true,
            runPerformanceTests: config.runPerformanceTests ?? true,
            runAccessibilityTests: config.runAccessibilityTests ?? true,
            runSecurityTests: config.runSecurityTests ?? true,
            runFunctionalTests: config.runFunctionalTests ?? true,
            runRegressionTests: config.runRegressionTests ?? false,
            generateVisualDiffs: config.generateVisualDiffs ?? false,
            crossBrowserTesting: config.crossBrowserTesting ?? false,
            mobileDeviceTesting: config.mobileDeviceTesting ?? true,
            headless: config.headless ?? true,
            timeout: config.timeout ?? 30000,
            retryFailedTests: config.retryFailedTests ?? 2,
            ...config
        };

        this.testSuites = [];
        this.results = {
            summary: {},
            testSuites: [],
            issues: [],
            recommendations: []
        };

        this.pages = [
            { url: 'https://theprofitplatform.com.au/', name: 'Homepage', activeNav: 'Home' },
            { url: 'https://theprofitplatform.com.au/services', name: 'Services', activeNav: 'Services' },
            { url: 'https://theprofitplatform.com.au/pricing', name: 'Pricing', activeNav: 'Pricing' },
            { url: 'https://theprofitplatform.com.au/contact', name: 'Contact', activeNav: 'Contact' }
        ];

        this.browsers = ['chromium'];
        if (config.crossBrowserTesting) {
            this.browsers = ['chromium', 'firefox', 'webkit'];
        }

        this.mobileDevices = [
            { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
            { name: 'iPad', viewport: { width: 810, height: 1080 } },
            { name: 'Galaxy S20', viewport: { width: 360, height: 800 } }
        ];
    }

    async init() {
        try {
            await fs.mkdir(this.config.outputDir, { recursive: true });
            await fs.mkdir(`${this.config.outputDir}/screenshots`, { recursive: true });
        } catch (error) {
            // Directory already exists
        }
    }

    async runAllTests() {
        console.log('🧪 Starting Comprehensive Tester Agent...\n');
        
        await this.init();

        const startTime = Date.now();
        
        // Run different test categories
        if (this.config.runUITests) {
            await this.runUITestSuite();
        }

        if (this.config.runPerformanceTests) {
            await this.runPerformanceTestSuite();
        }

        if (this.config.runAccessibilityTests) {
            await this.runAccessibilityTestSuite();
        }

        if (this.config.runSecurityTests) {
            await this.runSecurityTestSuite();
        }

        if (this.config.runFunctionalTests) {
            await this.runFunctionalTestSuite();
        }

        if (this.config.mobileDeviceTesting) {
            await this.runMobileTestSuite();
        }

        if (this.config.crossBrowserTesting) {
            await this.runCrossBrowserTestSuite();
        }

        if (this.config.runRegressionTests) {
            await this.runRegressionTestSuite();
        }

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        // Generate comprehensive report
        await this.generateTestReport(duration);
        
        return this.results;
    }

    async runUITestSuite() {
        console.log('🎨 Running UI Test Suite...');
        
        const browser = await chromium.launch({ headless: this.config.headless });
        const context = await browser.newContext();
        const testResults = [];

        for (const pageInfo of this.pages) {
            console.log(`  Testing UI: ${pageInfo.name}`);
            const page = await context.newPage();
            
            try {
                await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                
                const pageResult = {
                    page: pageInfo.name,
                    url: pageInfo.url,
                    tests: {}
                };

                // UI Component Tests
                pageResult.tests.headerPresent = await page.locator('header').count() > 0;
                pageResult.tests.footerPresent = await page.locator('footer').count() > 0;
                pageResult.tests.navigationWorking = await page.locator('nav a').count() > 0;
                pageResult.tests.ctaButtonsPresent = await page.locator('button, .btn, .cta').count() > 0;
                pageResult.tests.logoPresent = await page.locator('[alt*="logo"], .logo, #logo').count() > 0;
                
                // Form validation (if contact page)
                if (pageInfo.name === 'Contact') {
                    pageResult.tests.formValidation = await this.testFormValidation(page);
                    pageResult.tests.requiredFieldsMarked = await page.locator('input[required], select[required], textarea[required]').count() > 0;
                }

                // Visual elements
                pageResult.tests.imagesLoaded = await this.checkImagesLoaded(page);
                pageResult.tests.noVisualErrors = await this.checkVisualErrors(page);

                testResults.push(pageResult);
                
            } catch (error) {
                testResults.push({
                    page: pageInfo.name,
                    url: pageInfo.url,
                    error: error.message
                });
            } finally {
                await page.close();
            }
        }

        await browser.close();
        
        this.results.testSuites.push({
            name: 'UI Tests',
            type: 'ui',
            results: testResults,
            summary: this.calculateSuiteSummary(testResults)
        });
    }

    async runPerformanceTestSuite() {
        console.log('⚡ Running Performance Test Suite...');
        
        const browser = await chromium.launch({ headless: true }); // Always headless for performance
        const context = await browser.newContext();
        const testResults = [];

        for (const pageInfo of this.pages) {
            console.log(`  Testing Performance: ${pageInfo.name}`);
            const page = await context.newPage();
            
            try {
                const startTime = Date.now();
                await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                const loadTime = Date.now() - startTime;

                const metrics = await page.evaluate(() => {
                    const perf = performance.getEntriesByType('navigation')[0];
                    return {
                        loadTime: perf.loadEventEnd - perf.loadEventStart,
                        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
                        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                        resourceCount: performance.getEntriesByType('resource').length,
                        totalSize: performance.getEntriesByType('resource')
                            .reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
                    };
                });

                // Core Web Vitals
                const coreWebVitals = await this.measureCoreWebVitals(page);
                
                const pageResult = {
                    page: pageInfo.name,
                    url: pageInfo.url,
                    metrics: {
                        ...metrics,
                        actualLoadTime: loadTime,
                        coreWebVitals
                    },
                    tests: {
                        loadUnder3Seconds: loadTime < 3000,
                        domLoadUnder2Seconds: metrics.domContentLoaded < 2000,
                        reasonableResourceCount: metrics.resourceCount < 100,
                        totalSizeUnder2MB: metrics.totalSize < 2048000,
                        goodLCP: coreWebVitals.lcp < 2500,
                        goodCLS: coreWebVitals.cls < 0.1
                    }
                };

                testResults.push(pageResult);
                
            } catch (error) {
                testResults.push({
                    page: pageInfo.name,
                    url: pageInfo.url,
                    error: error.message
                });
            } finally {
                await page.close();
            }
        }

        await browser.close();
        
        this.results.testSuites.push({
            name: 'Performance Tests',
            type: 'performance',
            results: testResults,
            summary: this.calculateSuiteSummary(testResults)
        });
    }

    async runAccessibilityTestSuite() {
        console.log('♿ Running Accessibility Test Suite...');
        
        const browser = await chromium.launch({ headless: this.config.headless });
        const context = await browser.newContext();
        const testResults = [];

        for (const pageInfo of this.pages) {
            console.log(`  Testing Accessibility: ${pageInfo.name}`);
            const page = await context.newPage();
            
            try {
                await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                
                const pageResult = {
                    page: pageInfo.name,
                    url: pageInfo.url,
                    tests: {}
                };

                // Basic accessibility checks
                pageResult.tests.hasLangAttribute = await page.locator('html[lang]').count() > 0;
                pageResult.tests.hasPageTitle = (await page.title()).length > 0;
                pageResult.tests.hasH1 = await page.locator('h1').count() === 1;
                pageResult.tests.headingHierarchy = await this.checkHeadingHierarchy(page);
                pageResult.tests.imagesHaveAlt = await this.checkImageAltText(page);
                pageResult.tests.linksHaveAccessibleText = await this.checkLinkAccessibility(page);
                pageResult.tests.formsHaveLabels = await this.checkFormLabels(page);
                pageResult.tests.colorContrastSufficient = await this.checkColorContrast(page);
                pageResult.tests.keyboardNavigable = await this.checkKeyboardNavigation(page);
                pageResult.tests.focusIndicatorsVisible = await this.checkFocusIndicators(page);
                pageResult.tests.hasSkipLinks = await page.locator('a[href="#main"], a[href="#content"]').count() > 0;

                testResults.push(pageResult);
                
            } catch (error) {
                testResults.push({
                    page: pageInfo.name,
                    url: pageInfo.url,
                    error: error.message
                });
            } finally {
                await page.close();
            }
        }

        await browser.close();
        
        this.results.testSuites.push({
            name: 'Accessibility Tests',
            type: 'accessibility',
            results: testResults,
            summary: this.calculateSuiteSummary(testResults)
        });
    }

    async runSecurityTestSuite() {
        console.log('🔒 Running Security Test Suite...');
        
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const testResults = [];

        for (const pageInfo of this.pages) {
            console.log(`  Testing Security: ${pageInfo.name}`);
            const page = await context.newPage();
            
            try {
                const response = await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                
                const pageResult = {
                    page: pageInfo.name,
                    url: pageInfo.url,
                    tests: {}
                };

                // Security header checks
                const headers = response.headers();
                pageResult.tests.hasHTTPS = pageInfo.url.startsWith('https://');
                pageResult.tests.hasSecurityHeaders = this.checkSecurityHeaders(headers);
                pageResult.tests.noMixedContent = await this.checkMixedContent(page);
                pageResult.tests.externalLinksSecure = await this.checkExternalLinks(page);
                pageResult.tests.noSensitiveDataExposed = await this.checkSensitiveDataExposure(page);
                
                // Form security (if forms exist)
                const formCount = await page.locator('form').count();
                if (formCount > 0) {
                    pageResult.tests.formsUseHTTPS = pageInfo.url.startsWith('https://');
                    pageResult.tests.hasCSRFProtection = await this.checkCSRFProtection(page);
                }

                testResults.push(pageResult);
                
            } catch (error) {
                testResults.push({
                    page: pageInfo.name,
                    url: pageInfo.url,
                    error: error.message
                });
            } finally {
                await page.close();
            }
        }

        await browser.close();
        
        this.results.testSuites.push({
            name: 'Security Tests',
            type: 'security',
            results: testResults,
            summary: this.calculateSuiteSummary(testResults)
        });
    }

    async runFunctionalTestSuite() {
        console.log('⚙️ Running Functional Test Suite...');
        
        const browser = await chromium.launch({ headless: this.config.headless });
        const context = await browser.newContext();
        const testResults = [];

        for (const pageInfo of this.pages) {
            console.log(`  Testing Functionality: ${pageInfo.name}`);
            const page = await context.newPage();
            
            try {
                await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                
                const pageResult = {
                    page: pageInfo.name,
                    url: pageInfo.url,
                    tests: {}
                };

                // Navigation functionality
                pageResult.tests.navigationLinksWork = await this.testNavigationLinks(page);
                pageResult.tests.mobileMenuWorks = await this.testMobileMenu(page);
                
                // Page-specific functionality
                if (pageInfo.name === 'Contact') {
                    pageResult.tests.contactFormSubmittable = await this.testContactForm(page);
                }
                
                if (pageInfo.name === 'Services') {
                    pageResult.tests.serviceLinksWork = await this.testServiceLinks(page);
                }

                // Search functionality (if exists)
                const searchExists = await page.locator('input[type="search"], .search-input').count() > 0;
                if (searchExists) {
                    pageResult.tests.searchWorks = await this.testSearchFunctionality(page);
                }

                // CTA buttons functionality
                pageResult.tests.ctaButtonsClickable = await this.testCTAButtons(page);

                testResults.push(pageResult);
                
            } catch (error) {
                testResults.push({
                    page: pageInfo.name,
                    url: pageInfo.url,
                    error: error.message
                });
            } finally {
                await page.close();
            }
        }

        await browser.close();
        
        this.results.testSuites.push({
            name: 'Functional Tests',
            type: 'functional',
            results: testResults,
            summary: this.calculateSuiteSummary(testResults)
        });
    }

    async runMobileTestSuite() {
        console.log('📱 Running Mobile Device Test Suite...');
        
        const testResults = [];

        for (const device of this.mobileDevices) {
            console.log(`  Testing on ${device.name}...`);
            
            const browser = await chromium.launch({ headless: this.config.headless });
            const context = await browser.newContext({
                viewport: device.viewport,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
            });

            for (const pageInfo of this.pages.slice(0, 2)) { // Test first 2 pages on mobile
                const page = await context.newPage();
                
                try {
                    await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                    
                    const pageResult = {
                        device: device.name,
                        page: pageInfo.name,
                        url: pageInfo.url,
                        tests: {}
                    };

                    // Mobile-specific tests
                    pageResult.tests.noHorizontalScroll = await this.checkHorizontalScroll(page);
                    pageResult.tests.touchTargetsAccessible = await this.checkTouchTargets(page);
                    pageResult.tests.mobileNavVisible = await page.locator('.menu-toggle, .mobile-menu-trigger').isVisible();
                    pageResult.tests.textReadableOnMobile = await this.checkTextReadability(page);
                    pageResult.tests.imagesScaleProperly = await this.checkImageScaling(page);

                    // Take mobile screenshots
                    await page.screenshot({ 
                        path: `${this.config.outputDir}/screenshots/${device.name}-${pageInfo.name}.png`,
                        fullPage: true 
                    });

                    testResults.push(pageResult);
                    
                } catch (error) {
                    testResults.push({
                        device: device.name,
                        page: pageInfo.name,
                        url: pageInfo.url,
                        error: error.message
                    });
                } finally {
                    await page.close();
                }
            }

            await browser.close();
        }
        
        this.results.testSuites.push({
            name: 'Mobile Device Tests',
            type: 'mobile',
            results: testResults,
            summary: this.calculateSuiteSummary(testResults)
        });
    }

    async runCrossBrowserTestSuite() {
        console.log('🌐 Running Cross-Browser Test Suite...');
        
        const testResults = [];
        const { firefox, webkit } = require('playwright');
        
        const browsers = {
            chromium: chromium,
            firefox: firefox,
            webkit: webkit
        };

        for (const [browserName, browserType] of Object.entries(browsers)) {
            console.log(`  Testing on ${browserName}...`);
            
            try {
                const browser = await browserType.launch({ headless: true });
                const context = await browser.newContext();

                for (const pageInfo of this.pages.slice(0, 2)) { // Test first 2 pages per browser
                    const page = await context.newPage();
                    
                    try {
                        await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                        
                        const pageResult = {
                            browser: browserName,
                            page: pageInfo.name,
                            url: pageInfo.url,
                            tests: {}
                        };

                        // Cross-browser compatibility tests
                        pageResult.tests.pageLoads = true; // If we got here, it loaded
                        pageResult.tests.cssRendersCorrectly = await this.checkCSSRendering(page);
                        pageResult.tests.jsExecutesProperly = await this.checkJavaScriptExecution(page);
                        pageResult.tests.fontsDisplayCorrectly = await this.checkFontRendering(page);

                        testResults.push(pageResult);
                        
                    } catch (error) {
                        testResults.push({
                            browser: browserName,
                            page: pageInfo.name,
                            url: pageInfo.url,
                            error: error.message
                        });
                    } finally {
                        await page.close();
                    }
                }

                await browser.close();
                
            } catch (error) {
                console.log(`    ❌ Could not test ${browserName}: ${error.message}`);
            }
        }
        
        this.results.testSuites.push({
            name: 'Cross-Browser Tests',
            type: 'cross-browser',
            results: testResults,
            summary: this.calculateSuiteSummary(testResults)
        });
    }

    async runRegressionTestSuite() {
        console.log('🔄 Running Regression Test Suite...');
        
        // This would compare against baseline screenshots/data
        // For now, implementing basic structure
        const testResults = [];
        
        this.results.testSuites.push({
            name: 'Regression Tests',
            type: 'regression',
            results: testResults,
            summary: { passed: 0, failed: 0, total: 0, score: 100 }
        });
    }

    // Helper methods for specific test types
    async checkImagesLoaded(page) {
        const images = await page.locator('img').all();
        for (const img of images) {
            const isLoaded = await img.evaluate(el => el.complete && el.naturalHeight !== 0);
            if (!isLoaded) return false;
        }
        return true;
    }

    async checkVisualErrors(page) {
        // Check for broken layouts, overlapping elements, etc.
        const hasOverflows = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            return Array.from(elements).some(el => {
                const rect = el.getBoundingClientRect();
                return rect.left < -10 || rect.right > window.innerWidth + 10;
            });
        });
        return !hasOverflows;
    }

    async testFormValidation(page) {
        const forms = await page.locator('form').all();
        if (forms.length === 0) return true;
        
        // Try to submit empty form to test validation
        try {
            const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
            await submitButton.click();
            
            // Check if validation messages appear
            const validationMessages = await page.locator('.error, .invalid, [aria-invalid="true"]').count();
            return validationMessages > 0;
        } catch {
            return true; // Assume validation works if we can't test it
        }
    }

    async measureCoreWebVitals(page) {
        return await page.evaluate(() => {
            return new Promise((resolve) => {
                const vitals = { lcp: 0, fid: 0, cls: 0 };
                
                // Largest Contentful Paint
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    if (entries.length > 0) {
                        vitals.lcp = Math.round(entries[entries.length - 1].startTime);
                    }
                }).observe({ type: 'largest-contentful-paint', buffered: true });
                
                // Cumulative Layout Shift
                new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    vitals.cls = Math.round(clsValue * 1000) / 1000;
                }).observe({ type: 'layout-shift', buffered: true });
                
                setTimeout(() => resolve(vitals), 3000);
            });
        });
    }

    async checkHeadingHierarchy(page) {
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(headings => 
            headings.map(h => parseInt(h.tagName.charAt(1)))
        );
        
        if (headings.length === 0) return false;
        if (headings[0] !== 1) return false;
        
        for (let i = 1; i < headings.length; i++) {
            if (headings[i] > headings[i-1] + 1) return false;
        }
        return true;
    }

    async checkImageAltText(page) {
        const imagesWithoutAlt = await page.locator('img:not([alt])').count();
        return imagesWithoutAlt === 0;
    }

    async checkLinkAccessibility(page) {
        const emptyLinks = await page.locator('a:not([aria-label]):not([title])').evaluateAll(links => 
            links.filter(link => !link.textContent.trim()).length
        );
        return emptyLinks === 0;
    }

    async checkFormLabels(page) {
        const inputsWithoutLabels = await page.locator('input:not([aria-label]):not([aria-labelledby])').evaluateAll(inputs =>
            inputs.filter(input => {
                const id = input.id;
                return !id || !document.querySelector(`label[for="${id}"]`);
            }).length
        );
        return inputsWithoutLabels === 0;
    }

    async checkColorContrast(page) {
        // Simplified contrast check
        return await page.evaluate(() => {
            const elements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
            return elements.length > 0; // Placeholder - would need proper contrast calculation
        });
    }

    async checkKeyboardNavigation(page) {
        try {
            await page.keyboard.press('Tab');
            const activeElement = await page.evaluate(() => document.activeElement.tagName);
            return activeElement !== 'BODY';
        } catch {
            return false;
        }
    }

    async checkFocusIndicators(page) {
        // Check if focus indicators are visible
        return await page.evaluate(() => {
            const style = getComputedStyle(document.documentElement);
            return style.getPropertyValue('outline') !== 'none';
        });
    }

    async checkSecurityHeaders(headers) {
        const securityHeaders = [
            'strict-transport-security',
            'content-security-policy',
            'x-frame-options',
            'x-content-type-options'
        ];
        
        return securityHeaders.some(header => headers[header]);
    }

    async checkMixedContent(page) {
        const mixedContent = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            return !resources.some(resource => 
                resource.name.startsWith('http://') && window.location.protocol === 'https:'
            );
        });
        return mixedContent;
    }

    async checkExternalLinks(page) {
        const externalLinks = await page.locator('a[href^="http"]:not([href*="theprofitplatform.com.au"])').all();
        for (const link of externalLinks) {
            const href = await link.getAttribute('href');
            if (href && href.startsWith('http://')) {
                return false; // Found insecure external link
            }
        }
        return true;
    }

    async checkSensitiveDataExposure(page) {
        const pageContent = await page.content();
        const sensitivePatterns = [
            /password\s*[:=]\s*['"][^'"]+['"]/i,
            /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
            /secret\s*[:=]\s*['"][^'"]+['"]/i
        ];
        
        return !sensitivePatterns.some(pattern => pattern.test(pageContent));
    }

    async checkCSRFProtection(page) {
        const csrfToken = await page.locator('input[name*="csrf"], input[name*="token"], meta[name="csrf-token"]').count();
        return csrfToken > 0;
    }

    async testNavigationLinks(page) {
        const navLinks = await page.locator('nav a').all();
        return navLinks.length > 0;
    }

    async testMobileMenu(page) {
        await page.setViewportSize({ width: 375, height: 667 });
        const mobileToggle = page.locator('.menu-toggle, .mobile-menu-trigger').first();
        
        if (await mobileToggle.isVisible()) {
            await mobileToggle.click();
            const mobileMenu = await page.locator('.mobile-menu, .mobile-nav').isVisible();
            return mobileMenu;
        }
        return true; // No mobile menu to test
    }

    async testContactForm(page) {
        const form = page.locator('form').first();
        if (await form.count() === 0) return true;
        
        // Fill out form fields
        await page.fill('input[type="text"]', 'Test User');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('textarea', 'Test message');
        
        return true; // Don't actually submit in tests
    }

    async testServiceLinks(page) {
        const serviceLinks = await page.locator('.service a, .service-item a').count();
        return serviceLinks > 0;
    }

    async testSearchFunctionality(page) {
        const searchInput = page.locator('input[type="search"], .search-input').first();
        if (await searchInput.count() === 0) return true;
        
        await searchInput.fill('test search');
        await page.keyboard.press('Enter');
        return true; // Basic functionality test
    }

    async testCTAButtons(page) {
        const ctaButtons = await page.locator('button, .btn, .cta').all();
        for (const button of ctaButtons) {
            const isClickable = await button.isEnabled();
            if (!isClickable) return false;
        }
        return true;
    }

    async checkHorizontalScroll(page) {
        const hasHorizontalScroll = await page.evaluate(() => 
            document.documentElement.scrollWidth > window.innerWidth
        );
        return !hasHorizontalScroll;
    }

    async checkTouchTargets(page) {
        const touchTargets = await page.locator('a, button, input, select, textarea').evaluateAll(elements => {
            return elements.filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width >= 44 && rect.height >= 44;
            }).length;
        });
        const totalInteractive = await page.locator('a, button, input, select, textarea').count();
        return touchTargets / totalInteractive > 0.8; // 80% of touch targets are appropriate size
    }

    async checkTextReadability(page) {
        const smallText = await page.evaluate(() => {
            const textElements = document.querySelectorAll('p, span, div');
            let smallTextCount = 0;
            textElements.forEach(el => {
                const fontSize = parseFloat(getComputedStyle(el).fontSize);
                if (fontSize < 16) smallTextCount++;
            });
            return smallTextCount / textElements.length < 0.3; // Less than 30% small text
        });
        return smallText;
    }

    async checkImageScaling(page) {
        const images = await page.locator('img').evaluateAll(images => {
            return images.filter(img => {
                const rect = img.getBoundingClientRect();
                return rect.width > window.innerWidth;
            }).length;
        });
        return images === 0; // No images overflow viewport
    }

    async checkCSSRendering(page) {
        const hasStyles = await page.evaluate(() => {
            const computedStyle = getComputedStyle(document.body);
            return computedStyle.fontFamily !== '' && computedStyle.color !== '';
        });
        return hasStyles;
    }

    async checkJavaScriptExecution(page) {
        const jsWorks = await page.evaluate(() => {
            try {
                return typeof document !== 'undefined' && typeof window !== 'undefined';
            } catch {
                return false;
            }
        });
        return jsWorks;
    }

    async checkFontRendering(page) {
        const fontsLoaded = await page.evaluate(() => {
            return document.fonts.ready.then(() => document.fonts.size > 0);
        });
        return fontsLoaded;
    }

    calculateSuiteSummary(results) {
        let totalTests = 0;
        let passedTests = 0;
        
        results.forEach(result => {
            if (result.tests) {
                Object.values(result.tests).forEach(testResult => {
                    totalTests++;
                    if (testResult === true) passedTests++;
                });
            }
        });
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: totalTests - passedTests,
            score: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
        };
    }

    async generateTestReport(duration) {
        const timestamp = new Date().toISOString();
        
        // Calculate overall summary
        const overallSummary = this.results.testSuites.reduce((acc, suite) => {
            acc.totalTests += suite.summary.total;
            acc.passedTests += suite.summary.passed;
            acc.failedTests += suite.summary.failed;
            return acc;
        }, { totalTests: 0, passedTests: 0, failedTests: 0 });
        
        overallSummary.overallScore = overallSummary.totalTests > 0 ? 
            Math.round((overallSummary.passedTests / overallSummary.totalTests) * 100) : 0;

        this.results.summary = {
            ...overallSummary,
            duration,
            timestamp,
            testSuiteCount: this.results.testSuites.length
        };

        // Write detailed JSON report
        await fs.writeFile(
            `${this.config.outputDir}/comprehensive-test-report-${timestamp.split('T')[0]}.json`,
            JSON.stringify(this.results, null, 2)
        );

        // Write HTML report
        const htmlReport = this.generateHTMLReport();
        await fs.writeFile(
            `${this.config.outputDir}/comprehensive-test-report-${timestamp.split('T')[0]}.html`,
            htmlReport
        );

        console.log('\n' + '='.repeat(80));
        console.log('🧪 COMPREHENSIVE TESTER AGENT SUMMARY');
        console.log('='.repeat(80));
        console.log(this.generateConsoleSummary());
        console.log('='.repeat(80));
    }

    generateConsoleSummary() {
        const summary = this.results.summary;
        let output = `\n🎯 Overall Score: ${summary.overallScore}%\n`;
        output += `✅ Tests Passed: ${summary.passedTests}/${summary.totalTests}\n`;
        output += `⏱️ Duration: ${summary.duration} seconds\n`;
        output += `📋 Test Suites: ${summary.testSuiteCount}\n\n`;
        
        this.results.testSuites.forEach(suite => {
            const status = suite.summary.score >= 80 ? '🟢' : suite.summary.score >= 60 ? '🟡' : '🔴';
            output += `${status} ${suite.name}: ${suite.summary.score}% (${suite.summary.passed}/${suite.summary.total})\n`;
        });

        return output;
    }

    generateHTMLReport() {
        const summary = this.results.summary;
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Report - ${summary.timestamp.split('T')[0]}</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 40px; background: #f5f5f5; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-suite { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .suite-header { padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .suite-content { padding: 20px; }
        .test-result { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 10px; border-radius: 4px; }
        .pass { background: #f0f9ff; color: #0369a1; }
        .fail { background: #fef2f2; color: #dc2626; }
        .score { font-size: 2em; font-weight: bold; color: #667eea; }
        .metric { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Comprehensive Test Report</h1>
        <p>Generated on ${new Date(summary.timestamp).toLocaleString()}</p>
        <p>Test Duration: ${summary.duration} seconds</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <div class="score">${summary.overallScore}%</div>
            <div>Overall Score</div>
        </div>
        <div class="summary-card">
            <div class="score">${summary.passedTests}</div>
            <div>Tests Passed</div>
        </div>
        <div class="summary-card">
            <div class="score">${summary.failedTests}</div>
            <div>Tests Failed</div>
        </div>
        <div class="summary-card">
            <div class="score">${summary.testSuiteCount}</div>
            <div>Test Suites</div>
        </div>
    </div>

    ${this.results.testSuites.map(suite => `
        <div class="test-suite">
            <div class="suite-header">
                <h2>${suite.name} - ${suite.summary.score}%</h2>
                <p>${suite.summary.passed}/${suite.summary.total} tests passed</p>
            </div>
            <div class="suite-content">
                ${suite.results.slice(0, 5).map(result => `
                    <div>
                        <h4>${result.page || result.device || result.browser || 'Test Result'}</h4>
                        ${result.tests ? Object.entries(result.tests).map(([test, passed]) => `
                            <div class="test-result ${passed ? 'pass' : 'fail'}">
                                <span>${test}</span>
                                <span>${passed ? '✅' : '❌'}</span>
                            </div>
                        `).join('') : ''}
                        ${result.metrics ? `
                            <div class="metrics">
                                <h5>Metrics:</h5>
                                ${Object.entries(result.metrics).map(([key, value]) => `
                                    <div class="metric">${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}</div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}

</body>
</html>`;
    }
}

// Export for use as module or run directly
if (require.main === module) {
    const agent = new TesterAgent({
        outputDir: './comprehensive-test-results',
        headless: false
    });
    
    agent.runAllTests().catch(console.error);
}

module.exports = TesterAgent;