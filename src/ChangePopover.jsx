import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Popover,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from '@mui/material';
import Check from '@mui/icons-material/Check';

// Import our custom flag icons
import { EnFlagIcon, RuFlagIcon, KzFlagIcon } from './CountryIcons';

// --- Configuration ---
// This data-driven approach makes it easy to add new languages.
const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    icon: <EnFlagIcon />,
  },
  {
    code: 'ru',
    label: 'Русский',
    icon: <RuFlagIcon />,
  }
  // {
  //   code: 'kz',
  //   label: 'Қазақша',
  //   icon: <KzFlagIcon />,
  // },
];

// --- Component ---

export const ChangePopover = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    handleClose();
  };

  // Find the current language object to display its icon
  const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={t('header.language')}>
        <IconButton
          onClick={handleOpen}
          sx={{
            padding: '8px',
            width: 40,
            height: 40,
          }}
        >
          {/* Display the current language's flag */}
          {currentLanguage.icon}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        // Styling for the popover paper
        PaperProps={{
          sx: {
            p: 1,
            mt: 1,
            width: 180,
            borderRadius: 1.5,
            boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
          },
        }}
      >
        <MenuList>
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleChangeLanguage(lang.code)}
              selected={lang.code === i18n.language}
              sx={{ borderRadius: 1 }} // Consistent rounded corners
            >
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                <Box component="span" sx={{ width: 28, height: 28 }}>
                  {lang.icon}
                </Box>
              </ListItemIcon>
              <ListItemText primary={lang.label} />
              {lang.code === i18n.language && <Check sx={{ ml: 'auto', color: 'primary.main' }} />}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
};
