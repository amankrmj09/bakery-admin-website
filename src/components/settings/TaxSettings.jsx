import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaxRates, createTaxRate, updateTaxRate, deleteTaxRate, clearTaxState } from '../../store/slices/taxSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { toast } from 'sonner';

export default function TaxSettings() {
  const dispatch = useDispatch();
  const { taxRates, loading, error, success } = useSelector((state) => state.tax);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTax, setCurrentTax] = useState({ taxClass: '', rate: '', description: '' });

  useEffect(() => {
    dispatch(fetchTaxRates());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setIsEditing(false);
      setCurrentTax({ taxClass: '', rate: '', description: '' });
      dispatch(clearTaxState());
    }
    if (error) {
      toast.error(error);
      dispatch(clearTaxState());
    }
  }, [success, error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentTax.id) {
      dispatch(updateTaxRate({ id: currentTax.id, data: currentTax }));
    } else {
      dispatch(createTaxRate(currentTax));
    }
  };

  const handleEdit = (tax) => {
    setCurrentTax(tax);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this tax rate?')) {
      dispatch(deleteTaxRate(id));
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Tax Configuration</CardTitle>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setCurrentTax({ taxClass: '', rate: '', description: '' });
          }}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
        >
          {isEditing ? 'Cancel' : 'Add Tax Rate'}
        </button>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-panel-hover)]">
            <h3 className="text-lg font-medium text-[var(--text-main)] mb-4">
              {currentTax.id ? 'Edit Tax Rate' : 'New Tax Rate'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Tax Class</label>
                <input
                  type="text"
                  required
                  value={currentTax.taxClass}
                  onChange={(e) => setCurrentTax({ ...currentTax, taxClass: e.target.value })}
                  className="w-full bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="e.g. STANDARD, EXEMPT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Rate (Decimal)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  required
                  value={currentTax.rate}
                  onChange={(e) => setCurrentTax({ ...currentTax, rate: e.target.value })}
                  className="w-full bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="e.g. 0.08 for 8%"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Description</label>
                <input
                  type="text"
                  value={currentTax.description || ''}
                  onChange={(e) => setCurrentTax({ ...currentTax, description: e.target.value })}
                  className="w-full bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Description of tax rate"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Saving...' : 'Save Tax Rate'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                <th className="pb-3 font-medium px-2">Tax Class</th>
                <th className="pb-3 font-medium px-2">Rate</th>
                <th className="pb-3 font-medium px-2">Description</th>
                <th className="pb-3 font-medium px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-main)] text-sm">
              {taxRates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-[var(--text-muted)]">
                    No tax rates configured. Add one above.
                  </td>
                </tr>
              ) : (
                taxRates.map((tax) => (
                  <tr key={tax.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] transition-colors">
                    <td className="py-4 px-2 font-medium">{tax.taxClass}</td>
                    <td className="py-4 px-2">{(tax.rate * 100).toFixed(2)}%</td>
                    <td className="py-4 px-2 text-[var(--text-muted)]">{tax.description || '-'}</td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tax)}
                          className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(tax.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
