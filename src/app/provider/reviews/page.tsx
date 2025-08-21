import { ProviderLayout } from '@/components/provider/provider-layout'

export default function ProviderReviewsPage() {
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">Reviews management page</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Reviews features coming soon...</p>
        </div>
      </div>
    </ProviderLayout>
  )
}
