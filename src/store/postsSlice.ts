import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Post {
  id: string;
  imageUrl: string;
  username: string;
  likes: string[];
  comments: string[];
}

interface PostsState {
  posts: Post[];
  savePosts: any[];
}

const initialState: PostsState = {
  posts: [],
  savePosts: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    savePosts: (state, action: PayloadAction<any[]>) => {
      state.savePosts = action.payload;
    },
  },
});

export const { setPosts, savePosts } = postsSlice.actions;
export default postsSlice.reducer;
