/* eslint-disable */
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { CircularProgress, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { fNumber } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';
import { axiosCopy } from './store/useBoundStore.js';
import { ProfilePostItem } from './sections/user/profile-post-item.jsx';

// ----------------------------------------------------------------------

export function OtherProfileHome() {
  const { id } = useParams(); // Changed to 'id' to match your latest code
  const login = id;

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!login) return;
    setIsLoading(true);
    setError('');
    try {
      const [userResponse, postsResponse] = await Promise.all([
        axiosCopy.get(`/user/${login}`),
        axiosCopy.get(`/user/${login}/posts`),
      ]);

      setProfileUser(userResponse.data);
      setIsFollowing(userResponse.data.is_following);
      setUserPosts(postsResponse.data);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('Не удалось загрузить профиль пользователя.');
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // API call to unfollow
        await axiosCopy.post(`/user/me/unfollow/${login}`);
      } else {
        // API call to follow
        await axiosCopy.post(`/user/me/follow/${login}`);
      }

      // Update state on success
      setProfileUser((prevUser) => ({
        ...prevUser,
        followers_count: isFollowing ? prevUser.followers_count - 1 : prevUser.followers_count + 1,
      }));
      setIsFollowing((prev) => !prev);

    } catch (err) {
      console.error('Failed to toggle follow:', err);
      // Optionally, show an error message to the user
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!profileUser) {
    return <Alert severity="warning" sx={{ m: 3 }}>Профиль не найден.</Alert>;
  }

  const renderFollows = (
    <Card sx={{ py: 3, textAlign: 'center' }}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
        <Stack width={1}>
          <Typography variant="h4">{fNumber(profileUser.followers_count)}</Typography>
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Подписчики
          </Box>
        </Stack>
        <Stack width={1}>
          <Typography variant="h4">{fNumber(profileUser.followings_count)}</Typography>
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Подписки
          </Box>
        </Stack>
      </Stack>
      <Box sx={{ mt: 3, px: 2 }}>
        <LoadingButton
          fullWidth
          variant={isFollowing ? 'outlined' : 'contained'}
          onClick={handleFollowToggle}
          loading={isFollowLoading}
        >
          {isFollowing ? 'Отписаться' : 'Подписаться'}
        </LoadingButton>
      </Box>
    </Card>
  );

  const renderAbout = (
    <Card>
      <CardHeader title="О себе" />
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box sx={{ typography: 'body2' }}>
          {profileUser.bio?.about_me || 'Пользователь еще не добавил информацию о себе.'}
        </Box>
        <Stack direction="row" spacing={2}>
          <Iconify icon="mingcute:location-fill" width={24} />
          <Box sx={{ typography: 'body2' }}>
            {`Живет в `}
            <Link component="span" variant="subtitle2" color="inherit">
              {[profileUser.bio?.city, profileUser.bio?.country].filter(Boolean).join(', ') ||
                'Местоположение не указано'}
            </Link>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ typography: 'body2' }}>
          <Iconify icon="fluent:mail-24-filled" width={24} sx={{ mr: 2 }} />
          {profileUser.email}
        </Stack>
        {profileUser.bio?.position && (
          <Stack direction="row" spacing={2}>
            <Iconify icon="ic:round-business-center" width={24} />
            <Box sx={{ typography: 'body2' }}>
              {profileUser.bio.position}
              {profileUser.bio.work_place && ` в ${profileUser.bio.work_place}`}
            </Box>
          </Stack>
        )}
        {profileUser.bio?.specialization && (
          <Stack direction="row" spacing={2}>
            <Iconify icon="solar:notebook-bold" width={24} />
            <Box sx={{ typography: 'body2' }}>
              {`Специализация: `}
              <Link component="span" variant="subtitle2" color="inherit">
                {profileUser.bio.specialization}
              </Link>
            </Box>
          </Stack>
        )}
      </Stack>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Stack spacing={3}>
          {renderFollows}
          {renderAbout}
        </Stack>
      </Grid>
      <Grid xs={12} md={8}>
        <Stack spacing={3}>
          {userPosts.length > 0 ? (
            userPosts.map((post) => <ProfilePostItem key={post.id} post={post} />)
          ) : (
            <Card>
              <CardHeader title="Нет публикаций" />
              <CardContent>
                <Typography color="text.secondary">
                  Этот пользователь еще ничего не опубликовал.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
