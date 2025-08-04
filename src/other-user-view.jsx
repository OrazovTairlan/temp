import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import { CircularProgress, Alert } from '@mui/material';

// routes
import { paths } from 'src/routes/paths';

// hooks
import { useTabs } from 'src/hooks/use-tabs';

// components
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// sections
import { ProfileCover } from './sections/user/profile-cover';
import { OtherProfileHome } from './other-profile-home';
import { OtherProfileFollowers } from './other-profile-followers';

// api
import { axiosCopy } from './store/useBoundStore';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'Профиль', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'followers', label: 'Подписчики', icon: <Iconify icon="solar:heart-bold" width={24} /> },
];

export function OtherUserProfileView() {
  const { id } = useParams();
  const tabs = useTabs('profile');

  // Centralized state for better management
  const [state, setState] = useState({
    profile: null,
    isLoading: true,
    error: null,
  });

  const fetchProfile = useCallback(async () => {
    if (!id) return;

    // Keep displaying old data while refetching
    setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

    try {
      // Step 1: Fetch the main user profile data
      const profileResponse = await axiosCopy.get(`/user/${id}`);
      const profileData = profileResponse.data;

      let avatarUrl = '';
      // Step 2: If an avatar_key exists, fetch the corresponding URL
      if (profileData.avatar_key) {
        const urlResponse = await axiosCopy.get(`/file/url`, {
          params: { key: profileData.avatar_key },
        });
        // Assuming the response for the URL is { "url": "http://..." }
        avatarUrl = urlResponse.data;
      }

      // Step 3: Set the complete profile state with the resolved avatar URL
      setState({
        profile: { ...profileData, avatarUrl }, // Add avatarUrl to the profile object
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setState({
        profile: null,
        isLoading: false,
        error: 'Не удалось загрузить данные пользователя.',
      });
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Memoize derived data to prevent recalculation on every render
  const userName = useMemo(() => {
    if (!state.profile) return '';
    return [state.profile.firstname, state.profile.secondname, state.profile.surname]
      .filter(Boolean)
      .join(' ');
  }, [state.profile]);

  // Render loading state
  if (state.isLoading) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}
        >
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ m: 3 }}>
          {state.error}
        </Alert>
      </DashboardContent>
    );
  }

  // Render "not found" state
  if (!state.profile) {
    return (
      <DashboardContent>
        <Alert severity="warning" sx={{ m: 3 }}>
          Пользователь не найден.
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Профиль"
        links={[{ name: 'Пользователи', href: paths.dashboard.user.root }, { name: userName }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={state.profile.role}
          isVerified={state.profile.is_verified}
          name={userName}
          avatarUrl={state.profile.avatarUrl}
          coverUrl="https://files.anextour.kz/Content/uploads/elfinder/ANEXKZ/news-new/kazakhstan/Depositphotos_54567813_XL.jpg"
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

      {tabs.value === 'profile' && <OtherProfileHome onVerify={fetchProfile} />}

      {tabs.value === 'followers' && <OtherProfileFollowers />}
    </DashboardContent>
  );
}
