const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 300 
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing Complete Mobile Navigation Functionality...\n');
    
    // Test on iPhone 12 viewport
    const viewport = { name: 'iPhone 12', width: 390, height: 844 };
    console.log(`📱 Testing on ${viewport.name} (${viewport.width}x${viewport.height})\n`);
    await page.setViewportSize(viewport);
    
    // Load the page
    await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Test 1: Check hamburger and logo alignment
    console.log('✓ Test 1: Checking hamburger and logo alignment');
    const hamburgerVisible = await page.isVisible('.menu-toggle');
    console.log(`   Hamburger visible: ${hamburgerVisible}`);
    
    const logoBox = await page.locator('.logo, .premium-logo').first().boundingBox();
    const hamburgerBox = await page.locator('.menu-toggle').boundingBox();
    
    if (logoBox && hamburgerBox) {
        const yDifference = Math.abs(logoBox.y - hamburgerBox.y);
        const onSameLine = yDifference < 10;
        console.log(`   Logo Y: ${logoBox.y.toFixed(0)}, Hamburger Y: ${hamburgerBox.y.toFixed(0)}`);
        console.log(`   ${onSameLine ? '✅' : '❌'} Elements on same line (Y diff: ${yDifference.toFixed(0)}px)\n`);
        
        if (!onSameLine) {
            console.log('   ⚠️  FAILED: Hamburger not aligned with logo!');
            await page.screenshot({ path: 'test-results/alignment-issue.png' });
        }
    }
    
    // Test 2: Check hamburger menu click functionality
    console.log('✓ Test 2: Testing hamburger menu click');
    const hamburger = await page.locator('.menu-toggle');
    const mobileNav = await page.locator('.mobile-nav');
    const overlay = await page.locator('.mobile-nav-overlay');
    
    // Check initial state
    const initialNavVisible = await mobileNav.isVisible();
    console.log(`   Initial mobile nav visible: ${initialNavVisible}`);
    
    // Click hamburger
    await hamburger.click();
    await page.waitForTimeout(500);
    
    // Check if menu opened
    const navOpenVisible = await mobileNav.evaluate(el => {
        return el.classList.contains('active') || getComputedStyle(el).right === '0px';
    });
    const overlayActive = await overlay.evaluate(el => el.classList.contains('active'));
    
    console.log(`   After click - Menu active: ${navOpenVisible}`);
    console.log(`   After click - Overlay active: ${overlayActive}`);
    
    if (!navOpenVisible) {
        console.log('   ⚠️  FAILED: Mobile menu did not open!');
        await page.screenshot({ path: 'test-results/menu-not-opening.png' });
    } else {
        console.log('   ✅ Mobile menu opened successfully\n');
    }
    
    // Test 3: Check menu close functionality
    console.log('✓ Test 3: Testing menu close button');
    const closeButton = await page.locator('.mobile-nav-close');
    if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
        
        const navClosedVisible = await mobileNav.evaluate(el => {
            return !el.classList.contains('active') && getComputedStyle(el).right !== '0px';
        });
        
        console.log(`   After close - Menu closed: ${navClosedVisible}`);
        if (navClosedVisible) {
            console.log('   ✅ Mobile menu closed successfully\n');
        } else {
            console.log('   ⚠️  FAILED: Mobile menu did not close!\n');
        }
    }
    
    // Test 4: Check hamburger animation
    console.log('✓ Test 4: Testing hamburger animation');
    await hamburger.click();
    await page.waitForTimeout(300);
    
    const hamburgerActive = await hamburger.evaluate(el => el.classList.contains('active'));
    console.log(`   Hamburger has active class: ${hamburgerActive}`);
    
    if (hamburgerActive) {
        // Check if spans are transformed
        const spansTransformed = await hamburger.evaluate(el => {
            const spans = el.querySelectorAll('span');
            if (spans.length !== 3) return false;
            
            const firstTransform = getComputedStyle(spans[0]).transform;
            const secondOpacity = getComputedStyle(spans[1]).opacity;
            const thirdTransform = getComputedStyle(spans[2]).transform;
            
            return firstTransform !== 'none' && secondOpacity === '0' && thirdTransform !== 'none';
        });
        
        console.log(`   Hamburger spans animated: ${spansTransformed}`);
        if (spansTransformed) {
            console.log('   ✅ Hamburger animation working\n');
        } else {
            console.log('   ⚠️  Hamburger animation not working properly\n');
        }
    }
    
    // Test 5: Check responsive behavior at different sizes
    console.log('✓ Test 5: Testing responsive behavior');
    const testSizes = [
        { width: 320, name: 'Small phone' },
        { width: 768, name: 'Tablet' },
        { width: 1024, name: 'Small desktop' }
    ];
    
    for (const size of testSizes) {
        await page.setViewportSize({ width: size.width, height: 800 });
        await page.waitForTimeout(300);
        
        const isHamburgerVisible = await hamburger.isVisible();
        const areNavLinksVisible = await page.locator('.nav-links').isVisible();
        
        console.log(`   ${size.name} (${size.width}px):`);
        console.log(`     Hamburger: ${isHamburgerVisible ? 'visible' : 'hidden'}`);
        console.log(`     Nav links: ${areNavLinksVisible ? 'visible' : 'hidden'}`);
        
        // At 768px and below, hamburger should be visible
        // Above 768px, nav links should be visible
        const correctBehavior = (size.width <= 768 && isHamburgerVisible && !areNavLinksVisible) ||
                               (size.width > 768 && !isHamburgerVisible && areNavLinksVisible);
        
        console.log(`     ${correctBehavior ? '✅' : '❌'} Correct responsive behavior`);
    }
    
    await browser.close();
    console.log('\n✅ Complete Mobile Navigation Test Finished!');
})();