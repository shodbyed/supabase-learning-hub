/**
 * @fileoverview Payment Method Card
 *
 * Displays payment method information (credit card).
 * Currently shows "Coming Soon" - will be implemented when Stripe integration is ready.
 *
 * Future: Will display card_brand and card_last4 from operator profile
 * and provide "Update Card" button to open Stripe payment modal.
 */

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { LeagueOperator } from '@/types/operator';

interface PaymentMethodCardProps {
  operatorProfile: LeagueOperator;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  operatorProfile,
}) => {
  // Suppress unused variable warning - will be used when Stripe is implemented
  void operatorProfile;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600 font-medium mb-2">Credit Card</p>
          <p className="text-sm text-gray-500 mb-4">
            Credit card management will be available when Stripe integration is complete
          </p>
          <Button disabled className="w-full cursor-not-allowed opacity-50">
            Coming Soon
          </Button>
          {/* TODO: Implement credit card update when Stripe integration is ready */}
          {/* Will need to show card_brand and card_last4 */}
          {/* Add "Update Card" button that opens Stripe payment modal */}
        </div>
      </CardContent>
    </Card>
  );
};
