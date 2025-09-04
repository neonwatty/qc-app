const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3010');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of homepage
  await page.screenshot({ path: 'homepage.png', fullPage: true });
  console.log('Homepage screenshot saved as homepage.png');
  
  // Check for styling issues
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize
    };
  });
  console.log('Body styles:', bodyStyles);
  
  // Check if Tailwind classes are applied
  const elementsWithTailwind = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    let tailwindCount = 0;
    let sampleClasses = [];
    
    allElements.forEach((el) => {
      const classList = el.classList.toString();
      if (classList && classList.includes('bg-') || classList.includes('text-') || 
          classList.includes('flex') || classList.includes('p-') || classList.includes('m-')) {
        tailwindCount++;
        if (sampleClasses.length < 5) {
          sampleClasses.push({
            tag: el.tagName.toLowerCase(),
            classes: classList
          });
        }
      }
    });
    
    return {
      totalElements: allElements.length,
      elementsWithTailwind: tailwindCount,
      sampleClasses
    };
  });
  console.log('Tailwind analysis:', elementsWithTailwind);
  
  // Check for CSS loading errors
  const cssFiles = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const styles = Array.from(document.querySelectorAll('style'));
    
    return {
      externalCSS: links.map(link => ({
        href: link.href,
        loaded: link.sheet !== null
      })),
      inlineStyles: styles.length,
      firstStyleContent: styles[0]?.textContent?.substring(0, 200)
    };
  });
  console.log('CSS Files:', cssFiles);
  
  // Navigate to different pages
  const pages = ['/dashboard', '/checkin', '/notes', '/growth', '/settings'];
  
  for (const pagePath of pages) {
    console.log(`\nNavigating to ${pagePath}...`);
    await page.goto(`http://localhost:3010${pagePath}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${pagePath.slice(1)}.png`, fullPage: true });
    console.log(`Screenshot saved as ${pagePath.slice(1)}.png`);
    
    // Check for specific styling on each page
    const pageStyles = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return null;
      const computed = window.getComputedStyle(main);
      return {
        padding: computed.padding,
        margin: computed.margin,
        display: computed.display
      };
    });
    console.log(`${pagePath} main styles:`, pageStyles);
  }
  
  await browser.close();
  console.log('\nExploration complete! Check the screenshots.');
})();