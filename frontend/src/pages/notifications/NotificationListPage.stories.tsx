import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NotificationListPage from './NotificationListPage';
import { NotificationsProvider } from '../../hooks/useNotifications';

const withProviders = (story: React.ReactNode) => (
  <MemoryRouter initialEntries={['/notifications']}>
    <NotificationsProvider pollMs={0}>
      <Routes>
        <Route path="/notifications" element={story as React.ReactElement} />
      </Routes>
    </NotificationsProvider>
  </MemoryRouter>
);

const meta: Meta<typeof NotificationListPage> = {
  title: 'Notifications/NotificationListPage',
  component: NotificationListPage,
  decorators: [(Story) => withProviders(<Story />)],
};

export default meta;
type Story = StoryObj<typeof NotificationListPage>;

export const Default: Story = {
  render: () => <NotificationListPage />,
};


