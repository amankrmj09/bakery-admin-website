import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Search, X } from 'lucide-react';

export const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option...", 
  label, 
  error, 
  icon: Icon,
  wrapperClassName,
  className,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={wrapperRef} className={cn("flex flex-col gap-1.5 relative group", wrapperClassName)}>
      {label && (
        <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1 group-focus-within:text-[var(--color-primary)] transition-colors">
          {label}
        </label>
      )}
      
      <div 
        className="relative cursor-pointer"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {Icon && (
          <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors z-10" />
        )}
        
        <div className={cn(
          "w-full text-sm p-3.5 rounded-xl border bg-transparent dark:bg-white/5 text-[var(--text-main)] outline-none transition-all shadow-sm flex items-center justify-between",
          Icon ? "pl-10" : "px-4",
          error ? "border-[var(--color-danger)]" : isOpen ? "border-[var(--color-primary)] shadow-md -translate-y-0.5" : "border-[var(--border-color)] hover:border-[var(--border-color)]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}>
          <span className={!selectedOption ? "text-[var(--text-muted)] truncate block w-full" : "truncate block w-[90%]"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 gap-1">
          {value && !disabled && (
            <button type="button" onClick={handleClear} className="p-1 hover:bg-[var(--bg-panel-hover)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              <X size={14} />
            </button>
          )}
          <ChevronDown size={18} className={cn(
            "text-[var(--text-muted)] group-focus-within:text-[var(--color-primary)] transition-transform duration-200 pointer-events-none",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 top-[calc(100%+8px)] left-0 right-0 bg-[var(--bg-panel)]/95 backdrop-blur-2xl border border-[var(--border-color)] rounded-xl shadow-2xl max-h-60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-[var(--border-color)] sticky top-0 bg-transparent z-10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                className="w-full text-sm p-2 pl-8 rounded-lg bg-[var(--bg-panel-hover)]/30 border border-[var(--border-color)] text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]/50 transition-colors placeholder:text-[var(--text-muted)]/70"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={cn(
                    "px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors flex items-center justify-between mx-1 my-0.5",
                    opt.value === value 
                      ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-medium" 
                      : "text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)]"
                  )}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-[var(--text-muted)] text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && <span className="text-xs text-[var(--color-danger)] ml-1">{error}</span>}
    </div>
  );
};
