const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://peecho-dzine-app.netlify.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const html = await page.content();
  console.log('PAGE HTML:\n');
  console.log(html);

  await browser.close();
})();
