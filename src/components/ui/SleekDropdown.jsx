import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Sleek Dropdown Component
 *
 * Props:
 *  - icon: Icon component to show in the trigger button
 *  - iconColor: Tailwind color class for the icon (default: "text-primary-500")
 *  - label: Fallback label text when no option is selected
 *  - headerTitle: Optional section header rendered inside the menu
 *  - options: Array of { value, label, icon?: Component, dotColor?: string }
 *  - value: Currently selected value
 *  - onChange: (value: string) => void
 *  - widthClass: Tailwind width class for the dropdown panel (default: "w-44")
 *  - maxHeightClass: Tailwind max-height class for the panel (default: "max-h-60")
 *  - renderTriggerLabel: Optional (currentOption, value) => ReactNode to customise trigger display
 *  - fullWidth: If true, the trigger button stretches to full width (useful for form fields)
 *  - placeholder: Placeholder text shown when no value is selected
 */
const SleekDropdown = ({
  icon: Icon,
  iconColor = 'text-primary',
  label,
  formLabel,
  error,
  headerTitle,
  headerNode,
  footerNode,
  options = [],
  value,
  onChange,
  widthClass = 'w-44',
  maxHeightClass = 'max-h-60',
  renderTriggerLabel,
  fullWidth = false,
  placeholder,
  customTrigger,
  emptyStateNode,
  triggerClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const currentOption = options.find((o) => o.value === value);

  return (
    <div className={`relative flex flex-col gap-1.5 group ${fullWidth ? 'w-full' : 'inline-block'}`} ref={dropdownRef}>
      {formLabel && (
        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 ml-1 group-focus-within:text-primary transition-colors">
          {formLabel}
        </label>
      )}
      <div className="relative">
      {customTrigger ? (
        customTrigger({ isOpen, setIsOpen })
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium font-sans text-gray-900 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all ${fullWidth ? 'w-full justify-between' : ''} ${triggerClassName}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />}
            {renderTriggerLabel ? (
              renderTriggerLabel(currentOption, value)
            ) : currentOption ? (
              <div className="flex items-center gap-2 min-w-0">
                {currentOption.dotColor && (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${currentOption.dotColor}`} />
                )}
                {currentOption.icon && <currentOption.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">{currentOption.label}</span>
              </div>
            ) : (
              <span className="text-gray-500 truncate">{placeholder || label || 'Select…'}</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 ${fullWidth ? 'w-full' : widthClass} bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 ${maxHeightClass} overflow-y-auto animate-in fade-in zoom-in-95 duration-150`}
        >
          {headerTitle && (
            <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-200/50 mb-1 sticky top-0 bg-white z-10">
              {headerTitle}
            </div>
          )}
          {headerNode && (
            <div className="border-b border-gray-200/50">
              {headerNode}
            </div>
          )}
          
          {options.length > 0 ? (
            options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {option.dotColor && (
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${option.dotColor}`} />
                    )}
                    {option.icon && <option.icon className="w-4 h-4 flex-shrink-0" />}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              );
            })
          ) : emptyStateNode ? (
            emptyStateNode
          ) : null}

          {footerNode && (
            <div className="border-t border-gray-200/50 mt-1">
              {footerNode}
            </div>
          )}
        </div>
      )}
      </div>
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </div>
  );
};

export default SleekDropdown;
