import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from './App'

// Mock global fetch
global.fetch = vi.fn()

test('renders EveryPath heading', () => {
  (fetch as any).mockResolvedValue({
    json: () => Promise.resolve({ status: 'OK' }),
  })

  render(<App />)
  const linkElement = screen.getByText(/EveryPath/i)
  expect(linkElement).toBeInTheDocument()
})

test('displays backend status OK when fetch is successful', async () => {
  (fetch as any).mockResolvedValue({
    json: () => Promise.resolve({ status: 'OK' }),
  })

  render(<App />)
  
  await waitFor(() => {
    expect(screen.getByText(/OK/i)).toBeInTheDocument()
  })
})

test('displays error message when fetch fails', async () => {
  (fetch as any).mockRejectedValue(new Error('Fetch failed'))

  render(<App />)
  
  await waitFor(() => {
    expect(screen.getByText(/Error connecting to backend/i)).toBeInTheDocument()
  })
})
