const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false, // Run with browser visible to see what happens
    slowMo: 1000 // Slow down actions
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('🔍 Debugging Navigation Issues...\n');
  
  // Start at homepage
  console.log('1. Loading homepage...');
  await page.goto('http://localhost:3010', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Take a screenshot of homepage
  await page.screenshot({ path: 'debug-homepage.png' });
  
  // Now navigate to /notes using the navigation link
  console.log('\n2. Clicking on Notes navigation link...');
  
  // Check if the notes link exists
  const notesLink = await page.locator('a[href="/notes"]').first();
  const linkExists = await notesLink.count() > 0;
  console.log(`Notes link exists: ${linkExists}`);
  
  if (linkExists) {
    // Click the notes link
    await notesLink.click();
    console.log('Clicked Notes link');
    
    // Wait a moment and check what happens
    await page.waitForTimeout(1000);
    
    // Check URL
    const currentURL = page.url();
    console.log(`Current URL after click: ${currentURL}`);
    
    // Check if content is visible
    const contentCheck = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const mainContent = document.querySelector('main');
      const allText = document.body.textContent || '';
      
      return {
        h1Text: h1 ? h1.textContent : 'No H1 found',
        h1Visible: h1 ? window.getComputedStyle(h1).opacity : 'No H1',
        mainExists: !!mainContent,
        bodyHasContent: allText.length > 100,
        bodyOpacity: window.getComputedStyle(document.body).opacity,
        documentReadyState: document.readyState,
        hasNotesText: allText.includes('Notes') || allText.includes('notes')
      };
    });
    
    console.log('Content check after navigation:');
    console.log('  H1 text:', contentCheck.h1Text);
    console.log('  H1 visible:', contentCheck.h1Visible);
    console.log('  Main exists:', contentCheck.mainExists);
    console.log('  Body has content:', contentCheck.bodyHasContent);
    console.log('  Body opacity:', contentCheck.bodyOpacity);
    console.log('  Document ready state:', contentCheck.documentReadyState);
    console.log('  Has notes text:', contentCheck.hasNotesText);
    
    // Take screenshot after navigation
    await page.screenshot({ path: 'debug-notes-after-click.png' });
    
    // Wait a bit more and check again
    console.log('\n3. Waiting 3 seconds to see if content appears...');
    await page.waitForTimeout(3000);
    
    const contentCheckAfterWait = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const notesCards = document.querySelectorAll('[class*="grid"] > div, .bg-white');
      const allText = document.body.textContent || '';
      
      return {
        h1Text: h1 ? h1.textContent : 'No H1 found',
        h1Visible: h1 ? window.getComputedStyle(h1).opacity : 'No H1',
        cardsFound: notesCards.length,
        bodyContent: allText.substring(0, 200),
        hasSearchBox: !!document.querySelector('input[placeholder*="Search"]'),
        hasButtons: document.querySelectorAll('button').length
      };
    });
    
    console.log('Content check after 3 second wait:');
    console.log('  H1 text:', contentCheckAfterWait.h1Text);
    console.log('  H1 visible:', contentCheckAfterWait.h1Visible);
    console.log('  Cards found:', contentCheckAfterWait.cardsFound);
    console.log('  Has search box:', contentCheckAfterWait.hasSearchBox);
    console.log('  Buttons count:', contentCheckAfterWait.hasButtons);
    console.log('  Body content preview:', contentCheckAfterWait.bodyContent);
    
    await page.screenshot({ path: 'debug-notes-after-wait.png' });
    
    // Now try refreshing the page
    console.log('\n4. Refreshing the page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const contentAfterRefresh = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const allText = document.body.textContent || '';
      
      return {
        h1Text: h1 ? h1.textContent : 'No H1 found',
        h1Visible: h1 ? window.getComputedStyle(h1).opacity : 'No H1',
        bodyContent: allText.substring(0, 200),
        hasNotesContent: allText.includes('Keep track of your thoughts')
      };
    });
    
    console.log('Content check after refresh:');
    console.log('  H1 text:', contentAfterRefresh.h1Text);
    console.log('  H1 visible:', contentAfterRefresh.h1Visible);
    console.log('  Has notes content:', contentAfterRefresh.hasNotesContent);
    console.log('  Body content preview:', contentAfterRefresh.bodyContent);
    
    await page.screenshot({ path: 'debug-notes-after-refresh.png' });
  }
  
  await browser.close();
  console.log('\n🔍 Debug complete! Check the screenshots.');
})();