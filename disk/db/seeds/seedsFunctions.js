"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const index_js_1 = __importDefault(require("../index.js"));
const schema_js_1 = require("../schemas/schema.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ============== SEED DATA ==============
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🌱 Starting database seeding...');
        // Use transaction for all operations
        const seedResult = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const results = {};
            // ============== SEED SUBSCRIPTION PLANS ==============
            console.log('📋 Creating subscription plans...');
            const plansData = [
                {
                    planName: 'Beginner',
                    maxMagazines: 3,
                    maxTailors: 3,
                    maxValidators: 1,
                    price: '29.99',
                    features: JSON.stringify({
                        orderLimit: 50,
                        supportLevel: 'email'
                    })
                },
                {
                    planName: 'Professional',
                    maxMagazines: 10,
                    maxTailors: 10,
                    maxValidators: 2,
                    price: '99.99',
                    features: JSON.stringify({
                        orderLimit: 500,
                        supportLevel: 'priority-email'
                    })
                },
                {
                    planName: 'Enterprise',
                    maxMagazines: 100,
                    maxTailors: 100,
                    maxValidators: 10,
                    price: '299.99',
                    features: JSON.stringify({
                        orderLimit: 5000,
                        supportLevel: '24/7-phone'
                    })
                }
            ];
            const plansResult = yield tx.insert(schema_js_1.subscriptionPlans)
                .values(plansData)
                .returning();
            results.subscriptionPlans = plansResult;
            console.log(`✅ Created ${plansResult.length} subscription plans`);
            // ============== SEED USERS ==============
            console.log('👥 Creating users...');
            const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
                return bcryptjs_1.default.hash(password, 10);
            });
            // Workshop Owner
            const workshopOwnerPassword = 'Workshop@123';
            const workshopOwnerHash = yield hashPassword(workshopOwnerPassword);
            const workshopOwnerData = {
                username: 'workshop_owner_1',
                email: 'workshop@test.com',
                firstname: 'Ahmed',
                lastname: 'Mohamed',
                phone: '+213600000001',
                userType: 'WORKSHOP_OWNER',
                passwordHash: workshopOwnerHash
            };
            const workshopOwnerResult = yield tx.insert(schema_js_1.users)
                .values(workshopOwnerData)
                .returning();
            results.workshopOwner = {
                user: workshopOwnerResult[0],
                credentials: {
                    username: 'workshop_owner_1',
                    password: workshopOwnerPassword,
                    email: 'workshop@test.com'
                }
            };
            // Validator
            const validatorPassword = 'Validator@123';
            const validatorHash = yield hashPassword(validatorPassword);
            const validatorUserData = {
                username: 'validator_1',
                email: 'validator@test.com',
                firstname: 'Ibrahim',
                lastname: 'Hassan',
                phone: '+213600000002',
                userType: 'VALIDATOR',
                passwordHash: validatorHash
            };
            const validatorUserResult = yield tx.insert(schema_js_1.users)
                .values(validatorUserData)
                .returning();
            results.validatorUser = {
                user: validatorUserResult[0],
                credentials: {
                    username: 'validator_1',
                    password: validatorPassword,
                    email: 'validator@test.com'
                }
            };
            // Tailor 1
            const tailorPassword = 'Tailor@123';
            const tailorHash = yield hashPassword(tailorPassword);
            const tailorUserData = {
                username: 'tailor_1',
                email: 'tailor1@test.com',
                firstname: 'Zainab',
                lastname: 'Hassan',
                phone: '+213600000003',
                userType: 'TAILOR',
                passwordHash: tailorHash
            };
            const tailorUserResult = yield tx.insert(schema_js_1.users)
                .values(tailorUserData)
                .returning();
            results.tailorUser1 = {
                user: tailorUserResult[0],
                credentials: {
                    username: 'tailor_1',
                    password: tailorPassword,
                    email: 'tailor1@test.com'
                }
            };
            // Tailor 2
            const tailor2UserData = {
                username: 'tailor_2',
                email: 'tailor2@test.com',
                firstname: 'Fatima',
                lastname: 'Ali',
                phone: '+213600000004',
                userType: 'TAILOR',
                passwordHash: tailorHash
            };
            const tailor2UserResult = yield tx.insert(schema_js_1.users)
                .values(tailor2UserData)
                .returning();
            results.tailorUser2 = {
                user: tailor2UserResult[0],
                credentials: {
                    username: 'tailor_2',
                    password: tailorPassword,
                    email: 'tailor2@test.com'
                }
            };
            // Magazine Owner 1
            const magazinePassword = 'Magazine@123';
            const magazineHash = yield hashPassword(magazinePassword);
            const magazineUserData = {
                username: 'magazine_1',
                email: 'magazine1@test.com',
                firstname: 'Hana',
                lastname: 'Khalil',
                phone: '+213600000005',
                userType: 'MAGAZINE_OWNER',
                passwordHash: magazineHash
            };
            const magazineUserResult = yield tx.insert(schema_js_1.users)
                .values(magazineUserData)
                .returning();
            results.magazineUser1 = {
                user: magazineUserResult[0],
                credentials: {
                    username: 'magazine_1',
                    password: magazinePassword,
                    email: 'magazine1@test.com'
                }
            };
            // Magazine Owner 2
            const magazine2UserData = {
                username: 'magazine_2',
                email: 'magazine2@test.com',
                firstname: 'Layla',
                lastname: 'Omar',
                phone: '+213600000006',
                userType: 'MAGAZINE_OWNER',
                passwordHash: magazineHash
            };
            const magazine2UserResult = yield tx.insert(schema_js_1.users)
                .values(magazine2UserData)
                .returning();
            results.magazineUser2 = {
                user: magazine2UserResult[0],
                credentials: {
                    username: 'magazine_2',
                    password: magazinePassword,
                    email: 'magazine2@test.com'
                }
            };
            console.log(`✅ Created 6 users (1 workshop, 1 validator, 2 tailors, 2 magazines)`);
            // ============== SEED WORKSHOPS ==============
            console.log('🏭 Creating workshops...');
            const workshopData = {
                ownerUserId: workshopOwnerResult[0].id,
                name: 'Master Tailoring Workshop',
                description: 'Professional tailoring services for women clothing',
                address: '123 Main Street, Algiers',
                phone: '+213600000001',
                commissionPercentage: '10.00',
                subscriptionPlanId: plansResult[1].id // Professional plan
            };
            const workshopResult = yield tx.insert(schema_js_1.workshops)
                .values(workshopData)
                .returning();
            results.workshop = workshopResult[0];
            console.log(`✅ Created 1 workshop`);
            // ============== SEED SUBSCRIPTIONS ==============
            console.log('💳 Creating subscriptions...');
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            const subscriptionData = {
                workshopId: workshopResult[0].id,
                planType: plansResult[1].planName, // Professional
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                renewalDate: endDate,
                paymentStatus: 'completed',
                transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: startDate
            };
            const subscriptionResult = yield tx.insert(schema_js_1.subscriptions)
                .values(subscriptionData)
                .returning();
            results.subscription = subscriptionResult[0];
            console.log(`✅ Created 1 active subscription (Professional plan)`);
            // ============== SEED REFERRAL LINKS ==============
            console.log('🔗 Creating referral links...');
            function generateRandomToken(length = 32) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
                let result = '';
                for (let i = 0; i < length; i++) {
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result + '_' + Date.now();
            }
            const referralData = [
                {
                    workshopId: workshopResult[0].id,
                    token: generateRandomToken(32),
                    referralType: 'VALIDATOR',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    isActive: true
                },
                {
                    workshopId: workshopResult[0].id,
                    token: generateRandomToken(32),
                    referralType: 'TAILOR',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    isActive: true
                },
                {
                    workshopId: workshopResult[0].id,
                    token: generateRandomToken(32),
                    referralType: 'MAGAZINE',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    isActive: true
                }
            ];
            const referralResult = yield tx.insert(schema_js_1.referralLinks)
                .values(referralData)
                .returning();
            results.referralLinks = referralResult;
            console.log(`✅ Created 3 referral links`);
            // ============== SEED TAILORS ==============
            console.log('🧵 Creating tailors...');
            const tailorsData = [
                {
                    userId: tailorUserResult[0].id,
                    workshopId: workshopResult[0].id,
                    fullName: 'Zainab Hassan',
                    description: 'Expert in embroidery and hand stitching',
                    skills: 'Embroidery, Hand Stitching, Beading',
                    availabilityStatus: 'available'
                },
                {
                    userId: tailor2UserResult[0].id,
                    workshopId: workshopResult[0].id,
                    fullName: 'Fatima Ali',
                    description: 'Specialist in silk work and alterations',
                    skills: 'Silk Work, Alterations, Custom Designs',
                    availabilityStatus: 'available'
                }
            ];
            const tailorsResult = yield tx.insert(schema_js_1.tailors)
                .values(tailorsData)
                .returning();
            results.tailors = tailorsResult;
            console.log(`✅ Created 2 tailors`);
            // ============== SEED VALIDATORS ==============
            console.log('✅ Creating validators...');
            const validatorData = {
                userId: validatorUserResult[0].id,
                workshopId: workshopResult[0].id,
                fullName: 'Ibrahim Hassan',
                description: 'Quality control manager with 10 years experience'
            };
            const validatorResult = yield tx.insert(schema_js_1.validators)
                .values(validatorData)
                .returning();
            results.validator = validatorResult[0];
            console.log(`✅ Created 1 validator`);
            // ============== SEED MAGAZINES ==============
            console.log('🏪 Creating magazines...');
            const magazinesData = [
                {
                    ownerUserId: magazineUserResult[0].id,
                    workshopId: workshopResult[0].id,
                    shopName: 'Fashion Boutique A',
                    address: '456 Shopping Center, Algiers',
                    phone: '+213600000005'
                },
                {
                    ownerUserId: magazine2UserResult[0].id,
                    workshopId: workshopResult[0].id,
                    shopName: 'Fashion Boutique B',
                    address: '789 Downtown, Algiers',
                    phone: '+213600000006'
                }
            ];
            const magazinesResult = yield tx.insert(schema_js_1.magazines)
                .values(magazinesData)
                .returning();
            results.magazines = magazinesResult;
            console.log(`✅ Created 2 magazines`);
            // ============== SEED ORDERS ==============
            console.log('📦 Creating orders...');
            // Verify prerequisites
            if (!magazinesResult || magazinesResult.length === 0) {
                throw new Error('❌ Magazines not created');
            }
            if (!workshopResult || workshopResult.length === 0) {
                throw new Error('❌ Workshop not created');
            }
            if (!validatorResult || validatorResult.length === 0) {
                throw new Error('❌ Validator not created');
            }
            const ordersData = [
                {
                    magazineId: magazinesResult[0].id,
                    workshopId: workshopResult[0].id,
                    validatorId: validatorResult[0].id,
                    orderNumber: 'ORD-2025-001',
                    description: '5 women dresses with embroidery',
                    estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    totalPrice: '250.00',
                    currentStatus: 'PENDING'
                },
                {
                    magazineId: magazinesResult[1].id,
                    workshopId: workshopResult[0].id,
                    validatorId: validatorResult[0].id,
                    orderNumber: 'ORD-2025-002',
                    description: '3 wedding dresses',
                    estimatedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    totalPrice: '500.00',
                    currentStatus: 'PENDING'
                },
                {
                    magazineId: magazinesResult[0].id,
                    workshopId: workshopResult[0].id,
                    validatorId: validatorResult[0].id,
                    orderNumber: 'ORD-2025-003',
                    description: '10 casual dresses',
                    estimatedCompletionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                    totalPrice: '300.00',
                    currentStatus: 'VALIDATED'
                }
            ];
            const ordersResult = yield tx.insert(schema_js_1.orders)
                .values(ordersData)
                .returning();
            if (!ordersResult || ordersResult.length === 0) {
                throw new Error('❌ Orders creation failed');
            }
            results.orders = ordersResult;
            console.log(`✅ Created ${ordersResult.length} orders`);
            // ============== SEED ORDER ITEMS ==============
            console.log('📋 Creating order items...');
            const orderItemsData = [
                {
                    orderId: ordersResult[0].id,
                    tailorId: tailorsResult[0].id,
                    assignedByValidatorId: validatorResult[0].id, // ✅ FIXED
                    itemStatus: 'PENDING',
                    estimatedHours: 8
                },
                {
                    orderId: ordersResult[0].id,
                    tailorId: tailorsResult[1].id,
                    assignedByValidatorId: validatorResult[0].id, // ✅ FIXED
                    itemStatus: 'PENDING',
                    estimatedHours: 6
                },
                {
                    orderId: ordersResult[1].id,
                    tailorId: tailorsResult[0].id,
                    assignedByValidatorId: validatorResult[0].id, // ✅ FIXED
                    itemStatus: 'IN_PROGRESS',
                    estimatedHours: 10
                },
                {
                    orderId: ordersResult[2].id,
                    tailorId: tailorsResult[1].id,
                    assignedByValidatorId: validatorResult[0].id, // ✅ FIXED
                    itemStatus: 'COMPLETED',
                    estimatedHours: 12
                }
            ];
            const orderItemsResult = yield tx.insert(schema_js_1.orderItems)
                .values(orderItemsData)
                .returning();
            results.orderItems = orderItemsResult;
            console.log(`✅ Created 4 order items`);
            // ============== SEED ORDER TRACKING ==============
            console.log('📊 Creating order tracking...');
            const trackingData = [
                {
                    orderId: ordersResult[0].id,
                    previousStatus: 'PENDING',
                    newStatus: 'VALIDATED',
                    validatorId: validatorResult[0].id, // ✅ FIXED
                    description: 'Order validated by validator',
                    timestamp: new Date()
                },
                {
                    orderId: ordersResult[2].id,
                    previousStatus: 'PENDING',
                    newStatus: 'VALIDATED',
                    validatorId: validatorResult[0].id, // ✅ FIXED
                    description: 'Order validated and items assigned',
                    timestamp: new Date()
                },
                {
                    orderId: ordersResult[2].id,
                    previousStatus: 'VALIDATED',
                    newStatus: 'TAILORING',
                    validatorId: validatorResult[0].id, // ✅ FIXED
                    description: 'Tailoring work started',
                    timestamp: new Date()
                }
            ];
            const trackingResult = yield tx.insert(schema_js_1.orderTracking)
                .values(trackingData)
                .returning();
            results.orderTracking = trackingResult;
            console.log(`✅ Created 3 tracking records`);
            // ============== SEED VALIDATOR ASSIGNMENT LOG ==============
            console.log('📝 Creating assignment logs...');
            const assignmentLogsData = [
                {
                    orderItemId: orderItemsResult[0].id,
                    validatorId: validatorResult[0].id, // ✅ FIXED
                    tailorId: tailorsResult[0].id,
                    assignmentReason: 'Perfect fit for embroidery work'
                },
                {
                    orderItemId: orderItemsResult[1].id,
                    validatorId: validatorResult[0].id, // ✅ FIXED
                    tailorId: tailorsResult[1].id,
                    assignmentReason: 'Specialist in alterations'
                },
                {
                    orderItemId: orderItemsResult[3].id,
                    validatorId: validatorResult[0].id, // ✅ FIXED
                    tailorId: tailorsResult[1].id,
                    assignmentReason: 'Available and qualified'
                }
            ];
            const assignmentLogsResult = yield tx.insert(schema_js_1.validatorAssignmentLog)
                .values(assignmentLogsData)
                .returning();
            results.assignmentLogs = assignmentLogsResult;
            console.log(`✅ Created 3 assignment logs`);
            return results;
        }));
        // ============== OUTPUT CREDENTIALS ==============
        console.log('\n' + '='.repeat(70));
        console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('\n📌 TEST CREDENTIALS FOR API TESTING:');
        console.log('='.repeat(70));
        console.log('\n👨‍💼 WORKSHOP OWNER');
        console.log('-'.repeat(70));
        console.log(`Username: ${seedResult.workshopOwner.credentials.username}`);
        console.log(`Email: ${seedResult.workshopOwner.credentials.email}`);
        console.log(`Password: ${seedResult.workshopOwner.credentials.password}`);
        console.log(`User ID: ${seedResult.workshopOwner.user.id}`);
        console.log(`Workshop ID: ${seedResult.workshop.id}`);
        console.log(`Subscription Plan: ${seedResult.subscription.planType}`);
        console.log(`Subscription Status: ${seedResult.subscription.status}`);
        console.log('\n✅ VALIDATOR');
        console.log('-'.repeat(70));
        console.log(`Username: ${seedResult.validatorUser.credentials.username}`);
        console.log(`Email: ${seedResult.validatorUser.credentials.email}`);
        console.log(`Password: ${seedResult.validatorUser.credentials.password}`);
        console.log(`User ID: ${seedResult.validatorUser.user.id}`);
        console.log(`Validator ID: ${seedResult.validator.id}`);
        console.log('\n🧵 TAILORS');
        console.log('-'.repeat(70));
        console.log('Tailor 1:');
        console.log(`  Username: ${seedResult.tailorUser1.credentials.username}`);
        console.log(`  Email: ${seedResult.tailorUser1.credentials.email}`);
        console.log(`  Password: ${seedResult.tailorUser1.credentials.password}`);
        console.log(`  User ID: ${seedResult.tailorUser1.user.id}`);
        console.log(`  Tailor ID: ${seedResult.tailors[0].id}`);
        console.log('\nTailor 2:');
        console.log(`  Username: ${seedResult.tailorUser2.credentials.username}`);
        console.log(`  Email: ${seedResult.tailorUser2.credentials.email}`);
        console.log(`  Password: ${seedResult.tailorUser2.credentials.password}`);
        console.log(`  User ID: ${seedResult.tailorUser2.user.id}`);
        console.log(`  Tailor ID: ${seedResult.tailors[1].id}`);
        console.log('\n🏪 MAGAZINES (SHOPS)');
        console.log('-'.repeat(70));
        console.log('Magazine 1:');
        console.log(`  Username: ${seedResult.magazineUser1.credentials.username}`);
        console.log(`  Email: ${seedResult.magazineUser1.credentials.email}`);
        console.log(`  Password: ${seedResult.magazineUser1.credentials.password}`);
        console.log(`  User ID: ${seedResult.magazineUser1.user.id}`);
        console.log(`  Magazine ID: ${seedResult.magazines[0].id}`);
        console.log(`  Shop Name: ${seedResult.magazines[0].shopName}`);
        console.log('\nMagazine 2:');
        console.log(`  Username: ${seedResult.magazineUser2.credentials.username}`);
        console.log(`  Email: ${seedResult.magazineUser2.credentials.email}`);
        console.log(`  Password: ${seedResult.magazineUser2.credentials.password}`);
        console.log(`  User ID: ${seedResult.magazineUser2.user.id}`);
        console.log(`  Magazine ID: ${seedResult.magazines[1].id}`);
        console.log(`  Shop Name: ${seedResult.magazines[1].shopName}`);
        console.log('\n📦 REFERENCE DATA');
        console.log('-'.repeat(70));
        console.log(`Total Orders Created: ${seedResult.orders.length}`);
        console.log('Order IDs:', seedResult.orders.map(o => `${o.id}`).join(', '));
        console.log(`Total Order Items: ${seedResult.orderItems.length}`);
        console.log('Order Item IDs:', seedResult.orderItems.map(i => `${i.id}`).join(', '));
        console.log(`Subscription Plans:`, seedResult.subscriptionPlans.map(p => `${p.planName} (#${p.id})`).join(', '));
        console.log(`Active Subscription:`, `${seedResult.subscription.planType} (ID: ${seedResult.subscription.id})`);
        console.log('\n🔗 REFERRAL LINKS');
        console.log('-'.repeat(70));
        seedResult.referralLinks.forEach((link, idx) => {
            console.log(`${link.referralType} Link: ${link.token}`);
        });
        console.log('\n' + '='.repeat(70));
        console.log('✅ Ready to test! Use the credentials above with the API.');
        console.log('='.repeat(70) + '\n');
        return seedResult;
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
});
exports.seedDatabase = seedDatabase;
exports.default = exports.seedDatabase;
