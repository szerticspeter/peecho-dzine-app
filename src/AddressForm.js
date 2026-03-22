import React, { useState } from 'react';

// ISO 3166-1 alpha-2 country list (common subset)
const COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'CA', name: 'Canada' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

const CURRENCIES = [
  { code: 'EUR', name: 'EUR – Euro' },
  { code: 'USD', name: 'USD – US Dollar' },
  { code: 'GBP', name: 'GBP – British Pound' },
  { code: 'SEK', name: 'SEK – Swedish Krona' },
  { code: 'NOK', name: 'NOK – Norwegian Krone' },
  { code: 'DKK', name: 'DKK – Danish Krone' },
  { code: 'CHF', name: 'CHF – Swiss Franc' },
  { code: 'PLN', name: 'PLN – Polish Złoty' },
  { code: 'CZK', name: 'CZK – Czech Koruna' },
  { code: 'HUF', name: 'HUF – Hungarian Forint' },
  { code: 'RON', name: 'RON – Romanian Leu' },
  { code: 'BGN', name: 'BGN – Bulgarian Lev' },
  { code: 'CAD', name: 'CAD – Canadian Dollar' },
  { code: 'AUD', name: 'AUD – Australian Dollar' },
];

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  postCode: '',
  country: 'HU',
  currency: 'EUR',
};

/**
 * AddressForm modal overlay
 *
 * Props:
 *   onSubmit(formData)  — called with the address data when user submits
 *   onCancel()          — called when user cancels
 *   isLoading           — shows spinner on submit button
 */
const AddressForm = ({ onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.address.trim()) errs.address = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.postCode.trim()) errs.postCode = 'Required';
    if (!form.country) errs.country = 'Required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="address-form-overlay">
      <div className="address-form-modal">
        <h2 className="address-form-title">Shipping Details</h2>
        <p className="address-form-subtitle">
          Enter your shipping address to proceed to checkout.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div className="address-form-row">
            <div className="address-form-group">
              <label htmlFor="af-firstName">First Name *</label>
              <input
                id="af-firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={isLoading}
              />
              {errors.firstName && <span className="address-form-error">{errors.firstName}</span>}
            </div>
            <div className="address-form-group">
              <label htmlFor="af-lastName">Last Name *</label>
              <input
                id="af-lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={isLoading}
              />
              {errors.lastName && <span className="address-form-error">{errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="address-form-group">
            <label htmlFor="af-email">Email Address *</label>
            <input
              id="af-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={isLoading}
            />
            {errors.email && <span className="address-form-error">{errors.email}</span>}
          </div>

          {/* Street */}
          <div className="address-form-group">
            <label htmlFor="af-address">Street Address *</label>
            <input
              id="af-address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Street"
              disabled={isLoading}
            />
            {errors.address && <span className="address-form-error">{errors.address}</span>}
          </div>

          {/* City + PostCode */}
          <div className="address-form-row">
            <div className="address-form-group">
              <label htmlFor="af-city">City *</label>
              <input
                id="af-city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Budapest"
                disabled={isLoading}
              />
              {errors.city && <span className="address-form-error">{errors.city}</span>}
            </div>
            <div className="address-form-group">
              <label htmlFor="af-postCode">Postal Code *</label>
              <input
                id="af-postCode"
                name="postCode"
                type="text"
                value={form.postCode}
                onChange={handleChange}
                placeholder="1234 AB"
                disabled={isLoading}
              />
              {errors.postCode && <span className="address-form-error">{errors.postCode}</span>}
            </div>
          </div>

          {/* Country + Currency */}
          <div className="address-form-row">
            <div className="address-form-group">
              <label htmlFor="af-country">Country *</label>
              <select
                id="af-country"
                name="country"
                value={form.country}
                onChange={handleChange}
                disabled={isLoading}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.country && <span className="address-form-error">{errors.country}</span>}
            </div>
            <div className="address-form-group">
              <label htmlFor="af-currency">Currency</label>
              <select
                id="af-currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                disabled={isLoading}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="address-form-actions">
            <button
              type="button"
              className="address-form-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              ← Back to Editor
            </button>
            <button
              type="submit"
              className="address-form-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Processing…
                </>
              ) : (
                'Proceed to Checkout →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
