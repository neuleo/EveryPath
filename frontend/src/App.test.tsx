import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import App from './App'

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

test('renders EveryPath heading', () => {
  vi.stubGlobal('fetch', vi.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve({ status: 'OK' }),
    })
  ) as any)

  render(<App />)
  const heading = screen.getByText(/EveryPath/i)
  expect(heading).toBeInTheDocument()
})

test('displays backend status OK when fetch is successful', async () => {
  const fetchMock = vi.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve({ status: 'OK' }),
    })
  )
  vi.stubGlobal('fetch', fetchMock as any)

  render(<App />)
  
  await waitFor(() => {
    expect(screen.getByText(/API: OK/i)).toBeInTheDocument()
  })
  expect(fetchMock).toHaveBeenCalledWith('/api/health')
})

test('displays error message when fetch fails', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Fetch failed'))) as any)

  render(<App />)
  
  await waitFor(() => {
    expect(screen.getByText(/API: Error/i)).toBeInTheDocument()
  })
})
