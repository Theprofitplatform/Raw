const { chromium } = require('playwright');

(async () => {
    console.log('🔍 Testing Success Section Mobile Layout...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100 
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE size
        deviceScaleFactor: 2,
    });
    
    const page = await context.newPage();
    
    try {
        // Load the page
        console.log('📱 Loading page in mobile view...');
        await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/final website.html');
        await page.waitForTimeout(1000);
        
        // Scroll to success section
        console.log('📍 Scrolling to success section...');
        await page.evaluate(() => {
            document.querySelector('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        await page.waitForTimeout(1500);
        
        // Check section header visibility and layout
        console.log('\n✨ Checking section header elements...');
        
        const sectionTag = await page.locator('.section-tag').first();
        const sectionTitle = await page.locator('.section-title').first();
        const sectionSubtitle = await page.locator('.section-subtitle').first();
        
        // Get bounding boxes
        const tagBox = await sectionTag.boundingBox();
        const titleBox = await sectionTitle.boundingBox();
        const subtitleBox = await sectionSubtitle.boundingBox();
        
        console.log(`  Tag position: top=${tagBox?.y}, height=${tagBox?.height}`);
        console.log(`  Title position: top=${titleBox?.y}, height=${titleBox?.height}`);
        console.log(`  Subtitle position: top=${subtitleBox?.y}, height=${subtitleBox?.height}`);
        
        // Check for overlaps
        if (tagBox && titleBox) {
            const tagBottom = tagBox.y + tagBox.height;
            const overlap = tagBottom > titleBox.y;
            if (overlap) {
                console.log('  ⚠️ WARNING: Tag overlaps with title!');
            } else {
                console.log('  ✅ Tag and title spacing OK');
            }
        }
        
        // Check first success card
        console.log('\n📊 Checking success cards...');
        const firstCard = await page.locator('.success-card').first();
        const cardBox = await firstCard.boundingBox();
        
        if (cardBox) {
            console.log(`  First card position: top=${cardBox.y}, height=${cardBox.height}`);
            
            // Check if card is too close to header
            if (subtitleBox && cardBox) {
                const subtitleBottom = subtitleBox.y + subtitleBox.height;
                const spacing = cardBox.y - subtitleBottom;
                console.log(`  Spacing between subtitle and card: ${spacing}px`);
                
                if (spacing < 20) {
                    console.log('  ⚠️ WARNING: Cards too close to header!');
                } else if (spacing > 100) {
                    console.log('  ⚠️ WARNING: Too much space before cards!');
                } else {
                    console.log('  ✅ Card spacing OK');
                }
            }
        }
        
        // Check text readability
        console.log('\n📖 Checking text readability...');
        const titleFontSize = await sectionTitle.evaluate(el => 
            window.getComputedStyle(el).fontSize
        );
        const subtitleFontSize = await sectionSubtitle.evaluate(el => 
            window.getComputedStyle(el).fontSize
        );
        
        console.log(`  Title font size: ${titleFontSize}`);
        console.log(`  Subtitle font size: ${subtitleFontSize}`);
        
        // Take screenshot
        console.log('\n📸 Taking screenshot...');
        await page.screenshot({ 
            path: 'success-section-mobile.png',
            fullPage: false
        });
        
        console.log('\n✅ Test complete! Check success-section-mobile.png');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
})();