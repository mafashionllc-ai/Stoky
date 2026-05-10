
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} className="text-indigo-400/50" />
      </div>
      <input
        type="text"
        placeholder="Buscar productos o líneas..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-11 pr-4 py-3 border-none rounded-xl bg-indigo-900/20 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all text-sm font-medium"
      />
    </div>
  );
};
