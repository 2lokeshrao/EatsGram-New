# 🎯 Razorpay Payment Gateway Integration Guide

यह guide आपको EatsGram में Razorpay payment gateway integrate करने में मदद करेगा।

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Backend Setup](#backend-setup)
4. [Admin Dashboard Setup](#admin-dashboard-setup)
5. [Web App Integration](#web-app-integration)
6. [Mobile App Integration](#mobile-app-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Razorpay Account Setup:

1. **Razorpay Account बनाएं**: https://razorpay.com
2. **API Keys प्राप्त करें**:
   - Dashboard → Settings → API Keys
   - **Key ID** (Public Key)
   - **Key Secret** (Secret Key)

### Required Packages:

```bash
# Node.js Backend के लिए
npm install razorpay

# React/Next.js के लिए
npm install razorpay react-razorpay

# React Native के लिए
npm install react-native-razorpay
```

---

## Installation

### Step 1: Backend Setup

#### Install Razorpay Package:

```bash
cd EatsGram-backend  # या जहाँ आपका backend है
npm install razorpay
```

#### Create Razorpay Service File:

```bash
# Backend में नई file बनाएं
touch src/services/razorpay.service.js
```

#### Razorpay Service Code:

```javascript
// src/services/razorpay.service.js

const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Order बनाएं
const createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

// Payment Verify करें
const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const crypto = require('crypto');
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    return isAuthentic;
  } catch (error) {
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
};

// Refund दें
const refundPayment = async (payment_id, amount) => {
  try {
    const refund = await razorpayInstance.payments.refund(payment_id, {
      amount: amount * 100, // Amount in paise
    });
    return refund;
  } catch (error) {
    throw new Error(`Failed to refund payment: ${error.message}`);
  }
};

module.exports = {
  razorpayInstance,
  createOrder,
  verifyPayment,
  refundPayment,
};
```

### Step 2: Environment Variables

#### .env File में Add करें:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## Backend Setup

### GraphQL Mutations बनाएं:

```javascript
// src/graphql/mutations/payment.mutations.js

const createRazorpayOrderMutation = `
  mutation CreateRazorpayOrder($amount: Float!, $orderId: String!) {
    createRazorpayOrder(amount: $amount, orderId: $orderId) {
      id
      entity
      amount
      amount_paid
      amount_due
      currency
      receipt
      status
      attempts
      notes
      created_at
    }
  }
`;

const verifyRazorpayPaymentMutation = `
  mutation VerifyRazorpayPayment(
    $orderId: String!
    $paymentId: String!
    $signature: String!
  ) {
    verifyRazorpayPayment(
      orderId: $orderId
      paymentId: $paymentId
      signature: $signature
    ) {
      success
      message
      orderId
    }
  }
`;

module.exports = {
  createRazorpayOrderMutation,
  verifyRazorpayPaymentMutation,
};
```

### Resolver बनाएं:

```javascript
// src/graphql/resolvers/payment.resolver.js

const { createOrder, verifyPayment } = require('../../services/razorpay.service');

const paymentResolvers = {
  Mutation: {
    createRazorpayOrder: async (_, { amount, orderId }) => {
      try {
        const order = await createOrder(amount, 'INR', orderId);
        return order;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    verifyRazorpayPayment: async (
      _,
      { orderId, paymentId, signature }
    ) => {
      try {
        const isValid = await verifyPayment(orderId, paymentId, signature);
        
        if (isValid) {
          // Update order status in database
          // await Order.updateOne({ _id: orderId }, { status: 'paid' });
          
          return {
            success: true,
            message: 'Payment verified successfully',
            orderId,
          };
        } else {
          return {
            success: false,
            message: 'Payment verification failed',
            orderId,
          };
        }
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

module.exports = paymentResolvers;
```

---

## Admin Dashboard Setup

### Razorpay Configuration Form बनाएं:

```bash
mkdir -p EatsGram-admin/lib/ui/screen-components/protected/super-admin/configuration/add-form/razorpay
```

#### File: `EatsGram-admin/lib/ui/screen-components/protected/super-admin/configuration/add-form/razorpay/index.tsx`

```typescript
'use client';

import { Form, Formik } from 'formik';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';
import ConfigCard from '../../view/card';
import useToast from '@/lib/hooks/useToast';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { IRazorpayForm } from '@/lib/utils/interfaces/configurations.interface';
import { RazorpayValidationSchema } from '@/lib/utils/schema';
import {
  GET_CONFIGURATION,
  SAVE_RAZORPAY_CONFIGURATION,
} from '@/lib/api/graphql';
import { useMutation } from '@apollo/client';

const RazorpayAddForm = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = useConfiguration();
  const { showToast } = useToast();

  const initialValues = {
    keyId: RAZORPAY_KEY_ID || '',
    keySecret: RAZORPAY_KEY_SECRET || '',
  };

  const [mutate, { loading: mutationLoading }] = useMutation(
    SAVE_RAZORPAY_CONFIGURATION,
    {
      refetchQueries: [{ query: GET_CONFIGURATION }],
    }
  );

  const handleSubmit = (values: IRazorpayForm) => {
    mutate({
      variables: {
        configurationInput: {
          keyId: values.keyId,
          keySecret: values.keySecret,
        },
      },
      onCompleted: () => {
        showToast({
          type: 'success',
          title: 'Success!',
          message: 'Razorpay Configurations Updated',
          duration: 3000,
        });
      },
      onError: (error) => {
        showToast({
          type: 'error',
          title: 'Error!',
          message: error.graphQLErrors[0]?.message || 'Failed to update',
          duration: 3000,
        });
      },
    });
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={RazorpayValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched }) => (
          <Form>
            <ConfigCard
              title="Razorpay Configuration"
              description="Add your Razorpay API credentials"
            >
              <CustomPasswordTextField
                label="Key ID"
                name="keyId"
                placeholder="Enter Razorpay Key ID"
                value={values.keyId}
                error={errors.keyId}
                touched={touched.keyId}
              />
              <CustomPasswordTextField
                label="Key Secret"
                name="keySecret"
                placeholder="Enter Razorpay Key Secret"
                value={values.keySecret}
                error={errors.keySecret}
                touched={touched.keySecret}
              />
              <button
                type="submit"
                disabled={mutationLoading}
                className="btn btn-primary"
              >
                {mutationLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </ConfigCard>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RazorpayAddForm;
```

---

## Web App Integration

### Payment Component बनाएं:

```bash
mkdir -p EatsGram-web/lib/ui/useable-components/razorpay-payment
```

#### File: `EatsGram-web/lib/ui/useable-components/razorpay-payment/index.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_RAZORPAY_ORDER, VERIFY_RAZORPAY_PAYMENT } from '@/lib/api/graphql';

interface RazorpayPaymentProps {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

const RazorpayPayment = ({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}: RazorpayPaymentProps) => {
  const [loading, setLoading] = useState(false);

  const [createOrder] = useMutation(CREATE_RAZORPAY_ORDER);
  const [verifyPayment] = useMutation(VERIFY_RAZORPAY_PAYMENT);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create Razorpay Order
      const { data } = await createOrder({
        variables: {
          amount,
          orderId,
        },
      });

      const razorpayOrder = data.createRazorpayOrder;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'EatsGram',
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        handler: async (response: any) => {
          // Step 3: Verify Payment
          const verifyResult = await verifyPayment({
            variables: {
              orderId: razorpayOrder.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
          });

          if (verifyResult.data.verifyRazorpayPayment.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            onError('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            onError('Payment cancelled');
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn btn-primary w-full"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default RazorpayPayment;
```

---

## Mobile App Integration

### React Native Razorpay Setup:

```bash
cd EatsGram-app
npm install react-native-razorpay
```

#### File: `EatsGram-app/src/components/RazorpayPayment.js`

```javascript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useMutation } from '@apollo/client';
import { CREATE_RAZORPAY_ORDER, VERIFY_RAZORPAY_PAYMENT } from '../graphql/mutations';

const RazorpayPayment = ({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [createOrder] = useMutation(CREATE_RAZORPAY_ORDER);
  const [verifyPayment] = useMutation(VERIFY_RAZORPAY_PAYMENT);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create Razorpay Order
      const { data } = await createOrder({
        variables: { amount, orderId },
      });

      const razorpayOrder = data.createRazorpayOrder;

      const options = {
        description: `Order #${orderId}`,
        image: 'https://your-logo-url.png',
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id,
        name: 'EatsGram',
        prefill: {
          email: customerEmail,
          contact: customerPhone,
          name: customerName,
        },
        theme: { color: '#FF6B35' },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Verify Payment
          const verifyResult = await verifyPayment({
            variables: {
              orderId: razorpayOrder.id,
              paymentId: data.razorpay_payment_id,
              signature: data.razorpay_signature,
            },
          });

          if (verifyResult.data.verifyRazorpayPayment.success) {
            onSuccess(data.razorpay_payment_id);
          } else {
            onError('Payment verification failed');
          }
        })
        .catch((error) => {
          onError(error.description || 'Payment failed');
        });
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePayment}
      disabled={loading}
      style={{
        backgroundColor: '#FF6B35',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Pay ₹{amount}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default RazorpayPayment;
```

---

## Testing

### Test Credentials:

```
Key ID: rzp_test_1DP5gbNptcWd65
Key Secret: (Razorpay Dashboard से प्राप्त करें)
```

### Test Cards:

| Card Number | Expiry | CVV | Status |
|------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any Future Date | Any 3 Digits | Success |
| 4000 0000 0000 0002 | Any Future Date | Any 3 Digits | Decline |

### Test OTP:

- OTP: **123456**
- 3D Secure: **1111**

---

## Troubleshooting

### Common Issues:

1. **"Invalid API Key"**
   - Check RAZORPAY_KEY_ID in .env
   - Verify credentials from Razorpay Dashboard

2. **"Payment Verification Failed"**
   - Check RAZORPAY_KEY_SECRET
   - Verify signature calculation

3. **"Order Creation Failed"**
   - Check amount format (should be in paise)
   - Verify currency code

4. **"CORS Error"**
   - Add Razorpay domain to CORS whitelist
   - Check backend CORS configuration

---

## Production Checklist

- [ ] Switch to Live API Keys
- [ ] Update environment variables
- [ ] Test with real payments
- [ ] Set up webhook for payment notifications
- [ ] Configure refund policies
- [ ] Add payment receipt generation
- [ ] Set up payment analytics
- [ ] Test error handling

---

## Useful Links

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Dashboard](https://dashboard.razorpay.com)
- [Razorpay Support](https://razorpay.com/support/)

---

**Last Updated**: October 16, 2025
**Maintained by**: EatsGram Team
