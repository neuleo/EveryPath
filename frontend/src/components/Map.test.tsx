import { render } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { Map } from './Map'

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

test('Map component renders without crashing', () => {
  const { container } = render(<Map />)
  expect(container.firstChild).toBeInTheDocument()
})
