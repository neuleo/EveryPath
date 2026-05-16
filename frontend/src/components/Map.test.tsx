import { render } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { Map } from './Map'

// Mock maplibre-gl
vi.mock('maplibre-gl', () => {
  const MapMock = vi.fn(function (this: any) {
    this.on = vi.fn();
    this.off = vi.fn();
    this.remove = vi.fn();
    this.addControl = vi.fn();
    this.getSource = vi.fn();
  });
  const NavigationControlMock = vi.fn();
  const GeolocateControlMock = vi.fn();
  const MarkerMock = vi.fn(function (this: any) {
    this.setLngLat = vi.fn().mockReturnThis();
    this.addTo = vi.fn().mockReturnThis();
    this.remove = vi.fn();
  });
  
  return {
    default: {
      Map: MapMock,
      NavigationControl: NavigationControlMock,
      GeolocateControl: GeolocateControlMock,
      Marker: MarkerMock,
    },
    Map: MapMock,
    NavigationControl: NavigationControlMock,
    GeolocateControl: GeolocateControlMock,
    Marker: MarkerMock,
  };
})

// Mock @mapbox/mapbox-gl-draw
vi.mock('@mapbox/mapbox-gl-draw', () => {
  return {
    default: vi.fn(function (this: any) {
      this.onAdd = vi.fn();
      this.onRemove = vi.fn();
    }),
  };
})

test('Map component renders without crashing', () => {
  const dummyProps = {
    includeDeadEnds: true,
    onGraphFetched: vi.fn(),
    onRouteGenerated: vi.fn()
  };
  const { container } = render(<Map {...dummyProps} />)
  expect(container.firstChild).toBeInTheDocument()
})
