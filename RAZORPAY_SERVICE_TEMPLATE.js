/**
 * Razorpay Payment Service
 * 
 * यह file आपके backend में use करने के लिए है।
 * इसे अपने project structure के अनुसार modify करें।
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this.razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Razorpay Order बनाएं
   * @param {number} amount - Amount in rupees
   * @param {string} currency - Currency code (default: INR)
   * @param {string} receipt - Receipt ID
   * @param {object} notes - Additional notes
   * @returns {Promise<object>} Razorpay Order Object
   */
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt,
        notes,
        payment_capture: 1, // Auto capture
      };

      const order = await this.razorpayInstance.orders.create(options);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Payment को Verify करें
   * @param {string} orderId - Razorpay Order ID
   * @param {string} paymentId - Razorpay Payment ID
   * @param {string} signature - Razorpay Signature
   * @returns {boolean} Payment verification status
   */
  verifyPayment(orderId, paymentId, signature) {
    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Payment Details प्राप्त करें
   * @param {string} paymentId - Razorpay Payment ID
   * @returns {Promise<object>} Payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpayInstance.payments.fetch(paymentId);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refund दें
   * @param {string} paymentId - Razorpay Payment ID
   * @param {number} amount - Refund amount in rupees (optional)
   * @param {string} reason - Refund reason
   * @returns {Promise<object>} Refund details
   */
  async refundPayment(paymentId, amount = null, reason = '') {
    try {
      const refundOptions = {
        notes: {
          reason,
        },
      };

      if (amount) {
        refundOptions.amount = amount * 100; // Convert to paise
      }

      const refund = await this.razorpayInstance.payments.refund(
        paymentId,
        refundOptions
      );

      return {
        success: true,
        data: refund,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Order Details प्राप्त करें
   * @param {string} orderId - Razorpay Order ID
   * @returns {Promise<object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      const order = await this.razorpayInstance.orders.fetch(orderId);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Webhook Signature को Verify करें
   * @param {string} body - Request body
   * @param {string} signature - Webhook signature
   * @returns {boolean} Signature verification status
   */
  verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }

  /**
   * Payment Link बनाएं
   * @param {number} amount - Amount in rupees
   * @param {string} description - Payment description
   * @param {string} customerEmail - Customer email
   * @param {string} customerPhone - Customer phone
   * @returns {Promise<object>} Payment link details
   */
  async createPaymentLink(amount, description, customerEmail, customerPhone) {
    try {
      const options = {
        amount: amount * 100,
        currency: 'INR',
        accept_partial: true,
        first_min_partial_amount: 100,
        description,
        customer_notify: 1,
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        notes: {
          policy_name: 'EatsGram Order',
        },
        callback_url: `${process.env.APP_URL}/payment/callback`,
        callback_method: 'get',
      };

      const paymentLink = await this.razorpayInstance.paymentLink.create(options);
      return {
        success: true,
        data: paymentLink,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new RazorpayService();
