import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: '인증되지 않았습니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user: session })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
