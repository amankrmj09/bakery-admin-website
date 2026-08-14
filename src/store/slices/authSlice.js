import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const loginAdmin = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/admin/login', credentials);
      // Backend now returns LoginInitResponse (requiresOtp)
      // So no need to check role here as backend handles it during verification
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const verifyAdminLogin = createAsyncThunk(
  'auth/verifyLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/admin/login/verify', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP Verification failed');
    }
  }
);

export const resendLoginOtp = createAsyncThunk(
  'auth/resendLoginOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/login/resend', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

const initialState = {
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  isOtpPending: false,
  pendingEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isOtpPending = false;
      state.pendingEmail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOtpState: (state) => {
      state.isOtpPending = false;
      state.pendingEmail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loginAdmin
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.requiresOtp) {
          state.isOtpPending = true;
          // We will store the email/username used for login in pendingEmail (handled by component usually, or passed here. 
          // Let's store it from the action meta if needed, but since it returns just requireOtp, the component can handle it.
        } else {
          // If 2FA is somehow bypassed (e.g. dev)
          state.isAuthenticated = true;
          state.token = action.payload.authResponse.access_token;
          state.user = action.payload.authResponse.user;
          localStorage.setItem('token', action.payload.authResponse.access_token);
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // verifyAdminLogin
      .addCase(verifyAdminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAdminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isOtpPending = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.access_token);
      })
      .addCase(verifyAdminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // resendLoginOtp
      .addCase(resendLoginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendLoginOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchCurrentUser
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError, clearOtpState } = authSlice.actions;
export default authSlice.reducer;
