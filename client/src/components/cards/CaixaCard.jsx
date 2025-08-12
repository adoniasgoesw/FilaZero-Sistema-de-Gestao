import React from "react";
import { DollarSign } from "lucide-react";

const CaixaCard = () => {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-6 w-full hover:shadow-lg transition-shadow">
      {/* Ícone */}
      <div className="bg-green-500 text-white p-3 rounded-full">
        <DollarSign size={28} />
      </div>

      {/* Conteúdo */}
      <div>
        <h2 className="text-xl font-bold text-[#1A99BA]">
          Caixa
        </h2>
        <p className="text-gray-600">
          Gerencie movimentações financeiras, fechamentos de caixa e relatórios de vendas.
        </p>
      </div>
    </div>
  );
};

export default CaixaCard;
