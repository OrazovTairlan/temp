import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import { CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useTabs } from 'src/hooks/use-tabs';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAppStore, axiosCopy } from '../../../store/useBoundStore.js';

import { ProfileHome } from '../profile-home';
import { ProfileCover } from '../profile-cover';
import { ProfileFollowers } from '../profile-followers';
// import { ProfileFriends } from '../profile-friends'; // Assuming this will be implemented later

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

// ----------------------------------------------------------------------

export function UserProfileView() {
  const { user } = useAppStore();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  const tabs = useTabs('profile');

  // Fetch the full avatar URL when the component loads or user data changes
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (user?.avatar_key) {
        setIsLoadingAvatar(true);
        try {
          const response = await axiosCopy.get('/file/url', {
            params: { key: user.avatar_key },
          });
          setAvatarUrl(response.data);
        } catch (error) {
          console.error('Failed to fetch avatar URL:', error);
          // Keep the default or show a placeholder
        } finally {
          setIsLoadingAvatar(false);
        }
      } else {
        // Reset if user has no avatar key
        setAvatarUrl('');
      }
    };

    fetchAvatarUrl();
  }, [user]);

  if (!user) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  const userName = [user.firstname, user.secondname, user.surname].filter(Boolean).join(' ');

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Профиль"
        links={[
          { name: 'Пользователь', href: paths.dashboard.user.root },
          { name: userName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={user.role}
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

      {tabs.value === 'profile' && <ProfileHome />}

      {tabs.value === 'followers' && <ProfileFollowers />}

      {/* {tabs.value === 'friends' && <ProfileFriends />} */}

    </DashboardContent>
  );
}
