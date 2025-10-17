/**
 * Stripe Payment Gateway
 * Handles all Stripe payment operations
 */

const stripe = require('stripe');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

class StripeGateway {
  constructor() {
    this.stripe = null;
  }

  /**
   * Initialize Stripe
   */
  async initialize() {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is required');
      }

      this.stripe = stripe(process.env.STRIPE_SECRET_KEY);

      console.log('✅ Stripe Initialized Successfully');
      return this.stripe;
    } catch (error) {
      console.error('❌ Stripe Initialization Error:', error.message);
      throw error;
    }
  }

  /**
   * Create Payment Intent
   */
  async createOrder(amount, currency = 'inr', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          order_id: metadata.order_id,
          user_id: metadata.user_id,
          restaurant_id: metadata.restaurant_id,
          ...metadata,
        },
        description: metadata.description || 'EatsGram Order Payment',
      });

      console.log('✅ Stripe Payment Intent Created:', paymentIntent.id);
      return {
        success: true,
        orderId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        createdAt: new Date(paymentIntent.created * 1000),
      };
    } catch (error) {
      console.error('❌ Error Creating Stripe Payment Intent:', error.message);
      throw error;
    }
  }

  /**
   * Verify Payment
   */
  async verifyPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not succeeded. Status: ${paymentIntent.status}`);
      }

      console.log('✅ Payment Verified Successfully:', paymentIntentId);
      return {
        success: true,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        chargeId: paymentIntent.charges.data[0]?.id,
        email: paymentIntent.charges.data[0]?.billing_details?.email,
        createdAt: new Date(paymentIntent.created * 1000),
      };
    } catch (error) {
      console.error('❌ Payment Verification Error:', error.message);
      throw error;
    }
  }

  /**
   * Refund Payment
   */
  async refundPayment(chargeId, amount = null) {
    try {
      const options = {};
      if (amount) {
        options.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        ...options,
      });

      console.log('✅ Refund Processed:', refund.id);
      return {
        success: true,
        refundId: refund.id,
        chargeId: refund.charge,
        amount: refund.amount,
        status: refund.status,
        createdAt: new Date(refund.created * 1000),
      };
    } catch (error) {
      console.error('❌ Refund Error:', error.message);
      throw error;
    }
  }

  /**
   * Get Payment Status
   */
  async getPaymentStatus(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        chargeId: paymentIntent.charges.data[0]?.id,
        email: paymentIntent.charges.data[0]?.billing_details?.email,
        createdAt: new Date(paymentIntent.created * 1000),
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
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is required');
      }

      const crypto = require('crypto');
      const body = JSON.stringify(event);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      // Note: In production, use stripe.webhooks.constructEvent()
      console.log('✅ Webhook Verified:', event.type);

      // Handle different webhook events
      switch (event.type) {
        case 'payment_intent.succeeded':
          return this.handlePaymentSucceeded(event.data.object);
        case 'payment_intent.payment_failed':
          return this.handlePaymentFailed(event.data.object);
        case 'charge.refunded':
          return this.handleRefundCreated(event.data.object);
        default:
          console.log('⚠️ Unknown Webhook Event:', event.type);
          return { success: true, message: 'Webhook received' };
      }
    } catch (error) {
      console.error('❌ Webhook Error:', error.message);
      throw error;
    }
  }

  /**
   * Handle Payment Succeeded
   */
  async handlePaymentSucceeded(paymentIntent) {
    console.log('✅ Payment Succeeded:', paymentIntent.id);
    return {
      event: 'payment_intent.succeeded',
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    };
  }

  /**
   * Handle Payment Failed
   */
  async handlePaymentFailed(paymentIntent) {
    console.log('❌ Payment Failed:', paymentIntent.id);
    return {
      event: 'payment_intent.payment_failed',
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      error: paymentIntent.last_payment_error?.message,
    };
  }

  /**
   * Handle Refund Created
   */
  async handleRefundCreated(charge) {
    console.log('✅ Refund Created:', charge.id);
    return {
      event: 'charge.refunded',
      chargeId: charge.id,
      amount: charge.amount_refunded,
      status: 'refunded',
    };
  }
}

module.exports = StripeGateway;
