import { useState, useEffect } from 'react'
import { Map } from './components/Map'
import './index.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const [includeDeadEnds, setIncludeDeadEnds] = useState(true)
  const [hasGraph, setHasGraph] = useState(false)
  const [route, setRoute] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(err => {
        console.error('Backend fetch error:', err)
        setBackendStatus('Error')
      })
  }, [])

  const handleGenerateRoute = () => {
    if ((window as any).generateRoute) {
      (window as any).generateRoute();
    }
  }

  const handleDownloadGPX = async () => {
    if (route.length === 0) return;
    
    try {
      const response = await fetch('/api/export-gpx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: route.map(n => [n.lat, n.lon])
        })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'everypath-route.gpx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('GPX Export Error:', err);
    }
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
      {/* Map Header Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, pointerEvents: 'none' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', pointerEvents: 'auto', backdropFilter: 'blur(10px)' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>EveryPath</h1>
          <p style={{ margin: '4px 0 20px 0', fontSize: '10px', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase' }}>Routing & Coverage</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: backendStatus === 'OK' ? '#22c55e' : '#ef4444' }} />
               <span style={{ fontSize: '12px', opacity: 0.8 }}>API: {backendStatus}</span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setIncludeDeadEnds(!includeDeadEnds)}>
              <div style={{ width: '40px', height: '20px', backgroundColor: includeDeadEnds ? '#3b82f6' : '#334155', borderRadius: '20px', position: 'relative', transition: '0.2s' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: includeDeadEnds ? '22px' : '2px', transition: '0.2s' }} />
              </div>
              <span style={{ fontSize: '13px' }}>Sackgassen einbeziehen</span>
            </div>

            <button 
              onClick={handleGenerateRoute}
              disabled={!hasGraph}
              style={{ 
                width: '100%', 
                backgroundColor: hasGraph ? '#3b82f6' : '#1e293b', 
                color: hasGraph ? 'white' : '#64748b', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: hasGraph ? 'pointer' : 'not-allowed',
                transition: '0.2s'
              }}
            >
              Route berechnen
            </button>

            {route.length > 0 && (
              <button 
                onClick={handleDownloadGPX}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                GPX Exportieren
              </button>
            )}
          </div>
        </div>
      </div>

      <Map 
        includeDeadEnds={includeDeadEnds} 
        onGraphFetched={(data) => setHasGraph(data.edges.length > 0)}
        onRouteGenerated={(r) => setRoute(r)}
      />
    </div>
  )
}

export default App
