const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateBarbershopSystem() {
  try {
    console.log('🚀 Starting Barbershop System Migration...\n');

    // First, run Prisma migration
    console.log('📋 Step 1: Running Prisma Schema Migration...');
    console.log('Please run the following commands in your terminal:');
    console.log('1. npx prisma db push');
    console.log('2. npx prisma generate\n');

    // Wait for user confirmation
    console.log('⏳ Please run the above commands and press Enter to continue...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    // Step 2: Update existing barbers
    console.log('📋 Step 2: Updating existing barbers...');
    
    // Get all existing barbers
    const existingBarbers = await prisma.barber.findMany({
      include: { shop: true }
    });

    console.log(`Found ${existingBarbers.length} existing barbers`);

    // Update barbers to set default values for new fields
    for (const barber of existingBarbers) {
      await prisma.barber.update({
        where: { id: barber.id },
        data: {
          isSolo: !barber.shopId, // Solo if not associated with shop
          status: 'available',
          seatNumber: barber.shopId ? 1 : null // Give seat 1 if in shop
        }
      });
      console.log(`✅ Updated barber: ${barber.fullName}`);
    }

    // Step 3: Update existing shops
    console.log('\n📋 Step 3: Updating existing shops...');
    
    const existingShops = await prisma.shop.findMany({
      include: { barbers: true }
    });

    console.log(`Found ${existingShops.length} existing shops`);

    for (const shop of existingShops) {
      // Add description and totalSeats if not set
      await prisma.shop.update({
        where: { id: shop.id },
        data: {
          description: shop.description || `Professional barbershop located at ${shop.address}`,
          totalSeats: shop.totalSeats || 4,
          isVerified: true // Verify existing shops
        }
      });

      // Create shop seats for existing shops
      console.log(`Creating seats for shop: ${shop.name}`);
      const totalSeats = shop.totalSeats || 4;
      
      for (let seatNum = 1; seatNum <= totalSeats; seatNum++) {
        // Check if seat already exists
        const existingSeat = await prisma.shopSeat.findUnique({
          where: {
            shopId_seatNumber: {
              shopId: shop.id,
              seatNumber: seatNum
            }
          }
        });

        if (!existingSeat) {
          // Assign barber to seat if available
          const barberForSeat = shop.barbers.find(b => b.seatNumber === seatNum);
          
          await prisma.shopSeat.create({
            data: {
              shopId: shop.id,
              seatNumber: seatNum,
              barberId: barberForSeat?.id || null
            }
          });
        }
      }

      console.log(`✅ Updated shop: ${shop.name} with ${totalSeats} seats`);
    }

    // Step 4: Create mock data for demonstration
    console.log('\n📋 Step 4: Creating sample barbershops for testing...');

    // Create sample shops
    const sampleShops = [
      {
        name: 'Kings Cut Barber Shop',
        description: 'Premium barbering services with experienced professionals',
        address: '123 Victoria Island, Lagos, Nigeria',
        phoneNumber: '+234-801-234-5678',
        email: 'info@kingscut.ng',
        totalSeats: 6,
        locationLat: 6.4281,
        locationLng: 3.4219
      },
      {
        name: 'Classic Cuts',
        description: 'Traditional and modern haircuts in a relaxed atmosphere',
        address: '45 Ikeja GRA, Lagos, Nigeria',
        phoneNumber: '+234-802-345-6789',
        email: 'hello@classiccuts.ng',
        totalSeats: 4,
        locationLat: 6.5833,
        locationLng: 3.3833
      },
      {
        name: 'Fresh Look Salon',
        description: 'Full-service salon and barbershop for all your grooming needs',
        address: '78 Surulere, Lagos, Nigeria',
        phoneNumber: '+234-803-456-7890',
        email: 'contact@freshlook.ng',
        totalSeats: 8,
        locationLat: 6.5042,
        locationLng: 3.3750
      }
    ];

    // Check if sample barbers exist, if not create them
    for (let i = 0; i < sampleShops.length; i++) {
      const shopData = sampleShops[i];
      
      // Check if shop already exists
      const existingShop = await prisma.shop.findFirst({
        where: { name: shopData.name }
      });

      if (existingShop) {
        console.log(`🔄 Shop "${shopData.name}" already exists, skipping...`);
        continue;
      }

      // Create owner barber for this shop
      const ownerPhone = `+234-80${i + 1}-000-000${i + 1}`;
      const existingOwner = await prisma.barber.findUnique({
        where: { phoneNumber: ownerPhone }
      });

      let ownerId;
      if (existingOwner) {
        ownerId = existingOwner.id;
        console.log(`🔄 Using existing barber as owner: ${existingOwner.fullName}`);
      } else {
        // Create owner
        const owner = await prisma.barber.create({
          data: {
            fullName: `${['Emeka', 'Ahmed', 'Grace'][i]} ${['Johnson', 'Hassan', 'Adebayo'][i]}`,
            phoneNumber: ownerPhone,
            email: `owner${i + 1}@example.com`,
            password: '$2b$10$dummy.hash.for.testing.purposes.only',
            specialties: ['Fade', 'Beard Trim', 'Line Up'],
            hourlyRate: 5000 + (i * 500),
            rating: 4.5 + (i * 0.1),
            totalReviews: 20 + (i * 10),
            isSolo: false,
            status: 'available',
            completedOnboarding: true,
            isVerified: true
          }
        });
        ownerId = owner.id;
        console.log(`✅ Created owner barber: ${owner.fullName}`);
      }

      // Create the shop
      const shop = await prisma.shop.create({
        data: {
          ...shopData,
          ownerId,
          isVerified: true,
          openingHours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '18:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: false }
          }
        }
      });

      // Update owner to be associated with shop
      await prisma.barber.update({
        where: { id: ownerId },
        data: {
          shopId: shop.id,
          seatNumber: 1
        }
      });

      // Create shop seats
      for (let seatNum = 1; seatNum <= shopData.totalSeats; seatNum++) {
        await prisma.shopSeat.create({
          data: {
            shopId: shop.id,
            seatNumber: seatNum,
            barberId: seatNum === 1 ? ownerId : null
          }
        });
      }

      console.log(`✅ Created sample shop: ${shop.name} with ${shopData.totalSeats} seats`);
    }

    // Step 5: Create sample solo barbers
    console.log('\n📋 Step 5: Creating sample solo barbers...');

    const soloBarbers = [
      {
        fullName: 'David Okonkwo',
        phoneNumber: '+234-811-111-1111',
        email: 'david@example.com',
        specialties: ['Traditional Cut', 'Hot Towel Shave'],
        hourlyRate: 4500,
        rating: 4.7
      },
      {
        fullName: 'Sarah Ibrahim',
        phoneNumber: '+234-822-222-2222',
        email: 'sarah@example.com',
        specialties: ['Hair Styling', 'Kids Cut'],
        hourlyRate: 5500,
        rating: 4.9
      }
    ];

    for (const barberData of soloBarbers) {
      const existingBarber = await prisma.barber.findUnique({
        where: { phoneNumber: barberData.phoneNumber }
      });

      if (existingBarber) {
        console.log(`🔄 Solo barber already exists: ${existingBarber.fullName}`);
        continue;
      }

      const barber = await prisma.barber.create({
        data: {
          ...barberData,
          password: '$2b$10$dummy.hash.for.testing.purposes.only',
          totalReviews: Math.floor(Math.random() * 30) + 10,
          isSolo: true,
          status: 'available',
          completedOnboarding: true,
          isVerified: true
        }
      });

      console.log(`✅ Created solo barber: ${barber.fullName}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    
    const totalBarbers = await prisma.barber.count();
    const totalShops = await prisma.shop.count();
    const soloBarberCount = await prisma.barber.count({ where: { isSolo: true } });
    const shopBarberCount = await prisma.barber.count({ where: { isSolo: false } });
    
    console.log(`- Total Barbers: ${totalBarbers}`);
    console.log(`- Solo Barbers: ${soloBarberCount}`);
    console.log(`- Shop Barbers: ${shopBarberCount}`);
    console.log(`- Total Shops: ${totalShops}`);
    
    console.log('\n✅ Your barbershop system is now ready!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Test the new barber onboarding flow');
    console.log('2. Try the shop search functionality');
    console.log('3. Test join requests between barbers and shops');
    console.log('4. Explore the 3D shop visualization');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔧 To fix this error:');
    console.log('1. Make sure your database is running');
    console.log('2. Check your DATABASE_URL in .env');
    console.log('3. Run "npx prisma db push" first');
    console.log('4. Then run this migration script again');
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateBarbershopSystem();
