# Archive 📦

This directory contains tools, components, and scripts that were part of earlier iterations of the app but are no longer actively used.

**Why keep them?**
- 📚 Reference for future development
- 🔄 Easy resurrection if requirements change
- 📖 Documentation of design decisions and trade-offs
- 🐛 Debugging resource if integration issues arise

## Structure

```
archive/
├── image-adjustment-crop-tool/     (Interactive image editor - ARCHIVED)
├── test-utilities/                  (Test scripts & debugging tools - ARCHIVED)
├── deprecated-components/           (React components no longer used - ARCHIVED)
└── README.md                         (This file)
```

## Quick Navigation

### Image Adjustment & Crop Tool
**Status:** Archived (superseded by Peecho's automatic product filtering)

**Location:** `archive/image-adjustment-crop-tool/`

**What it is:** React component for positioning, scaling, and cropping images to a specific printable area.

**Use case (original):** Users crop their image precisely to a canvas's printable area before ordering.

**Why archived:** Peecho now filters available sizes automatically based on image dimensions. No cropping step needed.

**Resurrect if:**
- Supporting complex printable areas (e.g., wrap-around covers)
- Need image preview before Peecho checkout
- Mobile-optimized version required

→ [Read more](./image-adjustment-crop-tool/README.md)

---

### Test Utilities & Debug Scripts
**Status:** Archived (development/investigation tools)

**Location:** `archive/test-utilities/`

**What they are:** Test scripts for validating Peecho API, Cloudinary uploads, and end-to-end flows. Plus debugging docs.

**Use case:** Investigating API behavior, testing integration, troubleshooting issues.

**Why archived:** Integration is complete and stable. Tests are still valuable for debugging.

**Use if:**
- Debugging API failures
- Understanding the integration
- Adding new features/APIs
- Onboarding new developers

→ [Read more](./test-utilities/README.md)

---

### Deprecated Components
**Status:** Archived (no longer part of the flow)

**Location:** `archive/deprecated-components/`

**What they are:** React components from earlier MVP designs.

**Includes:**
- `AddressForm.js` - Shipping address collection (now handled by Peecho)

**Use if:**
- Custom address collection needed
- Multi-step checkout flow preferred
- Address validation/autocomplete required

→ [Read more](./deprecated-components/README.md)

---

## Migration Timeline

### 2026-04-05: Major MVP Simplification

**Change:** Removed image editor (ImageEditor.js) from main flow

**Reason:** Peecho's checkout automatically filters available products/sizes based on:
- User's shipping location (Hungary → limited, Germany/USA → more options)
- Image dimensions (only compatible sizes shown)

**Impact:**
- Removed: `src/ImageEditor.js`, `src/AddressForm.js`, cropping tool
- Simplified flow: Upload → Dzine → Cloudinary → Peecho Checkout
- No more user confusion about what gets cropped/how it prints

**Files moved to archive:**
- `image-adjustment-crop-tool/` (ImageEditor.js + canvas data)
- `deprecated-components/` (AddressForm.js)
- `test-utilities/` (all test*.js, debug*.js files)

---

## How to Restore

If you need a tool from the archive:

### Option 1: Copy files back

```bash
# Example: Restore ImageEditor
cp archive/image-adjustment-crop-tool/ImageEditor.js src/
cp archive/image-adjustment-crop-tool/canvas16x20.json public/images/products/
```

### Option 2: Git history

All files are in version control. You can restore from git:

```bash
git log --all -- archive/
git show COMMIT_HASH:archive/path/to/file > restored_file.js
```

### Option 3: Reference

Read the archived code without restoring it, use as a reference for your own implementation.

---

## Notes

- All archived files are **fully functional** (they were working before archiving)
- No dependencies have been removed; code should still work
- Some paths/imports may need adjustment if restored (e.g., relative imports)
- Test scripts assume certain environment variables are set
- See individual README files for detailed migration info

---

## Future

If MVP changes again:

1. Document the change in this README
2. Move old components to a new subdirectory with a date (e.g., `v1-image-editor-2026-04`)
3. Keep old subdirectories for reference
4. Update main README with links to archived docs

Example:
```
archive/
├── image-adjustment-crop-tool/      (v1 - 2026-04-05)
├── enhanced-image-editor/           (v2 - 2026-06-xx - if added later)
├── test-utilities/
└── deprecated-components/
```

This keeps the evolution visible and makes it easy to compare approaches over time.

---

## Peecho API Investigation (2026-04-04 → 2026-04-05)

**Status:** Resolved — API working, integration complete.

### Problem

Original design assumed a static product ID from the Peecho dashboard. The actual requirement was on-the-fly product creation per user image.

```
Original: User uploads → Dzine AI styles → FIXED Product ID → Order
Needed:   User uploads → Dzine AI styles → NEW Peecho Product per image → Order
```

### Resolution

Found: Peecho V3 Publication Creation API (`POST /rest/v3/publication/create`)

Key findings:
- Correct endpoint: `https://www.peecho.com/rest/v3/publication/create` (not `api.peecho.com`)
- Supports dynamic product creation per-user image
- Returns a numeric publication ID; checkout URL is `https://www.peecho.com/print/{id}`
- No `fixedOfferingId` needed — Peecho auto-filters products by location + image dimensions
- No `enableSecureCheckout` — simple numeric ID URL is more reliable

Working credentials (prod):
- `PEECHO_MERCHANT_KEY`: `9453a60bbb4ff78d9543640832a5980a2f52f4bd`
- `PEECHO_BUTTON_KEY`: `177417121641766683`

### Bugs Fixed

- Cloudinary upload: Fixed FormData encoding in `saveEditedImage.mjs` (was using URLSearchParams)

### Canvas Product Note

Canvases have fixed sizes — no dynamic adjustment in Peecho checkout. The image prints exactly as uploaded/styled. No backup preview in Peecho (unlike Prints/Dibond). Peecho filters which canvas sizes are available based on image dimensions and shipping location.
