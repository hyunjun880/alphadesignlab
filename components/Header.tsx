'use client'

import { useRouter } from 'next/navigation'

interface HeaderProps {
  user: {
    name: string
    email: string
    role: 'ADMIN' | 'CLIENT'
  }
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              호스팅 관리 시스템
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {user.role === 'ADMIN' ? '관리자' : '클라이언트'} 대시보드
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
