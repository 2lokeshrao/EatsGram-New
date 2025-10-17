/**
 * PayPal Payment Gateway
 * Handles all PayPal payment operations
 */

const paypalRestSdk = require('paypal-rest-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

class PayPalGateway {
  constructor() {
    this.paypal = paypalRestSdk;
  }

  /**
   * Initialize PayPal
   */
  async initialize() {
    try {
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required');
      }

      this.paypal.configure({
        mode: process.env.PAYPAL_MODE || 'sandbox',
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
      });

      console.log('✅ PayPal Initialized Successfully');
      return this.paypal;
    } catch (error) {
      console.error('❌ PayPal Initialization Error:', error.message);
      throw error;
    }
  }

  /**
   * Create Payment
   */
  async createOrder(amount, currency = 'USD', metadata = {}) {
    try {
      const paymentJson = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/payment/success',
          cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/payment/cancel',
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: metadata.description || 'EatsGram Order',
                  sku: metadata.order_id || 'order',
                  price: amount.toString(),
                  currency: currency,
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: currency,
              total: amount.toString(),
              subtotal: amount.toString(),
              tax: '0',
              shipping: '0',
            },
            description: metadata.description || 'EatsGram Order Payment',
            invoice_number: metadata.order_id || `invoice_${Date.now()}`,
            custom: JSON.stringify({
              order_id: metadata.order_id,
              user_id: metadata.user_id,
              restaurant_id: metadata.restaurant_id,
            }),
          },
        ],
      };

      return new Promise((resolve, reject) => {
        this.paypal.payment.create(paymentJson, (error, payment) => {
          if (error) {
            console.error('❌ Error Creating PayPal Payment:', error.message);
            reject(error);
          } else {
            console.log('✅ PayPal Payment Created:', payment.id);
            const approvalUrl = payment.links.find((link) => link.rel === 'approval_url');
            resolve({
              success: true,
              orderId: payment.id,
              approvalUrl: approvalUrl?.href,
              amount: payment.transactions[0].amount.total,
              currency: payment.transactions[0].amount.currency,
              status: payment.state,
              createdAt: new Date(payment.create_time),
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Error Creating PayPal Order:', error.message);
      throw error;
    }
  }

  /**
   * Execute Payment
   */
  async verifyPayment(paymentId, payerId) {
    try {
      return new Promise((resolve, reject) => {
        this.paypal.payment.execute(paymentId, { payer_id: payerId }, (error, payment) => {
          if (error) {
            console.error('❌ Payment Execution Error:', error.message);
            reject(error);
          } else {
            console.log('✅ Payment Executed Successfully:', paymentId);
            resolve({
              success: true,
              paymentId: payment.id,
              payerId: payment.payer.payer_info.email,
              amount: payment.transactions[0].amount.total,
              currency: payment.transactions[0].amount.currency,
              status: payment.state,
              transactionId: payment.transactions[0].related_resources[0].sale.id,
              createdAt: new Date(payment.create_time),
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Payment Verification Error:', error.message);
      throw error;
    }
  }

  /**
   * Refund Payment
   */
  async refundPayment(saleId, amount = null) {
    try {
      const refundRequest = {};
      if (amount) {
        refundRequest.amount = {
          currency: 'USD',
          total: amount.toString(),
        };
      }

      return new Promise((resolve, reject) => {
        this.paypal.sale.find(saleId, (error, sale) => {
          if (error) {
            console.error('❌ Error Finding Sale:', error.message);
            reject(error);
          } else {
            sale.refund(refundRequest, (error, refund) => {
              if (error) {
                console.error('❌ Refund Error:', error.message);
                reject(error);
              } else {
                console.log('✅ Refund Processed:', refund.id);
                resolve({
                  success: true,
                  refundId: refund.id,
                  saleId: refund.sale_id,
                  amount: refund.amount?.total,
                  status: refund.state,
                  createdAt: new Date(refund.create_time),
                });
              }
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Error Processing Refund:', error.message);
      throw error;
    }
  }

  /**
   * Get Payment Status
   */
  async getPaymentStatus(paymentId) {
    try {
      return new Promise((resolve, reject) => {
        this.paypal.payment.find(paymentId, (error, payment) => {
          if (error) {
            console.error('❌ Error Fetching Payment:', error.message);
            reject(error);
          } else {
            resolve({
              success: true,
              paymentId: payment.id,
              amount: payment.transactions[0].amount.total,
              currency: payment.transactions[0].amount.currency,
              status: payment.state,
              createdAt: new Date(payment.create_time),
            });
          }
        });
      });
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
      console.log('✅ Webhook Received:', event.event_type);

      // Handle different webhook events
      switch (event.event_type) {
        case 'PAYMENT.SALE.COMPLETED':
          return this.handlePaymentCompleted(event.resource);
        case 'PAYMENT.SALE.DENIED':
          return this.handlePaymentDenied(event.resource);
        case 'PAYMENT.SALE.REFUNDED':
          return this.handleRefundCompleted(event.resource);
        default:
          console.log('⚠️ Unknown Webhook Event:', event.event_type);
          return { success: true, message: 'Webhook received' };
      }
    } catch (error) {
      console.error('❌ Webhook Error:', error.message);
      throw error;
    }
  }

  /**
   * Handle Payment Completed
   */
  async handlePaymentCompleted(resource) {
    console.log('✅ Payment Completed:', resource.id);
    return {
      event: 'PAYMENT.SALE.COMPLETED',
      saleId: resource.id,
      amount: resource.amount.total,
      status: resource.state,
    };
  }

  /**
   * Handle Payment Denied
   */
  async handlePaymentDenied(resource) {
    console.log('❌ Payment Denied:', resource.id);
    return {
      event: 'PAYMENT.SALE.DENIED',
      saleId: resource.id,
      amount: resource.amount.total,
      status: resource.state,
    };
  }

  /**
   * Handle Refund Completed
   */
  async handleRefundCompleted(resource) {
    console.log('✅ Refund Completed:', resource.id);
    return {
      event: 'PAYMENT.SALE.REFUNDED',
      refundId: resource.id,
      saleId: resource.sale_id,
      amount: resource.amount.total,
      status: resource.state,
    };
  }
}

module.exports = PayPalGateway;
