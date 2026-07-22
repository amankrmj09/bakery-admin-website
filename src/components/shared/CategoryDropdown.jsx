import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchableDropdown from '../ui/SearchableDropdown';

export default function CategoryDropdown({ categories, value, onChange, disabled }) {
  const navigate = useNavigate();

  const options = categories?.map(cat => ({
    value: cat.id,
    label: cat.name
  })) || [];

  const handleAddCategoryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/categories');
  };

  const headerNode = (
    <button 
      type="button"
      onClick={handleAddCategoryClick} 
      className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline flex items-center transition-colors"
    >
      <Plus className="w-3 h-3 mr-0.5" /> Add Category
    </button>
  );

  const footerNode = (
    <div 
      className="p-3 flex items-center justify-center gap-2 text-sm text-[var(--color-primary)] cursor-pointer hover:bg-[var(--bg-panel-hover)] hover:text-[var(--color-primary-hover)] transition-colors font-medium"
      onClick={handleAddCategoryClick}
    >
      <Plus className="w-4 h-4" /> Add More Category
    </div>
  );

  return (
    <SearchableDropdown
      label="Category"
      required={true}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="Select a category..."
      searchPlaceholder="Search categories..."
      noOptionsText="No categories found"
      headerNode={headerNode}
      footerNode={footerNode}
    />
  );
}
