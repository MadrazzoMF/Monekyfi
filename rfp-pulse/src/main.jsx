import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { AppProvider } from './state/AppContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { lerTema, aplicarTema } from './lib/tema.js';
import './index.css';

aplicarTema(lerTema());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppProvider>
  </StrictMode>,
);
