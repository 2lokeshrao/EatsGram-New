/**
 * Razorpay Payment Gateway
 * Handles all Razorpay payment operations
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

class RazorpayGateway {
  constructor() {
    this.razorpay = null;
  }

  /**
   * Initialize Razorpay
   */
  async initialize() {
    try {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
      }

      console.log('✅ Razorpay Initialized Successfully');
      return this.razorpay;
    } catch (error) {
      console.error('❌ Razorpay Initialization Error:', error.message);
      throw error;
    }
  }

  /**
   * Create Payment Order
   */
  async createOrder(amount, currency = 'INR', metadata = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        receipt: metadata.receipt || `receipt_${Date.now()}`,
        notes: {
          order_id: metadata.order_id,
          user_id: metadata.user_id,
          restaurant_id: metadata.restaurant_id,
          ...metadata,
        },
      };

      const order = await this.razorpay.orders.create(options);

      console.log('✅ Razorpay Order Created:', order.id);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        createdAt: new Date(order.created_at * 1000),
      };
    } catch (error) {
      console.error('❌ Error Creating Razorpay Order:', error.message);
      throw error;
    }
  }

  /**
   * Verify Payment
   */
  async verifyPayment(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new Error('Invalid Payment Signature');
      }

      // Fetch payment details
      const payment = await this.razorpay.payments.fetch(razorpay_payment_id);

      console.log('✅ Payment Verified Successfully:', razorpay_payment_id);
      return {
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000),
      };
    } catch (error) {
      console.error('❌ Payment Verification Error:', error.message);
      throw error;
    }
  }

  /**
   * Refund Payment
   */
  async refundPayment(paymentId, amount = null) {
    try {
      const options = {};
      if (amount) {
        options.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, options);

      console.log('✅ Refund Processed:', refund.id);
      return {
        success: true,
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount,
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000),
      };
    } catch (error) {
      console.error('❌ Refund Error:', error.message);
      throw error;
    }
  }

  /**
   * Get Payment Status
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        success: true,
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000),
      };
    } catch (error) {
      console.error('❌ Error Fetching Payment Status:', error.message);
      throw error;
    }
  }

  /**
   * Handle Webhook
   */
  async handleWebhook(event, signature) {
    try {
      // Verify webhook signature
      const body = JSON.stringify(event);
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid Webhook Signature');
      }

      console.log('✅ Webhook Verified:', event.event);

      // Handle different webhook events
      switch (event.event) {
        case 'payment.authorized':
          return this.handlePaymentAuthorized(event.payload.payment.entity);
        case 'payment.failed':
          return this.handlePaymentFailed(event.payload.payment.entity);
        case 'payment.captured':
          return this.handlePaymentCaptured(event.payload.payment.entity);
        case 'refund.created':
          return this.handleRefundCreated(event.payload.refund.entity);
        default:
          console.log('⚠️ Unknown Webhook Event:', event.event);
          return { success: true, message: 'Webhook received' };
      }
    } catch (error) {
      console.error('❌ Webhook Error:', error.message);
      throw error;
    }
  }

  /**
   * Handle Payment Authorized
   */
  async handlePaymentAuthorized(payment) {
    console.log('✅ Payment Authorized:', payment.id);
    return {
      event: 'payment.authorized',
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
    };
  }

  /**
   * Handle Payment Failed
   */
  async handlePaymentFailed(payment) {
    console.log('❌ Payment Failed:', payment.id);
    return {
      event: 'payment.failed',
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
      error: payment.error_description,
    };
  }

  /**
   * Handle Payment Captured
   */
  async handlePaymentCaptured(payment) {
    console.log('✅ Payment Captured:', payment.id);
    return {
      event: 'payment.captured',
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
    };
  }

  /**
   * Handle Refund Created
   */
  async handleRefundCreated(refund) {
    console.log('✅ Refund Created:', refund.id);
    return {
      event: 'refund.created',
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      status: refund.status,
    };
  }
}

module.exports = RazorpayGateway;
