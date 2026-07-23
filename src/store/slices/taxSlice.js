import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchTaxRates = createAsyncThunk(
  'tax/fetchTaxRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/taxes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax rates');
    }
  }
);

export const createTaxRate = createAsyncThunk(
  'tax/createTaxRate',
  async (taxData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products/taxes', taxData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to create tax rate');
    }
  }
);

export const updateTaxRate = createAsyncThunk(
  'tax/updateTaxRate',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/taxes/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to update tax rate');
    }
  }
);

export const deleteTaxRate = createAsyncThunk(
  'tax/deleteTaxRate',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/taxes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tax rate');
    }
  }
);

const initialState = {
  taxRates: [],
  loading: false,
  error: null,
  success: false,
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    clearTaxState: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTaxRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaxRates.fulfilled, (state, action) => {
        state.loading = false;
        state.taxRates = action.payload;
        state.error = null;
      })
      .addCase(fetchTaxRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createTaxRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTaxRate.fulfilled, (state, action) => {
        state.loading = false;
        state.taxRates.push(action.payload);
        state.success = true;
      })
      .addCase(createTaxRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateTaxRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaxRate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.taxRates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.taxRates[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateTaxRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteTaxRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTaxRate.fulfilled, (state, action) => {
        state.loading = false;
        state.taxRates = state.taxRates.filter(t => t.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteTaxRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearTaxState } = taxSlice.actions;
export default taxSlice.reducer;
