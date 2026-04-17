import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'

export default function PrerenderApp({ url }) {
  return (
    <MemoryRouter initialEntries={[url]}>
      <AppRoutes />
    </MemoryRouter>
  )
}
