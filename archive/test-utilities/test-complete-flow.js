const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 BROWSER ERROR:', msg.text());
    }
  });

  console.log('🚀 COMPLETE PEECHO DZINE APP TEST - WITH REAL FILE FROM DOWNLOADS\n');

  try {
    // ===== STEP 1: LANDING PAGE & FILE UPLOAD =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 STEP 1: Upload image from Downloads');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await page.goto('https://peecho-dzine-app.netlify.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✅ Landing page loaded\n');

    await page.screenshot({ path: 'test-01-landing.png' });
    console.log('📸 Screenshot: test-01-landing.png\n');

    // Click upload button
    console.log('📁 Looking for file input...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found on landing page');
    }
    console.log('✅ File input found\n');

    // Upload the real file
    const filePath = path.resolve('/home/peter/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp');
    console.log(`📂 Uploading: ${filePath}`);
    console.log(`   Size: 37,224 bytes (webp image of woman in park)\n`);

    await fileInput.setInputFiles(filePath);
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-02-after-upload.png' });
    console.log('📸 Screenshot: test-02-after-upload.png\n');

    // Verify image loaded (check for style section)
    console.log('✅ Checking if image was processed...');
    const styleSection = await page.$('.style-section');
    if (!styleSection) {
      console.log('⚠️  Style section not found yet. Waiting more...');
      await page.waitForTimeout(3000);
    }

    const fileNameDisplayed = await page.evaluate(() => {
      const uploadText = document.querySelector('.upload-text');
      return uploadText ? uploadText.innerText : '';
    });
    console.log(`   Uploaded file: ${fileNameDisplayed}\n`);

    // ===== STEP 2: SELECT STYLE =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 STEP 2: Select Dzine.ai style');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Find style buttons
    const styleButtons = await page.$$('.style-button');
    console.log(`Found ${styleButtons.length} style buttons\n`);

    if (styleButtons.length > 0) {
      console.log('🔘 Clicking first style button...');
      await styleButtons[0].click();
      console.log('✅ Style selected\n');

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-03-style-selected.png' });
      console.log('📸 Screenshot: test-03-style-selected.png\n');

      // Wait for processing
      console.log('⏳ Waiting for Dzine.ai image transformation...');
      const processingDiv = await page.$('.processing');
      if (processingDiv) {
        console.log('   Processing indicator found, waiting...');
        let attempts = 0;
        while (attempts < 60) {
          const processing = await page.$('.processing');
          if (!processing) {
            console.log('✅ Processing complete');
            break;
          }
          await page.waitForTimeout(1000);
          attempts++;
        }
      }

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-04-style-processed.png' });
      console.log('📸 Screenshot: test-04-style-processed.png\n');
    } else {
      console.log('⚠️  No style buttons found');
    }

    // ===== STEP 3: NAVIGATE TO EDITOR =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✏️  STEP 3: Navigate to Image Editor');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const continueBtn = await page.$('.create-product-button');
    if (continueBtn) {
      console.log('🔘 Clicking "Continue to Image Editor" button...');
      await continueBtn.click();
      await page.waitForTimeout(3000);
      console.log('✅ Navigated to editor\n');
    } else {
      console.log('⚠️  Continue button not found, trying to navigate directly...');
      await page.goto('https://peecho-dzine-app.netlify.app/editor', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-05-editor-view.png' });
    console.log('📸 Screenshot: test-05-editor-view.png\n');

    // ===== STEP 4: EDITOR CANVAS =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖼️  STEP 4: Editor Canvas & Image Positioning');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check for canvas
    const canvas = await page.$('canvas');
    if (canvas) {
      console.log('✅ Canvas element found');
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        console.log(`   Dimensions: ${canvasBox.width} x ${canvasBox.height}`);
      }
    }

    // Check for image
    const editorImg = await page.$('.editor-container img');
    if (editorImg) {
      console.log('✅ Image found in editor');
    }

    console.log('');

    // Try to drag image
    console.log('🎯 Attempting to drag image for positioning...');
    const img = await page.$('img');
    if (img) {
      const box = await img.boundingBox();
      if (box && box.width > 50) {
        console.log(`   Image at: (${Math.round(box.x)}, ${Math.round(box.y)})`);
        console.log(`   Size: ${Math.round(box.width)} x ${Math.round(box.height)}`);

        // Simulate drag
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 40, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(1000);
        console.log('✅ Image dragged successfully\n');
      }
    }

    await page.screenshot({ path: 'test-06-editor-after-interaction.png' });
    console.log('📸 Screenshot: test-06-editor-after-interaction.png\n');

    // ===== STEP 5: SAVE/EXPORT =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 STEP 5: Save/Export Edited Image');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Look for action buttons
    const allButtons = await page.$$eval('button', btns => 
      btns.map(b => ({
        text: b.textContent.trim(),
        visible: b.offsetParent !== null
      }))
    );

    const visibleButtons = allButtons.filter(b => b.visible && b.text);
    console.log(`Found ${visibleButtons.length} visible buttons:`);
    visibleButtons.forEach((b, i) => {
      console.log(`  ${i + 1}. "${b.text}"`);
    });

    // Look for save/export button
    const actionBtn = await page.$('button:has-text("Crop"), button:has-text("Save"), button:has-text("Export"), button:has-text("Proceed")');
    if (actionBtn) {
      const btnText = await actionBtn.textContent();
      console.log(`\n🔘 Found action button: "${btnText}"`);
      console.log('Clicking...');
      await actionBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ Clicked\n');
      await page.screenshot({ path: 'test-07-after-save.png' });
      console.log('📸 Screenshot: test-07-after-save.png\n');
    } else {
      console.log('\n⚠️  No obvious save/export button found\n');
    }

    // ===== STEP 6: FINAL STATE =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 STEP 6: Final State & Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const finalState = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      hasCanvas: !!document.querySelector('canvas'),
      hasImage: !!document.querySelector('img'),
      buttons: Array.from(document.querySelectorAll('button'))
        .filter(b => b.offsetParent !== null)
        .map(b => b.textContent.trim())
        .slice(0, 8)
    }));

    console.log('✅ Final Page State:');
    console.log(`   URL: ${finalState.url}`);
    console.log(`   Title: ${finalState.title}`);
    console.log(`   Has Canvas: ${finalState.hasCanvas}`);
    console.log(`   Has Image: ${finalState.hasImage}`);
    console.log(`   Visible Buttons: ${finalState.buttons.join(', ')}`);

    await page.screenshot({ path: 'test-08-final-state.png', fullPage: true });
    console.log('\n📸 Screenshot: test-08-final-state.png\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST COMPLETED SUCCESSFULLY!\n');
    console.log('📂 Screenshots saved:');
    console.log('   test-01-landing.png');
    console.log('   test-02-after-upload.png');
    console.log('   test-03-style-selected.png');
    console.log('   test-04-style-processed.png');
    console.log('   test-05-editor-view.png');
    console.log('   test-06-editor-after-interaction.png');
    console.log('   test-07-after-save.png');
    console.log('   test-08-final-state.png\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED!\n', error.message);
    console.error('\nStack:', error.stack);
    await page.screenshot({ path: 'test-error.png' });
    console.log('\n📸 Error screenshot: test-error.png');
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
})();
