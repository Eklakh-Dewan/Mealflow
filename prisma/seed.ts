import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SUBSCRIPTION_TIERS = {
  FREE: { maxStudents: 10 },
  BASIC: { maxStudents: 50 },
  STANDARD: { maxStudents: 100 },
  PREMIUM: { maxStudents: 300 },
  ENTERPRISE: { maxStudents: 99999 },
}

async function main() {
  console.log('🌱 Starting seed...')

  // Super Admin
  const adminPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
    12
  )
  const admin = await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'admin@mealflow.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@mealflow.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Super admin created:', admin.email)

  // Sample Owner
  const ownerPassword = await bcrypt.hash('Owner@123', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      name: 'Demo Mess Owner',
      email: 'owner@demo.com',
      passwordHash: ownerPassword,
      role: 'OWNER',
    },
  })

  // Sample Tenant
  const tenant = await prisma.tenant.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: 'Green Garden Mess',
      address: '123 College Road, Pune',
      phone: '+91-9876543210',
      ownerId: owner.id,
      inviteCode: 'DEMO2024',
      subscriptionTier: 'FREE',
      maxStudents: SUBSCRIPTION_TIERS.FREE.maxStudents,
      billingStatus: 'ACTIVE',
    },
  })
  console.log('✅ Demo tenant created:', tenant.name, '| Invite:', tenant.inviteCode)

  // Update owner with tenantId
  await prisma.user.update({
    where: { id: owner.id },
    data: { tenantId: tenant.id },
  })

  // Sample Meal Plan
  const mealPlan = await prisma.mealPlan.upsert({
    where: { id: 'demo-plan-001' },
    update: {},
    create: {
      id: 'demo-plan-001',
      tenantId: tenant.id,
      name: 'Monthly Full Board',
      description: 'Breakfast, Lunch & Dinner (25 working days)',
      price: 3500,
      totalMeals: 75,
      isActive: true,
    },
  })
  console.log('✅ Meal plan created:', mealPlan.name)

  // Sample Menu (Today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.menu.upsert({
    where: { tenantId_date: { tenantId: tenant.id, date: today } },
    update: {},
    create: {
      tenantId: tenant.id,
      date: today,
      dayType: 'weekday',
      meals: {
        breakfast: ['Idli', 'Sambar', 'Coconut Chutney', 'Tea'],
        lunch: ['Rice', 'Dal Tadka', 'Sabzi', 'Roti', 'Salad'],
        dinner: ['Chapati', 'Paneer Butter Masala', 'Rice', 'Curd'],
      },
    },
  })
  console.log('✅ Today\'s menu created')

  // Sample Students
  const studentEmails = [
    { email: 'student1@demo.com', name: 'Rahul Sharma' },
    { email: 'student2@demo.com', name: 'Priya Patel' },
    { email: 'student3@demo.com', name: 'Amit Kumar' },
  ]

  for (const s of studentEmails) {
    const studentPassword = await bcrypt.hash('Student@123', 12)
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash: studentPassword,
        role: 'STUDENT',
        tenantId: tenant.id,
      },
    })

    // Subscribe to meal plan
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)

    await prisma.studentPlan.upsert({
      where: { id: `sp-${student.id}` },
      update: {},
      create: {
        id: `sp-${student.id}`,
        userId: student.id,
        mealPlanId: mealPlan.id,
        startDate: start,
        endDate: end,
        status: 'ACTIVE',
      },
    })
  }
  console.log('✅ Sample students created (emails: student1@demo.com, student2@demo.com, student3@demo.com)')
  console.log('   Password: Student@123')

  // Update student count
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      // Prisma will recount via query – just update maxStudents is handled by subscription logic
    },
  })

  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Login credentials:')
  console.log('  Super Admin: admin@mealflow.com / SuperAdmin@123')
  console.log('  Mess Owner:  owner@demo.com / Owner@123')
  console.log('  Students:    student1@demo.com / Student@123')
  console.log('  Invite Code: DEMO2024')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
