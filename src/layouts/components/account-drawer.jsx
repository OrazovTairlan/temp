import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  Drawer,
  Typography,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateAvatar } from 'src/components/animate';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';
import { axiosCopy, useAppStore } from '../../store/useBoundStore.js';

// ----------------------------------------------------------------------

export function AccountDrawer({ sx, ...other }) {
  const theme = useTheme();
  const { user } = useAppStore();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState('');

  const displayName = user ? `${user.firstname} ${user.surname}`.trim() : '';

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (user?.avatar_key) {
        try {
          const response = await axiosCopy.get(`/file/url`, { params: { key: user.avatar_key } });
          if (response.data) {
            setPhotoURL(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch avatar URL:', error);
        }
      }
    };

    fetchAvatarUrl();
  }, [user?.avatar_key]);

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const renderAvatar = (
    <AnimateAvatar
      width={96}
      slotProps={{
        avatar: { src: photoURL, alt: displayName },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(
            theme.vars.palette.primary.mainChannel,
            0
          )} 25%, ${theme.vars.palette.primary.main} 100%)`,
        },
      }}
    >
      {displayName.charAt(0).toUpperCase()}
    </AnimateAvatar>
  );

  return (
    <>
      <AccountButton
        open={open}
        onClick={handleOpenDrawer}
        photoURL={photoURL}
        displayName={displayName}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
      >
        <IconButton
          onClick={handleCloseDrawer}
          sx={{ top: 12, left: 12, zIndex: 9, position: 'absolute' }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Stack alignItems="center" sx={{ p: 3 }}>
            {renderAvatar}
            <Typography variant="h6" noWrap sx={{ mt: 2 }}>
              {displayName}
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
              @{user?.login}
            </Typography>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:letter-bold" width={24} sx={{ color: 'text.secondary' }} />
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">{user?.email}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:shield-user-bold" width={24} sx={{ color: 'text.secondary' }} />
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Роль
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={handleCloseDrawer} />
        </Box>
      </Drawer>
    </>
  );
}
