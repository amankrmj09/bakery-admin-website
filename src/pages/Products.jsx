import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import ProductDetails from './ProductDetails';

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
    <div className="flex flex-col min-h-full w-full pb-8 overflow-x-hidden">
      {!showForm ? (
        <div className="flex flex-col gap-6 animate-in slide-in-from-left-4 fade-in duration-500 w-full">
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
        </div>
      ) : (
        <ProductDetails 
          product={editingProduct} 
          categories={categories} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
