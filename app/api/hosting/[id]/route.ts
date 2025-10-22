import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { calculateHostingStatus } from '@/lib/hosting-utils'

// PATCH /api/hosting/[id] - 호스팅 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const data = await request.json()

    const hostingInfo = await prisma.hostingInfo.findUnique({
      where: { id },
      include: { site: true },
    })

    if (!hostingInfo) {
      return NextResponse.json(
        { error: '호스팅 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 관리자이거나 자신의 사이트인 경우
    if (session.role !== 'ADMIN' && hostingInfo.site.clientId !== session.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 만료일이 변경되면 상태 재계산
    let status = hostingInfo.status
    if (data.expiryDate) {
      status = calculateHostingStatus(new Date(data.expiryDate))
    }

    const updatedHostingInfo = await prisma.hostingInfo.update({
      where: { id },
      data: {
        ...(data.provider && { provider: data.provider }),
        ...(data.plan && { plan: data.plan }),
        ...(data.monthlyCost !== undefined && { monthlyCost: parseFloat(data.monthlyCost) }),
        ...(data.yearlyTotal !== undefined && {
          yearlyTotal: data.yearlyTotal ? parseFloat(data.yearlyTotal) : null
        }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
        ...(data.autoRenewal !== undefined && { autoRenewal: data.autoRenewal }),
        ...(data.notes !== undefined && { notes: data.notes }),
        status,
      },
    })

    return NextResponse.json({ hostingInfo: updatedHostingInfo })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Update hosting info error:', error)
    return NextResponse.json(
      { error: '호스팅 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/hosting/[id] - 호스팅 정보 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const hostingInfo = await prisma.hostingInfo.findUnique({
      where: { id },
      include: { site: true },
    })

    if (!hostingInfo) {
      return NextResponse.json(
        { error: '호스팅 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 관리자만 삭제 가능
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다. 관리자만 호스팅 정보를 삭제할 수 있습니다.' },
        { status: 403 }
      )
    }

    await prisma.hostingInfo.delete({
      where: { id },
    })

    return NextResponse.json({ message: '호스팅 정보가 삭제되었습니다.' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    console.error('Delete hosting info error:', error)
    return NextResponse.json(
      { error: '호스팅 정보 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
