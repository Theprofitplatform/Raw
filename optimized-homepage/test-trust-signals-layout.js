const { chromium } = require('playwright');

(async () => {
    console.log('🎯 Testing Trust Signals Layout\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 50 
    });
    
    // Test configurations
    const viewports = [
        { name: 'Desktop', width: 1920, height: 1080, expectedLayout: 'horizontal' },
        { name: 'Laptop', width: 1366, height: 768, expectedLayout: 'horizontal' },
        { name: 'Tablet', width: 768, height: 1024, expectedLayout: 'grid' },
        { name: 'Mobile', width: 375, height: 667, expectedLayout: 'vertical' }
    ];
    
    for (const viewport of viewports) {
        console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        console.log('═'.repeat(60));
        
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: 1,
        });
        
        const page = await context.newPage();
        
        try {
            // Load the page
            await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/final website.html');
            await page.waitForTimeout(1000);
            
            // Scroll to trust signals section
            await page.evaluate(() => {
                const section = document.querySelector('.trust-signals-bar');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            await page.waitForTimeout(500);
            
            // Analyze trust signals layout
            const layoutData = await page.evaluate(() => {
                const grid = document.querySelector('.trust-signals-grid');
                const items = document.querySelectorAll('.trust-signal-item');
                const rating = document.querySelector('.trust-rating');
                
                if (!grid || items.length === 0) {
                    return { error: 'Trust signals not found' };
                }
                
                const gridStyles = window.getComputedStyle(grid);
                const firstItem = items[0];
                const itemStyles = window.getComputedStyle(firstItem);
                const ratingStyles = rating ? window.getComputedStyle(rating) : null;
                
                // Get positions of all items
                const itemPositions = Array.from(items).map(item => {
                    const rect = item.getBoundingClientRect();
                    const styles = window.getComputedStyle(item);
                    return {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        flexDirection: styles.flexDirection,
                        textAlign: styles.textAlign
                    };
                });
                
                // Check if items are in a horizontal line
                const uniqueTops = [...new Set(itemPositions.map(p => Math.round(p.top)))];
                const isHorizontal = uniqueTops.length <= 2; // Allow small variance for wrapped items
                
                // Check if items are in columns (grid)
                const uniqueLefts = [...new Set(itemPositions.map(p => Math.round(p.left)))];
                const columnsCount = uniqueLefts.length;
                
                return {
                    display: gridStyles.display,
                    gridTemplateColumns: gridStyles.gridTemplateColumns,
                    flexWrap: gridStyles.flexWrap,
                    gap: gridStyles.gap,
                    itemsCount: items.length,
                    firstItemFlexDirection: itemStyles.flexDirection,
                    ratingFlexDirection: ratingStyles?.flexDirection,
                    isHorizontal,
                    columnsCount,
                    uniqueTops: uniqueTops.length,
                    itemPositions: itemPositions.slice(0, 2) // Just first 2 for debugging
                };
            });
            
            // Display results
            console.log('\n📊 Layout Analysis:');
            console.log(`  Display: ${layoutData.display}`);
            console.log(`  Gap: ${layoutData.gap}`);
            console.log(`  Items: ${layoutData.itemsCount}`);
            console.log(`  Item flex-direction: ${layoutData.firstItemFlexDirection}`);
            console.log(`  Rating flex-direction: ${layoutData.ratingFlexDirection}`);
            
            // Determine actual layout
            let actualLayout;
            if (layoutData.display === 'flex' && layoutData.isHorizontal) {
                actualLayout = 'horizontal';
                console.log('  ✅ Layout: HORIZONTAL (all items on same line)');
            } else if (layoutData.display === 'grid' && layoutData.columnsCount === 2) {
                actualLayout = 'grid';
                console.log('  📋 Layout: GRID (2 columns)');
            } else if (layoutData.display === 'grid' && layoutData.columnsCount === 1) {
                actualLayout = 'vertical';
                console.log('  📦 Layout: VERTICAL (single column)');
            } else {
                actualLayout = 'unknown';
                console.log('  ❓ Layout: UNKNOWN');
            }
            
            // Verify against expected layout
            if (viewport.expectedLayout === 'horizontal' && actualLayout === 'horizontal') {
                console.log(`  ✅ PASS: Desktop/Laptop shows horizontal layout`);
            } else if (viewport.expectedLayout === 'grid' && actualLayout === 'grid') {
                console.log(`  ✅ PASS: Tablet shows 2-column grid`);
            } else if (viewport.expectedLayout === 'vertical' && actualLayout === 'vertical') {
                console.log(`  ✅ PASS: Mobile shows vertical layout`);
            } else {
                console.log(`  ❌ FAIL: Expected ${viewport.expectedLayout}, got ${actualLayout}`);
            }
            
            // Take screenshot
            await page.screenshot({ 
                path: `trust-signals-${viewport.name.toLowerCase()}.png`,
                clip: {
                    x: 0,
                    y: await page.evaluate(() => {
                        const section = document.querySelector('.trust-signals-bar');
                        return section ? section.getBoundingClientRect().top + window.scrollY - 20 : 0;
                    }),
                    width: viewport.width,
                    height: 200
                }
            });
            
        } catch (error) {
            console.error('❌ Test error:', error.message);
        } finally {
            await context.close();
        }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ All viewport tests completed! Check screenshots.');
    await browser.close();
})();