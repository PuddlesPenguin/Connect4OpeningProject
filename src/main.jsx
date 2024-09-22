import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Connect4 from './Connect4.jsx'
import './index.css'
import './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Connect4 />
  </StrictMode>,
)
