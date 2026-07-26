import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SleekSearchDropdown from '../ui/SleekSearchDropdown';

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
    <SleekSearchDropdown
      formLabel="Category"
      options={options}
      value={value}
      onChange={(val) => {
        // Handle onChange to support both option object or string value depending on SleekSearchDropdown's output
        onChange(typeof val === 'object' && val !== null ? val.value : val);
      }}
      disabled={disabled}
      placeholder="Search categories..."
      headerNode={headerNode}
      footerNode={footerNode}
    />
  );
}
