const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPhoneNumber() {
  try {
    console.log('🔍 Debugging Phone Number Storage...\n');

    // Get all customers and their phone numbers
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        locationLat: true,
        locationLng: true,
        createdAt: true
      }
    });

    console.log(`Found ${customers.length} customers in database:\n`);

    customers.forEach((customer, index) => {
      console.log(`${index + 1}. Customer: ${customer.fullName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Phone Number: ${customer.phoneNumber || 'NOT SET'}`);
      console.log(`   Profile Image: ${customer.profileImage || 'NO IMAGE'}`);
      console.log(`   Location: ${customer.locationLat && customer.locationLng 
        ? `${customer.locationLat}, ${customer.locationLng}` 
        : 'NOT SET'}`);
      console.log(`   Created: ${customer.createdAt.toLocaleDateString()}\n`);
    });

    // Test update operation
    if (customers.length > 0) {
      const testCustomer = customers[0];
      console.log(`🧪 Testing phone number update for: ${testCustomer.fullName}`);
      
      const testPhoneNumber = '+234-801-234-5678';
      
      const updatedCustomer = await prisma.customer.update({
        where: { id: testCustomer.id },
        data: { phoneNumber: testPhoneNumber },
        select: {
          id: true,
          fullName: true,
          phoneNumber: true
        }
      });

      console.log(`✅ Updated phone number successfully:`);
      console.log(`   Customer: ${updatedCustomer.fullName}`);
      console.log(`   New Phone: ${updatedCustomer.phoneNumber}\n`);

      // Verify the update
      const verifiedCustomer = await prisma.customer.findUnique({
        where: { id: testCustomer.id },
        select: { fullName: true, phoneNumber: true }
      });

      console.log(`🔍 Verification check:`);
      console.log(`   Customer: ${verifiedCustomer.fullName}`);
      console.log(`   Retrieved Phone: ${verifiedCustomer.phoneNumber}`);
      console.log(`   Match: ${verifiedCustomer.phoneNumber === testPhoneNumber ? '✅ YES' : '❌ NO'}\n`);
    }

  } catch (error) {
    console.error('❌ Error debugging phone numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPhoneNumber();
