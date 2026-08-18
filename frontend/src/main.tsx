import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

// Register PWA Service Worker for offline support & auto-updates
registerSW({
  onNeedRefresh() {
    console.log("New Sāgaramati Web app update available.");
  },
  onOfflineReady() {
    console.log("Sāgaramati Web app ready for offline usage.");
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
