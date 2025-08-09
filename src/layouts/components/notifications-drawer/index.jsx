/* eslint-disable */
import { m } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';

import { useAppStore, axiosCopy } from 'src/store/useBoundStore';
import { fToNow } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CONFIG } from 'src/config-global';
import { translation } from 'src/translation.js';

const WEBSOCKET_URL = 'wss://newinterlinked.com/api/ws';

// --- Custom Hook for Notifications Logic (No changes here) ---
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, size: 20, hasMore: true });
  const { token } = useAppStore();

  const handleNewNotification = (data) => {
    const newNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      isUnRead: true,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleNewNotification(data);
    };
    return () => {
      ws.close();
    };
  }, [token]);

  const fetchNotifications = useCallback(
    async (active = true) => {
      if (!pagination.hasMore && active) return;
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

  const markAllAsRead = async () => {
    try {
      await axiosCopy.post('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnRead: false })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markOneAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isUnRead: false } : n)));
    try {
      await axiosCopy.post(`/notification/read/${id}`);
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
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
  const { i18n } = useTranslation();
  const TABS = [
    { value: 'all', label: translation[i18n.language].notifications.all },
    { value: 'unread', label: translation[i18n.language].notifications.unread },
  ];

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
        {translation[i18n.language].notifications.title}
      </Typography>
      {!!totalUnRead && (
        <Tooltip title={translation[i18n.language].notifications.markAllAsRead}>
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
            tab.value === 'unread' && totalUnRead > 0 ? (
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
        <Typography sx={{ p: 3, textAlign: 'center' }}>
          {translation[i18n.language].notifications.loading}
        </Typography>
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
          {translation[i18n.language].notifications.viewAll}
        </Button>
      </Box>
    </Drawer>
  );
}

// ----------------------------------------------------------------------
// ❗️❗️❗️ **MAJOR CHANGE HERE** ❗️❗️❗️
// The logic from `getNotificationContent` is now inside `NotificationItem`
// to properly handle asynchronous avatar URL fetching.
// ----------------------------------------------------------------------

export function NotificationItem({ notification, onMarkAsRead }) {
  const { i18n } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState('');

  // **FIX:** Fetch the avatar URL using the key from the API
  useEffect(() => {
    const fetchAvatar = async () => {
      // We only fetch if the notification is from a user and has an avatar key.
      if (notification.type === 'FOLLOWER' && notification.sender?.avatar_key) {
        try {
          const response = await axiosCopy.get('/file/url', {
            params: { key: notification.sender.avatar_key },
          });
          setAvatarUrl(response.data);
        } catch (error) {
          console.error('Failed to fetch notification avatar URL:', error);
          setAvatarUrl(''); // Reset on error
        }
      }
    };
    fetchAvatar();
  }, [notification.sender?.avatar_key, notification.type]);

  // Derive title and avatar type based on notification content
  const details = useMemo(() => {
    const translations = translation[i18n.language].notifications;
    const { type, sender, message } = notification;
    const senderName = sender ? `${sender.firstname} ${sender.surname}` : translations.system;

    switch (type) {
      case 'GLOBAL':
        return {
          title: translations.globalNotification.replace('{message}', message || translations.defaultGlobalMessage),
          avatar: <Avatar src={`${CONFIG.site.basePath}/assets/icons/notification/ic-order.svg`} sx={{ bgcolor: 'background.neutral' }} />
        };
      case 'FOLLOWER':
        return {
          title: translations.newFollower.replace('{senderName}', senderName),
          avatar: avatarUrl ? (
            <Avatar src={avatarUrl} sx={{ bgcolor: 'background.neutral' }} />
          ) : (
            <Avatar sx={{ bgcolor: 'primary.main' }}>{sender?.firstname?.[0]}</Avatar>
          )
        };
      default:
        return {
          title: translations.defaultNotification,
          avatar: <Avatar sx={{ bgcolor: 'info.main' }}>?</Avatar>
        };
    }
  }, [notification, i18n.language, avatarUrl]);

  const handleItemClick = () => {
    if (notification.isUnRead) {
      onMarkAsRead(notification.id);
    }
  };

  const renderText = (
    <ListItemText
      disableTypography
      primary={reader(details.title)}
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
      <ListItemAvatar>{details.avatar}</ListItemAvatar>
      <Stack sx={{ flexGrow: 1 }}>{renderText}</Stack>
    </ListItemButton>
  );
}

// Helper to render HTML content safely
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
