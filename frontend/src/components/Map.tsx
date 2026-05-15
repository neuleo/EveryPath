import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

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
        
        // Setup drawing
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          defaultMode: 'draw_polygon'
        });
        map.current?.addControl(draw.current as any, 'top-right');

        // Setup OSM Source
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
            'line-opacity': 0.6
          }
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      // Add navigation and geolocation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }),
        'bottom-right'
      );

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
              const graphData = await response.json();
              
              const features = graphData.edges.map((edge: any) => {
                const u = graphData.nodes.find((n: any) => n.id === edge.u);
                const v = graphData.nodes.find((n: any) => n.id === edge.v);
                return {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [[u.lon, u.lat], [v.lon, v.lat]]
                  },
                  properties: edge.metadata
                };
              });
              
              const source = map.current?.getSource('osm-edges') as maplibregl.GeoJSONSource;
              source?.setData({ type: 'FeatureCollection', features });
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
