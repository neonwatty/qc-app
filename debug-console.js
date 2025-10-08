const { chromium } = require('./qc-frontend/node_modules/playwright');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function getTimestamp() {
  return new Date().toLocaleTimeString();
}

function formatLocation(location) {
  if (!location.url) return '';
  const file = location.url.split('/').pop();
  return `${colors.gray}[${file}:${location.lineNumber}:${location.columnNumber}]${colors.reset}`;
}

function formatMessage(msg) {
  const timestamp = `${colors.gray}[${getTimestamp()}]${colors.reset}`;
  const location = formatLocation(msg.location());
  const type = msg.type();
  let typeColor = colors.reset;
  let typePrefix = '';

  switch (type) {
    case 'error':
      typeColor = colors.red;
      typePrefix = 'ERROR';
      break;
    case 'warn':
    case 'warning':
      typeColor = colors.yellow;
      typePrefix = 'WARN';
      break;
    case 'info':
      typeColor = colors.cyan;
      typePrefix = 'INFO';
      break;
    case 'debug':
      typeColor = colors.magenta;
      typePrefix = 'DEBUG';
      break;
    case 'log':
    default:
      typeColor = colors.green;
      typePrefix = 'LOG';
      break;
  }

  return `${timestamp} ${typeColor}${colors.bold}[${typePrefix}]${colors.reset} ${location} ${msg.text()}`;
}

(async () => {
  console.log(`${colors.cyan}${colors.bold}Starting browser console monitor...${colors.reset}`);
  console.log(`${colors.gray}Navigating to http://localhost:5173${colors.reset}`);
  console.log(`${colors.gray}Press Ctrl+C to stop monitoring${colors.reset}\n`);

  const browser = await chromium.launch({
    headless: true // Set to false if you want to see the browser
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages
  page.on('console', msg => {
    console.log(formatMessage(msg));

    // For errors, also try to get the full arguments
    if (msg.type() === 'error') {
      const args = msg.args();
      if (args.length > 0) {
        console.log(`${colors.red}  Full error details:${colors.reset}`);
        args.forEach(async (arg) => {
          try {
            const value = await arg.jsonValue();
            console.log(`${colors.gray}  ${JSON.stringify(value, null, 2)}${colors.reset}`);
          } catch (e) {
            // Some values can't be serialized
            console.log(`${colors.gray}  [Unserializable value]${colors.reset}`);
          }
        });
      }
    }
  });

  // Capture uncaught exceptions
  page.on('pageerror', exception => {
    console.log(`${colors.red}${colors.bold}[UNCAUGHT EXCEPTION]${colors.reset} ${colors.red}${exception.message}${colors.reset}`);
    if (exception.stack) {
      console.log(`${colors.gray}Stack trace:${colors.reset}`);
      console.log(`${colors.gray}${exception.stack}${colors.reset}`);
    }
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    console.log(`${colors.red}${colors.bold}[REQUEST FAILED]${colors.reset} ${request.url()}`);
    const failure = request.failure();
    if (failure) {
      console.log(`${colors.red}  Reason: ${failure.errorText}${colors.reset}`);
    }
  });

  // Monitor response errors
  page.on('response', response => {
    if (response.status() >= 400) {
      const statusColor = response.status() >= 500 ? colors.red : colors.yellow;
      console.log(`${statusColor}${colors.bold}[HTTP ${response.status()}]${colors.reset} ${response.url()}`);
    }
  });

  try {
    // Navigate to the page
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`\n${colors.green}${colors.bold}Page loaded successfully!${colors.reset}`);
    console.log(`${colors.cyan}Monitoring console output...${colors.reset}\n`);

    // Keep the script running to continue monitoring
    await new Promise(() => {}); // This will run indefinitely until Ctrl+C

  } catch (error) {
    console.error(`${colors.red}${colors.bold}Failed to load page:${colors.reset}`, error.message);
    await browser.close();
    process.exit(1);
  }
})();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(`\n${colors.cyan}Stopping browser console monitor...${colors.reset}`);
  process.exit(0);
});