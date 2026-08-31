import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { LiveReconProvider } from './context/LiveReconContext';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LiveReconProvider>
          <App />
        </LiveReconProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
