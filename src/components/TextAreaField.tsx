import React from 'react';

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  rows?: number;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  rows = 3
}: TextAreaFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder?.toUpperCase()}
        required={required}
        rows={rows}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
      />
    </div>
  );
}