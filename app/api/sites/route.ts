import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/sites - 사이트 목록 조회
export async function GET() {
  try {
    const session = await requireAuth()

    let sites

    if (session.role === 'ADMIN') {
      // 관리자: 모든 사이트 조회
      sites = await prisma.site.findMany({
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          hostingInfo: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // 최신 호스팅 정보만
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
      // 클라이언트: 자신의 사이트만 조회
      sites = await prisma.site.findMany({
        where: {
          clientId: session.id,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          hostingInfo: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    return NextResponse.json({ sites })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Get sites error:', error)
    return NextResponse.json(
      { error: '사이트 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/sites - 새 사이트 생성
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const { name, domain, description, clientId } = await request.json()

    if (!name || !domain) {
      return NextResponse.json(
        { error: '사이트명과 도메인을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 관리자가 아닌 경우 자신의 사이트만 생성 가능
    const finalClientId = session.role === 'ADMIN' && clientId ? clientId : session.id

    // 도메인 중복 확인
    const existing = await prisma.site.findUnique({
      where: { domain },
    })

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 도메인입니다.' },
        { status: 400 }
      )
    }

    const site = await prisma.site.create({
      data: {
        name,
        domain,
        description,
        clientId: finalClientId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ site })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Create site error:', error)
    return NextResponse.json(
      { error: '사이트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
