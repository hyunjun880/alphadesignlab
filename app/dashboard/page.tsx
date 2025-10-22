import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import AdminDashboard from '@/components/AdminDashboard'
import ClientDashboard from '@/components/ClientDashboard'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // 사이트 데이터 조회
  const sites = session.role === 'ADMIN'
    ? await prisma.site.findMany({
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
    : await prisma.site.findMany({
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session.role === 'ADMIN' ? (
          <AdminDashboard sites={sites} />
        ) : (
          <ClientDashboard sites={sites} />
        )}
      </main>
    </div>
  )
}
