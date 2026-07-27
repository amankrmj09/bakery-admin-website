import React, { useRef, useEffect, useState } from 'react';
import { Search, Loader2, ChevronDown } from 'lucide-react';
import SleekDropdown from './SleekDropdown';

const SleekSearchDropdown = ({
  value, // string
  onChange, // (value) => void
  onSearch, // (searchTerm) => void
  options = [],
  placeholder = 'Search...',
  widthClass = 'w-full',
  maxHeightClass = 'max-h-60',
  fullWidth = true,
  isLoading = false,
  onEnter,
  formLabel,
  icon: Icon,
  iconColor = 'text-primary',
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    // Resolve label from options when value is set (e.g., on edit load)
    const matchingOption = options.find(o => o.value === value);
    if (matchingOption) {
      setSearchTerm(matchingOption.label);
    } else if (value !== searchTerm && !options.find(o => o.label === searchTerm)) {
      // Only fall back to raw value if no matching option found and current term isn't already a label
      setSearchTerm(value || '');
    }
  }, [value, options]);

  const handleInputChange = (e, setIsOpen) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    setIsOpen(true);
    if (onSearch) {
      onSearch(newVal);
    }
  };

  const handleKeyDown = (e, setIsOpen) => {
    if (e.key === 'Enter' && onEnter) {
      setIsOpen(false);
      onEnter(searchTerm);
    }
  };

  const topOptions = options.slice(0, 5);

  return (
    <SleekDropdown
      formLabel={formLabel}
      {...props}
      value={value}
      onChange={(val) => {
         const opt = options.find(o => o.value === val);
         if (opt) {
           setSearchTerm(opt.label);
           onChange(opt);
         } else {
           onChange({ value: val, label: val });
         }
      }}
      options={topOptions}
      widthClass={widthClass}
      maxHeightClass={maxHeightClass}
      fullWidth={fullWidth}
      customTrigger={({ isOpen, setIsOpen }) => (
        <div
          className={`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium font-sans text-gray-900 hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary shadow-sm transition-all cursor-text ${fullWidth ? 'w-full justify-between' : ''}`}
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {Icon ? (
              <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
            ) : (
              <Search className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
            )}
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleInputChange(e, setIsOpen)}
              onKeyDown={(e) => handleKeyDown(e, setIsOpen)}
              placeholder={placeholder}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm font-medium font-sans text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            <ChevronDown
              className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      )}
      emptyStateNode={
        (searchTerm.length > 0 || isLoading) ? (
          <div className="px-3 py-4 text-sm text-center text-gray-500">
            {isLoading ? 'Searching...' : 'No matches found'}
          </div>
        ) : null
      }
    />
  );
};

export default SleekSearchDropdown;
