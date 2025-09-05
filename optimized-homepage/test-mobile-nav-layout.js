const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const page = await browser.newPage();
    
    // Test mobile viewport sizes
    const viewports = [
        { name: 'iPhone 12', width: 390, height: 844 },
        { name: 'iPhone SE', width: 375, height: 667 },
        { name: 'Galaxy S20', width: 360, height: 800 },
        { name: 'iPad Mini', width: 768, height: 1024 }
    ];
    
    console.log('🔍 Testing Mobile Navigation Layout...\n');
    
    for (const viewport of viewports) {
        console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        await page.setViewportSize(viewport);
        
        // Load the page
        await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/index.html');
        await page.waitForLoadState('networkidle');
        
        // Check if hamburger menu is visible
        const hamburgerVisible = await page.isVisible('.menu-toggle');
        console.log(`   ✓ Hamburger visible: ${hamburgerVisible}`);
        
        if (hamburgerVisible) {
            // Get positions of logo and hamburger
            const logoBox = await page.locator('.logo, .premium-logo').first().boundingBox();
            const hamburgerBox = await page.locator('.menu-toggle').boundingBox();
            
            if (logoBox && hamburgerBox) {
                // Check if they're on the same line (similar Y position)
                const yDifference = Math.abs(logoBox.y - hamburgerBox.y);
                const onSameLine = yDifference < 10; // Allow 10px tolerance
                
                console.log(`   📍 Logo position: x=${logoBox.x.toFixed(0)}, y=${logoBox.y.toFixed(0)}`);
                console.log(`   📍 Hamburger position: x=${hamburgerBox.x.toFixed(0)}, y=${hamburgerBox.y.toFixed(0)}`);
                console.log(`   ${onSameLine ? '✅' : '❌'} On same line: ${onSameLine} (Y difference: ${yDifference.toFixed(0)}px)`);
                
                // Check horizontal spacing
                const horizontalGap = hamburgerBox.x - (logoBox.x + logoBox.width);
                console.log(`   📏 Horizontal gap: ${horizontalGap.toFixed(0)}px`);
                
                // Check container width usage
                const container = await page.locator('header .container, .premium-nav .container').first().boundingBox();
                if (container) {
                    const totalWidth = (hamburgerBox.x + hamburgerBox.width) - logoBox.x;
                    const containerUsage = (totalWidth / container.width) * 100;
                    console.log(`   📊 Container usage: ${containerUsage.toFixed(0)}% of ${container.width}px`);
                }
                
                // Get computed styles for debugging
                const navStyles = await page.evaluate(() => {
                    const nav = document.querySelector('nav, .premium-nav .container');
                    const logo = document.querySelector('.logo, .premium-logo');
                    const hamburger = document.querySelector('.menu-toggle');
                    
                    if (!nav || !logo || !hamburger) return null;
                    
                    const navComputed = window.getComputedStyle(nav);
                    const logoComputed = window.getComputedStyle(logo);
                    const hamburgerComputed = window.getComputedStyle(hamburger);
                    
                    return {
                        nav: {
                            display: navComputed.display,
                            flexDirection: navComputed.flexDirection,
                            justifyContent: navComputed.justifyContent,
                            alignItems: navComputed.alignItems,
                            flexWrap: navComputed.flexWrap,
                            width: navComputed.width,
                            padding: navComputed.padding
                        },
                        logo: {
                            display: logoComputed.display,
                            flex: logoComputed.flex,
                            flexShrink: logoComputed.flexShrink,
                            width: logoComputed.width,
                            minWidth: logoComputed.minWidth,
                            margin: logoComputed.margin
                        },
                        hamburger: {
                            display: hamburgerComputed.display,
                            flex: hamburgerComputed.flex,
                            flexShrink: hamburgerComputed.flexShrink,
                            width: hamburgerComputed.width,
                            minWidth: hamburgerComputed.minWidth,
                            margin: hamburgerComputed.margin,
                            marginLeft: hamburgerComputed.marginLeft
                        }
                    };
                });
                
                if (navStyles) {
                    console.log('\n   🎨 Computed Styles:');
                    console.log('   Nav Container:', JSON.stringify(navStyles.nav, null, 2).replace(/\n/g, '\n   '));
                    console.log('   Logo:', JSON.stringify(navStyles.logo, null, 2).replace(/\n/g, '\n   '));
                    console.log('   Hamburger:', JSON.stringify(navStyles.hamburger, null, 2).replace(/\n/g, '\n   '));
                }
                
                if (!onSameLine) {
                    console.log('\n   ⚠️  ISSUE DETECTED: Hamburger menu is on a different line!');
                    
                    // Take a screenshot for debugging
                    await page.screenshot({ 
                        path: `test-results/mobile-nav-issue-${viewport.name.replace(/ /g, '-')}.png`,
                        fullPage: false 
                    });
                }
            }
        }
        
        console.log('');
    }
    
    await browser.close();
    console.log('✅ Mobile Navigation Layout Test Complete!');
})();