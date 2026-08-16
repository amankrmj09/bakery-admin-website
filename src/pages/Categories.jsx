import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Plus, Tags, Power, Edit } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import Pagination from '../components/shared/Pagination';
import TopSearchBar from '../components/shared/TopSearchBar';
import ActionIconButton from '../components/ui/ActionIconButton';
import CategoryDetails from './CategoryDetails';
import { motion, AnimatePresence } from 'framer-motion';

export default function Categories() {
  const dispatch = useDispatch();
  const { data: categories, totalElements, loading } = useSelector((state) => state.dashboard.categories);
  const isScrolled = useScrollTop();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };
  
  useEffect(() => {
    dispatch(fetchCategories({ page, size: pageSize, query: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);
  
  const totalPages = Math.ceil((totalElements || categories?.length || 0) / pageSize) || 1;

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddClick = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      await api.post(`/api/v1/categories/${categoryId}/toggle-status`);
      toast.success('Category status toggled successfully');
      dispatch(fetchCategories({ page, size: pageSize, query: searchTerm }));
    } catch (error) { 
      console.error('Failed to toggle', error); 
      toast.error(error.response?.data?.message || 'Failed to toggle category status');
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full pb-8">
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
            exit={{ opacity: 0, y: -15, transitionEnd: { transform: 'none' } }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col gap-6 w-full"
          >
            {/* Sticky Header */}
      <div className={cn(
        "sticky top-0 z-40 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
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
        <div className="flex items-center gap-4 flex-wrap sm:justify-end">
          <TopSearchBar onSearch={handleSearch} placeholder="Search categories..." />
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
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Top Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && categories?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading categories...</TableCell></TableRow>
              ) : categories?.length > 0 ? (
                categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.productCount || 0}</TableCell>
                    <TableCell><Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell><Badge variant={c.isTopCategory ? 'success' : 'secondary'}>{c.isTopCategory ? 'Yes' : 'No'}</Badge></TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <ActionIconButton icon={Power} onClick={() => handleToggleStatus(c.id)} title="Toggle Status" colorClass="text-amber-600 bg-amber-50 hover:bg-amber-100" />
                      <ActionIconButton icon={Edit} onClick={() => handleEditClick(c)} title="Edit Category" colorClass="text-blue-600 bg-blue-50 hover:bg-blue-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No categories found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements || categories?.length || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
          loading={loading}
        />
      </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
            exit={{ opacity: 0, y: -15, transitionEnd: { transform: 'none' } }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full flex flex-col gap-6"
          >
            <CategoryDetails 
              category={editingCategory} 
              categories={categories} 
              onClose={() => setShowForm(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


