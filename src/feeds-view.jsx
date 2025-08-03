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
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ThumbDown,
  ThumbDownOutlined,
  ChatBubbleOutline,
  Repeat,
  Share,
  MoreHoriz,
  Verified,
} from '@mui/icons-material';

import { fToNow } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';
import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy } from 'src/store/useBoundStore'; // Assuming this is your configured axios instance
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';

const MEDIA_BASE_URL = 'http://localhost:8000/files/'; // Adjust if necessary

// --- CommentItem Component ---
const CommentItem = ({ comment }) => {
  const [reaction, setReaction] = useState({
    likes: comment.like_count || 0,
    dislikes: comment.dislike_count || 0,
    userChoice: null,
  });

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
      <Avatar
        src={comment.author.avatar_key ? `${MEDIA_BASE_URL}${comment.author.avatar_key}` : ''}
        sx={{ width: 32, height: 32 }}
      />
      <Box sx={{ flex: 1 }}>
        <Paper sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">
              {`${comment.author.firstname} ${comment.author.surname}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fToNow(comment.created_at || new Date())}
            </Typography>
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
        </Stack>
      </Box>
    </Stack>
  );
};

// --- PostItem Component ---
const PostItem = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [reaction, setReaction] = useState({
    likes: post.like_count || 0,
    dislikes: post.dislike_count || 0,
    userChoice: null,
  });

  const fetchComments = useCallback(async () => {
    if (post.comment_count === 0) return;
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
  }, [post.id, post.comment_count]);

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
      fetchComments(); // Refresh comments list
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

  return (
    <Card elevation={0} sx={{ borderRadius: 0, '&:hover': { bgcolor: 'grey.50' } }}>
      <CardContent sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={2}>
          <Avatar
            src={post.author.avatar_key ? `${MEDIA_BASE_URL}${post.author.avatar_key}` : ''}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {`${post.author.firstname} ${post.author.surname}`}
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
              <IconButton size="small">
                <MoreHoriz />
              </IconButton>
            </Stack>

            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {post.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {post.content}
            </Typography>

            {post.hashtags[0]?.name && (
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2 }}>
                {post.hashtags[0].name
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
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 1,
                  mb: 2,
                }}
              >
                {post.medias.map((media) => (
                  <Box key={media.key}>
                    {media.type.startsWith('image/') ? (
                      <Image
                        alt={media.key}
                        src={`${MEDIA_BASE_URL}${media.key}`}
                        sx={{ borderRadius: 1.5 }}
                      />
                    ) : (
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 1.5 }}
                      >
                        <Iconify icon="solar:file-text-bold" width={32} sx={{ mr: 2 }} />
                        <Link
                          href={`${MEDIA_BASE_URL}${media.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                        >
                          {media.key.split('/').pop()}
                        </Link>
                      </Paper>
                    )}
                  </Box>
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
              <IconButton size="small" color="secondary">
                <Share />
              </IconButton>
            </Stack>

            {showComments && (
              <Box sx={{ mt: 2 }}>
                <Divider />
                {isLoadingComments ? (
                  <CircularProgress size={24} sx={{ my: 2 }} />
                ) : (
                  comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
                )}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }} />
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
  );
};

// --- Main Feed Component ---
export const SocialMediaFeed = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
                <PostItem post={post} />
                {index < posts.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </DashboardContent>
  );
};
