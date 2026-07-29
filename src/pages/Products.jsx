import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/dashboardSlice';
import { fetchTaxRates } from '../store/slices/taxSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Package, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import ProductDetails from './ProductDetails';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../components/shared/Pagination';
import TopSearchBar from '../components/shared/TopSearchBar';
import ActionIconButton from '../components/ui/ActionIconButton';

export default function Products() {
  const dispatch = useDispatch();
  const { data: products, totalElements, loading } = useSelector((state) => state.dashboard.products);
  const { data: categories } = useSelector((state) => state.dashboard.categories);
  const { taxRates } = useSelector((state) => state.tax);
  const isScrolled = useScrollTop();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  useEffect(() => {
    dispatch(fetchProducts({ page, size: pageSize, query: searchTerm }));
    dispatch(fetchCategories());
    dispatch(fetchTaxRates());
  }, [dispatch, page, pageSize, searchTerm]);
  
  const totalPages = Math.ceil((totalElements || products?.length || 0) / pageSize) || 1;

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddClick = () => {
    if (!categories || categories.length === 0) {
      toast.error('No categories found. Please add a category first.');
      return;
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowForm(true);
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
                <Package className="text-[var(--color-primary)] h-6 w-6" />
                Product Catalog
              </h1>
              <p className="text-[var(--text-muted)] text-sm">Manage your bakery's product offerings and pricing.</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap sm:justify-end">
              <TopSearchBar onSearch={handleSearch} placeholder="Search by SKU or name..." />
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
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && products?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading products...</TableCell></TableRow>
                  ) : products?.length > 0 ? (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          {p.discountPrice > 0 ? (
                            <div>
                              <span className="text-muted-foreground line-through text-xs mr-2">₹{p.price}</span>
                              <span className="font-medium text-green-600">₹{p.discountPrice}</span>
                            </div>
                          ) : (
                            <span>₹{p.price}</span>
                          )}
                        </TableCell>
                        <TableCell>{p.inventory?.currentStock ?? 0}</TableCell>
                        <TableCell><Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>{p.status}</Badge></TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <ActionIconButton icon={Edit} onClick={() => handleEditClick(p)} title="Edit Product" colorClass="text-blue-600 bg-blue-50 hover:bg-blue-100" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements || products?.length || 0}
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
            <ProductDetails 
              product={editingProduct} 
              categories={categories} 
              taxRates={taxRates}
              onClose={() => setShowForm(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

