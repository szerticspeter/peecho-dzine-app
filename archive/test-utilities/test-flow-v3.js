const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🚀 Starting Peecho Dzine App Test Flow - V3 (with real file)\n');

  try {
    // Step 1: Navigate to landing page
    console.log('📍 Step 1: Navigate to https://peecho-dzine-app.netlify.app/');
    await page.goto('https://peecho-dzine-app.netlify.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✅ Landing page loaded\n');

    // Step 2: Click editor link
    console.log('🔗 Step 2: Clicking "Test Editor Tool" link...');
    await page.click('a[href="/editor"]');
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to /editor\n');

    await page.screenshot({ path: 'v3-step-01-editor-landing.png' });
    console.log('📸 Screenshot: v3-step-01-editor-landing.png\n');

    // Step 3: Upload the real file
    console.log('📁 Step 3: Uploading real file from Downloads...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      // Get page content for debugging
      const content = await page.content();
      console.log('Page snippet:', content.substring(0, 1000));
      throw new Error('File input not found on editor page');
    }

    const filePath = path.resolve('/home/peter/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp');
    console.log(`  📂 File: ${filePath}`);
    console.log(`  📊 File size: 37224 bytes (webp image)`);
    
    await fileInput.setInputFiles(filePath);
    console.log('✅ File uploaded\n');

    // Step 4: Wait for image processing
    console.log('⏳ Waiting for image to load and process...');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'v3-step-02-image-loaded.png' });
    console.log('📸 Screenshot: v3-step-02-image-loaded.png\n');

    // Step 5: Check for Dzine.ai styles
    console.log('🎨 Step 5: Looking for Dzine.ai style options...');
    
    // Try multiple selectors
    let styleButtons = await page.$$('button');
    console.log(`  • Found ${styleButtons.length} total buttons on page`);

    // Log button texts
    const buttonTexts = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()));
    console.log('  • Button texts:', buttonTexts.slice(0, 10));

    // Try to find style-related elements
    const allDivs = await page.$$eval('div[class]', divs => 
      divs
        .filter(d => d.textContent.toLowerCase().includes('style') || d.className.toLowerCase().includes('style'))
        .map(d => ({ className: d.className, text: d.textContent.substring(0, 50) }))
        .slice(0, 5)
    );
    console.log('  • Style-related divs:', allDivs);

    await page.screenshot({ path: 'v3-step-05-styles-view.png' });
    console.log('📸 Screenshot: v3-step-05-styles-view.png\n');

    // Step 6: Look for canvas/editor element
    console.log('🖼️  Step 6: Looking for editor canvas...');
    const hasCanvas = await page.$('canvas');
    const hasImage = await page.$('img[src*="blob"], img[src*="data:"]');
    
    if (hasCanvas) {
      console.log('✅ Canvas element found');
    }
    if (hasImage) {
      console.log('✅ Processed image found');
    }
    if (!hasCanvas && !hasImage) {
      console.log('⚠️  No canvas or processed image found');
      // Try to see what's actually on page
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Page text preview:\n', pageText.substring(0, 600));
    }

    await page.screenshot({ path: 'v3-step-06-canvas-view.png' });
    console.log('📸 Screenshot: v3-step-06-canvas-view.png\n');

    // Step 7: Try to interact with image
    console.log('🎯 Step 7: Attempting to interact with image...');
    try {
      const img = await page.$('img');
      if (img) {
        const box = await img.boundingBox();
        if (box && box.width > 50) {
          console.log(`  • Image found at: ${box.x}, ${box.y} (${box.width}x${box.height})`);
          // Simulate drag
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 40);
          await page.mouse.up();
          await page.waitForTimeout(1000);
          console.log('✅ Drag simulated');
        }
      }
    } catch (e) {
      console.log('⚠️  Could not interact:', e.message);
    }

    console.log('');

    // Step 8: Look for save/export button
    console.log('💾 Step 8: Looking for Save/Export button...');
    const allButtonTexts = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()));
    const actionBtn = allButtonTexts.find(t => 
      ['Save', 'Export', 'Download', 'Proceed', 'Next', 'Crop', 'Apply'].some(word => t.includes(word))
    );

    if (actionBtn) {
      console.log(`✅ Found: "${actionBtn}"`);
      const btn = await page.$(`button:has-text("${actionBtn}")`);
      if (btn) {
        await btn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'v3-step-08-after-action.png' });
        console.log('📸 Screenshot: v3-step-08-after-action.png\n');
      }
    } else {
      console.log('⚠️  No action button found');
      console.log('  • All buttons:', allButtonTexts);
    }

    // Step 9: Final state
    console.log('📊 Step 9: Final state check...');
    const finalState = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      bodyText: document.body.innerText.substring(0, 200),
    }));

    console.log('  • Title:', finalState.title);
    console.log('  • URL:', finalState.url);
    console.log('  • Text:', finalState.bodyText);

    await page.screenshot({ path: 'v3-step-final.png', fullPage: true });
    console.log('📸 Screenshot: v3-step-final.png\n');

    console.log('✅ TEST FLOW COMPLETED!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:\n', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'v3-error.png' });
  } finally {
    await browser.close();
  }
})();
