/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import { useParams } from 'src/routes/hooks'; // Assuming you get the user ID/login from the URL

import { DashboardContent } from './layouts/dashboard/index.js'; // Adjust path if needed
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';
import { Iconify } from 'src/components/iconify';

// --- Reusable Component for fetching and displaying Avatars ---
const DynamicAvatar = ({ avatarKey, alt, sx }) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (avatarKey) {
        setIsLoading(true);
        try {
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Avatar src={avatarUrl} alt={alt} sx={sx}>
      {alt ? alt.charAt(0) : ''}
    </Avatar>
  );
};

// --- Helper component to display a piece of info ---
const InfoItem = ({ label, value }) => (
  <Box>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value || 'Не указано'}</Typography>
  </Box>
);

// --- Main User Profile Page Component ---
export const UserProfilePage = () => {
  // If viewing another user's profile, get their ID from the URL.
  // If viewing your own, you might get it from the global store.
  const { id } = useParams(); // Example: /user/:userId

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const idToFetch = id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!idToFetch) {
        setError('User not found.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        // Perform API calls in parallel for efficiency
        const [userRes, bioRes] = await Promise.all([
          axiosCopy.get(`/user/me`), // Assuming this fetches the user by id if passed, or 'me' for current user
          axiosCopy.get(`/user/bio/${idToFetch}`),
        ]);

        // Merge the data from both responses
        const mergedData = {
          ...userRes.data, // Base user data
          bio: { ...userRes.data.bio, ...bioRes.data }, // Merge bio, with specific bio endpoint taking precedence
        };

        setProfileData(mergedData);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('Could not load profile information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [idToFetch]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
        >
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ m: 3 }}>
          {error}
        </Alert>
      </DashboardContent>
    );
  }

  if (!profileData) {
    return (
      <DashboardContent>
        <Typography sx={{ textAlign: 'center', mt: 5 }}>User profile not found.</Typography>
      </DashboardContent>
    );
  }

  const {
    login,
    firstname,
    surname,
    secondname,
    avatar_key,
    followers_count,
    followings_count,
    bio,
  } = profileData;

  const fullName = `${firstname || ''} ${surname || ''}`.trim();

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 960, mx: 'auto', py: 3 }}>
        <Card>
          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <DynamicAvatar
                avatarKey={avatar_key}
                alt={fullName}
                sx={{ width: 120, height: 120, fontSize: '3rem' }}
              />
              <Stack spacing={1}>
                <Typography variant="h4">{fullName}</Typography>
                <Typography variant="body1" color="text.secondary">
                  @{login}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <Typography variant="body2">
                    <b>{followers_count}</b> Подписчиков
                  </Typography>
                  <Typography variant="body2">
                    <b>{followings_count}</b> Подписан на
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="h6">Биография</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InfoItem label="О себе" value={bio.about_me} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Должность" value={bio.position} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Специализация" value={bio.specialization} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Место работы" value={bio.work_place} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Страна" value={bio.country} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Город" value={bio.city} />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">Интересы</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Хобби" value={bio.hobby} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Любимые фильмы" value={bio.movies} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Любимая музыка" value={bio.musics} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Мировоззрение" value={bio.worldview} />
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Box>
    </DashboardContent>
  );
};
