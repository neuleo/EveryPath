import { useState, useEffect } from 'react'
import { Map } from './components/Map'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    fetch(`${apiUrl}/health`)
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(err => {
        console.error('Backend fetch error:', err)
        setBackendStatus('Error')
      })
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900">
      {/* Map is the hero component */}
      <Map />

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/70 backdrop-blur-md p-4 rounded-lg shadow-xl border border-white/10 text-white max-w-xs">
          <h1 className="text-2xl font-bold tracking-tighter mb-1">EveryPath</h1>
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest">Routing & Coverage</p>
          
          <div className="flex items-center space-x-2 bg-white/5 p-2 rounded">
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'OK' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
            <p className="text-xs font-medium text-gray-300">
              API: {backendStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
