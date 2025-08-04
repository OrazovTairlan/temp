import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  InputBase,
  useTheme,
  IconButton,
  InputAdornment,
  Dialog,
  dialogClasses,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  SvgIcon,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';
import { varAlpha } from 'src/theme/styles';
import { axiosCopy } from 'src/store/useBoundStore';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

// --- Custom Hook for Debouncing ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
        setAvatarUrl(''); // Reset if no key
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

// --- Result Item for Users ---
const UserResultItem = ({ user, onClickItem }) => (
  <ListItem button onClick={onClickItem}>
    <ListItemAvatar>
      <DynamicAvatar avatarKey={user.avatar_key} alt={`${user.firstname} ${user.surname}`} />
    </ListItemAvatar>
    <ListItemText
      primary={`${user.firstname} ${user.surname}`}
      secondary={`@${user.login}`}
      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
      secondaryTypographyProps={{ noWrap: true, variant: 'body2' }}
    />
  </ListItem>
);

// --- Result Item for Posts ---
const PostResultItem = ({ post, onClickItem }) => (
  <ListItem button onClick={onClickItem} sx={{ alignItems: 'flex-start' }}>
    <ListItemAvatar>
      <DynamicAvatar avatarKey={post.author.avatar_key} alt={post.author.firstname} />
    </ListItemAvatar>
    <ListItemText
      primary={post.title}
      secondary={post.content}
      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
      secondaryTypographyProps={{
        noWrap: true,
        variant: 'body2',
        sx: {
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    />
  </ListItem>
);

// ----------------------------------------------------------------------

export function Searchbar({ sx, ...other }) {
  const theme = useTheme();
  const router = useRouter();
  const search = useBoolean();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('text'); // 'text', 'users', 'hashtags'
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
    setResults([]);
  }, [search]);

  const handleKeyDown = (event) => {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      search.onToggle();
      setSearchQuery('');
    }
  };

  useEventListener('keydown', handleKeyDown);

  const handleClick = useCallback(
    (path) => {
      router.push(path);
      handleClose();
    },
    [handleClose, router]
  );

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSearchType(newValue);
    setSearchQuery('');
    setResults([]);
  };

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        let response;
        if (searchType === 'text') {
          response = await axiosCopy.get('/search/posts', { params: { q: debouncedQuery } });
        } else if (searchType === 'users') {
          response = await axiosCopy.get('/search/users', { params: { q: debouncedQuery } });
        }
        // --- REWRITTEN HASHTAG SEARCH LOGIC ---
        else if (searchType === 'hashtags') {
          // 1. Extract hashtags from the query, keeping the '#' symbol.
          const tags = debouncedQuery
            .split(/[\s,]+/)
            .filter((tag) => tag.startsWith('#') && tag.length > 1);

          if (tags.length > 0) {
            // 2. Manually build the 'tags' part of the query string.
            // Each tag becomes a 'tags=...' parameter.
            const tagsQueryString = tags
              .map((tag) => `tags=${encodeURIComponent(tag)}`)
              .join('&');

            // 3. Construct the full URL by combining the path, tags, and pagination.
            const fullUrl = `/search/hashtags?${tagsQueryString}&page=1&size=10`;

            // 4. Make the API call using the fully constructed URL.
            response = await axiosCopy.get(fullUrl);
          } else {
            // If no valid hashtags are found, do not make an API call.
            response = { data: [] };
          }
        }
        setResults(response.data || []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };


    performSearch();
  }, [debouncedQuery, searchType]);

  const renderResults = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!searchQuery) {
      return (
        <Typography variant="body2" sx={{ p: 5, textAlign: 'center' }}>
          Введите запрос для поиска.
        </Typography>
      );
    }

    if (results.length === 0) {
      return <SearchNotFound query={searchQuery} sx={{ py: 10 }} />;
    }

    return (
      <Box component="ul">
        {results.map((result) => {
          if (searchType === 'users') {
            return (
              <UserResultItem
                key={result.id}
                user={result}
                onClickItem={() => handleClick(`/dashboard/user/${result.login}`)}
              />
            );
          }
          // Both 'text' and 'hashtags' return posts
          return (
            <PostResultItem
              key={result.id}
              post={result}
              onClickItem={() => handleClick(`/dashboard/user/detail-post/${result.id}`)}
            />
          );
        })}
      </Box>
    );
  };

  const TABS = [
    { value: 'text', label: 'Посты' },
    { value: 'users', label: 'Пользователи' },
    { value: 'hashtags', label: 'Хештеги' },
  ];

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        onClick={search.onTrue}
        sx={{
          pr: { sm: 1 },
          margin: '0 auto',
          maxWidth: 500,
          flexGrow: 1,
          borderRadius: { sm: 1.5 },
          cursor: { sm: 'pointer' },
          bgcolor: { sm: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
          ...sx,
        }}
        {...other}
      >
        <IconButton disableRipple>
          <SvgIcon sx={{ width: 20, height: 20 }}>
            <path
              fill="currentColor"
              d="m20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8a7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42M5 11a6 6 0 1 1 6 6a6 6 0 0 1-6-6"
            />
          </SvgIcon>
        </IconButton>

        <Typography variant="body2" sx={{ color: 'text.disabled', flexGrow: 1 }}>
          Поиск...
        </Typography>

        <Label
          sx={{
            fontSize: 12,
            color: 'grey.800',
            bgcolor: 'common.white',
            boxShadow: theme.customShadows.z1,
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        >
          ⌘K
        </Label>
      </Box>

      <Dialog
        fullWidth
        disableRestoreFocus
        maxWidth="sm"
        open={search.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{ sx: { mt: 15, overflow: 'unset' } }}
        sx={{ [`& .${dialogClasses.container}`]: { alignItems: 'flex-start' } }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.vars.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder={
              searchType === 'hashtags'
                ? 'Поиск по хештегам (например, #react #dev)...'
                : 'Поиск...'
            }
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
            inputProps={{ sx: { typography: 'h6' } }}
          />
        </Box>

        <Tabs
          value={searchType}
          onChange={handleTabChange}
          sx={{ px: 3, borderBottom: `solid 1px ${theme.vars.palette.divider}` }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <Scrollbar sx={{ height: 400 }}>{renderResults()}</Scrollbar>
      </Dialog>
    </>
  );
}
