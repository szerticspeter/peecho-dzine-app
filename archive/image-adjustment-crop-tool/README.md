# Image Adjustment & Crop Tool (ARCHIVED)

## Overview

An interactive React-based image editor that allows users to position, scale, and crop images to a specific printable area (in this case, a 16x20" canvas).

## Files

- **`ImageEditor.js`** - Main React component
  - Drag-and-drop image positioning
  - Corner-handle resizing (maintains aspect ratio)
  - Canvas preview with printable area overlay
  - Touch-friendly (intended, but mobile UX is problematic)

- **`canvas16x20.json`** - Coordinate data
  - Defines the printable area corners for a 16x20" canvas
  - Used to overlay a semi-transparent mask showing non-printable regions
  - Format: `{ corners: [{ x, y }, ...] }`

- **`canvas16x20.png`** - Product template image
  - Visual reference showing the canvas product with margins/borders
  - Used as background in the editor

## Why It Was Built

The original MVP design required users to precisely crop their image to a canvas's printable area before ordering. This component provided:
- ✅ Visual feedback on printable vs. non-printable areas
- ✅ Drag-to-position and resize-to-fit
- ✅ Canvas preview

## Why It Was Archived

**Peecho's solution is simpler:**
- Peecho automatically filters available product sizes based on the uploaded image dimensions
- Users can select a compatible size directly in Peecho's checkout
- No cropping step needed; Peecho handles the "fit"
- Users don't expect a pre-checkout editor (MVP feedback)

## When to Use This Again

1. **Custom printable areas with complex shapes**
   - If a product has an irregular printable region (e.g., wrap-around cover)
   - Peecho's automatic filtering wouldn't be sufficient

2. **Mobile-optimized version needed**
   - Current implementation uses small resize handles (hard to tap on mobile)
   - Future: sliders for position/scale would be better

3. **Preview before Peecho checkout**
   - Some users might want to see how their crop looks before confirming
   - Could integrate as an optional "preview" step

4. **Different product templates**
   - If supporting multiple canvas sizes (A4, A3, 11x14", etc.)
   - Create variants: `canvasA4.json`, `canvasA3.json`, etc.

## Integration Notes

If resurrecting this:

1. **Re-enable in App.js/main flow:**
   ```javascript
   import ImageEditor from './ImageEditor';
   // Render it after Dzine style selection
   ```

2. **Connect the crop output:**
   - `cropImage()` function currently saves to Cloudinary
   - No longer calls `createPeechoOrder()` (that route was removed)

3. **Update for Peecho Publication flow:**
   - Remove `AddressForm` dependency
   - Keep: crop → Cloudinary → `createPeechoPublication()`

4. **Mobile improvements (if needed):**
   - Replace corner handles with sliders
   - Use `touch-action: none` on canvas for better gesture handling
   - Increase handle size or use button UI for mobile

## Technical Details

### Key State

- `image` - Loaded user image
- `imagePosition` - { x, y } in pixels
- `imageScale` - Scale factor (1.0 = original size)
- `printableCorners` - Array of 4 corner coordinates

### Key Functions

- `drawCanvas()` - Renders product + image + overlay
- `resizeImage()` - Handles corner-drag resize
- `moveImage()` - Handles image drag-to-position
- `cropImage()` - Exports cropped region to temp canvas, uploads to Cloudinary

### CSS Classes

- `.editor-container` - Outer wrapper
- `.canvas-container` - Canvas wrapper
- `.editor-controls`, `.editor-instructions` - UI elements

## Known Issues

- ❌ **Mobile touch gestures are finicky** - Small handles, two-finger resize not supported
- ❌ **Performance** - Re-rendering on every position/scale change
- ⚠️ **Accessibility** - Keyboard controls not implemented

## Future Improvements

- [ ] Touch-optimized controls (larger targets, single-finger rotate)
- [ ] Keyboard shortcuts (arrow keys for position, +/- for scale)
- [ ] Image rotation control
- [ ] Undo/redo stack
- [ ] Preset positions (center, corners, golden ratio)
- [ ] ARIA labels for screen readers
