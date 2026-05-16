import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface MapProps {
  includeDeadEnds: boolean;
  onGraphFetched: (data: any) => void;
  onRouteGenerated: (route: any[]) => void;
  onStartPointSet?: (coords: [number, number] | null) => void;
  onEndPointSet?: (coords: [number, number] | null) => void;
}

export interface MapRef {
  generateRoute: () => Promise<void>;
  resetMap: () => void;
  setPointMode: (mode: 'start' | 'end' | null) => void;
}

const drawStyles = [
  {
    'id': 'gl-draw-polygon-fill-inactive',
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    'paint': { 'fill-color': '#3bb2d0', 'fill-outline-color': '#3bb2d0', 'fill-opacity': 0.1 }
  },
  {
    'id': 'gl-draw-polygon-fill-active',
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'paint': { 'fill-color': '#fbb03b', 'fill-outline-color': '#fbb03b', 'fill-opacity': 0.1 }
  },
  {
    'id': 'gl-draw-polygon-stroke-inactive',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    'layout': { 'line-cap': 'round', 'line-join': 'round' },
    'paint': { 'line-color': '#3bb2d0', 'line-width': 2 }
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'layout': { 'line-cap': 'round', 'line-join': 'round' },
    'paint': { 'line-color': '#fbb03b', 'line-dasharray': [2, 2], 'line-width': 2 }
  },
  {
    'id': 'gl-draw-line-inactive',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    'layout': { 'line-cap': 'round', 'line-join': 'round' },
    'paint': { 'line-color': '#3bb2d0', 'line-width': 2 }
  },
  {
    'id': 'gl-draw-line-active',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    'layout': { 'line-cap': 'round', 'line-join': 'round' },
    'paint': { 'line-color': '#fbb03b', 'line-dasharray': [2, 2], 'line-width': 2 }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': { 'circle-radius': 5, 'circle-color': '#fff' }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': { 'circle-radius': 3, 'circle-color': '#fbb03b' }
  },
  {
    'id': 'gl-draw-point-point-stroke-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    'paint': { 'circle-radius': 5, 'circle-opacity': 0.05, 'circle-color': '#000' }
  },
  {
    'id': 'gl-draw-point-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    'paint': { 'circle-radius': 3, 'circle-color': '#3bb2d0' }
  },
  {
    'id': 'gl-draw-point-stroke-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    'paint': { 'circle-radius': 7, 'circle-color': '#fff' }
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    'paint': { 'circle-radius': 5, 'circle-color': '#fbb03b' }
  }
];

export const Map = forwardRef<MapRef, MapProps>(({ includeDeadEnds, onGraphFetched, onRouteGenerated, onStartPointSet, onEndPointSet }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const animationRef = useRef<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const currentGraph = useRef<any>(null);
  const [pointMode, _setPointMode] = useState<'start' | 'end' | null>(null);
  
  const startMarker = useRef<maplibregl.Marker | null>(null);
  const endMarker = useRef<maplibregl.Marker | null>(null);
  const startCoords = useRef<[number, number] | null>(null);
  const endCoords = useRef<[number, number] | null>(null);
  const userLocation = useRef<[number, number] | null>(null);

  const propsRef = useRef({ onGraphFetched, onRouteGenerated, includeDeadEnds, onStartPointSet, onEndPointSet });
  useEffect(() => {
    propsRef.current = { onGraphFetched, onRouteGenerated, includeDeadEnds, onStartPointSet, onEndPointSet };
  }, [onGraphFetched, onRouteGenerated, includeDeadEnds, onStartPointSet, onEndPointSet]);

  useImperativeHandle(ref, () => ({
    generateRoute: async () => {
      if (!currentGraph.current || !map.current) return;
      
      try {
        const start = startCoords.current || userLocation.current;
        const response = await fetch('/api/generate-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodes: currentGraph.current.nodes,
            edges: currentGraph.current.edges,
            include_dead_ends: propsRef.current.includeDeadEnds,
            start_coords: start,
            end_coords: endCoords.current
          })
        });
        const data = await response.json();
        propsRef.current.onRouteGenerated(data.route);
        
        const routeCoords = data.route.map((node: any) => [node.lon, node.lat]);
        const routeSource = map.current?.getSource('route') as maplibregl.GeoJSONSource;
        
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        
        let progress = 0;
        const totalNodes = routeCoords.length;
        const drawStep = Math.max(1, Math.floor(totalNodes / 120)); 
        
        const animateLine = () => {
          progress += drawStep;
          if (progress > totalNodes) progress = totalNodes;
          
          routeSource?.setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoords.slice(0, progress)
            },
            properties: {}
          } as any);
          
          if (progress < totalNodes) {
             animationRef.current = requestAnimationFrame(animateLine);
          }
        };
        
        if (totalNodes > 0) {
          animateLine();
        } else {
          routeSource?.setData({ type: 'FeatureCollection', features: [] });
        }

      } catch (err) {
        console.error('Map: Route Generation Error:', err);
      }
    },
    resetMap: () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (draw.current) {
        draw.current.deleteAll();
        draw.current.changeMode('draw_polygon');
        currentGraph.current = null;
        propsRef.current.onGraphFetched({ nodes: [], edges: [] });
        propsRef.current.onRouteGenerated([]);
        
        if (map.current) {
          const osmSource = map.current.getSource('osm-edges') as maplibregl.GeoJSONSource;
          osmSource?.setData({ type: 'FeatureCollection', features: [] });
          const routeSource = map.current.getSource('route') as maplibregl.GeoJSONSource;
          routeSource?.setData({ type: 'FeatureCollection', features: [] });
        }

        if (startMarker.current) {
          startMarker.current.remove();
          startMarker.current = null;
          startCoords.current = null;
          propsRef.current.onStartPointSet?.(null);
        }
        if (endMarker.current) {
          endMarker.current.remove();
          endMarker.current = null;
          endCoords.current = null;
          propsRef.current.onEndPointSet?.(null);
        }
      }
    },
    setPointMode: (mode: 'start' | 'end' | null) => {
      _setPointMode(mode);
    }
  }));

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    const initialCenter: [number, number] = [11.582, 48.135];
    
    const initMap = (center: [number, number]) => {
      try {
        const m = new maplibregl.Map({
          container: mapContainer.current!,
          style: 'https://tiles.openfreemap.org/styles/dark', 
          center: center,
          zoom: 14
        });
        map.current = m;

        m.on('load', () => {
          draw.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: { polygon: true, trash: true },
            defaultMode: 'draw_polygon',
            styles: drawStyles
          });
          m.addControl(draw.current as any, 'top-right');
          m.addControl(new maplibregl.NavigationControl(), 'bottom-right');
          m.addControl(new maplibregl.GeolocateControl({ 
            positionOptions: { enableHighAccuracy: true }, 
            trackUserLocation: true 
          }), 'bottom-right');

          m.addSource('osm-edges', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          m.addLayer({
            id: 'osm-edges-layer',
            type: 'line',
            source: 'osm-edges',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#00ffcc', 'line-width': 2, 'line-opacity': 0.6 }
          });

          m.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          m.addLayer({
            id: 'route-layer',
            type: 'line',
            source: 'route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.8 }
          });
          m.addLayer({
            id: 'route-arrows',
            type: 'symbol',
            source: 'route',
            layout: {
              'symbol-placement': 'line',
              'text-field': '▶',
              'text-size': 18,
              'symbol-spacing': 50,
              'text-keep-upright': false
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#1e40af',
              'text-halo-width': 1
            }
          });
        });

        const updatePolygon = async () => {
          const data = draw.current?.getAll();
          if (data && data.features.length > 0) {
            const feature = data.features[0];
            if (feature.geometry.type === 'Polygon') {
              try {
                const coords = (feature.geometry as any).coordinates[0];
                // Pass start/end coords to fetch-osm so it can expand the area
                const response = await fetch('/api/fetch-osm', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    coordinates: coords,
                    start_coords: startCoords.current || userLocation.current,
                    end_coords: endCoords.current
                  })
                });
                
                const graphData = await response.json();
                currentGraph.current = graphData;
                propsRef.current.onGraphFetched(graphData);
                
                const features = graphData.edges
                  .filter((edge: any) => edge.required !== false)
                  .map((edge: any) => {
                  const u = graphData.nodes.find((n: any) => n.id === edge.u);
                  const v = graphData.nodes.find((n: any) => n.id === edge.v);
                  if (!u || !v) return null;
                  return {
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: [[u.lon, u.lat], [v.lon, v.lat]] },
                    properties: edge.metadata
                  };
                }).filter((f: any) => f !== null);
                
                const source = m.getSource('osm-edges') as maplibregl.GeoJSONSource;
                source?.setData({ type: 'FeatureCollection', features });

                const routeSource = m.getSource('route') as maplibregl.GeoJSONSource;
                routeSource?.setData({ type: 'FeatureCollection', features: [] });
                propsRef.current.onRouteGenerated([]);

              } catch (err: any) {
                console.error('Map: Fetch Error:', err);
              }
            }
          }
        };

        const clearMapInternal = () => {
          currentGraph.current = null;
          propsRef.current.onGraphFetched({ nodes: [], edges: [] });
          propsRef.current.onRouteGenerated([]);
          
          const osmSource = m.getSource('osm-edges') as maplibregl.GeoJSONSource;
          osmSource?.setData({ type: 'FeatureCollection', features: [] });
          
          const routeSource = m.getSource('route') as maplibregl.GeoJSONSource;
          routeSource?.setData({ type: 'FeatureCollection', features: [] });
        };

        m.on('draw.create', updatePolygon);
        m.on('draw.update', updatePolygon);
        m.on('draw.delete', clearMapInternal);

      } catch (err: any) {
        setMapError(err.message);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          userLocation.current = coords;
          initMap(coords);
        },
        () => {
          initMap(initialCenter);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      initMap(initialCenter);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when coords change
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    const handleSetPoint = (e: maplibregl.MapMouseEvent) => {
      if (!pointMode) return;

      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      if (pointMode === 'start') {
        startCoords.current = lngLat;
        if (!startMarker.current) {
          startMarker.current = new maplibregl.Marker({ color: '#22c55e' }).setLngLat(lngLat).addTo(m);
        } else {
          startMarker.current.setLngLat(lngLat);
        }
        propsRef.current.onStartPointSet?.(lngLat);
      } else {
        endCoords.current = lngLat;
        if (!endMarker.current) {
          endMarker.current = new maplibregl.Marker({ color: '#ef4444' }).setLngLat(lngLat).addTo(m);
        } else {
          endMarker.current.setLngLat(lngLat);
        }
        propsRef.current.onEndPointSet?.(lngLat);
      }
      
      _setPointMode(null);
    };

    m.on('click', handleSetPoint);
    return () => {
      m.off('click', handleSetPoint);
    };
  }, [pointMode]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
      {pointMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-pulse text-xs text-center">
          Klicke auf die Karte, um den {pointMode === 'start' ? 'STARTPUNKT' : 'ENDPUNKT'} zu setzen
        </div>
      )}
      {mapError && (
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(220, 38, 38, 0.9)', color: 'white', padding: '24px', borderRadius: '12px', zIndex: 1000 }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Map Error</h2>
          <p style={{ margin: 0, fontSize: '14px' }}>{mapError}</p>
        </div>
      )}
    </div>
  );
});
