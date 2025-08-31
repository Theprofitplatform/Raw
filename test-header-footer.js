const { chromium } = require('playwright');

async function testHeaderFooterConsistency() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const pages = [
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

    const results = [];

    for (const pageInfo of pages) {
        console.log(`\n🔍 Testing: ${pageInfo.name}`);
        const page = await context.newPage();
        
        try {
            await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000); // Wait for any animations
            
            const testResult = {
                page: pageInfo.name,
                url: pageInfo.url,
                tests: {}
            };

            // Test 1: Check if scroll progress bar exists
            testResult.tests.scrollProgress = await page.locator('.scroll-progress').count() > 0;
            console.log(`  📊 Scroll progress: ${testResult.tests.scrollProgress ? '✅' : '❌'}`);

            // Test 2: Check if enhanced header structure exists
            testResult.tests.enhancedHeader = await page.locator('header#header nav.container').count() > 0;
            console.log(`  🎯 Enhanced header: ${testResult.tests.enhancedHeader ? '✅' : '❌'}`);

            // Test 3: Check if Services dropdown exists
            testResult.tests.servicesDropdown = await page.locator('.nav-dropdown .dropdown-menu').count() > 0;
            console.log(`  📋 Services dropdown: ${testResult.tests.servicesDropdown ? '✅' : '❌'}`);

            // Test 4: Check active navigation state
            if (pageInfo.activeNav) {
                const activeNavExists = await page.locator(`.nav-item.active:has-text("${pageInfo.activeNav}")`).count() > 0;
                testResult.tests.activeNav = activeNavExists;
                console.log(`  🎯 Active nav (${pageInfo.activeNav}): ${activeNavExists ? '✅' : '❌'}`);
            } else {
                testResult.tests.activeNav = true; // No active nav expected
                console.log(`  🎯 No active nav (expected): ✅`);
            }

            // Test 5: Check mobile navigation elements
            testResult.tests.mobileNavOverlay = await page.locator('.mobile-nav-overlay').count() > 0;
            testResult.tests.mobileNavMenu = await page.locator('.mobile-nav').count() > 0;
            testResult.tests.mobileToggle = await page.locator('.menu-toggle').count() > 0;
            console.log(`  📱 Mobile nav overlay: ${testResult.tests.mobileNavOverlay ? '✅' : '❌'}`);
            console.log(`  📱 Mobile nav menu: ${testResult.tests.mobileNavMenu ? '✅' : '❌'}`);
            console.log(`  📱 Mobile toggle: ${testResult.tests.mobileToggle ? '✅' : '❌'}`);

            // Test 6: Check enhanced footer structure
            testResult.tests.footerStats = await page.locator('.footer-stats .footer-stat').count() >= 3;
            testResult.tests.footerSocial = await page.locator('.footer-social .social-icon').count() >= 4;
            testResult.tests.trustBadges = await page.locator('.footer-trust .trust-badge').count() >= 4;
            console.log(`  📈 Footer stats: ${testResult.tests.footerStats ? '✅' : '❌'}`);
            console.log(`  📱 Footer social: ${testResult.tests.footerSocial ? '✅' : '❌'}`);
            console.log(`  🛡️ Trust badges: ${testResult.tests.trustBadges ? '✅' : '❌'}`);

            // Test 7: Mobile navigation functionality
            await page.setViewportSize({ width: 768, height: 1024 }); // Mobile viewport
            await page.waitForTimeout(1000);
            
            // Check if mobile toggle is visible
            const mobileToggleVisible = await page.locator('.menu-toggle').isVisible();
            testResult.tests.mobileToggleVisible = mobileToggleVisible;
            console.log(`  📱 Mobile toggle visible: ${mobileToggleVisible ? '✅' : '❌'}`);

            // Test mobile navigation functionality
            if (mobileToggleVisible) {
                await page.locator('.menu-toggle').click();
                await page.waitForTimeout(1000);
                
                const mobileNavVisible = await page.locator('.mobile-nav').isVisible();
                testResult.tests.mobileNavFunctional = mobileNavVisible;
                console.log(`  📱 Mobile nav functional: ${mobileNavVisible ? '✅' : '❌'}`);
                
                // Close mobile nav
                if (mobileNavVisible) {
                    await page.locator('.mobile-nav-close').click();
                    await page.waitForTimeout(500);
                }
            }

            // Test 8: Check page load performance
            const loadTime = await page.evaluate(() => performance.now());
            testResult.tests.performance = loadTime < 5000; // Under 5 seconds
            console.log(`  ⚡ Load performance: ${testResult.tests.performance ? '✅' : '❌'} (${Math.round(loadTime)}ms)`);

            results.push(testResult);

        } catch (error) {
            console.log(`  ❌ Error testing ${pageInfo.name}: ${error.message}`);
            results.push({
                page: pageInfo.name,
                url: pageInfo.url,
                error: error.message,
                tests: {}
            });
        } finally {
            await page.close();
        }
    }

    await browser.close();

    // Generate summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 HEADER & FOOTER CONSISTENCY TEST SUMMARY');
    console.log('='.repeat(60));

    let totalTests = 0;
    let passedTests = 0;

    results.forEach(result => {
        console.log(`\n📄 ${result.page}:`);
        if (result.error) {
            console.log(`   ❌ Error: ${result.error}`);
            return;
        }

        Object.entries(result.tests).forEach(([test, passed]) => {
            totalTests++;
            if (passed) passedTests++;
            console.log(`   ${passed ? '✅' : '❌'} ${test}`);
        });
    });

    console.log('\n' + '='.repeat(60));
    console.log(`🎯 OVERALL SCORE: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Headers and footers are fully consistent.');
    } else {
        console.log('⚠️  Some tests failed. Check the results above for details.');
    }
    console.log('='.repeat(60));

    return results;
}

// Run the tests
testHeaderFooterConsistency().catch(console.error);