const { chromium } = require('playwright');

(async () => {
    console.log('🎯 Comprehensive Success Section Mobile Test\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 50 
    });
    
    const viewports = [
        { name: 'iPhone SE', width: 375, height: 667 },
        { name: 'iPhone 12', width: 390, height: 844 },
        { name: 'Samsung Galaxy', width: 360, height: 740 }
    ];
    
    for (const viewport of viewports) {
        console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
        console.log('═'.repeat(50));
        
        const context = await browser.newContext({
            viewport: viewport,
            deviceScaleFactor: 2,
        });
        
        const page = await context.newPage();
        
        try {
            await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/final website.html');
            await page.waitForTimeout(1500);
            
            // Scroll to success section smoothly
            await page.evaluate(() => {
                const section = document.querySelector('#results');
                if (section) {
                    const yOffset = -50;
                    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
            await page.waitForTimeout(1500);
            
            // Check layout metrics
            const metrics = await page.evaluate(() => {
                const header = document.querySelector('.results .section-header');
                const tag = document.querySelector('.results .section-tag');
                const title = document.querySelector('.results .section-title');
                const subtitle = document.querySelector('.results .section-subtitle');
                const grid = document.querySelector('.success-cards-grid');
                const firstCard = document.querySelector('.success-card');
                
                const getMetrics = (el) => {
                    if (!el) return null;
                    const rect = el.getBoundingClientRect();
                    const styles = window.getComputedStyle(el);
                    return {
                        top: rect.top,
                        height: rect.height,
                        marginTop: styles.marginTop,
                        marginBottom: styles.marginBottom,
                        paddingTop: styles.paddingTop,
                        paddingBottom: styles.paddingBottom,
                        fontSize: styles.fontSize
                    };
                };
                
                return {
                    header: getMetrics(header),
                    tag: getMetrics(tag),
                    title: getMetrics(title),
                    subtitle: getMetrics(subtitle),
                    grid: getMetrics(grid),
                    firstCard: getMetrics(firstCard)
                };
            });
            
            // Analyze spacing
            console.log('📊 Layout Analysis:');
            if (metrics.header && metrics.grid) {
                const headerBottom = metrics.header.top + metrics.header.height;
                const gridTop = metrics.grid.top;
                const spacing = gridTop - headerBottom;
                
                console.log(`  Header → Grid spacing: ${spacing.toFixed(1)}px`);
                if (spacing < 0) {
                    console.log('  ❌ OVERLAP DETECTED!');
                } else if (spacing < 10) {
                    console.log('  ⚠️  Spacing too tight');
                } else if (spacing > 60) {
                    console.log('  ⚠️  Excessive spacing');
                } else {
                    console.log('  ✅ Spacing optimal');
                }
            }
            
            if (metrics.grid && metrics.firstCard) {
                const gridPaddingTop = parseFloat(metrics.grid.paddingTop);
                const cardTop = metrics.firstCard.top - metrics.grid.top;
                console.log(`  Grid padding-top: ${gridPaddingTop}px`);
                console.log(`  Card offset in grid: ${cardTop.toFixed(1)}px`);
            }
            
            // Typography check
            console.log('\n📝 Typography:');
            console.log(`  Title: ${metrics.title?.fontSize}`);
            console.log(`  Subtitle: ${metrics.subtitle?.fontSize}`);
            
            // Take viewport-specific screenshot
            await page.screenshot({ 
                path: `success-section-${viewport.name.replace(/\s+/g, '-').toLowerCase()}.png`,
                fullPage: false
            });
            
        } catch (error) {
            console.error('❌ Test error:', error.message);
        } finally {
            await context.close();
        }
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('✅ All tests completed! Check screenshots.');
    await browser.close();
})();