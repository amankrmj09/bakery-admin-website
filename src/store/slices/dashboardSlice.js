import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (timeframe = '1m', { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users/admin/dashboard-stats', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard statistics');
    }
  }
);

export const fetchStoreSettings = createAsyncThunk(
  'dashboard/fetchStoreSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/store/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch store settings');
    }
  }
);

export const updateStoreSettings = createAsyncThunk(
  'dashboard/updateStoreSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/store/settings', data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update store settings');
    }
  }
);

export const fetchSiteConfig = createAsyncThunk(
  'dashboard/fetchSiteConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/site-config/frontpage');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch site config');
    }
  }
);

export const updateSiteConfig = createAsyncThunk(
  'dashboard/updateSiteConfig',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/site-config/frontpage', data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update site config');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'dashboard/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'dashboard/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Update Order Status Error:", error);
      return rejectWithValue('Failed to update order status');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'dashboard/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/cancel`, { reason: reason || 'Declined by admin' });
      return response.data;
    } catch (error) {
      console.error("Cancel Order Error:", error);
      return rejectWithValue('Failed to cancel order');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'dashboard/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users/admin/all');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'dashboard/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      await api.put(`/api/users/admin/${userId}/role`, { role });
      return { id: userId, role };
    } catch (error) {
      return rejectWithValue('Failed to update user role');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'dashboard/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      await api.put(`/api/users/admin/${userId}/status`, { status });
      return { id: userId, status };
    } catch (error) {
      return rejectWithValue('Failed to update user status');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'dashboard/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/products');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'dashboard/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/products', productData);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'dashboard/updateProduct',
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/products/${productId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'dashboard/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/products/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue('Failed to delete product');
    }
  }
);

export const fetchInventory = createAsyncThunk(
  'dashboard/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/inventory');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch inventory');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'dashboard/updateInventory',
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/inventory/product/${productId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update inventory');
    }
  }
);

export const addStock = createAsyncThunk(
  'dashboard/addStock',
  async ({ productId, quantity, notes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/inventory/product/${productId}/add-stock`, { quantity, notes });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to add stock');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'dashboard/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'dashboard/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'dashboard/updateCategory',
  async ({ categoryId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/categories/${categoryId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'dashboard/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/categories/${categoryId}`);
      return categoryId;
    } catch (error) {
      return rejectWithValue('Failed to delete category');
    }
  }
);

const initialState = {
  theme: localStorage.getItem('theme') || 'system',
  settings: {
    data: null,
    loading: false,
    error: null,
  },
  siteConfig: {
    data: null,
    loading: false,
    error: null,
  },
  stats: {
    loading: false,
    error: null,
    users: 0,
    orders: 0,
    payments: { currentMonth: 0, lastMonth: 0 }
  },
  orders: {
    data: [],
    loading: false,
    error: null,
    totalCount: 0,
    page: 1,
  },
  users: {
    data: [],
    loading: false,
    error: null,
  },
  categories: {
    data: [],
    loading: false,
    error: null,
  },
  products: {
    data: [],
    loading: false,
    error: null,
  },
  inventory: {
    data: [],
    loading: false,
    error: null,
  }
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => { state.stats.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = {
          ...state.stats,
          ...action.payload,
          loading: false
        };
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      })
      
      // Orders
      .addCase(fetchOrders.pending, (state) => { state.orders.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders.loading = false;
        state.orders.data = action.payload.content || action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.data.findIndex(o => o.id === action.payload.id);
        if (index !== -1) { state.orders.data[index] = action.payload; }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.data.findIndex(o => o.id === action.payload.id);
        if (index !== -1) { state.orders.data[index] = action.payload; }
      })
      
      // Users
      .addCase(fetchUsers.pending, (state) => { state.users.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.data = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const user = state.users.data.find(u => u.id === action.payload.id);
        if (user) user.role = action.payload.role;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const user = state.users.data.find(u => u.id === action.payload.id);
        if (user) user.status = action.payload.status;
      })

      // Products
      .addCase(fetchProducts.pending, (state) => { state.products.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products.loading = false;
        state.products.data = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.data.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.data.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products.data[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products.data = state.products.data.filter(p => p.id !== action.payload);
      })

      // Categories
      .addCase(fetchCategories.pending, (state) => { state.categories.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.data = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.data.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.data.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories.data[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories.data = state.categories.data.filter(c => c.id !== action.payload);
      })

      // Inventory
      .addCase(fetchInventory.pending, (state) => { state.inventory.loading = true; })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventory.loading = false;
        state.inventory.data = action.payload || [];
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.inventory.loading = false;
        state.inventory.error = action.payload;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        const index = state.inventory.data.findIndex(i => i.productId === action.payload.productId);
        if (index !== -1) {
          state.inventory.data[index] = action.payload;
        }
      })
      .addCase(addStock.fulfilled, (state, action) => {
        const index = state.inventory.data.findIndex(i => i.productId === action.payload.productId);
        if (index !== -1) {
          state.inventory.data[index] = action.payload;
        }
      })
      // Store Settings
      .addCase(fetchStoreSettings.pending, (state) => { state.settings.loading = true; })
      .addCase(fetchStoreSettings.fulfilled, (state, action) => {
        state.settings.loading = false;
        state.settings.data = action.payload;
      })
      .addCase(fetchStoreSettings.rejected, (state, action) => {
        state.settings.loading = false;
        state.settings.error = action.payload;
      })
      .addCase(updateStoreSettings.fulfilled, (state, action) => {
        state.settings.data = action.payload;
      })
      // Site Config
      .addCase(fetchSiteConfig.pending, (state) => { state.siteConfig.loading = true; })
      .addCase(fetchSiteConfig.fulfilled, (state, action) => {
        state.siteConfig.loading = false;
        state.siteConfig.data = action.payload;
      })
      .addCase(fetchSiteConfig.rejected, (state, action) => {
        state.siteConfig.loading = false;
        state.siteConfig.error = action.payload;
      })
      .addCase(updateSiteConfig.fulfilled, (state, action) => {
        state.siteConfig.data = action.payload;
      });
  },
});

export const { setTheme } = dashboardSlice.actions;
export default dashboardSlice.reducer;
