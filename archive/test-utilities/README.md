# Test Utilities & Debug Scripts (ARCHIVED)

## Overview

Collection of test scripts, debugging tools, and documentation used during development to investigate and verify Peecho API, Cloudinary, and checkout integrations.

## Test Scripts

### Peecho API Tests

- **`test-direct-order.mjs`** - Direct Order API investigation
  - Attempted to test Peecho's `/order/create` endpoint
  - Used to understand order flow vs. Publication flow
  - Result: Publication API is simpler for this use case

- **`test-flow.js`, `test-flow-v2.js`, `test-flow-v3.js`** - End-to-end flow tests
  - Various iterations of testing the full user flow
  - Image upload → Dzine → Cloudinary → Peecho → Checkout
  - Used to identify bottlenecks and failures

- **`test-complete-flow.js`** - Comprehensive integration test
  - Full flow with detailed logging
  - Checks each step (Cloudinary upload, Peecho Publication creation, checkout link generation)

### Cloudinary Tests

- **`test-cloudinary-upload.js`** - Cloudinary FormData upload test
  - Tested different ways to upload base64 image data
  - Discovered: FormData required (not URLSearchParams)
  - Critical fix: `saveEditedImage.mjs` now uses FormData

- **`test-cloudinary-debug.js`** - Debugging Cloudinary responses
  - Detailed error logging and response inspection
  - Used to verify upload success and retrieve image URLs

### Environment Tests

- **`test-env-vars.js`** - Environment variable validation
  - Checks if all required env vars are set (CLOUDINARY, PEECHO, DZINE keys)
  - Useful before deployment

### Debug Utilities

- **`debug-function-payload.js`** - Netlify function payload inspection
  - Logs raw HTTP request/response bodies
  - Helps debug API parameter issues

- **`inspect-page.js`** - Page structure inspection
  - Not really used; was for analyzing Peecho checkout HTML structure

## Documentation Files

### Flow & Architecture

- **`TEST_MANIFEST.md`** - Complete test inventory
  - Lists all test files and what they test
  - Test results and notes

- **`TEST_GUIDE_INDEX.md`** - Guide to running tests
  - Step-by-step instructions
  - Which tests to run for different scenarios

- **`TEST_SUMMARY.txt`** - Summary of test outcomes
  - What worked, what failed
  - Key fixes applied

### Peecho Investigation

- **`BEFORE_YOU_RUN_TEST.md`** - Pre-test checklist
  - Environment setup
  - Required credentials
  - Product IDs to use

- **`DIRECT_ORDER_TEST_SUMMARY.md`** - Direct Order API investigation results
  - Why Direct Order API was rejected
  - Findings: Publication API is better for this use case

- **`TEST_DIRECT_ORDER_README.md`** - Detailed Direct Order test guide
  - How to run standalone test
  - Expected outputs
  - Troubleshooting

- **`ROOT_CAUSE_ANALYSIS.md`** - Problem investigation notes
  - Specific bugs and their root causes
  - Solutions applied
  - Lessons learned

- **`PLAYWRIGHT_TEST_REPORT.md`** - Browser automation test results
  - Used Playwright for end-to-end checkout testing
  - Screenshots and flow validation

### Quick References

- **`QUICK_CLOUDINARY_CHECK.txt`** - Quick Cloudinary verification
  - One-liner tests for Cloudinary upload
  - Useful for sanity checks

- **`QUICK_START.txt`** - Quick test execution guide
  - How to run the most important tests
  - Expected outcomes

- **`ENVIRONMENT_VARIABLES_DIAGNOSTIC.md`** - Env var troubleshooting
  - How to check if vars are set correctly
  - Common issues and fixes

## When to Use These

### Active Development / Debugging

- Use `test-cloudinary-upload.js` if uploading stops working
- Use `test-env-vars.js` before any deployment
- Use `ENVIRONMENT_VARIABLES_DIAGNOSTIC.md` if integration breaks

### Understanding the Integration

- Read `TEST_SUMMARY.txt` for overview
- Read `ROOT_CAUSE_ANALYSIS.md` for specific issues and fixes
- Run `test-complete-flow.js` locally to verify end-to-end

### API Changes

- If Peecho API changes: use `test-direct-order.mjs` as reference for API exploration
- If Cloudinary changes: use `test-cloudinary-debug.js` for debugging

### Onboarding

- New team member? Start with `TEST_GUIDE_INDEX.md`
- Then run `test-env-vars.js` to verify setup
- Then run `test-complete-flow.js` to see the integration in action

## How to Run

### Single Test

```bash
# Cloudinary test
node test-cloudinary-upload.js

# Environment check
node test-env-vars.js

# Complete flow (requires all env vars set)
node test-complete-flow.js

# Peecho Direct Order (requires PEECHO_MERCHANT_KEY)
node test-direct-order.mjs
```

### All Tests

```bash
# Not automated; run manually in sequence
node test-env-vars.js
node test-cloudinary-upload.js
node test-complete-flow.js
```

## Test Results from Last Run

See individual `*.txt` and `*.md` files for detailed results from development sessions.

Key outcomes:
- ✅ Cloudinary: FormData uploads work (RFC 2388 multipart/form-data)
- ✅ Peecho Publication API: Returns functional checkout links
- ✅ Dzine.ai: Style transformation working
- ❌ Peecho Direct Order API: Not suitable (auth issues, complexity)

## Known Issues with Tests

- Some test files assume hardcoded image URLs (may need updating)
- API credentials are checked but tests don't validate they're actually valid
- No automated test runner; all manual execution

## Future Improvements

- [ ] Automated test runner (Jest or similar)
- [ ] CI/CD integration (GitHub Actions, etc.)
- [ ] Mocked API responses for offline testing
- [ ] Performance benchmarking
- [ ] Load testing for Netlify functions
