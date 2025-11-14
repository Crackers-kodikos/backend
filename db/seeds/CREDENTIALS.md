# 🔑 TEST CREDENTIALS REFERENCE

## Quick Reference Card

### 👨‍💼 WORKSHOP OWNER
```
Username: workshop_owner_1
Email: workshop@test.com
Password: Workshop@123
Role: WORKSHOP_OWNER
User ID: 1
Workshop ID: 1
```

### ✅ VALIDATOR
```
Username: validator_1
Email: validator@test.com
Password: Validator@123
Role: VALIDATOR
User ID: 2
Validator ID: 1
```

### 🧵 TAILOR #1
```
Username: tailor_1
Email: tailor1@test.com
Password: Tailor@123
Role: TAILOR
User ID: 3
Tailor ID: 1
```

### 🧵 TAILOR #2
```
Username: tailor_2
Email: tailor2@test.com
Password: Tailor@123
Role: TAILOR
User ID: 4
Tailor ID: 2
```

### 🏪 MAGAZINE #1
```
Username: magazine_1
Email: magazine1@test.com
Password: Magazine@123
Role: MAGAZINE_OWNER
User ID: 5
Magazine ID: 1
Shop: Fashion Boutique A
```

### 🏪 MAGAZINE #2
```
Username: magazine_2
Email: magazine2@test.com
Password: Magazine@123
Role: MAGAZINE_OWNER
User ID: 6
Magazine ID: 2
Shop: Fashion Boutique B
```

---

## 📦 ORDER & ITEM IDs

### Orders
- Order #1: `ORD-2025-001` (ID: 1) - Status: PENDING
- Order #2: `ORD-2025-002` (ID: 2) - Status: PENDING
- Order #3: `ORD-2025-003` (ID: 3) - Status: VALIDATED

### Order Items
- Item 1: ID 1 (Order 1, Tailor 1) - Status: ASSIGNED
- Item 2: ID 2 (Order 1, Tailor 2) - Status: ASSIGNED
- Item 3: ID 3 (Order 2, Tailor 1) - Status: PENDING
- Item 4: ID 4 (Order 3, Tailor 2) - Status: IN_PROGRESS

---

## 🔗 Common API Testing Paths

### Authentication
```
POST /api/auth/login
{
  "username": "workshop_owner_1",
  "password": "Workshop@123"
}
```

### Workshop Operations (as Workshop Owner)
```
GET /api/workshops/profile
Authorization: Bearer <token>

GET /api/validator/dashboard
Authorization: Bearer <token>
```

### Magazine Operations (as Magazine Owner)
```
GET /api/magazine/orders
Authorization: Bearer <token>

POST /api/magazine/orders
Authorization: Bearer <token>
{
  "workshopId": 1,
  "orderNumber": "ORD-NEW",
  "description": "New order",
  "totalPrice": 200,
  "items": [{"description": "Item 1"}]
}
```

### Order Management
```
GET /api/orders/1
Authorization: Bearer <token>

GET /api/order-items/order/1
Authorization: Bearer <token>

GET /api/order-items/tailor/1
Authorization: Bearer <token>
```

### Validator Operations
```
GET /api/validator/dashboard
Authorization: Bearer <token>

GET /api/validator/tailors
Authorization: Bearer <token>

POST /api/validator/items/1/assign
Authorization: Bearer <token>
{
  "tailorId": 1,
  "estimatedHours": 8,
  "notes": "Assignment note"
}
```

### Tailor Operations
```
GET /api/tailor/profile
Authorization: Bearer <token>

GET /api/tailor/tasks
Authorization: Bearer <token>

PUT /api/tailor/tasks/1/status
Authorization: Bearer <token>
{
  "newStatus": "IN_PROGRESS"
}
```

### Tracking
```
GET /api/tracking/order/1
Authorization: Bearer <token>

GET /api/tracking/magazine/orders
Authorization: Bearer <token>

GET /api/tracking/magazine/dashboard
Authorization: Bearer <token>
```

### Subscriptions
```
GET /api/subscriptions/plans

GET /api/subscriptions/plans/professional

POST /api/subscriptions/subscribe
Authorization: Bearer <token>
{
  "planId": "professional",
  "paymentMethodToken": "tok_mock_visa_success_4242"
}
```

---

## 🚀 Usage Example

### Step 1: Login
```bash
curl -X POST http://localhost:3232/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "workshop_owner_1",
    "password": "Workshop@123"
  }'
```

### Step 2: Use token in requests
```bash
curl -X GET http://localhost:3232/api/workshops/profile \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Step 3: Test endpoints
```bash
# Get all orders
curl -X GET http://localhost:3232/api/orders

# Get specific order
curl -X GET http://localhost:3232/api/orders/1 \
  -H "Authorization: Bearer <TOKEN>"

# Get order items
curl -X GET http://localhost:3232/api/order-items/order/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📊 Database Structure

```
Subscription Plans (3):
  - Beginner: $29.99/month
  - Professional: $99.99/month ← Workshop uses this
  - Enterprise: $299.99/month

Users (6):
  1. workshop_owner_1 (WORKSHOP_OWNER)
  2. validator_1 (VALIDATOR)
  3. tailor_1 (TAILOR)
  4. tailor_2 (TAILOR)
  5. magazine_1 (MAGAZINE_OWNER)
  6. magazine_2 (MAGAZINE_OWNER)

Workshops (1):
  1. Master Tailoring Workshop

Magazines (2):
  1. Fashion Boutique A
  2. Fashion Boutique B

Tailors (2):
  1. Zainab Hassan
  2. Fatima Ali

Validators (1):
  1. Ibrahim Hassan

Orders (3):
  1. ORD-2025-001 (PENDING)
  2. ORD-2025-002 (PENDING)
  3. ORD-2025-003 (VALIDATED)

Order Items (4):
  1. Item 1 (ASSIGNED)
  2. Item 2 (ASSIGNED)
  3. Item 3 (PENDING)
  4. Item 4 (IN_PROGRESS)
```

---

## 🔒 Security Notes

⚠️ **IMPORTANT**: These are TEST credentials only!
- ❌ Never use in production
- ❌ Never share with external users
- ❌ Change all passwords for real deployment
- ❌ Use environment variables for production secrets
- ✅ Use for development/testing ONLY

---

## 🎯 Next Steps

1. Run seed: `node runSeed.js`
2. Copy credentials from above
3. Login to get access token
4. Use token for API testing
5. Refer to API documentation for endpoints

**Happy testing!** 🚀
