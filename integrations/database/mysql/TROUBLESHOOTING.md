# 🔧 MySQL Troubleshooting Guide

EatsGram में MySQL से related common issues और उनके solutions।

---

## 📋 Table of Contents

1. [Connection Issues](#connection-issues)
2. [Performance Issues](#performance-issues)
3. [Data Issues](#data-issues)
4. [Migration Issues](#migration-issues)
5. [Security Issues](#security-issues)
6. [Backup & Recovery](#backup--recovery)

---

## Connection Issues

### Issue 1: Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Causes:**
- MySQL service not running
- Wrong host/port
- Firewall blocking connection
- MySQL not installed

**Solutions:**

#### Windows:
```bash
# Check if MySQL is running
tasklist | findstr mysql

# Start MySQL service
net start MySQL80

# Or use Services app
services.msc
```

#### macOS:
```bash
# Check if MySQL is running
brew services list

# Start MySQL
brew services start mysql

# Or manually
mysql.server start
```

#### Linux:
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Enable on boot
sudo systemctl enable mysql
```

**Verify Connection:**
```bash
mysql -h localhost -u root -p
```

---

### Issue 2: Access Denied

**Error:**
```
Error: Access denied for user 'root'@'localhost' (using password: YES)
```

**Causes:**
- Wrong password
- User doesn't exist
- User has no privileges
- Host mismatch

**Solutions:**

```bash
# Test with correct credentials
mysql -h localhost -u root -p your_password

# Reset root password (MySQL 8.0)
# 1. Stop MySQL
sudo systemctl stop mysql

# 2. Start without password
sudo mysqld_safe --skip-grant-tables &

# 3. Connect without password
mysql -u root

# 4. Flush privileges
FLUSH PRIVILEGES;

# 5. Set new password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';

# 6. Exit and restart MySQL
EXIT;
sudo systemctl restart mysql
```

**Create New User:**
```sql
-- Create user
CREATE USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON eatsgram_db.* TO 'eatsgram_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'eatsgram_user'@'localhost';
```

---

### Issue 3: Database Not Found

**Error:**
```
Error: Unknown database 'eatsgram_db'
```

**Causes:**
- Database not created
- Wrong database name
- Database deleted
- Connection to wrong server

**Solutions:**

```bash
# Connect to MySQL
mysql -u root -p

# List all databases
SHOW DATABASES;

# Create database
CREATE DATABASE eatsgram_db;

# Verify creation
SHOW DATABASES;

# Use database
USE eatsgram_db;
```

---

### Issue 4: Connection Timeout

**Error:**
```
Error: connect ETIMEDOUT
```

**Causes:**
- Network connectivity issue
- Firewall blocking
- MySQL server overloaded
- DNS resolution issue

**Solutions:**

```bash
# Test network connectivity
ping localhost

# Test MySQL port
telnet localhost 3306

# Check firewall (Linux)
sudo ufw status
sudo ufw allow 3306

# Check firewall (Windows)
netsh advfirewall firewall add rule name="MySQL" dir=in action=allow protocol=tcp localport=3306

# Increase connection timeout in .env
DB_CONNECTION_TIMEOUT=30000
```

---

### Issue 5: Too Many Connections

**Error:**
```
Error: Too many connections
```

**Causes:**
- Connection pool exhausted
- Connections not being closed
- Memory leak
- High traffic

**Solutions:**

```sql
-- Check current connections
SHOW PROCESSLIST;

-- Check max connections
SHOW VARIABLES LIKE 'max_connections';

-- Increase max connections
SET GLOBAL max_connections = 1000;

-- Kill idle connections
KILL CONNECTION_ID;

-- Check connection time
SHOW VARIABLES LIKE 'wait_timeout';

-- Increase wait timeout
SET GLOBAL wait_timeout = 28800;
```

**In .env:**
```
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_IDLE_TIMEOUT=30000
```

---

## Performance Issues

### Issue 1: Slow Queries

**Error:**
```
Query took 5000ms (threshold: 1000ms)
```

**Causes:**
- Missing indexes
- Large table scans
- Inefficient queries
- No query optimization

**Solutions:**

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log%';

-- Analyze query
EXPLAIN SELECT * FROM orders WHERE customerId = 1;

-- Add index
CREATE INDEX idx_customerId ON orders(customerId);

-- Check index usage
SHOW INDEX FROM orders;

-- Optimize table
OPTIMIZE TABLE orders;
```

**Query Optimization Tips:**
```javascript
// ❌ Bad: N+1 query problem
const orders = await Order.findAll();
for (const order of orders) {
  const customer = await User.findByPk(order.customerId);
}

// ✅ Good: Use eager loading
const orders = await Order.findAll({
  include: [{ model: User, as: 'customer' }]
});

// ❌ Bad: Select all columns
const orders = await Order.findAll();

// ✅ Good: Select specific columns
const orders = await Order.findAll({
  attributes: ['id', 'totalAmount', 'status']
});

// ❌ Bad: No pagination
const orders = await Order.findAll();

// ✅ Good: Use pagination
const orders = await Order.findAll({
  limit: 10,
  offset: 0
});
```

---

### Issue 2: High Memory Usage

**Error:**
```
MySQL process using 80% of system memory
```

**Causes:**
- Large result sets
- Memory leaks
- Inefficient queries
- Buffer pool too large

**Solutions:**

```sql
-- Check memory usage
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- Reduce buffer pool (restart required)
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB

-- Check table cache
SHOW VARIABLES LIKE 'table_open_cache';

-- Reduce table cache
SET GLOBAL table_open_cache = 4000;

-- Check query cache
SHOW VARIABLES LIKE 'query_cache%';
```

---

### Issue 3: Connection Pool Exhaustion

**Error:**
```
Connection pool is exhausted
```

**Causes:**
- Connections not being released
- Long-running queries
- Connection leaks
- Too many concurrent requests

**Solutions:**

```javascript
// ✅ Good: Always close connections
const user = await User.findByPk(1);
// Connection automatically returned to pool

// ✅ Good: Use transactions properly
const transaction = await sequelize.transaction();
try {
  await Order.create(data, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
}

// ❌ Bad: Holding connections
const connection = await sequelize.connectionManager.getConnection();
// Forgot to release!

// ✅ Good: Release connections
const connection = await sequelize.connectionManager.getConnection();
try {
  // Use connection
} finally {
  await sequelize.connectionManager.releaseConnection(connection);
}
```

**In .env:**
```
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE_TIMEOUT=30000
```

---

## Data Issues

### Issue 1: Foreign Key Constraint Error

**Error:**
```
Error: Cannot add or update a child row: a foreign key constraint fails
```

**Causes:**
- Referenced record doesn't exist
- Deleting parent with children
- Data type mismatch
- Constraint not defined

**Solutions:**

```sql
-- Check foreign keys
SHOW CREATE TABLE orders;

-- Disable foreign key checks (temporary)
SET FOREIGN_KEY_CHECKS=0;

-- Fix data
UPDATE orders SET restaurantId = 1 WHERE restaurantId IS NULL;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Add missing parent records
INSERT INTO restaurants (userId, name) VALUES (1, 'Restaurant');

-- Delete with cascade
DELETE FROM restaurants WHERE id = 1;
```

---

### Issue 2: Duplicate Key Error

**Error:**
```
Error: Duplicate entry 'test@example.com' for key 'email'
```

**Causes:**
- Duplicate data
- Unique constraint violation
- Data migration issue

**Solutions:**

```sql
-- Find duplicates
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- Remove duplicates
DELETE FROM users WHERE id NOT IN (
  SELECT MIN(id) FROM users GROUP BY email
);

-- Check unique constraints
SHOW INDEX FROM users WHERE Key_name = 'email';

-- Add unique constraint
ALTER TABLE users ADD UNIQUE KEY unique_email (email);
```

---

### Issue 3: Data Type Mismatch

**Error:**
```
Error: Incorrect integer value: 'abc' for column 'id'
```

**Causes:**
- Wrong data type
- Type conversion error
- Invalid data

**Solutions:**

```sql
-- Check column types
DESCRIBE users;

-- Change column type
ALTER TABLE users MODIFY COLUMN phone VARCHAR(20);

-- Check data before conversion
SELECT * FROM users WHERE phone NOT REGEXP '^[0-9+\-\s]+$';

-- Convert data
UPDATE users SET phone = CAST(phone AS CHAR);
```

---

## Migration Issues

### Issue 1: Migration Fails Midway

**Error:**
```
Migration failed at step 3/7
```

**Causes:**
- Data validation error
- Constraint violation
- Memory issue
- Connection timeout

**Solutions:**

```javascript
// Add error handling
try {
  await migrateUsers();
  await migrateRestaurants();
  await migrateFoodItems();
} catch (error) {
  console.error('Migration failed:', error);
  // Rollback
  await rollbackMigration();
}

// Add checkpoints
const checkpoint = {
  users: 0,
  restaurants: 0,
  foodItems: 0
};

// Save progress
fs.writeFileSync('migration_progress.json', JSON.stringify(checkpoint));

// Resume from checkpoint
const progress = JSON.parse(fs.readFileSync('migration_progress.json'));
```

---

### Issue 2: Data Integrity After Migration

**Error:**
```
Record count mismatch: MongoDB=1000, MySQL=950
```

**Causes:**
- Validation errors
- Constraint violations
- Data loss
- Incomplete migration

**Solutions:**

```sql
-- Compare record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- Find missing data
SELECT * FROM users WHERE email IS NULL;

-- Check for orphaned records
SELECT * FROM orders WHERE restaurantId NOT IN (SELECT id FROM restaurants);

-- Verify relationships
SELECT o.id, o.customerId, u.id FROM orders o
LEFT JOIN users u ON o.customerId = u.id
WHERE u.id IS NULL;
```

---

## Security Issues

### Issue 1: SQL Injection

**Error:**
```
Unexpected query result or error
```

**Prevention:**

```javascript
// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good: Parameterized queries
const user = await User.findOne({
  where: { email: email }
});

// ✅ Good: Use Sequelize methods
const user = await sequelize.query(
  'SELECT * FROM users WHERE email = ?',
  { replacements: [email], type: QueryTypes.SELECT }
);
```

---

### Issue 2: Weak Passwords

**Error:**
```
Unauthorized access to database
```

**Solutions:**

```bash
# Change root password
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'StrongPassword123!@#';

# Create strong password policy
SET GLOBAL validate_password.policy='STRONG';
SET GLOBAL validate_password.length=12;
```

---

### Issue 3: Exposed Credentials

**Error:**
```
Database credentials in logs/code
```

**Solutions:**

```bash
# Use environment variables
DB_PASSWORD=your_password

# Never commit .env
echo ".env" >> .gitignore

# Use secrets management
# AWS Secrets Manager, HashiCorp Vault, etc.

# Rotate credentials regularly
ALTER USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'new_password';
```

---

## Backup & Recovery

### Issue 1: Backup Failed

**Error:**
```
Backup process failed
```

**Solutions:**

```bash
# Manual backup
mysqldump -u root -p eatsgram_db > backup.sql

# Backup with compression
mysqldump -u root -p eatsgram_db | gzip > backup.sql.gz

# Backup specific table
mysqldump -u root -p eatsgram_db orders > orders_backup.sql

# Verify backup
gunzip -c backup.sql.gz | head -20
```

---

### Issue 2: Restore Failed

**Error:**
```
Cannot restore from backup
```

**Solutions:**

```bash
# Restore from backup
mysql -u root -p eatsgram_db < backup.sql

# Restore from compressed backup
gunzip < backup.sql.gz | mysql -u root -p eatsgram_db

# Restore specific table
mysql -u root -p eatsgram_db < orders_backup.sql

# Verify restore
mysql -u root -p eatsgram_db -e "SELECT COUNT(*) FROM orders;"
```

---

## 🆘 Emergency Procedures

### Database Corruption

```sql
-- Check table integrity
CHECK TABLE users;

-- Repair table
REPAIR TABLE users;

-- Optimize table
OPTIMIZE TABLE users;
```

### Disk Space Full

```bash
# Check disk usage
df -h

# Find large files
du -sh /var/lib/mysql/*

# Clean up old backups
rm -f /backups/old_*.sql

# Increase disk space
# Add new disk or expand existing
```

### Complete Data Loss

```bash
# Restore from latest backup
mysql -u root -p eatsgram_db < latest_backup.sql

# Verify restoration
mysql -u root -p eatsgram_db -e "SELECT COUNT(*) FROM users;"
```

---

## 📞 Getting Help

### Useful Commands

```bash
# Check MySQL version
mysql --version

# Check MySQL status
sudo systemctl status mysql

# View MySQL logs
tail -f /var/log/mysql/error.log

# Check MySQL configuration
mysql -u root -p -e "SHOW VARIABLES;"

# Monitor connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Sequelize Troubleshooting](https://sequelize.org/docs/v6/other-topics/troubleshooting/)
- [Stack Overflow MySQL Tag](https://stackoverflow.com/questions/tagged/mysql)
- [MySQL Community Forums](https://forums.mysql.com/)

---

**Last Updated**: October 16, 2025
**Maintained by**: EatsGram Team
**Emergency Contact**: [Your Contact Info]
