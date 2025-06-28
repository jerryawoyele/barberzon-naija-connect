const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('Verifying migration data...\n');

    // Check users
    const users = await prisma.user.findMany({
      include: {
        customerProfile: true,
        barberProfile: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.fullName} (${user.email}) - Role: ${user.role}`);
      if (user.customerProfile) {
        console.log(`  Customer profile: Location ${user.customerProfile.locationLat}, ${user.customerProfile.locationLng}`);
      }
      if (user.barberProfile) {
        console.log(`  Barber profile: Specialties ${user.barberProfile.specialties.join(', ')}`);
      }
    });

    // Check shops
    const shops = await prisma.shop.findMany({
      include: {
        owner: {
          include: {
            user: true
          }
        },
        barbers: {
          include: {
            user: true
          }
        }
      }
    });

    console.log(`\nFound ${shops.length} shops:`);
    shops.forEach(shop => {
      console.log(`- ${shop.name} at ${shop.address}`);
      console.log(`  Owner: ${shop.owner.user.fullName}`);
      console.log(`  Barbers: ${shop.barbers.length}`);
    });

    console.log('\nMigration verification complete!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
