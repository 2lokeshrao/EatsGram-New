const { initializePaymentGateway } = require('../config/payment');

let paymentGateway = null;

async function getPaymentGateway() {
  if (!paymentGateway) {
    paymentGateway = await initializePaymentGateway();
  }
  return paymentGateway;
}

async function createOrder(amount, currency, metadata) {
  const gateway = await getPaymentGateway();
  return await gateway.createOrder(amount, currency, metadata);
}

async function verifyPayment(paymentData) {
  const gateway = await getPaymentGateway();
  return await gateway.verifyPayment(paymentData);
}

async function refundPayment(paymentId, amount) {
  const gateway = await getPaymentGateway();
  return await gateway.refundPayment(paymentId, amount);
}

async function handleWebhook(webhookData) {
  const gateway = await getPaymentGateway();
  return await gateway.handleWebhook(webhookData);
}

module.exports = {
  getPaymentGateway,
  createOrder,
  verifyPayment,
  refundPayment,
  handleWebhook,
};
