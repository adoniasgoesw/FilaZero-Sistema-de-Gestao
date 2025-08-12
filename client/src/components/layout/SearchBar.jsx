import React from "react";
import { Search, Settings } from "lucide-react";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
      {/* Barra de pesquisa */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar..."
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A99BA] focus:border-transparent"
        />
      </div>
      
      {/* Botão de configurações */}
      <button className="p-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73] transition-colors duration-200">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;
