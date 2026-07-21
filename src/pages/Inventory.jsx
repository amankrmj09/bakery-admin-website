import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory, updateInventory, addStock } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ActionButton from '../components/ui/ActionButton';
import { Archive, Loader2, Save } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';

export default function Inventory() {
  const dispatch = useDispatch();
  const { data: inventory, totalElements, loading } = useSelector((state) => state.dashboard.inventory);
  const isScrolled = useScrollTop();
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    dispatch(fetchInventory({ page, size: ITEMS_PER_PAGE }));
  }, [dispatch, page]);
  
  const totalPages = Math.ceil((totalElements || inventory?.length || 0) / ITEMS_PER_PAGE);
  const paginatedInventory = inventory || [];

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [stockForm, setStockForm] = useState({ quantity: 1, notes: '' });
  const [rulesForm, setRulesForm] = useState({ minimumStock: 0, reorderLevel: 0, reorderQuantity: 0 });

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const handleAddStockClick = (item) => {
    setSelectedItem(item);
    setStockForm({ quantity: 1, notes: '' });
    setIsStockModalOpen(true);
  };

  const handleEditRulesClick = (item) => {
    setSelectedItem(item);
    setRulesForm({
      minimumStock: item.minimumStock || 0,
      reorderLevel: item.reorderLevel || 0,
      reorderQuantity: item.reorderQuantity || 0
    });
    setIsRulesModalOpen(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(addStock({ productId: selectedItem.productId, ...stockForm })).unwrap();
      setIsStockModalOpen(false);
    } catch (error) { console.error('Failed to add stock', error); } finally { setIsSaving(false); }
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(updateInventory({ 
        productId: selectedItem.productId, 
        data: { currentStock: selectedItem.currentStock, ...rulesForm } 
      })).unwrap();
      setIsRulesModalOpen(false);
    } catch (error) { console.error('Failed to update rules', error); } finally { setIsSaving(false); }
  };

  const getStatusBadge = (status) => {
    if (status === 'IN_STOCK') return 'success';
    if (status === 'LOW_STOCK') return 'warning';
    return 'destructive';
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
            <Archive className="text-[var(--color-primary)] h-6 w-6" />
            Stock Monitor
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Track inventory levels and set reorder rules.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && inventory.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading inventory...</TableCell></TableRow>
              ) : paginatedInventory.length > 0 ? (
                paginatedInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.productSku}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell><Badge variant={getStatusBadge(item.status)}>{item.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddStockClick(item)}>Add Stock</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditRulesClick(item)}>Rules</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No inventory items found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
        {/* Pagination Controls */}
        {inventory?.length > ITEMS_PER_PAGE && (
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

      <Modal isOpen={isStockModalOpen} onClose={() => !isSaving && setIsStockModalOpen(false)} title="Add Stock">
        <form onSubmit={handleSaveStock} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">Quantity to Add</label>
            <input type="number" min="1" required className="w-full text-sm p-3 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] transition-colors mt-1.5" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 1})} disabled={isSaving} />
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <ActionButton 
                type="submit" 
                text={isSaving ? 'Saving...' : 'Confirm'}
                disabled={isSaving}
                icon={isSaving ? Loader2 : Save}
                className="px-4 h-10"
            />
          </div>
        </form>
      </Modal>

      <Modal isOpen={isRulesModalOpen} onClose={() => !isSaving && setIsRulesModalOpen(false)} title="Inventory Rules">
        <form onSubmit={handleSaveRules} className="space-y-4 pt-2">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">Min Stock</label>
              <input type="number" min="0" required className="w-full text-sm p-3 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] transition-colors mt-1.5" value={rulesForm.minimumStock} onChange={e => setRulesForm({...rulesForm, minimumStock: parseInt(e.target.value) || 0})} disabled={isSaving} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">Reorder Lvl</label>
              <input type="number" min="0" required className="w-full text-sm p-3 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] transition-colors mt-1.5" value={rulesForm.reorderLevel} onChange={e => setRulesForm({...rulesForm, reorderLevel: parseInt(e.target.value) || 0})} disabled={isSaving} />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsRulesModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <ActionButton 
                type="submit" 
                text={isSaving ? 'Saving...' : 'Save Rules'}
                disabled={isSaving}
                icon={isSaving ? Loader2 : Save}
                className="px-4 h-10"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
