const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🚀 Starting Peecho Dzine App Test Flow - V2\n');

  try {
    // Step 1: Navigate to the app
    console.log('📍 Step 1: Navigate to https://peecho-dzine-app.netlify.app/');
    await page.goto('https://peecho-dzine-app.netlify.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✅ Page loaded\n');

    // Step 2: Click "Test Editor Tool" button
    console.log('🔘 Step 2: Clicking "Test Editor Tool" button...');
    const testEditorBtn = await page.$('button:has-text("Test Editor Tool")');
    if (!testEditorBtn) {
      throw new Error('Test Editor Tool button not found');
    }
    await testEditorBtn.click();
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to editor\n');

    // Screenshot after navigation
    await page.screenshot({ path: 'v2-step-01-editor-page.png' });
    console.log('✅ Screenshot: v2-step-01-editor-page.png\n');

    // Step 3: Find and upload file
    console.log('📁 Step 3: Looking for file upload input...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input element not found on editor page');
    }
    console.log('✅ File input found\n');

    const filePath = path.resolve('/home/peter/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp');
    console.log(`📂 Uploading real file: ${filePath}`);
    await fileInput.setInputFiles(filePath);
    console.log('✅ File selected\n');

    // Wait for image to load
    console.log('⏳ Waiting for image processing...');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'v2-step-02-after-upload.png' });
    console.log('✅ Screenshot: v2-step-02-after-upload.png\n');

    // Step 4: Check if image loaded and look for style buttons
    console.log('🎨 Step 4: Looking for Dzine style buttons or style selector...');
    await page.waitForTimeout(2000);
    
    const styleButtonSelectors = [
      'button[class*="style"]',
      'button:has-text("Style")',
      '.style-option',
      '[class*="dzine"]',
      'button[data-style]',
      'div[class*="style"] button'
    ];

    let foundStyleButton = null;
    for (const selector of styleButtonSelectors) {
      const btn = await page.$(selector);
      if (btn) {
        console.log(`  ✓ Found with selector: ${selector}`);
        foundStyleButton = btn;
        break;
      }
    }

    if (foundStyleButton) {
      console.log('✅ Style button found, clicking...');
      await foundStyleButton.click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'v2-step-03-after-style.png' });
      console.log('✅ Screenshot: v2-step-03-after-style.png\n');
    } else {
      console.log('⚠️  No style buttons found. Checking page structure...');
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Page text (first 800 chars):\n', pageText.substring(0, 800));
      await page.screenshot({ path: 'v2-step-03-no-styles.png' });
    }

    // Step 5: Look for image editor/canvas
    console.log('\n🖼️  Step 5: Looking for image editor canvas...');
    const canvas = await page.$('canvas');
    const editableImage = await page.$('img[draggable="true"], .draggable-image, [class*="canvas"]');

    if (canvas) {
      console.log('✅ Canvas element found');
    } else if (editableImage) {
      console.log('✅ Draggable/editable image found');
    } else {
      console.log('⚠️  No canvas or editor element found');
    }

    await page.screenshot({ path: 'v2-step-05-editor-canvas.png' });
    console.log('✅ Screenshot: v2-step-05-editor-canvas.png\n');

    // Step 6: Try to interact with image
    console.log('🎯 Step 6: Attempting to drag/interact with image...');
    const interactiveElement = await page.$('img, canvas, [class*="draggable"]');
    if (interactiveElement) {
      const box = await interactiveElement.boundingBox();
      if (box && box.width > 0) {
        console.log(`  • Element found at: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
        // Try drag
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 30);
        await page.mouse.up();
        await page.waitForTimeout(1000);
        console.log('✅ Drag operation simulated\n');
      }
    }

    // Step 7: Look for save/export/proceed button
    console.log('💾 Step 7: Looking for Save/Export/Proceed button...');
    const actionButtonSelectors = [
      'button:has-text("Save")',
      'button:has-text("Export")',
      'button:has-text("Download")',
      'button:has-text("Proceed")',
      'button:has-text("Next")',
      'button[class*="save"], button[class*="export"], button[class*="proceed"]'
    ];

    let actionButton = null;
    for (const selector of actionButtonSelectors) {
      const btn = await page.$(selector);
      if (btn) {
        const isVisible = await btn.isVisible();
        if (isVisible) {
          console.log(`  ✓ Found: ${selector}`);
          actionButton = btn;
          break;
        }
      }
    }

    if (actionButton) {
      console.log('✅ Action button found, clicking...');
      await actionButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'v2-step-07-after-action.png' });
      console.log('✅ Screenshot: v2-step-07-after-action.png\n');
    } else {
      console.log('⚠️  No action button found');
      await page.screenshot({ path: 'v2-step-07-no-action-btn.png' });
    }

    // Final state
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'v2-step-final.png', fullPage: true });
    console.log('✅ Screenshot: v2-step-final.png\n');

    // Check for errors in browser console
    console.log('🔍 Checking browser state...');
    const state = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      html_length: document.documentElement.outerHTML.length,
      error_count: window.__ERROR_COUNT__ || 0,
    }));
    console.log('  • Title:', state.title);
    console.log('  • URL:', state.url);
    console.log('  • HTML length:', state.html_length);

    console.log('\n✅ TEST FLOW COMPLETED!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:\n', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'v2-error-screenshot.png' });
    console.log('\nError screenshot saved: v2-error-screenshot.png');
  } finally {
    await browser.close();
  }
})();
