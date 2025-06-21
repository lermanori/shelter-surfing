import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const NotificationToast = () => {
  const { notifications, clearNotification } = useSocket();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Add new notifications to visible list
    const newNotifications = notifications.filter(
      notification => !visibleNotifications.find(vn => vn.id === notification.id)
    );

    if (newNotifications.length > 0) {
      setVisibleNotifications(prev => [...prev, ...newNotifications]);

      // Auto-remove notifications after 5 seconds
      newNotifications.forEach(notification => {
        setTimeout(() => {
          setVisibleNotifications(prev => 
            prev.filter(vn => vn.id !== notification.id)
          );
          clearNotification(notification.id);
        }, 5000);
      });
    }
  }, [notifications, visibleNotifications, clearNotification]);

  const handleClose = (notificationId) => {
    setVisibleNotifications(prev => 
      prev.filter(vn => vn.id !== notificationId)
    );
    clearNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return '💬';
      case 'connection_request':
        return '👋';
      case 'connection_update':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationColor(notification.type)} text-white px-4 py-3 rounded-xl shadow-large max-w-sm transform transition-all duration-300 ease-in-out animate-slide-down`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-lg">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => handleClose(notification.id)}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-300 p-1 rounded-lg hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast; 