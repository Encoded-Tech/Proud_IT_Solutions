// redux/features/review/reviewSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReviewType, ReviewState } from "@/types/product";

const initialState: ReviewState = {
  reviews: [],
  totalReviews: 0,
  avgRating: 0,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setReviews: (state, action: PayloadAction<ReviewState>) => {
      state.reviews = action.payload.reviews;
      state.totalReviews = action.payload.totalReviews;
      state.avgRating = action.payload.avgRating;
    },
    addReview: (state, action: PayloadAction<ReviewType>) => {
      state.reviews.push(action.payload);
      state.totalReviews += 1;
      // recalculate avgRating
      state.avgRating =
        state.reviews.reduce((sum, r) => sum + r.rating, 0) /
        state.reviews.length;
    },
    updateReview: (state, action: PayloadAction<ReviewType>) => {
      const index = state.reviews.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
        // recalculate avgRating
        state.avgRating =
          state.reviews.reduce((sum, r) => sum + r.rating, 0) /
          state.reviews.length;
      }
    },
    deleteReview: (state, action: PayloadAction<string>) => {
      state.reviews = state.reviews.filter(r => r.id !== action.payload);
      state.totalReviews = state.reviews.length;
      state.avgRating =
        state.reviews.length > 0
          ? state.reviews.reduce((sum, r) => sum + r.rating, 0) /
            state.reviews.length
          : 0;
    },
    clearReviews: state => {
      state.reviews = [];
      state.totalReviews = 0;
      state.avgRating = 0;
    },
  },
});

export const { setReviews, addReview, updateReview, deleteReview, clearReviews } =
  reviewSlice.actions;

export default reviewSlice.reducer;
