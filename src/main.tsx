import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { RigPage } from './pages/RigPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {/* Secret rig page — not linked anywhere in the UI */}
        <Route path="/heiheinoonewillknowthisisriggedheihei" element={<RigPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
