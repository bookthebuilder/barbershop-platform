import { requireProvider } from "@/lib/auth-utils"

export default async function ProviderDashboard() {
  const session = await requireProvider()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.firstName}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Today's Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">6</p>
            <p className="text-sm text-gray-500">Next: 2:00 PM</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">This Week's Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$850</p>
            <p className="text-sm text-gray-500">+15% from last week</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Customer Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">4.9</p>
            <p className="text-sm text-gray-500">⭐⭐⭐⭐⭐ (47 reviews)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-600">Precision Fade</p>
                </div>
                <span className="text-sm font-medium">10:00 AM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Sarah Wilson</p>
                  <p className="text-sm text-gray-600">Classic Haircut</p>
                </div>
                <span className="text-sm font-medium">2:00 PM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Available</p>
                  <p className="text-sm text-gray-600">Open slot</p>
                </div>
                <span className="text-sm font-medium">4:00 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                📅 View Full Schedule
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                ⏰ Set Availability
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                👤 View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
