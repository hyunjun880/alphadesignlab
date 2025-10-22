import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { calculateHostingStatus } from '@/lib/hosting-utils'

// POST /api/hosting - 호스팅 정보 생성
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const {
      siteId,
      provider,
      plan,
      monthlyCost,
      yearlyTotal,
      startDate,
      expiryDate,
      autoRenewal,
      notes,
    } = await request.json()

    if (!siteId || !provider || !plan || !monthlyCost || !startDate || !expiryDate) {
      return NextResponse.json(
        { error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사이트 존재 및 권한 확인
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    })

    if (!site) {
      return NextResponse.json(
        { error: '사이트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 관리자이거나 자신의 사이트인 경우
    if (session.role !== 'ADMIN' && site.clientId !== session.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 상태 자동 계산
    const status = calculateHostingStatus(new Date(expiryDate))

    const hostingInfo = await prisma.hostingInfo.create({
      data: {
        siteId,
        provider,
        plan,
        monthlyCost: parseFloat(monthlyCost),
        yearlyTotal: yearlyTotal ? parseFloat(yearlyTotal) : null,
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        status,
        autoRenewal: autoRenewal || false,
        notes,
      },
    })

    return NextResponse.json({ hostingInfo })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Create hosting info error:', error)
    return NextResponse.json(
      { error: '호스팅 정보 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
