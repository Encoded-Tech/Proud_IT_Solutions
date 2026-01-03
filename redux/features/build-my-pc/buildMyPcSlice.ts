// "use client";

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { RootState } from "@/redux/store";




// export interface BuildRequestsState {
//   items: BuildRequestDTO[];
// }

// const initialState: BuildRequestsState = {
//   items: [],
// };

// const buildRequestsSlice = createSlice({
//   name: "buildRequests",
//   initialState,
//   reducers: {
//     /** Replace entire list (after fetch) */
//     setBuildRequests(state, action: PayloadAction<BuildRequestDTO[]>) {
//       state.items = action.payload;
//     },

//     /** Add or update single request */
//     addBuildRequest(state, action: PayloadAction<BuildRequestDTO>) {
//       const index = state.items.findIndex(i => i._id === action.payload._id);
//       if (index !== -1) state.items[index] = action.payload;
//       else state.items.push(action.payload);
//     },

//     /** Remove request by ID */
//     removeBuildRequest(state, action: PayloadAction<string>) {
//       state.items = state.items.filter(i => i._id !== action.payload);
//     },

//     /** Clear all build requests */
//     clearBuildRequests(state) {
//       state.items = [];
//     },
//   },
// });

// export const { setBuildRequests, addBuildRequest, removeBuildRequest, clearBuildRequests } =
//   buildRequestsSlice.actions;

// export default buildRequestsSlice.reducer;

// /** Selectors */
// export const selectBuildRequests = (state: RootState) => state.buildRequests.items;
// export const selectBuildRequestCount = (state: RootState) => state.buildRequests.items.length;
