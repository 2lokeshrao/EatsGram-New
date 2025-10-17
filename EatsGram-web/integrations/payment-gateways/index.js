/**
 * Payment Gateway Abstraction Layer
 * Supports Razorpay, Stripe, and PayPal
 * 
 * Usage:
 * const paymentGateway = require('./index');
 * await paymentGateway.initialize();
 * const order = await paymentGateway.createOrder(amount, currency);
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const PAYMENT_GATEWAY = process.env.PAYMENT_GATEWAY || 'razorpay'; // 'razorpay', 'stripe', 'paypal'

let gatewayInstance = null;

/**
 * Initialize Payment Gateway
 */
async function initialize() {
  if (gatewayInstance) {
    console.log('✅ Payment Gateway already initialized');
    return gatewayInstance;
  }

  try {
    if (PAYMENT_GATEWAY === 'razorpay') {
      console.log('🔄 Initializing Razorpay Gateway...');
      const RazorpayGateway = require('./razorpay/gateway');
      gatewayInstance = new RazorpayGateway();
      await gatewayInstance.initialize();
      console.log('✅ Razorpay Gateway Initialized Successfully');
    } else if (PAYMENT_GATEWAY === 'stripe') {
      console.log('🔄 Initializing Stripe Gateway...');
      const StripeGateway = require('./stripe/gateway');
      gatewayInstance = new StripeGateway();
      await gatewayInstance.initialize();
      console.log('✅ Stripe Gateway Initialized Successfully');
    } else if (PAYMENT_GATEWAY === 'paypal') {
      console.log('🔄 Initializing PayPal Gateway...');
      const PayPalGateway = require('./paypal/gateway');
      gatewayInstance = new PayPalGateway();
      await gatewayInstance.initialize();
      console.log('✅ PayPal Gateway Initialized Successfully');
    } else {
      throw new Error(`Invalid PAYMENT_GATEWAY: ${PAYMENT_GATEWAY}. Use 'razorpay', 'stripe', or 'paypal'`);
    }

    return gatewayInstance;
  } catch (error) {
    console.error('❌ Payment Gateway Initialization Error:', error.message);
    throw error;
  }
}

/**
 * Get Gateway Instance
 */
function getInstance() {
  if (!gatewayInstance) {
    throw new Error('Payment Gateway not initialized. Call initialize() first.');
  }
  return gatewayInstance;
}

/**
 * Create Payment Order
 */
async function createOrder(amount, currency = 'INR', metadata = {}) {
  return getInstance().createOrder(amount, currency, metadata);
}

/**
 * Verify Payment
 */
async function verifyPayment(paymentData) {
  return getInstance().verifyPayment(paymentData);
}

/**
 * Refund Payment
 */
async function refundPayment(paymentId, amount = null) {
  return getInstance().refundPayment(paymentId, amount);
}

/**
 * Get Payment Status
 */
async function getPaymentStatus(paymentId) {
  return getInstance().getPaymentStatus(paymentId);
}

/**
 * Handle Webhook
 */
async function handleWebhook(event, signature) {
  return getInstance().handleWebhook(event, signature);
}

module.exports = {
  initialize,
  getInstance,
  createOrder,
  verifyPayment,
  refundPayment,
  getPaymentStatus,
  handleWebhook,
  PAYMENT_GATEWAY,
};
