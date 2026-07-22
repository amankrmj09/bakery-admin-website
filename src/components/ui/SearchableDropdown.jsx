import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function SearchableDropdown({
  label,
  required = false,
  options = [],
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  noOptionsText = 'No options found',
  footerNode = null,
  headerNode = null,
  maxItemsEmpty = null,
  maxItemsSearch = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSearching = searchTerm.trim().length > 0;
  if (isSearching && maxItemsSearch) {
    filteredOptions = filteredOptions.slice(0, maxItemsSearch);
  } else if (!isSearching && maxItemsEmpty) {
    filteredOptions = filteredOptions.slice(0, maxItemsEmpty);
  }

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {(label || headerNode) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <label className="block text-sm font-medium text-[var(--text-main)]">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          {headerNode}
        </div>
      )}
      
      <div 
        className={`flex items-center justify-between w-full p-2 border rounded-lg bg-[var(--bg-panel)] border-[var(--border-color)] text-[var(--text-main)] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--color-primary)] transition-colors'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`text-sm ${selectedOption ? '' : 'text-[var(--text-muted)]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-xl max-h-[300px] flex flex-col overflow-hidden">
          <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-panel)]">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-panel-hover)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-1 max-h-[200px]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 rounded-md cursor-pointer text-sm mb-0.5 transition-colors ${value === opt.value ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)]'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-sm text-[var(--text-muted)] text-center flex flex-col items-center gap-2">
                <span className="opacity-50">{noOptionsText}</span>
              </div>
            )}
          </div>
          
          {footerNode && (
            <div className="border-t border-[var(--border-color)] bg-[var(--bg-panel-hover)]/50">
              {footerNode}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
