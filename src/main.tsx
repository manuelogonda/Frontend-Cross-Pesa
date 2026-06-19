import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents automatic network refetching when switching browser tabs
      refetchOnWindowFocus: false, 
      // Retries failed queries exactly once before broadcasting an explicit failure message
      retry: 1, 
      // Data remains marked as "fresh" in client memory for 5 minutes
      staleTime: 5 * 60 * 1000, 
    },
  },
});

// 2. Mount the centralized engine tree directly into the index.html DOM root element
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
