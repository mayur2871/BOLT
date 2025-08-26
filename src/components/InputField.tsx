import React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  required?: boolean;
  className?: string;
  list?: string;
  readOnly?: boolean;
  name?: string;
  error?: string;
  touched?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className = '',
  list,
  readOnly = false,
  name,
  error,
  touched,
  onBlur
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Convert text inputs to uppercase (except for numbers and dates)
    if (type === 'text') {
      newValue = newValue.toUpperCase();
    }
    
    onChange(newValue);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        name={name}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder?.toUpperCase()}
        required={required}
        list={list}
        readOnly={readOnly}
        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error && touched 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300'
        }`}
      />
      {error && touched && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}