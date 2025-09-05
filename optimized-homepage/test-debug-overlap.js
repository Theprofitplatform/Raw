const { chromium } = require('playwright');

(async () => {
    console.log('🔍 Debugging Success Section Overlap Issue\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100 
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
    });
    
    const page = await context.newPage();
    
    try {
        await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/final website.html');
        await page.waitForTimeout(1000);
        
        // Scroll to section
        await page.evaluate(() => {
            document.querySelector('#results').scrollIntoView({ block: 'start', behavior: 'instant' });
        });
        await page.waitForTimeout(500);
        
        // Get all relevant computed styles and positions
        const debugInfo = await page.evaluate(() => {
            const container = document.querySelector('.results .container');
            const header = document.querySelector('.results .section-header');
            const subtitle = document.querySelector('.results .section-subtitle');
            const grid = document.querySelector('.success-cards-grid');
            const firstCard = document.querySelector('.success-card');
            
            const getFullStyles = (el, name) => {
                if (!el) return { name, error: 'Element not found' };
                
                const rect = el.getBoundingClientRect();
                const styles = window.getComputedStyle(el);
                
                return {
                    name,
                    position: {
                        top: rect.top,
                        height: rect.height,
                        bottom: rect.top + rect.height
                    },
                    styles: {
                        display: styles.display,
                        position: styles.position,
                        transform: styles.transform,
                        marginTop: styles.marginTop,
                        marginBottom: styles.marginBottom,
                        paddingTop: styles.paddingTop,
                        paddingBottom: styles.paddingBottom,
                        gap: styles.gap,
                        zIndex: styles.zIndex,
                        flexDirection: styles.flexDirection
                    }
                };
            };
            
            return {
                container: getFullStyles(container, 'Container'),
                header: getFullStyles(header, 'Header'),
                subtitle: getFullStyles(subtitle, 'Subtitle'),
                grid: getFullStyles(grid, 'Grid'),
                firstCard: getFullStyles(firstCard, 'First Card')
            };
        });
        
        // Print analysis
        console.log('📊 Element Analysis:');
        console.log('═'.repeat(50));
        
        for (const [key, data] of Object.entries(debugInfo)) {
            console.log(`\n${data.name}:`);
            console.log(`  Position: top=${data.position?.top?.toFixed(1)}, height=${data.position?.height?.toFixed(1)}`);
            console.log(`  Display: ${data.styles?.display}`);
            console.log(`  Position type: ${data.styles?.position}`);
            console.log(`  Transform: ${data.styles?.transform}`);
            console.log(`  Margins: top=${data.styles?.marginTop}, bottom=${data.styles?.marginBottom}`);
            console.log(`  Padding: top=${data.styles?.paddingTop}, bottom=${data.styles?.paddingBottom}`);
            if (data.styles?.gap) {
                console.log(`  Gap: ${data.styles.gap}`);
            }
        }
        
        // Calculate actual spacing
        console.log('\n📐 Spacing Analysis:');
        console.log('═'.repeat(50));
        
        if (debugInfo.header && debugInfo.grid) {
            const headerBottom = debugInfo.header.position.bottom;
            const gridTop = debugInfo.grid.position.top;
            const spacing = gridTop - headerBottom;
            console.log(`Header bottom → Grid top: ${spacing.toFixed(1)}px`);
        }
        
        if (debugInfo.subtitle && debugInfo.firstCard) {
            const subtitleBottom = debugInfo.subtitle.position.bottom;
            const cardTop = debugInfo.firstCard.position.top;
            const spacing = cardTop - subtitleBottom;
            console.log(`Subtitle bottom → Card top: ${spacing.toFixed(1)}px`);
            
            if (spacing < 0) {
                console.log('⚠️  OVERLAP DETECTED! Card is positioned above subtitle.');
            }
        }
        
        // Check if flexbox is working
        if (debugInfo.container?.styles?.display === 'flex') {
            console.log('\n✅ Container is using flexbox');
            console.log(`  Flex direction: ${debugInfo.container.styles.flexDirection}`);
            console.log(`  Gap value: ${debugInfo.container.styles.gap}`);
        } else {
            console.log('\n❌ Container is NOT using flexbox!');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
})();