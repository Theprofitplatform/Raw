const { chromium } = require('playwright');
const fs = require('fs').promises;

class EnhancedUITestingAgent {
    constructor(config = {}) {
        this.config = {
            headless: config.headless ?? true,
            viewport: { width: 1280, height: 720 },
            timeout: config.timeout ?? 30000,
            outputDir: config.outputDir ?? './test-results',
            generateScreenshots: config.generateScreenshots ?? true,
            checkAccessibility: config.checkAccessibility ?? true,
            checkPerformance: config.checkPerformance ?? true,
            checkSEO: config.checkSEO ?? true,
            checkResponsive: config.checkResponsive ?? true,
            ...config
        };

        this.pages = [
            { url: 'https://theprofitplatform.com.au/', name: 'Homepage', activeNav: 'Home' },
            { url: 'https://theprofitplatform.com.au/services', name: 'Services', activeNav: 'Services' },
            { url: 'https://theprofitplatform.com.au/pricing', name: 'Pricing', activeNav: 'Pricing' },
            { url: 'https://theprofitplatform.com.au/contact', name: 'Contact', activeNav: 'Contact' },
            { url: 'https://theprofitplatform.com.au/blog-template', name: 'Blog Template', activeNav: 'Blog' },
            { url: 'https://theprofitplatform.com.au/privacy-policy', name: 'Privacy Policy', activeNav: null },
            { url: 'https://theprofitplatform.com.au/terms-of-service', name: 'Terms of Service', activeNav: null },
            { url: 'https://theprofitplatform.com.au/seo-landing', name: 'SEO Landing', activeNav: null },
            { url: 'https://theprofitplatform.com.au/google-ads-landing', name: 'Google Ads Landing', activeNav: null }
        ];

        this.results = [];
    }

    async init() {
        this.browser = await chromium.launch({ 
            headless: this.config.headless,
            args: ['--disable-dev-shm-usage']
        });
        this.context = await this.browser.newContext({
            viewport: this.config.viewport
        });
        
        // Create output directory
        try {
            await fs.mkdir(this.config.outputDir, { recursive: true });
        } catch (error) {
            // Directory already exists
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Enhanced UI Testing Agent...\n');
        
        await this.init();

        for (const pageInfo of this.pages) {
            console.log(`\n🔍 Testing: ${pageInfo.name}`);
            const result = await this.testPage(pageInfo);
            this.results.push(result);
        }

        await this.browser.close();
        await this.generateReport();
        
        return this.results;
    }

    async testPage(pageInfo) {
        const page = await this.context.newPage();
        
        const testResult = {
            page: pageInfo.name,
            url: pageInfo.url,
            timestamp: new Date().toISOString(),
            tests: {},
            scores: {},
            issues: []
        };

        try {
            await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // Run all test categories
            await this.testBasicStructure(page, pageInfo, testResult);
            
            if (this.config.checkAccessibility) {
                await this.testAccessibility(page, testResult);
            }
            
            if (this.config.checkPerformance) {
                await this.testPerformance(page, testResult);
            }
            
            if (this.config.checkSEO) {
                await this.testSEO(page, testResult);
            }
            
            if (this.config.checkResponsive) {
                await this.testResponsive(page, testResult);
            }

            if (this.config.generateScreenshots) {
                await this.takeScreenshots(page, pageInfo, testResult);
            }

            // Calculate overall score
            testResult.overallScore = this.calculateOverallScore(testResult.tests);
            
        } catch (error) {
            console.log(`  ❌ Error testing ${pageInfo.name}: ${error.message}`);
            testResult.error = error.message;
        } finally {
            await page.close();
        }

        return testResult;
    }

    async testBasicStructure(page, pageInfo, testResult) {
        console.log('  🏗️ Testing basic structure...');
        
        // Existing tests from your original file
        testResult.tests.scrollProgress = await page.locator('.scroll-progress').count() > 0;
        testResult.tests.enhancedHeader = await page.locator('header#header nav.container').count() > 0;
        testResult.tests.servicesDropdown = await page.locator('.nav-dropdown .dropdown-menu').count() > 0;
        
        if (pageInfo.activeNav) {
            testResult.tests.activeNav = await page.locator(`.nav-item.active:has-text("${pageInfo.activeNav}")`).count() > 0;
        } else {
            testResult.tests.activeNav = true;
        }

        // Enhanced structure tests
        testResult.tests.hasTitle = (await page.title()).length > 0;
        testResult.tests.hasMetaDescription = await page.locator('meta[name="description"]').count() > 0;
        testResult.tests.hasH1 = await page.locator('h1').count() > 0;
        testResult.tests.uniqueH1 = await page.locator('h1').count() === 1;
        testResult.tests.hasCanonical = await page.locator('link[rel="canonical"]').count() > 0;
    }

    async testAccessibility(page, testResult) {
        console.log('  ♿ Testing accessibility...');
        
        // Basic accessibility checks
        testResult.tests.hasLang = await page.locator('html[lang]').count() > 0;
        testResult.tests.imagesHaveAlt = await this.checkImageAltText(page);
        testResult.tests.linksHaveText = await this.checkLinkText(page);
        testResult.tests.headingHierarchy = await this.checkHeadingHierarchy(page);
        testResult.tests.colorContrast = await this.checkColorContrast(page);
        testResult.tests.focusable = await this.checkFocusableElements(page);
        testResult.tests.skipLinks = await page.locator('a[href="#main"], a[href="#content"]').count() > 0;
        
        // Form accessibility (if contact page)
        if (testResult.page === 'Contact') {
            testResult.tests.formLabels = await this.checkFormLabels(page);
        }
    }

    async testPerformance(page, testResult) {
        console.log('  ⚡ Testing performance...');
        
        const metrics = await page.evaluate(() => {
            const perf = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: perf.loadEventEnd - perf.loadEventStart,
                domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                resourceCount: performance.getEntriesByType('resource').length
            };
        });

        testResult.tests.fastLoad = metrics.loadTime < 3000;
        testResult.tests.fastDOMLoad = metrics.domContentLoaded < 2000;
        testResult.tests.reasonableResourceCount = metrics.resourceCount < 50;
        
        testResult.scores.performance = {
            loadTime: Math.round(metrics.loadTime),
            domContentLoaded: Math.round(metrics.domContentLoaded),
            firstPaint: Math.round(metrics.firstPaint),
            resourceCount: metrics.resourceCount
        };

        // Core Web Vitals simulation
        const coreWebVitals = await this.measureCoreWebVitals(page);
        testResult.scores.coreWebVitals = coreWebVitals;
    }

    async testSEO(page, testResult) {
        console.log('  🔍 Testing SEO...');
        
        const title = await page.title();
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        const h1Text = await page.locator('h1').first().textContent();
        
        testResult.tests.titleLength = title.length >= 30 && title.length <= 60;
        testResult.tests.descriptionLength = metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160;
        testResult.tests.h1HasKeywords = h1Text && h1Text.toLowerCase().includes('digital marketing');
        testResult.tests.hasStructuredData = await page.locator('script[type="application/ld+json"]').count() > 0;
        testResult.tests.hasOpenGraph = await page.locator('meta[property^="og:"]').count() > 0;
        testResult.tests.hasTwitterCard = await page.locator('meta[name^="twitter:"]').count() > 0;
        
        testResult.scores.seo = {
            title: title,
            titleLength: title.length,
            description: metaDescription,
            descriptionLength: metaDescription ? metaDescription.length : 0,
            h1: h1Text
        };
    }

    async testResponsive(page, testResult) {
        console.log('  📱 Testing responsive design...');
        
        const viewports = [
            { width: 375, height: 667, name: 'mobile' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 1280, height: 720, name: 'desktop' }
        ];

        testResult.tests.responsive = {};
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(1000);
            
            const mobileNavVisible = viewport.width <= 768 ? 
                await page.locator('.menu-toggle').isVisible() : 
                !await page.locator('.menu-toggle').isVisible();
            
            const noHorizontalScroll = await page.evaluate(() => 
                document.documentElement.scrollWidth <= window.innerWidth
            );
            
            testResult.tests.responsive[viewport.name] = {
                correctNavigation: mobileNavVisible,
                noHorizontalScroll: noHorizontalScroll
            };
        }
    }

    async takeScreenshots(page, pageInfo, testResult) {
        const screenshotPath = `${this.config.outputDir}/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-screenshot.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResult.screenshotPath = screenshotPath;
    }

    // Helper methods for accessibility checks
    async checkImageAltText(page) {
        const imagesWithoutAlt = await page.locator('img:not([alt])').count();
        return imagesWithoutAlt === 0;
    }

    async checkLinkText(page) {
        const emptyLinks = await page.locator('a:not([aria-label]):not([title])').evaluateAll(links => 
            links.filter(link => !link.textContent.trim()).length
        );
        return emptyLinks === 0;
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

    async checkColorContrast(page) {
        // Simplified contrast check - would need more sophisticated implementation for full WCAG compliance
        const hasGoodContrast = await page.evaluate(() => {
            const elements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
            let passedElements = 0;
            
            elements.forEach(el => {
                const styles = getComputedStyle(el);
                const color = styles.color;
                const backgroundColor = styles.backgroundColor;
                
                // Simple heuristic - this would need proper contrast calculation in production
                if (color.includes('rgb(15, 23, 42)') || color.includes('rgb(51, 65, 85)')) {
                    passedElements++;
                }
            });
            
            return passedElements / elements.length > 0.8;
        });
        
        return hasGoodContrast;
    }

    async checkFocusableElements(page) {
        const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
        return focusableElements > 0;
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

    async measureCoreWebVitals(page) {
        return await page.evaluate(() => {
            return new Promise((resolve) => {
                const vitals = {};
                
                // Largest Contentful Paint
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    if (entries.length > 0) {
                        vitals.lcp = Math.round(entries[entries.length - 1].startTime);
                    }
                }).observe({ type: 'largest-contentful-paint', buffered: true });
                
                // First Input Delay would need user interaction simulation
                vitals.fid = 0;
                
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

    calculateOverallScore(tests) {
        const passed = Object.values(tests).flat().filter(result => 
            result === true || (typeof result === 'object' && Object.values(result).every(v => v === true))
        ).length;
        
        const total = this.countAllTests(tests);
        return Math.round((passed / total) * 100);
    }

    countAllTests(tests) {
        let count = 0;
        for (const value of Object.values(tests)) {
            if (typeof value === 'boolean') {
                count++;
            } else if (typeof value === 'object' && value !== null) {
                count += this.countAllTests(value);
            }
        }
        return count;
    }

    async generateReport() {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            summary: this.generateSummary(),
            results: this.results
        };

        // Write JSON report
        await fs.writeFile(
            `${this.config.outputDir}/test-report-${timestamp.split('T')[0]}.json`,
            JSON.stringify(report, null, 2)
        );

        // Write HTML report
        const htmlReport = this.generateHTMLReport(report);
        await fs.writeFile(
            `${this.config.outputDir}/test-report-${timestamp.split('T')[0]}.html`,
            htmlReport
        );

        console.log('\n' + '='.repeat(80));
        console.log('📊 ENHANCED UI TESTING AGENT SUMMARY');
        console.log('='.repeat(80));
        console.log(this.generateConsoleSummary());
        console.log('='.repeat(80));
    }

    generateSummary() {
        const totalPages = this.results.length;
        const totalScore = this.results.reduce((sum, result) => sum + (result.overallScore || 0), 0);
        const averageScore = Math.round(totalScore / totalPages);
        
        return {
            totalPages,
            averageScore,
            highestScore: Math.max(...this.results.map(r => r.overallScore || 0)),
            lowestScore: Math.min(...this.results.map(r => r.overallScore || 0))
        };
    }

    generateConsoleSummary() {
        const summary = this.generateSummary();
        let output = `\n🎯 Average Score: ${summary.averageScore}%\n`;
        output += `📈 Highest Score: ${summary.highestScore}% | 📉 Lowest Score: ${summary.lowestScore}%\n\n`;
        
        this.results.forEach(result => {
            const status = result.overallScore >= 80 ? '🟢' : result.overallScore >= 60 ? '🟡' : '🔴';
            output += `${status} ${result.page}: ${result.overallScore}%\n`;
        });

        return output;
    }

    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Testing Report - ${report.timestamp.split('T')[0]}</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 40px; background: #f5f5f5; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .page-result { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .page-header { padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .page-content { padding: 20px; }
        .test-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
        .test-category { border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; }
        .test-item { display: flex; justify-content: space-between; align-items: center; margin: 5px 0; }
        .pass { color: #10b981; font-weight: bold; }
        .fail { color: #ef4444; font-weight: bold; }
        .score { font-size: 2em; font-weight: bold; color: #667eea; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Enhanced UI Testing Report</h1>
        <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <div class="score">${report.summary.averageScore}%</div>
            <div>Average Score</div>
        </div>
        <div class="summary-card">
            <div class="score">${report.summary.totalPages}</div>
            <div>Pages Tested</div>
        </div>
        <div class="summary-card">
            <div class="score">${report.summary.highestScore}%</div>
            <div>Highest Score</div>
        </div>
        <div class="summary-card">
            <div class="score">${report.summary.lowestScore}%</div>
            <div>Lowest Score</div>
        </div>
    </div>

    ${report.results.map(result => `
        <div class="page-result">
            <div class="page-header">
                <h2>${result.page} - ${result.overallScore}%</h2>
                <p>${result.url}</p>
            </div>
            <div class="page-content">
                <div class="test-grid">
                    ${this.generateTestCategoryHTML('Basic Structure', result.tests, ['scrollProgress', 'enhancedHeader', 'servicesDropdown', 'activeNav', 'hasTitle', 'hasMetaDescription', 'hasH1', 'uniqueH1'])}
                    ${result.tests.hasLang ? this.generateTestCategoryHTML('Accessibility', result.tests, ['hasLang', 'imagesHaveAlt', 'linksHaveText', 'headingHierarchy', 'colorContrast', 'focusable', 'skipLinks']) : ''}
                    ${result.tests.fastLoad ? this.generateTestCategoryHTML('Performance', result.tests, ['fastLoad', 'fastDOMLoad', 'reasonableResourceCount']) : ''}
                    ${result.tests.titleLength ? this.generateTestCategoryHTML('SEO', result.tests, ['titleLength', 'descriptionLength', 'h1HasKeywords', 'hasStructuredData', 'hasOpenGraph', 'hasTwitterCard']) : ''}
                </div>
            </div>
        </div>
    `).join('')}

</body>
</html>`;
    }

    generateTestCategoryHTML(category, tests, testKeys) {
        const categoryTests = testKeys.filter(key => tests[key] !== undefined);
        if (categoryTests.length === 0) return '';
        
        return `
        <div class="test-category">
            <h4>${category}</h4>
            ${categoryTests.map(key => `
                <div class="test-item">
                    <span>${key}</span>
                    <span class="${tests[key] === true ? 'pass' : 'fail'}">${tests[key] === true ? '✅' : '❌'}</span>
                </div>
            `).join('')}
        </div>`;
    }
}

// Export for use as module or run directly
if (require.main === module) {
    const agent = new EnhancedUITestingAgent({
        headless: false,
        generateScreenshots: true,
        outputDir: './enhanced-test-results'
    });
    
    agent.runAllTests().catch(console.error);
}

module.exports = EnhancedUITestingAgent;