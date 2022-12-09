import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: { exists: false },
    userData: {},
  },
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload.info;
      state.userData = action.payload.data;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    updateName: (state, action) => {
      state.userData.displayName = action.payload;
    },
    updatePhone: (state, action) => {
      state.userInfo.phone = action.payload;
    },
    updatePhotoURL: (state, action) => {
      state.userData.photoURL = action.payload;
    },
    logoutUser: (state) => {
      state.userInfo = { exists: false };
      state.userData = {};
    },
  },
});

export const {
  setUser,
  setUserData,
  setUserInfo,
  updateName,
  updatePhone,
  updatePhotoURL,
  logoutUser,
} = userSlice.actions;

export default userSlice.reducer;
