import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pocketoption.com' },
    update: {},
    create: {
      id: 'admin-user-001',
      email: 'admin@pocketoption.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      balance: 10000,
      isAdmin: true,
      kycStatus: 'verified'
    }
  })

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'user@pocketoption.com' },
    update: {},
    create: {
      id: 'test-user-001',
      email: 'user@pocketoption.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      balance: 1000,
      isAdmin: false,
      kycStatus: 'verified'
    }
  })

  console.log('✅ Admin user created:', { id: admin.id, email: admin.email })
  console.log('✅ Test user created:', { id: user.id, email: user.email })
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })