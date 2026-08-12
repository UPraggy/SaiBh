import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './pwa.js'; // registra o service worker e captura o "instalar" (PWA)

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
