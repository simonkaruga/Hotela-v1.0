import { config } from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: path.join(__dirname, '../apps/api/.env') });

const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.upsert({
    where: { slug: 'naivasha-resort' },
    update: {},
    create: {
      name: 'Naivasha Lakeside Resort',
      slug: 'naivasha-resort',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
    },
  });

  let roomType = await prisma.roomType.findFirst({
    where: { propertyId: property.id, name: 'Standard Room' },
  });
  if (!roomType) {
    roomType = await prisma.roomType.create({
      data: {
        propertyId: property.id,
        name: 'Standard Room',
        baseRate: 12000,
        maxOccupancy: 2,
      },
    });
  }

  const room = await prisma.room.upsert({
    where: { propertyId_number: { propertyId: property.id, number: '101' } },
    update: {},
    create: {
      propertyId: property.id,
      roomTypeId: roomType.id,
      number: '101',
      floor: '1',
      status: 'CLEAN',
    },
  });

  let guest = await prisma.guest.findFirst({
    where: { propertyId: property.id, email: 'jane.wanjiru@example.com' },
  });
  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        propertyId: property.id,
        firstName: 'Jane',
        lastName: 'Wanjiru',
        email: 'jane.wanjiru@example.com',
        phone: '+254700000000',
      },
    });
  }

  console.log('Seeded:');
  console.log({ propertyId: property.id, roomTypeId: roomType.id, roomId: room.id, guestId: guest.id });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
