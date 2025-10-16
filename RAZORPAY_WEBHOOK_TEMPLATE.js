/**
 * Razorpay Webhook Handler
 * 
 * यह file आपके backend में webhook endpoint के लिए है।
 * Express.js के साथ use करें।
 */

const express = require('express');
const razorpayService = require('./services/razorpay.service');

const router = express.Router();

/**
 * Razorpay Webhook Handler
 * 
 * Webhook Events:
 * - payment.authorized
 * - payment.failed
 * - payment.captured
 * - refund.created
 * - refund.failed
 * - order.paid
 */

router.post('/razorpay-webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`Processing webhook event: ${event}`);

    switch (event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(payload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;

      case 'refund.created':
        await handleRefundCreated(payload);
        break;

      case 'refund.failed':
        await handleRefundFailed(payload);
        break;

      case 'order.paid':
        await handleOrderPaid(payload);
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Payment Authorized Handler
 */
async function handlePaymentAuthorized(payload) {
  try {
    const payment = payload.payment.entity;
    console.log(`Payment authorized: ${payment.id}`);

    // Update order status
    // await Order.updateOne(
    //   { razorpayOrderId: payment.order_id },
    //   {
    //     paymentStatus: 'authorized',
    //     paymentId: payment.id,
    //     amount: payment.amount / 100,
    //   }
    // );

    // Send notification to customer
    // await sendNotification(payment.email, 'Payment Authorized');
  } catch (error) {
    console.error('Error handling payment authorized:', error);
    throw error;
  }
}

/**
 * Payment Failed Handler
 */
async function handlePaymentFailed(payload) {
  try {
    const payment = payload.payment.entity;
    console.log(`Payment failed: ${payment.id}`);

    // Update order status
    // await Order.updateOne(
    //   { razorpayOrderId: payment.order_id },
    //   {
    //     paymentStatus: 'failed',
    //     paymentError: payment.error_description,
    //   }
    // );

    // Send notification to customer
    // await sendNotification(
    //   payment.email,
    //   'Payment Failed',
    //   `Your payment failed: ${payment.error_description}`
    // );
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

/**
 * Payment Captured Handler
 */
async function handlePaymentCaptured(payload) {
  try {
    const payment = payload.payment.entity;
    console.log(`Payment captured: ${payment.id}`);

    // Update order status
    // await Order.updateOne(
    //   { razorpayOrderId: payment.order_id },
    //   {
    //     paymentStatus: 'completed',
    //     paymentId: payment.id,
    //     amount: payment.amount / 100,
    //     capturedAt: new Date(),
    //   }
    // );

    // Send confirmation email
    // await sendConfirmationEmail(payment.email, payment.order_id);

    // Trigger order processing
    // await processOrder(payment.order_id);
  } catch (error) {
    console.error('Error handling payment captured:', error);
    throw error;
  }
}

/**
 * Refund Created Handler
 */
async function handleRefundCreated(payload) {
  try {
    const refund = payload.refund.entity;
    console.log(`Refund created: ${refund.id}`);

    // Update refund status
    // await Refund.updateOne(
    //   { razorpayRefundId: refund.id },
    //   {
    //     status: 'completed',
    //     amount: refund.amount / 100,
    //     processedAt: new Date(),
    //   }
    // );

    // Send refund notification
    // await sendNotification(
    //   refund.notes.email,
    //   'Refund Processed',
    //   `Your refund of ₹${refund.amount / 100} has been processed`
    // );
  } catch (error) {
    console.error('Error handling refund created:', error);
    throw error;
  }
}

/**
 * Refund Failed Handler
 */
async function handleRefundFailed(payload) {
  try {
    const refund = payload.refund.entity;
    console.log(`Refund failed: ${refund.id}`);

    // Update refund status
    // await Refund.updateOne(
    //   { razorpayRefundId: refund.id },
    //   {
    //     status: 'failed',
    //     error: refund.failure_reason,
    //   }
    // );

    // Send failure notification
    // await sendNotification(
    //   refund.notes.email,
    //   'Refund Failed',
    //   `Your refund could not be processed: ${refund.failure_reason}`
    // );
  } catch (error) {
    console.error('Error handling refund failed:', error);
    throw error;
  }
}

/**
 * Order Paid Handler
 */
async function handleOrderPaid(payload) {
  try {
    const order = payload.order.entity;
    console.log(`Order paid: ${order.id}`);

    // Update order status
    // await Order.updateOne(
    //   { razorpayOrderId: order.id },
    //   {
    //     paymentStatus: 'paid',
    //     paidAt: new Date(),
    //   }
    // );

    // Trigger order fulfillment
    // await fulfillOrder(order.id);
  } catch (error) {
    console.error('Error handling order paid:', error);
    throw error;
  }
}

module.exports = router;

/**
 * Express App में Use करने का तरीका:
 * 
 * const razorpayWebhook = require('./routes/razorpay-webhook');
 * app.use('/api/webhooks', razorpayWebhook);
 * 
 * Razorpay Dashboard में Webhook URL:
 * https://your-domain.com/api/webhooks/razorpay-webhook
 * 
 * Events को Subscribe करें:
 * - payment.authorized
 * - payment.failed
 * - payment.captured
 * - refund.created
 * - refund.failed
 * - order.paid
 */
