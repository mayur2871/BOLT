import React from 'react';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  allowCustom?: boolean;
  onAddNew?: (value: string) => void;
  name?: string;
  error?: string;
  touched?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement | HTMLInputElement>) => void;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  className = '',
  allowCustom = false,
  onAddNew,
  name,
  error,
  touched,
  onBlur
}: SelectFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && allowCustom && onAddNew && value.trim()) {
      e.preventDefault();
      onAddNew(value.trim().toUpperCase());
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {allowCustom ? (
        <div className="relative">
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder?.toUpperCase()}
            required={required}
            list={`${label.toLowerCase().replace(/\s+/g, '-')}-options`}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error && touched 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
          />
          <datalist id={`${label.toLowerCase().replace(/\s+/g, '-')}-options`}>
            {options.map((option, index) => (
              <option key={index} value={option.toUpperCase()} />
            ))}
          </datalist>
        </div>
      ) : (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          required={required}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error && touched 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
          }`}
        >
          <option value="">{placeholder?.toUpperCase() || 'SELECT OPTION'}</option>
          {options.map((option, index) => (
            <option key={index} value={option.toUpperCase()}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
      )}
      
      {allowCustom && onAddNew && (
        <p className="text-xs text-gray-500 mt-1">
          TYPE TO ADD NEW OPTION OR SELECT FROM EXISTING
        </p>
      )}
      
      {error && touched && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}