import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface MapProps {
  includeDeadEnds: boolean;
  onGraphFetched: (data: any) => void;
  onRouteGenerated: (route: any[]) => void;
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

export const Map = ({ includeDeadEnds, onGraphFetched, onRouteGenerated }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const currentGraph = useRef<any>(null);

  const propsRef = useRef({ onGraphFetched, onRouteGenerated, includeDeadEnds });
  useEffect(() => {
    propsRef.current = { onGraphFetched, onRouteGenerated, includeDeadEnds };
  }, [onGraphFetched, onRouteGenerated, includeDeadEnds]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    // Default center (Munich) if geolocation fails
    let initialCenter: [number, number] = [11.582, 48.135];
    
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
        });

        const updatePolygon = async () => {
          const data = draw.current?.getAll();
          if (data && data.features.length > 0) {
            const feature = data.features[0];
            if (feature.geometry.type === 'Polygon') {
              try {
                const coords = (feature.geometry as any).coordinates[0];
                const response = await fetch('/api/fetch-osm', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ coordinates: coords })
                });
                
                if (!response.ok) {
                  const errData = await response.json();
                  throw new Error(errData.detail || 'Server error fetching OSM data');
                }
                
                const graphData = await response.json();
                currentGraph.current = graphData;
                propsRef.current.onGraphFetched(graphData);
                
                const features = graphData.edges.map((edge: any) => {
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
                setMapError(err.message);
                setTimeout(() => setMapError(null), 5000);
              }
            }
          }
        };

        const clearMap = () => {
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
        m.on('draw.delete', clearMap);

      } catch (err: any) {
        setMapError(err.message);
      }
    };

    // Attempt to get current position
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location found:', position.coords.latitude, position.coords.longitude);
          initMap([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
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

  useEffect(() => {
    (window as any).generateRoute = async () => {
      if (!currentGraph.current || !map.current) return;
      try {
        const response = await fetch('/api/generate-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodes: currentGraph.current.nodes,
            edges: currentGraph.current.edges,
            include_dead_ends: propsRef.current.includeDeadEnds
          })
        });
        const data = await response.json();
        propsRef.current.onRouteGenerated(data.route);
        const routeCoords = data.route.map((node: any) => [node.lon, node.lat]);
        const routeSource = map.current?.getSource('route') as maplibregl.GeoJSONSource;
        routeSource?.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords }, properties: {} } as any);
      } catch (err: any) {
        console.error('Map: Route Error:', err);
        setMapError(err.message);
      }
    };

    (window as any).resetMap = () => {
      if (draw.current) {
        draw.current.deleteAll();
        // Trigger manual update because deleteAll() doesn't fire events
        currentGraph.current = null;
        propsRef.current.onGraphFetched({ nodes: [], edges: [] });
        propsRef.current.onRouteGenerated([]);
        
        if (map.current) {
          const osmSource = map.current.getSource('osm-edges') as maplibregl.GeoJSONSource;
          osmSource?.setData({ type: 'FeatureCollection', features: [] });
          const routeSource = map.current.getSource('route') as maplibregl.GeoJSONSource;
          routeSource?.setData({ type: 'FeatureCollection', features: [] });
        }
      }
    };
  }, []); 

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
      {mapError && (
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
          {mapError}
        </div>
      )}
    </div>
  );
};
