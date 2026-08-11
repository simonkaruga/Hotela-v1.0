import { config } from 'dotenv';
import path from 'path';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

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

  const demoUsers: { email: string; role: UserRole }[] = [
    { email: 'gm@naivasharesort.com', role: 'GENERAL_MANAGER' },
    { email: 'frontdesk@naivasharesort.com', role: 'FRONT_DESK' },
    { email: 'nightaudit@naivasharesort.com', role: 'NIGHT_AUDIT' },
    { email: 'housekeeping@naivasharesort.com', role: 'HOUSEKEEPING_SUPERVISOR' },
  ];
  const passwordHash = await bcrypt.hash('password123', 10);
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { propertyId: property.id, email: u.email, role: u.role, passwordHash },
    });
  }

  console.log('Seeded:');
  console.log({ propertyId: property.id, roomTypeId: roomType.id, roomId: room.id, guestId: guest.id });
  console.log('Demo users (password: password123):', demoUsers.map((u) => `${u.email} [${u.role}]`));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
