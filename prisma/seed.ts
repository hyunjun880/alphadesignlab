import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 비밀번호 해시화
  const adminPassword = await bcrypt.hash('admin123', 10)
  const clientPassword = await bcrypt.hash('client123', 10)

  // 관리자 생성
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: '관리자',
      role: 'ADMIN',
    },
  })

  console.log('✓ Admin user created:', admin.email)

  // 클라이언트 생성
  const client1 = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      email: 'client1@example.com',
      password: clientPassword,
      name: '김철수',
      role: 'CLIENT',
    },
  })

  const client2 = await prisma.user.upsert({
    where: { email: 'client2@example.com' },
    update: {},
    create: {
      email: 'client2@example.com',
      password: clientPassword,
      name: '이영희',
      role: 'CLIENT',
    },
  })

  console.log('✓ Client users created:', client1.email, client2.email)

  // 사이트 생성
  const site1 = await prisma.site.upsert({
    where: { domain: 'example1.com' },
    update: {},
    create: {
      name: '예제 사이트 1',
      domain: 'example1.com',
      description: '첫 번째 클라이언트 웹사이트',
      clientId: client1.id,
    },
  })

  const site2 = await prisma.site.upsert({
    where: { domain: 'example2.com' },
    update: {},
    create: {
      name: '예제 사이트 2',
      domain: 'example2.com',
      description: '두 번째 클라이언트 웹사이트',
      clientId: client2.id,
    },
  })

  console.log('✓ Sites created:', site1.domain, site2.domain)

  // 호스팅 정보 생성
  const today = new Date()
  const in60Days = new Date(today)
  in60Days.setDate(today.getDate() + 60)

  const in20Days = new Date(today)
  in20Days.setDate(today.getDate() + 20)

  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  await prisma.hostingInfo.create({
    data: {
      siteId: site1.id,
      provider: 'Cafe24',
      plan: '프리미엄 플랜',
      monthlyCost: 30000,
      yearlyTotal: 360000,
      startDate: oneYearAgo,
      expiryDate: in60Days,
      status: 'ACTIVE',
      autoRenewal: true,
      notes: '자동 갱신 활성화됨',
    },
  })

  await prisma.hostingInfo.create({
    data: {
      siteId: site2.id,
      provider: '가비아',
      plan: '스탠다드 플랜',
      monthlyCost: 20000,
      yearlyTotal: 240000,
      startDate: oneYearAgo,
      expiryDate: in20Days,
      status: 'EXPIRING',
      autoRenewal: false,
      notes: '만료 임박 - 갱신 필요',
    },
  })

  console.log('✓ Hosting info created')

  console.log('\n========================================')
  console.log('Seed completed successfully!')
  console.log('========================================')
  console.log('\n로그인 계정:')
  console.log('관리자: admin@example.com / admin123')
  console.log('클라이언트 1: client1@example.com / client123')
  console.log('클라이언트 2: client2@example.com / client123')
  console.log('========================================\n')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
