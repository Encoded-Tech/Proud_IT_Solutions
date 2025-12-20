import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types/product";
import { RootState } from "@/redux/store";

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Replace entire cart with server data */
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },

    /** Optional optimistic quantity update */
    updateCartItem(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const item = state.items.find(i => i._id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    /** Optional optimistic remove */
    removeCartItemLocal(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i._id !== action.payload);
    },

    /** Clear cart completely */
    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  setCart,
  updateCartItem,
  removeCartItemLocal,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const getCartItemUnitPrice = (item: CartItem): number =>
  item.variant?.price ?? item.product.price;

/** Selectors */
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCount = (state: RootState) => state.cart.items.length;
export const selectCartTotalItems = (state: RootState) => state.cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
export const selectCartTotalAmount = (state: RootState) =>state.cart.items.reduce( (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0);

