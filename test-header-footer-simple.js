const { chromium } = require('playwright');

async function testHeaderFooterConsistency() {
    const browser = await chromium.launch({ headless: true });
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
    console.log('🚀 Starting Header & Footer Consistency Tests...\n');

    for (const pageInfo of pages) {
        console.log(`🔍 Testing: ${pageInfo.name}`);
        const page = await context.newPage();
        
        try {
            await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 15000 });
            await page.waitForTimeout(1000);
            
            const testResult = {
                page: pageInfo.name,
                url: pageInfo.url,
                tests: {},
                passed: 0,
                total: 0
            };

            // Test 1: Enhanced header structure
            testResult.tests.enhancedHeader = await page.locator('header#header nav.container').count() > 0;
            testResult.total++;
            if (testResult.tests.enhancedHeader) testResult.passed++;
            console.log(`  🎯 Enhanced header: ${testResult.tests.enhancedHeader ? '✅' : '❌'}`);

            // Test 2: Services dropdown exists
            testResult.tests.servicesDropdown = await page.locator('.nav-dropdown .dropdown-menu').count() > 0;
            testResult.total++;
            if (testResult.tests.servicesDropdown) testResult.passed++;
            console.log(`  📋 Services dropdown: ${testResult.tests.servicesDropdown ? '✅' : '❌'}`);

            // Test 3: Logo in header
            testResult.tests.logo = await page.locator('header .logo img').count() > 0;
            testResult.total++;
            if (testResult.tests.logo) testResult.passed++;
            console.log(`  🏷️ Header logo: ${testResult.tests.logo ? '✅' : '❌'}`);

            // Test 4: Active navigation state
            if (pageInfo.activeNav) {
                const activeNavExists = await page.locator(`.nav-item.active:has-text("${pageInfo.activeNav}")`).count() > 0;
                testResult.tests.activeNav = activeNavExists;
                testResult.total++;
                if (activeNavExists) testResult.passed++;
                console.log(`  🎯 Active nav (${pageInfo.activeNav}): ${activeNavExists ? '✅' : '❌'}`);
            } else {
                testResult.tests.activeNav = true;
                console.log(`  🎯 No active nav (expected): ✅`);
            }

            // Test 5: Mobile navigation elements
            testResult.tests.mobileNavOverlay = await page.locator('.mobile-nav-overlay').count() > 0;
            testResult.tests.mobileNavMenu = await page.locator('.mobile-nav').count() > 0;
            testResult.tests.mobileToggle = await page.locator('.menu-toggle').count() > 0;
            testResult.total += 3;
            if (testResult.tests.mobileNavOverlay) testResult.passed++;
            if (testResult.tests.mobileNavMenu) testResult.passed++;
            if (testResult.tests.mobileToggle) testResult.passed++;
            console.log(`  📱 Mobile elements: ${[testResult.tests.mobileNavOverlay, testResult.tests.mobileNavMenu, testResult.tests.mobileToggle].filter(Boolean).length}/3 ✅`);

            // Test 6: Footer structure
            testResult.tests.footerColumns = await page.locator('footer .footer-column').count() >= 3;
            testResult.tests.footerSocial = await page.locator('.footer-social .social-icon').count() >= 4;
            testResult.tests.footerBottom = await page.locator('.footer-bottom').count() > 0;
            testResult.total += 3;
            if (testResult.tests.footerColumns) testResult.passed++;
            if (testResult.tests.footerSocial) testResult.passed++;
            if (testResult.tests.footerBottom) testResult.passed++;
            console.log(`  🦶 Footer structure: ${[testResult.tests.footerColumns, testResult.tests.footerSocial, testResult.tests.footerBottom].filter(Boolean).length}/3 ✅`);

            // Test 7: CTA buttons
            testResult.tests.headerCTA = await page.locator('header .btn').count() > 0;
            testResult.total++;
            if (testResult.tests.headerCTA) testResult.passed++;
            console.log(`  🎬 Header CTA: ${testResult.tests.headerCTA ? '✅' : '❌'}`);

            // Test 8: Mobile viewport test
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.waitForTimeout(500);
            
            const mobileToggleVisible = await page.locator('.menu-toggle').isVisible();
            testResult.tests.mobileResponsive = mobileToggleVisible;
            testResult.total++;
            if (mobileToggleVisible) testResult.passed++;
            console.log(`  📱 Mobile responsive: ${mobileToggleVisible ? '✅' : '❌'}`);

            results.push(testResult);
            
            const percentage = Math.round((testResult.passed / testResult.total) * 100);
            console.log(`  📊 Score: ${testResult.passed}/${testResult.total} (${percentage}%)\n`);

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}\n`);
            results.push({
                page: pageInfo.name,
                url: pageInfo.url,
                error: error.message,
                passed: 0,
                total: 1
            });
        } finally {
            await page.close();
        }
    }

    await browser.close();

    // Generate summary report
    console.log('='.repeat(70));
    console.log('📊 HEADER & FOOTER CONSISTENCY TEST SUMMARY');
    console.log('='.repeat(70));

    let totalTests = 0;
    let passedTests = 0;
    let pagesPassed = 0;

    results.forEach(result => {
        const percentage = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 0;
        const status = percentage >= 90 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
        
        console.log(`${status} ${result.page}: ${result.passed}/${result.total} (${percentage}%)`);
        
        if (result.error) {
            console.log(`    Error: ${result.error}`);
        }
        
        totalTests += result.total;
        passedTests += result.passed;
        if (percentage >= 90) pagesPassed++;
    });

    const overallPercentage = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(70));
    console.log(`🎯 OVERALL RESULTS:`);
    console.log(`   Pages: ${pagesPassed}/${results.length} pages passed (≥90%)`);
    console.log(`   Tests: ${passedTests}/${totalTests} individual tests passed`);
    console.log(`   Score: ${overallPercentage}% overall success rate`);
    
    if (overallPercentage >= 95) {
        console.log('🎉 EXCELLENT! Headers and footers are highly consistent across all pages.');
    } else if (overallPercentage >= 85) {
        console.log('✅ GOOD! Most pages have consistent headers and footers.');
    } else if (overallPercentage >= 70) {
        console.log('⚠️ FAIR! Some inconsistencies found. Review failed tests.');
    } else {
        console.log('❌ NEEDS WORK! Many inconsistencies found. Major fixes needed.');
    }
    
    console.log('='.repeat(70));
    return results;
}

testHeaderFooterConsistency().catch(console.error);