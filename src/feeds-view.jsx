/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
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
  InputBase,
  Paper,
  Link,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ThumbDown,
  ThumbDownOutlined,
  ChatBubbleOutline,
  Share,
  MoreHoriz,
  Verified,
  Translate,
} from '@mui/icons-material';

import { fToNow } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';
import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';

// --- Reusable Component for fetching and displaying any media from a key ---
const DynamicMedia = ({ fileKey, fileType, renderAs = 'image', alt = '', sx = {}, onImageClick }) => {
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
        setError('Could not load file.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUrl();
  }, [fileKey]);

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
    if (renderAs === 'avatar') {
      return <Avatar sx={sx}>{alt ? alt.charAt(0) : ''}</Avatar>;
    }
    return null;
  }

  if (renderAs === 'avatar') {
    return <Avatar src={fileUrl} alt={alt} sx={sx} />;
  }

  if (fileType && fileType.startsWith('image/')) {
    const isClickable = typeof onImageClick === 'function';
    return (
      <Box
        onClick={isClickable ? () => onImageClick(fileUrl) : undefined}
        sx={{
          cursor: isClickable ? 'pointer' : 'default',
          '&:hover': isClickable ? { opacity: 0.85 } : {},
          transition: (theme) => theme.transitions.create('opacity'),
        }}
      >
        <Image alt={alt} src={fileUrl} sx={{ borderRadius: 1.5, display: 'block', ...sx }} />
      </Box>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 1.5, ...sx }}
    >
      <Iconify icon="solar:file-text-bold" width={32} sx={{ mr: 2 }} />
      <Link href={fileUrl} target="_blank" rel="noopener noreferrer" variant="body2">
        {fileKey.split('/').pop()}
      </Link>
    </Paper>
  );
};

// --- CommentItem Component ---
const CommentItem = ({ comment, onDelete }) => {
  const { user } = useAppStore();
  const [reaction, setReaction] = useState({
    likes: comment.like_count || 0,
    dislikes: comment.dislike_count || 0,
    userChoice: null,
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
    }
  };

  const handleCommentReaction = async (reactionType) => {
    const originalState = { ...reaction };
    setReaction((prev) => {
      const isTogglingOff = prev.userChoice === reactionType;
      const newCounts = { likes: prev.likes, dislikes: prev.dislikes };
      if (isTogglingOff) {
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] -= 1;
      } else {
        if (prev.userChoice) {
          newCounts[reactionType === 'like' ? 'dislikes' : 'likes'] -= 1;
        }
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
      setReaction(originalState);
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ py: 1.5 }}>
      <DynamicMedia
        fileKey={comment.author.avatar_key}
        renderAs="avatar"
        alt={authorName}
        sx={{ width: 32, height: 32 }}
      />
      <Box sx={{ flex: 1 }}>
        <Paper sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">{authorName}</Typography>
            <Stack direction="row" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                {fToNow(comment.created_at || new Date())}
              </Typography>
              {isAuthor && (
                <>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreHoriz fontSize="small" />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                      Удалить
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Stack>
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {comment.comment}
          </Typography>
        </Paper>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5, pl: 1 }}>
          <IconButton size="small" onClick={() => handleCommentReaction('like')}>
            <Favorite
              sx={{ fontSize: 16 }}
              color={reaction.userChoice === 'like' ? 'error' : 'disabled'}
            />
          </IconButton>
          <Typography variant="caption">{fShortenNumber(reaction.likes)}</Typography>
          <IconButton size="small" onClick={() => handleCommentReaction('dislike')}>
            <ThumbDown
              sx={{ fontSize: 16 }}
              color={reaction.userChoice === 'dislike' ? 'primary' : 'disabled'}
            />
          </IconButton>
          <Typography variant="caption">{fShortenNumber(reaction.dislikes)}</Typography>
        </Stack>
      </Box>
    </Stack>
  );
};

// --- PostItem Component ---
const PostItem = ({ post, onDelete }) => {
  const { user } = useAppStore();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogImage, setDialogImage] = useState(null); // State for the image dialog
  const [reaction, setReaction] = useState({
    likes: post.like_count || 0,
    dislikes: post.dislike_count || 0,
    userChoice: null,
  });
  const [text, setText] = useState({
    original: {
      title: post.title,
      content: post.content,
      hashtags: post.hashtags[0]?.name || '',
    },
    translated: null,
    isTranslated: false,
    isTranslating: false,
  });

  const authorName = `${post.author.firstname} ${post.author.surname}`;
  const isAuthor = user?.id === post.author.id;

  // Handlers for the image dialog
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
    if (post.comment_count === 0 && !showComments) return;
    setIsLoadingComments(true);
    try {
      const response = await axiosCopy.get(`/post/{id}/comments`, {
        params: { post_id: post.id },
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, post.comment_count, showComments]);

  const handleToggleComments = () => {
    const willShow = !showComments;
    setShowComments(willShow);
    if (willShow && comments.length === 0) {
      fetchComments();
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axiosCopy.post(`/post/${post.id}/comment`, { comment: newComment.trim() });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  const handlePostReaction = async (reactionType) => {
    const originalState = { ...reaction };
    setReaction((prev) => {
      const isTogglingOff = prev.userChoice === reactionType;
      const newCounts = { likes: prev.likes, dislikes: prev.dislikes };
      if (isTogglingOff) {
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] -= 1;
      } else {
        if (prev.userChoice) {
          newCounts[reactionType === 'like' ? 'dislikes' : 'likes'] -= 1;
        }
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
    if (text.translated) {
      setText((c) => ({ ...c, isTranslated: true }));
      return;
    }

    setText((c) => ({ ...c, isTranslating: true }));
    try {
      const response = await axiosCopy.post('/translate', {
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
    }
  };

  const handleShowOriginal = () => {
    setText((c) => ({ ...c, isTranslated: false }));
  };

  const displayedTitle = text.isTranslated ? text.translated.title : text.original.title;
  const displayedContent = text.isTranslated ? text.translated.content : text.original.content;
  const displayedHashtags = text.isTranslated ? text.translated.hashtags : text.original.hashtags;

  return (
    <>
      <Card elevation={0} sx={{ borderRadius: 0, '&:hover': { bgcolor: 'grey.50' } }}>
        <CardContent sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={2}>
            <DynamicMedia
              fileKey={post.author.avatar_key}
              renderAs="avatar"
              alt={authorName}
              sx={{ width: 48, height: 48 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {authorName}
                </Typography>
                {post.author.is_verified && <Verified color="primary" sx={{ fontSize: 16 }} />}
                <Typography variant="body2" color="text.secondary">
                  @{post.author.login}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fToNow(post.created_at)}
                </Typography>
                <Box sx={{ flex: 1 }} />
              </Stack>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {displayedTitle}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {displayedContent}
              </Typography>

              {text.isTranslating ? (
                <Button size="small" disabled startIcon={<CircularProgress size={16} />}>
                  Translating...
                </Button>
              ) : text.isTranslated ? (
                <Button size="small" onClick={handleShowOriginal} startIcon={<Translate />}>
                  Show Original
                </Button>
              ) : (
                <Button size="small" onClick={handleTranslate} startIcon={<Translate />}>
                  Translate
                </Button>
              )}

              {displayedHashtags && (
                <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ my: 2 }}>
                  {displayedHashtags
                    .split(',')
                    .map(
                      (tag) =>
                        tag && (
                          <Chip
                            key={tag}
                            label={tag.startsWith('#') ? tag : `#${tag}`}
                            size="small"
                          />
                        )
                    )}
                </Stack>
              )}

              {post.medias && post.medias.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
                    gap: 1,
                    mb: 2,
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

              <Stack direction="row" spacing={4} alignItems="center">
                <Button
                  startIcon={<ChatBubbleOutline />}
                  size="small"
                  color="secondary"
                  onClick={handleToggleComments}
                >
                  {fShortenNumber(post.comment_count)}
                </Button>
                <Button
                  startIcon={reaction.userChoice === 'like' ? <Favorite /> : <FavoriteBorder />}
                  size="small"
                  color={reaction.userChoice === 'like' ? 'error' : 'secondary'}
                  onClick={() => handlePostReaction('like')}
                >
                  {fShortenNumber(reaction.likes)}
                </Button>
                <Button
                  startIcon={
                    reaction.userChoice === 'dislike' ? <ThumbDown /> : <ThumbDownOutlined />
                  }
                  size="small"
                  color={reaction.userChoice === 'dislike' ? 'primary' : 'secondary'}
                  onClick={() => handlePostReaction('dislike')}
                >
                  {fShortenNumber(reaction.dislikes)}
                </Button>
              </Stack>

              {showComments && (
                <Box sx={{ mt: 2 }}>
                  <Divider />
                  {isLoadingComments ? (
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  ) : (
                    comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={handleDeleteComment}
                      />
                    ))
                  )}
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <DynamicMedia
                      fileKey={user?.avatar_key}
                      renderAs="avatar"
                      sx={{ width: 32, height: 32 }}
                    />
                    <InputBase
                      fullWidth
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Напишите комментарий..."
                      onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                      sx={{
                        pl: 1.5,
                        height: 40,
                        borderRadius: 1,
                        border: (theme) => `solid 1px ${theme.palette.divider}`,
                      }}
                    />
                    <Button variant="contained" onClick={handlePostComment}>
                      Отправить
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(dialogImage)}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: 'transparent', boxShadow: 'none' },
        }}
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
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'common.white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
          <Box
            component="img"
            src={dialogImage}
            alt="Zoomed content"
            sx={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- Main Feed Component ---
export const SocialMediaFeed = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleDeletePost = (postIdToDelete) => {
    setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postIdToDelete));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axiosCopy.get('/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ px: 2, fontWeight: 'bold' }}>
          Главная лента
        </Typography>
        <Stack spacing={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            posts.map((post, index) => (
              <Box key={post.id}>
                <PostItem post={post} onDelete={handleDeletePost} />
                {index < posts.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </DashboardContent>
  );
};
