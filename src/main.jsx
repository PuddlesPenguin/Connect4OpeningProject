import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FrontPage from './FrontPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FrontPage/>
  </StrictMode>,
)
