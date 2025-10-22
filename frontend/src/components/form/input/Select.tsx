import React from 'react';

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

export default function Select({ name, value, onChange, options, required }: SelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 text-sm border rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-brand-500 focus:ring-brand-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="dark:bg-gray-800 dark:text-white">
          {option.label}
        </option>
      ))}
    </select>
  );
} 