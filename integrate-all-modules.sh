#!/bin/bash

# 🚀 EatsGram Modules Integration Script
# Automatically integrates database and payment gateway into all 5 modules

set -e

echo "🚀 Starting EatsGram Modules Integration..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
MODULES=("EatsGram-web" "EatsGram-admin" "EatsGram-app" "EatsGram-rider" "EatsGram-store")
INTEGRATIONS_DIR="./integrations"
DATABASE_TYPE="mysql"
PAYMENT_GATEWAY="razorpay"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if integrations folder exists
if [ ! -d "$INTEGRATIONS_DIR" ]; then
    print_error "Integrations folder not found at $INTEGRATIONS_DIR"
    exit 1
fi

print_status "Integrations folder found"

# Integrate each module
for module in "${MODULES[@]}"; do
    echo ""
    echo "=========================================="
    print_info "Integrating $module..."
    echo "=========================================="
    
    if [ ! -d "$module" ]; then
        print_warning "Module $module not found, skipping..."
        continue
    fi
    
    # Copy integrations folder
    print_info "Copying integrations folder..."
    cp -r "$INTEGRATIONS_DIR" "$module/integrations"
    print_status "Integrations folder copied"
    
    # Create config directory if it doesn't exist
    if [ ! -d "$module/config" ]; then
        mkdir -p "$module/config"
        print_status "Config directory created"
    fi
    
    # Create database config
    print_info "Creating database config..."
    cat > "$module/config/database.js" << 'DBCONFIG'
const db = require('../integrations/database');

async function initializeDatabase() {
  try {
    await db.initialize();
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };
DBCONFIG
    print_status "Database config created"
    
    # Create payment config
    print_info "Creating payment gateway config..."
    cat > "$module/config/payment.js" << 'PAYMENTCONFIG'
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
PAYMENTCONFIG
    print_status "Payment gateway config created"
    
    # Create services directory if it doesn't exist
    if [ ! -d "$module/services" ]; then
        mkdir -p "$module/services"
        print_status "Services directory created"
    fi
    
    # Create database service
    print_info "Creating database service..."
    cat > "$module/services/database.service.js" << 'DBSERVICE'
const { initializeDatabase } = require('../config/database');

let db = null;

async function getDatabase() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}

async function getModels() {
  const database = await getDatabase();
  return database.getModels();
}

async function createUser(userData) {
  const { User } = await getModels();
  return await User.create(userData);
}

async function getUserById(userId) {
  const { User } = await getModels();
  return await User.findByPk(userId);
}

async function updateUser(userId, userData) {
  const { User } = await getModels();
  return await User.update(userData, { where: { id: userId } });
}

async function deleteUser(userId) {
  const { User } = await getModels();
  return await User.destroy({ where: { id: userId } });
}

module.exports = {
  getDatabase,
  getModels,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
DBSERVICE
    print_status "Database service created"
    
    # Create payment service
    print_info "Creating payment service..."
    cat > "$module/services/payment.service.js" << 'PAYMENTSERVICE'
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
PAYMENTSERVICE
    print_status "Payment service created"
    
    # Create .env.local if it doesn't exist
    if [ ! -f "$module/.env.local" ]; then
        print_info "Creating .env.local..."
        cat > "$module/.env.local" << 'ENVCONFIG'
# Database Configuration (MySQL)
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=eatsgram
MYSQL_PORT=3306

# Payment Gateway Configuration (Razorpay)
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
ENVCONFIG
        print_status ".env.local created"
    else
        print_warning ".env.local already exists, skipping..."
    fi
    
    print_status "$module integration completed!"
done

echo ""
echo "=========================================="
print_status "All modules integrated successfully!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local in each module with your credentials"
echo "2. Run 'npm install' in each module"
echo "3. Test database and payment gateway connections"
echo "4. Deploy to production"
echo ""
echo "📚 Documentation:"
echo "- Main Guide: ./integrations/README.md"
echo "- Database Guide: ./integrations/database/mysql/README.md"
echo "- Payment Guide: ./integrations/payment-gateways/razorpay/README.md"
echo "- Setup Guide: ./MODULES_INTEGRATION_SETUP.md"
echo ""

