import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import './i18n';
import { SettingsProvider } from './context/SettingsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
