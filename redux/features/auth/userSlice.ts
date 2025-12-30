  import { createSlice, PayloadAction } from "@reduxjs/toolkit";
  import { RootState } from "@/redux/store";

  export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    hashedPassword?: string;
    provider?: "credentials" | "google";
   providerId?: string;
    role: "user" | "admin";
    image?: string;
    emailVerified?: boolean;
    bio?: string;
     hasPassword: boolean;
     address?: Partial<IUserAddressFrontend> | null;
     
  }

  export interface IUserAddressFrontend {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  ward: number;
  street?: string;
  landmark?: string;
  postalCode?: string;
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
}

  export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    hydrated: boolean; 
  }

  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    hydrated: false,
  };

  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      setUser(state, action: PayloadAction<AuthUser>) {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.hydrated = true;
      },
      clearUser(state) {
        state.user = null;
        state.isAuthenticated = false;
        state.hydrated = true;
      },
      markHydrated(state) {
        state.hydrated = true;
      },
    },
  });

  export const { setUser, clearUser, markHydrated } = authSlice.actions;
  export default authSlice.reducer;

  /** Core selectors */
  export const selectAuthState = (state: RootState) => state.auth;
  export const selectUser = (state: RootState) => state.auth.user;
  export const selectIsAuthenticated = (state: RootState) =>
    state.auth.isAuthenticated;
  export const selectAuthHydrated = (state: RootState) =>
    state.auth.hydrated;

  /** Convenience selectors */
  export const selectUserId = (state: RootState) => state.auth.user?.id;
  export const selectUserRole = (state: RootState) => state.auth.user?.role;
  export const selectUserName = (state: RootState) => state.auth.user?.name;
  export const selectUserImage = (state: RootState) => state.auth.user?.image;

  /** Role helpers */
  export const selectIsAdmin = (state: RootState) =>
    state.auth.user?.role === "admin";
