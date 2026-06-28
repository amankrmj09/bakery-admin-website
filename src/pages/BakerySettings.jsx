import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts, fetchCategories, fetchInventory,
  createCategory, updateCategory, deleteCategory,
  createProduct, updateProduct, deleteProduct,
  updateInventory, addStock,
  setTheme, fetchStoreSettings, updateStoreSettings
} from '../store/slices/dashboardSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Plus, Upload, X, Star, Trash2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import api from '../api/axiosConfig';

const getImageUrl = (url) => url?.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')}${url}` : url;

function CategoryManager() {
  const dispatch = useDispatch();
  const { data: categories, loading } = useSelector((state) => state.dashboard.categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', displayOrder: 0, active: true, mediaUrls: [] });

  const handleAddClick = () => {
    setEditingCategory(null);
    setPendingFiles([]);
    setForm({ name: '', description: '', displayOrder: 0, active: true, mediaUrls: [] });
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setPendingFiles([]);
    setForm({ 
      name: category.name, 
      description: category.description || '', 
      displayOrder: category.displayOrder || 0, 
      active: category.active !== false,
      mediaUrls: category.mediaUrls || []
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newPending = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    
    setPendingFiles(prev => [...prev, ...newPending]);
    e.target.value = ''; // Reset input
  };

  const handleRemoveMedia = (url) => {
    setForm(prev => ({
      ...prev,
      mediaUrls: (prev.mediaUrls || []).filter(u => u !== url)
    }));
  };

  const handleRemovePendingMedia = (previewUrl) => {
    setPendingFiles(prev => prev.filter(p => p.previewUrl !== previewUrl));
    URL.revokeObjectURL(previewUrl);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let uploadedUrls = [];
      if (pendingFiles.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        pendingFiles.forEach(pf => formData.append('media', pf.file));
        const response = await api.post('/api/uploads/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls = response.data.urls || [];
        setIsUploading(false);
      }
      
      const payload = { ...form, mediaUrls: [...(form.mediaUrls || []), ...uploadedUrls] };

      if (editingCategory) {
        await dispatch(updateCategory({ categoryId: editingCategory.id, data: payload })).unwrap();
        toast.success('Category updated successfully');
      } else {
        await dispatch(createCategory(payload)).unwrap();
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
    } catch (error) { 
      console.error('Failed to save category', error); 
      toast.error('Failed to save category');
      setIsUploading(false);
    } finally { setIsSaving(false); }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      await api.post(`/api/categories/${categoryId}/toggle-status`);
      dispatch(fetchCategories());
    } catch (error) { console.error('Failed to toggle', error); }
  };

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All associated products may be deleted as well.')) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        toast.success('Category deleted successfully');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to delete category', error);
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Categories</h3>
        <Button onClick={handleAddClick} size="sm"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && categories.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading categories...</TableCell></TableRow>
              ) : categories.length > 0 ? (
                categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground">{c.displayOrder}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.productCount || 0}</TableCell>
                    <TableCell><Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(c.id)}>Toggle</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(c)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No categories found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title={editingCategory ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input type="text" required className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} disabled={isSaving} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Media / Images</label>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'border-border bg-background'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max multiple)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading || isSaving} />
                </label>
              </div>
              
              {((form.mediaUrls && form.mediaUrls.length > 0) || pendingFiles.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {form.mediaUrls?.map((url, idx) => (
                    <div key={`remote-${idx}`} className="relative group aspect-square rounded-lg border border-border overflow-hidden">
                      <img src={getImageUrl(url)} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMedia(url)}
                          className="self-end bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingFiles.map((pf, idx) => (
                    <div key={`pending-${idx}`} className="relative group aspect-square rounded-lg border border-border overflow-hidden">
                      <img src={pf.previewUrl} alt={`Pending Preview ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <button 
                          type="button" 
                          onClick={() => handleRemovePendingMedia(pf.previewUrl)}
                          className="self-end bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-border mt-6">
            {editingCategory ? (
              <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(editingCategory.id)} disabled={isSaving}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div />}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Category'}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ProductManager() {
  const dispatch = useDispatch();
  const { data: products, loading } = useSelector((state) => state.dashboard.products);
  const { data: categories } = useSelector((state) => state.dashboard.categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [form, setForm] = useState({ sku: '', name: '', categoryId: '', price: '', status: 'ACTIVE', mediaUrls: [], primaryImageUrl: '' });

  const handleAddClick = () => {
    setEditingProduct(null);
    setPendingFiles([]);
    setForm({ sku: '', name: '', categoryId: categories[0]?.id || '', price: '', status: 'ACTIVE', mediaUrls: [], primaryImageUrl: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setPendingFiles([]);
    setForm({ 
      sku: product.sku, 
      name: product.name, 
      categoryId: product.category?.id || '', 
      price: product.price, 
      status: product.status,
      mediaUrls: product.mediaUrls || [],
      primaryImageUrl: product.primaryImageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newPending = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    
    setPendingFiles(prev => [...prev, ...newPending]);
    if (!form.primaryImageUrl && !form.mediaUrls?.length && newPending.length > 0) {
      setForm(prev => ({ ...prev, primaryImageUrl: newPending[0].previewUrl }));
    }
    e.target.value = ''; // Reset input
  };

  const handleRemoveMedia = (url) => {
    setForm(prev => {
      const updatedUrls = (prev.mediaUrls || []).filter(u => u !== url);
      return {
        ...prev,
        mediaUrls: updatedUrls,
        primaryImageUrl: prev.primaryImageUrl === url ? (updatedUrls[0] || (pendingFiles[0]?.previewUrl) || '') : prev.primaryImageUrl
      };
    });
  };

  const handleRemovePendingMedia = (previewUrl) => {
    setPendingFiles(prev => {
      const updated = prev.filter(p => p.previewUrl !== previewUrl);
      if (form.primaryImageUrl === previewUrl) {
        setForm(f => ({ ...f, primaryImageUrl: f.mediaUrls?.[0] || updated[0]?.previewUrl || '' }));
      }
      return updated;
    });
    URL.revokeObjectURL(previewUrl);
  };

  const handleSetPrimary = (url) => {
    setForm(prev => ({ ...prev, primaryImageUrl: url }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let uploadedUrls = [];
      let finalPrimaryImageUrl = form.primaryImageUrl;
      
      if (pendingFiles.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        pendingFiles.forEach(pf => formData.append('media', pf.file));
        const response = await api.post('/api/uploads/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newUrls = response.data.urls || [];
        uploadedUrls = newUrls;
        
        const primaryIndex = pendingFiles.findIndex(pf => pf.previewUrl === form.primaryImageUrl);
        if (primaryIndex !== -1 && newUrls[primaryIndex]) {
          finalPrimaryImageUrl = newUrls[primaryIndex];
        }
        setIsUploading(false);
      }

      const payload = { 
        ...form, 
        price: parseFloat(form.price),
        mediaUrls: [...(form.mediaUrls || []), ...uploadedUrls],
        primaryImageUrl: finalPrimaryImageUrl || form.mediaUrls?.[0] || uploadedUrls[0] || ''
      };

      if (editingProduct) {
        await dispatch(updateProduct({ productId: editingProduct.id, data: payload })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
    } catch (error) { 
      console.error('Failed to save product', error); 
      toast.error('Failed to save product');
      setIsUploading(false);
    } finally { setIsSaving(false); }
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success('Product deleted successfully');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to delete product', error);
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Products</h3>
        <Button onClick={handleAddClick} size="sm"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading products...</TableCell></TableRow>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>${p.price}</TableCell>
                    <TableCell><Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(p)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title={editingProduct ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium">SKU</label>
              <input type="text" required className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} disabled={isSaving || editingProduct} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Price</label>
              <input type="number" step="0.01" required className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})} disabled={isSaving} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <input type="text" required className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} disabled={isSaving} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Media / Images</label>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'border-border bg-background'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max multiple)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading || isSaving} />
                </label>
              </div>
              
              {((form.mediaUrls && form.mediaUrls.length > 0) || pendingFiles.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {form.mediaUrls?.map((url, idx) => (
                    <div key={`remote-${idx}`} className={`relative group aspect-square rounded-lg border overflow-hidden ${form.primaryImageUrl === url ? 'border-primary-500 ring-2 ring-primary-500' : 'border-border'}`}>
                      <img src={getImageUrl(url)} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMedia(url)}
                          className="self-end bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {form.primaryImageUrl !== url && (
                          <button 
                            type="button" 
                            onClick={() => handleSetPrimary(url)}
                            className="text-xs font-semibold bg-white/90 text-black py-1 px-2 rounded hover:bg-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Star className="w-3 h-3" /> Set Primary
                          </button>
                        )}
                      </div>
                      {form.primaryImageUrl === url && (
                        <div className="absolute bottom-0 inset-x-0 bg-primary-500 text-white text-[10px] uppercase font-bold text-center py-1">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  {pendingFiles.map((pf, idx) => (
                    <div key={`pending-${idx}`} className={`relative group aspect-square rounded-lg border overflow-hidden ${form.primaryImageUrl === pf.previewUrl ? 'border-primary-500 ring-2 ring-primary-500' : 'border-border'}`}>
                      <img src={pf.previewUrl} alt={`Pending Preview ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <button 
                          type="button" 
                          onClick={() => handleRemovePendingMedia(pf.previewUrl)}
                          className="self-end bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {form.primaryImageUrl !== pf.previewUrl && (
                          <button 
                            type="button" 
                            onClick={() => handleSetPrimary(pf.previewUrl)}
                            className="text-xs font-semibold bg-white/90 text-black py-1 px-2 rounded hover:bg-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Star className="w-3 h-3" /> Set Primary
                          </button>
                        )}
                      </div>
                      {form.primaryImageUrl === pf.previewUrl && (
                        <div className="absolute bottom-0 inset-x-0 bg-primary-500 text-white text-[10px] uppercase font-bold text-center py-1">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-border mt-6">
            {editingProduct ? (
              <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(editingProduct.id)} disabled={isSaving}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div />}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Product'}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InventoryManager() {
  const dispatch = useDispatch();
  const { data: inventory, loading } = useSelector((state) => state.dashboard.inventory);
  
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [stockForm, setStockForm] = useState({ quantity: 1, notes: '' });
  const [rulesForm, setRulesForm] = useState({ minimumStock: 0, reorderLevel: 0, reorderQuantity: 0 });

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const handleAddStockClick = (item) => {
    setSelectedItem(item);
    setStockForm({ quantity: 1, notes: '' });
    setIsStockModalOpen(true);
  };

  const handleEditRulesClick = (item) => {
    setSelectedItem(item);
    setRulesForm({
      minimumStock: item.minimumStock || 0,
      reorderLevel: item.reorderLevel || 0,
      reorderQuantity: item.reorderQuantity || 0
    });
    setIsRulesModalOpen(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(addStock({ productId: selectedItem.productId, ...stockForm })).unwrap();
      setIsStockModalOpen(false);
    } catch (error) { console.error('Failed to add stock', error); } finally { setIsSaving(false); }
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(updateInventory({ 
        productId: selectedItem.productId, 
        data: { currentStock: selectedItem.currentStock, ...rulesForm } 
      })).unwrap();
      setIsRulesModalOpen(false);
    } catch (error) { console.error('Failed to update rules', error); } finally { setIsSaving(false); }
  };

  const getStatusBadge = (status) => {
    if (status === 'IN_STOCK') return 'success';
    if (status === 'LOW_STOCK') return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Inventory Monitor</h3>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && inventory.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading inventory...</TableCell></TableRow>
              ) : inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.productSku}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell><Badge variant={getStatusBadge(item.status)}>{item.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddStockClick(item)}>Add Stock</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditRulesClick(item)}>Rules</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No inventory items found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isStockModalOpen} onClose={() => !isSaving && setIsStockModalOpen(false)} title="Add Stock">
        <form onSubmit={handleSaveStock} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Quantity to Add</label>
            <input type="number" min="1" required className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 1})} disabled={isSaving} />
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Confirm'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isRulesModalOpen} onClose={() => !isSaving && setIsRulesModalOpen(false)} title="Inventory Rules">
        <form onSubmit={handleSaveRules} className="space-y-4 pt-2">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Min Stock</label>
              <input type="number" min="0" required className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={rulesForm.minimumStock} onChange={e => setRulesForm({...rulesForm, minimumStock: parseInt(e.target.value) || 0})} disabled={isSaving} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Reorder Lvl</label>
              <input type="number" min="0" required className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={rulesForm.reorderLevel} onChange={e => setRulesForm({...rulesForm, reorderLevel: parseInt(e.target.value) || 0})} disabled={isSaving} />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsRulesModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Rules'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function GeneralSettingsManager() {
  const dispatch = useDispatch();
  const { theme, settings } = useSelector((state) => state.dashboard);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  useEffect(() => {
    dispatch(fetchStoreSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings.data) {
      setIsAcceptingOrders(settings.data.isAcceptingOrders);
    }
  }, [settings.data]);

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const handleToggleOrders = async () => {
    const newValue = !isAcceptingOrders;
    setIsAcceptingOrders(newValue);
    try {
      await dispatch(updateStoreSettings({
        id: settings.data?.id,
        isAcceptingOrders: newValue
      })).unwrap();
      toast.success(newValue ? 'Store is now accepting orders' : 'Order taking paused');
    } catch (e) {
      toast.error('Failed to update store settings');
      setIsAcceptingOrders(!newValue);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme Preference</label>
              <div className="flex space-x-2 bg-muted p-1 rounded-lg w-fit border border-border">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                      theme === t 
                        ? 'bg-background shadow text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium">Accepting Orders</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Toggle whether customers can place new orders on the bakery frontend.
              </p>
            </div>
            <button
              onClick={handleToggleOrders}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isAcceptingOrders ? 'bg-primary-500' : 'bg-muted-foreground'
              }`}
            >
              <span className="sr-only">Toggle order taking</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAcceptingOrders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BakerySettings() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    // Note: Inventory fetched inside InventoryManager component when active.
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Bakery Settings</h2>
          <p className="text-muted-foreground">Manage your store, products, categories, and inventory.</p>
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {['general', 'products', 'categories', 'inventory'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'general' && <GeneralSettingsManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'inventory' && <InventoryManager />}
      </div>
    </div>
  );
}
