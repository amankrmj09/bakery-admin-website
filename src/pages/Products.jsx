import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, createProduct, updateProduct, deleteProduct } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Plus, Upload, X, Star, Trash2, Package, Loader2, Save } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { ProductMediaUploader } from '../components/shared/ProductMediaUploader';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';

const getImageUrl = (url) => url?.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')}${url}` : url;

export default function Products() {
  const dispatch = useDispatch();
  const { data: products, totalElements, loading } = useSelector((state) => state.dashboard.products);
  const { data: categories } = useSelector((state) => state.dashboard.categories);
  const isScrolled = useScrollTop();
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    dispatch(fetchProducts({ page, size: ITEMS_PER_PAGE }));
    dispatch(fetchCategories());
  }, [dispatch, page]);
  
  const totalPages = Math.ceil((totalElements || products?.length || 0) / ITEMS_PER_PAGE);
  const paginatedProducts = products || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingScreenshots, setPendingScreenshots] = useState([]);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [form, setForm] = useState({ sku: '', name: '', categoryId: '', price: '', status: 'ACTIVE', mediaUrls: [], videoUrl: '' });

  const combinedScreenshots = [
    ...(form.mediaUrls || []).map((url, i) => ({ type: 'existing', url: getImageUrl(url), index: i })),
    ...pendingScreenshots.map((p, i) => ({ type: 'pending', url: p.previewUrl, index: (form.mediaUrls?.length || 0) + i }))
  ];
  const handleAddClick = () => {
    setEditingProduct(null);
    setPendingScreenshots([]);
    setPendingVideo(null);
    setThumbnailIndex(0);
    setForm({ sku: '', name: '', categoryId: categories[0]?.id || '', price: '', status: 'ACTIVE', mediaUrls: [], videoUrl: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setPendingScreenshots([]);
    setPendingVideo(null);
    
    const mediaUrls = product.mediaUrls || [];
    const thumbIdx = product.primaryImageUrl ? mediaUrls.indexOf(product.primaryImageUrl) : 0;
    setThumbnailIndex(thumbIdx >= 0 ? thumbIdx : 0);

    setForm({ 
      sku: product.sku, 
      name: product.name, 
      categoryId: product.category?.id || '', 
      price: product.price, 
      status: product.status,
      mediaUrls: mediaUrls,
      videoUrl: product.videoUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleScreenshotSelect = (e) => {
    const files = Array.from(e.target.files);
    const newPending = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setPendingScreenshots(prev => [...prev, ...newPending]);
    e.target.value = ''; 
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (pendingVideo) URL.revokeObjectURL(pendingVideo.previewUrl);
      setPendingVideo({ file, previewUrl: URL.createObjectURL(file) });
      setForm(prev => ({ ...prev, videoUrl: '' }));
    }
    e.target.value = '';
  };

  const removeExistingScreenshot = (idx) => {
    const current = form.mediaUrls || [];
    const updated = current.filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, mediaUrls: updated }));
    if (thumbnailIndex === idx) setThumbnailIndex(0);
    else if (thumbnailIndex > idx) setThumbnailIndex(thumbnailIndex - 1);
  };

  const removePendingScreenshot = (idx) => {
    URL.revokeObjectURL(pendingScreenshots[idx].previewUrl);
    setPendingScreenshots(prev => prev.filter((_, i) => i !== idx));
    const realIdx = (form.mediaUrls?.length || 0) + idx;
    if (thumbnailIndex === realIdx) setThumbnailIndex(0);
    else if (thumbnailIndex > realIdx) setThumbnailIndex(thumbnailIndex - 1);
  };

  const removeVideo = () => {
    if (pendingVideo) {
      URL.revokeObjectURL(pendingVideo.previewUrl);
      setPendingVideo(null);
    }
    setForm(prev => ({ ...prev, videoUrl: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let uploadedUrls = [];
      let finalVideoUrl = form.videoUrl;
      
      if (pendingScreenshots.length > 0 || pendingVideo) {
        setIsUploading(true);
        const formData = new FormData();
        pendingScreenshots.forEach(pf => formData.append('media', pf.file));
        if (pendingVideo) formData.append('video', pendingVideo.file);

        const response = await api.post('/api/uploads/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        uploadedUrls = response.data.urls || [];
        if (response.data.videoUrl) finalVideoUrl = response.data.videoUrl;
        
        setIsUploading(false);
      }

      const finalMediaUrls = [...(form.mediaUrls || []), ...uploadedUrls];
      const finalPrimaryUrl = finalMediaUrls[thumbnailIndex] || finalMediaUrls[0] || '';

      const payload = { 
        ...form, 
        price: parseFloat(form.price),
        mediaUrls: finalMediaUrls,
        primaryImageUrl: finalPrimaryUrl,
        videoUrl: finalVideoUrl
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
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      
      {/* Sticky Header */}
      <div className={cn(
        "sticky top-0 z-30 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <Package className="text-[var(--color-primary)] h-6 w-6" />
            Product Catalog
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Manage your bakery's product offerings and pricing.</p>
        </div>
        <div className="min-w-[150px] flex sm:justify-end">
          <ActionButton 
            text="Add Product"
            onClick={handleAddClick} 
            icon={Plus}
            className="px-6 h-[42px]"
          />
        </div>
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
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
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
        {/* Pagination Controls */}
        {products?.length > ITEMS_PER_PAGE && (
          <div className="flex justify-between items-center p-4 border-t border-[var(--border-color)]/50 bg-[var(--bg-panel-hover)]/30">
            <span className="text-sm text-[var(--text-muted)]">
              Showing Page <span className="font-medium text-[var(--text-main)]">{page + 1}</span> of <span className="font-medium text-[var(--text-main)]">{totalPages || 1}</span>
            </span>
            <div className="flex gap-2">
              <button 
                type="button"
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                type="button"
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title={editingProduct ? "Edit Product" : "Add Product"} maxWidth="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">SKU</label>
              <input type="text" required className="w-full text-sm p-3 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] transition-colors mt-1.5" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} disabled={isSaving || editingProduct} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">Price</label>
              <input type="number" step="0.01" required className="w-full text-sm p-3 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] transition-colors mt-1.5" value={form.price} onChange={e => setForm({...form, price: e.target.value})} disabled={isSaving} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">Name</label>
            <input type="text" required className="w-full text-sm p-3 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] transition-colors mt-1.5" value={form.name} onChange={e => setForm({...form, name: e.target.value})} disabled={isSaving} />
          </div>

          <ProductMediaUploader
            thumbnailIndex={thumbnailIndex}
            setThumbnailIndex={setThumbnailIndex}
            hasVideo={!!pendingVideo || !!form.videoUrl}
            pendingVideo={pendingVideo}
            existingVideoUrl={form.videoUrl}
            handleVideoSelect={handleVideoSelect}
            removeVideo={removeVideo}
            combinedScreenshots={combinedScreenshots}
            existingScreenshotsLength={form.mediaUrls?.length || 0}
            pendingScreenshots={pendingScreenshots}
            removeExistingScreenshot={removeExistingScreenshot}
            removePendingScreenshot={removePendingScreenshot}
            handleScreenshotSelect={handleScreenshotSelect}
          />

          <div className="pt-4 flex justify-between items-center border-t border-border mt-6">
            {editingProduct ? (
              <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(editingProduct.id)} disabled={isSaving}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div />}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
              <ActionButton 
                type="submit" 
                text={isSaving ? 'Saving...' : 'Save Product'}
                disabled={isSaving}
                icon={isSaving ? Loader2 : Save}
                className="px-4 h-10"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

