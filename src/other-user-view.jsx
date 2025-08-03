/* eslint-disable */
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import { CircularProgress, Alert } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useTabs } from 'src/hooks/use-tabs';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { axiosCopy } from './store/useBoundStore.js';
import { ProfileCover } from './sections/user/profile-cover.jsx';
import { OtherProfileHome } from './other-profile-home.jsx';
import { OtherProfileFollowers } from './other-profile-followers.jsx';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'Профиль', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'followers', label: 'Подписчики', icon: <Iconify icon="solar:heart-bold" width={24} /> },
  {
    value: 'friends',
    label: 'Друзья',
    icon: <Iconify icon="solar:users-group-rounded-bold" width={24} />,
  },
];

const MEDIA_BASE_URL = 'http://localhost:8000/files/';

// ----------------------------------------------------------------------

export function OtherUserProfileView() {
  const { id } = useParams();
  const login = id;

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const tabs = useTabs('profile');

  const fetchUserData = useCallback(async () => {
    if (!login) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await axiosCopy.get(`/user/${login}`);
      setProfileUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Не удалось загрузить данные пользователя.');
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
      </DashboardContent>
    );
  }

  if (!profileUser) {
    return (
      <DashboardContent>
        <Alert severity="warning" sx={{ m: 3 }}>Пользователь не найден.</Alert>
      </DashboardContent>
    );
  }

  const userName = [profileUser.firstname, profileUser.secondname, profileUser.surname].filter(Boolean).join(' ');
  const avatarUrl = profileUser.avatar_key ? `${MEDIA_BASE_URL}${profileUser.avatar_key}` : '';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Профиль"
        links={[
          { name: 'Пользователи', href: paths.dashboard.user.root },
          { name: userName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={profileUser.role}
          name={userName}
          avatarUrl={avatarUrl}
          coverUrl={
            'https://files.anextour.kz/Content/uploads/elfinder/ANEXKZ/news-new/kazakhstan/Depositphotos_54567813_XL.jpg'
          }
        />

        <Box
          display="flex"
          justifyContent={{ xs: 'center', md: 'flex-end' }}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            px: { md: 3 },
            position: 'absolute',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs value={tabs.value} onChange={tabs.onChange}>
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </Card>

      {tabs.value === 'profile' && <OtherProfileHome />}

      {tabs.value === 'followers' && <OtherProfileFollowers />}

    </DashboardContent>
  );
}
