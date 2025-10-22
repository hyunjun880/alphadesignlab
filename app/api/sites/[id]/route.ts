import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/sites/[id] - 특정 사이트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const site = await prisma.site.findUnique({
      where: { id },
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
        },
      },
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

    return NextResponse.json({ site })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Get site error:', error)
    return NextResponse.json(
      { error: '사이트 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/sites/[id] - 사이트 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const { name, domain, description, clientId } = await request.json()

    const site = await prisma.site.findUnique({
      where: { id },
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

    // 도메인 변경 시 중복 확인
    if (domain && domain !== site.domain) {
      const existing = await prisma.site.findUnique({
        where: { domain },
      })

      if (existing) {
        return NextResponse.json(
          { error: '이미 존재하는 도메인입니다.' },
          { status: 400 }
        )
      }
    }

    const updatedSite = await prisma.site.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(description !== undefined && { description }),
        ...(session.role === 'ADMIN' && clientId && { clientId }),
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

    return NextResponse.json({ site: updatedSite })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Update site error:', error)
    return NextResponse.json(
      { error: '사이트 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/sites/[id] - 사이트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const site = await prisma.site.findUnique({
      where: { id },
    })

    if (!site) {
      return NextResponse.json(
        { error: '사이트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 관리자만 삭제 가능
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다. 관리자만 사이트를 삭제할 수 있습니다.' },
        { status: 403 }
      )
    }

    await prisma.site.delete({
      where: { id },
    })

    return NextResponse.json({ message: '사이트가 삭제되었습니다.' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Delete site error:', error)
    return NextResponse.json(
      { error: '사이트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
