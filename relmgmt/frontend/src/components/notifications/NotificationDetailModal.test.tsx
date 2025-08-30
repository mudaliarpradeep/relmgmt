import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import NotificationDetailModal from './NotificationDetailModal';
import { EventType, type Notification } from '../../services/api/sharedTypes';

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: overrides.id ?? 1,
  eventType: overrides.eventType ?? EventType.ALLOCATION_CONFLICT,
  message: overrides.message ?? 'Resource Alice is over-allocated',
  isRead: overrides.isRead ?? false,
  createdAt: overrides.createdAt ?? '2025-01-01T00:00:00.000Z',
  entityType: overrides.entityType ?? 'resource',
  entityId: overrides.entityId ?? 10,
});

describe('NotificationDetailModal', () => {
  it('does not render when closed or without notification', () => {
    const { rerender } = render(
      <NotificationDetailModal isOpen={false} notification={null} onClose={() => {}} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<NotificationDetailModal isOpen={true} notification={null} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders details when open', () => {
    const notif = makeNotification();
    render(<NotificationDetailModal isOpen notification={notif} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/notification detail/i)).toBeInTheDocument();
    expect(screen.getByText(notif.eventType)).toBeInTheDocument();
    expect(screen.getByText(notif.message)).toBeInTheDocument();
  });

  it('calls onClose when Close is clicked', () => {
    const notif = makeNotification();
    const onClose = vi.fn();
    render(<NotificationDetailModal isOpen notification={notif} onClose={onClose} />);
    // Click the footer Close button (has visible text "Close")
    fireEvent.click(screen.getAllByRole('button', { name: /close/i })[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('emits mark read and dismiss actions', () => {
    const notif = makeNotification({ id: 5, isRead: false });
    const onMarkRead = vi.fn();
    const onDismiss = vi.fn();
    render(
      <NotificationDetailModal
        isOpen
        notification={notif}
        onClose={() => {}}
        onMarkRead={onMarkRead}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /mark read/i }));
    expect(onMarkRead).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledWith(5);
  });

  it('hides mark read when already read', () => {
    const notif = makeNotification({ isRead: true });
    render(
      <NotificationDetailModal isOpen notification={notif} onClose={() => {}} />
    );
    expect(screen.queryByRole('button', { name: /mark read/i })).not.toBeInTheDocument();
  });
});


