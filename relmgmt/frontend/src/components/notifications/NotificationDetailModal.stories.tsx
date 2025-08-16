import type { Meta, StoryObj } from '@storybook/react';
import NotificationDetailModal from './NotificationDetailModal';
import { NotificationsProvider } from '../../hooks/useNotifications';
import { EventType, type Notification } from '../../types';

const sample: Notification = {
  id: 1,
  eventType: EventType.ALLOCATION_CONFLICT,
  message: 'Resource Alice is over-allocated in week 2025-01-06',
  isRead: false,
  createdAt: new Date().toISOString(),
  entityType: 'resource',
  entityId: 1,
};

const meta: Meta<typeof NotificationDetailModal> = {
  title: 'Notifications/NotificationDetailModal',
  component: NotificationDetailModal,
};

export default meta;
type Story = StoryObj<typeof NotificationDetailModal>;

export const Default: Story = {
  render: () => (
    <NotificationsProvider disableInitialFetch initialNotifications={[sample]}>
      <NotificationDetailModal isOpen notification={sample} onClose={() => {}} />
    </NotificationsProvider>
  ),
};


