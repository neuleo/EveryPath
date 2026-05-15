import { useState, useEffect } from 'react'
import { Map } from './components/Map'
import './index.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(err => {
        console.error('Backend fetch error:', err)
        setBackendStatus('Error')
      })
  }, [])

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
      {/* Map Header Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, pointerEvents: 'none' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>EveryPath</h1>
          <p style={{ margin: '4px 0 16px 0', fontSize: '10px', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase' }}>Routing & Coverage</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: backendStatus === 'OK' ? '#22c55e' : '#ef4444' }} />
             <span style={{ fontSize: '12px' }}>API: {backendStatus}</span>
          </div>
        </div>
      </div>

      <Map />
    </div>
  )
}

export default App
