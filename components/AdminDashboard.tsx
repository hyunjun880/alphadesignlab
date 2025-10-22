'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getStatusColor, getStatusText, getDaysUntilExpiry } from '@/lib/hosting-utils'

interface Site {
  id: string
  name: string
  domain: string
  description: string | null
  client: {
    id: string
    name: string
    email: string
  }
  hostingInfo: Array<{
    id: string
    provider: string
    plan: string
    monthlyCost: number
    expiryDate: Date
    status: string
    autoRenewal: boolean
  }>
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminDashboard({ sites: initialSites }: { sites: Site[] }) {
  const [sites, setSites] = useState(initialSites)
  const [users, setUsers] = useState<User[]>([])
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddHosting, setShowAddHosting] = useState(false)
  const [selectedSite, setSelectedSite] = useState<string>('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
  }

  const refreshSites = async () => {
    const res = await fetch('/api/sites')
    if (res.ok) {
      const data = await res.json()
      setSites(data.sites)
    }
  }

  const handleAddSite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        domain: formData.get('domain'),
        description: formData.get('description'),
        clientId: formData.get('clientId'),
      }),
    })

    if (res.ok) {
      setShowAddSite(false)
      refreshSites()
      e.currentTarget.reset()
    }
  }

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
      }),
    })

    if (res.ok) {
      setShowAddUser(false)
      fetchUsers()
      e.currentTarget.reset()
    }
  }

  const handleAddHosting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/hosting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: selectedSite,
        provider: formData.get('provider'),
        plan: formData.get('plan'),
        monthlyCost: formData.get('monthlyCost'),
        yearlyTotal: formData.get('yearlyTotal'),
        startDate: formData.get('startDate'),
        expiryDate: formData.get('expiryDate'),
        autoRenewal: formData.get('autoRenewal') === 'on',
        notes: formData.get('notes'),
      }),
    })

    if (res.ok) {
      setShowAddHosting(false)
      setSelectedSite('')
      refreshSites()
      e.currentTarget.reset()
    }
  }

  // 만료 임박 사이트 통계
  const expiringSoon = sites.filter(site => {
    const hosting = site.hostingInfo[0]
    if (!hosting) return false
    const days = getDaysUntilExpiry(new Date(hosting.expiryDate))
    return days >= 0 && days <= 30
  }).length

  const expired = sites.filter(site => {
    const hosting = site.hostingInfo[0]
    if (!hosting) return false
    return getDaysUntilExpiry(new Date(hosting.expiryDate)) < 0
  }).length

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">전체 사이트</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{sites.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">전체 클라이언트</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{users.filter(u => u.role === 'CLIENT').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-yellow-600">만료 임박</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{expiringSoon}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-red-600">만료됨</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{expired}</p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddSite(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          + 사이트 추가
        </button>
        <button
          onClick={() => setShowAddUser(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
        >
          + 사용자 추가
        </button>
      </div>

      {/* 사이트 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">전체 사이트</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사이트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  클라이언트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  호스팅 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  만료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites.map((site) => {
                const hosting = site.hostingInfo[0]
                const daysLeft = hosting ? getDaysUntilExpiry(new Date(hosting.expiryDate)) : null

                return (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{site.name}</div>
                        <div className="text-sm text-gray-500">{site.domain}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{site.client.name}</div>
                      <div className="text-sm text-gray-500">{site.client.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {hosting ? (
                        <div>
                          <div className="text-sm text-gray-900">{hosting.provider}</div>
                          <div className="text-sm text-gray-500">
                            {hosting.plan} - ₩{hosting.monthlyCost.toLocaleString()}/월
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">호스팅 정보 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hosting ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {format(new Date(hosting.expiryDate), 'yyyy-MM-dd', { locale: ko })}
                          </div>
                          {daysLeft !== null && (
                            <div className={`text-sm ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)}일 전 만료` : `${daysLeft}일 남음`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hosting ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hosting.status as any)}`}>
                          {getStatusText(hosting.status as any)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedSite(site.id)
                          setShowAddHosting(true)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        호스팅 추가/수정
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 사이트 추가 모달 */}
      {showAddSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">새 사이트 추가</h2>
            <form onSubmit={handleAddSite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사이트명</label>
                <input name="name" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">도메인</label>
                <input name="domain" required className="w-full px-3 py-2 border rounded-lg" placeholder="example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea name="description" className="w-full px-3 py-2 border rounded-lg" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">클라이언트</label>
                <select name="clientId" required className="w-full px-3 py-2 border rounded-lg">
                  <option value="">선택하세요</option>
                  {users.filter(u => u.role === 'CLIENT').map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  추가
                </button>
                <button type="button" onClick={() => setShowAddSite(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 사용자 추가 모달 */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">새 사용자 추가</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input name="name" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input name="password" type="password" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <select name="role" required className="w-full px-3 py-2 border rounded-lg">
                  <option value="CLIENT">클라이언트</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  추가
                </button>
                <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 호스팅 정보 추가 모달 */}
      {showAddHosting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">호스팅 정보 추가</h2>
            <form onSubmit={handleAddHosting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">호스팅 제공사</label>
                <input name="provider" required className="w-full px-3 py-2 border rounded-lg" placeholder="AWS, Cafe24, 가비아 등" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">플랜명</label>
                <input name="plan" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">월 비용 (₩)</label>
                <input name="monthlyCost" type="number" step="0.01" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연 총액 (₩, 선택)</label>
                <input name="yearlyTotal" type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                <input name="startDate" type="date" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">만료일</label>
                <input name="expiryDate" type="date" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex items-center">
                <input name="autoRenewal" type="checkbox" className="mr-2" />
                <label className="text-sm font-medium text-gray-700">자동 갱신</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                <textarea name="notes" className="w-full px-3 py-2 border rounded-lg" rows={2} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  추가
                </button>
                <button type="button" onClick={() => { setShowAddHosting(false); setSelectedSite('') }} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
