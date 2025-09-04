const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Loading local dev server...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'mobile-homepage-fixed.png', fullPage: false });
    console.log('Homepage screenshot saved as mobile-homepage-fixed.png');
    
    // Check layout metrics
    const layoutInfo = await page.evaluate(() => {
      const main = document.querySelector('main');
      const body = document.body;
      const hero = document.querySelector('section');
      return {
        bodyWidth: body.offsetWidth,
        mainWidth: main ? main.offsetWidth : 0,
        heroWidth: hero ? hero.offsetWidth : 0,
        mainPadding: main ? window.getComputedStyle(main).paddingLeft : '',
        viewport: { width: window.innerWidth, height: window.innerHeight }
      };
    });
    
    console.log('Layout Info:', layoutInfo);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();