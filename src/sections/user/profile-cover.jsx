import React from 'react';

// MUI Core Components
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Custom theme styles (assumed to exist)
import { varAlpha, bgGradient } from 'src/theme/styles';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

import { translation } from 'src/translation.js';

// ----------------------------------------------------------------------

/**
 * A responsive profile cover component with avatar, name, role, and verification status.
 *
 * @param {object} props - The component props.
 * @param {string} props.name - The user's name.
 * @param {boolean} props.isVerified - Whether the user is verified.
 * @param {string} props.avatarUrl - URL for the user's avatar image.
 * @param {string} props.role - The user's role or subtitle.
 * @param {string} props.coverUrl - URL for the cover background image.
 */
export function ProfileCover({ name, isVerified, avatarUrl, role, coverUrl }) {
  const theme = useTheme();
  const { i18n } = useTranslation();

  return (
    <Box
      sx={{
        height: 1,
        color: 'common.white',
        backgroundColor: '#68CDFF !important',
        ...bgGradient({
          color: `0deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.8)}, ${varAlpha(
            theme.vars.palette.primary.darkerChannel,
            0.8
          )}`,
          // imgUrl: coverUrl,
        }),
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          left: { md: 24 },
          bottom: { md: 24 },
          zIndex: { md: 10 },
          pt: { xs: 6, md: 0 },
          position: { md: 'absolute' },
          width: '100%', // Ensure stack takes full width for alignment
        }}
      >
        <Avatar
          alt={name}
          src={avatarUrl}
          sx={{
            mx: 'auto',
            width: { xs: 64, md: 128 },
            height: { xs: 64, md: 128 },
            border: `solid 2px ${theme.vars.palette.common.white}`,
          }}
        >
          {/* Fallback for avatar if no image is provided */}
          {name?.charAt(0).toUpperCase()}
        </Avatar>

        <ListItemText
          sx={{
            mt: 3,
            ml: { md: 3 },
            textAlign: { xs: 'center', md: 'left' },
          }}
          primary={
            <Typography
              variant="h4"
              component="span"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              {name}
              {isVerified && <CheckCircleIcon sx={{ ml: 1, color: 'primary.main' }} />}
            </Typography>
          }
          secondary={
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mt: 1 }}
            >
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  color: 'white !important',
                }}
              >
                @{role.login}
              </Typography>

              {role.role === 'admin' && (
                <Chip
                  label={translation[i18n.language].isAdmin}
                  size="small"
                  color="primary"
                  variant="soft"
                  sx={{
                    color: 'white !important',
                  }}
                />
              )}
            </Stack>
          }
        />
      </Stack>
    </Box>
  );
}
