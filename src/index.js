import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingOverlay } from './components/LoadingSkeleton';
import { ThemeProvider } from './contexts/ThemeContext';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Lazy load App pour code splitting
const App = lazy(() => import('./App'));

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingOverlay />}>
            <App />
          </Suspense>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Enregistrer le service worker pour PWA (uniquement en production)
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      if (window.confirm('Une nouvelle version est disponible. Voulez-vous recharger la page ?')) {
        window.location.reload();
      }
    },
    onSuccess: (registration) => {
      console.log('Service Worker registered successfully');
    }
  });
} else {
  // En développement, désactiver le service worker pour éviter les problèmes de cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister().then(() => {
        console.log('Service Worker unregistered in development mode');
      });
    });
  }
}
