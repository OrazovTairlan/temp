/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import { useParams } from 'src/routes/hooks';

import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy } from 'src/store/useBoundStore';
import { translation } from './translation.js'; // Make sure path is correct

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
const InfoItem = ({ label, value, notSpecifiedText }) => (
  <Box>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value || notSpecifiedText}</Typography>
  </Box>
);

// --- Main User Profile Page Component ---
export const UserProfilePage = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();

  // Memoize translation object to prevent re-renders
  const t = useMemo(() => translation[i18n.language], [i18n.language]);

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const idToFetch = id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!idToFetch) {
        setError(t.userNotFound);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const [userRes, bioRes] = await Promise.all([
          axiosCopy.get(`/user/me`),
          axiosCopy.get(`/user/bio/${idToFetch}`),
        ]);

        const mergedData = {
          ...userRes.data,
          bio: { ...userRes.data.bio, ...bioRes.data },
        };

        setProfileData(mergedData);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError(t.profileLoadingError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [idToFetch, t]);

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
        <Typography sx={{ textAlign: 'center', mt: 5 }}>{t.profileNotFound}</Typography>
      </DashboardContent>
    );
  }

  const { login, firstname, surname, avatar_key, followers_count, followings_count, bio } =
    profileData;

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
                    <b>{followers_count}</b> {t.followers}
                  </Typography>
                  <Typography variant="body2">
                    <b>{followings_count}</b> {t.following}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="h6">{t.biographyAndCareer}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InfoItem label={t.aboutMe} value={bio.about_me} notSpecifiedText={t.notSpecified} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.position} value={bio.position} notSpecifiedText={t.notSpecified} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  label={t.specialization}
                  value={bio.specialization}
                  notSpecifiedText={t.notSpecified}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  label={t.workPlace}
                  value={bio.work_place}
                  notSpecifiedText={t.notSpecified}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.country} value={bio.country} notSpecifiedText={t.notSpecified} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.city} value={bio.city} notSpecifiedText={t.notSpecified} />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">{t.interestingAndOpinions}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.hobby} value={bio.hobby} notSpecifiedText={t.notSpecified} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.films} value={bio.movies} notSpecifiedText={t.notSpecified} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.music} value={bio.musics} notSpecifiedText={t.notSpecified} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  label={t.worldvide}
                  value={bio.worldview}
                  notSpecifiedText={t.notSpecified}
                />
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Box>
    </DashboardContent>
  );
};
