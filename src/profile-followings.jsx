/* eslint-disable */
import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { CircularProgress, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { Iconify } from 'src/components/iconify';
import { axiosCopy } from 'src/store/useBoundStore';

// ----------------------------------------------------------------------

// --- Reusable Component for fetching and displaying Avatars ---
const DynamicAvatar = ({ avatarKey, alt, sx }) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (avatarKey) {
        setIsLoading(true);
        try {
          // Fetches the avatar URL from the provided key
          const response = await axiosCopy.get('/file/url', { params: { key: avatarKey } });
          setAvatarUrl(response.data);
        } catch (error) {
          console.error('Failed to fetch avatar URL:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAvatarUrl('');
      }
    };
    fetchAvatarUrl();
  }, [avatarKey]);

  return (
    <Avatar src={avatarUrl} alt={alt} sx={sx}>
      {isLoading ? <CircularProgress size={20} /> : alt?.charAt(0)}
    </Avatar>
  );
};

// --- Item Component for a single user being followed ---
function FollowingItem({ user, onFollowToggle, isUpdating }) {
  const { firstname, surname, bio, avatar_key, is_following, login, id } = user;
  const name = `${firstname} ${surname}`;

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <DynamicAvatar avatarKey={avatar_key} alt={name} sx={{ width: 48, height: 48, mr: 2 }} />

      <ListItemText
        primary={name}
        secondary={
          <>
            <Iconify icon="mingcute:location-fill" width={16} sx={{ flexShrink: 0, mr: 0.5 }} />
            {bio?.country || 'Местоположение не указано'}
          </>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{
          mt: 0.5,
          noWrap: true,
          display: 'flex',
          component: 'span',
          alignItems: 'center',
          typography: 'caption',
          color: 'text.disabled',
        }}
      />

      <LoadingButton
        size="small"
        variant={is_following ? 'text' : 'outlined'}
        color={is_following ? 'success' : 'inherit'}
        startIcon={
          is_following ? <Iconify width={18} icon="eva:checkmark-fill" sx={{ mr: -0.75 }} /> : null
        }
        onClick={() => onFollowToggle(login, is_following)}
        loading={isUpdating}
        sx={{ flexShrink: 0, ml: 1.5 }}
      >
        {is_following ? 'Вы подписаны' : 'Подписаться'}
      </LoadingButton>
    </Card>
  );
}

// --- Main Component to display all users you are following ---
export function ProfileFollowings() {
  const [followings, setFollowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchFollowings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch the list of users you are following
      const response = await axiosCopy.get('/user/me/following');
      setFollowings(response.data);
    } catch (err) {
      console.error('Failed to fetch followings:', err);
      setError('Не удалось загрузить ваши подписки.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowings();
  }, [fetchFollowings]);

  const handleFollowToggle = useCallback(async (login, isCurrentlyFollowing) => {
    setUpdatingId(login);

    // Optimistically update the UI for a responsive feel
    setFollowings(currentFollowings =>
      currentFollowings.map(f =>
        f.login === login ? { ...f, is_following: !isCurrentlyFollowing } : f
      )
    );

    try {
      if (isCurrentlyFollowing) {
        // Use DELETE to unfollow, as requested
        await axiosCopy.post(`/user/me/unfollow/${login}`);
      } else {
        // Use POST to follow back
        await axiosCopy.post(`/user/me/follow/${login}`);
      }
    } catch (err) {
      console.error('Failed to update follow status:', err);
      // Revert the UI change if the API call fails
      setFollowings(currentFollowings =>
        currentFollowings.map(f =>
          f.login === login ? { ...f, is_following: isCurrentlyFollowing } : f
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return (
    <>
      <Typography variant="h4" sx={{ my: 5 }}>
        Подписки
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box
          gap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
        >
          {followings.map((user) => (
            <FollowingItem
              key={user.id}
              user={user}
              onFollowToggle={handleFollowToggle}
              isUpdating={updatingId === user.login}
            />
          ))}
        </Box>
      )}
    </>
  );
}
