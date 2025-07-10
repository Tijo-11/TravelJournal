import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; // Store user details (id, username, email, profile_image, banner_image, is_staff, etc.)
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

/*define state and reducers in authSlice.js.
You import that reducer in store.js and persist it with redux-persist.
set up a Redux store that makes that state available globally.
export both the store and persistor for use in your app entry*/
