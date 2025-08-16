import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { NotificationsProvider } from './hooks/useNotifications';
import AppRouter from './components/routing/AppRouter';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider pollMs={Number(import.meta.env.VITE_NOTIF_POLL_MS) || 30000}>
          <AppRouter />
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
