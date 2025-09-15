import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { NotificationsProvider } from './hooks/useNotifications';
import AppRouter from './components/routing/AppRouter';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <NotificationsProvider pollMs={Number(import.meta.env.VITE_NOTIF_POLL_MS) || 120000}>
          <AppRouter />
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
