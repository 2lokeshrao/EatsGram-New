const paymentGateway = require('../integrations/payment-gateways');

async function initializePaymentGateway() {
  try {
    await paymentGateway.initialize();
    console.log('✅ Payment gateway initialized successfully');
    return paymentGateway;
  } catch (error) {
    console.error('❌ Payment gateway initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { initializePaymentGateway };
