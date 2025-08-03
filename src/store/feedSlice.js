// A helper function to simulate API calls
const simulateApiCall = (data, delay = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// --- Mock Initial Data ---
const mockPosts = [
  {
    id: 'post-1',
    content: 'Just set up my Zustand store! It feels so lightweight. 🚀',
    author: { id: 'user-456', username: 'alice', profileImageUrl: 'https://i.pravatar.cc/150?u=alice' },
    likes: [], // Will store user objects of who liked it
    comments: [],
    viewedBy: [], // Will store user objects of who viewed it
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-2',
    content: 'Thinking about what to build next with React...',
    author: { id: 'user-789', username: 'bob', profileImageUrl: 'https://i.pravatar.cc/150?u=bob' },
    likes: [],
    comments: [],
    viewedBy: [],
    createdAt: new Date().toISOString(),
  },
];

export const createFeedSlice = (set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  /**
   * Fetches the initial news feed.
   */
  fetchFeed: async () => {
    set({ isLoading: true, error: null });
    const response = await simulateApiCall(mockPosts);
    set({ posts: response, isLoading: false });
  },

  /**
   * Adds the current user to a post's 'viewedBy' list.
   * @param {string} postId - The ID of the post being viewed.
   */
  viewPost: (postId) => {
    const currentUser = get().user;
    if (!currentUser) return; // Must be logged in to track view

    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          // Avoid adding duplicate views
          const alreadyViewed = post.viewedBy.some(user => user.id === currentUser.id);
          if (!alreadyViewed) {
            return { ...post, viewedBy: [...post.viewedBy, currentUser] };
          }
        }
        return post;
      }),
    }));
  },

  /**
   * Likes a post as the current user.
   * @param {string} postId - The ID of the post to like.
   */
  likePost: (postId) => {
    const currentUser = get().user;
    if (!currentUser) return; // Must be logged in to like

    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          // Avoid duplicate likes
          const alreadyLiked = post.likes.some(user => user.id === currentUser.id);
          if (!alreadyLiked) {
            return { ...post, likes: [...post.likes, currentUser] };
          }
        }
        return post;
      }),
    }));
  },

  /**
   * Unlikes a post as the current user.
   * @param {string} postId - The ID of the post to unlike.
   */
  unlikePost: (postId) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes.filter((user) => user.id !== currentUser.id),
          };
        }
        return post;
      }),
    }));
  },

  /**
   * Adds a comment to a post.
   * @param {string} postId - The ID of the post to comment on.
   * @param {string} text - The content of the comment.
   */
  addComment: (postId, text) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      text,
      author: currentUser,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ),
    }));
  },
});
