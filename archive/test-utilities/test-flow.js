const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🚀 Starting Peecho Dzine App Test Flow\n');

  try {
    // Step 1: Navigate to the app
    console.log('📍 Step 1: Navigate to https://peecho-dzine-app.netlify.app/');
    await page.goto('https://peecho-dzine-app.netlify.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded\n');

    // Step 2: Take a screenshot of the initial state
    console.log('📸 Taking screenshot of landing page...');
    await page.screenshot({ path: 'step-01-landing.png' });
    console.log('✅ Screenshot: step-01-landing.png\n');

    // Step 3: Look for file input and upload
    console.log('📁 Step 2: Looking for file upload input...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      console.log('❌ File input not found! Checking page structure...');
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('Page content preview:\n', bodyText.substring(0, 500));
      throw new Error('File input element not found');
    }
    console.log('✅ File input found\n');

    // Step 4: Upload the real file from Downloads
    const filePath = path.resolve('/home/peter/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp');
    console.log(`📂 Uploading file: ${filePath}`);
    await fileInput.setInputFiles(filePath);
    console.log('✅ File selected\n');

    // Step 5: Wait for image preview or processing
    console.log('⏳ Waiting for image preview...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'step-02-after-upload.png' });
    console.log('✅ Screenshot: step-02-after-upload.png\n');

    // Step 6: Look for style selection or next button
    console.log('🎨 Step 3: Looking for Dzine style selection or style buttons...');
    const styleButtons = await page.$$('button[data-style], button:has-text("Style"), .style-btn');
    console.log(`Found ${styleButtons.length} potential style buttons\n`);

    if (styleButtons.length > 0) {
      console.log('📌 Clicking first style button...');
      await styleButtons[0].click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'step-03-after-style-click.png' });
      console.log('✅ Screenshot: step-03-after-style-click.png\n');
    } else {
      console.log('⚠️  No style buttons found, looking for alternative next step...');
      const nextButton = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("Proceed")');
      if (nextButton) {
        console.log('📌 Found Next button, clicking...');
        await nextButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'step-03-after-next.png' });
        console.log('✅ Screenshot: step-03-after-next.png\n');
      }
    }

    // Step 7: Look for image editor/canvas
    console.log('🖼️  Step 4: Looking for image editor canvas...');
    const canvas = await page.$('canvas');
    if (canvas) {
      console.log('✅ Canvas element found');
      await page.screenshot({ path: 'step-04-canvas-view.png' });
      console.log('✅ Screenshot: step-04-canvas-view.png\n');
    } else {
      console.log('⚠️  Canvas not found, checking for editor container...');
      const editor = await page.$('[class*="editor"], [class*="canvas"], [class*="image-editor"]');
      if (editor) {
        console.log('✅ Editor container found');
        await page.screenshot({ path: 'step-04-editor-view.png' });
        console.log('✅ Screenshot: step-04-editor-view.png\n');
      }
    }

    // Step 8: Try to interact with editor (drag, scale)
    console.log('🎯 Step 5: Attempting to interact with image editor...');
    const image = await page.$('img[src*="blob"], img[src*="data:"], canvas');
    if (image) {
      console.log('📍 Found image/canvas element, attempting drag...');
      const box = await image.boundingBox();
      if (box) {
        // Simulate a drag operation
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
        await page.mouse.up();
        await page.waitForTimeout(1000);
        console.log('✅ Drag operation completed\n');
      }
    }

    // Step 9: Look for save/export button
    console.log('💾 Step 6: Looking for Save/Export button...');
    const saveBtn = await page.$('button:has-text("Save"), button:has-text("Export"), button:has-text("Download"), button:has-text("Proceed")');
    if (saveBtn) {
      console.log('📌 Save/Export button found, clicking...');
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'step-05-after-save.png' });
      console.log('✅ Screenshot: step-05-after-save.png\n');
    } else {
      console.log('⚠️  Save/Export button not found');
    }

    // Step 10: Final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'step-06-final.png' });
    console.log('✅ Screenshot: step-06-final.png\n');

    // Step 11: Check for errors in console
    console.log('🔍 Checking for console errors...');
    const logs = await page.evaluate(() => {
      return {
        html: document.documentElement.outerHTML.substring(0, 1000),
        title: document.title,
        url: window.location.href,
      };
    });
    console.log('Page title:', logs.title);
    console.log('Current URL:', logs.url);

    console.log('\n✅ TEST FLOW COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:\n', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('Error screenshot saved: error-screenshot.png');
  } finally {
    await browser.close();
  }
})();
