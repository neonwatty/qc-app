import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

const PROTECTED_LAYOUT_PATH = './src/layouts/ProtectedLayout.tsx';

const pages = [
  { name: 'Home Page', path: '/', description: 'Landing page with hero section and feature grid', protected: false },
  { name: 'Onboarding', path: '/onboarding', description: 'User onboarding flow', protected: false },
  { name: 'Dashboard', path: '/dashboard', description: 'Main dashboard with stats and overview', protected: true },
  { name: 'Check-In', path: '/checkin', description: 'Relationship check-in session', protected: true },
  { name: 'Notes', path: '/notes', description: 'Private and shared notes management', protected: true },
  { name: 'Growth Gallery', path: '/growth', description: 'Milestones and progress tracking', protected: true },
  { name: 'Reminders', path: '/reminders', description: 'Reminder notifications management', protected: true },
  { name: 'Requests', path: '/requests', description: 'Relationship requests and to-dos', protected: true },
  { name: 'Settings', path: '/settings', description: 'App settings and preferences', protected: true },
  { name: 'Love Languages', path: '/love-languages', description: 'Love languages overview', protected: true },
  { name: 'Love Language Actions', path: '/love-languages/actions', description: 'Love language action items', protected: true },
];

const screenshots = [];

(async () => {
  console.log('📸 Starting storyboard creation (bypassing auth)...\n');

  // Backup original ProtectedLayout
  const originalContent = readFileSync(PROTECTED_LAYOUT_PATH, 'utf-8');

  // Create modified version without redirect
  const modifiedContent = originalContent.replace(
    /\/\/ Redirect to home if not authenticated[\s\S]*?return <Navigate to="\/"/,
    '// Redirect to home if not authenticated (DISABLED FOR SCREENSHOTS)\n  if (false) {\n    return <Navigate to="/"'
  );

  try {
    // Write modified version
    writeFileSync(PROTECTED_LAYOUT_PATH, modifiedContent);
    console.log('✅ Temporarily disabled auth redirect\n');

    // Wait a moment for Vite to rebuild
    await new Promise(resolve => setTimeout(resolve, 3000));

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    for (const pageInfo of pages) {
      try {
        console.log(`📸 Capturing: ${pageInfo.name} (${pageInfo.path})`);

        await page.goto(`http://localhost:5173${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });

        // Wait for content to render
        await page.waitForTimeout(2000);

        const filename = `screenshot-${pageInfo.path.replace(/\//g, '-') || 'home'}.png`;
        const filepath = `/tmp/${filename}`;

        await page.screenshot({
          path: filepath,
          fullPage: false
        });

        screenshots.push({
          ...pageInfo,
          filename,
          filepath
        });

        console.log(`   ✅ Saved to ${filepath}\n`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        screenshots.push({
          ...pageInfo,
          error: error.message
        });
      }
    }

    await browser.close();

  } finally {
    // Restore original ProtectedLayout
    writeFileSync(PROTECTED_LAYOUT_PATH, originalContent);
    console.log('✅ Restored original ProtectedLayout\n');
  }

  // Generate HTML storyboard (same as before)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QC App - Complete Storyboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; background: #f8f9fa; }
    .header { background: linear-gradient(135deg, #f43f5e, #ec4899, #fb923c); color: white; padding: 3rem 2rem; text-align: center; }
    .header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .header p { font-size: 1.1rem; opacity: 0.95; }
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .tech-stack { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .tech-stack h2 { color: #f43f5e; margin-bottom: 1rem; font-size: 1.5rem; }
    .tech-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .tech-item { padding: 0.75rem 1rem; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #f43f5e; }
    .tech-item strong { color: #f43f5e; display: block; margin-bottom: 0.25rem; }
    .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); gap: 2rem; margin-top: 2rem; }
    .page-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
    .page-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .page-card.protected { border: 2px solid #fda4af; }
    .page-header { padding: 1.5rem; background: linear-gradient(135deg, #fff1f2, #fce7f3); border-bottom: 2px solid #fda4af; }
    .page-header.protected { background: linear-gradient(135deg, #ffe4e6, #fecdd3); }
    .page-header h3 { font-size: 1.3rem; color: #be123c; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem; }
    .lock-icon { display: inline-block; font-size: 0.9rem; }
    .page-path { font-family: 'Courier New', monospace; color: #f43f5e; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .page-description { color: #64748b; font-size: 0.95rem; }
    .screenshot-container { position: relative; background: #f1f5f9; border: 1px solid #e2e8f0; }
    .screenshot-container img { width: 100%; height: auto; display: block; }
    .error-message { padding: 2rem; text-align: center; color: #dc2626; background: #fef2f2; }
    .footer { margin-top: 4rem; padding: 2rem; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0; }
    @media (max-width: 768px) { .page-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Quality Control App</h1>
    <p>Full-Stack Storyboard - Complete Walkthrough</p>
  </div>

  <div class="container">
    <div class="tech-stack">
      <h2>🛠 Tech Stack</h2>
      <div class="tech-grid">
        <div class="tech-item"><strong>Frontend</strong>React 19 + Vite 7 + TypeScript</div>
        <div class="tech-item"><strong>Styling</strong>Tailwind CSS v4 + Framer Motion</div>
        <div class="tech-item"><strong>State</strong>Redux Toolkit + React Context</div>
        <div class="tech-item"><strong>Routing</strong>React Router v6</div>
        <div class="tech-item"><strong>UI Library</strong>shadcn/ui + Radix UI</div>
        <div class="tech-item"><strong>Backend</strong>Ruby on Rails 8.0.2.1</div>
        <div class="tech-item"><strong>Database</strong>PostgreSQL</div>
        <div class="tech-item"><strong>Auth</strong>Devise + JWT</div>
      </div>
    </div>

    <h2 style="font-size: 2rem; margin: 2rem 0 1rem; color: #1a1a1a;">📱 App Pages</h2>

    <div class="page-grid">
      ${screenshots.map(page => `
        <div class="page-card ${page.protected ? 'protected' : ''}">
          <div class="page-header ${page.protected ? 'protected' : ''}">
            <h3>
              ${page.protected ? '<span class="lock-icon">🔒</span>' : ''}
              ${page.name}
            </h3>
            <div class="page-path">${page.path}</div>
            <div class="page-description">${page.description}</div>
          </div>
          <div class="screenshot-container">
            ${page.error
              ? `<div class="error-message">❌ ${page.error}</div>`
              : `<img src="file://${page.filepath}" alt="${page.name} screenshot" />`
            }
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p style="margin-top: 0.5rem;">Quality Control - Relationship Check-in App</p>
  </div>
</body>
</html>`;

  const htmlPath = '/tmp/qc-app-storyboard-complete.html';
  writeFileSync(htmlPath, html);

  console.log('✅ Storyboard created successfully!');
  console.log(`📄 HTML file: ${htmlPath}`);
  console.log(`\nOpen in browser: open ${htmlPath}`);
})();
