const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to reminders page...');
  await page.goto('http://localhost:3000/reminders/');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Check for reminder elements
  const reminderCards = await page.locator('[class*="rounded-lg"][class*="shadow"]').count();
  console.log(`Found ${reminderCards} reminder cards on the page`);
  
  // Check console logs
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  // Get page title
  const title = await page.textContent('h1');
  console.log('Page title:', title);
  
  // Check for "No reminders found" message
  const noRemindersText = await page.locator('text=No reminders found').count();
  if (noRemindersText > 0) {
    console.log('Page shows "No reminders found"');
  }
  
  // Get all text content
  const bodyText = await page.textContent('body');
  if (bodyText.includes('Daily Love Affirmation')) {
    console.log('✓ Found reminder content!');
  } else {
    console.log('✗ No reminder content found');
  }
  
  // Take a screenshot
  await page.screenshot({ path: 'reminders-page.png' });
  console.log('Screenshot saved as reminders-page.png');
  
  await browser.close();
})();