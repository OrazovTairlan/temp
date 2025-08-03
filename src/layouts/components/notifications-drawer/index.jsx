/* eslint-disable */
import { m } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';
import { useAppStore, axiosCopy } from 'src/store/useBoundStore';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { varHover } from 'src/components/animate';

// --- NotificationItem Component ---
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import { fToNow } from 'src/utils/format-time';
import { CONFIG } from 'src/config-global';

const MEDIA_BASE_URL = 'http://localhost:8000/files/'; // Or your S3 base URL

// ----------------------------------------------------------------------

const TABS = [
  { value: 'all', label: 'Все' },
  { value: 'unread', label: 'Непрочитанные' },
];

const WEBSOCKET_URL = 'ws://localhost:8000/ws'; // Replace with your actual WebSocket URL

// --- Custom Hook for Notifications Logic ---
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, size: 20, hasMore: true });

  const { token } = useAppStore();
  // Add new notifications from WebSocket to the top of the list
  const handleNewNotification = (data) => {
    const newNotification = {
      ...data,
      id: `notif-${Date.now()}`, // Generate a unique key for the new item
      isUnRead: true,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL + '?token=' + token);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleNewNotification(data);
    };
    return () => ws.close();
  }, []);

  // Fetch notifications from the API
  const fetchNotifications = useCallback(
    async (active = true) => {
      if (!pagination.hasMore && active) return; // Don't fetch if no more pages
      setIsLoading(true);
      try {
        const response = await axiosCopy.get('/notifications', {
          params: { active, page: pagination.page, size: pagination.size },
        });
        const newNotifications = response.data.map((n) => ({
          ...n.notification,
          sender: n.sender,
          isUnRead: active,
          id: n.notification.id || `id-${Math.random()}`,
        }));

        setNotifications((prev) =>
          pagination.page === 1 ? newNotifications : [...prev, ...newNotifications]
        );
        setPagination((prev) => ({
          ...prev,
          hasMore: newNotifications.length === prev.size,
        }));
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.page, pagination.size, pagination.hasMore]
  );

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axiosCopy.post('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnRead: false })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Mark a single notification as read
  const markOneAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isUnRead: false } : n)));
    try {
      await axiosCopy.post(`/notification/read/${id}`);
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      // Revert optimistic update on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isUnRead: true } : n)));
    }
  };

  return {
    notifications,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    markOneAsRead,
    totalUnRead: notifications.filter((item) => item.isUnRead).length,
  };
};

// ----------------------------------------------------------------------

export function NotificationsDrawer() {
  const { isOpenNotificationMenu, toggleNotificationMenu } = useAppStore();
  const [currentTab, setCurrentTab] = useState('all');
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    markOneAsRead,
    totalUnRead,
  } = useNotifications();

  useEffect(() => {
    if (isOpenNotificationMenu) {
      const isActive = currentTab !== 'unread';
      fetchNotifications(isActive);
    }
  }, [isOpenNotificationMenu, currentTab, fetchNotifications]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Уведомления
      </Typography>
      {!!totalUnRead && (
        <Tooltip title="Отметить все как прочитанные">
          <IconButton color="primary" onClick={markAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}
      <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton>
    </Stack>
  );

  const renderTabs = (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            tab.value === 'unread' ? (
              <Label variant="filled" color="info">
                {totalUnRead}
              </Label>
            ) : null
          }
        />
      ))}
    </CustomTabs>
  );

  const renderList = (
    <Scrollbar>
      {isLoading && notifications.length === 0 ? (
        <Typography sx={{ p: 3, textAlign: 'center' }}>Загрузка...</Typography>
      ) : (
        <Box component="ul">
          {notifications.map((notification) => (
            <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
              <NotificationItem notification={notification} onMarkAsRead={markOneAsRead} />
            </Box>
          ))}
        </Box>
      )}
    </Scrollbar>
  );

  return (
    <Drawer
      open={isOpenNotificationMenu}
      onClose={toggleNotificationMenu}
      anchor="right"
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
    >
      {renderHead}
      {renderTabs}
      {renderList}
      <Box sx={{ p: 1 }}>
        <Button fullWidth size="large">
          Посмотреть все
        </Button>
      </Box>
    </Drawer>
  );
}

function getNotificationContent(notification) {
  const { type, sender } = notification;
  const senderName = sender ? `**${sender.firstname} ${sender.surname}**` : 'System';

  switch (type) {
    case 'GLOBAL':
      return {
        avatar: `${CONFIG.site.basePath}/assets/icons/notification/ic-order.svg`,
        title: `Системное уведомление: ${notification.message || 'Новое обновление!'}`,
      };
    case 'FOLLOWER':
      return {
        avatar: sender?.avatar_key ? `${MEDIA_BASE_URL}${sender.avatar_key}` : null,
        title: `${senderName} подписался на вас.`,
      };
    // Add other cases like 'COMMENT', 'LIKE', etc.
    default:
      return {
        avatar: null,
        title: `Новое уведомление.`,
      };
  }
}

export function NotificationItem({ notification, onMarkAsRead }) {
  const { avatar, title } = getNotificationContent(notification);

  const handleItemClick = () => {
    if (notification.isUnRead) {
      onMarkAsRead(notification.id);
    }
  };

  const renderAvatar = (
    <ListItemAvatar>
      {avatar ? (
        <Avatar src={avatar} sx={{ bgcolor: 'background.neutral' }} />
      ) : (
        <Avatar sx={{ bgcolor: 'primary.main' }}>{notification.sender?.firstname?.[0]}</Avatar>
      )}
    </ListItemAvatar>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={reader(title)}
      secondary={
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {fToNow(notification.created_at)}
        </Typography>
      }
    />
  );

  const renderUnReadBadge = notification.isUnRead && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: '50%',
        bgcolor: 'info.main',
        position: 'absolute',
      }}
    />
  );

  return (
    <ListItemButton
      onClick={handleItemClick}
      disableRipple
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
        ...(notification.isUnRead && { bgcolor: 'action.hover' }),
      }}
    >
      {renderUnReadBadge}
      {renderAvatar}
      <Stack sx={{ flexGrow: 1 }}>{renderText}</Stack>
    </ListItemButton>
  );
}

function reader(data) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: data }}
      sx={{
        mb: 0.5,
        '& p': { typography: 'body2', m: 0 },
        '& a': { color: 'inherit', textDecoration: 'none' },
        '& strong': { typography: 'subtitle2' },
      }}
    />
  );
}
