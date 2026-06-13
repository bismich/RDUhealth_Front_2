import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SessionState {
  userId: string | null;
  email: string | null;
  role: "user" | "admin" | null;
  accessToken: string | null;
}

const initialState: SessionState = {
  userId: null,
  email: null,
  role: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<SessionState>) {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.role = action.payload.role;
       state.accessToken = action.payload.accessToken;
    },
    clearSession(state) {
      state.userId = null;
      state.email = null;
      state.role = null;
      state.accessToken = null;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
