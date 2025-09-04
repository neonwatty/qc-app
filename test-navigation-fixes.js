const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log('Testing Navigation Fixes...\n');
  
  // Start at homepage
  console.log('1. Loading homepage...');
  await page.goto('http://localhost:3010');
  await page.waitForLoadState('networkidle');
  
  // Test navigation to each page and check if content loads immediately
  const testPages = [
    { path: '/notes', name: 'Notes' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/checkin', name: 'Check-in' },
    { path: '/growth', name: 'Growth' },
    { path: '/settings', name: 'Settings' }
  ];
  
  for (const testPage of testPages) {
    console.log(`\n2. Testing navigation to ${testPage.name} (${testPage.path})...`);
    
    // Navigate to page
    await page.goto(`http://localhost:3010${testPage.path}`);
    
    // Wait a short time for any animations
    await page.waitForTimeout(100);
    
    // Check if main content is visible immediately (without waiting for networkidle)
    const contentCheck = await page.evaluate(() => {
      const mainElement = document.querySelector('main');
      const contentElements = document.querySelectorAll('h1, h2, h3, p, button, div[class*="grid"], div[class*="space-y"]');
      
      let visibleContent = 0;
      let totalContent = contentElements.length;
      
      contentElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        if (styles.opacity !== '0' && 
            styles.visibility !== 'hidden' && 
            styles.display !== 'none' &&
            rect.width > 0 && 
            rect.height > 0) {
          visibleContent++;
        }
      });
      
      return {
        totalContent,
        visibleContent,
        visibilityRatio: totalContent > 0 ? (visibleContent / totalContent) : 0,
        mainExists: !!mainElement,
        bodyOpacity: window.getComputedStyle(document.body).opacity
      };
    });
    
    console.log(`   Content visibility: ${contentCheck.visibleContent}/${contentCheck.totalContent} elements visible`);
    console.log(`   Visibility ratio: ${(contentCheck.visibilityRatio * 100).toFixed(1)}%`);
    console.log(`   Main element exists: ${contentCheck.mainExists}`);
    console.log(`   Body opacity: ${contentCheck.bodyOpacity}`);
    
    // Take screenshot to verify content is visible
    await page.screenshot({ path: `nav-test-${testPage.name.toLowerCase()}.png` });
    
    // Check for any elements that might be animating in
    const animatingElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let animatingCount = 0;
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.opacity === '0' && el.style.transform) {
          animatingCount++;
        }
      });
      
      return animatingCount;
    });
    
    console.log(`   Elements still animating: ${animatingElements}`);
    
    if (contentCheck.visibilityRatio >= 0.8) {
      console.log(`   ✅ ${testPage.name} loads content immediately`);
    } else {
      console.log(`   ⚠️  ${testPage.name} may have content loading issues`);
    }
  }
  
  // Test navigation between pages quickly
  console.log('\n3. Testing rapid navigation between pages...');
  for (let i = 0; i < testPages.length; i++) {
    const currentPage = testPages[i];
    const nextPage = testPages[(i + 1) % testPages.length];
    
    await page.goto(`http://localhost:3010${currentPage.path}`);
    await page.waitForTimeout(50); // Very short wait
    
    const quickCheck = await page.evaluate(() => {
      const visibleElements = document.querySelectorAll('h1, h2, p');
      return Array.from(visibleElements).some(el => {
        const styles = window.getComputedStyle(el);
        return styles.opacity !== '0' && el.textContent.trim().length > 0;
      });
    });
    
    console.log(`   ${currentPage.name}: Content visible after 50ms = ${quickCheck}`);
  }
  
  await browser.close();
  console.log('\n✅ Navigation testing complete!');
})();