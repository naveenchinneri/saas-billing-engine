import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Default Subscription Plans
  const plans = [
    {
      name: 'Starter',
      tier: 'STARTER',
      priceCents: 2900, // €29.00
      currency: 'EUR',
      maxApiCallsPerMonth: 10000,
    },
    {
      name: 'Growth',
      tier: 'GROWTH',
      priceCents: 7900, // €79.00
      currency: 'EUR',
      maxApiCallsPerMonth: 100000,
    },
    {
      name: 'Enterprise',
      tier: 'ENTERPRISE',
      priceCents: 19900, // €199.00
      currency: 'EUR',
      maxApiCallsPerMonth: 1000000,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: {},
      create: plan,
    });
  }
  console.log('✅ Subscription plans seeded.');

  // 2. Seed a Demo Organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
    },
  });
  console.log(`✅ Demo Organization created: ${demoOrg.name} (${demoOrg.id})`);

  // 3. Seed an Initial Owner User for the Organization
  const demoUser = await prisma.user.upsert({
    where: { email: 'owner@acme.com' },
    update: {},
    create: {
      email: 'owner@acme.com',
      // Placeholder hash; we will hash real passwords with argon2/bcrypt in the auth module
      passwordHash: 'dummy_hash_for_testing',
      role: UserRole.OWNER,
      organizationId: demoOrg.id,
    },
  });
  console.log(`✅ Demo Owner created: ${demoUser.email} (${demoUser.id})`);

  // 4. Assign Growth Plan Subscription to the Demo Org
  const growthPlan = await prisma.plan.findUnique({
    where: { tier: 'GROWTH' },
  });

  if (growthPlan) {
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(now.getDate() + 30);

    await prisma.subscription.upsert({
      where: { organizationId: demoOrg.id },
      update: {},
      create: {
        organizationId: demoOrg.id,
        planId: growthPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    console.log('✅ Subscription assigned to demo organization.');
  }

  console.log('🎉 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });