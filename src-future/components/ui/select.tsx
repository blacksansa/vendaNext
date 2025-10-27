import React from 'react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value, onChange, children }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
      >
        {children}
      </select>
    </div>
  );
};

const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex items-center">{children}</div>;
};

const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">{children}</div>;
};

const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  return (
    <option value={value} className="cursor-pointer hover:bg-gray-100">
      {children}
    </option>
  );
};

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span className="text-gray-500">{placeholder}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };