import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Wait a bit for any animations
  await page.waitForTimeout(2000);

  // Take a screenshot
  await page.screenshot({ path: '/tmp/homepage-full.png', fullPage: true });
  console.log('Screenshot saved to /tmp/homepage-full.png');

  // Check computed styles of key elements
  const heroStyles = await page.evaluate(() => {
    const hero = document.querySelector('section');
    if (!hero) return null;
    const styles = window.getComputedStyle(hero);
    return {
      minHeight: styles.minHeight,
      display: styles.display,
      background: styles.background,
      backgroundImage: styles.backgroundImage,
    };
  });

  console.log('\n=== Hero Section Styles ===');
  console.log(JSON.stringify(heroStyles, null, 2));

  // Check for gradient elements
  const gradients = await page.evaluate(() => {
    const gradientElements = document.querySelectorAll('[class*="gradient"]');
    return Array.from(gradientElements).map(el => ({
      className: el.className,
      computedBackground: window.getComputedStyle(el).background
    }));
  });

  console.log('\n=== Gradient Elements ===');
  console.log(JSON.stringify(gradients, null, 2));

  // Check text gradient classes
  const textGradients = await page.evaluate(() => {
    const elements = document.querySelectorAll('[class*="bg-gradient-to-r"]');
    return Array.from(elements).map(el => ({
      text: el.textContent?.substring(0, 50),
      className: el.className,
      backgroundImage: window.getComputedStyle(el).backgroundImage,
      backgroundClip: window.getComputedStyle(el).backgroundClip,
      webkitBackgroundClip: window.getComputedStyle(el).webkitBackgroundClip,
      color: window.getComputedStyle(el).color
    }));
  });

  console.log('\n=== Text Gradient Elements ===');
  console.log(JSON.stringify(textGradients, null, 2));

  // Check if Tailwind is working
  const tailwindCheck = await page.evaluate(() => {
    const testDiv = document.createElement('div');
    testDiv.className = 'text-4xl font-bold';
    document.body.appendChild(testDiv);
    const styles = window.getComputedStyle(testDiv);
    document.body.removeChild(testDiv);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight
    };
  });

  console.log('\n=== Tailwind Check ===');
  console.log(JSON.stringify(tailwindCheck, null, 2));

  // Keep browser open for manual inspection
  console.log('\nBrowser is open for manual inspection. Press Ctrl+C to close.');

  // Wait indefinitely
  await new Promise(() => {});
})();
