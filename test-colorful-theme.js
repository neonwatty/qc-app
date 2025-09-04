const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log('Testing new colorful theme...\n');
  
  // Test homepage
  console.log('1. Testing Homepage...');
  await page.goto('http://localhost:3010');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'colorful-homepage.png', fullPage: true });
  
  // Check for gradient backgrounds
  const gradientCheck = await page.evaluate(() => {
    const body = document.body;
    const bodyClasses = body.className;
    const hasGradient = bodyClasses.includes('gradient') || bodyClasses.includes('from-') || bodyClasses.includes('to-');
    const bodyStyle = window.getComputedStyle(body);
    
    return {
      hasGradientClasses: hasGradient,
      backgroundColor: bodyStyle.backgroundColor,
      backgroundImage: bodyStyle.backgroundImage,
      bodyClasses: bodyClasses
    };
  });
  console.log('   Gradient check:', gradientCheck);
  
  // Check new color variables
  const colorVariables = await page.evaluate(() => {
    const root = document.documentElement;
    const styles = window.getComputedStyle(root);
    
    return {
      primary: styles.getPropertyValue('--primary'),
      secondary: styles.getPropertyValue('--secondary'),
      accent: styles.getPropertyValue('--accent'),
      background: styles.getPropertyValue('--background'),
      teal: styles.getPropertyValue('--teal'),
      coral: styles.getPropertyValue('--coral'),
      lavender: styles.getPropertyValue('--lavender')
    };
  });
  console.log('   Color variables:', colorVariables);
  
  // Test dashboard
  console.log('\n2. Testing Dashboard...');
  await page.goto('http://localhost:3010/dashboard');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'colorful-dashboard.png', fullPage: true });
  
  // Check navigation colors
  const navColors = await page.evaluate(() => {
    const navItems = document.querySelectorAll('nav a');
    const colors = [];
    navItems.forEach(item => {
      const styles = window.getComputedStyle(item);
      colors.push({
        text: item.textContent?.trim(),
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        className: item.className
      });
    });
    return colors;
  });
  console.log('   Navigation colors:', navColors.slice(0, 3));
  
  // Test check-in page
  console.log('\n3. Testing Check-in Page...');
  await page.goto('http://localhost:3010/checkin');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'colorful-checkin.png', fullPage: true });
  
  // Check for colorful elements
  const colorfulElements = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    let gradientCount = 0;
    let colorfulCount = 0;
    const sampleElements = [];
    
    allElements.forEach((el) => {
      const classList = el.classList.toString();
      const styles = window.getComputedStyle(el);
      
      if (classList.includes('gradient') || styles.backgroundImage.includes('gradient')) {
        gradientCount++;
        if (sampleElements.length < 3) {
          sampleElements.push({
            tag: el.tagName.toLowerCase(),
            classes: classList.substring(0, 100),
            backgroundImage: styles.backgroundImage.substring(0, 100)
          });
        }
      }
      
      if (classList.includes('purple') || classList.includes('pink') || 
          classList.includes('yellow') || classList.includes('teal') ||
          classList.includes('coral') || classList.includes('lavender')) {
        colorfulCount++;
      }
    });
    
    return {
      totalElements: allElements.length,
      gradientElements: gradientCount,
      colorfulElements: colorfulCount,
      samples: sampleElements
    };
  });
  console.log('   Colorful elements:', colorfulElements);
  
  await browser.close();
  console.log('\n✅ Theme testing complete! Check the screenshot files.');
})();