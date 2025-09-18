import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import ChatInterface from '../components/ChatInterface'
import LocationFinder from '../components/LocationFinder'
import { getCurrentUser } from '../utils/supabase'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const userData = await getCurrentUser()
      if (!userData) {
        router.push('/auth')
      } else {
        setUser(userData)
      }
    }
    checkUser()
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back!</h1>
          <p className="text-gray-600">How can we help you with your maternal health journey today?</p>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'chat' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat with Assistant
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'clinics' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('clinics')}
          >
            Find Clinics
          </button>
        </div>

        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <ChatInterface patientId={user.id} />
          </div>
        )}

        {activeTab === 'clinics' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <LocationFinder />
          </div>
        )}
      </div>
    </div>
  )
}