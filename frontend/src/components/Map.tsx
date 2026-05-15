import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // Sleek dark style
      center: [11.582, 48.135], // Munich
      zoom: 12,
      antialias: true
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    });

    map.current.addControl(draw.current as any, 'top-right');

    map.current.on('load', () => {
      map.current?.addSource('osm-edges', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.current?.addLayer({
        id: 'osm-edges-layer',
        type: 'line',
        source: 'osm-edges',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#00ffcc', // High-visibility neon green
          'line-width': 2,
          'line-opacity': 0.6
        }
      });
    });

    const updatePolygon = async (e: any) => {
      const data = draw.current?.getAll();
      if (data && data.features.length > 0) {
        const feature = data.features[0];
        if (feature.geometry.type === 'Polygon') {
          try {
            const response = await fetch('/api/fetch-osm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ coordinates: feature.geometry.coordinates[0] })
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
            console.error('Error fetching OSM data:', err);
          }
        }
      }
    };

    map.current.on('draw.create', updatePolygon);
    map.current.on('draw.update', updatePolygon);

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};
