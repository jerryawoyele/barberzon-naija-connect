const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function migrateToUnifiedUsers() {
  console.log('Starting migration to unified user system...');

  try {
    // Get all existing customers and barbers
    console.log('Fetching existing customers and barbers...');
    
    // Note: These tables should still exist if you have backup data
    // If the tables were dropped, you'll need to restore from backup first
    let customers = [];
    let barbers = [];
    
    try {
      // Try to get data from old tables if they still exist
      customers = await prisma.$queryRaw`SELECT * FROM Customer`;
      console.log(`Found ${customers.length} customers`);
    } catch (error) {
      console.log('Customer table not found - skipping customer migration');
    }

    try {
      barbers = await prisma.$queryRaw`SELECT * FROM Barber`;
      console.log(`Found ${barbers.length} barbers`);
    } catch (error) {
      console.log('Barber table not found - skipping barber migration');
    }

    // If no data found, create some sample data for testing
    if (customers.length === 0 && barbers.length === 0) {
      console.log('No existing data found. Creating sample data for testing...');
      await createSampleData();
      return;
    }

    // Migrate customers
    console.log('Migrating customers...');
    for (const customer of customers) {
      try {
        // Create user record
        const user = await prisma.user.create({
          data: {
            email: customer.email,
            password: customer.password, // Already hashed
            role: 'CUSTOMER',
            isEmailVerified: customer.isEmailVerified || false,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
          }
        });

        // Create customer profile
        await prisma.customerProfile.create({
          data: {
            userId: user.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phoneNumber: customer.phoneNumber,
            address: customer.address,
            profileImage: customer.profileImage,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
          }
        });

        console.log(`Migrated customer: ${customer.email}`);
      } catch (error) {
        console.error(`Failed to migrate customer ${customer.email}:`, error.message);
      }
    }

    // Migrate barbers
    console.log('Migrating barbers...');
    for (const barber of barbers) {
      try {
        // Check if user already exists (in case of email overlap)
        let user = await prisma.user.findUnique({
          where: { email: barber.email }
        });

        if (user) {
          // Update existing user to have BARBER role
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'BARBER' }
          });
          console.log(`Updated existing user ${barber.email} to BARBER role`);
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: barber.email,
              password: barber.password, // Already hashed
              role: 'BARBER',
              isEmailVerified: barber.isEmailVerified || false,
              createdAt: barber.createdAt,
              updatedAt: barber.updatedAt,
            }
          });
        }

        // Create barber profile
        await prisma.barberProfile.create({
          data: {
            userId: user.id,
            firstName: barber.firstName,
            lastName: barber.lastName,
            phoneNumber: barber.phoneNumber,
            address: barber.address,
            profileImage: barber.profileImage,
            bio: barber.bio,
            yearsOfExperience: barber.yearsOfExperience,
            specialties: barber.specialties,
            isAvailable: barber.isAvailable || true,
            shopId: barber.shopId,
            createdAt: barber.createdAt,
            updatedAt: barber.updatedAt,
          }
        });

        console.log(`Migrated barber: ${barber.email}`);
      } catch (error) {
        console.error(`Failed to migrate barber ${barber.email}:`, error.message);
      }
    }

    console.log('Migration completed successfully!');
    
    // Verify migration
    const userCount = await prisma.user.count();
    const customerProfileCount = await prisma.customerProfile.count();
    const barberProfileCount = await prisma.barberProfile.count();
    
    console.log('\nMigration Summary:');
    console.log(`Total users created: ${userCount}`);
    console.log(`Customer profiles created: ${customerProfileCount}`);
    console.log(`Barber profiles created: ${barberProfileCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function createSampleData() {
  console.log('Creating sample data...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create sample customer
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      phoneNumber: '+1234567890',
      fullName: 'John Customer',
      password: hashedPassword,
      role: 'customer',
      emailVerified: true,
      completedOnboarding: true,
    }
  });

  await prisma.customerProfile.create({
    data: {
      userId: customerUser.id,
      locationLat: 6.5244,
      locationLng: 3.3792,
    }
  });

  // Create a temporary barber profile to own the shop
  const tempBarberUser = await prisma.user.create({
    data: {
      email: 'temp@example.com',
      phoneNumber: '+1999888777',
      fullName: 'Temp Owner',
      password: hashedPassword,
      role: 'barber',
      emailVerified: true,
      completedOnboarding: true,
    }
  });

  const tempBarberProfile = await prisma.barberProfile.create({
    data: {
      userId: tempBarberUser.id,
      specialties: ['Haircut'],
      isAvailable: true,
    }
  });

  // Create sample shop
  const shop = await prisma.shop.create({
    data: {
      name: 'Sample Barbershop',
      address: '456 Barber Ave, City',
      phoneNumber: '+1987654321',
      description: 'A great barbershop',
      locationLat: 6.5244,
      locationLng: 3.3792,
      openingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '16:00' },
        sunday: { closed: true }
      },
      images: [],
      ownerId: tempBarberProfile.id,
    }
  });

  // Create sample barber (who is also the shop owner)
  const barberUser = await prisma.user.create({
    data: {
      email: 'barber@example.com',
      phoneNumber: '+1555666777',
      fullName: 'Mike Barber',
      password: hashedPassword,
      role: 'barber',
      emailVerified: true,
      completedOnboarding: true,
    }
  });

  const barberProfile = await prisma.barberProfile.create({
    data: {
      userId: barberUser.id,
      specialties: ['Classic cuts', 'Beard styling'],
      bio: 'Professional barber with 5 years experience',
      experience: '5 years',
      isAvailable: true,
      shopId: shop.id,
    }
  });

  // Update shop owner
  await prisma.shop.update({
    where: { id: shop.id },
    data: { ownerId: barberProfile.id }
  });

  console.log('Sample data created successfully!');
}

async function main() {
  try {
    await migrateToUnifiedUsers();
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateToUnifiedUsers };
