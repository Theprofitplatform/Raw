const { chromium } = require('playwright');

async function testNavigationAlignment() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    
    const viewports = [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Laptop', width: 1366, height: 768 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Mobile Landscape', width: 667, height: 375 }
    ];

    console.log('🔍 Testing Navigation Alignment Across Viewports...\n');
    
    for (const viewport of viewports) {
        const page = await context.newPage();
        await page.setViewportSize(viewport);
        
        console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        try {
            await page.goto('file:///' + __dirname + '/index.html', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            await page.waitForSelector('header', { timeout: 5000 });
            
            const navigationTests = await page.evaluate(() => {
                const results = {};
                
                const header = document.querySelector('header');
                const navContainer = document.querySelector('.nav-floating-container');
                const container = document.querySelector('.nav-floating-container .container');
                const logo = document.querySelector('.logo');
                const navLinks = document.querySelector('.nav-links');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (header) {
                    const headerRect = header.getBoundingClientRect();
                    results.headerPosition = {
                        left: headerRect.left,
                        right: headerRect.right,
                        width: headerRect.width,
                        isFullWidth: Math.abs(headerRect.width - window.innerWidth) < 1
                    };
                }
                
                if (navContainer) {
                    const navRect = navContainer.getBoundingClientRect();
                    const windowWidth = window.innerWidth;
                    const expectedMargin = 20;
                    
                    results.navContainer = {
                        left: navRect.left,
                        right: navRect.right,
                        width: navRect.width,
                        centerOffset: Math.abs((navRect.left + navRect.width / 2) - (windowWidth / 2)),
                        isCentered: Math.abs((navRect.left + navRect.width / 2) - (windowWidth / 2)) < 5,
                        hasProperMargins: navRect.left >= expectedMargin && (windowWidth - navRect.right) >= expectedMargin
                    };
                }
                
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    results.innerContainer = {
                        left: containerRect.left,
                        width: containerRect.width,
                        maxWidth: window.getComputedStyle(container).maxWidth
                    };
                }
                
                if (logo) {
                    const logoRect = logo.getBoundingClientRect();
                    results.logo = {
                        left: logoRect.left,
                        isVisible: logoRect.width > 0 && logoRect.height > 0,
                        hasProperSpacing: logoRect.left > 10
                    };
                }
                
                if (navLinks) {
                    const navLinksStyle = window.getComputedStyle(navLinks);
                    results.navLinks = {
                        display: navLinksStyle.display,
                        isVisible: navLinksStyle.display !== 'none'
                    };
                }
                
                if (menuToggle) {
                    const menuToggleStyle = window.getComputedStyle(menuToggle);
                    const menuToggleRect = menuToggle.getBoundingClientRect();
                    results.menuToggle = {
                        display: menuToggleStyle.display,
                        isVisible: menuToggleStyle.display !== 'none',
                        position: {
                            right: window.innerWidth - menuToggleRect.right,
                            isProperlyPositioned: (window.innerWidth - menuToggleRect.right) < 40
                        }
                    };
                }
                
                results.isMobileView = window.innerWidth <= 768;
                results.windowWidth = window.innerWidth;
                
                return results;
            });
            
            const isMobile = viewport.width <= 768;
            let passed = true;
            const issues = [];
            
            if (navigationTests.navContainer) {
                if (!navigationTests.navContainer.isCentered && navigationTests.navContainer.centerOffset > 20) {
                    issues.push(`   ⚠️  Navigation container is off-center by ${navigationTests.navContainer.centerOffset.toFixed(1)}px`);
                    passed = false;
                } else {
                    console.log(`   ✅ Navigation container is properly centered`);
                }
                
                if (!navigationTests.navContainer.hasProperMargins) {
                    issues.push(`   ⚠️  Navigation container doesn't have proper margins from edges`);
                    passed = false;
                } else {
                    console.log(`   ✅ Navigation has proper margins from viewport edges`);
                }
            }
            
            if (navigationTests.logo) {
                if (!navigationTests.logo.isVisible) {
                    issues.push(`   ⚠️  Logo is not visible`);
                    passed = false;
                } else if (!navigationTests.logo.hasProperSpacing) {
                    issues.push(`   ⚠️  Logo is too close to the edge`);
                    passed = false;
                } else {
                    console.log(`   ✅ Logo is properly positioned and visible`);
                }
            }
            
            if (isMobile) {
                if (!navigationTests.menuToggle || !navigationTests.menuToggle.isVisible) {
                    issues.push(`   ⚠️  Mobile menu toggle is not visible`);
                    passed = false;
                } else if (!navigationTests.menuToggle.position.isProperlyPositioned) {
                    issues.push(`   ⚠️  Mobile menu toggle is not properly positioned on the right`);
                    passed = false;
                } else {
                    console.log(`   ✅ Mobile menu toggle is properly positioned`);
                }
                
                if (navigationTests.navLinks && navigationTests.navLinks.isVisible) {
                    issues.push(`   ⚠️  Desktop nav links should be hidden on mobile`);
                    passed = false;
                } else {
                    console.log(`   ✅ Desktop navigation is properly hidden on mobile`);
                }
            } else {
                if (navigationTests.navLinks && !navigationTests.navLinks.isVisible) {
                    issues.push(`   ⚠️  Navigation links should be visible on desktop`);
                    passed = false;
                } else {
                    console.log(`   ✅ Navigation links are visible on desktop`);
                }
            }
            
            if (issues.length > 0) {
                console.log('   Issues found:');
                issues.forEach(issue => console.log(issue));
            }
            
            if (passed) {
                console.log(`   ✨ ${viewport.name} viewport: PASSED\n`);
            } else {
                console.log(`   ❌ ${viewport.name} viewport: FAILED\n`);
            }
            
            if (viewport.name === 'Mobile') {
                console.log('   📸 Testing mobile menu functionality...');
                const menuToggle = await page.$('.menu-toggle');
                if (menuToggle) {
                    await menuToggle.click();
                    await page.waitForTimeout(500);
                    
                    const mobileNavVisible = await page.evaluate(() => {
                        const mobileNav = document.querySelector('.mobile-nav');
                        const overlay = document.querySelector('.mobile-nav-overlay');
                        return {
                            navActive: mobileNav && mobileNav.classList.contains('active'),
                            overlayActive: overlay && overlay.classList.contains('active')
                        };
                    });
                    
                    if (mobileNavVisible.navActive && mobileNavVisible.overlayActive) {
                        console.log('   ✅ Mobile menu opens correctly');
                    } else {
                        console.log('   ⚠️  Mobile menu did not open properly');
                    }
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Error testing ${viewport.name}: ${error.message}\n`);
        }
        
        await page.close();
    }
    
    await browser.close();
    console.log('✅ Navigation alignment testing complete!');
}

testNavigationAlignment().catch(console.error);