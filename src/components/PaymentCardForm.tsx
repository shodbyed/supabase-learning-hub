/**
 * @fileoverview PaymentCardForm Component
 * Reusable payment card form with secure tokenization and validation
 */
import React, { useState } from 'react';
import {
  formatCardNumber,
  formatExpiryDate,
  formatCVV,
  getCardBrand,
} from '../utils/formatters';

/**
 * Payment card information interface
 */
interface PaymentCardData {
  paymentToken: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  billingZip: string;
  paymentVerified: boolean;
}

/**
 * Props for PaymentCardForm component
 */
interface PaymentCardFormProps {
  /** Callback when card is successfully verified */
  onVerificationSuccess: (cardData: PaymentCardData) => void;
  /** Callback when verification fails */
  onVerificationError?: (error: string) => void;
  /** Whether the form is currently processing */
  loading?: boolean;
  /** Custom verify button text */
  verifyButtonText?: string;
  /** Whether to show the verification success state */
  showSuccess?: boolean;
  /** Existing card data to display in success state */
  cardData?: PaymentCardData;
}

/**
 * PaymentCardForm Component
 *
 * Reusable payment card form with secure handling and validation.
 * Handles card input formatting, validation, and mock verification.
 *
 * Features:
 * - Real-time card number formatting (1234 5678 9012 3456)
 * - Expiry date formatting (MM/YY)
 * - CVV input validation
 * - Card brand detection
 * - Mock $0.00 authorization for verification
 * - Success/error state management
 *
 * @param onVerificationSuccess - Called when card verification succeeds
 * @param onVerificationError - Called when verification fails
 * @param loading - External loading state
 * @param verifyButtonText - Custom button text
 * @param showSuccess - Whether to show success state
 * @param cardData - Existing card data for success display
 */
export const PaymentCardForm: React.FC<PaymentCardFormProps> = ({
  onVerificationSuccess,
  onVerificationError,
  loading = false,
  verifyButtonText = 'Verify Card ($0.00 Authorization)',
  showSuccess = false,
  cardData
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingZip: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);

  /**
   * Handle card number input with formatting
   */
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  /**
   * Handle expiry date input with formatting
   */
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
  };

  /**
   * Handle CVV input with validation
   */
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCVV(e.target.value);
    setFormData(prev => ({ ...prev, cvv: formatted }));
  };

  /**
   * Handle billing ZIP input
   */
  const handleBillingZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, billingZip: e.target.value }));
  };

  /**
   * Mock card verification process
   * In production, this would integrate with Stripe/Square
   */
  const handleVerifyCard = async () => {
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.billingZip) {
      onVerificationError?.('Please fill in all card information');
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful verification
      const cardBrand = getCardBrand(formData.cardNumber);
      const cardLast4 = formData.cardNumber.replace(/\D/g, '').slice(-4);
      const [month, year] = formData.expiryDate.split('/');

      const cardData: PaymentCardData = {
        paymentToken: 'tok_mock_' + Date.now(),
        cardLast4,
        cardBrand,
        expiryMonth: parseInt(month, 10),
        expiryYear: parseInt('20' + year, 10),
        billingZip: formData.billingZip,
        paymentVerified: true
      };

      onVerificationSuccess(cardData);
    } catch (error) {
      onVerificationError?.('Card verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Show success state if verification completed
  if (showSuccess && cardData) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-center space-x-3">
          <span className="text-green-600 text-xl">✅</span>
          <div>
            <h4 className="font-semibold text-green-800">Card Verified Successfully!</h4>
            <p className="text-green-700 text-sm">
              Card ending in {cardData.cardLast4} • {cardData.cardBrand?.toUpperCase()}
            </p>
            <p className="text-green-600 text-xs mt-1">
              Ready to proceed - no charges have been made.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-green-600 text-lg">🔒</span>
          <div>
            <h4 className="font-semibold text-green-800 mb-2">
              Secure Payment Setup
            </h4>
            <p className="text-green-700 text-sm mb-2">
              We use bank-level encryption to protect your payment information.
            </p>
            <p className="text-green-700 text-sm font-medium">
              No charges will be made at this time - we're just verifying your card.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={19}
                disabled={loading || isVerifying}
              />
              <div className="absolute right-3 top-2">
                <span className="text-xs text-gray-500">VISA/MC/AMEX</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleExpiryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={5}
                disabled={loading || isVerifying}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={handleCvvChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={4}
                disabled={loading || isVerifying}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing ZIP Code
            </label>
            <input
              type="text"
              placeholder="12345"
              value={formData.billingZip}
              onChange={handleBillingZipChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={10}
              disabled={loading || isVerifying}
            />
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyCard}
            disabled={loading || isVerifying}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : verifyButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};