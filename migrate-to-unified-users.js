const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToUnifiedUserSystem() {
  try {
    console.log('🚀 Starting Migration to Unified User System...\n');

    // Step 1: Create a backup of existing data
    console.log('📋 Step 1: Analyzing existing data...');
    
    const existingCustomers = await prisma.customer.findMany({
      include: {
        wallet: true,
        bookings: true,
        reviews: true,
        favoriteShops: true,
        paymentMethods: true,
        notifications: true,
        pushTokens: true,
        transactions: true
      }
    });
    
    const existingBarbers = await prisma.barber.findMany({
      include: {
        shop: true,
        bookings: true,
        reviews: true,
        ownedShops: true,
        joinRequests: true,
        assignedSeats: true,
        notifications: true,
        pushTokens: true,
        transactions: true
      }
    });

    console.log(`Found ${existingCustomers.length} customers and ${existingBarbers.length} barbers`);
    console.log('');

    // Step 2: Apply new schema (this requires running the schema migration first)
    console.log('📋 Step 2: Schema Migration Required');
    console.log('⚠️  Before running this script, you need to:');
    console.log('   1. Backup your database');
    console.log('   2. Replace your current schema.prisma with schema-unified.prisma');
    console.log('   3. Run: npx prisma db push --force-reset');
    console.log('   4. Run: npx prisma generate');
    console.log('   5. Then run this migration script');
    console.log('');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('Have you completed the schema migration steps above? (yes/no): ', resolve);
    });
    readline.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Please complete the schema migration steps first.');
      return;
    }

    console.log('📋 Step 3: Migrating data to unified system...');

    // Create a map to track potential duplicates
    const emailMap = new Map();
    const phoneMap = new Map();
    const userIdMapping = new Map(); // Maps old customer/barber IDs to new user IDs

    // Step 3a: Migrate Customers to Users + CustomerProfiles
    console.log('👤 Migrating customers...');
    
    for (const customer of existingCustomers) {
      try {
        // Check for potential duplicates by email/phone
        const duplicateByEmail = customer.email && emailMap.has(customer.email);
        const duplicateByPhone = phoneMap.has(customer.phoneNumber);

        if (duplicateByEmail || duplicateByPhone) {
          console.log(`⚠️  Potential duplicate found for customer ${customer.fullName} (${customer.email || customer.phoneNumber})`);
          continue;
        }

        // Create User record
        const newUser = await prisma.user.create({
          data: {
            id: customer.id, // Keep same ID to maintain relationships
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            password: customer.password,
            fullName: customer.fullName,
            profileImage: customer.profileImage,
            role: 'customer',
            completedOnboarding: customer.completedOnboarding,
            isVerified: customer.isVerified,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
          }
        });

        // Create CustomerProfile record
        await prisma.customerProfile.create({
          data: {
            id: customer.id, // Keep same ID for relationship consistency
            userId: newUser.id,
            locationLat: customer.locationLat,
            locationLng: customer.locationLng,
            bookingPreferences: customer.bookingPreferences,
            loyaltyPoints: customer.loyaltyPoints,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
          }
        });

        // Track mappings
        userIdMapping.set(customer.id, newUser.id);
        if (customer.email) emailMap.set(customer.email, newUser.id);
        phoneMap.set(customer.phoneNumber, newUser.id);

        console.log(`✅ Migrated customer: ${customer.fullName}`);

      } catch (error) {
        console.error(`❌ Failed to migrate customer ${customer.fullName}:`, error.message);
      }
    }

    // Step 3b: Migrate Barbers to Users + BarberProfiles
    console.log('\n💇 Migrating barbers...');
    
    for (const barber of existingBarbers) {
      try {
        // Check for potential duplicates
        const duplicateByEmail = barber.email && emailMap.has(barber.email);
        const duplicateByPhone = phoneMap.has(barber.phoneNumber);

        if (duplicateByEmail || duplicateByPhone) {
          console.log(`⚠️  Potential duplicate found for barber ${barber.fullName} (${barber.email || barber.phoneNumber})`);
          
          // This is likely the case where a customer became a barber
          const existingUserId = emailMap.get(barber.email) || phoneMap.get(barber.phoneNumber);
          
          if (existingUserId) {
            console.log(`🔄 Converting existing user to barber: ${barber.fullName}`);
            
            // Update the existing user to barber role
            await prisma.user.update({
              where: { id: existingUserId },
              data: {
                role: 'barber',
                completedOnboarding: barber.completedOnboarding,
                // Update other fields if barber data is more recent
                fullName: barber.fullName,
                profileImage: barber.profileImage || undefined,
                updatedAt: new Date()
              }
            });

            // Create BarberProfile for the existing user
            await prisma.barberProfile.create({
              data: {
                id: barber.id, // Keep original barber ID
                userId: existingUserId, // Link to existing user
                shopId: barber.shopId,
                specialties: barber.specialties,
                hourlyRate: barber.hourlyRate,
                rating: barber.rating,
                totalReviews: barber.totalReviews,
                isAvailable: barber.isAvailable,
                isSolo: barber.isSolo,
                seatNumber: barber.seatNumber,
                status: barber.status,
                createdAt: barber.createdAt,
                updatedAt: barber.updatedAt
              }
            });

            userIdMapping.set(barber.id, existingUserId);
            console.log(`✅ Converted user to barber: ${barber.fullName}`);
            continue;
          }
        }

        // Create new User record for barber
        const newUser = await prisma.user.create({
          data: {
            id: barber.id, // Keep same ID
            email: barber.email,
            phoneNumber: barber.phoneNumber,
            password: barber.password,
            fullName: barber.fullName,
            profileImage: barber.profileImage,
            role: 'barber',
            completedOnboarding: barber.completedOnboarding,
            isVerified: barber.isVerified,
            createdAt: barber.createdAt,
            updatedAt: barber.updatedAt
          }
        });

        // Create BarberProfile record
        await prisma.barberProfile.create({
          data: {
            id: barber.id,
            userId: newUser.id,
            shopId: barber.shopId,
            specialties: barber.specialties,
            hourlyRate: barber.hourlyRate,
            rating: barber.rating,
            totalReviews: barber.totalReviews,
            isAvailable: barber.isAvailable,
            isSolo: barber.isSolo,
            seatNumber: barber.seatNumber,
            status: barber.status,
            createdAt: barber.createdAt,
            updatedAt: barber.updatedAt
          }
        });

        userIdMapping.set(barber.id, newUser.id);
        if (barber.email) emailMap.set(barber.email, newUser.id);
        phoneMap.set(barber.phoneNumber, newUser.id);

        console.log(`✅ Migrated barber: ${barber.fullName}`);

      } catch (error) {
        console.error(`❌ Failed to migrate barber ${barber.fullName}:`, error.message);
      }
    }

    console.log('\n📋 Step 4: Updating relationship references...');

    // Update all notification records to reference the unified user table
    for (const [oldId, newUserId] of userIdMapping) {
      try {
        // Update notifications
        await prisma.notification.updateMany({
          where: { OR: [{ customerId: oldId }, { barberId: oldId }] },
          data: { userId: newUserId }
        });

        // Update push tokens
        await prisma.pushToken.updateMany({
          where: { OR: [{ customerId: oldId }, { barberId: oldId }] },
          data: { userId: newUserId }
        });

        // Update transactions
        await prisma.transaction.updateMany({
          where: { userId: oldId },
          data: { userId: newUserId }
        });

      } catch (error) {
        console.error(`❌ Failed to update references for ${oldId}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    
    const totalUsers = await prisma.user.count();
    const totalCustomerProfiles = await prisma.customerProfile.count();
    const totalBarberProfiles = await prisma.barberProfile.count();
    
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Customer Profiles: ${totalCustomerProfiles}`);
    console.log(`- Barber Profiles: ${totalBarberProfiles}`);
    
    console.log('\n✅ Your unified user system is now ready!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Update your backend controllers to use the new schema');
    console.log('2. Update your frontend to use the new API endpoints');
    console.log('3. Test the onboarding flow with the new system');
    console.log('4. Verify all existing functionality works correctly');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔧 To fix this error:');
    console.log('1. Make sure you have applied the new schema first');
    console.log('2. Check your DATABASE_URL in .env');
    console.log('3. Ensure the database is running');
    console.log('4. Review any constraint violations in the error above');
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToUnifiedUserSystem();
