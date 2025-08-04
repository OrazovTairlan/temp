/* eslint-disable */
import { useState, useRef, useCallback, useEffect } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { CircularProgress } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

import { ProfilePostItem } from './profile-post-item';
import { axiosCopy, useAppStore } from '../../store/useBoundStore.js';
import { useRouter } from '../../routes/hooks/index.js';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

export function ProfileHome({ posts, onVerify }) {
  const { user } = useAppStore();
  const fileRef = useRef(null);

  // --- State for posts from API ---
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // --- State for the new post form ---
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [isVerified, setIsVerified] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);

  // --- Function to fetch user posts ---
  const fetchUserPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const response = await axiosCopy.get(
        '/user/me/posts?filter=recent&order=desc&page=1&size=10'
      );
      setUserPosts(response.data); // Store fetched posts in state
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
      setError('Не удалось загрузить посты.'); // Set an error message
    } finally {
      setIsLoadingPosts(false);
    }
  }, []); // useCallback with empty dependency array

  const handleDeletePost = (postIdToDelete) => {
    setUserPosts((currentPosts) => currentPosts.filter((post) => post.id !== postIdToDelete));
  };

  // --- Fetch posts on component mount ---
  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]); // Effect depends on the fetch function

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    event.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleHashtagKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && currentHashtag) {
      event.preventDefault();
      const newHashtag = currentHashtag.trim();
      if (newHashtag && !hashtags.includes(newHashtag)) {
        setHashtags([...hashtags, newHashtag]);
      }
      setCurrentHashtag('');
    }
  };

  const router = useRouter(); // Make sure you have this in your component

  const handleNavigate = (id) => {
    // Replace with the actual path to the user's personal info page
    router.push('/dashboard/user/personal-profile/' + id);
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmitPost = async () => {
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('content', postContent);
    const formattedHashtags = hashtags.map((tag) => `#${tag}`).join(',');
    formData.append('hashtags', formattedHashtags);
    selectedFiles.forEach((file) => {
      formData.append('medias', file);
    });

    try {
      await axiosCopy.post('/post/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form on success
      setPostTitle('');
      setPostContent('');
      setHashtags([]);
      setSelectedFiles([]);

      // --- Refetch posts to show the new one ---
      await fetchUserPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
      setError(err.response?.data?.message || 'Не удалось опубликовать пост.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const renderFollows = (
    <Card sx={{ p: 3, textAlign: 'center' }}>
      <Stack spacing={2}>
        {/* Existing Follower/Following Count */}
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ typography: 'h4' }}
        >
          <Stack width={1}>
            {fNumber(user.followers_count)}
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              Подписчики
            </Box>
          </Stack>
          <Stack width={1}>
            {fNumber(user.followings_count)}
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              Подписки
            </Box>
          </Stack>
        </Stack>

        {/* New Button */}
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={() => {
            handleNavigate(user.id);
          }}
        >
          Просмотр личной информации
        </Button>
      </Stack>
    </Card>
  );

  const renderAbout = (
    <Card>
      <CardHeader title="О себе" />
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box sx={{ typography: 'body2' }}>
          {user.bio?.about_me || 'Пользователь еще не добавил информацию о себе.'}
        </Box>
        <Stack direction="row" spacing={2}>
          <Iconify icon="mingcute:location-fill" width={24} />
          <Box sx={{ typography: 'body2' }}>
            {`Живет в `}
            <Link variant="subtitle2" color="inherit">
              {[user.bio?.city, user.bio?.country].filter(Boolean).join(', ') ||
                'Местоположение не указано'}
            </Link>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ typography: 'body2' }}>
          <Iconify icon="fluent:mail-24-filled" width={24} sx={{ mr: 2 }} />
          {user.email}
        </Stack>
        {user.bio?.position && (
          <Stack direction="row" spacing={2}>
            <Iconify icon="ic:round-business-center" width={24} />
            <Box sx={{ typography: 'body2' }}>
              {user.bio.position}
              {user.bio.work_place && ` в ${user.bio.work_place}`}
            </Box>
          </Stack>
        )}
        {user.bio?.specialization && (
          <Stack direction="row" spacing={2}>
            <Iconify icon="solar:notebook-bold" width={24} />
            <Box sx={{ typography: 'body2' }}>
              {`Специализация: `}
              <Link variant="subtitle2" color="inherit">
                {user.bio.specialization}
              </Link>
            </Box>
          </Stack>
        )}
      </Stack>
    </Card>
  );

  const renderPostInput = (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Заголовок"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          variant="outlined"
        />
        <TextField
          multiline
          fullWidth
          rows={4}
          label="О чем вы думаете?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          variant="outlined"
        />
        <Box>
          <TextField
            fullWidth
            label="Хэштеги (введите и нажмите Enter или пробел)"
            value={currentHashtag}
            onChange={(e) => setCurrentHashtag(e.target.value)}
            onKeyDown={handleHashtagKeyDown}
            variant="outlined"
            placeholder="например, #медицина #новости"
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {hashtags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} onDelete={() => handleRemoveHashtag(tag)} />
            ))}
          </Stack>
        </Box>
      </Stack>

      {selectedFiles.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {selectedFiles.map((file, index) => (
            <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
              <img
                src={URL.createObjectURL(file)}
                alt={`preview ${index}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                onLoad={(e) => URL.revokeObjectURL(e.target.src)}
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveImage(index)}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                }}
              >
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:gallery-wide-bold" />}
            onClick={handleAttach}
          >
            Фото/Видео
          </Button>
        </Stack>
        <Button
          variant="contained"
          onClick={handleSubmitPost}
          disabled={isSubmitting || !postTitle || !postContent}
        >
          {isSubmitting ? 'Публикация...' : 'Опубликовать'}
        </Button>
      </Stack>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {error && <Box sx={{ color: 'error.main', mt: 2 }}>{error}</Box>}
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
          {renderPostInput}

          {/* --- Render posts from state --- */}
          {isLoadingPosts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            userPosts.map((post) => (
              <ProfilePostItem key={post.id} onDelete={handleDeletePost} post={post} />
            ))
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
