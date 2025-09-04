const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Loading site...');
    await page.goto('https://neonwatty.github.io/qc-app/', { waitUntil: 'networkidle' });
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'mobile-homepage.png', fullPage: true });
    console.log('Homepage screenshot saved as mobile-homepage.png');
    
    // Check dashboard
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'mobile-dashboard.png', fullPage: true });
    console.log('Dashboard screenshot saved as mobile-dashboard.png');
    
    // Check notes
    await page.click('text=Notes');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'mobile-notes.png', fullPage: true });
    console.log('Notes screenshot saved as mobile-notes.png');
    
    // Check layout metrics
    const layoutInfo = await page.evaluate(() => {
      const main = document.querySelector('main');
      const body = document.body;
      return {
        bodyWidth: body.offsetWidth,
        mainWidth: main ? main.offsetWidth : 0,
        mainPadding: main ? window.getComputedStyle(main).padding : '',
        bodyPadding: window.getComputedStyle(body).padding,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      };
    });
    
    console.log('Layout Info:', layoutInfo);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();