import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { createCategory, updateCategory, deleteCategory } from '../store/slices/dashboardSlice';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Tags, Loader2, Save, Trash2, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import SleekSearchDropdown from '../components/ui/SleekSearchDropdown';
import SingleImageUploader from '../components/shared/SingleImageUploader';

const initialFormState = {
  name: '',
  description: '',
  parentId: '',
  displayOrder: 0,
  active: true,
  isTopCategory: false,
  mediaUrls: []
};

export default function CategoryDetails({ category, categories, onClose }) {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();
  const isEditing = !!category;

  const [form, setForm] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || '',
        displayOrder: category.displayOrder || 0,
        active: category.active !== false,
        isTopCategory: category.isTopCategory || false,
        mediaUrls: category.mediaUrls || []
      });
    } else {
      setForm(initialFormState);
    }
  }, [category, isEditing]);

  const categoryOptions = useMemo(() => [
    { value: '', label: 'None (Top Level Category)' },
    ...(categories || []).filter(c => c.id !== category?.id).map(c => ({ value: c.id, label: c.name }))
  ], [categories, category]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form };

      if (isEditing) {
        await dispatch(updateCategory({ categoryId: category.id, data: payload })).unwrap();
        toast.success('Category updated successfully');
      } else {
        await dispatch(createCategory(payload)).unwrap();
        toast.success('Category created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Failed to save category', error);
      toast.error('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this category? All associated products may be deleted as well.')) {
      try {
        await dispatch(deleteCategory(category.id)).unwrap();
        toast.success('Category deleted successfully');
        onClose();
      } catch (error) {
        console.error('Failed to delete category', error);
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Form Header with same UI as list view */}
      <div className={cn(
        "sticky top-0 z-40 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <Tags className="text-[var(--color-primary)] h-6 w-6" />
            {isEditing ? "Edit Category" : "Add Category"}
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {isEditing ? "Update existing category details." : "Create a new category for your products."}
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
          {['basic', 'media'].map(tab => (
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
              <Input 
                label="Name" 
                required 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                disabled={isSaving} 
              />

              <SleekSearchDropdown
                formLabel="Parent Category"
                icon={FolderTree}
                options={categoryOptions}
                value={form.parentId}
                onChange={(opt) => setForm({...form, parentId: opt.value})}
                disabled={isSaving}
              />
              
              <div className="flex items-center space-x-2 pt-2 pb-2">
                <input 
                  type="checkbox" 
                  id="isTopCategory" 
                  checked={form.isTopCategory} 
                  onChange={e => setForm({...form, isTopCategory: e.target.checked})} 
                  disabled={isSaving}
                  className="w-4 h-4 text-[var(--color-primary)] border-[var(--border-color)] rounded focus:ring-[var(--color-primary)] bg-[var(--bg-panel)]"
                />
                <label htmlFor="isTopCategory" className="text-sm font-medium text-[var(--text-main)]">
                  Show as Top Category
                </label>
              </div>

              <Textarea 
                label="Description" 
                rows={3}
                className="min-h-[100px]"
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                disabled={isSaving} 
              />
            </div>
          )}

          {/* TAB: MEDIA */}
          {activeTab === 'media' && (
            <div className="animate-in fade-in">
              <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide mb-2 block">Category Image</label>
              <SingleImageUploader 
                 value={form.mediaUrls?.[0] || ''}
                 onChange={(url) => setForm({...form, mediaUrls: url ? [url] : []})}
              />
            </div>
          )}

          <div className="pt-4 flex justify-between items-center border-t border-border mt-8">
            {isEditing ? (
              <ActionButton 
                type="button" 
                text="Delete" 
                icon={Trash2} 
                onClick={handleDeleteClick} 
                disabled={isSaving}
                bgClass="bg-red-500"
                hoverBgClass="bg-red-600"
                className="px-6 h-[42px]"
              />
            ) : <div />}
          </div>
        </form>
      </Card>
    </div>
  );
}

