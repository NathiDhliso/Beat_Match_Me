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
import { setProductionLogging, setDevelopmentLogging } from './utils/debugLogger'

// Configure logging level based on environment
if (import.meta.env.PROD) {
  setProductionLogging(); // Only warnings and errors in production
} else {
  setDevelopmentLogging(); // Debug logs in development (can be changed to 'warn' for less noise)
}

// StrictMode causes double-rendering in development for detecting side effects
// Disable it to reduce console noise and improve performance during development
const isDevelopment = import.meta.env.DEV;
const enableStrictMode = false; // Set to true to debug side effects

createRoot(document.getElementById('root')!).render(
  enableStrictMode && isDevelopment ? (
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider defaultThemeMode="BeatMatchMe" defaultDarkMode={true}>
          <BackendProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </BackendProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>
  ) : (
    <ErrorBoundary>
      <ThemeProvider defaultThemeMode="BeatMatchMe" defaultDarkMode={true}>
        <BackendProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </BackendProvider>
      </ThemeProvider>
    </ErrorBoundary>
  ),
)
