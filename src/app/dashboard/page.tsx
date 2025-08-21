export default function CustomerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="mt-4 text-gray-600">Book appointments, view history, manage profile</p>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule your next visit</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium">View History</h3>
              <p className="text-sm text-gray-600">See past appointments</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium">Manage Profile</h3>
              <p className="text-sm text-gray-600">Update your information</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
