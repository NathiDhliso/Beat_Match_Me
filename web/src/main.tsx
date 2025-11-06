import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './config/amplify' // Initialize Amplify
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BackendProvider } from './context/BackendContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultThemeMode="beatbyme" defaultDarkMode={true}>
        <BackendProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </BackendProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
