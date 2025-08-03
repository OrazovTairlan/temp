/* eslint-disable */
import { useRef, useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import { CircularProgress } from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// Assuming axios is configured elsewhere and imported
import { axiosCopy } from 'src/store/useBoundStore';

// ----------------------------------------------------------------------

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

// --- MediaItem Component to fetch and display individual media files ---
const MediaItem = ({ media }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMediaUrl = async () => {
      if (!media.key) {
        setError('No media key provided.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosCopy.get('/file/url', { params: { key: media.key } });
        setMediaUrl(response.data);
      } catch (err) {
        console.error('Failed to fetch media URL:', err);
        setError('Could not load media.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaUrl();
  }, [media.key]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 150,
          bgcolor: 'background.neutral',
          borderRadius: 1.5,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 150,
          bgcolor: 'background.neutral',
          borderRadius: 1.5,
          p: 2,
        }}
      >
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (media.type.startsWith('image/')) {
    return <Image alt={media.key} src={mediaUrl} ratio="16/9" sx={{ borderRadius: 1.5 }} />;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        borderRadius: 1.5,
      }}
    >
      <Iconify icon="solar:file-text-bold" width={32} sx={{ mr: 2 }} />
      <Link href={mediaUrl} target="_blank" rel="noopener noreferrer" variant="body2">
        {media.key.split('/').pop()}
      </Link>
    </Paper>
  );
};

export function ProfilePostItem({ post }) {
  const commentRef = useRef(null);

  // --- State Management ---
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [postReaction, setPostReaction] = useState({
    likes: post.like_count || 0,
    dislikes: post.dislike_count || 0,
    userChoice: null,
  });
  const [commentReactions, setCommentReactions] = useState({});

  const authorName = `${post.author.firstname} ${post.author.surname}`;

  // --- Data Fetching and Side Effects ---
  const fetchComments = useCallback(async () => {
    if (post.comment_count === 0 && comments.length === 0) return;
    setIsLoadingComments(true);
    try {
      const response = await axiosCopy.get(`/post/{id}/comments`, {
        params: { post_id: post.id },
      });
      setComments(response.data);
      const initialReactions = {};
      response.data.forEach((comment) => {
        initialReactions[comment.id] = {
          likes: comment.like_count || 0,
          dislikes: comment.dislike_count || 0,
          userChoice: null,
        };
      });
      setCommentReactions(initialReactions);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, post.comment_count, comments.length]);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, comments.length, fetchComments]);

  // --- Event Handlers ---
  const handleToggleComments = useCallback(() => setShowComments((prev) => !prev), []);

  const handlePostComment = useCallback(async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    try {
      await axiosCopy.post(`/post/${post.id}/comment`, { comment: trimmedComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  }, [newComment, post.id, fetchComments]);

  const handlePostReaction = async (reactionType) => {
    const originalState = { ...postReaction };
    setPostReaction((prevState) => {
      const isTogglingOff = prevState.userChoice === reactionType;
      const newCounts = {
        likes: prevState.likes,
        dislikes: prevState.dislikes,
      };
      if (isTogglingOff) {
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] -= 1;
      } else {
        if (prevState.userChoice) {
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
      console.error(`Failed to ${reactionType} post:`, error);
      setPostReaction(originalState);
    }
  };

  const handleCommentReaction = async (commentId, reactionType) => {
    const originalState = { ...commentReactions[commentId] };
    setCommentReactions((prev) => {
      const currentState = prev[commentId];
      const isTogglingOff = currentState.userChoice === reactionType;
      const newCounts = {
        likes: currentState.likes,
        dislikes: currentState.dislikes,
      };
      if (isTogglingOff) {
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] -= 1;
      } else {
        if (currentState.userChoice) {
          newCounts[reactionType === 'like' ? 'dislikes' : 'likes'] -= 1;
        }
        newCounts[reactionType === 'like' ? 'likes' : 'dislikes'] += 1;
      }
      return {
        ...prev,
        [commentId]: { ...newCounts, userChoice: isTogglingOff ? null : reactionType },
      };
    });

    try {
      await axiosCopy.post(`/reaction/${reactionType}/${commentId}`, null, {
        params: { target: 'COMMENT' },
      });
    } catch (error) {
      console.error(`Failed to ${reactionType} comment:`, error);
      setCommentReactions((prev) => ({ ...prev, [commentId]: originalState }));
    }
  };

  // --- Render Functions ---
  const renderHead = (
    <CardHeader
      disableTypography
      avatar={<DynamicAvatar avatarKey={post.author.avatar_key} alt={authorName} />}
      title={
        <Link color="inherit" variant="subtitle1">
          {authorName}
        </Link>
      }
      subheader={
        <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
          {fDate(post.created_at)}
        </Box>
      }
      action={
        <IconButton>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      }
    />
  );

  const renderBody = (
    <Stack spacing={2} sx={{ p: (theme) => theme.spacing(0, 3, 2, 3) }}>
      <Typography variant="h6">{post.title}</Typography>
      <Typography variant="body2">{post.content}</Typography>
      {post.hashtags[0]?.name && (
        <Stack direction="row" flexWrap="wrap" spacing={1}>
          {post.hashtags[0].name
            .split(',')
            .map(
              (tag) =>
                tag && <Chip key={tag} label={tag.startsWith('#') ? tag : `#${tag}`} size="small" />
            )}
        </Stack>
      )}
    </Stack>
  );

  const renderMedia = (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={1}>
        {post.medias.map((media) => (
          <Grid key={media.key} xs={post.medias.length > 1 ? 6 : 12}>
            <MediaItem media={media} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderActions = (
    <Stack direction="row" alignItems="center" sx={{ p: (theme) => theme.spacing(1, 2, 1, 2) }}>
      <FormControlLabel
        control={
          <Checkbox
            color="error"
            checked={postReaction.userChoice === 'like'}
            onChange={() => handlePostReaction('like')}
            icon={<Iconify icon="solar:heart-bold" />}
            checkedIcon={<Iconify icon="solar:heart-bold" />}
          />
        }
        label={fShortenNumber(postReaction.likes)}
        sx={{ mr: 1 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={postReaction.userChoice === 'dislike'}
            onChange={() => handlePostReaction('dislike')}
            icon={<Iconify icon="solar:dislike-bold" />}
            checkedIcon={<Iconify icon="solar:dislike-bold" />}
          />
        }
        label={fShortenNumber(postReaction.dislikes)}
        sx={{ mr: 1 }}
      />
      <IconButton onClick={handleToggleComments}>
        <Iconify icon="solar:chat-round-dots-bold" />
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {fShortenNumber(post.comment_count)}
        </Typography>
      </IconButton>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton>
        <Iconify icon="solar:share-bold" />
      </IconButton>
    </Stack>
  );

  const renderCommentList = (
    <Stack spacing={1.5} sx={{ px: 3, pb: 2 }}>
      {isLoadingComments ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        comments.map((comment) => {
          const reactionState = commentReactions[comment.id] || {
            likes: 0,
            dislikes: 0,
            userChoice: null,
          };
          return (
            <Stack key={comment.id} spacing={0.5}>
              <Stack direction="row" spacing={2}>
                <DynamicAvatar
                  avatarKey={comment.author.avatar_key}
                  alt={comment.author.firstname}
                />
                <Paper sx={{ p: 1.5, flexGrow: 1, bgcolor: 'background.neutral' }}>
                  <Stack sx={{ mb: 0.5 }} direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2">{`${comment.author.firstname} ${comment.author.surname}`}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {fDate(new Date())}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {comment.comment}
                  </Typography>
                </Paper>
              </Stack>
              <Stack direction="row" alignItems="center" sx={{ pl: '56px' }}>
                <IconButton size="small" onClick={() => handleCommentReaction(comment.id, 'like')}>
                  <Iconify
                    icon="solar:heart-bold"
                    color={reactionState.userChoice === 'like' ? 'error.main' : 'text.disabled'}
                  />
                </IconButton>
                <Typography variant="caption">{fShortenNumber(reactionState.likes)}</Typography>
                <IconButton
                  size="small"
                  sx={{ ml: 1 }}
                  onClick={() => handleCommentReaction(comment.id, 'dislike')}
                >
                  <Iconify
                    icon="solar:dislike-bold"
                    color={
                      reactionState.userChoice === 'dislike' ? 'primary.main' : 'text.disabled'
                    }
                  />
                </IconButton>
                <Typography variant="caption">{fShortenNumber(reactionState.dislikes)}</Typography>
              </Stack>
            </Stack>
          );
        })
      )}
    </Stack>
  );

  const renderInput = (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      sx={{ p: (theme) => theme.spacing(0, 3, 2, 3) }}
    >
      <DynamicAvatar avatarKey={post.author.avatar_key} alt={authorName} />
      <InputBase
        fullWidth
        value={newComment}
        inputRef={commentRef}
        placeholder="Напишите комментарий..."
        onChange={(e) => setNewComment(e.target.value)}
        endAdornment={
          <InputAdornment position="end" sx={{ mr: 1 }}>
            <IconButton size="small" onClick={handlePostComment} disabled={!newComment.trim()}>
              <Iconify icon="solar:arrow-right-bold" />
            </IconButton>
          </InputAdornment>
        }
        sx={{
          pl: 1.5,
          height: 40,
          borderRadius: 1,
          border: (theme) => `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
        }}
      />
    </Stack>
  );

  return (
    <Card>
      {renderHead}
      {renderBody}
      {!!post.medias.length && renderMedia}
      {renderActions}
      {showComments && (
        <>
          {renderCommentList}
          {renderInput}
        </>
      )}
    </Card>
  );
}
