import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSiteConfig, updateSiteConfig } from '../store/slices/dashboardSlice';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Settings, Save, LayoutTemplate, Store, Info, Briefcase, Tag, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming this exists or I'll just use standard template literals if it doesn't, but I'll use standard classes to be safe

export default function SiteConfig() {
  const dispatch = useDispatch();
  const { siteConfig } = useSelector((state) => state.dashboard);
  const [isSaving, setIsSaving] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      howWeWorkSection: [],
      specialOfferSection: {},
      testimonialSection: {}
    }
  });

  const { fields: howWeWorkFields, append: appendHowWeWork, remove: removeHowWeWork } = useFieldArray({
    control,
    name: 'howWeWorkSection'
  });

  useEffect(() => {
    dispatch(fetchSiteConfig());
  }, [dispatch]);

  useEffect(() => {
    if (siteConfig.data) {
      reset(siteConfig.data);
    }
  }, [siteConfig.data, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await dispatch(updateSiteConfig(data)).unwrap();
      toast.success('Site configuration saved successfully!');
      reset(data);
    } catch (err) {
      toast.error('Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  if (siteConfig.loading && !siteConfig.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const inputClasses = "w-full text-sm p-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary-500 transition-colors mt-1.5";
  const labelClasses = "text-xs font-semibold text-muted-foreground tracking-wide";
  const sectionHeaderClasses = "font-bold text-sm uppercase tracking-wider text-foreground border-b border-border/50 pb-3 mb-4 flex items-center gap-2";

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12 w-full">
      
      {/* Sticky Header */}
      <div className={`sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
        isScrolled 
          ? "bg-card/80 backdrop-blur-xl border border-border shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      }`}>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutTemplate className="text-primary-500 h-6 w-6" />
            Site Configuration
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the content displayed on the customer frontend.</p>
        </div>
        <div className="min-w-[150px] flex justify-end">
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || (!isDirty && false)} className="px-6 h-[42px] rounded-xl font-semibold shadow-sm">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Config"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10 p-8 rounded-3xl bg-card border border-border shadow-sm">
        
        {/* HERO SECTION */}
        <div className="flex flex-col gap-5">
          <h3 className={sectionHeaderClasses}>
            <Store className="h-4 w-4 text-primary-500" /> Hero Section
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Tag</label>
              <input {...register('heroSection.tag')} placeholder="E.g. Artisanal Bakery" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Subtitle</label>
              <input {...register('heroSection.subtitle')} placeholder="E.g. Sale 20% every Monday" className={inputClasses} />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Headline</label>
            <textarea {...register('heroSection.headline')} rows={2} placeholder="Main headline text..." className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Hero Image URL</label>
            <input {...register('heroSection.heroImageUrl')} placeholder="/images/hero_burger.png" className={inputClasses} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 mt-2 border-t border-border/40">
            <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/50">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-2">Side Card 1</h4>
              <div>
                <label className={labelClasses}>Subtitle</label>
                <input {...register('heroSection.sideCard1.subtitle')} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Title</label>
                <input {...register('heroSection.sideCard1.title')} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Price</label>
                <input {...register('heroSection.sideCard1.price')} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Image URL</label>
                <input {...register('heroSection.sideCard1.imageUrl')} className={inputClasses} />
              </div>
            </div>
            <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/50">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-2">Side Card 2</h4>
              <div>
                <label className={labelClasses}>Subtitle</label>
                <input {...register('heroSection.sideCard2.subtitle')} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Title</label>
                <input {...register('heroSection.sideCard2.title')} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Image URL</label>
                <input {...register('heroSection.sideCard2.imageUrl')} className={inputClasses} />
              </div>
            </div>
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
              <input {...register('aboutSection.image1Url')} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Image 2 URL</label>
              <input {...register('aboutSection.image2Url')} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Image 3 URL</label>
              <input {...register('aboutSection.image3Url')} className={inputClasses} />
            </div>
          </div>
        </div>

        {/* HOW WE WORK SECTION */}
        <div className="flex flex-col gap-5 mt-4">
          <div className="flex flex-row items-center justify-between border-b border-border/50 pb-3 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary-500" /> How We Work Steps
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={() => appendHowWeWork({ title: '', description: '', iconName: '' })} className="rounded-xl h-8">
              <Plus className="mr-2 h-3 w-3" /> Add Step
            </Button>
          </div>
          
          <div className="space-y-4">
            {howWeWorkFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start border border-border/60 p-5 rounded-2xl bg-muted/10 transition-all hover:bg-muted/30">
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
              <p className="text-sm text-muted-foreground italic text-center py-4 bg-muted/20 rounded-2xl border border-dashed border-border">No steps added yet.</p>
            )}
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
            <input {...register('specialOfferSection.imageUrl')} className={inputClasses} />
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
              <input {...register('testimonialSection.authorImageUrl')} className={inputClasses} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
