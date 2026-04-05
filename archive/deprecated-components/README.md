# Deprecated Components (ARCHIVED)

## Overview

React components and modules that were part of earlier MVP designs but are no longer used in the current flow.

## Components

### AddressForm.js

**Purpose (Original):** Collect shipping address before Peecho checkout

**What it did:**
- Form with fields: First Name, Last Name, Email, Street Address, City, Postal Code, Country, Currency
- Validation (required fields, email format)
- Loading state during submission
- Error handling

**Why it was removed:**
- Simplified MVP design: Peecho checkout now handles address collection
- Better UX: users enter address once (at Peecho) instead of twice
- Reduced integration complexity: no need for custom address form

**Original Flow:**
```
Image Editor (crop) → Address Form (ship-to) → Peecho Checkout → Payment
```

**Current Flow:**
```
Dzine Styling → Cloudinary → Peecho Checkout (address + product selection + payment)
```

## When to Use These Again

### AddressForm.js

Use if you want to:

1. **Collect address before Peecho** (for validation/UX)
   - Example: allow users to see price before entering full address
   - Could pre-populate Peecho checkout with their address data

2. **Custom address collection** (if Peecho's form doesn't meet your needs)
   - Custom validation logic
   - Integration with external address database (postcodes API, etc.)
   - Multi-language support beyond Peecho's default

3. **Analytics** (track address data independently)
   - Where are orders coming from?
   - Which countries are most popular?

## Integration Pattern

If resurrecting `AddressForm.js`:

```javascript
// In your main app
import AddressForm from './archive/deprecated-components/AddressForm';

// After image editor/Dzine, before Peecho:
{showAddressForm && (
  <AddressForm
    onSubmit={(address) => {
      // Save address
      // Optionally pre-fill Peecho with this data
      redirectToPeechoCheckout(address);
    }}
    onCancel={() => setShowAddressForm(false)}
  />
)}
```

## Code Quality Notes

- Form uses React hooks (useState)
- Has basic validation
- Includes loading/disabled states
- ARIA labels missing (accessibility)
- Hardcoded country list (could be dynamic)
- Currency dropdown (actually redundant; Peecho handles this)

## Potential Improvements

If resurrecting:

- [ ] Add address autocomplete (Google Maps, PostcodeAPI, etc.)
- [ ] Support multiple shipping addresses
- [ ] Save address to localStorage for next visit
- [ ] Add phone number field
- [ ] VAT number field (for EU orders)
- [ ] Company name field (for B2B)
- [ ] ARIA labels for accessibility
- [ ] Dynamic country list (from Peecho API)
- [ ] Conditional required fields (some countries need state)

## Related Files

- `src/ImageEditor.js` - Used to call this component after cropping
- `netlify/functions/createPeechoOrder.mjs` - Old function that expected address data

Both of the above have been refactored to skip the address form step.

## Lessons Learned

**Why this was removed:**
1. **DRY Principle**: Peecho already has a good address form; duplicate work is wasteful
2. **User Friction**: Users don't want to fill forms twice
3. **Maintenance**: Keeping two address forms in sync is error-prone
4. **Scope Creep**: Address validation, formatting, autocomplete are complex problems

**Better approach:**
- Let Peecho handle address collection (they're experts at it)
- If you need address before Peecho: use Peecho's API to pre-fill their form
- If you need custom validation: do it after Peecho returns the data

This component is kept as a reference for how to structure a multi-step checkout flow, should you need it in the future.
