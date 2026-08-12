import { config } from 'dotenv';
import path from 'path';
import * as bcrypt from 'bcryptjs';
import { AccountType, PrismaClient, UserRole } from '@prisma/client';

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

  const menuItems = [
    { name: 'Grilled Tilapia', price: 1800, category: 'Main' },
    { name: 'Club Sandwich', price: 950, category: 'Light Bites' },
    { name: 'Tusker Lager', price: 350, category: 'Bar' },
  ];
  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { propertyId: property.id, name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({ data: { propertyId: property.id, ...item } });
    }
  }

  const treatments = [
    { name: 'Swedish Massage', price: 4500, durationMinutes: 60 },
    { name: 'Facial Treatment', price: 3200, durationMinutes: 45 },
  ];
  for (const t of treatments) {
    const existing = await prisma.treatment.findFirst({ where: { propertyId: property.id, name: t.name } });
    if (!existing) {
      await prisma.treatment.create({ data: { propertyId: property.id, ...t } });
    }
  }

  const accounts: { code: string; name: string; type: AccountType }[] = [
    { code: '1000', name: 'Cash and Bank', type: 'ASSET' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
    { code: '3000', name: "Owner's Equity", type: 'EQUITY' },
    { code: '4000', name: 'Room Revenue', type: 'REVENUE' },
    { code: '4100', name: 'F&B Revenue', type: 'REVENUE' },
    { code: '4200', name: 'Spa Revenue', type: 'REVENUE' },
    { code: '4900', name: 'Adjustments & Discounts', type: 'REVENUE' },
    { code: '2100', name: 'Tax Payable', type: 'LIABILITY' },
    { code: '5000', name: 'Operating Expenses', type: 'EXPENSE' },
  ];
  for (const a of accounts) {
    await prisma.account.upsert({
      where: { propertyId_code: { propertyId: property.id, code: a.code } },
      update: {},
      create: { propertyId: property.id, ...a },
    });
  }

  let supplier = await prisma.supplier.findFirst({ where: { propertyId: property.id, name: 'Naivasha Fresh Produce Ltd' } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: { propertyId: property.id, name: 'Naivasha Fresh Produce Ltd', contact: '+254711000000' },
    });
  }

  let inventoryItem = await prisma.inventoryItem.findFirst({ where: { propertyId: property.id, name: 'Tilapia (kg)' } });
  if (!inventoryItem) {
    inventoryItem = await prisma.inventoryItem.create({
      data: { propertyId: property.id, name: 'Tilapia (kg)', unit: 'kg', reorderLevel: 10 },
    });
  }

  let corporateAccount = await prisma.corporateAccount.findFirst({ where: { propertyId: property.id, name: 'Acme Safaris Ltd' } });
  if (!corporateAccount) {
    corporateAccount = await prisma.corporateAccount.create({
      data: { propertyId: property.id, name: 'Acme Safaris Ltd', creditLimit: 200000 },
    });
  }

  let employee = await prisma.employee.findFirst({ where: { propertyId: property.id, firstName: 'Kevin', lastName: 'Otieno' } });
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        propertyId: property.id,
        firstName: 'Kevin',
        lastName: 'Otieno',
        department: 'Front Office',
        phone: '+254722000000',
        hireDate: new Date('2025-01-15'),
      },
    });
  }

  console.log('Seeded:');
  console.log({ propertyId: property.id, roomTypeId: roomType.id, roomId: room.id, guestId: guest.id });
  console.log('Demo users (password: password123):', demoUsers.map((u) => `${u.email} [${u.role}]`));
  console.log('Menu items:', menuItems.map((m) => m.name));
  console.log('Treatments:', treatments.map((t) => t.name));
  console.log('Accounts:', accounts.map((a) => `${a.code} ${a.name}`));
  console.log('Supplier:', supplier.name, '| Inventory item:', inventoryItem.name);
  console.log('Corporate account:', corporateAccount.name);
  console.log('Employee:', employee.firstName, employee.lastName);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
