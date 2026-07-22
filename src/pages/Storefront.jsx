import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStorefront, updateStorefront } from '../store/slices/dashboardSlice';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import SingleImageUploader from '../components/shared/SingleImageUploader';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, SettingsIcon, Save, LayoutTemplate, Store, Info, Briefcase, Tag, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useScrollTop } from '../hooks/useScrollTop';


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
      heroSection: {},
      aboutSection: {},
      heroSection: { campaigns: [{}, {}, {}] },
      howWeWorkSection: [],
      specialOfferSection: {},
      testimonialSection: {}
    }
  });

  const { fields: campaignFields, append: appendCampaign, remove: removeCampaign } = useFieldArray({
    control,
    name: 'heroSection.campaigns'
  });

  const { fields: howWeWorkFields, append: appendHowWeWork, remove: removeHowWeWork } = useFieldArray({
    control,
    name: 'howWeWorkSection'
  });

  useEffect(() => {
    dispatch(fetchStorefront());
  }, [dispatch]);

  useEffect(() => {
    if (storefront.data) {
      reset(storefront.data);
    }
  }, [storefront.data, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await dispatch(updateStorefront(data)).unwrap();
      toast.success('Site configuration saved successfully!');
      reset(data);
    } catch (err) {
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

  const inputClasses = "w-full text-sm p-3 rounded-xl border border-[var(--border-color)] bg-transparent dark:bg-white/5 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] transition-colors mt-1.5";
  const labelClasses = "text-xs font-semibold text-[var(--text-muted)] tracking-wide";
  const sectionHeaderClasses = "font-bold text-sm uppercase tracking-wider text-[var(--text-main)] border-b border-[var(--border-color)]/50 pb-3 mb-4 flex items-center gap-2";

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
                <Store className="h-4 w-4 text-primary-500" /> Hero Carousel Campaigns
              </h3>
            </div>
          
          <div className="space-y-4">
            {campaignFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start border border-[var(--border-color)]/60 p-5 rounded-2xl bg-[var(--bg-panel-hover)] transition-all">
                <div className="flex-1 space-y-4">
                  <h4 className="font-bold text-sm text-[var(--text-main)] mb-2">Campaign {index + 1}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Large Image (3:2 ratio)</label>
                      <Controller name={`heroSection.campaigns.${index}.largeImageUrl`} control={control} render={({ field }) => <SingleImageUploader value={field.value} onChange={field.onChange} />} />
                    </div>
                    <div>
                      <label className={labelClasses}>Small Image (1:1 ratio)</label>
                      <Controller name={`heroSection.campaigns.${index}.smallImageUrl`} control={control} render={({ field }) => <SingleImageUploader value={field.value} onChange={field.onChange} />} />
                    </div>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeCampaign(index)} disabled={campaignFields.length <= 3} className="text-destructive mt-6 rounded-xl hover:bg-destructive/10 h-10 w-10 p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
              {campaignFields.length < 5 && (
                <button type="button" onClick={() => appendCampaign({ largeImageUrl: '', smallImageUrl: '' })} className="self-start flex items-center gap-2 text-sm font-semibold px-4 py-2 border-2 border-dashed border-primary-500/50 text-primary-500 rounded-xl hover:bg-primary-500/10 transition-colors mt-2">
                  <Plus size={16} /> Add Campaign
                </button>
              )}
              {campaignFields.length >= 5 && (
                <p className="text-xs text-primary-500/70 italic flex items-center gap-2 mt-2">
                  <SettingsIcon size={14} /> Maximum of 5 campaigns reached.
                </p>
              )}
              {campaignFields.length < 3 && (
                <p className="text-sm text-red-500 italic text-center py-4 bg-red-500/10 rounded-2xl border border-dashed border-red-500/30">You must add at least 3 campaigns to enable the carousel rotation.</p>
              )}
            </div>
        </div>

        {/* ABOUT SECTION */}
        <div className="flex flex-col gap-5 mt-4">
          <h3 className={sectionHeaderClasses}>
            <Info className="h-4 w-4 text-primary-500" /> About Us Section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Tag</label>
              <input {...register('aboutSection.tag')} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Title</label>
              <input {...register('aboutSection.title')} className={inputClasses} />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Description</label>
            <textarea {...register('aboutSection.description')} rows={3} className={inputClasses} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={labelClasses}>Image 1 URL</label>
              <Controller name='aboutSection.image1Url' control={control} render={({ field }) => <SingleImageUploader value={field.value} onChange={field.onChange} />} />
            </div>
            <div>
              <label className={labelClasses}>Image 2 URL</label>
              <Controller name='aboutSection.image2Url' control={control} render={({ field }) => <SingleImageUploader value={field.value} onChange={field.onChange} />} />
            </div>
            <div>
              <label className={labelClasses}>Image 3 URL</label>
              <Controller name='aboutSection.image3Url' control={control} render={({ field }) => <SingleImageUploader value={field.value} onChange={field.onChange} />} />
            </div>
          </div>
        </div>

        {/* HOW WE WORK SECTION */}
        <div className="flex flex-col gap-5 mt-4">
            <div className="flex flex-row items-center justify-between border-b border-[var(--border-color)]/50 pb-3 mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary-500" /> How We Work Steps
              </h3>
            </div>
          
          <div className="space-y-4">
            {howWeWorkFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start border border-[var(--border-color)]/60 p-5 rounded-2xl bg-[var(--bg-panel-hover)] transition-all">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Title</label>
                      <input {...register(`howWeWorkSection.${index}.title`)} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Icon Name (lucide)</label>
                      <input {...register(`howWeWorkSection.${index}.iconName`)} className={inputClasses} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Description</label>
                    <input {...register(`howWeWorkSection.${index}.description`)} className={inputClasses} />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeHowWeWork(index)} className="text-destructive mt-6 rounded-xl hover:bg-destructive/10 h-10 w-10 p-0 flex items-center justify-center">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
              {howWeWorkFields.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] italic text-center py-4 bg-[var(--bg-panel-hover)] rounded-2xl border border-dashed border-[var(--border-color)]">No steps added yet.</p>
              )}
              <button type="button" onClick={() => appendHowWeWork({ title: '', description: '', iconName: '' })} className="self-start flex items-center gap-2 text-sm font-semibold px-4 py-2 border-2 border-dashed border-primary-500/50 text-primary-500 rounded-xl hover:bg-primary-500/10 transition-colors mt-2">
                <Plus size={16} /> Add Step
              </button>
            </div>
        </div>

        {/* SPECIAL OFFER SECTION */}
        <div className="flex flex-col gap-5 mt-4">
          <h3 className={sectionHeaderClasses}>
            <Tag className="h-4 w-4 text-primary-500" /> Special Offer Section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Tag</label>
              <input {...register('specialOfferSection.tag')} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Headline</label>
              <input {...register('specialOfferSection.headline')} className={inputClasses} />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Description</label>
            <textarea {...register('specialOfferSection.description')} rows={2} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Image URL</label>
            <Controller name='specialOfferSection.imageUrl' control={control} render={({ field }) => <SingleImageUploader value={field.value} onChange={field.onChange} />} />
          </div>
        </div>

        {/* TESTIMONIAL SECTION */}
        <div className="flex flex-col gap-5 mt-4">
          <h3 className={sectionHeaderClasses}>
            <MessageSquare className="h-4 w-4 text-primary-500" /> Testimonial Section
          </h3>
          <div>
            <label className={labelClasses}>Quote</label>
            <textarea {...register('testimonialSection.quote')} rows={2} className={inputClasses} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={labelClasses}>Author Name</label>
              <input {...register('testimonialSection.author')} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Rating (1-5)</label>
              <input type="number" min="1" max="5" {...register('testimonialSection.rating', { valueAsNumber: true })} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Author Image URL</label>
              <Controller name='testimonialSection.authorImageUrl' control={control} render={({ field }) => <SingleImageUploader value={field.value} onChange={field.onChange} />} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}




