const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log('Testing Modern Dating App Theme...\n');
  
  // Test homepage with new design
  console.log('1. Testing Homepage with Modern Dating Theme...');
  await page.goto('http://localhost:3010');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'modern-dating-homepage.png', fullPage: true });
  
  // Check for modern color scheme
  const modernColors = await page.evaluate(() => {
    const root = document.documentElement;
    const styles = window.getComputedStyle(root);
    
    return {
      primary: styles.getPropertyValue('--primary'),
      secondary: styles.getPropertyValue('--secondary'),
      accent: styles.getPropertyValue('--accent'),
      coralPrimary: styles.getPropertyValue('--coral-primary'),
      peach: styles.getPropertyValue('--peach'),
      blush: styles.getPropertyValue('--blush'),
      roseGold: styles.getPropertyValue('--rose-gold')
    };
  });
  console.log('   Modern Color Variables:', modernColors);
  
  // Check gradient usage
  const gradientElements = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    let gradientCount = 0;
    let modernGradients = [];
    
    allElements.forEach((el) => {
      const classList = el.classList.toString();
      const styles = window.getComputedStyle(el);
      
      if (classList.includes('gradient-') || styles.backgroundImage.includes('gradient')) {
        gradientCount++;
        if (modernGradients.length < 5) {
          modernGradients.push({
            classes: classList.substring(0, 80),
            backgroundImage: styles.backgroundImage.substring(0, 100)
          });
        }
      }
    });
    
    return {
      totalGradients: gradientCount,
      samples: modernGradients
    };
  });
  console.log('   Gradient Elements:', gradientElements);
  
  // Test dashboard
  console.log('\n2. Testing Dashboard with Modern Theme...');
  await page.goto('http://localhost:3010/dashboard');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'modern-dating-dashboard.png', fullPage: true });
  
  // Check navigation styling
  const navStyling = await page.evaluate(() => {
    const navItems = document.querySelectorAll('nav a');
    const styles = [];
    
    navItems.forEach((item, index) => {
      if (index < 3) {
        const computedStyles = window.getComputedStyle(item);
        styles.push({
          text: item.textContent?.trim(),
          backgroundColor: computedStyles.backgroundColor,
          borderRadius: computedStyles.borderRadius,
          boxShadow: computedStyles.boxShadow,
          className: item.className.substring(0, 100)
        });
      }
    });
    
    return styles;
  });
  console.log('   Navigation Styling:', navStyling);
  
  // Test color contrast and readability
  const contrastCheck = await page.evaluate(() => {
    const textElements = document.querySelectorAll('h1, h2, p, button, a');
    let readabilityIssues = 0;
    const sampleElements = [];
    
    textElements.forEach((el, index) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (index < 5) {
        sampleElements.push({
          tag: el.tagName.toLowerCase(),
          color: color,
          backgroundColor: backgroundColor,
          text: el.textContent?.substring(0, 30)
        });
      }
    });
    
    return {
      totalTextElements: textElements.length,
      samples: sampleElements
    };
  });
  console.log('   Text Contrast Check:', contrastCheck);
  
  // Check for rose/coral theme consistency
  const themeConsistency = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    let roseElements = 0;
    let coralElements = 0;
    let peachElements = 0;
    
    allElements.forEach((el) => {
      const classList = el.classList.toString();
      if (classList.includes('rose-')) roseElements++;
      if (classList.includes('coral-')) coralElements++;
      if (classList.includes('peach-')) peachElements++;
    });
    
    return {
      roseElements,
      coralElements,  
      peachElements,
      totalElements: allElements.length
    };
  });
  console.log('   Theme Consistency:', themeConsistency);
  
  await browser.close();
  console.log('\n✅ Modern Dating App Theme testing complete!');
})();