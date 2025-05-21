import React from 'react';
import InputField from './InputField';

/**
 * CommonRegisterFields - Handles all shared registration fields for both client and freelancer forms.
 * Handles live validation, username availability, and error display for username/email/password.
 * Accepts extra fields as children for form-specific fields.
 *
 * Props:
 * - form: state object
 * - errors: error object
 * - handleChange: input change handler
 * - usernameAvailable: boolean|null (for username availability feedback)
 * - checkingUsername: boolean (for username check loading)
 * - children: extra fields (JSX)
 */
const CommonRegisterFields = ({
  form,
  errors,
  handleChange,
  usernameAvailable,
  checkingUsername,
  children
}) => (
  <>
    {/* Username with live feedback and border color */}
    <div className="mb-4">
      <label className="block mb-1">Username</label>
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded ${form.username && (errors.username || usernameAvailable === false) ? 'border-red-500' : form.username && usernameAvailable === true && !errors.username ? 'border-green-500' : ''}`}
        required
        autoComplete="off"
      />
      {form.username && usernameAvailable === true && !errors.username && (
        <div className="text-green-600 text-xs mt-1">Username is available.</div>
      )}
      {form.username && usernameAvailable === false && (
        <div className="text-red-500 text-xs mt-1">Username is already taken.</div>
      )}
      {form.username && errors.username && errors.username !== '' && errors.username !== 'Username is already taken.' && (
        <div className="text-red-500 text-sm mt-1">{errors.username}</div>
      )}
    </div>
    {/* Password with live feedback and border color */}
    <div className="mb-4">
      <label className="block mb-1">Password</label>
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded ${form.password && errors.password ? 'border-red-500' : form.password && !errors.password ? 'border-green-500' : ''}`}
        required
      />
      {form.password && errors.password && errors.password !== '' && (
        <div className="text-red-500 text-sm mt-1">{errors.password}</div>
      )}
    </div>
    {/* Email with live feedback and border color */}
    <div className="mb-4">
      <label className="block mb-1">Email</label>
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded ${form.email && errors.email ? 'border-red-500' : form.email && !errors.email ? 'border-green-500' : ''}`}
        required
      />
      {form.email && errors.email && errors.email !== '' && (
        <div className="text-red-500 text-sm mt-1">{errors.email}</div>
      )}
    </div>
    {/* Other shared fields */}
    <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
    {errors.fullName && <div className="text-red-500 text-sm mb-2">{errors.fullName}</div>}
    <InputField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
    {errors.phoneNumber && <div className="text-red-500 text-sm mb-2">{errors.phoneNumber}</div>}
    <InputField label="Location" name="location" value={form.location} onChange={handleChange} required />
    {errors.location && <div className="text-red-500 text-sm mb-2">{errors.location}</div>}
    {/* Profile image upload (optional) */}
    <div className="mb-4">
      <label className="block mb-1">Profile Image (optional)</label>
      <input
        type="file"
        name="profileImage"
        accept="image/*"
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      />
    </div>
    {/* Render extra fields (children) */}
    {children}
  </>
);

export default CommonRegisterFields;
