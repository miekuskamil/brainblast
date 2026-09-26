// Entry point: mount the app inside an error boundary, with the update toast
// alongside it (outside the boundary, so a crash can still be fixed by updating).
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { UpdateToast } from './components/UpdateToast.jsx';
import { registerServiceWorker } from './app/pwa.js';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <UpdateToast />
  </>,
);

registerServiceWorker();
