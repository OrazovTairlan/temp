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
import { CircularProgress, Menu, MenuItem } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';






































































































































































































































































import {useTranslation} from "react-i18next";
import {translation} from "src/translation.js";
// Assuming axios is configured elsewhere and imported
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';

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
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMediaUrl = async () => {
      if (!media.key) {
        setError(translation[i18n.language].error);
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
        setError(translation[i18n.language].error);
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

// --- CommentItem Component with Delete Functionality ---
const CommentItem = ({ comment, onCommentDelete, onUserClick }) => {
  const { user } = useAppStore();









































































































































  const {i18n} = useTranslation();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [commentReactions, setCommentReactions] = useState({
    likes: comment.like_count || 0,
    dislikes: comment.dislike_count || 0,
    userChoice: null,
  });

  const isAuthor = user?.id === comment.author.id;
  const authorName = `${comment.author.firstname} ${comment.author.surname}`;

  const handleOpenMenu = (event) => setMenuAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchorEl(null);

  const handleDeleteComment = async () => {
    handleCloseMenu();
    try {
      await axiosCopy.delete(`/comment/${comment.id}`);
      if (onCommentDelete) {
        onCommentDelete(comment.id);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleCommentReaction = async (reactionType) => {
    const originalState = { ...commentReactions };
    setCommentReactions((prev) => {
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
      setCommentReactions(originalState);
    }
  };

  return (
    <Stack key={comment.id} spacing={0.5}>
      <Stack direction="row" spacing={2}>
        <Link onClick={() => onUserClick(comment.author.login)} sx={{ cursor: 'pointer' }}>
          <DynamicAvatar avatarKey={comment.author.avatar_key} alt={authorName} />
        </Link>
        <Paper sx={{ p: 1.5, flexGrow: 1, bgcolor: 'background.neutral' }}>
          <Stack sx={{ mb: 0.5 }} direction="row" justifyContent="space-between">
            <Link
              color="inherit"
              variant="subtitle2"
              onClick={() => onUserClick(comment.author.login)}
              sx={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              {authorName}
            </Link>
            <Stack direction="row" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.disabled', mr: 1 }}>
                {fDate(comment.created_at)}
              </Typography>
              {isAuthor && (
                <>
                  <IconButton size="small" onClick={handleOpenMenu}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={handleDeleteComment} sx={{ color: 'error.main' }}>
                      <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                      {translation[i18n.language].deleteComment}
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Stack>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {comment.comment}
          </Typography>
        </Paper>
      </Stack>
      <Stack direction="row" alignItems="center" sx={{ pl: '56px' }}>
        <IconButton size="small" onClick={() => handleCommentReaction('like')}>
          <Iconify
            icon="solar:heart-bold"
            color={commentReactions.userChoice === 'like' ? 'error.main' : 'text.disabled'}
          />
        </IconButton>
        <Typography variant="caption">{fShortenNumber(commentReactions.likes)}</Typography>
        <IconButton size="small" sx={{ ml: 1 }} onClick={() => handleCommentReaction('dislike')}>
          <Iconify
            icon="solar:dislike-bold"
            color={commentReactions.userChoice === 'dislike' ? 'primary.main' : 'text.disabled'}
          />
        </IconButton>
        <Typography variant="caption">{fShortenNumber(commentReactions.dislikes)}</Typography>
      </Stack>
    </Stack>
  );
};

export function ProfilePostItem({ post, onDelete }) {
  const router = useRouter();
  const { i18n } = useTranslation();

  const commentRef = useRef(null);

  // --- State Management ---
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [postReaction, setPostReaction] = useState({
    likes: post.like_count || 0,
    dislikes: post.dislike_count || 0,
    userChoice: null,
  });

  const authorName = `${post.author.firstname} ${post.author.surname}`;

  const { user } = useAppStore();

  const isAuthor = user?.id === post.author.id;

  // --- Data Fetching and Side Effects ---
  const fetchComments = useCallback(
    async (force = false) => {
      if (!force && commentCount === 0 && comments.length === 0) return;

      setIsLoadingComments(true);
      try {
        const response = await axiosCopy.get(`/post/{id}/comments`, {
          params: {
            post_id: post.id,
          },
        });
        setComments(response.data);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    },
    [post.id, commentCount, comments.length]
  );

  useEffect(() => {
    if (showComments && comments.length === 0 && commentCount > 0) {
      fetchComments();
    }
  }, [showComments, comments.length, fetchComments, commentCount]);

  // --- Event Handlers ---
  const handleUserClick = (userId) => {
    router.push(`/dashboard/user/${userId}`);
  };

  const handleOpenMenu = (event) => setMenuAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchorEl(null);

  const handleDeletePost = async () => {
    handleCloseMenu();
    try {
      await axiosCopy.delete(`/post/${post.id}`);
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleCommentDelete = (commentId) => {
    setComments((currentComments) => currentComments.filter((c) => c.id !== commentId));
    setCommentCount((prev) => prev - 1);
  };

  const handleToggleComments = useCallback(() => setShowComments((prev) => !prev), []);

  const handlePostComment = useCallback(async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    try {
      await axiosCopy.post(`/post/${post.id}/comment`, { comment: trimmedComment });
      setNewComment('');
      setCommentCount((prevCount) => prevCount + 1);
      fetchComments(true);
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

  // --- Render Functions ---
  const renderHead = (
    <CardHeader
      disableTypography
      avatar={
        <Link onClick={() => handleUserClick(post.author.login)} sx={{ cursor: 'pointer' }}>
          <DynamicAvatar avatarKey={post.author.avatar_key} alt={authorName} />
        </Link>
      }
      title={
        <Link
          color="inherit"
          variant="subtitle1"
          onClick={() => handleUserClick(post.author.login)}
          sx={{ cursor: 'pointer' }}
        >
          {authorName}
        </Link>
      }
      subheader={
        <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
          {fDate(post.created_at)}
        </Box>
      }
      action={
        <>
          {isAuthor ? (
            <>
              <IconButton onClick={handleOpenMenu}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
                  <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                  {translation[i18n.language].deletePost}
                </MenuItem>
              </Menu>
            </>
          ) : null}
        </>
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
          {fShortenNumber(commentCount)}
        </Typography>
      </IconButton>
      <Box sx={{ flexGrow: 1 }} />
    </Stack>
  );

  const renderCommentList = (
    <Stack spacing={1.5} sx={{ px: 3, pb: 2 }}>
      {isLoadingComments ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onCommentDelete={handleCommentDelete}
            onUserClick={handleUserClick}
          />
        ))
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
        placeholder={translation[i18n.language].writeComment}
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
