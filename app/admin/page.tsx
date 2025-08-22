import { requireAdmin } from "@/lib/auth-utils"

export default async function AdminDashboard() {
  const session = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.firstName}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">127</p>
            <p className="text-sm text-gray-500">+12% from last month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$4,250</p>
            <p className="text-sm text-gray-500">+8% from last month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Active Providers</h3>
            <p className="text-3xl font-bold text-purple-600">2</p>
            <p className="text-sm text-gray-500">Alex & Jordan</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">New Customers</h3>
            <p className="text-3xl font-bold text-orange-600">23</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span>New booking by John Doe</span>
              <span className="text-sm text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>Payment received - $55.00</span>
              <span className="text-sm text-gray-500">15 minutes ago</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>New customer registered</span>
              <span className="text-sm text-gray-500">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

