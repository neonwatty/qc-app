const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  // Capture console errors and network errors
  const consoleErrors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    console.log('=== MOBILE AUDIT FOR QC APP ===\n');
    await page.goto('https://neonwatty.github.io/qc-app/', { waitUntil: 'networkidle' });
    
    // Wait for everything to load
    await page.waitForTimeout(3000);
    
    // === HOMEPAGE ANALYSIS ===
    console.log('📱 HOMEPAGE ANALYSIS:');
    await page.screenshot({ path: 'audit-homepage.png', fullPage: true });
    
    const homeMetrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const body = document.body;
      const main = document.querySelector('main');
      const hero = document.querySelector('section');
      const heroContent = hero?.querySelector('div');
      
      // Get computed styles
      const mainStyles = main ? window.getComputedStyle(main) : null;
      const heroStyles = hero ? window.getComputedStyle(hero) : null;
      const heroContentStyles = heroContent ? window.getComputedStyle(heroContent) : null;
      
      return {
        viewport,
        bodyWidth: body.offsetWidth,
        mainWidth: main ? main.offsetWidth : 0,
        mainPadding: mainStyles ? `${mainStyles.paddingLeft} | ${mainStyles.paddingRight}` : 'N/A',
        heroWidth: hero ? hero.offsetWidth : 0,
        heroPadding: heroStyles ? `${heroStyles.paddingLeft} | ${heroStyles.paddingRight}` : 'N/A',
        heroContentWidth: heroContent ? heroContent.offsetWidth : 0,
        heroContentMaxWidth: heroContentStyles ? heroContentStyles.maxWidth : 'N/A',
        // Calculate actual usable space
        actualContentWidth: heroContent ? heroContent.offsetWidth : (main ? main.offsetWidth : body.offsetWidth),
        screenUtilization: Math.round(((heroContent ? heroContent.offsetWidth : (main ? main.offsetWidth : body.offsetWidth)) / viewport.width) * 100),
        // Check for any overflow
        hasHorizontalScroll: body.scrollWidth > viewport.width,
        bodyScrollWidth: body.scrollWidth
      };
    });
    
    console.log('  Screen size:', homeMetrics.viewport);
    console.log('  Body width:', homeMetrics.bodyWidth + 'px');
    console.log('  Main container width:', homeMetrics.mainWidth + 'px');
    console.log('  Main padding (L|R):', homeMetrics.mainPadding);
    console.log('  Hero section width:', homeMetrics.heroWidth + 'px');
    console.log('  Hero padding (L|R):', homeMetrics.heroPadding);
    console.log('  Hero content width:', homeMetrics.heroContentWidth + 'px');
    console.log('  Hero content max-width:', homeMetrics.heroContentMaxWidth);
    console.log('  ACTUAL CONTENT WIDTH:', homeMetrics.actualContentWidth + 'px');
    console.log('  SCREEN UTILIZATION:', homeMetrics.screenUtilization + '%');
    console.log('  Has horizontal scroll:', homeMetrics.hasHorizontalScroll);
    
    // === NAVIGATION TEST ===
    console.log('\n🧭 NAVIGATION TEST:');
    const pages = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Notes', href: '/notes' },
      { name: 'Check-in', href: '/checkin' },
      { name: 'Growth', href: '/growth' }
    ];
    
    for (const pageInfo of pages) {
      try {
        await page.goto(`https://neonwatty.github.io/qc-app${pageInfo.href}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(1000);
        
        const metrics = await page.evaluate(() => {
          const main = document.querySelector('main');
          const firstCard = document.querySelector('[class*="bg-white"], [class*="bg-card"], .card');
          const container = document.querySelector('.container, [class*="max-w"]');
          
          return {
            mainWidth: main ? main.offsetWidth : 0,
            firstCardWidth: firstCard ? firstCard.offsetWidth : 0,
            containerWidth: container ? container.offsetWidth : 0,
            screenUtilization: main ? Math.round((main.offsetWidth / window.innerWidth) * 100) : 0
          };
        });
        
        await page.screenshot({ path: `audit-${pageInfo.name.toLowerCase()}.png`, fullPage: false });
        console.log(`  ${pageInfo.name}:`, metrics);
        
      } catch (error) {
        console.log(`  ${pageInfo.name}: Failed to load - ${error.message}`);
      }
    }
    
    // === ERROR ANALYSIS ===
    console.log('\n🚨 ERROR ANALYSIS:');
    console.log(`Console Errors Found: ${consoleErrors.length}`);
    consoleErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
    });
    
    console.log(`\nNetwork Errors Found: ${networkErrors.length}`);
    networkErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    
    // === DETAILED LAYOUT BREAKDOWN ===
    console.log('\n🔍 DETAILED LAYOUT BREAKDOWN:');
    await page.goto('https://neonwatty.github.io/qc-app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const layoutBreakdown = await page.evaluate(() => {
      const elements = {
        body: document.body,
        outerContainer: document.querySelector('.flex.min-h-screen'),
        contentArea: document.querySelector('.flex-1'),
        main: document.querySelector('main'),
        heroSection: document.querySelector('section'),
        heroContainer: document.querySelector('section > div'),
      };
      
      const analysis = {};
      
      Object.entries(elements).forEach(([name, element]) => {
        if (element) {
          const styles = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          
          analysis[name] = {
            width: element.offsetWidth,
            computedWidth: styles.width,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            marginLeft: styles.marginLeft,
            marginRight: styles.marginRight,
            maxWidth: styles.maxWidth,
            position: styles.position,
            rectWidth: Math.round(rect.width)
          };
        } else {
          analysis[name] = 'NOT FOUND';
        }
      });
      
      return analysis;
    });
    
    console.log('Layout Element Analysis:');
    Object.entries(layoutBreakdown).forEach(([element, data]) => {
      console.log(`  ${element}:`, data);
    });
    
    // === COMPARISON WITH EXPECTED VALUES ===
    console.log('\n📊 WIDTH ANALYSIS SUMMARY:');
    const expectedFullWidth = 375; // iPhone SE width
    const currentContentWidth = homeMetrics.actualContentWidth;
    const wastedSpace = expectedFullWidth - currentContentWidth;
    const wastedPercentage = Math.round((wastedSpace / expectedFullWidth) * 100);
    
    console.log(`  Device width: ${expectedFullWidth}px`);
    console.log(`  Actual content width: ${currentContentWidth}px`);
    console.log(`  Wasted horizontal space: ${wastedSpace}px (${wastedPercentage}%)`);
    console.log(`  Content utilization: ${100 - wastedPercentage}%`);
    
    if (wastedPercentage > 15) {
      console.log(`  ⚠️  WARNING: ${wastedPercentage}% of screen width is unused!`);
    }
    
    console.log('\n=== AUDIT COMPLETE ===');
    
  } catch (error) {
    console.error('Audit failed:', error.message);
  }
  
  await browser.close();
})();