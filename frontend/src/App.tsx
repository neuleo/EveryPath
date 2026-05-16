import { useState, useEffect, useRef } from 'react'
import { Map } from './components/Map'
import type { MapRef } from './components/Map'
import './index.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const [includeDeadEnds, setIncludeDeadEnds] = useState(true)
  const [hasGraph, setHasGraph] = useState(false)
  const [edgeCount, setEdgeCount] = useState(0)
  const [route, setRoute] = useState<any[]>([])
  
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null)
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null)

  const mapRef = useRef<MapRef>(null)

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
    mapRef.current?.generateRoute();
  }

  const handleReset = () => {
    mapRef.current?.resetMap();
    setStartPoint(null);
    setEndPoint(null);
  }

  const handleSetStartMode = () => {
    mapRef.current?.setPointMode('start');
  }

  const handleSetEndMode = () => {
    mapRef.current?.setPointMode('end');
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
    <div className="h-screen w-screen flex flex-col bg-slate-900 relative">
      {/* Responsive Overlay */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 z-[100] pointer-events-none">
        <div className="bg-black/85 p-5 md:p-6 rounded-2xl border border-white/10 text-white pointer-events-auto backdrop-blur-md shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="m-0 text-2xl md:text-3xl font-bold text-white tracking-tight">EveryPath</h1>
              <p className="m-0 mt-1 text-[10px] md:text-xs opacity-50 tracking-widest uppercase font-semibold">Routing & Coverage</p>
            </div>
            {(hasGraph || startPoint || endPoint) && (
              <button 
                onClick={handleReset}
                title="Alles löschen"
                className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-red-500/20 transition-colors"
              >
                RESET
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Status & Options */}
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'OK' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                 <span className="text-xs font-medium text-slate-300">API: {backendStatus}</span>
              </div>
              <div className="text-xs font-medium text-slate-400">
                Segmente: <span className={edgeCount > 0 ? 'text-green-400 font-bold' : 'text-slate-300'}>{edgeCount}</span>
              </div>
            </div>

            <div 
              className="flex items-center justify-between cursor-pointer group" 
              onClick={() => setIncludeDeadEnds(!includeDeadEnds)}
            >
              <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Sackgassen einbeziehen</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${includeDeadEnds ? 'bg-blue-500' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ease-in-out ${includeDeadEnds ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleSetStartMode}
                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                  startPoint ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {startPoint ? 'START ÄNDERN' : 'START SETZEN'}
              </button>
              <button 
                onClick={handleSetEndMode}
                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                  endPoint ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {endPoint ? 'ZIEL ÄNDERN' : 'ZIEL SETZEN'}
              </button>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-3">
              <button 
                onClick={handleGenerateRoute}
                disabled={!hasGraph}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${
                  hasGraph 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                Route berechnen
              </button>

              {route.length > 0 && (
                <button 
                  onClick={handleDownloadGPX}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-colors shadow-lg shadow-emerald-900/50"
                >
                  GPX Exportieren
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Map 
          ref={mapRef}
          includeDeadEnds={includeDeadEnds} 
          onGraphFetched={(data) => {
            setEdgeCount(data.edges.length);
            setHasGraph(data.edges.length > 0);
          }}
          onRouteGenerated={(r) => {
            setRoute(r);
          }}
          onStartPointSet={(coords) => setStartPoint(coords)}
          onEndPointSet={(coords) => setEndPoint(coords)}
        />
      </div>
    </div>
  )
}

export default App
