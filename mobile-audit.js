const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  // Capture console errors
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
    
    // Wait a bit for all resources to load
    await page.waitForTimeout(3000);
    
    // === HOMEPAGE ANALYSIS ===
    console.log('📱 HOMEPAGE ANALYSIS:');
    await page.screenshot({ path: 'audit-homepage.png', fullPage: false });
    
    const homeMetrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const body = document.body;
      const main = document.querySelector('main');
      const hero = document.querySelector('section');
      const content = document.querySelector('section .max-w-lg, section .max-w-4xl');
      
      return {
        viewport,
        bodyWidth: body.offsetWidth,
        mainWidth: main ? main.offsetWidth : 0,
        mainPaddingLeft: main ? window.getComputedStyle(main).paddingLeft : '0px',
        heroWidth: hero ? hero.offsetWidth : 0,
        heroPaddingLeft: hero ? window.getComputedStyle(hero).paddingLeft : '0px',
        contentWidth: content ? content.offsetWidth : 0,
        contentMaxWidth: content ? window.getComputedStyle(content).maxWidth : 'none',
        // Check for horizontal overflow
        bodyScrollWidth: body.scrollWidth,
        hasHorizontalScroll: body.scrollWidth > viewport.width,
        // Content utilization
        contentUtilization: content ? Math.round((content.offsetWidth / viewport.width) * 100) : 0
      };
    });
    
    console.log('  Viewport:', homeMetrics.viewport);
    console.log('  Body width:', homeMetrics.bodyWidth);
    console.log('  Main container width:', homeMetrics.mainWidth);
    console.log('  Main padding-left:', homeMetrics.mainPaddingLeft);
    console.log('  Hero width:', homeMetrics.heroWidth);
    console.log('  Hero padding-left:', homeMetrics.heroPaddingLeft);
    console.log('  Content width:', homeMetrics.contentWidth);
    console.log('  Content max-width:', homeMetrics.contentMaxWidth);
    console.log('  Content utilization:', homeMetrics.contentUtilization + '%');
    console.log('  Has horizontal scroll:', homeMetrics.hasHorizontalScroll);
    
    // === DASHBOARD ANALYSIS ===
    console.log('\n📱 DASHBOARD ANALYSIS:');
    await page.click('a[href="/dashboard"], text=Dashboard');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'audit-dashboard.png', fullPage: false });
    
    const dashMetrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const cards = document.querySelectorAll('[class*="bg-white"], [class*="bg-card"]');
      const grid = document.querySelector('[class*="grid"]');
      
      return {
        cardCount: cards.length,
        gridWidth: grid ? grid.offsetWidth : 0,
        cardWidths: Array.from(cards).slice(0, 3).map(card => card.offsetWidth),
        contentUtilization: grid ? Math.round((grid.offsetWidth / viewport.width) * 100) : 0
      };
    });
    
    console.log('  Card count:', dashMetrics.cardCount);
    console.log('  Grid width:', dashMetrics.gridWidth);
    console.log('  Sample card widths:', dashMetrics.cardWidths);
    console.log('  Content utilization:', dashMetrics.contentUtilization + '%');
    
    // === NOTES ANALYSIS ===
    console.log('\n📱 NOTES ANALYSIS:');
    await page.click('a[href="/notes"], text=Notes');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'audit-notes.png', fullPage: false });
    
    const notesMetrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const container = document.querySelector('main');
      const noteCards = document.querySelectorAll('[class*="bg-white"], [class*="bg-card"]');
      
      return {
        containerWidth: container ? container.offsetWidth : 0,
        noteCardCount: noteCards.length,
        noteCardWidths: Array.from(noteCards).slice(0, 2).map(card => card.offsetWidth),
        contentUtilization: container ? Math.round((container.offsetWidth / viewport.width) * 100) : 0
      };
    });
    
    console.log('  Container width:', notesMetrics.containerWidth);
    console.log('  Note card count:', notesMetrics.noteCardCount);
    console.log('  Note card widths:', notesMetrics.noteCardWidths);
    console.log('  Content utilization:', notesMetrics.contentUtilization + '%');
    
    // === CHECK-IN ANALYSIS ===
    console.log('\n📱 CHECK-IN ANALYSIS:');
    await page.click('a[href="/checkin"], text=Check-in');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'audit-checkin.png', fullPage: false });
    
    const checkinMetrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const container = document.querySelector('main');
      const buttons = document.querySelectorAll('button');
      
      return {
        containerWidth: container ? container.offsetWidth : 0,
        buttonCount: buttons.length,
        buttonWidths: Array.from(buttons).slice(0, 2).map(btn => btn.offsetWidth),
        contentUtilization: container ? Math.round((container.offsetWidth / viewport.width) * 100) : 0
      };
    });
    
    console.log('  Container width:', checkinMetrics.containerWidth);
    console.log('  Button count:', checkinMetrics.buttonCount);
    console.log('  Button widths:', checkinMetrics.buttonWidths);
    console.log('  Content utilization:', checkinMetrics.contentUtilization + '%');
    
    // === GROWTH ANALYSIS ===
    console.log('\n📱 GROWTH ANALYSIS:');
    await page.click('a[href="/growth"], text=Growth');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'audit-growth.png', fullPage: false });
    
    const growthMetrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const container = document.querySelector('main');
      
      return {
        containerWidth: container ? container.offsetWidth : 0,
        contentUtilization: container ? Math.round((container.offsetWidth / viewport.width) * 100) : 0
      };
    });
    
    console.log('  Container width:', growthMetrics.containerWidth);
    console.log('  Content utilization:', growthMetrics.contentUtilization + '%');
    
    // === ERROR ANALYSIS ===
    console.log('\n🚨 ERROR ANALYSIS:');
    console.log('Console Errors:', consoleErrors.length);
    consoleErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    
    console.log('\nNetwork Errors:', networkErrors.length);
    networkErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    
    // === DETAILED LAYOUT ANALYSIS ===
    console.log('\n🔍 DETAILED LAYOUT ANALYSIS:');
    await page.goto('https://neonwatty.github.io/qc-app/', { waitUntil: 'networkidle' });
    
    const detailedAnalysis = await page.evaluate(() => {
      const body = document.body;
      const mainContainer = document.querySelector('.flex.min-h-screen');
      const contentArea = document.querySelector('.flex-1.lg\\:ml-64');
      const mainElement = document.querySelector('main');
      const heroSection = document.querySelector('section');
      const heroContent = document.querySelector('section > div');
      
      const getStyles = (element) => {
        if (!element) return {};
        const styles = window.getComputedStyle(element);
        return {
          width: element.offsetWidth,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          marginLeft: styles.marginLeft,
          marginRight: styles.marginRight,
          maxWidth: styles.maxWidth
        };
      };
      
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        body: getStyles(body),
        mainContainer: getStyles(mainContainer),
        contentArea: getStyles(contentArea),
        mainElement: getStyles(mainElement),
        heroSection: getStyles(heroSection),
        heroContent: getStyles(heroContent)
      };
    });
    
    console.log('Layout Breakdown:');
    Object.entries(detailedAnalysis).forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });
    
    // === RESPONSIVE BREAKPOINT TEST ===
    console.log('\n📏 RESPONSIVE BREAKPOINT TEST:');
    const breakpoints = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 }
    ];
    
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(500);
      
      const metrics = await page.evaluate(() => {
        const main = document.querySelector('main');
        const hero = document.querySelector('section');
        const content = hero?.querySelector('div');
        
        return {
          mainWidth: main ? main.offsetWidth : 0,
          heroWidth: hero ? hero.offsetWidth : 0,
          contentWidth: content ? content.offsetWidth : 0,
          utilization: content ? Math.round((content.offsetWidth / window.innerWidth) * 100) : 0
        };
      });
      
      console.log(`  ${bp.name} (${bp.width}x${bp.height}):`, metrics);
    }
    
    console.log('\n=== AUDIT COMPLETE ===');
    
  } catch (error) {
    console.error('Error during audit:', error.message);
  }
  
  await browser.close();
})();