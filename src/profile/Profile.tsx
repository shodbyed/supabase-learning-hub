/**
 * @fileoverview Member Profile Page Component
 * Displays comprehensive member information including personal details, contact info, and membership status
 */
import React, { useState } from 'react';
import { useUser } from '../context/useUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { LoginCard } from '../login/LoginCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { US_STATES } from '../constants/states';
import { getMembershipStatus, formatDueDate, getDuesStatusStyling } from '../utils/membershipUtils';
import { capitalizeWords, formatPhoneNumber } from '../utils/formatters';
import { z } from 'zod';

// Validation schemas for profile editing
const personalInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required').trim(),
  last_name: z.string().min(1, 'Last name is required').trim(),
  nickname: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
});

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, 'Phone number must contain exactly 10 digits'),
});

const addressSchema = z.object({
  address: z.string().min(1, 'Address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.enum(US_STATES as [string, ...string[]], { message: 'Please select a valid US state' }),
  zip_code: z.string().min(5, 'Zip code must be at least 5 characters'),
});

/**
 * Member Profile Page Component
 *
 * This page displays:
 * - Personal information (name, nickname, contact details)
 * - Address information
 * - Account details and BCA member number
 * - Membership dues status with visual indicators
 *
 * Features:
 * - Color-coded dues status (green=paid, red=overdue, yellow=never paid)
 * - Status badges and expiration information
 * - Comprehensive member data display
 */
export const Profile: React.FC = () => {
  const { user } = useUser();
  const { member, loading } = useUserProfile();

  // Edit mode state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [successMessageType, setSuccessMessageType] = useState('');

  // Error states for validation
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Form state
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const [personalForm, setPersonalForm] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    date_of_birth: ''
  });

  const [contactForm, setContactForm] = useState({
    email: '',
    phone: ''
  });

  // Initialize form when entering edit mode
  const handleEditAddress = () => {
    if (member) {
      setAddressForm({
        address: member.address,
        city: member.city,
        state: member.state,
        zip_code: member.zip_code
      });
    }
    setIsEditingAddress(true);
  };

  // Handle form submission
  const handleSaveAddress = () => {
    if (!member) return;

    // Clear previous errors
    setAddressErrors({});

    // Validate form data
    const validation = addressSchema.safeParse(addressForm);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setAddressErrors(errors);
      console.log('Validation failed:', errors);
      return;
    }

    // Apply formatting standards to validated data
    const formattedData = {
      address: capitalizeWords(validation.data.address),
      city: capitalizeWords(validation.data.city),
      state: validation.data.state.toUpperCase(),
      zip_code: validation.data.zip_code
    };

    // Detect what changed (compare against formatted data)
    const changes: string[] = [];
    if (formattedData.address !== member.address) changes.push(`Address: "${member.address}" → "${formattedData.address}"`);
    if (formattedData.city !== member.city) changes.push(`City: "${member.city}" → "${formattedData.city}"`);
    if (formattedData.state !== member.state) changes.push(`State: "${member.state}" → "${formattedData.state}"`);
    if (formattedData.zip_code !== member.zip_code) changes.push(`Zip Code: "${member.zip_code}" → "${formattedData.zip_code}"`);

    console.log('=== ADDRESS UPDATE REQUEST ===');
    console.log('Member ID:', member?.id);
    console.log('User ID:', user?.id);
    console.log('Validation Result:', validation.success ? 'PASSED' : 'FAILED');
    console.log('Changes Made:', changes);
    console.log('Raw Form Data:', addressForm);
    console.log('Validated Data:', validation.data);
    console.log('Formatted Data for Database:', formattedData);
    console.log('Database Query Needed: UPDATE members SET address = ?, city = ?, state = ?, zip_code = ? WHERE user_id = ?');
    console.log('Query Parameters:', [formattedData.address, formattedData.city, formattedData.state, formattedData.zip_code, user?.id]);
    console.log('===============================');

    // Show success popup with changes
    setChangedFields(changes);
    setSuccessMessageType('Address');
    setShowSuccessMessage(true);
    setIsEditingAddress(false);

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
      setChangedFields([]);
      setSuccessMessageType('');
    }, 5000);
  };

  // Handle cancel
  const handleCancelAddress = () => {
    setIsEditingAddress(false);
    setAddressErrors({}); // Clear errors when canceling
  };

  // Personal Information handlers
  const handleEditPersonal = () => {
    if (member) {
      setPersonalForm({
        first_name: member.first_name,
        last_name: member.last_name,
        nickname: member.nickname || '',
        date_of_birth: member.date_of_birth
      });
    }
    setIsEditingPersonal(true);
  };

  const handleSavePersonal = () => {
    if (!member) return;

    // Clear previous errors
    setPersonalErrors({});

    // Validate form data
    const validation = personalInfoSchema.safeParse(personalForm);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setPersonalErrors(errors);
      console.log('Validation failed:', errors);
      return;
    }

    // Apply formatting standards to validated data
    const formattedData = {
      first_name: capitalizeWords(validation.data.first_name),
      last_name: capitalizeWords(validation.data.last_name),
      nickname: validation.data.nickname?.trim() || null,
      date_of_birth: validation.data.date_of_birth
    };

    // Detect changes
    const changes: string[] = [];
    if (formattedData.first_name !== member.first_name) changes.push(`First Name: "${member.first_name}" → "${formattedData.first_name}"`);
    if (formattedData.last_name !== member.last_name) changes.push(`Last Name: "${member.last_name}" → "${formattedData.last_name}"`);
    if (formattedData.nickname !== member.nickname) changes.push(`Nickname: "${member.nickname || 'None'}" → "${formattedData.nickname || 'None'}"`);
    if (formattedData.date_of_birth !== member.date_of_birth) changes.push(`Date of Birth: "${member.date_of_birth}" → "${formattedData.date_of_birth}"`);

    console.log('=== PERSONAL INFO UPDATE REQUEST ===');
    console.log('Member ID:', member?.id);
    console.log('User ID:', user?.id);
    console.log('Validation Result:', validation.success ? 'PASSED' : 'FAILED');
    console.log('Changes Made:', changes);
    console.log('Raw Form Data:', personalForm);
    console.log('Validated Data:', validation.data);
    console.log('Formatted Data for Database:', formattedData);
    console.log('Database Query Needed: UPDATE members SET first_name = ?, last_name = ?, nickname = ?, date_of_birth = ? WHERE user_id = ?');
    console.log('Query Parameters:', [formattedData.first_name, formattedData.last_name, formattedData.nickname, formattedData.date_of_birth, user?.id]);
    console.log('===============================');

    setChangedFields(changes);
    setSuccessMessageType('Personal Information');
    setShowSuccessMessage(true);
    setIsEditingPersonal(false);

    setTimeout(() => {
      setShowSuccessMessage(false);
      setChangedFields([]);
      setSuccessMessageType('');
    }, 5000);
  };

  const handleCancelPersonal = () => {
    setIsEditingPersonal(false);
    setPersonalErrors({}); // Clear errors when canceling
  };

  // Contact Information handlers
  const handleEditContact = () => {
    if (member) {
      setContactForm({
        email: member.email,
        phone: member.phone
      });
    }
    setIsEditingContact(true);
  };

  const handleSaveContact = () => {
    if (!member) return;

    // Clear previous errors
    setContactErrors({});

    // Validate form data
    const validation = contactInfoSchema.safeParse(contactForm);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setContactErrors(errors);
      return;
    }

    // Apply formatting standards to validated data
    const formattedData = {
      email: validation.data.email.toLowerCase(),
      phone: formatPhoneNumber(validation.data.phone) // Ensure consistent phone formatting
    };

    // Detect changes
    const changes: string[] = [];
    if (formattedData.email !== member.email) changes.push(`Email: "${member.email}" → "${formattedData.email}"`);
    if (formattedData.phone !== member.phone) changes.push(`Phone: "${member.phone}" → "${formattedData.phone}"`);

    console.log('=== CONTACT INFO UPDATE REQUEST ===');
    console.log('Member ID:', member?.id);
    console.log('User ID:', user?.id);
    console.log('Validation Result:', validation.success ? 'PASSED' : 'FAILED');
    console.log('Changes Made:', changes);
    console.log('Raw Form Data:', contactForm);
    console.log('Validated Data (10 digits):', validation.data);
    console.log('Formatted Data for Database:', formattedData);
    console.log('Database Query Needed: UPDATE members SET email = ?, phone = ? WHERE user_id = ?');
    console.log('Query Parameters:', [formattedData.email, formattedData.phone, user?.id]);
    console.log('===============================');

    setChangedFields(changes);
    setSuccessMessageType('Contact Information');
    setShowSuccessMessage(true);
    setIsEditingContact(false);

    setTimeout(() => {
      setShowSuccessMessage(false);
      setChangedFields([]);
      setSuccessMessageType('');
    }, 5000);
  };

  const handleCancelContact = () => {
    setIsEditingContact(false);
    setContactErrors({}); // Clear errors when canceling
  };

  if (loading) {
    return <div>Loading your profile...</div>;
  }

  if (!member) {
    return <div>Error: No member record found</div>;
  }

  return (
    <LoginCard
      title="Member Profile"
      description="Your complete member information"
    >
      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{successMessageType} Updated Successfully!</h3>
              {changedFields.length > 0 && (
                <div className="mt-2 text-sm text-green-700">
                  <p className="font-medium">Changes made:</p>
                  <ul className="mt-1 list-disc list-inside">
                    {changedFields.map((change, index) => (
                      <li key={index} className="text-xs">{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              {!isEditingPersonal ? (
                <button
                  onClick={handleEditPersonal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSavePersonal} size="sm">Save</Button>
                  <Button onClick={handleCancelPersonal} variant="outline" size="sm">Cancel</Button>
                </div>
              )}
            </div>

            {!isEditingPersonal ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {member.first_name} {member.last_name}</p>
                {member.nickname && <p><strong>Nickname:</strong> {member.nickname}</p>}
                <p><strong>Date of Birth:</strong> {new Date(member.date_of_birth).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalForm.first_name}
                      onChange={(e) => setPersonalForm({...personalForm, first_name: e.target.value})}
                      placeholder="Enter first name"
                      required
                    />
                    {personalErrors.first_name && (
                      <p className="text-red-600 text-sm mt-1">{personalErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalForm.last_name}
                      onChange={(e) => setPersonalForm({...personalForm, last_name: e.target.value})}
                      placeholder="Enter last name"
                      required
                    />
                    {personalErrors.last_name && (
                      <p className="text-red-600 text-sm mt-1">{personalErrors.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="nickname">Nickname (Optional)</Label>
                  <Input
                    id="nickname"
                    value={personalForm.nickname}
                    onChange={(e) => setPersonalForm({...personalForm, nickname: e.target.value})}
                    placeholder="Enter nickname"
                  />
                  {personalErrors.nickname && (
                    <p className="text-red-600 text-sm mt-1">{personalErrors.nickname}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalForm.date_of_birth}
                    onChange={(e) => setPersonalForm({...personalForm, date_of_birth: e.target.value})}
                    required
                  />
                  {personalErrors.date_of_birth && (
                    <p className="text-red-600 text-sm mt-1">{personalErrors.date_of_birth}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              {!isEditingContact ? (
                <button
                  onClick={handleEditContact}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveContact} size="sm">Save</Button>
                  <Button onClick={handleCancelContact} variant="outline" size="sm">Cancel</Button>
                </div>
              )}
            </div>

            {!isEditingContact ? (
              <div className="space-y-2">
                <p><strong>Email:</strong> {member.email}</p>
                <p><strong>Phone:</strong> {member.phone}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                  {contactErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{contactErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={contactForm.phone}
                    onChange={(e) => {
                      // Apply real-time formatting as user types (same as NewPlayerForm)
                      const formatted = formatPhoneNumber(e.target.value);
                      setContactForm({...contactForm, phone: formatted});
                    }}
                    placeholder="123-456-7890"
                    maxLength={12} // Limit to formatted length: XXX-XXX-XXXX
                    required
                  />
                  {contactErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{contactErrors.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Address</h3>
            {!isEditingAddress ? (
              <button
                onClick={handleEditAddress}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSaveAddress} size="sm">Save</Button>
                <Button onClick={handleCancelAddress} variant="outline" size="sm">Cancel</Button>
              </div>
            )}
          </div>

          {!isEditingAddress ? (
            <div className="space-y-1">
              <p>{member.address}</p>
              <p>{member.city}, {member.state} {member.zip_code}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                  placeholder="Enter street address"
                />
                {addressErrors.address && (
                  <p className="text-red-600 text-sm mt-1">{addressErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    placeholder="Enter city"
                  />
                  {addressErrors.city && (
                    <p className="text-red-600 text-sm mt-1">{addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={addressForm.state}
                    onValueChange={(value) => setAddressForm({...addressForm, state: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {addressErrors.state && (
                    <p className="text-red-600 text-sm mt-1">{addressErrors.state}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={addressForm.zip_code}
                    onChange={(e) => setAddressForm({...addressForm, zip_code: e.target.value})}
                    placeholder="Enter zip code"
                  />
                  {addressErrors.zip_code && (
                    <p className="text-red-600 text-sm mt-1">{addressErrors.zip_code}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Details Section */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Account Details</h3>
          <div className="space-y-2">
            {/* TODO: If we get access to BCA membership API, add verification functionality for these numbers */}
            <p><strong>BCA Member Number:</strong> {member.bca_member_number || 'Unknown'}</p>
            <p><strong>Role:</strong> {member.role}</p>
            <p><strong>Member Since:</strong> {new Date(member.created_at).toLocaleDateString()}</p>
            {member.membership_paid_date && (
              <p><strong>Membership Paid:</strong> {new Date(member.membership_paid_date).toLocaleDateString()}</p>
            )}
            <p><strong>Account Email:</strong> {user?.email}</p>
          </div>
        </div>

        {/* Membership Dues Status Section */}
        <div className={`p-4 border rounded-lg ${getDuesStatusStyling(member.membership_paid_date).bgColor} ${getDuesStatusStyling(member.membership_paid_date).borderColor}`}>
          <h3 className="font-semibold text-lg mb-3">Membership Dues Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className={`font-medium ${getDuesStatusStyling(member.membership_paid_date).textColor}`}>
                {getMembershipStatus(member.membership_paid_date).statusMessage}
              </p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDuesStatusStyling(member.membership_paid_date).badgeColor}`}>
                {getMembershipStatus(member.membership_paid_date).status === 'current' ? 'PAID' :
                 getMembershipStatus(member.membership_paid_date).status === 'overdue' ? 'OVERDUE' : 'UNPAID'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {formatDueDate(member.membership_paid_date)}
            </p>
          </div>
        </div>
      </div>
    </LoginCard>
  );
};