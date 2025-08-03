import React, { useState, useEffect, useCallback } from 'react';
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
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';

import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';
import { Iconify } from 'src/components/iconify';
import { fShortenNumber } from 'src/utils/format-number';

const MEDIA_BASE_URL = 'http://localhost:8000/files/';

// --- UserRow Component ---
const UserRow = ({ user, onFollowToggle, isUpdating }) => {
  const handleFollow = () => {
    onFollowToggle(user.id, !user.is_following);
  };

  const profileLink = '/dashboard/user/' + user.login;

  return (
    <Card variant="outlined">
      <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
        <Link component={RouterLink} to={profileLink}>
          <Avatar
            src={user.avatar_key ? `${MEDIA_BASE_URL}${user.avatar_key}` : ''}
            sx={{ width: 64, height: 64 }}
          />
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
            {user.bio?.specialization} from {user.bio?.city}, {user.bio?.country}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>{fShortenNumber(user.followers_count)}</strong> Followers
            </Typography>
            <Typography variant="body2">
              <strong>{fShortenNumber(user.followings_count)}</strong> Following
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={1} sx={{ minWidth: 140 }}>
          <Button
            fullWidth
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
};

// --- Main People Page Component ---
export const PeoplePage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingFollowId, setUpdatingFollowId] = useState(null); // To show loading on specific button
  const { user: currentUser } = useAppStore();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosCopy.get('/users', {
        params: { page: 1, size: 50 },
      });
      const filteredUsers = response.data.filter((user) => user.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Не удалось загрузить список пользователей.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFollowToggle = useCallback(
    async (userId, shouldFollow) => {
      setUpdatingFollowId(userId);

      const originalUsers = [...users];

      // Optimistic UI update
      setUsers((currentUsers) =>
        currentUsers.map((u) => (u.id === userId ? { ...u, is_following: shouldFollow } : u))
      );

      try {
        await axiosCopy.post(`/users/${userId}/follow`);
      } catch (err) {
        console.error('Failed to update follow status:', err);
        // Revert UI on error
        setUsers(originalUsers);
      } finally {
        setUpdatingFollowId(null);
      }
    },
    [users]
  );

  return (
    <DashboardContent>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Люди
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={2}>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onFollowToggle={handleFollowToggle}
                isUpdating={updatingFollowId === user.id}
              />
            ))}
          </Stack>
        )}
      </Box>
    </DashboardContent>
  );
};
