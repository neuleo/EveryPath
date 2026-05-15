import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from './App'

// Mock global fetch
global.fetch = vi.fn()

// Mock maplibre-gl
vi.mock('maplibre-gl', () => {
  const MapMock = vi.fn(function (this: any) {
    this.on = vi.fn();
    this.remove = vi.fn();
    this.addControl = vi.fn();
  });
  const NavigationControlMock = vi.fn();
  return {
    default: {
      Map: MapMock,
      NavigationControl: NavigationControlMock,
    },
    Map: MapMock,
    NavigationControl: NavigationControlMock,
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
  (fetch as any).mockResolvedValue({
    json: () => Promise.resolve({ status: 'OK' }),
  })

  render(<App />)
  const heading = screen.getByText(/EveryPath/i)
  expect(heading).toBeInTheDocument()
})

test('displays backend status OK when fetch is successful', async () => {
  (fetch as any).mockResolvedValue({
    json: () => Promise.resolve({ status: 'OK' }),
  })

  render(<App />)
  
  await waitFor(() => {
    expect(screen.getByText(/API: OK/i)).toBeInTheDocument()
  })
})

test('displays error message when fetch fails', async () => {
  (fetch as any).mockRejectedValue(new Error('Fetch failed'))

  render(<App />)
  
  await waitFor(() => {
    expect(screen.getByText(/API: Error/i)).toBeInTheDocument()
  })
})
