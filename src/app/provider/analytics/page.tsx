import { ProviderLayout } from '@/components/provider/provider-layout'

export default function ProviderAnalyticsPage() {
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Analytics management page</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Analytics features coming soon...</p>
        </div>
      </div>
    </ProviderLayout>
  )
}
