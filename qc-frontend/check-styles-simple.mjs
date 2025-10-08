import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
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
      paddingTop: styles.paddingTop,
      backgroundImage: styles.backgroundImage,
    };
  });

  console.log('\n=== Hero Section Styles ===');
  console.log(JSON.stringify(heroStyles, null, 2));

  // Check for gradient background divs
  const gradientBgs = await page.evaluate(() => {
    const gradientDiv1 = document.querySelector('.gradient-blush');
    const gradientDiv2 = document.querySelector('[class*="bg-gradient-to-br"]');
    return {
      gradientBlush: gradientDiv1 ? {
        className: gradientDiv1.className,
        background: window.getComputedStyle(gradientDiv1).background,
        opacity: window.getComputedStyle(gradientDiv1).opacity
      } : null,
      gradientToBr: gradientDiv2 ? {
        className: gradientDiv2.className,
        backgroundImage: window.getComputedStyle(gradientDiv2).backgroundImage
      } : null
    };
  });

  console.log('\n=== Gradient Background Divs ===');
  console.log(JSON.stringify(gradientBgs, null, 2));

  // Check text gradient on h1
  const h1Styles = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return null;
    const span = h1.querySelector('span');
    if (!span) return null;
    const styles = window.getComputedStyle(span);
    return {
      className: span.className,
      backgroundImage: styles.backgroundImage,
      backgroundClip: styles.backgroundClip,
      webkitBackgroundClip: styles.webkitBackgroundClip,
      webkitTextFillColor: styles.webkitTextFillColor,
      color: styles.color
    };
  });

  console.log('\n=== H1 Span (Text Gradient) Styles ===');
  console.log(JSON.stringify(h1Styles, null, 2));

  // Check if Tailwind classes are applied
  const tailwindCheck = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return null;
    const styles = window.getComputedStyle(h1);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      marginBottom: styles.marginBottom
    };
  });

  console.log('\n=== Tailwind H1 Styles ===');
  console.log(JSON.stringify(tailwindCheck, null, 2));

  await browser.close();
})();
