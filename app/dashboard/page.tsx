import { requireAuth } from "@/lib/auth-utils"

export default async function CustomerDashboard() {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.firstName}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Next Appointment</h3>
            <p className="text-xl font-bold text-blue-600">Tomorrow</p>
            <p className="text-sm text-gray-500">2:00 PM with Jordan</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Loyalty Points</h3>
            <p className="text-xl font-bold text-green-600">150</p>
            <p className="text-sm text-gray-500">50 points to next reward</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Visits</h3>
            <p className="text-xl font-bold text-purple-600">12</p>
            <p className="text-sm text-gray-500">Since joining</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Precision Fade</p>
                  <p className="text-sm text-gray-600">with Alex Rodriguez</p>
                </div>
                <span className="text-sm font-medium">Dec 15, 2024</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Classic Haircut</p>
                  <p className="text-sm text-gray-600">with Jordan Smith</p>
                </div>
                <span className="text-sm font-medium">Nov 28, 2024</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                📅 Book New Appointment
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                ⏰ Reschedule Appointment
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                👤 Update Profile
              </button>
              <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                ⭐ Leave a Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
