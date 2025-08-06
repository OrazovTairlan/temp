import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Divider,
  Stack,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  InputBase, // Replaced with OutlinedInput for better styling
  Paper,
  Link,
  Dialog,
  DialogContent,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  Collapse,
  Tooltip,
  Skeleton,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ThumbDown,
  ThumbDownOutlined,
  ChatBubbleOutline,
  MoreHoriz,
  Verified,
  Translate,
  Send,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// Utility & Store Imports
import { fToNow } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';
import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';

// Component Imports
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';

// --- Skeleton Components for Better UX ---

const CommentSkeleton = () => (
  <Stack direction="row" spacing={2} sx={{ py: 1.5 }}>
    <Skeleton variant="circular" width={32} height={32} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1.5 }} />
    </Box>
  </Stack>
);

const PostSkeleton = () => (
  <Card elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
    <CardContent sx={{ px: 3, py: 2 }}>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="text" width="40%" />
          </Stack>
          <Skeleton variant="text" width="60%" sx={{ my: 1.5, height: 32 }} />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1.5, my: 2 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// --- Reusable Component for fetching and displaying media ---
const DynamicMedia = ({
  fileKey,
  fileType,
  renderAs = 'image',
  alt = '',
  sx = {},
  onImageClick,
}) => {
  const { t } = useTranslation();
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!fileKey) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosCopy.get('/file/url', { params: { key: fileKey } });
        setFileUrl(response.data);
      } catch (err) {
        console.error('Failed to fetch file URL:', err);
        setError(t('errors.fileLoad'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUrl();
  }, [fileKey, t]);

  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          ...sx,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error || !fileUrl) {
    if (renderAs === 'avatar') return <Avatar sx={sx}>{initials}</Avatar>;
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          height: '100%',
          ...sx,
        }}
      >
        <Iconify icon="solar:gallery-broken-bold" width={32} sx={{ color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary" textAlign="center">
          {error || t('errors.fileLoad')}
        </Typography>
      </Paper>
    );
  }

  if (renderAs === 'avatar')
    return (
      <Avatar src={fileUrl} alt={alt} sx={sx}>
        {initials}
      </Avatar>
    );

  if (fileType?.startsWith('image/')) {
    const isClickable = typeof onImageClick === 'function';
    return (
      <Box
        onClick={isClickable ? () => onImageClick(fileUrl) : undefined}
        sx={{
          cursor: isClickable ? 'pointer' : 'default',
          overflow: 'hidden',
          borderRadius: 1.5,
          '&:hover img': isClickable ? { transform: 'scale(1.05)' } : {},
        }}
      >
        <Image
          alt={alt}
          src={fileUrl}
          ratio="16/9"
          sx={{ transition: 'transform 0.3s ease-in-out', ...sx }}
        />
      </Box>
    );
  }

  // Fallback for other file types like documents
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 1.5, ...sx }}
    >
      <Iconify icon="solar:file-text-bold" width={32} sx={{ mr: 2, flexShrink: 0 }} />
      <Link href={fileUrl} target="_blank" rel="noopener noreferrer" variant="body2" noWrap>
        {fileKey.split('/').pop()}
      </Link>
    </Paper>
  );
};

// --- CommentItem Component ---
const CommentItem = ({ comment, onDelete }) => {
  const { t } = useTranslation();
  const { user } = useAppStore();
  const [reaction, setReaction] = useState({
    likes: comment.like_count || 0,
    dislikes: comment.dislike_count || 0,
    userChoice: null, // 'like', 'dislike', or null
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const authorName = `${comment.author.firstname} ${comment.author.surname}`;
  const isAuthor = user?.id === comment.author.id;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDelete = async () => {
    handleMenuClose();
    try {
      await axiosCopy.delete(`/comment/${comment.id}`);
      onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment', error);
      // TODO: Show a snackbar error to the user
    }
  };

  const handleCommentReaction = async (reactionType) => {
    // This logic performs an optimistic update for a better UX
    const originalState = { ...reaction };
    setReaction((prev) => {
      const isTogglingOff = prev.userChoice === reactionType;
      const newCounts = { likes: prev.likes, dislikes: prev.dislikes };

      // If user clicks the same reaction, toggle it off
      if (isTogglingOff) {
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] -= 1;
      } else {
        // If switching reaction (e.g., from like to dislike), decrement the old one
        if (prev.userChoice) {
          newCounts[prev.userChoice === 'like' ? 'likes' : 'dislikes'] -= 1;
        }
        // Increment the new reaction
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] += 1;
      }

      return { ...newCounts, userChoice: isTogglingOff ? null : reactionType };
    });

    try {
      await axiosCopy.post(`/reaction/${reactionType}/${comment.id}`, null, {
        params: { target: 'COMMENT' },
      });
    } catch (error) {
      console.error(`Failed to ${reactionType} comment`, error);
      setReaction(originalState); // Revert on error
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ py: 1.5 }}>
      <DynamicMedia
        fileKey={comment.author.avatar_key}
        renderAs="avatar"
        alt={authorName}
        sx={{ width: 32, height: 32, mt: 0.5 }}
      />
      <Box sx={{ flex: 1 }}>
        <Paper sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="subtitle2"
              component={RouterLink}
              to={`/dashboard/user/${comment.author.login}`}
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {authorName}
            </Typography>
            <Stack direction="row" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1, flexShrink: 0 }}>
                {fToNow(comment.created_at || new Date())}
              </Typography>
              {isAuthor && (
                <>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreHoriz fontSize="small" />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                      <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                      Удалить
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {comment.comment}
          </Typography>
        </Paper>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5, pl: 1 }}>
          <Tooltip title="Нравиться">
            <IconButton size="small" onClick={() => handleCommentReaction('like')}>
              <Favorite
                sx={{ fontSize: 16 }}
                color={reaction.userChoice === 'like' ? 'error' : 'action'}
              />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">{fShortenNumber(reaction.likes)}</Typography>
          <Tooltip title="Не нравиться">
            <IconButton size="small" onClick={() => handleCommentReaction('dislike')}>
              <ThumbDown
                sx={{ fontSize: 16 }}
                color={reaction.userChoice === 'dislike' ? 'primary' : 'action'}
              />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">{fShortenNumber(reaction.dislikes)}</Typography>
        </Stack>
      </Box>
    </Stack>
  );
};

// --- PostItem Component ---
const PostItem = React.forwardRef(({ post, onDelete }, ref) => {
  const { t, i18n } = useTranslation();
  const { user } = useAppStore();

  // State Management
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogImage, setDialogImage] = useState(null);

  const [reaction, setReaction] = useState({
    likes: post.like_count || 0,
    dislikes: post.dislike_count || 0,
    userChoice: null, // 'like', 'dislike', or null
  });

  const [text, setText] = useState({
    original: { title: post.title, content: post.content, hashtags: post.hashtags[0]?.name || '' },
    translated: null,
    isTranslated: false,
    isTranslating: false,
  });

  // Derived State & Event Handlers
  const authorName = `${post.author.firstname} ${post.author.surname}`;
  const isAuthor = user?.id === post.author.id;
  const handleImageClick = (imageUrl) => setDialogImage(imageUrl);
  const handleCloseDialog = () => setDialogImage(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDeletePost = async () => {
    handleMenuClose();
    try {
      await axiosCopy.delete(`/post/${post.id}`);
      onDelete(post.id);
    } catch (error) {
      console.error('Failed to delete post', error);
    }
  };

  const handleDeleteComment = (commentIdToDelete) => {
    setComments((currentComments) => currentComments.filter((c) => c.id !== commentIdToDelete));
  };

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const response = await axiosCopy.get(`/post/{id}/comments`, {
        params: {
          post_id: post.id,
        },
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id]);

  const handleToggleComments = () => {
    const willShow = !showComments;
    setShowComments(willShow);
    if (willShow && comments.length === 0 && post.comment_count > 0) {
      fetchComments();
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const response = await axiosCopy.post(`/post/${post.id}/comment`, {
        comment: newComment.trim(),
      });
      setComments((prev) => [response.data, ...prev]);
      setNewComment('');
      // Optimistically update comment count if needed
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePostReaction = async (reactionType) => {
    const originalState = { ...reaction };
    // Optimistic update logic (same as in CommentItem)
    setReaction((prev) => {
      const isTogglingOff = prev.userChoice === reactionType;
      const newCounts = { likes: prev.likes, dislikes: prev.dislikes };
      if (isTogglingOff) newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] -= 1;
      else {
        if (prev.userChoice) newCounts[reactionType === 'like' ? 'dislikes' : 'likes'] -= 1;
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] += 1;
      }
      return { ...newCounts, userChoice: isTogglingOff ? null : reactionType };
    });

    try {
      await axiosCopy.post(`/reaction/${reactionType}/${post.id}`, null, {
        params: { target: 'POST' },
      });
    } catch (error) {
      console.error(`Failed to ${reactionType} post`, error);
      setReaction(originalState);
    }
  };

  const handleTranslate = async () => {
    // If translation already exists, just show it
    if (text.translated) {
      setText((c) => ({ ...c, isTranslated: true }));
      return;
    }
    setText((c) => ({ ...c, isTranslating: true }));
    try {
      // *** FIXED: Sending current language as destination ***
      const response = await axiosCopy.post(`/translate?dest=${i18n.language}`, {
        title: text.original.title,
        content: text.original.content,
        hashtags: text.original.hashtags,
      });
      setText((c) => ({
        ...c,
        translated: response.data,
        isTranslated: true,
        isTranslating: false,
      }));
    } catch (error) {
      console.error('Failed to translate post', error);
      setText((c) => ({ ...c, isTranslating: false }));
      // TODO: Show a snackbar error
    }
  };

  const handleShowOriginal = () => setText((c) => ({ ...c, isTranslated: false }));

  const displayedTitle = text.isTranslated ? text.translated?.title : text.original.title;
  const displayedContent = text.isTranslated ? text.translated?.content : text.original.content;
  const displayedHashtags = text.isTranslated ? text.translated?.hashtags : text.original.hashtags;

  return (
    <>
      <Card
        ref={ref}
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          '&:last-of-type': { borderBottom: 'none' },
        }}
      >
        <CardContent sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={2}>
            <DynamicMedia
              fileKey={post.author.avatar_key}
              renderAs="avatar"
              alt={authorName}
              sx={{ width: 48, height: 48, mt: 0.5 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* --- Post Header --- */}
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      component={RouterLink}
                      to={`/dashboard/user/${post.author.login}`}
                      color="inherit"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {authorName}
                    </Typography>
                    {post.author.is_verified && <Verified color="primary" sx={{ fontSize: 18 }} />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    @{post.author.login} • {fToNow(post.created_at)}
                  </Typography>
                </Box>
                {isAuthor && (
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreHoriz />
                  </IconButton>
                )}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
                    <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                    Удалить пост
                  </MenuItem>
                </Menu>
              </Stack>

              {/* --- Post Content --- */}
              <Box sx={{ my: 2 }}>
                <Fade in={!text.isTranslated} unmountOnExit>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {text.original.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {text.original.content}
                    </Typography>
                  </Box>
                </Fade>
                <Fade in={text.isTranslated} unmountOnExit>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {displayedTitle}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {displayedContent}
                    </Typography>
                  </Box>
                </Fade>
              </Box>

              {/* --- Translate Button --- */}
              {text.isTranslating ? (
                <Button size="small" disabled startIcon={<CircularProgress size={16} />}>
                  Переводиться
                </Button>
              ) : text.isTranslated ? (
                <Button size="small" onClick={handleShowOriginal} startIcon={<Translate />}>
                  Показать оригинал
                </Button>
              ) : (
                <Button size="small" onClick={handleTranslate} startIcon={<Translate />}>
                  Перевести
                </Button>
              )}

              {/* --- Hashtags --- */}
              {displayedHashtags && (
                <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                  {displayedHashtags
                    .split(',')
                    .map(
                      (tag) =>
                        tag.trim() && (
                          <Chip
                            key={tag}
                            label={tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`}
                            size="small"
                            component={RouterLink}
                          />
                        )
                    )}
                </Stack>
              )}

              {/* --- Media Grid --- */}
              {post.medias?.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(post.medias.length, 2)}, 1fr)`,
                    gap: 1,
                    my: 2,
                  }}
                >
                  {post.medias.map((media) => (
                    <DynamicMedia
                      key={media.key}
                      fileKey={media.key}
                      fileType={media.type}
                      alt={media.key}
                      onImageClick={handleImageClick}
                    />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 1.5 }} />

              {/* --- Action Buttons --- */}
              <Stack direction="row" justifyContent="space-around" alignItems="center">
                <Button
                  startIcon={<ChatBubbleOutline />}
                  size="small"
                  color="inherit"
                  onClick={handleToggleComments}
                >
                  {fShortenNumber(post.comment_count)}
                </Button>
                <Button
                  startIcon={reaction.userChoice === 'like' ? <Favorite /> : <FavoriteBorder />}
                  size="small"
                  color={reaction.userChoice === 'like' ? 'error' : 'inherit'}
                  onClick={() => handlePostReaction('like')}
                >
                  {fShortenNumber(reaction.likes)}
                </Button>
                <Button
                  startIcon={
                    reaction.userChoice === 'dislike' ? <ThumbDown /> : <ThumbDownOutlined />
                  }
                  size="small"
                  color={reaction.userChoice === 'dislike' ? 'primary' : 'inherit'}
                  onClick={() => handlePostReaction('dislike')}
                >
                  {fShortenNumber(reaction.dislikes)}
                </Button>
                {/* <IconButton> */}
                {/*   <Iconify icon="solar:share-bold" /> */}
                {/* </IconButton> */}
              </Stack>

              {/* --- Comments Section --- */}
              <Collapse in={showComments} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                  <Divider />
                  {isLoadingComments ? (
                    <>
                      <CommentSkeleton />
                      <CommentSkeleton />
                    </>
                  ) : (
                    comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={handleDeleteComment}
                      />
                    ))
                  )}

                  {/* New Comment Input */}
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                    <DynamicMedia
                      fileKey={user?.avatar_key}
                      renderAs="avatar"
                      sx={{ width: 40, height: 40 }}
                    />
                    <OutlinedInput
                      fullWidth
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Введите Ваш текст"
                      onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handlePostComment}
                            edge="end"
                            color="primary"
                            disabled={!newComment.trim() || isSubmittingComment}
                          >
                            {isSubmittingComment ? <CircularProgress size={24} /> : <Send />}
                          </IconButton>
                        </InputAdornment>
                      }
                      sx={{ borderRadius: 5, bgcolor: 'background.neutral' }}
                    />
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* --- Image Viewer Dialog --- */}
      <Dialog
        open={Boolean(dialogImage)}
        onClose={handleCloseDialog}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Tooltip title="Отмена">
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'common.white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Tooltip>
          <Box
            component="img"
            src={dialogImage}
            alt="Приближенное изображение"
            sx={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 2 }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
});

// --- Main Feed Component ---
export const SocialMediaFeed = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [order, setOrder] = useState('desc');
  const PAGE_SIZE = 10;

  // Infinite Scroll Observer
  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // Data fetching logic
  const fetchPosts = useCallback(
    async (isNewOrder = false) => {
      setIsLoading(true);
      const currentPage = isNewOrder ? 1 : page;
      try {
        const response = await axiosCopy.get('/posts', {
          params: { page: currentPage, size: PAGE_SIZE, order },
        });
        const newPosts = response.data;
        setPosts((prevPosts) => {
          const allPosts = isNewOrder ? newPosts : [...prevPosts, ...newPosts];
          // Ensure posts are unique in case of refetches
          return Array.from(new Map(allPosts.map((p) => [p.id, p])).values());
        });
        setHasMore(newPosts.length === PAGE_SIZE);
        if (isNewOrder) setPage(1);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [page, order]
  );

  useEffect(() => {
    // Initial fetch or fetch when order changes
    fetchPosts(true);
  }, [order]); // Re-run only when order changes

  useEffect(() => {
    // Fetch more posts when page changes (for infinite scroll)
    if (page > 1) {
      fetchPosts(false);
    }
  }, [page]); // Re-run only when page changes

  const handleDeletePost = (postIdToDelete) => {
    setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postIdToDelete));
  };

  const handleOrderChange = (event, newOrder) => {
    if (newOrder !== null && newOrder !== order) {
      setOrder(newOrder);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 1200, width: '100%', mx: 'auto' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Лента
          </Typography>
          <ToggleButtonGroup value={order} exclusive onChange={handleOrderChange} size="small">
            <ToggleButton value="desc">Сначала новые</ToggleButton>
            <ToggleButton value="asc">Сначала поздние</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack divider={<Divider />}>
          {isLoading && page === 1
            ? // Initial loading state with skeletons
              Array.from(new Array(3)).map((_, index) => <PostSkeleton key={index} />)
            : posts.map((post, index) => (
                <Fade in key={post.id}>
                  <div>
                    {' '}
                    {/* Fade requires a direct child */}
                    <PostItem
                      ref={posts.length === index + 1 ? lastPostElementRef : null}
                      post={post}
                      onDelete={handleDeletePost}
                    />
                  </div>
                </Fade>
              ))}
        </Stack>

        {/* Loading indicator for infinite scroll */}
        {isLoading && page > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        )}

        {!isLoading && !hasMore && posts.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ display: 'block', p: 3 }}
          >
            Вы всё просмотрели
          </Typography>
        )}
      </Box>
    </DashboardContent>
  );
};
