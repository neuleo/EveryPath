import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    fetch(`${apiUrl}/health`)
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(err => {
        console.error('Backend fetch error:', err)
        setBackendStatus('Error connecting to backend')
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">EveryPath</h1>
        <p className="text-gray-600 mb-6">
          Scaffolded with Vite + React + TypeScript + Tailwind CSS
        </p>
        
        <div className="mb-6">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Count is {count}
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Backend Status
          </p>
          <p className={`text-lg font-bold ${backendStatus === 'OK' ? 'text-green-500' : 'text-red-500'}`}>
            {backendStatus}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
