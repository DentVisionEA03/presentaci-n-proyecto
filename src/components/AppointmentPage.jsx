import { useState } from 'react'
import AppLayout from './AppLayout'
import AppointmentForm from './AppointmentForm'
import UserAppointmentsPanel from './UserAppointmentsPanel'
import { useAuth } from './context/AuthContext'

function AppointmentPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useAuth()
  const userId = user?.id && user.id !== 'mock-user' ? user.id : user?.email

  return (
    <AppLayout>
      <UserAppointmentsPanel refreshKey={refreshKey} userId={userId} />
      <AppointmentForm
        onAppointmentCreated={() => setRefreshKey((current) => current + 1)}
        userEmail={user?.email}
        userId={userId}
      />
    </AppLayout>
  )
}

export default AppointmentPage
