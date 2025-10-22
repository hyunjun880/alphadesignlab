'use client'

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
    yearlyTotal: number | null
    startDate: Date
    expiryDate: Date
    status: string
    autoRenewal: boolean
    notes: string | null
  }>
}

export default function ClientDashboard({ sites }: { sites: Site[] }) {
  // 총 월 비용 계산
  const totalMonthlyCost = sites.reduce((sum, site) => {
    const hosting = site.hostingInfo[0]
    return sum + (hosting?.monthlyCost || 0)
  }, 0)

  // 만료 임박 사이트
  const expiringSoon = sites.filter(site => {
    const hosting = site.hostingInfo[0]
    if (!hosting) return false
    const days = getDaysUntilExpiry(new Date(hosting.expiryDate))
    return days >= 0 && days <= 30
  })

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">내 사이트</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{sites.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">월 총 호스팅 비용</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ₩{totalMonthlyCost.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-yellow-600">만료 임박 사이트</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{expiringSoon.length}</p>
        </div>
      </div>

      {/* 만료 임박 알림 */}
      {expiringSoon.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ 만료 임박 알림</h3>
          <ul className="space-y-1">
            {expiringSoon.map(site => {
              const hosting = site.hostingInfo[0]
              const days = getDaysUntilExpiry(new Date(hosting.expiryDate))
              return (
                <li key={site.id} className="text-sm text-yellow-700">
                  <strong>{site.name}</strong> - {days}일 남음 (만료일: {format(new Date(hosting.expiryDate), 'yyyy-MM-dd')})
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* 사이트 목록 */}
      <div className="space-y-4">
        {sites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">등록된 사이트가 없습니다.</p>
          </div>
        ) : (
          sites.map(site => {
            const hosting = site.hostingInfo[0]
            const daysLeft = hosting ? getDaysUntilExpiry(new Date(hosting.expiryDate)) : null

            return (
              <div key={site.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{site.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{site.domain}</p>
                      {site.description && (
                        <p className="text-sm text-gray-600 mt-2">{site.description}</p>
                      )}
                    </div>
                    {hosting && (
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(hosting.status as any)}`}>
                        {getStatusText(hosting.status as any)}
                      </span>
                    )}
                  </div>

                  {hosting ? (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">호스팅 정보</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">호스팅 제공사</p>
                          <p className="text-sm font-medium text-gray-900">{hosting.provider}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">플랜</p>
                          <p className="text-sm font-medium text-gray-900">{hosting.plan}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">월 비용</p>
                          <p className="text-sm font-medium text-gray-900">₩{hosting.monthlyCost.toLocaleString()}</p>
                        </div>
                        {hosting.yearlyTotal && (
                          <div>
                            <p className="text-xs text-gray-500">연 총액</p>
                            <p className="text-sm font-medium text-gray-900">₩{hosting.yearlyTotal.toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">시작일</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(hosting.startDate), 'yyyy년 MM월 dd일', { locale: ko })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">만료일</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(hosting.expiryDate), 'yyyy년 MM월 dd일', { locale: ko })}
                            {daysLeft !== null && (
                              <span className={`ml-2 text-xs ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                                ({daysLeft < 0 ? `${Math.abs(daysLeft)}일 전 만료` : `${daysLeft}일 남음`})
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">자동 갱신</p>
                          <p className="text-sm font-medium text-gray-900">
                            {hosting.autoRenewal ? '✓ 활성화' : '✗ 비활성화'}
                          </p>
                        </div>
                        {hosting.notes && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500">메모</p>
                            <p className="text-sm text-gray-700">{hosting.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500">호스팅 정보가 등록되지 않았습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
