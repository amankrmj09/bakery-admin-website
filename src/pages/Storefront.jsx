import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStorefront, updateStorefront } from '../store/slices/dashboardSlice';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import ActionIconButton from '../components/ui/ActionIconButton';
import SingleImageUploader from '../components/shared/SingleImageUploader';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, SettingsIcon, Save, LayoutTemplate, Store, Info, Briefcase, Tag } from 'lucide-react';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import { cn } from '../lib/utils';
import { useScrollTop } from '../hooks/useScrollTop';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import api from '../api/axiosConfig';

/** Recursively walks an object and uploads any File values via the media API.
 *  Returns a new object with File values replaced by their uploaded URLs. */
async function uploadPendingFiles(obj) {
  if (obj instanceof File) {
    const formData = new FormData();
    formData.append('media', obj);
    const res = await api.post('/api/v1/uploads/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.urls?.[0] ?? '';
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(uploadPendingFiles));
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = await uploadPendingFiles(val);
    }
    return result;
  }
  return obj;
}


export default function Storefront() {
  const dispatch = useDispatch();
  const { storefront } = useSelector((state) => state.dashboard);
  const isScrolled = useScrollTop();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm({
    defaultValues: {
      heroSection: { heroBanners: [{}, {}, {}] },
      aboutSection: {},
      specialOfferSection: {}
    }
  });

  const { fields: bannerFields, append: appendBanner, remove: removeBanner } = useFieldArray({
    control,
    name: 'heroSection.heroBanners'
  });

  const { fields: specialOfferImageFields, append: appendSpecialOfferImage, remove: removeSpecialOfferImage } = useFieldArray({
    control,
    name: 'specialOfferSection.offers'
  });

  useEffect(() => {
    dispatch(fetchStorefront());
  }, [dispatch]);

  useEffect(() => {
    if (storefront.data && typeof storefront.data === 'object') {
      const d = JSON.parse(JSON.stringify(storefront.data));
      reset(d);
    }
  }, [storefront.data, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // Upload any images the user selected (File objects) before sending payload
      let payload = await uploadPendingFiles(data);

      // Preserve howWeWorkSection since it was removed from Admin UI
      if (storefront.data && storefront.data.howWeWorkSection) {
        payload.howWeWorkSection = storefront.data.howWeWorkSection;
      }

      await dispatch(updateStorefront(payload)).unwrap();
      toast.success('Site configuration saved successfully!');
      reset(payload); // reset with resolved URLs so isDirty resets correctly
    } catch (err) {
      console.error(err);
      toast.error('Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  if (storefront.loading && !storefront.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const sectionHeaderClasses = "font-bold text-sm uppercase tracking-wider text-[var(--text-main)] border-b border-[var(--border-color)]/50 pb-3 mb-4 flex items-center gap-2";

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      
      {/* Sticky Header */}
      <div className={cn(
        "sticky top-0 z-40 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <LayoutTemplate className="text-[var(--color-primary)] h-6 w-6" />
            Storefront Content
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Manage the content displayed on the customer frontend.</p>
        </div>
        <div className="min-w-[150px] flex sm:justify-end">
          {isDirty && (
            <ActionButton 
              text={isSaving ? "Saving..." : "Save Config"}
              onClick={handleSubmit(onSubmit)} 
              disabled={isSaving}
              icon={isSaving ? Loader2 : Save}
              className="px-6 h-[42px]"
            />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10 p-8 rounded-3xl glass-panel border border-[var(--border-color)] shadow-sm text-[var(--text-main)]">
        
        {/* HERO CAROUSEL SECTION */}
        <div className="flex flex-col gap-5">
            <div className="flex flex-row items-center justify-between border-b border-[var(--border-color)]/50 pb-3 mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <Store className="h-4 w-4 text-primary-500" /> Hero Banners
              </h3>
            </div>
          
          <div className="space-y-4">
            {bannerFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start border border-[var(--border-color)]/60 p-5 rounded-2xl bg-[var(--bg-panel-hover)] transition-all">
                <div className="flex-1 space-y-4">
                  <h4 className="font-bold text-sm text-[var(--text-main)] mb-2">Banner {index + 1}</h4>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <Input label="Banner Title" {...register(`heroSection.heroBanners.${index}.title`)} />
                    <Textarea label="Banner Description" rows={2} {...register(`heroSection.heroBanners.${index}.description`)} />
                  </div>
                  <div className="mt-2">
                    <Controller name={`heroSection.heroBanners.${index}.imageUrl`} control={control} render={({ field }) => (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1">Banner Image (3:2 ratio)</label>
                        <SingleImageUploader value={field.value} onChange={field.onChange} />
                      </div>
                    )} />
                  </div>
                </div>
                <ActionIconButton
                  icon={Trash2}
                  title="Remove Banner"
                  onClick={() => removeBanner(index)}
                  disabled={bannerFields.length <= 3}
                  colorClass="text-red-600 bg-red-50 hover:bg-red-100 mt-6"
                />
              </div>
            ))}
              {bannerFields.length < 5 && (
                <button type="button" onClick={() => appendBanner({ imageUrl: '' })} className="self-start flex items-center gap-2 text-sm font-semibold px-4 py-2 border-2 border-dashed border-primary-500/50 text-primary-500 rounded-xl hover:bg-primary-500/10 transition-colors mt-2">
                  <Plus size={16} /> Add Banner
                </button>
              )}
              {bannerFields.length >= 5 && (
                <p className="text-xs text-primary-500/70 italic flex items-center gap-2 mt-2">
                  <SettingsIcon size={14} /> Maximum of 5 banners reached.
                </p>
              )}
              {bannerFields.length < 3 && (
                <p className="text-sm text-red-500 italic text-center py-4 bg-red-500/10 rounded-2xl border border-dashed border-red-500/30">You must add at least 3 banners to enable the carousel rotation.</p>
              )}
            </div>
        </div>

        {/* ABOUT SECTION */}
        <div className="flex flex-col gap-5 mt-4">
          <h3 className={sectionHeaderClasses}>
            <Info className="h-4 w-4 text-primary-500" /> About Us Section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Tag" {...register('aboutSection.tag')} />
            <Input label="Title" {...register('aboutSection.title')} />
          </div>
          <Textarea label="Description" rows={3} {...register('aboutSection.description')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Controller name='aboutSection.image1Url' control={control} render={({ field }) => (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1">Image 1 URL</label>
                  <SingleImageUploader value={field.value} onChange={field.onChange} />
                </div>
              )} />
            </div>
            <div>
              <Controller name='aboutSection.image2Url' control={control} render={({ field }) => (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1">Image 2 URL</label>
                  <SingleImageUploader value={field.value} onChange={field.onChange} />
                </div>
              )} />
            </div>
            <div>
              <Controller name='aboutSection.image3Url' control={control} render={({ field }) => (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1">Image 3 URL</label>
                  <SingleImageUploader value={field.value} onChange={field.onChange} />
                </div>
              )} />
            </div>
          </div>
        </div>

        {/* SPECIAL OFFER SECTION */}
        <div className="flex flex-col gap-5 mt-4">
          <h3 className={sectionHeaderClasses}>
            <Tag className="h-4 w-4 text-primary-500" /> Special Offer Section
          </h3>
          <p className="text-xs text-[var(--text-muted)] italic -mt-2">Provide between 1 and 5 images (4:1 aspect ratio).</p>
          <div className="space-y-4">
            {specialOfferImageFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start border border-[var(--border-color)]/60 p-5 rounded-2xl bg-[var(--bg-panel-hover)] transition-all">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <Input label="Offer Title" {...register(`specialOfferSection.offers.${index}.title`)} />
                    <Textarea label="Offer Description" rows={2} {...register(`specialOfferSection.offers.${index}.description`)} />
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Input label="Coupon Code" {...register(`specialOfferSection.offers.${index}.couponCode`)} />
                        <div className="flex flex-col gap-1.5 relative group">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1 group-focus-within:text-[var(--color-primary)] transition-colors">Discount Type</label>
                          <select className="w-full text-sm p-3.5 rounded-xl border bg-white dark:bg-slate-900 text-[var(--text-main)] outline-none transition-all shadow-sm focus:shadow-md focus:-translate-y-0.5 border-[var(--border-color)] focus:border-[var(--color-primary)] appearance-none" {...register(`specialOfferSection.offers.${index}.discountType`)}>
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FLAT">Flat Amount</option>
                          </select>
                        </div>
                        <Input type="number" step="0.01" label="Discount Value" {...register(`specialOfferSection.offers.${index}.discountValue`, { valueAsNumber: true })} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Controller 
                          name={`specialOfferSection.offers.${index}.expiryDate`} 
                          control={control} 
                          render={({ field: dateField }) => (
                            <CustomDatePicker
                              value={dateField.value}
                              onChange={dateField.onChange}
                              label="Expiry Date"
                              minDate={new Date()}
                            />
                          )} 
                        />
                        <Input type="number" step="0.01" label="Min Cart Value" {...register(`specialOfferSection.offers.${index}.minCartValue`, { valueAsNumber: true })} />
                      </div>
                    </div>
                  </div>
                  <Controller name={`specialOfferSection.offers.${index}.imageUrl`} control={control} render={({ field: imgField }) => (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1">Offer Image (4:1 ratio)</label>
                        <SingleImageUploader value={imgField.value} onChange={imgField.onChange} />
                      </div>
                  )} />
                </div>
                <ActionIconButton
                  icon={Trash2}
                  title="Remove Offer"
                  onClick={() => removeSpecialOfferImage(index)}
                  disabled={specialOfferImageFields.length <= 1}
                  colorClass="text-red-600 bg-red-50 hover:bg-red-100 mt-6"
                />
              </div>
            ))}
            {specialOfferImageFields.length < 5 && (
              <button type="button" onClick={() => appendSpecialOfferImage({ imageUrl: '', title: '', description: '' })} className="self-start flex items-center gap-2 text-sm font-semibold px-4 py-2 border-2 border-dashed border-primary-500/50 text-primary-500 rounded-xl hover:bg-primary-500/10 transition-colors mt-2">
                <Plus size={16} /> Add Image
              </button>
            )}
            {specialOfferImageFields.length >= 5 && (
              <p className="text-xs text-primary-500/70 italic flex items-center gap-2 mt-2">
                <SettingsIcon size={14} /> Maximum of 5 images reached.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}






