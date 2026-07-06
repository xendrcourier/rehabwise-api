import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';

const BCRYPT_SALT_ROUNDS = 10;

async function seedAdmin(prisma: PrismaClient) {
  const email = process.env.ADMIN_EMAIL ?? 'admin@rehabwise.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';

  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      full_name: process.env.ADMIN_FULL_NAME ?? 'Super Admin',
      email,
      phone: process.env.ADMIN_PHONE ?? '+2340000000000',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding database...');
  try {
    await seedAdmin(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
