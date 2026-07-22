import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct, deleteProduct } from '../store/slices/dashboardSlice';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Trash2, Loader2, Save, Package } from 'lucide-react';
import { ProductMediaUploader } from '../components/shared/ProductMediaUploader';
import CategoryDropdown from '../components/shared/CategoryDropdown';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const getImageUrl = (url) => url?.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')}${url}` : url;

const initialFormState = {
  sku: '', name: '', categoryId: '', price: '', discountPrice: '', costPrice: '', taxClass: 'STANDARD', 
  status: 'ACTIVE', isFeatured: false, description: '', shortDescription: '',
  initialStock: 0, minimumStock: 0, reorderLevel: 0, maxOrderQuantity: '',
  unit: 'piece', weightGrams: '', caloriesPerUnit: '', preparationTimeMinutes: '', shelfLifeHours: '',
  ingredients: '', allergens: '', tags: '', metaTitle: '', metaDescription: '',
  mediaUrls: [], videoUrl: ''
};

export default function ProductDetails({ product, categories, onClose }) {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();
  const isEditing = !!product;

  const [form, setForm] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingScreenshots, setPendingScreenshots] = useState([]);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  useEffect(() => {
    if (isEditing && product) {
      const mediaUrls = product.mediaUrls || [];
      const thumbIdx = product.primaryImageUrl ? mediaUrls.indexOf(product.primaryImageUrl) : 0;
      setThumbnailIndex(thumbIdx >= 0 ? thumbIdx : 0);
      
      setForm({
        sku: product.sku || '', 
        name: product.name || '', 
        categoryId: product.category?.id || '', 
        price: product.price || '', 
        discountPrice: product.discountPrice || '',
        costPrice: product.costPrice || '',
        taxClass: product.taxClass || 'STANDARD',
        status: product.status || 'ACTIVE',
        isFeatured: product.isFeatured || false,
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        initialStock: product.inventory?.currentStock || 0,
        minimumStock: 0,
        reorderLevel: 0,
        maxOrderQuantity: product.maxOrderQuantity || '',
        unit: product.unit || 'piece',
        weightGrams: product.weightGrams || '',
        caloriesPerUnit: product.caloriesPerUnit || '',
        preparationTimeMinutes: product.preparationTimeMinutes || '',
        shelfLifeHours: product.shelfLifeHours || '',
        ingredients: (product.ingredients || []).join(', '),
        allergens: (product.allergens || []).join(', '),
        tags: (product.tags || []).join(', '),
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        mediaUrls: mediaUrls,
        videoUrl: product.videoUrl || ''
      });
    } else {
      setForm({ ...initialFormState, categoryId: categories?.[0]?.id || '' });
    }
  }, [product, isEditing, categories]);

  const combinedScreenshots = [
    ...(form.mediaUrls || []).map((url, i) => ({ type: 'existing', url: getImageUrl(url), index: i })),
    ...pendingScreenshots.map((p, i) => ({ type: 'pending', url: p.previewUrl, index: (form.mediaUrls?.length || 0) + i }))
  ];

  const handleScreenshotSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid format for ${file.name}. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`File ${file.name} exceeds 5MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    const newPending = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setPendingScreenshots(prev => [...prev, ...newPending]);
    e.target.value = ''; 
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'video/mp4') {
        toast.error(`Invalid format for ${file.name}. Only MP4 videos are allowed.`);
        e.target.value = '';
        return;
      }
      const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(`Video ${file.name} exceeds 50MB limit.`);
        e.target.value = '';
        return;
      }
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

      const parseArray = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

      const payload = { 
        ...form, 
        price: parseFloat(form.price) || 0,
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        weightGrams: form.weightGrams ? parseInt(form.weightGrams) : null,
        caloriesPerUnit: form.caloriesPerUnit ? parseInt(form.caloriesPerUnit) : null,
        preparationTimeMinutes: form.preparationTimeMinutes ? parseInt(form.preparationTimeMinutes) : null,
        shelfLifeHours: form.shelfLifeHours ? parseInt(form.shelfLifeHours) : null,
        maxOrderQuantity: form.maxOrderQuantity ? parseInt(form.maxOrderQuantity) : null,
        initialStock: parseInt(form.initialStock) || 0,
        minimumStock: parseInt(form.minimumStock) || 0,
        reorderLevel: parseInt(form.reorderLevel) || 0,
        ingredients: parseArray(form.ingredients),
        allergens: parseArray(form.allergens),
        tags: parseArray(form.tags),
        mediaUrls: finalMediaUrls,
        primaryImageUrl: finalPrimaryUrl,
        videoUrl: finalVideoUrl
      };

      if (isEditing) {
        await dispatch(updateProduct({ productId: product.id, data: payload })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success('Product created successfully');
      }
      onClose();
    } catch (error) { 
      console.error('Failed to save product', error); 
      toast.error('Failed to save product');
      setIsUploading(false);
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(product.id)).unwrap();
        toast.success('Product deleted successfully');
        onClose();
      } catch (error) {
        console.error('Failed to delete product', error);
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-500 w-full">
      {/* Form Header with same UI as list view */}
      <div className={cn(
        "sticky top-0 z-30 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <Package className="text-[var(--color-primary)] h-6 w-6" />
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {isEditing ? "Update existing product details and pricing." : "Create a new product for your catalog."}
          </p>
        </div>
        <div className="min-w-[150px] flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => !isSaving && onClose()} className="h-[42px]">
            Cancel
          </Button>
          <ActionButton 
            onClick={handleSave}
            text={isSaving ? 'Saving...' : 'Save'}
            disabled={isSaving}
            icon={isSaving ? Loader2 : Save}
            className="px-6 h-[42px]"
          />
        </div>
      </div>

      <Card className="p-6 md:p-8">
        {/* Custom Tabs Navigation */}
        <div className="flex border-b border-border mb-6 overflow-x-auto hide-scrollbar">
          {['basic', 'inventory', 'details', 'media'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          
          {/* TAB: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} disabled={isSaving} />
                <Input label="SKU" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} disabled={isSaving || isEditing} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Price ($)" type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} disabled={isSaving} />
                <Input label="Discount Price ($)" type="number" step="0.01" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})} disabled={isSaving} />
                <Input label="Cost Price ($)" type="number" step="0.01" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} disabled={isSaving} />
                <Select
                  label="Tax Class"
                  value={form.taxClass}
                  onChange={e => setForm({...form, taxClass: e.target.value})}
                  disabled={isSaving}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="EXEMPT">Exempt</option>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoryDropdown categories={categories} value={form.categoryId} onChange={(val) => setForm({...form, categoryId: val})} disabled={isSaving} />
                <div className="flex items-center space-x-2 pt-8">
                  <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" disabled={isSaving} />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-[var(--text-main)]">Featured Product</label>
                </div>
              </div>
              
              <Input label="Short Description" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} disabled={isSaving} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Full Description</label>
                <textarea
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none min-h-[100px]"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  disabled={isSaving}
                />
              </div>
            </div>
          )}

          {/* TAB: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Initial Stock" type="number" required={!isEditing} value={form.initialStock} onChange={e => setForm({...form, initialStock: e.target.value})} disabled={isSaving || isEditing} />
                <Input label="Max Order Quantity (Per Customer)" type="number" value={form.maxOrderQuantity} onChange={e => setForm({...form, maxOrderQuantity: e.target.value})} disabled={isSaving} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Minimum Stock (Alert Level)" type="number" value={form.minimumStock} onChange={e => setForm({...form, minimumStock: e.target.value})} disabled={isSaving || isEditing} />
                <Input label="Reorder Level (Auto-purchase)" type="number" value={form.reorderLevel} onChange={e => setForm({...form, reorderLevel: e.target.value})} disabled={isSaving || isEditing} />
              </div>
              <Select
                label="Product Status"
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                disabled={isSaving}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </Select>
            </div>
          )}

          {/* TAB: DETAILS & SEO */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  label="Unit Type"
                  value={form.unit}
                  onChange={e => setForm({...form, unit: e.target.value})}
                  disabled={isSaving}
                >
                  <option value="piece">Piece (ea)</option>
                  <option value="gram">Grams (g)</option>
                  <option value="slice">Slice</option>
                  <option value="box">Box</option>
                </Select>
                <Input label="Weight (grams)" type="number" value={form.weightGrams} onChange={e => setForm({...form, weightGrams: e.target.value})} disabled={isSaving} />
                <Input label="Calories (per unit)" type="number" value={form.caloriesPerUnit} onChange={e => setForm({...form, caloriesPerUnit: e.target.value})} disabled={isSaving} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Preparation Time (Minutes)" type="number" value={form.preparationTimeMinutes} onChange={e => setForm({...form, preparationTimeMinutes: e.target.value})} disabled={isSaving} />
                <Input label="Shelf Life (Hours)" type="number" value={form.shelfLifeHours} onChange={e => setForm({...form, shelfLifeHours: e.target.value})} disabled={isSaving} />
              </div>

              <Input label="Ingredients (Comma separated)" value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})} disabled={isSaving} placeholder="e.g. Flour, Sugar, Eggs" />
              <Input label="Allergens (Comma separated)" value={form.allergens} onChange={e => setForm({...form, allergens: e.target.value})} disabled={isSaving} placeholder="e.g. Nuts, Dairy, Gluten" />
              <Input label="Tags (Comma separated)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} disabled={isSaving} placeholder="e.g. Vegan, Keto, Bestseller" />
              
              <div className="pt-2 border-t border-[var(--border-color)]">
                <h3 className="text-sm font-semibold text-[var(--text-main)] mb-2">Search Engine Optimization (SEO)</h3>
                <div className="space-y-4">
                  <Input label="Meta Title" value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} disabled={isSaving} placeholder="50-60 characters max" />
                  <Input label="Meta Description" value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} disabled={isSaving} placeholder="150-160 characters max" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEDIA */}
          {activeTab === 'media' && (
            <div className="animate-in fade-in">
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
            </div>
          )}

          <div className="pt-4 flex justify-between items-center border-t border-border mt-8">
            {isEditing ? (
              <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteClick} disabled={isSaving}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div />}
          </div>
        </form>
      </Card>
    </div>
  );
}
