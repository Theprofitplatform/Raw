const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const page = await browser.newPage();
    
    console.log('🚀 Starting homepage verification tests...\n');
    
    try {
        // Load the homepage
        await page.goto('file:///' + __dirname + '/index.html');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Page loaded successfully\n');
        
        // Test 1: Check hero title changes
        console.log('📋 Test 1: Verifying hero section content...');
        const heroTitle = await page.textContent('.hero-title-modern');
        
        if (heroTitle.includes('Double Your Revenue')) {
            console.log('✓ Hero title updated correctly: "Double Your Revenue"');
        } else {
            console.log('✗ Hero title not found or incorrect');
        }
        
        if (heroTitle.includes('In Just 60 Days')) {
            console.log('✓ Timeline updated: "In Just 60 Days"');
        } else {
            console.log('✗ Timeline not updated correctly');
        }
        
        if (heroTitle.includes("Sydney's Freshest Digital Growth Partner")) {
            console.log('✓ Tagline updated: "Sydney\'s Freshest Digital Growth Partner"');
        } else {
            console.log('✗ Tagline not updated correctly');
        }
        
        // Test 2: Check stats authenticity
        console.log('\n📋 Test 2: Verifying authentic stats...');
        const clientStat = await page.textContent('.stat-card-modern:nth-child(2) .stat-value');
        const clientLabel = await page.textContent('.stat-card-modern:nth-child(2) .stat-label');
        
        if (clientStat.includes('15')) {
            console.log('✓ Client count updated to realistic "15+"');
        } else {
            console.log('✗ Client count not updated: ' + clientStat);
        }
        
        if (clientLabel.includes('Sydney Clients')) {
            console.log('✓ Label updated to "Sydney Clients"');
        } else {
            console.log('✗ Label not updated: ' + clientLabel);
        }
        
        // Test 3: Check if trust signals section is removed
        console.log('\n📋 Test 3: Verifying trust signals removal...');
        const trustSection = await page.$('.trust-signals-ultra');
        if (!trustSection) {
            console.log('✓ Trust signals section successfully removed');
        } else {
            console.log('✗ Trust signals section still exists');
        }
        
        // Test 4: Check if Google Partner badge is hidden
        console.log('\n📋 Test 4: Verifying Google Partner badge removal...');
        const googlePartnerElements = await page.$$('img[alt="Google Partner"]');
        if (googlePartnerElements.length === 0) {
            console.log('✓ Google Partner badge removed from hero');
        } else {
            console.log('✗ Google Partner badge still visible');
        }
        
        // Test 5: Test mobile responsiveness
        console.log('\n📋 Test 5: Testing mobile responsiveness...');
        
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(1000);
        
        // Check if mobile navigation toggle is visible
        const mobileToggle = await page.isVisible('#menuToggle');
        console.log(mobileToggle ? '✓ Mobile menu toggle visible' : '✗ Mobile menu toggle not visible');
        
        // Check hero section on mobile
        const heroVisible = await page.isVisible('.hero-title-modern');
        console.log(heroVisible ? '✓ Hero section visible on mobile' : '✗ Hero section not visible on mobile');
        
        // Check stats cards on mobile
        const statsVisible = await page.isVisible('.hero-stats-modern');
        console.log(statsVisible ? '✓ Stats section visible on mobile' : '✗ Stats section not visible on mobile');
        
        // Test 6: Check navigation links
        console.log('\n📋 Test 6: Verifying navigation links...');
        
        // Return to desktop view
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);
        
        const servicesLink = await page.getAttribute('.nav-dropdown > a', 'href');
        const pricingLink = await page.getAttribute('a[href="pricing.html"]', 'href');
        const aboutLink = await page.getAttribute('a[href="about.html"]', 'href');
        
        console.log(servicesLink === 'services.html' ? '✓ Services link updated' : '✗ Services link not updated: ' + servicesLink);
        console.log(pricingLink === 'pricing.html' ? '✓ Pricing link correct' : '✗ Pricing link incorrect');
        console.log(aboutLink === 'about.html' ? '✓ About link correct' : '✗ About link incorrect');
        
        // Test 7: Performance metrics
        console.log('\n📋 Test 7: Checking performance metrics...');
        
        const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart
            };
        });
        
        console.log(`✓ DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
        console.log(`✓ Page Load Complete: ${metrics.loadComplete.toFixed(2)}ms`);
        
        // Test 8: Take screenshots for visual verification
        console.log('\n📋 Test 8: Taking screenshots...');
        
        // Desktop screenshot
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.screenshot({ 
            path: 'test-screenshots/homepage-desktop.png',
            fullPage: false 
        });
        console.log('✓ Desktop screenshot saved');
        
        // Mobile screenshot
        await page.setViewportSize({ width: 375, height: 812 });
        await page.screenshot({ 
            path: 'test-screenshots/homepage-mobile.png',
            fullPage: false 
        });
        console.log('✓ Mobile screenshot saved');
        
        console.log('\n✅ All tests completed successfully!');
        console.log('📸 Screenshots saved in test-screenshots/ directory');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        await browser.close();
        console.log('\n🔒 Browser closed');
    }
})();