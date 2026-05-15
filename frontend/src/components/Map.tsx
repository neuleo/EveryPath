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

export const Map = ({ includeDeadEnds, onGraphFetched, onRouteGenerated }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const currentGraph = useRef<any>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    console.log('Initializing full map system...');
    
    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/dark', 
        center: [11.582, 48.135],
        zoom: 12
      });

      map.current.on('load', () => {
        console.log('Map engine loaded');
        
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          defaultMode: 'draw_polygon'
        });
        map.current?.addControl(draw.current as any, 'top-right');

        // OSM Source
        map.current?.addSource('osm-edges', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.current?.addLayer({
          id: 'osm-edges-layer',
          type: 'line',
          source: 'osm-edges',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#00ffcc',
            'line-width': 2,
            'line-opacity': 0.4
          }
        });

        // Route Source
        map.current?.addSource('route', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.current?.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#3b82f6', // Bright blue for the final route
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true
        }),
        'bottom-right'
      );

    const updatePolygon = async () => {
      const data = draw.current?.getAll();
      console.log('Draw update event triggered', data);
      if (data && data.features.length > 0) {
        const feature = data.features[0];
        if (feature.geometry.type === 'Polygon') {
          try {
            const coords = (feature.geometry as any).coordinates[0];
            console.log('Fetching OSM for coords:', coords);
            const response = await fetch('/api/fetch-osm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ coordinates: coords })
            });
            const graphData = await response.json();
            console.log('OSM Data received:', graphData);
            currentGraph.current = graphData;
            onGraphFetched(graphData);
            
            const features = graphData.edges.map((edge: any) => {
              const u = graphData.nodes.find((n: any) => n.id === edge.u);
              const v = graphData.nodes.find((n: any) => n.id === edge.v);
              if (!u || !v) return null;
              return {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [[u.lon, u.lat], [v.lon, v.lat]]
                },
                properties: edge.metadata
              };
            }).filter((f: any) => f !== null);
            
            const source = map.current?.getSource('osm-edges') as maplibregl.GeoJSONSource;
            source?.setData({ type: 'FeatureCollection', features });

            // Clear route when new polygon drawn
            const routeSource = map.current?.getSource('route') as maplibregl.GeoJSONSource;
            routeSource?.setData({ type: 'FeatureCollection', features: [] });
            onRouteGenerated([]);

          } catch (err) {
            console.error('OSM Fetch Error:', err);
          }
        }
      }
    };

      map.current.on('draw.create', updatePolygon);
      map.current.on('draw.update', updatePolygon);

    } catch (err: any) {
      console.error('Map initialization catch:', err);
      setMapError(err.message);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Expose function to generate route
  useEffect(() => {
    (window as any).generateRoute = async () => {
      if (!currentGraph.current) return;
      
      try {
        const response = await fetch('/api/generate-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodes: currentGraph.current.nodes,
            edges: currentGraph.current.edges,
            include_dead_ends: includeDeadEnds
          })
        });
        const data = await response.json();
        onRouteGenerated(data.route);
        
        const routeCoords = data.route.map((node: any) => [node.lon, node.lat]);
        const routeSource = map.current?.getSource('route') as maplibregl.GeoJSONSource;
        routeSource?.setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: routeCoords
          },
          properties: {}
        } as any);

      } catch (err) {
        console.error('Route Generation Error:', err);
      }
    };
  }, [includeDeadEnds, onRouteGenerated]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
      {mapError && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(220, 38, 38, 0.9)', color: 'white', padding: '24px', borderRadius: '12px', zIndex: 1000 }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Map Error</h2>
          <p style={{ margin: 0, fontSize: '14px' }}>{mapError}</p>
        </div>
      )}
    </div>
  );
};
