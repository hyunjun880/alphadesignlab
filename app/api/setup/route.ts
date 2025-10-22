import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

// 이 엔드포인트는 초기 설정 전용입니다.
// 설정 완료 후 삭제하거나 비활성화하세요.

export async function POST(request: NextRequest) {
  try {
    // 보안을 위한 간단한 키 확인
    const { setupKey } = await request.json()

    // 환경 변수로 설정 키 확인 (선택사항)
    // const validKey = process.env.SETUP_KEY
    // if (setupKey !== validKey) {
    //   return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    // }

    // 이미 관리자가 있는지 확인
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: '이미 초기화되었습니다.',
        warning: '기존 데이터가 있습니다. 관리자 계정이 이미 존재합니다.'
      })
    }

    // 비밀번호 해시화
    const adminPassword = await hashPassword('admin123')
    const clientPassword = await hashPassword('client123')

    // 관리자 생성
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        name: '관리자',
        role: 'ADMIN',
      },
    })

    // 클라이언트 생성
    const client1 = await prisma.user.create({
      data: {
        email: 'client1@example.com',
        password: clientPassword,
        name: '김철수',
        role: 'CLIENT',
      },
    })

    const client2 = await prisma.user.create({
      data: {
        email: 'client2@example.com',
        password: clientPassword,
        name: '이영희',
        role: 'CLIENT',
      },
    })

    // 사이트 생성
    const site1 = await prisma.site.create({
      data: {
        name: '예제 사이트 1',
        domain: 'example1.com',
        description: '첫 번째 클라이언트 웹사이트',
        clientId: client1.id,
      },
    })

    const site2 = await prisma.site.create({
      data: {
        name: '예제 사이트 2',
        domain: 'example2.com',
        description: '두 번째 클라이언트 웹사이트',
        clientId: client2.id,
      },
    })

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

    return NextResponse.json({
      success: true,
      message: '데이터베이스 초기화가 완료되었습니다!',
      accounts: {
        admin: {
          email: 'admin@example.com',
          password: 'admin123'
        },
        client1: {
          email: 'client1@example.com',
          password: 'client123'
        },
        client2: {
          email: 'client2@example.com',
          password: 'client123'
        }
      },
      note: '⚠️ 보안을 위해 이 API 엔드포인트를 삭제하거나 비활성화하세요.'
    })

  } catch (error: any) {
    console.error('Setup error:', error)

    // Prisma 에러 상세 정보
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: '중복된 데이터가 있습니다. 이미 초기화되었을 수 있습니다.',
        details: error.meta
      }, { status: 400 })
    }

    return NextResponse.json({
      error: '데이터베이스 초기화 중 오류가 발생했습니다.',
      details: error.message
    }, { status: 500 })
  }
}

// GET으로도 접근 가능하도록 (브라우저에서 테스트용)
export async function GET() {
  return NextResponse.json({
    message: 'POST 요청을 사용하여 데이터베이스를 초기화하세요.',
    instructions: {
      method: 'POST',
      url: '/api/setup',
      body: {
        setupKey: 'optional-security-key'
      }
    },
    warning: '⚠️ 초기화 완료 후 이 API를 삭제하거나 비활성화하세요.'
  })
}
