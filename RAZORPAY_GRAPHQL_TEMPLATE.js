/**
 * Razorpay GraphQL Mutations और Queries
 * 
 * यह file आपके GraphQL schema में add करने के लिए है।
 */

// ============================================
// GraphQL Type Definitions
// ============================================

const razorpayTypeDefs = `
  type RazorpayOrder {
    id: String!
    entity: String!
    amount: Int!
    amount_paid: Int!
    amount_due: Int!
    currency: String!
    receipt: String!
    status: String!
    attempts: Int!
    notes: JSON
    created_at: Int!
  }

  type RazorpayPayment {
    id: String!
    entity: String!
    amount: Int!
    currency: String!
    status: String!
    method: String!
    description: String
    amount_refunded: Int
    refund_status: String
    captured: Boolean!
    email: String
    contact: String
    fee: Int
    tax: Int
    notes: JSON
    created_at: Int!
  }

  type PaymentVerification {
    success: Boolean!
    message: String!
    orderId: String!
    paymentId: String
  }

  type RefundResponse {
    success: Boolean!
    message: String!
    refundId: String
    amount: Int
  }

  type PaymentLinkResponse {
    success: Boolean!
    id: String!
    short_url: String!
    user_id: String
    amount: Int!
    amount_paid: Int!
    cancelled_at: Int
    expire_by: Int
    expired_at: Int
    first_min_partial_amount: Int
    notes: JSON
    notify: JSON
    payments: JSON
    reference_id: String
    reminder_enable: Boolean!
    reminders: JSON
    short_url: String!
    status: String!
    updated_at: Int!
    upi_link: Boolean
    user_id: String
    whatsapp_link: Boolean
    created_at: Int!
  }

  extend type Mutation {
    # Order बनाएं
    createRazorpayOrder(
      amount: Float!
      orderId: String!
      description: String
      notes: JSON
    ): RazorpayOrder!

    # Payment को Verify करें
    verifyRazorpayPayment(
      orderId: String!
      paymentId: String!
      signature: String!
    ): PaymentVerification!

    # Refund दें
    refundRazorpayPayment(
      paymentId: String!
      amount: Float
      reason: String
    ): RefundResponse!

    # Payment Link बनाएं
    createRazorpayPaymentLink(
      amount: Float!
      description: String!
      customerEmail: String!
      customerPhone: String!
    ): PaymentLinkResponse!
  }

  extend type Query {
    # Payment Details प्राप्त करें
    getRazorpayPaymentDetails(paymentId: String!): RazorpayPayment!

    # Order Details प्राप्त करें
    getRazorpayOrderDetails(orderId: String!): RazorpayOrder!
  }
`;

// ============================================
// GraphQL Resolvers
// ============================================

const razorpayResolvers = {
  Mutation: {
    createRazorpayOrder: async (_, { amount, orderId, description, notes }) => {
      try {
        const razorpayService = require('./services/razorpay.service');
        
        const result = await razorpayService.createOrder(
          amount,
          'INR',
          orderId,
          notes || {}
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        return result.data;
      } catch (error) {
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
      }
    },

    verifyRazorpayPayment: async (
      _,
      { orderId, paymentId, signature }
    ) => {
      try {
        const razorpayService = require('./services/razorpay.service');
        
        const isValid = razorpayService.verifyPayment(
          orderId,
          paymentId,
          signature
        );

        if (isValid) {
          // Update order status in database
          // await Order.updateOne(
          //   { _id: orderId },
          //   { paymentStatus: 'completed', paymentId }
          // );

          return {
            success: true,
            message: 'Payment verified successfully',
            orderId,
            paymentId,
          };
        } else {
          return {
            success: false,
            message: 'Payment verification failed - Invalid signature',
            orderId,
          };
        }
      } catch (error) {
        throw new Error(`Payment verification error: ${error.message}`);
      }
    },

    refundRazorpayPayment: async (
      _,
      { paymentId, amount, reason }
    ) => {
      try {
        const razorpayService = require('./services/razorpay.service');
        
        const result = await razorpayService.refundPayment(
          paymentId,
          amount,
          reason
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        return {
          success: true,
          message: 'Refund processed successfully',
          refundId: result.data.id,
          amount: result.data.amount / 100, // Convert from paise
        };
      } catch (error) {
        throw new Error(`Refund error: ${error.message}`);
      }
    },

    createRazorpayPaymentLink: async (
      _,
      { amount, description, customerEmail, customerPhone }
    ) => {
      try {
        const razorpayService = require('./services/razorpay.service');
        
        const result = await razorpayService.createPaymentLink(
          amount,
          description,
          customerEmail,
          customerPhone
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        return result.data;
      } catch (error) {
        throw new Error(`Payment link creation error: ${error.message}`);
      }
    },
  },

  Query: {
    getRazorpayPaymentDetails: async (_, { paymentId }) => {
      try {
        const razorpayService = require('./services/razorpay.service');
        
        const result = await razorpayService.getPaymentDetails(paymentId);

        if (!result.success) {
          throw new Error(result.error);
        }

        return result.data;
      } catch (error) {
        throw new Error(`Failed to fetch payment details: ${error.message}`);
      }
    },

    getRazorpayOrderDetails: async (_, { orderId }) => {
      try {
        const razorpayService = require('./services/razorpay.service');
        
        const result = await razorpayService.getOrderDetails(orderId);

        if (!result.success) {
          throw new Error(result.error);
        }

        return result.data;
      } catch (error) {
        throw new Error(`Failed to fetch order details: ${error.message}`);
      }
    },
  },
};

module.exports = {
  razorpayTypeDefs,
  razorpayResolvers,
};
