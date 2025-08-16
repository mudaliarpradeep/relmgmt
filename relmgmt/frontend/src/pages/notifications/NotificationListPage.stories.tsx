import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NotificationListPage from './NotificationListPage';
import { NotificationsProvider } from '../../hooks/useNotifications';
import { EventType, type Notification } from '../../types';

const withProviders = (story: React.ReactNode) => (
  <MemoryRouter initialEntries={['/notifications']}>
    <NotificationsProvider pollMs={0}>
      <Routes>
        <Route path="/notifications" element={story as any} />
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

const sample: Notification[] = [
  {
    id: 1,
    eventType: EventType.BLOCKER_ADDED,
    message: 'Blocker added to R25Q1',
    isRead: false,
    createdAt: new Date().toISOString(),
    entityType: 'release',
    entityId: 1,
  },
  {
    id: 2,
    eventType: EventType.OVER_ALLOCATION,
    message: 'Resource Bob over-allocated next week',
    isRead: true,
    createdAt: new Date().toISOString(),
    entityType: 'resource',
    entityId: 2,
  },
];

export const WithData: Story = {
  render: () => (
    <NotificationsProvider disableInitialFetch initialNotifications={sample}>
      <MemoryRouter initialEntries={["/notifications"]}>
        <Routes>
          <Route path="/notifications" element={<NotificationListPage />} />
        </Routes>
      </MemoryRouter>
    </NotificationsProvider>
  ),
};

export const Loading: Story = {
  render: () => (
    <NotificationsProvider disableInitialFetch initialLoading>
      <MemoryRouter initialEntries={["/notifications"]}>
        <Routes>
          <Route path="/notifications" element={<NotificationListPage />} />
        </Routes>
      </MemoryRouter>
    </NotificationsProvider>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <NotificationsProvider disableInitialFetch initialError="Failed to load notifications">
      <MemoryRouter initialEntries={["/notifications"]}>
        <Routes>
          <Route path="/notifications" element={<NotificationListPage />} />
        </Routes>
      </MemoryRouter>
    </NotificationsProvider>
  ),
};

export const Empty: Story = {
  render: () => (
    <NotificationsProvider disableInitialFetch initialNotifications={[]}>
      <MemoryRouter initialEntries={["/notifications"]}>
        <Routes>
          <Route path="/notifications" element={<NotificationListPage />} />
        </Routes>
      </MemoryRouter>
    </NotificationsProvider>
  ),
};


