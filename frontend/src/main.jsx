import React from 'react'
import ReactDOM, { hydrateRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import './index.css'

const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
)

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
