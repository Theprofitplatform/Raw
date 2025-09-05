const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({width: 375, height: 667});
    await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/final website.html');
    await page.evaluate(() => document.querySelector('#results').scrollIntoView());
    await page.waitForTimeout(1000);
    
    const styles = await page.evaluate(() => {
        const container = document.querySelector('.results .container');
        const grid = document.querySelector('.success-cards-grid');
        const header = document.querySelector('.results .section-header');
        
        return {
            containerDisplay: window.getComputedStyle(container).display,
            containerGap: window.getComputedStyle(container).gap,
            headerMarginBottom: window.getComputedStyle(header).marginBottom,
            gridMarginTop: window.getComputedStyle(grid).marginTop,
            gridPaddingTop: window.getComputedStyle(grid).paddingTop,
            headerRect: header.getBoundingClientRect(),
            gridRect: grid.getBoundingClientRect()
        };
    });
    
    console.log('Container styles:', styles);
    console.log('Actual spacing:', styles.gridRect.top - (styles.headerRect.top + styles.headerRect.height));
    
    await browser.close();
})();