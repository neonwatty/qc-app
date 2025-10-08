import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.type(), msg.text());
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  // Capture network errors
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // Take a screenshot
    await page.screenshot({ path: '/tmp/app-screenshot.png' });
    console.log('Screenshot saved to /tmp/app-screenshot.png');

    // Get page content
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('BODY HTML:', bodyHTML.substring(0, 500));

  } catch (error) {
    console.log('NAVIGATION ERROR:', error.message);
  }

  await browser.close();
})();
