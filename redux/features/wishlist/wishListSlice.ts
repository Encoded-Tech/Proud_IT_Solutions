"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { WishlistItemDTO } from "@/lib/server/mappers/MapWishlist";


export interface WishlistState {
  items: WishlistItemDTO[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    /** Replace entire wishlist (e.g., after fetch) */
    setWishlist(state, action: PayloadAction<WishlistItemDTO[]>) {
      state.items = action.payload;
    },

    /** Add or update single wishlist item (replace whole array after server add) */
    addWishlistItem(state, action: PayloadAction<WishlistItemDTO[]>) {
      state.items = action.payload;
    },

    /** Remove item locally (after server delete) */
    removeWishlistItem(state, action: PayloadAction<WishlistItemDTO[]>) {
      state.items = action.payload;
    },

    
    
       /** Optimistic remove */
    removeWishlistItemLocal(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item._id !== action.payload);
    },

    /** Clear wishlist completely */
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { setWishlist, addWishlistItem, removeWishlistItem, removeWishlistItemLocal, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;

/** Selectors */
export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistCount = (state: RootState) => state.wishlist.items.length;
