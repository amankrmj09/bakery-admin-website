import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Plus, Trash2, Tags, Loader2, Save } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import SingleImageUploader from '../components/shared/SingleImageUploader';
import { FolderTree } from 'lucide-react';

export default function Categories() {
  const dispatch = useDispatch();
  const { data: categories, loading } = useSelector((state) => state.dashboard.categories);
  const isScrolled = useScrollTop();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil((categories?.length || 0) / ITEMS_PER_PAGE);
  const paginatedCategories = categories?.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE) || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', parentId: '', displayOrder: 0, active: true, mediaUrls: [] });

  const categoryOptions = useMemo(() => [
    { value: '', label: 'None (Top Level Category)' },
    ...(categories || []).filter(c => c.id !== editingCategory?.id).map(c => ({ value: c.id, label: c.name }))
  ], [categories, editingCategory]);

  const handleAddClick = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', parentId: '', displayOrder: 0, active: true, mediaUrls: [] });
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setForm({ 
      name: category.name, 
      description: category.description || '', 
      parentId: category.parentId || '',
      displayOrder: category.displayOrder || 0, 
      active: category.active !== false,
      mediaUrls: category.mediaUrls || []
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form };

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
            <Tags className="text-[var(--color-primary)] h-6 w-6" />
            Menu Categories
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Organize your products into logical categories.</p>
        </div>
        <div className="min-w-[150px] flex sm:justify-end">
          <ActionButton 
            text="Add Category"
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
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((c) => (
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
        {/* Pagination Controls */}
        {categories?.length > ITEMS_PER_PAGE && (
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

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title={editingCategory ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input 
            label="Name" 
            required 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            disabled={isSaving} 
          />

          <SearchableSelect
            label="Parent Category"
            icon={FolderTree}
            options={categoryOptions}
            value={form.parentId}
            onChange={val => setForm({...form, parentId: val})}
            disabled={isSaving}
          />
          
          <Textarea 
            label="Description" 
            rows={3} 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
            disabled={isSaving} 
          />

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide mb-2 block">Category Image</label>
            <SingleImageUploader 
               value={form.mediaUrls?.[0] || ''}
               onChange={(url) => setForm({...form, mediaUrls: url ? [url] : []})}
            />
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-border mt-6">
            {editingCategory ? (
              <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(editingCategory.id)} disabled={isSaving}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div />}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
              <ActionButton 
                type="submit" 
                text={isSaving ? 'Saving...' : 'Save Category'}
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

