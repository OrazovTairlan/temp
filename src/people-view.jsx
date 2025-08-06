import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';
import { Iconify } from 'src/components/iconify';
import { fShortenNumber } from 'src/utils/format-number';

// --- Компонент строки пользователя (UserRow) ---
const UserRow = React.forwardRef(({ user }, ref) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  // 1. УЛУЧШЕНИЕ: Состояние загрузки зависит от наличия ключа.
  // Если ключа нет, загрузка не начинается.
  const [isAvatarLoading, setIsAvatarLoading] = useState(!!user.avatar_key);

  useEffect(() => {
    // Если ключа для аватара нет, ничего не делаем.
    if (!user.avatar_key) {
      return;
    }

    let isActive = true; // Флаг для предотвращения обновления состояния на размонтированном компоненте

    const fetchAvatarUrl = async () => {
      try {
        const response = await axiosCopy.get('/file/url', { params: { key: user.avatar_key } });
        if (isActive) {
          setAvatarUrl(response.data);
        }
      } catch (err) {
        console.error(`Не удалось загрузить URL аватара для ключа ${user.avatar_key}:`, err);
        if (isActive) {
          setAvatarUrl(''); // Сбрасываем URL в случае ошибки, чтобы показать fallback
        }
      } finally {
        if (isActive) {
          setIsAvatarLoading(false);
        }
      }
    };

    fetchAvatarUrl();

    // Функция очистки для отмены асинхронной операции
    return () => {
      isActive = false;
    };
  }, [user.avatar_key]);

  const profileLink = `/dashboard/user/${user.login}`;

  return (
    <Card variant="outlined" ref={ref}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
        <Link component={RouterLink} to={profileLink}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'background.neutral' }}>
            {/* 2. УЛУЧШЕНИЕ: Более надежное отображение аватара или fallback-иконки */}
            {isAvatarLoading ? (
              <CircularProgress size={24} />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`Аватар ${user.login}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Iconify icon="solar:user-bold" width={32} />
            )}
          </Avatar>
        </Link>
        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to={profileLink} underline="hover" color="inherit">
            <Typography variant="h6">
              {user.firstname} {user.surname}
            </Typography>
          </Link>
          <Typography variant="body2" color="text.secondary">
            @{user.login}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.bio?.specialization && `${user.bio.specialization} из `}
            {user.bio?.city && `${user.bio.city}, `}
            {user.bio?.country}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>{fShortenNumber(user.followers_count)}</strong> Подписчики
            </Typography>
            <Typography variant="body2">
              <strong>{fShortenNumber(user.followings_count)}</strong> Подписки
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            component={RouterLink}
            to={profileLink}
            startIcon={<Iconify icon="solar:user-id-bold" />}
          >
            Профиль
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
});

// --- Основной компонент страницы "Люди" ---
export const PeoplePage = () => {
  const [users, setUsers] = useState([]);
  // 3. УЛУЧШЕНИЕ: Начальное состояние загрузки - true, для корректного отображения первого лоадера
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAppStore();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const observer = useRef();
  const lastUserElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    if (!hasMore && page > 1) return; // Не делаем запрос, если данных больше нет

    setIsLoading(true);
    setError(null);

    const fetchUsers = async () => {
      try {
        const response = await axiosCopy.get('/users', {
          params: { page, size: PAGE_SIZE },
        });

        const newUsers = response.data;

        if (newUsers.length === 0) {
          setHasMore(false);
        } else {
          setUsers((prevUsers) => {
            const existingUserIds = new Set(prevUsers.map((u) => u.id));
            const uniqueNewUsers = newUsers.filter((u) => !existingUserIds.has(u.id));
            return [...prevUsers, ...uniqueNewUsers];
          });
          // Если API вернуло меньше элементов, чем мы просили, значит это последняя страница
          if (newUsers.length < PAGE_SIZE) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Не удалось загрузить список пользователей.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const usersToRender = users.filter((u) => u.id !== currentUser?.id);

  // 4. УЛУЧШЕНИЕ: Более понятные условия для отображения состояний
  const showInitialLoader = isLoading && users.length === 0;
  const showMoreLoader = isLoading && users.length > 0;
  const showEmptyMessage = !isLoading && users.length === 0 && !error;

  return (
    <DashboardContent>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Люди
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {showEmptyMessage && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ p: 5 }}>
            Пользователи не найдены.
          </Typography>
        )}

        {showInitialLoader && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        )}

        <Stack spacing={2}>
          {usersToRender.map((user, index) => (
            <UserRow
              ref={usersToRender.length === index + 1 ? lastUserElementRef : null}
              key={user.id}
              user={user}
            />
          ))}
        </Stack>

        {showMoreLoader && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !hasMore && users.length > 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 3 }}>
            Вы просмотрели всех пользователей
          </Typography>
        )}
      </Box>
    </DashboardContent>
  );
};
